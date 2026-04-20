import { network } from "hardhat";

import { LOCAL_EVENT_MANAGEMENT_ADDRESS } from "./constants.js";

const connection = await network.connect();
const { viem } = connection;

console.log(`Deploying EventManagement to ${connection.networkName}...`);

const deployerIndex = Number.parseInt(
  process.env.DEPLOYER_INDEX ?? "0",
  10,
);
const walletClients = await viem.getWalletClients();
const deployer = walletClients[Number.isFinite(deployerIndex) ? deployerIndex : 0];
if (!deployer) {
  throw new Error(
    `DEPLOYER_INDEX=${process.env.DEPLOYER_INDEX ?? "0"} is invalid. Available wallet clients: ${walletClients.length}`,
  );
}

const eventManagement = await viem.deployContract("EventManagement", [], {
  client: { wallet: deployer },
});

console.log(`EventManagement deployed to: ${eventManagement.address}`);
if (eventManagement.address === LOCAL_EVENT_MANAGEMENT_ADDRESS) {
  console.log(
    "(Matches scripts/constants.ts LOCAL_EVENT_MANAGEMENT_ADDRESS — typical for first localhost deploy.)",
  );
}
console.log(
  `Deployer: ${deployer.account.address} (DEPLOYER_INDEX=${deployerIndex})`,
);
