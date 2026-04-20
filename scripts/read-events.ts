import { createPublicClient, http } from "viem";
import { localhost } from "viem/chains";

import { LOCAL_EVENT_MANAGEMENT_ADDRESS } from "./constants.js";

const abi = [
  {
    name: "events",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "", type: "uint256" }],
    outputs: [
      { name: "id", type: "uint256" },
      { name: "title", type: "string" },
      { name: "description", type: "string" },
      { name: "date", type: "uint256" },
      { name: "organizer", type: "address" },
      { name: "isActive", type: "bool" },
      { name: "category", type: "uint8" },
      { name: "maxParticipants", type: "uint256" },
      { name: "currentParticipants", type: "uint256" },
    ],
  },
  {
    name: "nextEventId",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
] as const;

async function main() {
  const publicClient = createPublicClient({
    chain: localhost,
    transport: http(),
  });

  const contractAddress = LOCAL_EVENT_MANAGEMENT_ADDRESS;

  const count = await publicClient.readContract({
    address: contractAddress,
    abi,
    functionName: "nextEventId",
  });

  console.log("Total events:", count);

  for (let i = 0; i < Number(count); i++) {
    const event = await publicClient.readContract({
      address: contractAddress,
      abi,
      functionName: "events",
      args: [i],
    });

    console.log(`Event ${i}:`, event);
  }
}

main().catch(console.error);
