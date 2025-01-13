import "./global.css";
import { RootProvider } from "fumadocs-ui/provider";
import localFont from "next/font/local";
import type { ReactNode } from "react";

const inter = localFont({
  src: "../fonts/inter.woff2",
});

const socialCard = "https://glaze.dev/og.jpg";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={inter.className} suppressHydrationWarning>
      <head>
        <meta
          name="description"
          content="The utility-based animation framework for the web."
        />
        <meta
          name="og:description"
          content="The utility-based animation framework for the web."
        />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content={socialCard} />
        <meta name="twitter:site:domain" content="glaze.dev" />
        <meta name="twitter:url" content="https://glaze.dev" />
        <meta name="og:image" content={socialCard} />
        <meta name="apple-mobile-web-app-title" content="Glaze" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="/favicon.png" type="image/png" />
        {process.env.NODE_ENV === "production" ? (
          <script
            defer
            data-domain="glaze.dev"
            src="https://plausible.io/js/script.js"
          />
        ) : null}
      </head>
      <body className="flex flex-col min-h-screen" suppressHydrationWarning>
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
