/**
 * Seeds the local database with fixed dummy data. Every value is derived from
 * the hardcoded lists below and a fixed-seed number generator, so running the
 * seed twice produces byte-identical rows.
 *
 * Layout per business: 3 accounts, 200 categories, 100 vendors. Each account
 * gets 100 rows in `transaction_to_be_reviewed`, in fixed slots:
 *   slots  0-19  empty category split, no vendor, needs_client_review = true
 *   slots 20-29  three categories, vendor id + name
 *   slots 30-39  one category, vendor name only (vendor absent from `vendor`)
 *   slots 40-44  transfers out, paired with a transfer in on the next account
 *   slots 45-49  transfers in, paired with a transfer out on the previous account
 *   slots 50-99  one category, vendor id + name
 * Pairing is mutual: both sides of a transfer carry the other's transaction id
 * and the same total amount with opposite sign (negative out, positive in).
 * Paired rows have an empty category split: the counterpart transaction is
 * their categorization. `total_amount` equals the sum of the category split
 * wherever the split is non-empty.
 *
 * `reviewed_result_transactions` and `needs_client_review_transactions` are
 * emptied and left empty.
 *
 * Run with `npm run prisma:seed`.
 */
import { PrismaClient } from "@prisma/client";
import { serializeCategorySplit, type CategorySplit } from "../src/server/modules/transactions/categorySplit.ts";

const prisma = new PrismaClient();

const BUSINESSES = [
  { businessId: "biz_acme_bakery", businessName: "Acme Bakery" },
  { businessId: "biz_harbor_logistics", businessName: "Harbor Logistics LLC" },
  { businessId: "biz_summit_dental", businessName: "Summit Dental Group" },
];

const ACCOUNTS = [
  { accountKey: "checking", accountName: "Business Checking" },
  { accountKey: "savings", accountName: "Business Savings" },
  { accountKey: "card", accountName: "Company Credit Card" },
];

const CATEGORY_NAMES = [
  "Sales Revenue", "Service Revenue", "Consulting Income", "Subscription Income", "Interest Income",
  "Rental Income", "Commission Income", "Refunds Received", "Grant Income", "Dividend Income",
  "Royalty Income", "Late Fee Income", "Shipping Income", "Discounts Taken", "Gain on Asset Sale",
  "Tips Income", "Membership Income", "Licensing Income", "Sponsorship Income", "Other Income",
  "Cost of Goods Sold", "Raw Materials", "Direct Labor", "Freight In", "Packaging Supplies",
  "Subcontractor Costs", "Merchant Fees", "Inventory Shrinkage", "Production Supplies", "Manufacturing Overhead",
  "Import Duties", "Purchase Discounts", "Purchase Returns", "Product Samples", "Warehouse Labor",
  "Advertising", "Online Advertising", "Print Advertising", "Trade Shows", "Promotional Materials",
  "Sponsorships", "Public Relations", "Marketing Consultants", "Website Hosting", "Domain Registration",
  "Email Marketing", "Social Media Tools", "Photography", "Video Production", "Graphic Design",
  "Rent", "Office Rent", "Warehouse Rent", "Equipment Rental", "Vehicle Lease",
  "Storage Rent", "Parking", "Common Area Maintenance", "Property Tax", "Leasehold Improvements",
  "Utilities", "Electricity", "Gas", "Water", "Trash Removal",
  "Internet", "Telephone", "Mobile Phone", "Security Monitoring", "HVAC Service",
  "Salaries and Wages", "Hourly Wages", "Overtime", "Bonuses", "Commissions Paid",
  "Payroll Taxes", "Workers Compensation", "Health Insurance", "Dental Insurance", "Vision Insurance",
  "Retirement Contributions", "Life Insurance", "Disability Insurance", "Payroll Processing Fees", "Recruiting",
  "Employee Training", "Employee Meals", "Employee Gifts", "Uniforms", "Staff Events",
  "Office Supplies", "Printing and Copying", "Postage", "Shipping Supplies", "Kitchen Supplies",
  "Cleaning Supplies", "Janitorial Service", "Furniture", "Small Tools", "Signage",
  "Computer Hardware", "Computer Software", "SaaS Subscriptions", "Cloud Services", "IT Support",
  "Data Backup", "Cybersecurity", "Point of Sale System", "Accounting Software", "CRM Software",
  "Legal Fees", "Accounting Fees", "Bookkeeping Fees", "Tax Preparation", "Consulting Fees",
  "Payroll Service Fees", "Business Coaching", "Notary Fees", "Registered Agent Fees", "Audit Fees",
  "Bank Fees", "Credit Card Processing Fees", "Wire Transfer Fees", "Loan Interest", "Line of Credit Interest",
  "Late Payment Fees", "Overdraft Fees", "Foreign Transaction Fees", "ATM Fees", "Finance Charges",
  "Business Insurance", "General Liability Insurance", "Property Insurance", "Auto Insurance", "Professional Liability Insurance",
  "Cyber Insurance", "Umbrella Insurance", "Business Interruption Insurance", "Equipment Insurance", "Key Person Insurance",
  "Travel", "Airfare", "Lodging", "Ground Transportation", "Rental Cars",
  "Meals While Traveling", "Per Diem", "Conference Fees", "Mileage Reimbursement", "Tolls",
  "Meals and Entertainment", "Client Meals", "Client Entertainment", "Team Lunches", "Coffee and Snacks",
  "Vehicle Expenses", "Fuel", "Vehicle Maintenance", "Vehicle Registration", "Vehicle Repairs",
  "Repairs and Maintenance", "Building Repairs", "Equipment Repairs", "Landscaping", "Pest Control",
  "Depreciation", "Amortization", "Bad Debt", "Charitable Contributions", "Dues and Subscriptions",
  "Licenses and Permits", "Continuing Education", "Books and Reference", "Professional Memberships", "Trade Publications",
  "Sales Tax Paid", "State Income Tax", "Federal Income Tax", "Franchise Tax", "Excise Tax",
  "Owner Draw", "Owner Contribution", "Shareholder Distribution", "Loan Principal", "Loan Proceeds",
  "Equipment Purchase", "Vehicle Purchase", "Building Purchase", "Land Purchase", "Intangible Asset Purchase",
  "Inventory Purchases", "Inventory Adjustment", "Gift Card Liability", "Loyalty Program Costs", "Returns and Allowances",
  "Miscellaneous Expense", "Petty Cash", "Reconciliation Discrepancies", "Uncategorized Expense", "Transfers Between Accounts",
];

