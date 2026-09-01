"use client";

import { tsr } from "@/lib/api-client";

export function useTransactions(businessId: string) {
  return tsr.getTransactions.useQuery({
    queryKey: ["transactions", businessId],
    queryData: { query: { business_id: businessId } },
    enabled: Boolean(businessId),
  });
}
