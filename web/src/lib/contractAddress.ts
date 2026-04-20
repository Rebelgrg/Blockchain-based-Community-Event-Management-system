import type { Address } from "viem";

/** Default first deploy on a fresh Hardhat local node — same as `scripts/constants.ts`. */
const LOCAL_DEFAULT: Address =
  "0x5fbdb2315678afecb367f032d93f642f64180aa3";

/**
 * Resolves the EventManagement contract for the active chain.
 * Set `VITE_EVENT_MANAGEMENT_ADDRESS_LOCAL` in `.env` for localhost (31337),
 * and `VITE_EVENT_MANAGEMENT_ADDRESS_SEPOLIA` for Sepolia (11155111).
 */
export function getEventManagementAddress(chainId: number): Address | null {
  const localAddr = import.meta.env.VITE_EVENT_MANAGEMENT_ADDRESS_LOCAL as
    | Address
    | undefined;
  if (chainId === 31_337) return localAddr ?? LOCAL_DEFAULT;

  const sepoliaAddr = import.meta.env
    .VITE_EVENT_MANAGEMENT_ADDRESS_SEPOLIA as Address | undefined;
  if (chainId === 11_155_111) return sepoliaAddr ?? null;

  return null;
}
