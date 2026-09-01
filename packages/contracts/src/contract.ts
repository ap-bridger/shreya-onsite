import { initContract } from "@ts-rest/core";
import {
  businessIdQuerySchema,
  businessesResponseSchema,
  categoriesResponseSchema,
  submitResultsBodySchema,
  submitResultsResponseSchema,
  transactionsResponseSchema,
  vendorsResponseSchema,
} from "./schemas";

const c = initContract();

export const contract = c.router({
  getBusinesses: {
    method: "GET",
    path: "/businesses",
    responses: {
      200: businessesResponseSchema,
    },
  },
  getTransactions: {
    method: "GET",
    path: "/transactions",
    query: businessIdQuerySchema,
    responses: {
      200: transactionsResponseSchema,
    },
  },
  getVendors: {
    method: "GET",
    path: "/vendors",
    query: businessIdQuerySchema,
    responses: {
      200: vendorsResponseSchema,
    },
  },
  getCategories: {
    method: "GET",
    path: "/categories",
    query: businessIdQuerySchema,
    responses: {
      200: categoriesResponseSchema,
    },
  },
  submitResults: {
    method: "POST",
    path: "/results",
    body: submitResultsBodySchema,
    responses: {
      200: submitResultsResponseSchema,
    },
  },
});
