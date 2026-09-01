import type {
  ReviewedTransaction,
  TransactionToReview,
} from "@bridger/contracts";

export type TransactionDraft = ReviewedTransaction & {
  dirty: boolean;
  needs_client_review: boolean;
};

export type ReviewFormValues = {
  transactions: Record<string, TransactionDraft>;
};

export function toDraft(transaction: TransactionToReview): TransactionDraft {
  const status: ReviewedTransaction["status"] = transaction.needs_client_review
    ? "needs_client_review"
    : "unreviewed";

  return {
    account_id: transaction.account_id,
    account_name: transaction.account_name,
    business_id: transaction.business_id,
    transaction_id: transaction.transaction_id,
    category_split: transaction.category_split,
    total_amount: transaction.total_amount,
    date: transaction.date,
    vendor_id: transaction.vendor_id,
    vendor_name: transaction.vendor_name,
    paired_transaction_id: transaction.paired_transaction_id,
    description: transaction.description,
    status,
    dirty: false,
    needs_client_review: transaction.needs_client_review,
  };
}

export function draftsFromTransactions(
  transactions: TransactionToReview[],
): ReviewFormValues {
  const map: Record<string, TransactionDraft> = {};
  for (const transaction of transactions) {
    map[transaction.transaction_id] = toDraft(transaction);
  }
  return { transactions: map };
}

export function toSubmitPayload(
  businessId: string,
  drafts: Record<string, TransactionDraft>,
): { business_id: string; transactions: ReviewedTransaction[] } {
  return {
    business_id: businessId,
    transactions: Object.values(drafts).map(
      ({ dirty: _dirty, needs_client_review: _ncr, ...reviewed }) => reviewed,
    ),
  };
}

export function formatMoney(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
