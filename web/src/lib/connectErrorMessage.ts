import { UserRejectedRequestError } from "viem";

/**
 * Maps wagmi / wallet errors to short, non-technical copy.
 * Optionally includes a technical hint for support / screenshots.
 */
export function describeConnectError(err: Error): { title: string; hint?: string } {
  const name = err.name;
  const msg = err.message.toLowerCase();

  if (
    err instanceof UserRejectedRequestError ||
    name === "UserRejectedRequestError" ||
    msg.includes("user rejected") ||
    msg.includes("denied transaction")
  ) {
    return { title: "Connection was cancelled in the wallet." };
  }

  if (name === "ProviderNotFoundError" || msg.includes("provider")) {
    return {
      title:
        "No wallet was found for this option. Install MetaMask or another Ethereum wallet, or try a different browser profile.",
      hint: err.message,
    };
  }

  if (msg.includes("already pending") || msg.includes("already processing")) {
    return {
      title:
        "Your wallet already has a request open. Close it in the extension, then try again.",
    };
  }

  return {
    title:
      "Could not connect. Make sure a wallet extension is installed, unlocked, and allowed for this site.",
    hint: `${name}: ${err.message}`,
  };
}
