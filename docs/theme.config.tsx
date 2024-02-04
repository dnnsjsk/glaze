import React from "react";
import { DocsThemeConfig } from "nextra-theme-docs";

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
  footer: {
    text: "Glaze",
  },
};

export default config;
