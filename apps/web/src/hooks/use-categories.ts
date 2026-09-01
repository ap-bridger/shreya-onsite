"use client";

import { tsr } from "@/lib/api-client";

export function useCategories(businessId: string) {
  return tsr.getCategories.useQuery({
    queryKey: ["categories", businessId],
    queryData: { query: { business_id: businessId } },
    enabled: Boolean(businessId),
  });
}
