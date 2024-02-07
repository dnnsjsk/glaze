const fs = require("fs");
const terser = require("terser");
const path = require("path");

async function minifyFile(filePath) {
  const originalCode = fs.readFileSync(filePath, "utf8");
  const minified = await terser.minify(originalCode, {
    compress: true,
    mangle: {},
    output: {
      comments: false,
    },
  });
  fs.writeFileSync(filePath, minified.code, "utf8");
}

minifyFile("./dist/index.es.js");

[
  {
    from: path.join(__dirname, "../../../README.md"),
    to: path.join(__dirname, "../README.md"),
  },
  {
    from: path.join(__dirname, "../../../CHANGELOG.md"),
    to: path.join(__dirname, "../../../docs/pages/documentation/changelog.mdx"),
  },
].forEach(({ from, to }) => {
  fs.copyFile(from, to, (err) => {
    if (err) {
      console.error("Error occurred:", err);
      return;
    }
    console.log(`${from} was copied successfully.`);
  });
});
