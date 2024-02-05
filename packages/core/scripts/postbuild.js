const fs = require("fs");
const terser = require("terser");

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