const VENDOR_NAMES = [
  "Blue Ridge Office Supply", "Northwind Paper Co", "Cascade Coffee Roasters", "Ironwood Hardware", "Lakeside Printing",
  "Pioneer Packaging", "Summit Cloud Services", "Granite Peak Insurance", "Riverbend Utilities", "Metro Fiber Internet",
  "Harborview Cleaning", "Evergreen Landscaping", "Redwood Legal Partners", "Silverline Accounting", "Copper Kettle Catering",
  "Bright Path Staffing", "Sterling Payroll", "Atlas Freight Lines", "Meridian Logistics", "Coastal Fuel Stop",
  "Maple Street Bakery Supply", "Orchard Fresh Produce", "Harvest Moon Dairy", "Golden Grain Mills", "Sunrise Eggs",
  "Bay Area Dental Supply", "ClearView Imaging", "Precision Lab Works", "MedTech Equipment", "Pacific Sterilization",
  "Union Square Furniture", "Cobalt Computers", "Vertex Software", "Nimbus Hosting", "Keystone IT Solutions",
  "Elm Street Signage", "Skyline Advertising", "Pulse Digital Marketing", "Fathom Design Studio", "Lantern Photography",
  "Trailhead Travel", "Northstar Airlines", "Parkside Hotels", "Rapid Rideshare", "Downtown Parking Authority",
  "Beacon Security Systems", "Sentinel Alarm Co", "Guardian Pest Control", "TrueTemp HVAC", "Cornerstone Plumbing",
  "Foundry Equipment Rental", "Quarry Stone Supply", "Timberline Lumber", "Anchor Electrical", "Brightwater Plumbing Supply",
  "Fleet Auto Service", "Prime Tire Center", "Velocity Car Wash", "Interstate Tolling", "City Vehicle Registration",
  "Oakridge Bank", "First Harbor Credit Union", "Cardinal Merchant Services", "Swift Wire Transfers", "Ledger Line Finance",
  "Apex Business Coaching", "Compass Consulting Group", "Northgate Notary", "Statewide Registered Agents", "Crestline Auditors",
  "Bluebird Telecom", "Wavelength Mobile", "Ridgeline Water Co", "Emberline Gas", "Volt Electric Cooperative",
  "Paperclip Stationery", "Inkwell Print Shop", "Parcel Post Express", "Boxcar Shipping Supplies", "Crumb Kitchen Supply",
  "Sparkle Janitorial", "Fresh Linen Uniforms", "Wrench and Bolt Tools", "Signal Hill Signs", "Lumen Lighting",
  "Datavault Backup", "Shieldwall Cybersecurity", "Registry POS Systems", "Balance Books Software", "Relay CRM",
  "Learnwell Training", "Chapter House Books", "Guild Professional Association", "Trade Journal Press", "Civic Permit Office",
  "Helping Hands Foundation", "Community Food Bank", "Riverside Youth Sports", "Arts Council Fund", "Hometown Charity Drive",
];

