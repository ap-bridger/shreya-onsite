"use client";

import { useMemo, useState } from "react";
import type { CategorySplit, NamedEntity } from "@bridger/contracts";
import type { TransactionDraft } from "@/lib/review-draft";
import { formatDate, formatMoney } from "@/lib/review-draft";
import {
  inferMetaCategory,
  splitsMatchTotal,
  splitSum,
  type MetaCategory,
} from "@/lib/meta-category";

type ChangeInfoModalProps = {
  draft: TransactionDraft;
  allDrafts: TransactionDraft[];
  vendors: NamedEntity[];
  categories: NamedEntity[];
  onClose: () => void;
  onSave: (next: TransactionDraft, pairPartnerId?: string) => void;
};

type LeafDraft = { category: string; amount: string };

function leavesFromSplit(split: CategorySplit[] | undefined): LeafDraft[] {
  const leaves = split ?? [];
  if (leaves.length === 0) {
    return [{ category: "", amount: "" }];
  }
  return leaves.map((leaf) => ({
    category: leaf.category,
    amount: String(leaf.amount),
  }));
}

function parseLeaves(leaves: LeafDraft[]): CategorySplit[] | null {
  const parsed: CategorySplit[] = [];
  for (const leaf of leaves) {
    if (!leaf.category.trim()) {
      return null;
    }
    const amount = Number(leaf.amount);
    if (!Number.isFinite(amount)) {
      return null;
    }
    parsed.push({ category: leaf.category.trim(), amount });
  }
  return parsed;
}

