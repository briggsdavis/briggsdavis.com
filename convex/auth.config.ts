import { AuthConfig } from "convex/server"

const config: AuthConfig = {
  providers: [
    {
      domain: process.env.CONVEX_SITE_URL!,
      applicationID: "convex",
    },
  ],
}

export default config
