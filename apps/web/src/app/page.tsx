"use client";

import { useState } from "react";
import { resolveBusinessId, useBusinesses } from "@/hooks/use-businesses";
import { useTransactions } from "@/hooks/use-transactions";
import { useVendors } from "@/hooks/use-vendors";
import { useCategories } from "@/hooks/use-categories";
import {
  sampleResultsPayload,
  useSubmitResults,
} from "@/hooks/use-submit-results";

type LastAction =
  | "businesses"
  | "transactions"
  | "vendors"
  | "categories"
  | "results";

function serializeError(error: unknown) {
  if (error instanceof Error) {
    return { name: error.name, message: error.message };
  }
  return error;
}

export default function Home() {
  const [selectedBusinessId, setSelectedBusinessId] = useState("");
  const [lastAction, setLastAction] = useState<LastAction>("businesses");

  const businessesQuery = useBusinesses();
  const businessId = resolveBusinessId(
    businessesQuery.businesses,
    selectedBusinessId,
  );
  const transactionsQuery = useTransactions(businessId);
  const vendorsQuery = useVendors(businessId);
  const categoriesQuery = useCategories(businessId);
  const submitMutation = useSubmitResults();

  const businesses = businessesQuery.businesses;

  const dump = (() => {
    if (lastAction === "results") {
      if (submitMutation.isPending) {
        return { endpoint: "POST /results", loading: true };
      }
      if (submitMutation.isError) {
        return {
          endpoint: "POST /results",
          error: serializeError(submitMutation.error),
        };
      }
      if (submitMutation.data) {
        return { endpoint: "POST /results", data: submitMutation.data };
      }
      return { endpoint: "POST /results" };
    }

    const queries = {
      businesses: { endpoint: "GET /businesses", result: businessesQuery },
      transactions: { endpoint: "GET /transactions", result: transactionsQuery },
      vendors: { endpoint: "GET /vendors", result: vendorsQuery },
      categories: { endpoint: "GET /categories", result: categoriesQuery },
    } as const;
    const { endpoint, result } = queries[lastAction];

    if (result.isError) {
      return { endpoint, error: serializeError(result.error) };
    }
    if (result.isPending || result.isFetching) {
      return { endpoint, loading: true };
    }
    if (result.data) {
      return { endpoint, data: result.data };
    }
    return { endpoint };
  })();

  return (
    <div className="min-h-screen p-8 font-sans">
      <main className="mx-auto flex max-w-3xl flex-col gap-4">
        <h1 className="text-2xl font-semibold">Bookkeeper API shell</h1>
        <label className="flex flex-col gap-1">
          Business
          <select
            className="border px-2 py-1"
            value={businessId}
            onChange={(event) => setSelectedBusinessId(event.target.value)}
          >
            {businesses.length === 0 ? (
              <option value="">No businesses</option>
            ) : null}
            {businesses.map((business) => (
              <option key={business.id} value={business.id}>
                {business.name}
              </option>
            ))}
          </select>
        </label>
        <div className="flex flex-wrap gap-2">
          <button
            className="border px-3 py-1"
            type="button"
            onClick={() => {
              setLastAction("businesses");
              void businessesQuery.refetch();
            }}
          >
            Fetch businesses
          </button>
          <button
            className="border px-3 py-1"
            type="button"
            disabled={!businessId}
            onClick={() => {
              setLastAction("transactions");
              void transactionsQuery.refetch();
            }}
          >
            Fetch transactions
          </button>
          <button
            className="border px-3 py-1"
            type="button"
            disabled={!businessId}
            onClick={() => {
              setLastAction("vendors");
              void vendorsQuery.refetch();
            }}
          >
            Fetch vendors
          </button>
          <button
            className="border px-3 py-1"
            type="button"
            disabled={!businessId}
            onClick={() => {
              setLastAction("categories");
              void categoriesQuery.refetch();
            }}
          >
            Fetch categories
          </button>
          <button
            className="border px-3 py-1"
            type="button"
            disabled={!businessId}
            onClick={() => {
              setLastAction("results");
              submitMutation.mutate({
                body: sampleResultsPayload(businessId),
              });
            }}
          >
            Submit results
          </button>
        </div>
        <pre className="overflow-auto border p-3 text-sm">
          {JSON.stringify(dump, null, 2)}
        </pre>
      </main>
    </div>
  );
}
