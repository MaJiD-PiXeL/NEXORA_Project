const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const scope = vm.createContext({ structuredClone });
for (const file of ["utils/constants.js", "themes/presets.js", "utils/validator.js", "utils/catalog.js", "utils/palette.js", "utils/i18n.js"]) {
  vm.runInContext(fs.readFileSync(path.join(__dirname, "../extension", file), "utf8"), scope, { filename: file });
}
const { Palette, Validator, I18n, PRESET_THEMES } = scope.NEXORA;

test("seed palettes produce valid, readable light and dark themes for extreme and intermediate seeds", () => {
  for (const seed of ["#000000", "#ffffff", "#777777", "#00ff00", "#ff0000", "#0000ff", "#7c9dff"]) {
    for (const mode of ["light", "dark"]) {
      const colors = Palette.generate(seed, mode);
      assert.equal(Validator.theme({ colors }).colors.accent, seed);
      for (const check of Palette.audit(colors)) assert.ok(check.ratio >= 4.5, `${seed}/${mode}: ${check.label} ${check.ratio}`);
    }
  }
});

test("readability repairs respect all backgrounds sharing a foreground and avoid transparent claims", () => {
  const colors = { ...PRESET_THEMES[0].colors, textPrimary: PRESET_THEMES[0].colors.background };
  const repair = Palette.suggest(colors, "textPrimary"); assert.ok(repair);
  assert.ok(Palette.audit({ ...colors, textPrimary: repair }).filter(row => row.key === "textPrimary").every(row => row.ratio >= 4.5));
  const transparent = { ...colors, background: "rgba(0,0,0,0.5)" };
  assert.equal(Palette.audit(transparent)[0].ratio, null); assert.equal(Palette.suggest(transparent, "textPrimary"), null);
  assert.equal(Palette.diff({ ...colors, success: "rgba(0,255,0,0.5)" }).addition, null);
  assert.ok(Palette.audit(colors).some(row => row.label === "Added lines"));
  assert.ok(Palette.audit(colors).some(row => row.label === "Deleted lines"));
});

test("localization handles dynamic labels and preserves English and user-provided names", () => {
  I18n.language = "fa";
  assert.equal(I18n.t("Theme Builder"), "ساخت تم");
  assert.equal(I18n.t("Apply My palette theme"), "اعمال تم My palette");
  assert.equal(I18n.t("17 themes"), "17 تم");
  assert.equal(I18n.t("Fix Added lines"), "اصلاح خطوط اضافه‌شده");
  I18n.language = "en"; assert.equal(I18n.t("Theme Builder"), "Theme Builder");
});

test("personal library filters understand RGB backgrounds and don't classify translucent colors", () => {
  const { Catalog } = scope.NEXORA;
  const themes = [
    { id: "personal-light", name: "RGB white", category: "personal", colors: { background: "rgb(255,255,255)" } },
    { id: "personal-alpha", name: "Glass", category: "personal", colors: { background: "rgba(255,255,255,0.4)" } }
  ];
  assert.equal(Catalog.filter(themes, { appearance: "light" }).length, 1);
  assert.equal(Catalog.filter(themes, { appearance: "dark" }).length, 0);
  assert.equal(Catalog.filter(themes).length, 2);
});