const UNKNOWN_VENDOR_NAMES = [
  "Corner Hardware Co", "Sunny Days Florist", "The Pizza Wagon", "Quick Stop Market", "Riverfront Parking Garage",
  "Main Street Diner", "Uptown Dry Cleaners", "Two Wheels Bike Shop", "Bella Vista Cafe", "Night Owl Printing",
];

const DESCRIPTION_PREFIXES = ["POS PURCHASE", "ACH DEBIT", "CARD PAYMENT", "ONLINE PAYMENT", "CHECK PAID TO"];

const SLOTS_PER_ACCOUNT = 100;
const NEEDS_REVIEW_SLOTS = { start: 0, end: 20 };
const THREE_CATEGORY_SLOTS = { start: 20, end: 30 };
const UNKNOWN_VENDOR_SLOTS = { start: 30, end: 40 };
const TRANSFER_OUT_SLOTS = { start: 40, end: 45 };
const TRANSFER_IN_SLOTS = { start: 45, end: 50 };

const SEED_PERIOD_START = new Date("2026-06-01T12:00:00Z");
const SEED_PERIOD_DAYS = 92;

/** Linear congruential generator with a fixed seed, so reruns are identical. */
const makeRng = (seed: number) => {
  let state = seed >>> 0;
  return {
    next: () => {
      state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
      return state / 0x100000000;
    },
  };
};
type Rng = ReturnType<typeof makeRng>;

const pickIndex = (rng: Rng, length: number) => Math.floor(rng.next() * length);
const pickAmount = (rng: Rng, min: number, max: number) =>
  Math.round((min + rng.next() * (max - min)) * 100) / 100;
const sumAmounts = (split: CategorySplit) =>
  Math.round(split.reduce((total, entry) => total + entry.amount, 0) * 100) / 100;

const padId = (n: number) => String(n).padStart(3, "0");
const categoryId = (index: number) => `cat_${padId(index + 1)}`;
const vendorId = (index: number) => `ven_${padId(index + 1)}`;
const transactionId = (businessId: string, accountKey: string, slot: number) =>
  `txn_${businessId}_${accountKey}_${padId(slot)}`;
const accountId = (businessId: string, accountKey: string) => `${businessId}_acct_${accountKey}`;

const dateForSlot = (slot: number) => {
  const day = (slot * 7) % SEED_PERIOD_DAYS;
  return new Date(SEED_PERIOD_START.getTime() + day * 24 * 60 * 60 * 1000);
};

type TransactionRow = {
  transactionId: string;
  accountId: string;
  accountName: string;
  businessId: string;
  totalAmount: number;
  categorySplit: string;
  date: Date;
  vendorId: string | null;
  vendorName: string | null;
  pairedTransactionId: string | null;
  description: string;
  needsClientReview: boolean;
};

const inRange = (slot: number, range: { start: number; end: number }) =>
  slot >= range.start && slot < range.end;

