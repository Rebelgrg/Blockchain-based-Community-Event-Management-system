import { useBlockNumber, useChainId } from "wagmi";

import { CHAIN_LABELS } from "../lib/wagmiConfig";

/**
 * Lightweight “heartbeat” so users see the app is live and following the chain.
 */
export function LiveNetworkStatus() {
  const chainId = useChainId();
  const { data: blockNumber, isLoading } = useBlockNumber({ watch: true });

  const label = CHAIN_LABELS[chainId] ?? "Connected network";

  return (
    <div className="live-status" aria-live="polite">
      <span className="live-status__dot" aria-hidden />
      <span>
        {label}
        {isLoading || blockNumber === undefined
          ? " · syncing…"
          : ` · latest update through block ${blockNumber.toString()}`}
      </span>
    </div>
  );
}
