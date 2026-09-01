"use client";

import { tsr } from "@/lib/api-client";

export function useVendors(businessId: string) {
  return tsr.getVendors.useQuery({
    queryKey: ["vendors", businessId],
    queryData: { query: { business_id: businessId } },
    enabled: Boolean(businessId),
  });
}
