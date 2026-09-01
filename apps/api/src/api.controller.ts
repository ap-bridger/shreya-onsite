import { Controller, Logger } from "@nestjs/common";
import { contract } from "@bridger/contracts";
import { TsRestHandler, tsRestHandler } from "@ts-rest/nest";
import {
  businesses,
  categoriesFor,
  submittedResults,
  transactionsFor,
  vendorsFor,
} from "./fixtures";

@Controller()
export class ApiController {
  private readonly logger = new Logger(ApiController.name);

  @TsRestHandler(contract)
  handler() {
    return tsRestHandler(contract, {
      getBusinesses: async () => ({
        status: 200 as const,
        body: { businesses },
      }),
      getTransactions: async ({ query }) => ({
        status: 200 as const,
        body: { transactions: transactionsFor(query.business_id) },
      }),
      getVendors: async ({ query }) => ({
        status: 200 as const,
        body: { vendors: vendorsFor(query.business_id) },
      }),
      getCategories: async ({ query }) => ({
        status: 200 as const,
        body: { categories: categoriesFor(query.business_id) },
      }),
      submitResults: async ({ body }) => {
        submittedResults.push({
          business_id: body.business_id,
          transactions: body.transactions,
          received_at: new Date().toISOString(),
        });
        this.logger.log(
          `Stored ${body.transactions.length} result(s) for ${body.business_id}`,
        );
        return { status: 200 as const, body: { ok: true as const } };
      },
    });
  }
}
