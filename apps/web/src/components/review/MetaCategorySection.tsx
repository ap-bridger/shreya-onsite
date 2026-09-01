"use client";

import { useState, type ReactNode } from "react";
import { Pagination, paginate } from "./Pagination";

type GenericSectionProps<T> = {
  title: string;
  count: number;
  items: T[];
  defaultOpen?: boolean;
  renderItem: (item: T) => ReactNode;
  emptyLabel?: string;
};

export function MetaCategorySection<T>({
  title,
  count,
  items,
  defaultOpen = false,
  renderItem,
  emptyLabel = "No transactions",
}: GenericSectionProps<T>) {
  const [open, setOpen] = useState(defaultOpen);
  const [page, setPage] = useState(1);
  const { page: safePage, pageCount, items: pageItems } = paginate(items, page);

  return (
    <section className="panel overflow-hidden">
      <button
        type="button"
        className="flex w-full items-center justify-between bg-accent-baseline/15 px-4 py-3 text-left"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
      >
        <span className="font-semibold text-accent">
          {open ? "▾" : "▸"} {title}
        </span>
        <span className="rounded-full bg-surface px-2 py-0.5 text-xs text-neutral-subdued ring-1 ring-border">
          {count}
        </span>
      </button>
      {open ? (
        <div className="space-y-2 bg-surface p-3">
          {pageItems.length === 0 ? (
            <p className="text-sm text-neutral-subdued">{emptyLabel}</p>
          ) : (
            pageItems.map(renderItem)
          )}
          <Pagination
            page={safePage}
            pageCount={pageCount}
            onPageChange={setPage}
          />
        </div>
      ) : null}
    </section>
  );
}

type NestedGroupProps<T> = {
  title: string;
  items: T[];
  defaultOpen?: boolean;
  renderItem: (item: T) => ReactNode;
};

export function NestedCategoryGroup<T>({
  title,
  items,
  defaultOpen = false,
  renderItem,
}: NestedGroupProps<T>) {
  const [open, setOpen] = useState(defaultOpen);
  const [page, setPage] = useState(1);
  const { page: safePage, pageCount, items: pageItems } = paginate(items, page);

  return (
    <div className="rounded border border-border bg-accent-baseline/8">
      <button
        type="button"
        className="flex w-full items-center justify-between px-3 py-2 text-left text-sm text-neutral"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
      >
        <span>
          {open ? "▾" : "▸"} {title}
        </span>
        <span className="text-xs text-neutral-subdued">{items.length}</span>
      </button>
      {open ? (
        <div className="space-y-2 border-t border-border px-3 py-2">
          {pageItems.map(renderItem)}
          <Pagination
            page={safePage}
            pageCount={pageCount}
            onPageChange={setPage}
          />
        </div>
      ) : null}
    </div>
  );
}
