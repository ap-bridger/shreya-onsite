import {
  businessesResponseSchema,
  categoriesResponseSchema,
  submitResultsBodySchema,
  transactionsResponseSchema,
  vendorsResponseSchema,
  type NamedEntity,
  type ReviewedTransaction,
} from "@bridger/contracts";

export type { NamedEntity, ReviewedTransaction };

export type Business = NamedEntity;
export type Vendor = NamedEntity;
export type Category = NamedEntity;

export type BusinessesResponse = ReturnType<typeof businessesResponseSchema.parse>;
export type TransactionsResponse = ReturnType<
  typeof transactionsResponseSchema.parse
>;
export type VendorsResponse = ReturnType<typeof vendorsResponseSchema.parse>;
export type CategoriesResponse = ReturnType<typeof categoriesResponseSchema.parse>;
export type SubmitResultsBody = ReturnType<typeof submitResultsBodySchema.parse>;
