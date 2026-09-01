import type { NamedEntity, TransactionToReview } from "@bridger/contracts";

export const businesses: NamedEntity[] = [
  { id: "biz_acme", name: "Acme Accounting" },
  { id: "biz_globex", name: "Globex Corp" },
  { id: "biz_initech", name: "Initech" },
];

const vendorsByBusiness: Record<string, NamedEntity[]> = {
  biz_acme: [
    { id: "vnd_staples", name: "Staples" },
    { id: "vnd_aws", name: "Amazon Web Services" },
  ],
  biz_globex: [{ id: "vnd_fedex", name: "FedEx" }],
  biz_initech: [{ id: "vnd_initech_cafe", name: "Initech Cafe" }],
};

const categoriesByBusiness: Record<string, NamedEntity[]> = {
  biz_acme: [
    { id: "cat_office", name: "Office Supplies" },
    { id: "cat_software", name: "Software" },
  ],
  biz_globex: [{ id: "cat_shipping", name: "Shipping" }],
  biz_initech: [{ id: "cat_meals", name: "Meals" }],
};

const transactionsByBusiness: Record<string, TransactionToReview[]> = {
  biz_acme: [
    {
      account_id: "acct_checking",
      account_name: "Checking",
      business_id: "biz_acme",
      transaction_id: "txn_acme_1",
      category_split: [{ category: "Office Supplies", amount: 42.5 }],
      total_amount: 42.5,
      date: "2026-08-15T14:30:00.000Z",
      vendor_id: "vnd_staples",
      vendor_name: "Staples",
      description: "Printer paper",
      needs_client_review: false,
    },
    {
      account_id: "acct_checking",
      account_name: "Checking",
      business_id: "biz_acme",
      transaction_id: "txn_acme_2",
      category_split: [],
      total_amount: 120,
      date: "2026-08-18T09:00:00.000Z",
      vendor_id: "vnd_aws",
      vendor_name: "Amazon Web Services",
      paired_transaction_id: "txn_acme_2b",
      description: "Monthly compute",
      needs_client_review: true,
    },
  ],
  biz_globex: [
    {
      account_id: "acct_ops",
      account_name: "Operations",
      business_id: "biz_globex",
      transaction_id: "txn_globex_1",
      category_split: [{ category: "Shipping", amount: 88.12 }],
      total_amount: 88.12,
      date: "2026-08-20T16:45:00.000Z",
      vendor_id: "vnd_fedex",
      vendor_name: "FedEx",
      description: "Overnight label",
      needs_client_review: false,
    },
  ],
  biz_initech: [],
};

export function vendorsFor(businessId: string): NamedEntity[] {
  return vendorsByBusiness[businessId] ?? [];
}

export function categoriesFor(businessId: string): NamedEntity[] {
  return categoriesByBusiness[businessId] ?? [];
}

export function transactionsFor(businessId: string): TransactionToReview[] {
  return transactionsByBusiness[businessId] ?? [];
}

export const submittedResults: Array<{
  business_id: string;
  transactions: unknown[];
  received_at: string;
}> = [];
