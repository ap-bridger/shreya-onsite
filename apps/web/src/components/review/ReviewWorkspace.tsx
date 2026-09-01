"use client";

import { useEffect, useMemo, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { resolveBusinessId, useBusinesses } from "@/hooks/use-businesses";
import { useTransactions } from "@/hooks/use-transactions";
import { useVendors } from "@/hooks/use-vendors";
import { useCategories } from "@/hooks/use-categories";
import { useSubmitResults } from "@/hooks/use-submit-results";
import {
  draftsFromTransactions,
  toSubmitPayload,
  type ReviewFormValues,
  type TransactionDraft,
} from "@/lib/review-draft";
import {
  inferMetaCategory,
  singleLeafCategory,
} from "@/lib/meta-category";
import { ChangeInfoModal } from "./ChangeInfoModal";
import { DetailsModal } from "./DetailsModal";
import {
  MetaCategorySection,
  NestedCategoryGroup,
} from "./MetaCategorySection";
import { TransactionRow } from "./TransactionRow";

export function ReviewWorkspace() {
  const [selectedBusinessId, setSelectedBusinessId] = useState("");
  const [activeDetailsId, setActiveDetailsId] = useState<string | null>(null);
  const [activeEditId, setActiveEditId] = useState<string | null>(null);
  const [submitMessage, setSubmitMessage] = useState("");

  const businessesQuery = useBusinesses();
  const businessId = resolveBusinessId(
    businessesQuery.businesses,
    selectedBusinessId,
  );
  const transactionsQuery = useTransactions(businessId);
  const vendorsQuery = useVendors(businessId);
  const categoriesQuery = useCategories(businessId);
  const submitMutation = useSubmitResults();

  const form = useForm<ReviewFormValues>({
    defaultValues: { transactions: {} },
  });
  const { reset, watch, setValue, getValues } = form;
  const draftMap = watch("transactions");

  useEffect(() => {
    const body = transactionsQuery.data;
    if (body?.status !== 200) {
      return;
    }
    reset(draftsFromTransactions(body.body.transactions));
    setSubmitMessage("");
  }, [transactionsQuery.data, reset, businessId]);

  const drafts = useMemo(
    () => Object.values(draftMap ?? {}),
    [draftMap],
  );

  const grouped = useMemo(() => {
    const single = new Map<string, TransactionDraft[]>();
    const multicategory: TransactionDraft[] = [];
    const pair: TransactionDraft[] = [];

    for (const draft of drafts) {
      const meta = inferMetaCategory(draft);
      if (meta === "pair") {
        pair.push(draft);
        continue;
      }
      if (meta === "multicategory") {
        multicategory.push(draft);
        continue;
      }
      const leaf = singleLeafCategory(draft.category_split);
      const list = single.get(leaf) ?? [];
      list.push(draft);
      single.set(leaf, list);
    }

    const singleGroups = [...single.entries()].sort(([a], [b]) =>
      a.localeCompare(b),
    );
    return { singleGroups, multicategory, pair };
  }, [drafts]);

  const vendors =
    vendorsQuery.data?.status === 200 ? vendorsQuery.data.body.vendors : [];
  const categories =
    categoriesQuery.data?.status === 200
      ? categoriesQuery.data.body.categories
      : [];

  const activeDetails = activeDetailsId
    ? draftMap[activeDetailsId]
    : undefined;
  const activeEdit = activeEditId ? draftMap[activeEditId] : undefined;

  function updateDraft(next: TransactionDraft) {
    const currentMap = getValues("transactions");
    setValue(
      "transactions",
      {
        ...currentMap,
        [next.transaction_id]: next,
      },
      { shouldDirty: true, shouldTouch: true },
    );
  }

  function handleToggleApproved(id: string, approved: boolean) {
    const current = getValues("transactions")[id];
    if (!current) {
      return;
    }
    updateDraft({
      ...current,
      status: approved
        ? "approved"
        : current.needs_client_review
          ? "needs_client_review"
          : "unreviewed",
    });
  }

  function handleSaveDraft(next: TransactionDraft, pairPartnerId?: string) {
    const currentMap = { ...getValues("transactions") };

    if (pairPartnerId) {
      const partner = currentMap[pairPartnerId];
      if (!partner) {
        return;
      }

      // Clear previous reverse links that pointed at either side.
      for (const [id, draft] of Object.entries(currentMap)) {
        if (
          id !== next.transaction_id &&
          id !== pairPartnerId &&
          (draft.paired_transaction_id === next.transaction_id ||
            draft.paired_transaction_id === pairPartnerId)
        ) {
          currentMap[id] = {
            ...draft,
            paired_transaction_id: undefined,
            dirty: true,
          };
        }
      }

      currentMap[next.transaction_id] = {
        ...next,
        paired_transaction_id: pairPartnerId,
        dirty: true,
      };
      currentMap[pairPartnerId] = {
        ...partner,
        paired_transaction_id: next.transaction_id,
        dirty: true,
      };
      reset({ transactions: currentMap });
      setActiveEditId(null);
      return;
    }

    // Leaving pair mode: clear reverse link on former partner.
    const previous = currentMap[next.transaction_id];
    if (
      previous?.paired_transaction_id &&
      previous.paired_transaction_id !== next.paired_transaction_id
    ) {
      const former = currentMap[previous.paired_transaction_id];
      if (
        former &&
        former.paired_transaction_id === next.transaction_id
      ) {
        currentMap[former.transaction_id] = {
          ...former,
          paired_transaction_id: undefined,
          dirty: true,
        };
      }
    }

    currentMap[next.transaction_id] = { ...next, dirty: true };
    reset({ transactions: currentMap });
    setActiveEditId(null);
  }

  async function handleSubmit() {
    setSubmitMessage("");
    const payload = toSubmitPayload(businessId, getValues("transactions"));
    try {
      const result = await submitMutation.mutateAsync({ body: payload });
      if (result.status === 200) {
        const cleared = Object.fromEntries(
          Object.entries(getValues("transactions")).map(([id, draft]) => [
            id,
            { ...draft, dirty: false },
          ]),
        );
        reset({ transactions: cleared });
        setSubmitMessage(
          `Submitted ${payload.transactions.length} transaction(s).`,
        );
      }
    } catch (error) {
      setSubmitMessage(
        error instanceof Error ? error.message : "Submit failed",
      );
    }
  }

  function renderRow(draft: TransactionDraft) {
    return (
      <TransactionRow
        key={draft.transaction_id}
        draft={draft}
        onToggleApproved={(approved) =>
          handleToggleApproved(draft.transaction_id, approved)
        }
        onDetails={() => setActiveDetailsId(draft.transaction_id)}
        onChangeInfo={() => setActiveEditId(draft.transaction_id)}
      />
    );
  }

  const loadingTransactions =
    Boolean(businessId) &&
    (transactionsQuery.isPending || transactionsQuery.isFetching);

  return (
    <FormProvider {...form}>
      <div className="mx-auto flex min-h-screen max-w-3xl flex-col gap-4 bg-canvas p-6 pb-24 font-sans text-neutral">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-neutral">
              Transaction review
            </h1>
            <p className="text-sm text-neutral-subdued">
              Review by meta-category, edit drafts, then submit results.
            </p>
          </div>
          <label className="flex min-w-[220px] flex-col gap-1 text-sm text-neutral">
            Business
            <select
              className="field-input"
              value={businessId}
              onChange={(event) => setSelectedBusinessId(event.target.value)}
            >
              {businessesQuery.businesses.length === 0 ? (
                <option value="">No businesses</option>
              ) : null}
              {businessesQuery.businesses.map((business) => (
                <option key={business.id} value={business.id}>
                  {business.name}
                </option>
              ))}
            </select>
          </label>
        </header>

        {businessesQuery.isError ? (
          <p className="text-sm text-accent">
            Failed to load businesses. Is the API running on port 3001?
          </p>
        ) : null}
        {loadingTransactions ? (
          <p className="text-sm text-neutral-subdued">Loading transactions…</p>
        ) : null}

        <MetaCategorySection
          title="Single category"
          count={grouped.singleGroups.reduce(
            (sum, [, items]) => sum + items.length,
            0,
          )}
          items={grouped.singleGroups}
          defaultOpen
          emptyLabel="No single-category transactions"
          renderItem={([category, items]) => (
            <NestedCategoryGroup
              key={category}
              title={category}
              items={items}
              defaultOpen
              renderItem={renderRow}
            />
          )}
        />

        <MetaCategorySection
          title="Multicategory"
          count={grouped.multicategory.length}
          items={grouped.multicategory}
          renderItem={renderRow}
        />

        <MetaCategorySection
          title="Pair"
          count={grouped.pair.length}
          items={grouped.pair}
          defaultOpen={grouped.pair.length > 0}
          renderItem={renderRow}
        />

        <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-surface/95">
          <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-6 py-3">
            <p className="text-sm text-neutral-subdued">
              {submitMessage ||
                `${drafts.length} transaction(s) · ${drafts.filter((d) => d.dirty).length} dirty · ${drafts.filter((d) => d.status === "approved").length} approved`}
            </p>
            <button
              type="button"
              className="btn-primary px-4 py-2"
              disabled={!businessId || drafts.length === 0 || submitMutation.isPending}
              onClick={() => void handleSubmit()}
            >
              {submitMutation.isPending ? "Submitting…" : "Submit results"}
            </button>
          </div>
        </div>

        {activeDetails ? (
          <DetailsModal
            draft={activeDetails}
            onClose={() => setActiveDetailsId(null)}
            onChangeInfo={() => {
              setActiveDetailsId(null);
              setActiveEditId(activeDetails.transaction_id);
            }}
          />
        ) : null}

        {activeEdit ? (
          <ChangeInfoModal
            draft={activeEdit}
            allDrafts={drafts}
            vendors={vendors}
            categories={categories}
            onClose={() => setActiveEditId(null)}
            onSave={handleSaveDraft}
          />
        ) : null}
      </div>
    </FormProvider>
  );
}
