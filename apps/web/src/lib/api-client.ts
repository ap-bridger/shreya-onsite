import { initTsrReactQuery } from "@ts-rest/react-query/v5";
import { contract } from "@bridger/contracts";

export const tsr = initTsrReactQuery(contract, {
  baseUrl: "http://localhost:3001",
  baseHeaders: {},
});
