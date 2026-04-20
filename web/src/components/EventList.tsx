import { useMemo, useState } from "react";
import { hardhat, sepolia } from "wagmi/chains";
import {
  useChainId,
  useConnection,
  useReadContract,
  useReadContracts,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";

import { getEventManagementAddress } from "../lib/contractAddress";
import { eventManagementAbi } from "../lib/eventManagementAbi";

function shorten(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

const dateFmt = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
  timeStyle: "short",
});

const categoryNames = ["Conference", "Workshop", "Meetup", "Social", "Other"];

function getCategoryName(category: number): string {
  return categoryNames[category] || "Other";
}

export function EventList() {
  const connection = useConnection();
  const chainId = useChainId();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "mine" | "registered">(
    "all",
  );
  const contractAddress = useMemo(
    () => getEventManagementAddress(chainId),
    [chainId],
  );

  const supported =
    connection.status === "connected" &&
    (chainId === hardhat.id || chainId === sepolia.id);

  const { data: nextEventId, isLoading: loadingCount } = useReadContract({
    address: contractAddress ?? undefined,
    abi: eventManagementAbi,
    functionName: "nextEventId",
    query: {
      enabled: Boolean(contractAddress && supported),
    },
  });

  const count = nextEventId !== undefined ? Number(nextEventId) : 0;

  const contracts = useMemo(() => {
    if (!contractAddress || count <= 0) return [];
    return Array.from({ length: count }, (_, i) => ({
      address: contractAddress,
      abi: eventManagementAbi,
      functionName: "events" as const,
      args: [BigInt(i)] as const,
    }));
  }, [contractAddress, count]);

  const { data: rows, isLoading: loadingRows } = useReadContracts({
    contracts,
    query: {
      enabled: contracts.length > 0,
    },
  });

  // For registration checks
  const registrationContracts = useMemo(() => {
    if (!contractAddress || count <= 0 || !connection.address) return [];
    return Array.from({ length: count }, (_, i) => ({
      address: contractAddress,
      abi: eventManagementAbi,
      functionName: "registeredParticipants" as const,
      args: [BigInt(i), connection.address] as const,
    }));
  }, [contractAddress, count, connection.address]);

  const { data: registrationData } = useReadContracts({
    contracts: registrationContracts,
    query: {
      enabled: registrationContracts.length > 0,
    },
  });

  const {
    writeContract: registerContract,
    data: registerHash,
    isPending: isRegistering,
  } = useWriteContract();

  const {
    writeContract: cancelContract,
    data: cancelHash,
    isPending: isCancelling,
  } = useWriteContract();

  const { isLoading: registerConfirming } = useWaitForTransactionReceipt({
    hash: registerHash,
  });

  const { isLoading: cancelConfirming } = useWaitForTransactionReceipt({
    hash: cancelHash,
  });

  const events = useMemo(() => {
    if (!rows) return [];

    return rows.flatMap((row, i) => {
      if (row.status !== "success" || !row.result) return [];
      const [
        id,
        title,
        description,
        dateUnix,
        organizer,
        isActive,
        category,
        maxParticipants,
        currentParticipants,
      ] = row.result as [
        bigint,
        string,
        string,
        bigint,
        `0x${string}`,
        boolean,
        number,
        bigint,
        bigint,
      ];
      const ts = Number(dateUnix);
      const isRegistered =
        registrationData?.[i]?.status === "success"
          ? registrationData[i].result
          : false;
      const isOrganizer =
        connection.address?.toLowerCase() === organizer.toLowerCase();

      return [
        {
          id,
          title,
          description,
          ts,
          organizer,
          isActive,
          category,
          maxParticipants,
          currentParticipants,
          isRegistered,
          isOrganizer,
        },
      ];
    });
  }, [rows, registrationData, connection.address]);

  const visibleEvents = useMemo(() => {
    const now = Date.now() / 1000;
    const q = search.trim().toLowerCase();

    return events
      .filter((e) => {
        if (filter === "active" && !e.isActive) return false;
        if (filter === "mine" && !e.isOrganizer) return false;
        if (filter === "registered" && !e.isRegistered) return false;
        if (!q) return true;
        return (
          e.title.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q) ||
          shorten(e.organizer).toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        // Keep active upcoming events first for easier browsing.
        const aScore = (a.isActive ? 2 : 0) + (a.ts > now ? 1 : 0);
        const bScore = (b.isActive ? 2 : 0) + (b.ts > now ? 1 : 0);
        if (aScore !== bScore) return bScore - aScore;
        return a.ts - b.ts;
      });
  }, [events, filter, search]);

  const handleRegister = (eventId: number) => {
    if (!contractAddress) return;
    registerContract({
      address: contractAddress,
      abi: eventManagementAbi,
      functionName: "registerForEvent",
      args: [BigInt(eventId)],
    });
  };

  const handleCancel = (eventId: number) => {
    if (!contractAddress) return;
    cancelContract({
      address: contractAddress,
      abi: eventManagementAbi,
      functionName: "cancelEvent",
      args: [BigInt(eventId)],
    });
  };

  if (!supported) {
    return null;
  }

  if (!contractAddress) {
    return (
      <section className="card card--muted">
        <h2>Scheduled events</h2>
        <p>Configure a contract address to load events.</p>
      </section>
    );
  }

  return (
    <section className="card">
      <h2>Scheduled events</h2>
      <p className="card__lead">
        Everyone can see the same list—it is shared openly on the network you
        selected.
      </p>
      <div className="event-list__toolbar">
        <input
          className="event-list__search"
          type="search"
          placeholder="Search by title or description"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="event-list__filter"
          value={filter}
          onChange={(e) =>
            setFilter(e.target.value as "all" | "active" | "mine" | "registered")
          }
        >
          <option value="all">All events</option>
          <option value="active">Active only</option>
          <option value="mine">My events</option>
          <option value="registered">Registered by me</option>
        </select>
      </div>

      {loadingCount || loadingRows ? (
        <p className="muted">Loading…</p>
      ) : count === 0 ? (
        <p className="muted">No events yet. Add the first one beside this list.</p>
      ) : visibleEvents.length === 0 ? (
        <p className="muted">
          No events match your current filter. Try clearing search or choosing
          another filter.
        </p>
      ) : (
        <ul className="event-list">
          {visibleEvents.map((event) => {
            const when =
              event.ts > 0 && !Number.isNaN(event.ts)
                ? dateFmt.format(new Date(event.ts * 1000))
                : "—";
            const canRegister =
              event.isActive &&
              !event.isRegistered &&
              event.ts > Date.now() / 1000 &&
              Number(event.currentParticipants) < Number(event.maxParticipants);
            const canCancel = event.isActive && event.isOrganizer;
            const isFull =
              Number(event.currentParticipants) >= Number(event.maxParticipants);

            return (
              <li key={`event-${event.id.toString()}-${event.title}`} className="event-list__item">
                <div className="event-list__title-row">
                  <div className="event-list__title">{event.title}</div>
                  <span className="event-list__id">Event #{event.id.toString()}</span>
                </div>
                <div className="event-list__description">{event.description}</div>
                <div className="event-list__meta">
                  <span>{when}</span>
                  <span className="event-list__by" title={event.organizer}>
                    Organized by {shorten(event.organizer)}
                  </span>
                  <span className="event-list__category">
                    {getCategoryName(event.category)}
                  </span>
                  <span
                    className={`event-list__status ${event.isActive ? "active" : "cancelled"}`}
                  >
                    {event.isActive ? "Active" : "Cancelled"}
                  </span>
                  <span className="event-list__participants">
                    {event.currentParticipants}/{event.maxParticipants} participants{" "}
                    {isFull && "(Full)"}
                  </span>
                </div>
                <div className="event-list__actions">
                  {canRegister && (
                    <button
                      className="btn btn--secondary"
                      onClick={() => handleRegister(Number(event.id))}
                      disabled={isRegistering || registerConfirming}
                    >
                      {isRegistering || registerConfirming
                        ? "Registering..."
                        : "RSVP"}
                    </button>
                  )}
                  {event.isRegistered && (
                    <span className="event-list__registered">Registered ✓</span>
                  )}
                  {!canRegister && !event.isRegistered && (
                    <span className="event-list__hint">
                      {!event.isActive
                        ? "Unavailable: cancelled"
                        : isFull
                          ? "Unavailable: full"
                          : event.ts <= Date.now() / 1000
                            ? "Unavailable: ended"
                            : "Unavailable"}
                    </span>
                  )}
                  {canCancel && (
                    <button
                      className="btn btn--danger"
                      onClick={() => handleCancel(Number(event.id))}
                      disabled={isCancelling || cancelConfirming}
                    >
                      {isCancelling || cancelConfirming
                        ? "Cancelling..."
                        : "Cancel Event"}
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
