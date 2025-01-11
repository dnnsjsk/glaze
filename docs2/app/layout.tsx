import "./global.css";
import { RootProvider } from "fumadocs-ui/provider";
import localFont from "next/font/local";
import type { ReactNode } from "react";

const inter = localFont({
  src: "../fonts/inter.woff2",
});

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={inter.className} suppressHydrationWarning>
      <body className="flex flex-col min-h-screen" suppressHydrationWarning>
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
