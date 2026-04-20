import { useQueryClient } from "@tanstack/react-query";
import { type FormEvent, useEffect, useMemo, useState } from "react";
import { hardhat, sepolia } from "wagmi/chains";
import {
  useChainId,
  useConnection,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";

import { getEventManagementAddress } from "../lib/contractAddress";
import { transactionErrorMessage } from "../lib/friendlyErrors";
import { eventManagementAbi } from "../lib/eventManagementAbi";
import { TransactionProgress } from "./TransactionProgress";

export function CreateEventForm() {
  const connection = useConnection();
  const chainId = useChainId();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dateLocal, setDateLocal] = useState("");
  const [category, setCategory] = useState("0");
  const [maxParticipants, setMaxParticipants] = useState("");

  const contractAddress = useMemo(
    () => getEventManagementAddress(chainId),
    [chainId],
  );

  const {
    writeContract,
    data: hash,
    isPending: isSubmitting,
    error: writeError,
    reset: resetWrite,
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess,
    isError: receiptFailed,
    error: receiptErr,
  } = useWaitForTransactionReceipt({
    hash,
  });

  useEffect(() => {
    if (isSuccess) {
      void queryClient.invalidateQueries();
    }
  }, [isSuccess, queryClient]);

  const supported =
    connection.status === "connected" &&
    (chainId === hardhat.id || chainId === sepolia.id);

  const phase = useMemo(() => {
    if (writeError || (receiptFailed && hash)) return "error" as const;
    if (isSuccess) return "done" as const;
    if (hash && isConfirming) return "confirming" as const;
    if (isSubmitting) return "wallet" as const;
    return "idle" as const;
  }, [
    writeError,
    receiptFailed,
    hash,
    isSuccess,
    isConfirming,
    isSubmitting,
  ]);

  const errMsg = writeError
    ? transactionErrorMessage(writeError)
    : receiptErr
      ? transactionErrorMessage(receiptErr)
      : null;

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!contractAddress || !connection.address) return;

    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();
    const maxPart = parseInt(maxParticipants);
    if (!trimmedTitle || !trimmedDescription || !maxPart || maxPart <= 0) return;

    const ms = new Date(dateLocal).getTime();
    if (Number.isNaN(ms) || ms <= 0) return;

    const unix = BigInt(Math.floor(ms / 1000));
    if (unix <= 0n) return;

    resetWrite();
    writeContract({
      address: contractAddress,
      abi: eventManagementAbi,
      functionName: "createEvent",
      args: [trimmedTitle, trimmedDescription, unix, parseInt(category), BigInt(maxPart)],
    });
  };

  const dismiss = () => {
    resetWrite();
    void queryClient.invalidateQueries();
    setTitle("");
    setDescription("");
    setDateLocal("");
    setCategory("0");
    setMaxParticipants("");
  };

  if (!supported) {
    return (
      <section className="card card--muted">
        <h2>Add an event</h2>
        <p>Connect your wallet and choose a supported network to create events.</p>
      </section>
    );
  }

  if (!contractAddress) {
    return (
      <section className="card card--warn">
        <h2>Add an event</h2>
        <p>
          No contract address is configured for this network. Deploy the
          contract, then set{" "}
          <code className="inline-code">VITE_EVENT_MANAGEMENT_ADDRESS</code> or{" "}
          <code className="inline-code">
            VITE_EVENT_MANAGEMENT_ADDRESS_SEPOLIA
          </code>{" "}
          in <code className="inline-code">web/.env</code> and restart the dev
          server.
        </p>
      </section>
    );
  }

  return (
    <section className="card">
      <h2>Add an event</h2>
      <p className="card__lead">
        Give your event a name and time. You will be asked once in your wallet
        to confirm—nothing is published until you approve.
      </p>

      <TransactionProgress
        phase={phase}
        hash={hash}
        errorMessage={errMsg}
        onDismiss={phase === "done" || phase === "error" ? dismiss : undefined}
      />

      <form className="form" onSubmit={onSubmit}>
        <label className="form__field">
          <span>Event title</span>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Spring orientation"
            maxLength={120}
            autoComplete="off"
            disabled={phase === "wallet" || phase === "confirming"}
          />
        </label>

        <label className="form__field">
          <span>Description</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the event..."
            maxLength={500}
            rows={3}
            disabled={phase === "wallet" || phase === "confirming"}
          />
        </label>

        <label className="form__field">
          <span>Date and time</span>
          <input
            type="datetime-local"
            value={dateLocal}
            onChange={(e) => setDateLocal(e.target.value)}
            disabled={phase === "wallet" || phase === "confirming"}
          />
        </label>

        <label className="form__field">
          <span>Category</span>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            disabled={phase === "wallet" || phase === "confirming"}
          >
            <option value="0">Conference</option>
            <option value="1">Workshop</option>
            <option value="2">Meetup</option>
            <option value="3">Social</option>
            <option value="4">Other</option>
          </select>
        </label>

        <label className="form__field">
          <span>Maximum Participants</span>
          <input
            type="number"
            value={maxParticipants}
            onChange={(e) => setMaxParticipants(e.target.value)}
            placeholder="e.g. 50"
            min="1"
            max="1000"
            disabled={phase === "wallet" || phase === "confirming"}
          />
        </label>

        <button
          type="submit"
          className="btn btn--primary"
          disabled={
            !title.trim() ||
            !description.trim() ||
            !dateLocal ||
            !maxParticipants ||
            parseInt(maxParticipants) <= 0 ||
            phase === "wallet" ||
            phase === "confirming"
          }
        >
          Publish event
        </button>
      </form>
    </section>
  );
}
