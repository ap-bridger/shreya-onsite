-- CreateTable
CREATE TABLE "business" (
    "business_id" TEXT NOT NULL PRIMARY KEY,
    "business_name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "vendor" (
    "business_id" TEXT NOT NULL,
    "vendor_id" TEXT NOT NULL,
    "vendor_name" TEXT NOT NULL,

    PRIMARY KEY ("business_id", "vendor_id"),
    CONSTRAINT "vendor_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "business" ("business_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "categories" (
    "business_id" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,
    "category_name" TEXT NOT NULL,

    PRIMARY KEY ("business_id", "category_id"),
    CONSTRAINT "categories_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "business" ("business_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "transaction_to_be_reviewed" (
    "transaction_id" TEXT NOT NULL PRIMARY KEY,
    "account_id" TEXT NOT NULL,
    "account_name" TEXT NOT NULL,
    "business_id" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "vendor_id" TEXT,
    "vendor_name" TEXT,
    "paired_transaction_id" TEXT,
    "description" TEXT NOT NULL,
    "needs_client_review" BOOLEAN NOT NULL,
    CONSTRAINT "transaction_to_be_reviewed_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "business" ("business_id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "transaction_to_be_reviewed_business_id_vendor_id_fkey" FOREIGN KEY ("business_id", "vendor_id") REFERENCES "vendor" ("business_id", "vendor_id") ON DELETE RESTRICT ON UPDATE RESTRICT
);

-- CreateTable
CREATE TABLE "transaction_to_be_reviewed_category_split" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "transaction_id" TEXT NOT NULL,
    "business_id" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,
    "amount" DECIMAL NOT NULL,
    CONSTRAINT "transaction_to_be_reviewed_category_split_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "transaction_to_be_reviewed" ("transaction_id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "transaction_to_be_reviewed_category_split_business_id_category_id_fkey" FOREIGN KEY ("business_id", "category_id") REFERENCES "categories" ("business_id", "category_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "reviewed_result_transactions" (
    "transaction_id" TEXT NOT NULL PRIMARY KEY,
    "account_id" TEXT NOT NULL,
    "account_name" TEXT NOT NULL,
    "business_id" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "vendor_id" TEXT,
    "vendor_name" TEXT,
    "paired_transaction_id" TEXT,
    "description" TEXT NOT NULL,
    CONSTRAINT "reviewed_result_transactions_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "business" ("business_id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "reviewed_result_transactions_business_id_vendor_id_fkey" FOREIGN KEY ("business_id", "vendor_id") REFERENCES "vendor" ("business_id", "vendor_id") ON DELETE RESTRICT ON UPDATE RESTRICT
);

-- CreateTable
CREATE TABLE "reviewed_result_transactions_category_split" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "transaction_id" TEXT NOT NULL,
    "business_id" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,
    "amount" DECIMAL NOT NULL,
    CONSTRAINT "reviewed_result_transactions_category_split_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "reviewed_result_transactions" ("transaction_id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "reviewed_result_transactions_category_split_business_id_category_id_fkey" FOREIGN KEY ("business_id", "category_id") REFERENCES "categories" ("business_id", "category_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "needs_client_review_transactions" (
    "transaction_id" TEXT NOT NULL PRIMARY KEY,
    "account_id" TEXT NOT NULL,
    "account_name" TEXT NOT NULL,
    "business_id" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "vendor_id" TEXT,
    "vendor_name" TEXT,
    "paired_transaction_id" TEXT,
    "description" TEXT NOT NULL,
    CONSTRAINT "needs_client_review_transactions_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "business" ("business_id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "needs_client_review_transactions_business_id_vendor_id_fkey" FOREIGN KEY ("business_id", "vendor_id") REFERENCES "vendor" ("business_id", "vendor_id") ON DELETE RESTRICT ON UPDATE RESTRICT
);

-- CreateTable
CREATE TABLE "needs_client_review_transactions_category_split" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "transaction_id" TEXT NOT NULL,
    "business_id" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,
    "amount" DECIMAL NOT NULL,
    CONSTRAINT "needs_client_review_transactions_category_split_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "needs_client_review_transactions" ("transaction_id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "needs_client_review_transactions_category_split_business_id_category_id_fkey" FOREIGN KEY ("business_id", "category_id") REFERENCES "categories" ("business_id", "category_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "transaction_to_be_reviewed_business_id_idx" ON "transaction_to_be_reviewed"("business_id");

-- CreateIndex
CREATE INDEX "transaction_to_be_reviewed_business_id_vendor_id_idx" ON "transaction_to_be_reviewed"("business_id", "vendor_id");

-- CreateIndex
CREATE INDEX "transaction_to_be_reviewed_category_split_transaction_id_idx" ON "transaction_to_be_reviewed_category_split"("transaction_id");

-- CreateIndex
CREATE INDEX "transaction_to_be_reviewed_category_split_business_id_category_id_idx" ON "transaction_to_be_reviewed_category_split"("business_id", "category_id");

-- CreateIndex
CREATE INDEX "reviewed_result_transactions_business_id_idx" ON "reviewed_result_transactions"("business_id");

-- CreateIndex
CREATE INDEX "reviewed_result_transactions_business_id_vendor_id_idx" ON "reviewed_result_transactions"("business_id", "vendor_id");

-- CreateIndex
CREATE INDEX "reviewed_result_transactions_category_split_transaction_id_idx" ON "reviewed_result_transactions_category_split"("transaction_id");

-- CreateIndex
CREATE INDEX "reviewed_result_transactions_category_split_business_id_category_id_idx" ON "reviewed_result_transactions_category_split"("business_id", "category_id");

-- CreateIndex
CREATE INDEX "needs_client_review_transactions_business_id_idx" ON "needs_client_review_transactions"("business_id");

-- CreateIndex
CREATE INDEX "needs_client_review_transactions_business_id_vendor_id_idx" ON "needs_client_review_transactions"("business_id", "vendor_id");

-- CreateIndex
CREATE INDEX "needs_client_review_transactions_category_split_transaction_id_idx" ON "needs_client_review_transactions_category_split"("transaction_id");

-- CreateIndex
CREATE INDEX "needs_client_review_transactions_category_split_business_id_category_id_idx" ON "needs_client_review_transactions_category_split"("business_id", "category_id");
