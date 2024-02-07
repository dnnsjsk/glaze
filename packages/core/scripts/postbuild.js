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

fs.copyFile(
  path.join(__dirname, "../../../README.md"),
  path.join(__dirname, "../README.md"),
  (err) => {
    if (err) {
      console.error("Error occurred:", err);
      return;
    }
    console.log("README.md was copied successfully.");
  },
);
