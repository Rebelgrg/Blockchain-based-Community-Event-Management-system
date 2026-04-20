import { network } from "hardhat";
import type { Address } from "viem";

import { LOCAL_EVENT_MANAGEMENT_ADDRESS } from "./constants.js";

/** Matches `EventManagement.createEvent` (category is enum → uint8 in ABI). */
const abi = [
  {
    name: "createEvent",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "title", type: "string" },
      { name: "description", type: "string" },
      { name: "date", type: "uint256" },
      { name: "category", type: "uint8" },
      { name: "maxParticipants", type: "uint256" },
    ],
    outputs: [],
  },
] as const;

async function main() {
  const contractAddress = (process.env.EVENT_MANAGEMENT_ADDRESS ??
    LOCAL_EVENT_MANAGEMENT_ADDRESS) as Address;

  const { viem } = await network.connect();
  const walletClient = await viem.getWalletClients();
  const publicClient = await viem.getPublicClient();

  const account = walletClient[0];
  console.log("Using account:", account.account.address);
  console.log("Contract:", contractAddress);

  const futureDate = BigInt(Math.floor(Date.now() / 1000) + 86_400);
  const category = Number(process.env.EVENT_CATEGORY ?? "0");
  const maxParticipants = BigInt(process.env.EVENT_MAX_PARTICIPANTS ?? "100");

  const hash = await account.writeContract({
    address: contractAddress,
    abi,
    functionName: "createEvent",
    args: [
      "Tech Conference",
      "A conference about technology",
      futureDate,
      category,
      maxParticipants,
    ],
  });

  console.log("Transaction sent:", hash);

  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  console.log("Transaction confirmed in block:", receipt.blockNumber);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
