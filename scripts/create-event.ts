import { network } from "hardhat";
import type { Address } from "viem";

import { LOCAL_EVENT_MANAGEMENT_ADDRESS } from "./constants.js";

const CONTRACT_ADDRESS = (process.env.EVENT_MANAGEMENT_ADDRESS ??
  LOCAL_EVENT_MANAGEMENT_ADDRESS) as Address;

const EVENT_TITLE = process.env.EVENT_TITLE ?? "Launch Party";
const EVENT_DESCRIPTION = process.env.EVENT_DESCRIPTION ?? "An exciting launch event";
const EVENT_DATE = BigInt(process.env.EVENT_DATE ?? "1772447400");
const EVENT_CATEGORY = Number(process.env.EVENT_CATEGORY ?? "0");
const EVENT_MAX_PARTICIPANTS = BigInt(
  process.env.EVENT_MAX_PARTICIPANTS ?? "100",
);

const { viem } = await network.connect();
const publicClient = await viem.getPublicClient();

const eventManagement = await viem.getContractAt(
  "EventManagement",
  CONTRACT_ADDRESS,
);

console.log(`Creating event on contract ${CONTRACT_ADDRESS}...`);

const txHash = await eventManagement.write.createEvent([
  EVENT_TITLE,
  EVENT_DESCRIPTION,
  EVENT_DATE,
  EVENT_CATEGORY,
  EVENT_MAX_PARTICIPANTS,
]);
const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
const nextEventId = await eventManagement.read.nextEventId();
const createdEventId = nextEventId - 1n;
const createdEvent = await eventManagement.read.events([createdEventId]);

console.log(`Transaction hash: ${txHash}`);
console.log(`Block number: ${receipt.blockNumber}`);
console.log(`Created event id: ${createdEventId}`);
console.log("Stored event:", createdEvent);
