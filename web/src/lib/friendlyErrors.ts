export function transactionErrorMessage(err: Error): string {
  const msg = err.message.toLowerCase();

  if (
    msg.includes("user rejected") ||
    msg.includes("denied transaction") ||
    msg.includes("rejected the request")
  ) {
    return "You closed the request in your wallet. Nothing was changed.";
  }

  if (msg.includes("insufficient funds")) {
    return "This wallet does not have enough test coins to pay the small network fee. Add funds and try again.";
  }

  if (msg.includes("wrong network") || msg.includes("chain mismatch")) {
    return "Your wallet is on a different network than this page. Use the network switcher above.";
  }

  return "Something went wrong while saving. Check your connection and try again. If it keeps happening, try a different network.";
}
