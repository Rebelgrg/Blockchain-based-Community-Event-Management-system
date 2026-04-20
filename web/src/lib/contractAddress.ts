import type { Address } from "viem";

/** Default first deploy on a fresh Hardhat local node — same as `scripts/constants.ts`. */
const LOCAL_DEFAULT: Address =
  "0x5fbdb2315678afecb367f032d93f642f64180aa3";

/**
 * Resolves the EventManagement contract for the active chain.
 * Set `VITE_EVENT_MANAGEMENT_ADDRESS` in `web/.env` to override all chains,
 * or `VITE_EVENT_MANAGEMENT_ADDRESS_SEPOLIA` for Sepolia only.
 */
export function getEventManagementAddress(chainId: number): Address | null {
  const globalAddr = import.meta.env.VITE_EVENT_MANAGEMENT_ADDRESS as
    | Address
    | undefined;
  if (globalAddr) return globalAddr;

  if (chainId === 31_337) return LOCAL_DEFAULT;

  const sepoliaAddr = import.meta.env
    .VITE_EVENT_MANAGEMENT_ADDRESS_SEPOLIA as Address | undefined;
  if (chainId === 11_155_111 && sepoliaAddr) return sepoliaAddr;

  return null;
}
