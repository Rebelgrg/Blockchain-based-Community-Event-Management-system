import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("EventManagementModule", (m) => {
  const eventManagement = m.contract("EventManagement");

  return { eventManagement };
});
