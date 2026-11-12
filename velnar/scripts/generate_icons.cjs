// Deterministic raster exports of the existing NEXORA vector mark.
const fs = require("node:fs");
const path = require("node:path");
const sharp = require("sharp");
const root = path.resolve(__dirname, "..");

(async () => {
  const source = path.join(root, "assets", "nexora-mark.svg");
  const output = path.join(root, "extension", "icons");
  fs.mkdirSync(output, { recursive: true });
  fs.copyFileSync(source, path.join(output, "nexora-mark.svg"));
  for (const size of [16, 32, 48, 128]) {
    await sharp(source, { density: 384 }).resize(size, size, { fit: "contain", background: "#00000000" }).png().toFile(path.join(output, `icon${size}.png`));
  }
  await sharp(source, { density: 192 }).resize(512, 512, { fit: "contain", background: "#00000000" }).png().toFile(path.join(root, "assets", "nexora-logo.png"));
  console.log("Generated NEXORA icons: 16, 32, 48, 128 and 512 px.");
})().catch(error => { console.error(error); process.exitCode = 1; });
