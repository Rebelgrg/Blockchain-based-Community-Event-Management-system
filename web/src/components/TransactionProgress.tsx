import type { Hash } from "viem";

type Phase = "idle" | "wallet" | "confirming" | "done" | "error";

type Props = {
  phase: Phase;
  hash?: Hash;
  errorMessage?: string | null;
  onDismiss?: () => void;
};

export function TransactionProgress({
  phase,
  hash,
  errorMessage,
  onDismiss,
}: Props) {
  if (phase === "idle") return null;

  return (
    <div
      className={`tx-progress tx-progress--${phase}`}
      role="status"
      aria-live="assertive"
    >
      {phase === "wallet" && (
        <>
          <div className="tx-progress__spinner" aria-hidden />
          <div>
            <strong>Check your wallet</strong>
            <p>
              Approve the request there to continue. This site cannot move funds
              without your confirmation.
            </p>
          </div>
        </>
      )}

      {phase === "confirming" && (
        <>
          <div className="tx-progress__spinner" aria-hidden />
          <div>
            <strong>Saving your event…</strong>
            <p>
              The network is processing your request. This is usually quick, but
              it can take up to a minute when the network is busy.
            </p>
            {hash && (
              <details className="tx-progress__details">
                <summary>Technical details (optional)</summary>
                <p className="tx-progress__mono">Reference: {hash}</p>
              </details>
            )}
          </div>
        </>
      )}

      {phase === "done" && (
        <div className="tx-progress__success">
          <strong>Done</strong>
          <p>Your event is saved and appears in the list below.</p>
          {onDismiss && (
            <button type="button" className="btn btn--ghost" onClick={onDismiss}>
              Dismiss
            </button>
          )}
        </div>
      )}

      {phase === "error" && errorMessage && (
        <div className="tx-progress__error">
          <strong>Could not complete</strong>
          <p>{errorMessage}</p>
          {onDismiss && (
            <button type="button" className="btn btn--ghost" onClick={onDismiss}>
              Try again
            </button>
          )}
        </div>
      )}
    </div>
  );
}
