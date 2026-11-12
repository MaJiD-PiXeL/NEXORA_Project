globalThis.NEXORA = globalThis.NEXORA || {};

// Shared by the full library and the compact popup; never changes saved settings.
NEXORA.Catalog = {
  opaqueHex(color) {
    if (typeof color !== "string") return null;
    if (/^#[\da-f]{3}(?:[\da-f]{3})?$/i.test(color)) return color;
    const rgb = color.match(/^rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i) || color.match(/^rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*1(?:\.0+)?\s*\)$/i);
    return rgb && rgb.slice(1).every(channel => Number(channel) <= 255) ? gsRgbToHex(...rgb.slice(1).map(Number)) : null;
  },
  appearance(theme) { const hex = this.opaqueHex(theme.colors.background); return hex ? (gsRelLuminance(hex) > .179 ? "light" : "dark") : null; },
  themes(settings) { return [...NEXORA.PRESET_THEMES, ...settings.personalThemes.map(theme => ({ ...theme, category: "personal" }))]; },
  find(id, settings) { return this.themes(settings).find(theme => theme.id === id); },
  isActive(theme, settings) {
    if (settings.customThemeApplied && !settings.autoDarkMode) return theme.category === "personal" && theme.name === settings.customTheme?.name && JSON.stringify(theme.colors) === JSON.stringify(settings.customTheme.colors);
    return NEXORA.UI.activeThemeId(settings) === theme.id;
  },
  filter(themes, { query = "", category = "all", appearance = "all", sort = "default", favorites = [] } = {}) {
    const words = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
    const result = themes.filter(theme => {
      const categoryName = NEXORA.I18n?.t(theme.category) || theme.category;
      const text = `${theme.name} ${theme.category} ${categoryName} ${theme.tagline || ""}`.toLowerCase();
      const mode = this.appearance(theme);
      return words.every(word => text.includes(word)) &&
        (category === "all" || (category === "favorites" ? favorites.includes(theme.id) : theme.category === category)) &&
        (appearance === "all" || mode === appearance);
    });
    const rank = theme => ["personal", "official", "community", "gaming", "vivid", "cinematic"].indexOf(theme.category);
    if (sort === "default") result.sort((a, b) => rank(a) - rank(b));
    if (sort === "name") result.sort((a, b) => a.name.localeCompare(b.name));
    if (sort === "favorites") result.sort((a, b) => Number(favorites.includes(b.id)) - Number(favorites.includes(a.id)) || rank(a) - rank(b));
    return result;
  },
  snapshot(settings) {
    return Object.fromEntries(["activeThemeId", "customThemeApplied", "customTheme", "autoDarkMode"].map(key => [key, structuredClone(settings[key])]));
  },
  paint(element, colors) {
    for (const [key, value] of Object.entries(colors)) element.style.setProperty(`--preview-${key}`, value);
  },
  contrast(foreground, background) {
    // Translucent colors depend on the surface beneath them; don't report a misleading ratio.
    const a = this.opaqueHex(foreground), b = this.opaqueHex(background);
    return a && b ? gsContrastRatio(a, b) : null;
  }
};
