"use client";

import { tsr } from "@/lib/api-client";
import type { SubmitResultsBody } from "./types";

export function useSubmitResults() {
  return tsr.submitResults.useMutation();
}

export function sampleResultsPayload(businessId: string): SubmitResultsBody {
  return {
    business_id: businessId,
    transactions: [
      {
        account_id: "acct_checking",
        account_name: "Checking",
        business_id: businessId,
        transaction_id: "txn_hardcoded_1",
        category_split: [{ category: "Office Supplies", amount: 10 }],
        total_amount: 10,
        date: "2026-08-21T12:00:00.000Z",
        vendor_id: "vnd_staples",
        vendor_name: "Staples",
        description: "Hardcoded submit payload",
        status: "approved",
      },
    ],
  };
}
