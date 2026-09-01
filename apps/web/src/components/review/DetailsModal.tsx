"use client";

import type { TransactionDraft } from "@/lib/review-draft";
import { formatDate, formatMoney } from "@/lib/review-draft";

type DetailsModalProps = {
  draft: TransactionDraft;
  onClose: () => void;
  onChangeInfo: () => void;
};

export function DetailsModal({
  draft,
  onClose,
  onChangeInfo,
}: DetailsModalProps) {
  const split = draft.category_split ?? [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay p-4">
      <div
        role="dialog"
        aria-labelledby="details-title"
        className="panel max-h-[90vh] w-full max-w-lg overflow-auto p-5"
      >
        <h2 id="details-title" className="text-lg font-semibold text-neutral">
          Transaction details — {draft.transaction_id}
        </h2>
        <dl className="mt-4 grid grid-cols-[140px_1fr] gap-x-3 gap-y-2 text-sm text-neutral">
          <dt className="text-neutral-subdued">Account</dt>
          <dd>
            {draft.account_name} ({draft.account_id})
          </dd>
          <dt className="text-neutral-subdued">Date</dt>
          <dd>{formatDate(draft.date)}</dd>
          <dt className="text-neutral-subdued">Amount</dt>
          <dd>{formatMoney(draft.total_amount)}</dd>
          <dt className="text-neutral-subdued">Vendor</dt>
          <dd>{draft.vendor_name || "—"}</dd>
          <dt className="text-neutral-subdued">Description</dt>
          <dd>{draft.description}</dd>
          <dt className="text-neutral-subdued">Category split</dt>
          <dd>
            {split.length === 0
              ? "—"
              : split
                  .map(
                    (leaf) =>
                      `${leaf.category} · ${formatMoney(leaf.amount)}`,
                  )
                  .join("; ")}
          </dd>
          <dt className="text-neutral-subdued">Paired</dt>
          <dd>{draft.paired_transaction_id ?? "—"}</dd>
          <dt className="text-neutral-subdued">Needs client review</dt>
          <dd>{String(draft.needs_client_review)}</dd>
          <dt className="text-neutral-subdued">Status</dt>
          <dd>{draft.status}</dd>
        </dl>
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Close
          </button>
          <button type="button" className="btn-primary" onClick={onChangeInfo}>
            Change info
          </button>
        </div>
      </div>
    </div>
  );
}
