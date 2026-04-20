import { network } from "hardhat";

const connection = await network.connect();
const { viem } = connection;

console.log(`Deploying EventManagement to ${connection.networkName}...`);

// Deploy correct contract
const eventManagement = await viem.deployContract("EventManagement");

console.log(`EventManagement deployed to: ${eventManagement.address}`);