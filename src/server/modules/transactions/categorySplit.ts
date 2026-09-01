/**
 * The `category_split` column on the three transaction tables holds a
 * JSON-encoded array of category allocations. SQLite stores it as plain text,
 * so every read goes through `parseCategorySplit` and every write through
 * `serializeCategorySplit` to keep the shape consistent.
 */
export type CategorySplitEntry = {
  category_id: string;
  amount: number;
};

export type CategorySplit = CategorySplitEntry[];

export class InvalidCategorySplitError extends Error {
  constructor(message: string) {
    super(`Invalid category_split: ${message}`);
    this.name = "InvalidCategorySplitError";
  }
}

const isEntry = (value: unknown): value is CategorySplitEntry =>
  typeof value === "object" &&
  value !== null &&
  !Array.isArray(value) &&
  typeof (value as CategorySplitEntry).category_id === "string" &&
  (value as CategorySplitEntry).category_id.length > 0 &&
  typeof (value as CategorySplitEntry).amount === "number" &&
  Number.isFinite((value as CategorySplitEntry).amount);

export const parseCategorySplit = (raw: string): CategorySplit => {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new InvalidCategorySplitError("not valid JSON");
  }
  if (!Array.isArray(parsed)) {
    throw new InvalidCategorySplitError("expected an array");
  }
  parsed.forEach((entry, index) => {
    if (!isEntry(entry)) {
      throw new InvalidCategorySplitError(
        `entry ${index} must be {category_id: string, amount: finite number}`,
      );
    }
  });
  return parsed.map(({ category_id, amount }) => ({ category_id, amount }));
};

export const serializeCategorySplit = (split: CategorySplit): string => {
  split.forEach((entry, index) => {
    if (!isEntry(entry)) {
      throw new InvalidCategorySplitError(
        `entry ${index} must be {category_id: string, amount: finite number}`,
      );
    }
  });
  return JSON.stringify(
    split.map(({ category_id, amount }) => ({ category_id, amount })),
  );
};
