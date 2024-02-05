import React from "react";
import { DocsThemeConfig, useConfig } from "nextra-theme-docs";
import { useRouter } from "next/router";

const config: DocsThemeConfig = {
  logo: (
    <span className="text-2xl font-black tracking-tight">
      🍩&nbsp;&nbsp;Glaze
    </span>
  ),
  project: {
    link: "https://github.com/dnnsjsk/glaze",
  },
  docsRepositoryBase: "https://github.com/shuding/nextra-docs-template",
  head: function useHead() {
    const { title } = useConfig();
    const socialCard = "https://glaze.dev/og.jpeg";
    return (
      <>
        <link rel="preconnect" href="https://rsms.me/" />
        <link rel="stylesheet" href="https://rsms.me/inter/inter.css" />
        <meta name="msapplication-TileColor" content="#fff" />
        <meta name="theme-color" content="#fff" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta httpEquiv="Content-Language" content="en" />
        <meta
          name="description"
          content="The utility-based animation library for the web."
        />
        <meta
          name="og:description"
          content="The utility-based animation library for the web."
        />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content={socialCard} />
        <meta name="twitter:site:domain" content="glaze.dev" />
        <meta name="twitter:url" content="https://glaze.dev" />
        <meta
          name="og:title"
          content={title ? title + " – Glaze" : "Glaze"}
        />
        <meta name="og:image" content={socialCard} />
        <meta name="apple-mobile-web-app-title" content="Nextra" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="/favicon.png" type="image/png" />
      </>
    );
  },
  footer: {
    text: "Glaze",
  },
};

export default config;
