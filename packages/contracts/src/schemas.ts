import { z } from "zod";

export const idSchema = z.string().min(1);

export const namedEntitySchema = z.object({
  id: idSchema,
  name: z.string(),
});

export const categorySplitSchema = z.object({
  category: z.string(),
  amount: z.number(),
});

const transactionCoreSchema = z.object({
  account_id: idSchema,
  account_name: z.string(),
  business_id: idSchema,
  transaction_id: idSchema,
  category_split: z.array(categorySplitSchema).optional(),
  total_amount: z.number(),
  date: z.string().datetime(),
  vendor_id: idSchema.optional(),
  vendor_name: z.string(),
  paired_transaction_id: idSchema.optional(),
  description: z.string(),
});

export const transactionToReviewSchema = transactionCoreSchema.extend({
  needs_client_review: z.boolean(),
});

export const reviewedTransactionStatusSchema = z.enum([
  "approved",
  "needs_client_review",
  "unreviewed",
]);

export const reviewedTransactionSchema = transactionCoreSchema.extend({
  status: reviewedTransactionStatusSchema,
});

export const businessesResponseSchema = z.object({
  businesses: z.array(namedEntitySchema),
});

export const businessIdQuerySchema = z.object({
  business_id: idSchema,
});

export const transactionsResponseSchema = z.object({
  transactions: z.array(transactionToReviewSchema),
});

export const vendorsResponseSchema = z.object({
  vendors: z.array(namedEntitySchema),
});

export const categoriesResponseSchema = z.object({
  categories: z.array(namedEntitySchema),
});

export const submitResultsBodySchema = z.object({
  business_id: idSchema,
  transactions: z.array(reviewedTransactionSchema),
});

export const submitResultsResponseSchema = z.object({
  ok: z.literal(true),
});

export type NamedEntity = z.infer<typeof namedEntitySchema>;
export type CategorySplit = z.infer<typeof categorySplitSchema>;
export type TransactionToReview = z.infer<typeof transactionToReviewSchema>;
export type ReviewedTransaction = z.infer<typeof reviewedTransactionSchema>;
