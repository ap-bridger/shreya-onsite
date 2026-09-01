import type { CategorySplit, TransactionToReview } from "@bridger/contracts";

export type MetaCategory = "single" | "multicategory" | "pair";

export const UNCATEGORIZED = "Uncategorized";

export function inferMetaCategory(
  transaction: Pick<
    TransactionToReview,
    "paired_transaction_id" | "category_split"
  >,
): MetaCategory {
  if (transaction.paired_transaction_id) {
    return "pair";
  }
  const split = transaction.category_split ?? [];
  if (split.length > 1) {
    return "multicategory";
  }
  return "single";
}

export function singleLeafCategory(
  split: CategorySplit[] | undefined,
): string {
  const first = split?.[0]?.category;
  return first && first.length > 0 ? first : UNCATEGORIZED;
}

export function splitSum(split: CategorySplit[] | undefined): number {
  return (split ?? []).reduce((sum, leaf) => sum + leaf.amount, 0);
}

export function splitsMatchTotal(
  split: CategorySplit[] | undefined,
  totalAmount: number,
): boolean {
  const leaves = split ?? [];
  if (leaves.length === 0) {
    return false;
  }
  const sum = splitSum(leaves);
  return Math.abs(sum - totalAmount) < 0.005;
}
