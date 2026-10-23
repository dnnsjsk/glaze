import { copyFile, readFile, writeFile } from "node:fs/promises"

// npm needs absolute image links; the root README remains the editable copy.
const readme = await readFile(
  new URL("../../../README.md", import.meta.url),
  "utf8"
)
await writeFile(
  new URL("../README.md", import.meta.url),
  readme
    .replaceAll(
      "./.github/",
      "https://raw.githubusercontent.com/inline0/glaze/main/.github/"
    )
    .replaceAll(
      "](packages/",
      "](https://github.com/inline0/glaze/blob/main/packages/"
    )
    .replaceAll("](apps/", "](https://github.com/inline0/glaze/blob/main/apps/")
    .replaceAll("](docs/", "](https://github.com/inline0/glaze/blob/main/docs/")
    .replaceAll(
      "](CHANGELOG.md)",
      "](https://github.com/inline0/glaze/blob/main/CHANGELOG.md)"
    )
)
await copyFile(
  new URL("../../../LICENSE", import.meta.url),
  new URL("../LICENSE", import.meta.url)
)