export function ChangeInfoModal({
  draft,
  allDrafts,
  vendors,
  categories,
  onClose,
  onSave,
}: ChangeInfoModalProps) {
  const initialMode = inferMetaCategory(draft);
  const [mode, setMode] = useState<MetaCategory>(initialMode);
  const [vendorId, setVendorId] = useState(draft.vendor_id ?? "");
  const [leaves, setLeaves] = useState<LeafDraft[]>(() =>
    leavesFromSplit(draft.category_split),
  );
  const [pairQuery, setPairQuery] = useState("");
  const [pairId, setPairId] = useState(draft.paired_transaction_id ?? "");
  const [error, setError] = useState("");

  const pairCandidates = useMemo(() => {
    const q = pairQuery.trim().toLowerCase();
    return allDrafts
      .filter((candidate) => candidate.transaction_id !== draft.transaction_id)
      .filter((candidate) => {
        if (!q) {
          return true;
        }
        return (
          candidate.transaction_id.toLowerCase().includes(q) ||
          candidate.description.toLowerCase().includes(q) ||
          String(candidate.total_amount).includes(q) ||
          formatDate(candidate.date).toLowerCase().includes(q)
        );
      })
      .slice(0, 8);
  }, [allDrafts, draft.transaction_id, pairQuery]);

  function updateLeaf(index: number, patch: Partial<LeafDraft>) {
    setLeaves((current) =>
      current.map((leaf, i) => (i === index ? { ...leaf, ...patch } : leaf)),
    );
  }

  function handleSave() {
    setError("");

    if (mode === "pair") {
      if (!pairId) {
        setError("Select a paired transaction.");
        return;
      }
      if (pairId === draft.transaction_id) {
        setError("A transaction cannot pair with itself.");
        return;
      }
      const partnerExists = allDrafts.some(
        (candidate) => candidate.transaction_id === pairId,
      );
      if (!partnerExists) {
        setError("Paired transaction was not found.");
        return;
      }

      onSave(
        {
          ...draft,
          paired_transaction_id: pairId,
          dirty: true,
        },
        pairId,
      );
      return;
    }

    const parsed = parseLeaves(mode === "single" ? leaves.slice(0, 1) : leaves);
    if (!parsed || parsed.length === 0) {
      setError("Each leaf needs a category and numeric amount.");
      return;
    }
    if (mode === "multicategory" && parsed.length < 2) {
      // Auto-collapse to single is allowed; continue.
    }
    if (!splitsMatchTotal(parsed, draft.total_amount)) {
      setError(
        `Category amounts must sum to ${formatMoney(draft.total_amount)} (currently ${formatMoney(splitSum(parsed))}).`,
      );
      return;
    }

    const vendor = vendors.find((item) => item.id === vendorId);

    onSave({
      ...draft,
      vendor_id: vendor?.id,
      vendor_name: vendor?.name ?? draft.vendor_name,
      category_split: parsed,
      paired_transaction_id: undefined,
      dirty: true,
    });
  }

  const parsedPreview = parseLeaves(
    mode === "single" ? leaves.slice(0, 1) : leaves,
  );
  const previewSum = splitSum(parsedPreview ?? undefined);
  const sumOk =
    parsedPreview !== null &&
    splitsMatchTotal(parsedPreview, draft.total_amount);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay p-4">
      <div
        role="dialog"
        aria-labelledby="change-info-title"
        className="panel max-h-[90vh] w-full max-w-lg overflow-auto p-5"
      >
        <h2 id="change-info-title" className="text-lg font-semibold text-neutral">
          Change info — {draft.transaction_id}
        </h2>
        <p className="mt-1 text-sm text-neutral-subdued">
          {formatMoney(draft.total_amount)} · {formatDate(draft.date)}
        </p>

        <div className="mt-4">
          <div className="label-caps">Meta-category</div>
          <div className="mt-2 flex flex-wrap gap-2">
            {(
              [
                ["single", "Single"],
                ["multicategory", "Multicategory"],
                ["pair", "Pair"],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                className={`rounded-full border px-3 py-1 text-sm ${
                  mode === value
                    ? "border-accent bg-accent-baseline/20 font-semibold text-accent"
                    : "border-border text-neutral-subdued"
                }`}
                onClick={() => {
                  setMode(value);
                  setError("");
                  if (value === "single" && leaves.length === 0) {
                    setLeaves([
                      {
                        category: "",
                        amount: String(draft.total_amount),
                      },
                    ]);
                  }
                  if (value === "multicategory" && leaves.length < 2) {
                    setLeaves([
                      {
                        category: leaves[0]?.category ?? "",
                        amount:
                          leaves[0]?.amount ||
                          String(draft.total_amount / 2),
                      },
                      {
                        category: "",
                        amount: String(draft.total_amount / 2),
                      },
                    ]);
                  }
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {mode !== "pair" ? (
          <div className="mt-4">
            <label className="label-caps">
              Vendor
              <select
                className="field-input mt-1 block w-full font-normal normal-case tracking-normal"
                value={vendorId}
                onChange={(event) => setVendorId(event.target.value)}
              >
                <option value="">Select vendor</option>
                {vendors.map((vendor) => (
                  <option key={vendor.id} value={vendor.id}>
                    {vendor.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
        ) : null}

        {mode === "pair" ? (
          <div className="mt-4">
            <label className="label-caps">
              Paired transaction
              <input
                className="field-input mt-1 block w-full font-normal normal-case tracking-normal"
                placeholder="Search ID, description, amount…"
                value={pairQuery}
                onChange={(event) => setPairQuery(event.target.value)}
              />
            </label>
            <ul className="mt-2 max-h-48 overflow-auto rounded border border-border">
              {pairCandidates.map((candidate) => {
                const selected = pairId === candidate.transaction_id;
                return (
                  <li key={candidate.transaction_id}>
                    <button
                      type="button"
                      className={`block w-full px-3 py-2 text-left text-sm text-neutral ${
                        selected
                          ? "bg-accent-baseline/20"
                          : "hover:bg-accent-baseline/10"
                      }`}
                      onClick={() => setPairId(candidate.transaction_id)}
                    >
                      <span className="font-medium">
                        {candidate.transaction_id}
                      </span>{" "}
                      · {candidate.description} ·{" "}
                      {formatMoney(candidate.total_amount)} ·{" "}
                      {formatDate(candidate.date)}
                    </button>
                  </li>
                );
              })}
              {pairCandidates.length === 0 ? (
                <li className="px-3 py-2 text-sm text-neutral-subdued">
                  No matching transactions
                </li>
              ) : null}
            </ul>
            {pairId ? (
              <p className="mt-2 text-xs text-neutral-subdued">
                Selected pair: <strong className="text-neutral">{pairId}</strong>
              </p>
            ) : null}
          </div>
        ) : (
          <div className="mt-4">
            <div className="label-caps">Category allotment</div>
            <div className="mt-2 space-y-2 rounded border border-border bg-accent-baseline/10 p-3">
              {(mode === "single" ? leaves.slice(0, 1) : leaves).map(
                (leaf, index) => (
                  <div key={index} className="flex gap-2">
                    <select
                      className="field-input min-w-0 flex-1"
                      value={leaf.category}
                      onChange={(event) =>
                        updateLeaf(index, { category: event.target.value })
                      }
                    >
                      <option value="">Category</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.name}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                    <input
                      className="field-input w-24"
                      inputMode="decimal"
                      value={leaf.amount}
                      onChange={(event) =>
                        updateLeaf(index, { amount: event.target.value })
                      }
                    />
                    {mode === "multicategory" ? (
                      <button
                        type="button"
                        className="px-2 text-neutral-subdued"
                        aria-label="Remove leaf"
                        onClick={() =>
                          setLeaves((current) =>
                            current.length <= 1
                              ? current
                              : current.filter((_, i) => i !== index),
                          )
                        }
                      >
                        ×
                      </button>
                    ) : null}
                  </div>
                ),
              )}
              {mode === "multicategory" ? (
                <button
                  type="button"
                  className="btn-secondary !px-2 !py-1 text-xs"
                  onClick={() =>
                    setLeaves((current) => [
                      ...current,
                      { category: "", amount: "0" },
                    ])
                  }
                >
                  + Add category leaf
                </button>
              ) : null}
              <p
                className={`text-xs ${sumOk ? "text-accent" : "text-neutral-subdued"}`}
              >
                Split total: {formatMoney(previewSum)} /{" "}
                {formatMoney(draft.total_amount)}
                {sumOk ? " ✓" : ""}
                {mode === "multicategory" &&
                parsedPreview &&
                parsedPreview.length === 1
                  ? " — will move to Single on save"
                  : ""}
              </p>
            </div>
          </div>
        )}

        {error ? (
          <p className="mt-3 text-sm text-accent" role="alert">
            {error}
          </p>
        ) : null}

        <div className="mt-5 flex justify-end gap-2">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="btn-primary" onClick={handleSave}>
            Save draft
          </button>
        </div>
      </div>
    </div>
  );
}
