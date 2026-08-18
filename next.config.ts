import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  outputFileTracingRoot: __dirname,
  // Serwist always attaches a `webpack()` config function (used for the real
  // production build via `next build --webpack`), which Turbopack otherwise
  // flags as a likely mistake. `disable` above already no-ops it for `next dev`.
  turbopack: {},
};

export default withSerwist(nextConfig);
