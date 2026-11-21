globalThis.NEXORA = globalThis.NEXORA || {};

NEXORA.Validator = {
  MAX_LENGTH: 50000,
  MAX_IMPORT_BYTES: 2000000,
  isRecord(value) { return value !== null && typeof value === "object" && !Array.isArray(value); },
  repositoryKey(value) {
    return typeof value === "string" && /^[a-z0-9-]{1,39}\/[a-z0-9_.-]{1,100}$/i.test(value) && !/\/(?:\.|\.\.)$/.test(value)
      ? value.toLowerCase() : null;
  },
  validateCss(cssText) {
    if (typeof cssText !== "string") return { valid: false, errors: ["CSS must be text."] };
    const errors = [];
    if (cssText.length > this.MAX_LENGTH) errors.push("CSS must be under 50,000 characters.");
    const structural = cssText.replace(/\/\*[\s\S]*?\*\//g, "").replace(/"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/g, "");
    let depth = 0;
    for (const char of structural) {
      if (char === "{") depth++;
      if (char === "}" && --depth < 0) break;
    }
    if (depth !== 0) errors.push("CSS braces are not balanced.");
    // Decode CSS escapes so escaped imports and URLs cannot bypass validation.
    // CSS escapes may consume a newline, allowing a blocked token such as
    // `url` to be split across lines (`u\\\nrl`). Join continuations before
    // decoding ordinary escapes so the policy check sees the parsed token.
    const decoded = cssText.replace(/\\(?:\r\n|\n|\r)/g, "").replace(/\\([0-9a-f]{1,6})\s?/gi, (_, hex) => String.fromCodePoint(Math.min(parseInt(hex, 16), 0x10ffff))).replace(/\\([^\r\n])/g, "$1").replace(/\/\*[\s\S]*?\*\//g, "");
    if (/@import|@font-face|url\s*\(|image-set\s*\(|javascript\s*:|expression\s*\(|-moz-binding|<\/?(?:script|style)/i.test(decoded)) {
      errors.push("External resources and executable content are not allowed. Use local CSS rules only.");
    }
    return { valid: errors.length === 0, errors };
  },
  sanitize(cssText) { return cssText; },
  isColor(value) {
    if (typeof value !== "string") return false;
    if (/^#(?:[\da-f]{3}|[\da-f]{6})$/i.test(value)) return true;
    const rgba = value.match(/^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})(?:\s*,\s*(0(?:\.\d+)?|1(?:\.0+)?))?\s*\)$/i);
    return !!rgba && rgba.slice(1, 4).every(v => Number(v) <= 255) && (/^rgba/i.test(value) === (rgba[4] !== undefined));
  },
  theme(input, fallbackColors = NEXORA.getThemeById("dark").colors) {
    if (!this.isRecord(input)) throw new Error("Theme must be a JSON object.");
    const source = input.colors === undefined ? input : input.colors;
    if (!this.isRecord(source)) throw new Error("Theme colors must be an object.");
    const colors = { ...fallbackColors };
    let found = 0;
    for (const key of Object.keys(NEXORA.CSS_VAR_MAP)) {
      if (!Object.hasOwn(source, key)) continue;
      if (!this.isColor(source[key])) throw new Error(`Invalid color: ${key}. Use hex or rgb/rgba.`);
      if ((key === "accent" || key === "accentSecondary") && !/^#/.test(source[key])) throw new Error(`${key} must be a hex color.`);
      colors[key] = source[key];
      found++;
    }
    if (!found) throw new Error("No recognized theme colors were found.");
    if (input.name !== undefined && (typeof input.name !== "string" || input.name.length > 80)) throw new Error("Theme name must be under 80 characters.");
    return { name: input.name?.trim() || "My Theme", colors };
  },
  settings(input, { strict = true } = {}) {
    if (!this.isRecord(input)) throw new Error("Settings must be a JSON object.");
    const out = structuredClone(NEXORA.DEFAULT_SETTINGS);
    const accept = (valid, message, write) => {
      if (valid) write();
      else if (strict) throw new Error(message);
    };
    if (Object.hasOwn(input, "language")) accept(["en", "fa"].includes(input.language), "Unknown interface language.", () => out.language = input.language);
    if (Object.hasOwn(input, "personalThemes")) {
      accept(Array.isArray(input.personalThemes) && input.personalThemes.length <= NEXORA.PERSONAL_THEME_LIMIT, "Save up to 50 personal themes.", () => {
        const ids = new Set();
        for (const item of input.personalThemes) {
          try {
            if (!this.isRecord(item) || !/^personal-[a-z0-9-]{1,70}$/.test(item.id) || ids.has(item.id)) throw new Error("Invalid or duplicate personal theme ID.");
            const theme = this.theme(item); ids.add(item.id);
            out.personalThemes.push({ id: item.id, ...theme });
          } catch (error) { if (strict) throw error; }
        }
      });
    }
    if (Object.hasOwn(input, "repositoryThemes")) {
      const rules = input.repositoryThemes;
      accept(this.isRecord(rules) && Object.keys(rules).length <= NEXORA.REPOSITORY_THEME_LIMIT, "Save up to 100 repository themes.", () => {
        for (const [name, palette] of Object.entries(rules)) {
          try {
            const key = this.repositoryKey(name);
            if (!key || Object.hasOwn(out.repositoryThemes, key)) throw new Error("Invalid or duplicate repository name.");
            out.repositoryThemes[key] = this.theme(palette);
          } catch (error) { if (strict) throw error; }
        }
      });
    }
    if (input.builderDraft !== undefined && input.builderDraft !== null) {
      try {
        const theme = this.theme(input.builderDraft);
        const editingId = input.builderDraft.editingId ?? null;
        if (editingId !== null && !out.personalThemes.some(theme => theme.id === editingId)) throw new Error("Draft refers to an unknown personal theme.");
        out.builderDraft = { ...theme, editingId };
      } catch (error) { if (strict) throw error; }
    }
    if (Object.hasOwn(input, "appearanceHistory")) {
      accept(Array.isArray(input.appearanceHistory) && input.appearanceHistory.length <= NEXORA.HISTORY_LIMIT, "Invalid appearance history.", () => {
        for (const entry of input.appearanceHistory) {
          try {
            if (!this.isRecord(entry) || !Number.isFinite(entry.at) || entry.at < 0 || entry.at > 8640000000000000 - NEXORA.HISTORY_LIMIT || !this.isRecord(entry.appearance)) throw new Error("Invalid history entry.");
            const picked = Object.fromEntries(NEXORA.APPEARANCE_KEYS.filter(key => Object.hasOwn(entry.appearance, key)).map(key => [key, entry.appearance[key]]));
            const normalized = this.settings(picked, { strict });
            out.appearanceHistory.push({ at: entry.at, appearance: Object.fromEntries(NEXORA.APPEARANCE_KEYS.map(key => [key, normalized[key]])) });
          } catch (error) { if (strict) throw error; }
        }
      });
    }
    for (const key of Object.keys(out)) {
      if (!Object.hasOwn(input, key)) continue;
      if (typeof out[key] === "boolean") accept(typeof input[key] === "boolean", `${key} must be true or false.`, () => out[key] = input[key]);
    }
    for (const key of ["activeThemeId", "autoDarkModeLightTheme", "autoDarkModeDarkTheme"]) {
      if (Object.hasOwn(input, key)) accept(typeof input[key] === "string" && !!NEXORA.getThemeById(input[key]), `Unknown theme: ${key}.`, () => out[key] = input[key]);
    }
    if (Object.hasOwn(input, "favoriteThemeIds")) {
      accept(Array.isArray(input.favoriteThemeIds) && input.favoriteThemeIds.every(id => typeof id === "string" && (NEXORA.getThemeById(id) || out.personalThemes.some(theme => theme.id === id))), "Favorites must be a list of known theme IDs.", () => out.favoriteThemeIds = [...new Set(input.favoriteThemeIds)]);
    }
    for (const group of ["layout", "typography", "componentOverrides"]) {
      if (!Object.hasOwn(input, group)) continue;
      if (!this.isRecord(input[group])) { accept(false, `${group} must be an object.`, () => {}); continue; }
      for (const key of Object.keys(out[group])) {
        if (!Object.hasOwn(input[group], key)) continue;
        const value = input[group][key];
        let valid;
        if (group === "componentOverrides") valid = typeof value === "boolean";
        else if (["fontFamily", "codeFont"].includes(key)) valid = typeof value === "string" && value.length <= 160 && /^[\p{L}\p{N}\s,'"_-]*$/u.test(value);
        else if (key === "codeTabSize") valid = [0, 2, 4, 8].includes(value);
        else {
          const ranges = { borderRadius: [0, 20], shadowIntensity: [0, 100], fontSize: [11, 20], lineHeight: [1.1, 2], fontWeight: [300, 700] };
          valid = typeof value === "number" && Number.isFinite(value) && value >= ranges[key][0] && value <= ranges[key][1];
        }
        accept(valid, `Invalid setting: ${group}.${key}.`, () => out[group][key] = value);
      }
    }
    if (Object.hasOwn(input, "customCss")) {
      const result = this.validateCss(input.customCss);
      accept(result.valid, result.errors.join(" "), () => out.customCss = input.customCss);
    }
    if (input.customTheme !== undefined && input.customTheme !== null) {
      try { out.customTheme = this.theme(input.customTheme); } catch (error) { if (strict) throw error; }
    }
    if (!out.customTheme) out.customThemeApplied = false;
    if (!out.customCss) out.customCssEnabled = false;
    return out;
  }
};