const buildTransactionsForBusiness = (
  businessId: string,
  rng: Rng,
): TransactionRow[] => {
  const rows: TransactionRow[] = [];

  ACCOUNTS.forEach((account, accountIndex) => {
    const nextAccount = ACCOUNTS[(accountIndex + 1) % ACCOUNTS.length];
    const previousAccount = ACCOUNTS[(accountIndex + ACCOUNTS.length - 1) % ACCOUNTS.length];

    for (let slot = 0; slot < SLOTS_PER_ACCOUNT; slot++) {
      const base = {
        transactionId: transactionId(businessId, account.accountKey, slot),
        accountId: accountId(businessId, account.accountKey),
        accountName: account.accountName,
        businessId,
        date: dateForSlot(slot),
        pairedTransactionId: null,
        needsClientReview: false,
      };

      if (inRange(slot, NEEDS_REVIEW_SLOTS)) {
        rows.push({
          ...base,
          totalAmount: pickAmount(rng, 5, 2000),
          categorySplit: serializeCategorySplit([]),
          vendorId: null,
          vendorName: null,
          description: `${DESCRIPTION_PREFIXES[pickIndex(rng, DESCRIPTION_PREFIXES.length)]} UNKNOWN MERCHANT #${padId(slot)}`,
          needsClientReview: true,
        });
        continue;
      }

      if (inRange(slot, THREE_CATEGORY_SLOTS)) {
        const vendorIndex = pickIndex(rng, VENDOR_NAMES.length);
        const firstCategory = pickIndex(rng, CATEGORY_NAMES.length - 3);
        const split = [
          { category_id: categoryId(firstCategory), amount: pickAmount(rng, 10, 500) },
          { category_id: categoryId(firstCategory + 1), amount: pickAmount(rng, 10, 500) },
          { category_id: categoryId(firstCategory + 2), amount: pickAmount(rng, 10, 500) },
        ];
        rows.push({
          ...base,
          totalAmount: sumAmounts(split),
          categorySplit: serializeCategorySplit(split),
          vendorId: vendorId(vendorIndex),
          vendorName: VENDOR_NAMES[vendorIndex],
          description: `${DESCRIPTION_PREFIXES[pickIndex(rng, DESCRIPTION_PREFIXES.length)]} ${VENDOR_NAMES[vendorIndex].toUpperCase()}`,
        });
        continue;
      }

      if (inRange(slot, UNKNOWN_VENDOR_SLOTS)) {
        const vendorName = UNKNOWN_VENDOR_NAMES[slot - UNKNOWN_VENDOR_SLOTS.start];
        const split = [
          { category_id: categoryId(pickIndex(rng, CATEGORY_NAMES.length)), amount: pickAmount(rng, 5, 300) },
        ];
        rows.push({
          ...base,
          totalAmount: sumAmounts(split),
          categorySplit: serializeCategorySplit(split),
          vendorId: null,
          vendorName,
          description: `${DESCRIPTION_PREFIXES[pickIndex(rng, DESCRIPTION_PREFIXES.length)]} ${vendorName.toUpperCase()}`,
        });
        continue;
      }

      if (inRange(slot, TRANSFER_OUT_SLOTS)) {
        const pairSlot = slot - TRANSFER_OUT_SLOTS.start + TRANSFER_IN_SLOTS.start;
        rows.push({
          ...base,
          totalAmount: -transferAmount(slot - TRANSFER_OUT_SLOTS.start),
          categorySplit: serializeCategorySplit([]),
          vendorId: null,
          vendorName: null,
          pairedTransactionId: transactionId(businessId, nextAccount.accountKey, pairSlot),
          description: `TRANSFER TO ${nextAccount.accountName.toUpperCase()}`,
        });
        continue;
      }

      if (inRange(slot, TRANSFER_IN_SLOTS)) {
        const pairSlot = slot - TRANSFER_IN_SLOTS.start + TRANSFER_OUT_SLOTS.start;
        rows.push({
          ...base,
          totalAmount: transferAmount(slot - TRANSFER_IN_SLOTS.start),
          categorySplit: serializeCategorySplit([]),
          vendorId: null,
          vendorName: null,
          pairedTransactionId: transactionId(businessId, previousAccount.accountKey, pairSlot),
          description: `TRANSFER FROM ${previousAccount.accountName.toUpperCase()}`,
        });
        continue;
      }

      const vendorIndex = pickIndex(rng, VENDOR_NAMES.length);
      const split = [
        { category_id: categoryId(pickIndex(rng, CATEGORY_NAMES.length)), amount: pickAmount(rng, 5, 2000) },
      ];
      rows.push({
        ...base,
        totalAmount: sumAmounts(split),
        categorySplit: serializeCategorySplit(split),
        vendorId: vendorId(vendorIndex),
        vendorName: VENDOR_NAMES[vendorIndex],
        description: `${DESCRIPTION_PREFIXES[pickIndex(rng, DESCRIPTION_PREFIXES.length)]} ${VENDOR_NAMES[vendorIndex].toUpperCase()}`,
      });
    }
  });

  return rows;
};

/**
 * Both sides of a transfer pair share this magnitude, keyed by pair position.
 * The outgoing side is stored negative (money leaving the account) and the
 * incoming side positive, so a pair's totals sum to zero.
 */
const transferAmount = (pairPosition: number) => 500 * (pairPosition + 1);

const main = async () => {
  await prisma.$transaction(async (tx) => {
    await tx.reviewedResultTransaction.deleteMany();
    await tx.needsClientReviewTransaction.deleteMany();
    await tx.transactionToBeReviewed.deleteMany();
    await tx.vendor.deleteMany();
    await tx.category.deleteMany();
    await tx.business.deleteMany();

    await tx.business.createMany({ data: BUSINESSES });

    for (const [businessIndex, business] of BUSINESSES.entries()) {
      await tx.category.createMany({
        data: CATEGORY_NAMES.map((categoryName, index) => ({
          businessId: business.businessId,
          categoryId: categoryId(index),
          categoryName,
        })),
      });
      await tx.vendor.createMany({
        data: VENDOR_NAMES.map((vendorName, index) => ({
          businessId: business.businessId,
          vendorId: vendorId(index),
          vendorName,
        })),
      });
      await tx.transactionToBeReviewed.createMany({
        data: buildTransactionsForBusiness(business.businessId, makeRng(1000 + businessIndex)),
      });
    }
  });

  const counts = {
    businesses: await prisma.business.count(),
    categories: await prisma.category.count(),
    vendors: await prisma.vendor.count(),
    transactionsToBeReviewed: await prisma.transactionToBeReviewed.count(),
    reviewedResultTransactions: await prisma.reviewedResultTransaction.count(),
    needsClientReviewTransactions: await prisma.needsClientReviewTransaction.count(),
  };
  console.log("Seeded:", counts);
};

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
