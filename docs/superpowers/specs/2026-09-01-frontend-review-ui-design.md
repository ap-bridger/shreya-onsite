# Frontend review UI design

**Date:** 2026-09-01  
**Branch base:** `feat/api-contracts-layer`  
**Status:** Approved for implementation

## Goal

Replace the Bookkeeper API dump shell with a transaction review workspace wired to the existing ts-rest contract and React Query hooks: select a business, review transactions by meta-category, edit via modals, approve locally, and submit `POST /results`.

## Decisions (locked)

| Topic | Choice |
| --- | --- |
| Page layout | Stacked accordions: Single → Multicategory → Pair |
| Single section | Nested by leaf category name |
| Form state | One page-level `react-hook-form` for all transaction drafts |
| Persist model | Hybrid: modal **Save draft** updates form; approve toggles local `status`; page **Submit** posts full payload |
| Pair picker | Searchable dropdown of other transactions (id / description / amount / date) |
| Pair vendor | **No vendor field** in Pair mode (keep existing vendor fields on the draft unchanged) |
| Details | Separate read-only Details modal; Change Info is a second modal |
| Pagination | Client-side within each section/group (no contract change) |
| APIs used | `GET /businesses`, `/transactions`, `/vendors`, `/categories`, `POST /results` |

## Meta-category inference

Derived client-side (no API field):

1. **Pair** if `paired_transaction_id` is set
2. **Multicategory** if `category_split.length > 1`
3. **Single** otherwise — group under first leaf `category`, or `"Uncategorized"` when split is empty/missing

Changing meta-category in Change Info rewrites the draft so the row moves sections on save:

- **Single:** one category leaf; amount must equal `total_amount`; vendor editable
- **Multicategory:** N leaves; amounts must sum to `total_amount`; vendor editable; if user leaves exactly one leaf, treat as Single and relocate under that leaf group
- **Pair:** searchable pair transaction only (no vendor UI); on save, set mutual `paired_transaction_id` on both drafts and clear the reverse link on any previously paired third transaction

## Page structure

1. Header: title + business `<select>`
2. Accordion **Single category** — nested expandable leaf groups — paginated transaction rows
3. Accordion **Multicategory** — paginated rows
4. Accordion **Pair** — paginated rows
5. Sticky/footer **Submit results**

### Row chrome

- Checkbox / approve control → `status: "approved" | "unreviewed" | "needs_client_review"`
- Green background when `approved`
- Yellow background when draft is dirty (edited since load / last submit)
- Neutral when unreviewed / needs client review and not dirty
- Actions: **Details**, **Change info**

## Modals

### Details (read-only)

Shows account, ids, date, amount, vendor, description, category split, paired id, needs_client_review. Actions: Close, Change info.

### Change Info (edit)

Segmented control: Single | Multicategory | Pair.

- Vendor dropdown from `GET /vendors` (Single + Multi only)
- Category leaves from `GET /categories` names (map to `category_split[].category` strings)
- Split validator: sum of leaf amounts must equal `total_amount` before Save draft is enabled
- Pair: searchable list excluding self; selecting sets pending pair id until save

**Save draft** writes into the page form and marks the row dirty. **Cancel** discards modal-local state.

## Data flow

```
GET businesses → select business_id
GET transactions / vendors / categories (enabled when business_id set)
→ seed react-hook-form defaults (map needs_client_review → initial status)
→ user edits / approves locally
→ POST /results { business_id, transactions: ReviewedTransaction[] }
→ on success clear dirty flags (optionally refetch)
```

Initial status mapping:

- `needs_client_review === true` → `status: "needs_client_review"`
- else → `status: "unreviewed"`

## Component boundaries

| Unit | Responsibility |
| --- | --- |
| `ReviewWorkspace` | Business select, RHF provider, submit, section composition |
| `MetaCategorySection` | Accordion + client pagination shell |
| `CategoryGroup` | Nested leaf group under Single |
| `TransactionRow` | View chrome, approve, open modals |
| `DetailsModal` | Read-only fields |
| `ChangeInfoModal` | Mode-specific editors + validation |
| `lib/meta-category` | Infer / regroup helpers |
| Existing hooks | Unchanged contract access (`useBusinesses`, `useTransactions`, `useVendors`, `useCategories`, `useSubmitResults`) |

## Out of scope

- Extending API contracts with server pagination or explicit meta-category
- GraphQL / Prisma path for this UI (Nest stub + contracts only)
- Auth, multi-user conflict, optimistic locking
- Creating new vendors/categories inline

## Success criteria

- Analyst can select a business and see transactions grouped by meta-category (Single nested by leaf)
- Change Info supports Single / Multi / Pair flows as specified (Pair without vendor)
- Dirty + approved states are visible; Submit posts a contract-valid body via `useSubmitResults`
- Works against current Nest fixtures without contract changes
