import React from "react";
import { DocsThemeConfig, useConfig } from "nextra-theme-docs";

const config: DocsThemeConfig = {
  logo: (
    <span className="text-2xl font-black tracking-tight text-black dark:text-white">
      🍩&nbsp;&nbsp;Glaze
    </span>
  ),
  project: {
    link: "https://github.com/dnnsjsk/glaze",
  },
  search: {
    placeholder: "Search",
  },
  useNextSeoProps: () => {
    const { title } = useConfig();

    return {
      openGraph: {
        title: title === "Index" ? "Glaze" : `${title} - Glaze`,
      },
    };
  },
  docsRepositoryBase: "https://github.com/dnnsjsk/glaze/blob/main/docs",
  head: function useHead() {
    const { title } = useConfig();
    const socialCard = "https://glaze.dev/og.jpg";
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
        <title>{title !== "Index" ? title + " – Glaze" : "Glaze"}</title>
      </>
    );
  },
  footer: {
    text: (
      <p className="mx-auto text-center">
        MIT License © 2024{" "}
        <a href="https://dennn.is" target="_blank" className="link">
          Dennis Josek
        </a>
      </p>
    ),
  },
};

export default config;
