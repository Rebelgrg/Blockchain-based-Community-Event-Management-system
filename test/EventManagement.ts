import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getAddress } from "viem";

import { network } from "hardhat";

describe("EventManagement", async function () {
  const { viem } = await network.connect();
  const [walletClient] = await viem.getWalletClients();
  const creator = getAddress(walletClient.account.address);

  it("emits EventCreated and stores the event", async function () {
    const eventManagement = await viem.deployContract("EventManagement");
    const title = "Conference";
    const description = "A great conference";
    const date = BigInt(Math.floor(Date.now() / 1000) + 86400); // Future date

    await viem.assertions.emitWithArgs(
      eventManagement.write.createEvent([title, description, date, 0, 100n]),
      eventManagement,
      "EventCreated",
      [0n, title, description, date, creator],
    );

    assert.equal(await eventManagement.read.nextEventId(), 1n);
    const stored = await eventManagement.read.events([0n]);
    assert.deepEqual(stored, [0n, title, description, date, creator, true, 0, 100n, 0n]);
  });

  it("increments ids across multiple events", async function () {
    const eventManagement = await viem.deployContract("EventManagement");
    const futureDate = BigInt(Math.floor(Date.now() / 1000) + 86400);

    await eventManagement.write.createEvent(["First", "Desc1", futureDate, 0, 50n]);
    await eventManagement.write.createEvent(["Second", "Desc2", futureDate + 100n, 1, 25n]);

    assert.equal(await eventManagement.read.nextEventId(), 2n);
    const first = await eventManagement.read.events([0n]);
    const second = await eventManagement.read.events([1n]);
    assert.equal(first[1], "First");
    assert.equal(second[1], "Second");
  });

  it("reverts when title is empty", async function () {
    const eventManagement = await viem.deployContract("EventManagement");
    const futureDate = BigInt(Math.floor(Date.now() / 1000) + 86400);

    await viem.assertions.revertWith(
      eventManagement.write.createEvent(["", "Desc", futureDate, 0, 10n]),
      "Event title is required",
    );
  });

  it("reverts when description is empty", async function () {
    const eventManagement = await viem.deployContract("EventManagement");
    const futureDate = BigInt(Math.floor(Date.now() / 1000) + 86400);

    await viem.assertions.revertWith(
      eventManagement.write.createEvent(["Title", "", futureDate, 0, 10n]),
      "Event description is required",
    );
  });

  it("reverts when date is in the past", async function () {
    const eventManagement = await viem.deployContract("EventManagement");
    const pastDate = 1000n;

    await viem.assertions.revertWith(
      eventManagement.write.createEvent(["Title", "Desc", pastDate, 0, 10n]),
      "Event date must be in the future",
    );
  });

  it("allows registration for active future events", async function () {
    const eventManagement = await viem.deployContract("EventManagement");
    const futureDate = BigInt(Math.floor(Date.now() / 1000) + 86400);

    await eventManagement.write.createEvent(["Event", "Desc", futureDate, 0, 10n]);

    await viem.assertions.emitWithArgs(
      eventManagement.write.registerForEvent([0n]),
      eventManagement,
      "EventRegistered",
      [0n, creator],
    );

    assert.equal(await eventManagement.read.registeredParticipants([0n, creator]), true);
  });

  it("reverts registration for cancelled events", async function () {
    const eventManagement = await viem.deployContract("EventManagement");
    const futureDate = BigInt(Math.floor(Date.now() / 1000) + 86400);

    await eventManagement.write.createEvent(["Event", "Desc", futureDate, 0, 10n]);
    await eventManagement.write.cancelEvent([0n]);

    await viem.assertions.revertWith(
      eventManagement.write.registerForEvent([0n]),
      "Event is not active",
    );
  });

  it("reverts double registration", async function () {
    const eventManagement = await viem.deployContract("EventManagement");
    const futureDate = BigInt(Math.floor(Date.now() / 1000) + 86400);

    await eventManagement.write.createEvent(["Event", "Desc", futureDate, 0, 10n]);
    await eventManagement.write.registerForEvent([0n]);

    await viem.assertions.revertWith(
      eventManagement.write.registerForEvent([0n]),
      "Already registered",
    );
  });

  it("allows organizer to cancel event", async function () {
    const eventManagement = await viem.deployContract("EventManagement");
    const futureDate = BigInt(Math.floor(Date.now() / 1000) + 86400);

    await eventManagement.write.createEvent(["Event", "Desc", futureDate, 0, 10n]);

    await viem.assertions.emitWithArgs(
      eventManagement.write.cancelEvent([0n]),
      eventManagement,
      "EventCancelled",
      [0n, creator],
    );

    const stored = await eventManagement.read.events([0n]);
    assert.equal(stored[5], false); // isActive should be false
  });

  it("reverts cancellation by non-organizer", async function () {
    const eventManagement = await viem.deployContract("EventManagement");
    const futureDate = BigInt(Math.floor(Date.now() / 1000) + 86400);

    await eventManagement.write.createEvent(["Event", "Desc", futureDate, 0, 10n]);

    // Get the second account
    const walletClients = await viem.getWalletClients();
    const account2 = walletClients[1].account;

    // Try to cancel with account2
    await viem.assertions.revertWith(
      eventManagement.write.cancelEvent([0n], { account: account2 }),
      "Only organizer can cancel",
    );
  });
});
