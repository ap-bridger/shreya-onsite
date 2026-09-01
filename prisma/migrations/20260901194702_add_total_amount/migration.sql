/*
  Warnings:

  - Added the required column `total_amount` to the `needs_client_review_transactions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `total_amount` to the `reviewed_result_transactions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `total_amount` to the `transaction_to_be_reviewed` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_needs_client_review_transactions" (
    "transaction_id" TEXT NOT NULL PRIMARY KEY,
    "account_id" TEXT NOT NULL,
    "account_name" TEXT NOT NULL,
    "business_id" TEXT NOT NULL,
    "total_amount" DECIMAL NOT NULL,
    "category_split" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "vendor_id" TEXT,
    "vendor_name" TEXT,
    "paired_transaction_id" TEXT,
    "description" TEXT NOT NULL,
    CONSTRAINT "needs_client_review_transactions_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "business" ("business_id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "needs_client_review_transactions_business_id_vendor_id_fkey" FOREIGN KEY ("business_id", "vendor_id") REFERENCES "vendor" ("business_id", "vendor_id") ON DELETE RESTRICT ON UPDATE RESTRICT
);
INSERT INTO "new_needs_client_review_transactions" ("account_id", "account_name", "business_id", "category_split", "date", "description", "paired_transaction_id", "transaction_id", "vendor_id", "vendor_name") SELECT "account_id", "account_name", "business_id", "category_split", "date", "description", "paired_transaction_id", "transaction_id", "vendor_id", "vendor_name" FROM "needs_client_review_transactions";
DROP TABLE "needs_client_review_transactions";
ALTER TABLE "new_needs_client_review_transactions" RENAME TO "needs_client_review_transactions";
CREATE INDEX "needs_client_review_transactions_business_id_idx" ON "needs_client_review_transactions"("business_id");
CREATE INDEX "needs_client_review_transactions_business_id_vendor_id_idx" ON "needs_client_review_transactions"("business_id", "vendor_id");
CREATE TABLE "new_reviewed_result_transactions" (
    "transaction_id" TEXT NOT NULL PRIMARY KEY,
    "account_id" TEXT NOT NULL,
    "account_name" TEXT NOT NULL,
    "business_id" TEXT NOT NULL,
    "total_amount" DECIMAL NOT NULL,
    "category_split" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "vendor_id" TEXT,
    "vendor_name" TEXT,
    "paired_transaction_id" TEXT,
    "description" TEXT NOT NULL,
    CONSTRAINT "reviewed_result_transactions_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "business" ("business_id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "reviewed_result_transactions_business_id_vendor_id_fkey" FOREIGN KEY ("business_id", "vendor_id") REFERENCES "vendor" ("business_id", "vendor_id") ON DELETE RESTRICT ON UPDATE RESTRICT
);
INSERT INTO "new_reviewed_result_transactions" ("account_id", "account_name", "business_id", "category_split", "date", "description", "paired_transaction_id", "transaction_id", "vendor_id", "vendor_name") SELECT "account_id", "account_name", "business_id", "category_split", "date", "description", "paired_transaction_id", "transaction_id", "vendor_id", "vendor_name" FROM "reviewed_result_transactions";
DROP TABLE "reviewed_result_transactions";
ALTER TABLE "new_reviewed_result_transactions" RENAME TO "reviewed_result_transactions";
CREATE INDEX "reviewed_result_transactions_business_id_idx" ON "reviewed_result_transactions"("business_id");
CREATE INDEX "reviewed_result_transactions_business_id_vendor_id_idx" ON "reviewed_result_transactions"("business_id", "vendor_id");
CREATE TABLE "new_transaction_to_be_reviewed" (
    "transaction_id" TEXT NOT NULL PRIMARY KEY,
    "account_id" TEXT NOT NULL,
    "account_name" TEXT NOT NULL,
    "business_id" TEXT NOT NULL,
    "total_amount" DECIMAL NOT NULL,
    "category_split" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "vendor_id" TEXT,
    "vendor_name" TEXT,
    "paired_transaction_id" TEXT,
    "description" TEXT NOT NULL,
    "needs_client_review" BOOLEAN NOT NULL,
    CONSTRAINT "transaction_to_be_reviewed_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "business" ("business_id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "transaction_to_be_reviewed_business_id_vendor_id_fkey" FOREIGN KEY ("business_id", "vendor_id") REFERENCES "vendor" ("business_id", "vendor_id") ON DELETE RESTRICT ON UPDATE RESTRICT
);
INSERT INTO "new_transaction_to_be_reviewed" ("account_id", "account_name", "business_id", "category_split", "date", "description", "needs_client_review", "paired_transaction_id", "transaction_id", "vendor_id", "vendor_name") SELECT "account_id", "account_name", "business_id", "category_split", "date", "description", "needs_client_review", "paired_transaction_id", "transaction_id", "vendor_id", "vendor_name" FROM "transaction_to_be_reviewed";
DROP TABLE "transaction_to_be_reviewed";
ALTER TABLE "new_transaction_to_be_reviewed" RENAME TO "transaction_to_be_reviewed";
CREATE INDEX "transaction_to_be_reviewed_business_id_idx" ON "transaction_to_be_reviewed"("business_id");
CREATE INDEX "transaction_to_be_reviewed_business_id_vendor_id_idx" ON "transaction_to_be_reviewed"("business_id", "vendor_id");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
