import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server"
import { Metadata } from "next"
import { Gelasio, Inter, Workbench } from "next/font/google"
import { ReactNode } from "react"
import { SITE_DESCRIPTION, SITE_EMAIL, SITE_NAME, SITE_URL } from "~/lib/site"
// oxlint-disable-next-line import/no-unassigned-import
import "~/globals.css"

const serif = Gelasio({ variable: "--font-serif-source" })
const sans = Inter({ variable: "--font-sans-source" })
const fun = Workbench({ variable: "--font-fun-source" })

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${SITE_NAME} | Web Design & Development`, template: `%s | ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  alternates: { canonical: "/" },
  icons: {
    icon: "/favicon.ico",
    apple: "/logo.png",
  },
  openGraph: {
    title: `${SITE_NAME} | Web Design & Development`,
    description: SITE_DESCRIPTION,
    url: "/",
    siteName: SITE_NAME,
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} | Web Design & Development`,
    description: SITE_DESCRIPTION,
  },
}

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: SITE_NAME,
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/logo.png`,
      },
      email: SITE_EMAIL,
      description: SITE_DESCRIPTION,
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      description: SITE_DESCRIPTION,
      publisher: { "@id": `${SITE_URL}/#organization` },
    },
  ],
}
const structuredDataHtml = {
  __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
}

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <ConvexAuthNextjsServerProvider>
      <html lang="en" className={serif.variable + " " + sans.variable + " " + fun.variable}>
        <body className="flex min-h-dvh flex-col antialiased">
          <main className="grow">{children}</main>

          <script type="application/ld+json" dangerouslySetInnerHTML={structuredDataHtml} />
        </body>
      </html>
    </ConvexAuthNextjsServerProvider>
  )
}
