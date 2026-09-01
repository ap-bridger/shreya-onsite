"use client";

import type { TransactionDraft } from "@/lib/review-draft";
import { formatDate, formatMoney } from "@/lib/review-draft";

type TransactionRowProps = {
  draft: TransactionDraft;
  onToggleApproved: (approved: boolean) => void;
  onDetails: () => void;
  onChangeInfo: () => void;
};

export function TransactionRow({
  draft,
  onToggleApproved,
  onDetails,
  onChangeInfo,
}: TransactionRowProps) {
  const approved = draft.status === "approved";
  const rowClass = approved
    ? "border-accent-baseline bg-approved"
    : draft.dirty
      ? "border-accent bg-dirty"
      : "border-border bg-surface";

  return (
    <div
      className={`flex flex-wrap items-center gap-2 rounded-md border px-3 py-2 text-sm ${rowClass}`}
    >
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={approved}
          onChange={(event) => onToggleApproved(event.target.checked)}
          aria-label={`Approve ${draft.transaction_id}`}
          className="accent-accent"
        />
      </label>
      <div className="min-w-0 flex-1">
        <div className="font-medium text-neutral">
          {draft.transaction_id}
          <span className="font-normal text-neutral-subdued">
            {" "}
            · {draft.vendor_name || "No vendor"} ·{" "}
            {formatMoney(draft.total_amount)} · {formatDate(draft.date)}
          </span>
        </div>
        <div className="truncate text-xs text-accent-subdued">
          {draft.description}
          {draft.paired_transaction_id
            ? ` · pair ${draft.paired_transaction_id}`
            : ""}
          {draft.dirty ? " · draft" : ""}
        </div>
      </div>
      <button type="button" className="btn-secondary !px-2 !py-1 text-xs" onClick={onDetails}>
        Details
      </button>
      <button
        type="button"
        className="rounded border border-accent-baseline bg-accent-baseline/15 px-2 py-1 text-xs text-accent"
        onClick={onChangeInfo}
      >
        Change info
      </button>
    </div>
  );
}
