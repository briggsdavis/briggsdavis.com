import { NextConfig } from "next"

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL

if (convexUrl === undefined) {
  throw new Error("NEXT_PUBLIC_CONVEX_URL is required")
}

const config: NextConfig = {
  reactCompiler: true,
  experimental: {
    useTypeScriptCli: true,
    viewTransition: true,
  },
  images: {
    remotePatterns: [new URL("/api/storage/**", convexUrl)],
  },
}

export default config
