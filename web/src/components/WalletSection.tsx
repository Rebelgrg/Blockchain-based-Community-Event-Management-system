import { useCallback, useEffect, useState } from "react";
import { UserRejectedRequestError } from "viem";
import { hardhat, sepolia } from "wagmi/chains";
import {
  useChainId,
  useConnect,
  useConnection,
  useDisconnect,
  useSwitchChain,
} from "wagmi";

import { describeConnectError } from "../lib/connectErrorMessage";
import { CHAIN_LABELS } from "../lib/wagmiConfig";

/** Try in order so the right provider is used when multiple wallets are installed. */
const CONNECTOR_PRIORITY = ["metaMask", "coinbaseWallet", "injected"] as const;

function isUserRejection(err: unknown): boolean {
  if (err instanceof UserRejectedRequestError) return true;
  if (typeof err === "object" && err !== null && "name" in err) {
    return (err as { name: string }).name === "UserRejectedRequestError";
  }
  return false;
}

function shortAddress(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export function WalletSection() {
  const connection = useConnection();
  const chainId = useChainId();
  const {
    connectAsync,
    connectors,
    isPending: isConnectBusy,
    error: connectError,
    reset: resetConnect,
  } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain, isPending: isSwitchBusy } = useSwitchChain();
  const [showWalletHelp, setShowWalletHelp] = useState(false);
  /** Set when all connectors fail (mutation error may not reflect the last try). */
  const [connectFallbackError, setConnectFallbackError] =
    useState<Error | null>(null);

  const isSupported =
    connection.status === "connected" &&
    (chainId === hardhat.id || chainId === sepolia.id);

  const displayedConnectError = connectError ?? connectFallbackError;
  const connectErrorCopy = displayedConnectError
    ? describeConnectError(displayedConnectError)
    : null;

  useEffect(() => {
    if (connection.status === "connected") setConnectFallbackError(null);
  }, [connection.status]);

  const onConnect = useCallback(async () => {
    setConnectFallbackError(null);
    resetConnect();
    let lastError: Error | undefined;

    for (const id of CONNECTOR_PRIORITY) {
      const connector = connectors.find((c) => c.id === id);
      if (!connector) continue;

      try {
        await connectAsync({ connector });
        return;
      } catch (err) {
        if (isUserRejection(err)) {
          return;
        }
        lastError = err instanceof Error ? err : new Error(String(err));
      }
    }

    if (lastError) setConnectFallbackError(lastError);
  }, [connectAsync, connectors, resetConnect]);

  return (
    <div className="wallet-section">
      <div className="wallet-section__row">
        {connection.status === "disconnected" ||
        connection.status === "connecting" ? (
          <div className="wallet-section__connect">
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => void onConnect()}
              disabled={isConnectBusy || !connectors.length}
              aria-busy={isConnectBusy}
            >
              {isConnectBusy ? "Opening wallet…" : "Connect your wallet"}
            </button>
            <button
              type="button"
              className="btn btn--ghost"
              onClick={() => setShowWalletHelp((v) => !v)}
              aria-expanded={showWalletHelp}
            >
              What does this mean?
            </button>
          </div>
        ) : (
          <div className="wallet-section__connected">
            <div className="wallet-section__identity">
              <span className="wallet-section__label">Connected as</span>
              <span className="wallet-section__address" title={connection.address}>
                {connection.address
                  ? shortAddress(connection.address)
                  : "—"}
              </span>
            </div>
            <button
              type="button"
              className="btn btn--secondary"
              onClick={() => disconnect()}
            >
              Disconnect
            </button>
          </div>
        )}
      </div>

      {showWalletHelp && (
        <p className="wallet-section__help">
          We never see your wallet password. Your browser extension (for example
          MetaMask) keeps your keys. You will only be asked to approve actions
          you start yourself—similar to confirming a card payment online.
        </p>
      )}

      {displayedConnectError && connectErrorCopy && (
        <div className="banner banner--error" role="alert">
          <p>{connectErrorCopy.title}</p>
          {connectErrorCopy.hint && (
            <details className="wallet-section__error-details">
              <summary>Details (for troubleshooting)</summary>
              <p className="wallet-section__error-mono">
                {connectErrorCopy.hint}
              </p>
            </details>
          )}
          <p className="wallet-section__error-tip">
            Tip: use the same browser where your wallet is installed (e.g. Chrome
            + MetaMask). If you use multiple wallets, we try MetaMask first, then
            Coinbase, then your default browser wallet.
          </p>
        </div>
      )}

      {connection.status === "connected" && !isSupported && (
        <div className="banner banner--warn">
          <p>
            This app runs on the <strong>Local practice network</strong> or{" "}
            <strong>Sepolia test network</strong>. Your wallet is on a different
            network.
          </p>
          <div className="wallet-section__switch-row">
            <button
              type="button"
              className="btn btn--primary"
              disabled={isSwitchBusy}
              onClick={() => switchChain({ chainId: hardhat.id })}
            >
              Switch to local practice
            </button>
            <button
              type="button"
              className="btn btn--secondary"
              disabled={isSwitchBusy}
              onClick={() => switchChain({ chainId: sepolia.id })}
            >
              Switch to Sepolia
            </button>
          </div>
        </div>
      )}

      {connection.status === "connected" && isSupported && (
        <p className="wallet-section__network-name">
          Network: {CHAIN_LABELS[chainId]}
        </p>
      )}
    </div>
  );
}
