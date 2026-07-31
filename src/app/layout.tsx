import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server"
import { Metadata } from "next"
import { Gelasio, Inter } from "next/font/google"
import { ReactNode } from "react"
// oxlint-disable-next-line import/no-unassigned-import
import "~/globals.css"

const serif = Gelasio({ variable: "--font-serif-source" })
const sans = Inter({ variable: "--font-sans-source" })

export const metadata: Metadata = {
  metadataBase: new URL("https://briggsdavis.com"),
  title: { default: "Briggs Davis", template: "%s • Briggs Davis" },
  description: "Briggs Davis is a web development firm focused on clear, durable websites.",
  openGraph: {
    siteName: "Briggs Davis",
    type: "website",
  },
}

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <ConvexAuthNextjsServerProvider>
      <html lang="en" className={serif.variable + " " + sans.variable}>
        <body className="flex min-h-dvh flex-col antialiased">
          <main className="grow">{children}</main>
        </body>
      </html>
    </ConvexAuthNextjsServerProvider>
  )
}
