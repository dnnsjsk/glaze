import * as docs from "@/content/docs/meta.json";

export default function sitemap() {
  const entries: {
    url: string;
    lastModified: Date;
  }[] = [];

  const d = {
    lastModified: new Date(),
  };

  entries.push({
    url: "https://glaze.dev",
    ...d,
  });

  (
    docs as unknown as {
      default: {
        pages: string[];
      };
    }
  ).default.pages.forEach((page) => {
    if (page.startsWith("---")) return;

    if (page.startsWith("index")) {
      entries.push({
        url: `https://glaze.dev/docs/`,
        ...d,
      });
      return;
    }

    entries.push({
      url: `https://glaze.dev/docs/${page}/`,
      ...d,
    });
  });

  return entries;
}
