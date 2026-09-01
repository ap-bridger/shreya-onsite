import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@bridger/contracts", "@ts-rest/react-query"],
};

export default nextConfig;
