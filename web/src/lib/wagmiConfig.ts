import { createConfig, http } from "wagmi";
import { hardhat, sepolia } from "wagmi/chains";
import { injected } from "wagmi/connectors";

const localRpc =
  import.meta.env.VITE_LOCAL_RPC_URL ?? "http://127.0.0.1:8545";
const sepoliaRpc =
  import.meta.env.VITE_SEPOLIA_RPC_URL ?? "https://rpc.sepolia.org";

/**
 * Generic `injected()` uses `window.ethereum` alone, which breaks when several
 * wallets compete (MetaMask + Coinbase + others). Use explicit targets first,
 * then a generic fallback — see WalletSection connect order.
 */
export const wagmiConfig = createConfig({
  chains: [hardhat, sepolia],
  connectors: [
    injected({
      target: "metaMask",
      unstable_shimAsyncInject: 2_000,
    }),
    injected({ target: "coinbaseWallet" }),
    injected({ shimDisconnect: true }),
  ],
  transports: {
    [hardhat.id]: http(localRpc),
    [sepolia.id]: http(sepoliaRpc),
  },
});

export const CHAIN_LABELS: Record<number, string> = {
  [hardhat.id]: "Local practice network",
  [sepolia.id]: "Sepolia (test network)",
};
