"use client";

import { tsr } from "@/lib/api-client";
import type { Business } from "./types";

export function useBusinesses() {
  const query = tsr.getBusinesses.useQuery({
    queryKey: ["businesses"],
  });

  const businesses: Business[] =
    query.data?.status === 200 ? query.data.body.businesses : [];

  return { ...query, businesses };
}

export function resolveBusinessId(
  businesses: Business[],
  selectedBusinessId: string,
): string {
  if (
    selectedBusinessId &&
    businesses.some((business) => business.id === selectedBusinessId)
  ) {
    return selectedBusinessId;
  }

  return businesses[0]?.id ?? "";
}
