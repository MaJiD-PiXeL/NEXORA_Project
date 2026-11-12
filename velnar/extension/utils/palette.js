globalThis.NEXORA = globalThis.NEXORA || {};

// Local color arithmetic shared by the builder, review preview and tests.
NEXORA.Palette = {
  rgb(value) {
    if (/^#(?:[\da-f]{3}|[\da-f]{6})$/i.test(value)) return Object.values(gsHexToRgb(value));
    const match = String(value).match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*(1(?:\.0+)?))?\s*\)$/i);
    return match ? match.slice(1, 4).map(Number) : null;
  },
  hex(value) { const rgb = this.rgb(value); return rgb ? gsRgbToHex(...rgb) : null; },
  mix(a, b, weight) {
    const first = this.rgb(a), second = this.rgb(b);
    return first && second ? gsRgbToHex(...first.map((channel, i) => channel * weight + second[i] * (1 - weight))) : null;
  },
  diff(colors) {
    return { addition: this.mix(colors.success, colors.codeBackground, .15), deletion: this.mix(colors.error, colors.codeBackground, .15) };
  },
  audit(colors) {
    const diff = this.diff(colors);
    const pairs = [
      ["Primary text", "textPrimary", "background"], ["Primary text on cards", "textPrimary", "backgroundSecondary"],
      ["Secondary text", "textSecondary", "background"], ["Secondary text on cards", "textSecondary", "backgroundSecondary"],
      ["Muted text", "textTertiary", "background"], ["Links", "link", "background"], ["Links on cards", "link", "backgroundSecondary"],
      ["Hovered links", "linkHover", "background"], ["Button text", "buttonText", "button"], ["Hovered button text", "buttonText", "buttonHover"],
      ["Code", "codeText", "codeBackground"], ["Added lines", "codeText", null, diff.addition], ["Deleted lines", "codeText", null, diff.deletion],
      ["Navbar text", "navbarText", "navbarBackground"], ["Success status", "success", "background"], ["Warning status", "warning", "background"], ["Error status", "error", "background"]
    ];
    return pairs.map(([label, key, backgroundKey, surface]) => {
      const background = backgroundKey ? colors[backgroundKey] : surface;
      return { label, key, background, ratio: background ? NEXORA.Catalog.contrast(colors[key], background) : null };
    });
  },
  suggest(colors, key) {
    const checks = this.audit(colors).filter(row => row.key === key);
    if (!checks.length || checks.some(row => row.ratio === null)) return null;
    for (let amount = 0; amount <= 100; amount++) {
      for (const end of ["#ffffff", "#000000"]) {
        const candidate = this.mix(end, colors[key], amount / 100);
        const next = { ...colors, [key]: candidate };
        if (this.audit(next).filter(row => row.key === key).every(row => row.ratio !== null && row.ratio >= 4.5)) return candidate;
      }
    }
    return null;
  },
  generate(seed, mode = "dark") {
    if (!/^#[\da-f]{6}$/i.test(seed)) throw new Error("Choose a six-digit seed color.");
    const light = mode === "light";
    const colors = { ...NEXORA.getThemeById(light ? "light" : "dark").colors };
    const tint = (base, amount) => this.mix(seed, base, amount);
    Object.assign(colors, {
      background: tint(light ? "#ffffff" : "#080c12", .06), backgroundSecondary: tint(light ? "#f5f7fa" : "#131a24", .08),
      backgroundTertiary: tint(light ? "#e9edf2" : "#202a38", .1), codeBackground: tint(light ? "#f7f8fa" : "#0b1019", .04),
      accent: seed, accentSecondary: gsShade(seed, light ? -25 : 25), button: seed, buttonHover: gsShade(seed, light ? -12 : 12),
      border: tint(light ? "#aab5c2" : "#465264", .2), borderMuted: tint(light ? "#d3dbe5" : "#303c4d", .12),
      link: seed, linkHover: gsShade(seed, light ? -20 : 20),
      shadow: light ? "rgba(0,0,0,0.12)" : "rgba(0,0,0,0.4)"
    });
    colors.repoBackground = colors.sidebarBackground = colors.dropdownBackground = colors.backgroundSecondary;
    colors.navbarBackground = colors.backgroundTertiary;
    colors.hoverBackground = colors.backgroundTertiary;
    colors.activeBackground = tint(colors.backgroundSecondary, .18);
    colors.tooltipBackground = colors.backgroundTertiary;
    colors.buttonText = gsContrastRatio("#000000", seed) > gsContrastRatio("#ffffff", seed) ? "#000000" : "#ffffff";
    colors.buttonHover = gsReadableColor(colors.buttonHover, [colors.buttonText]);
    for (const key of ["textPrimary", "textSecondary", "textTertiary", "link", "linkHover", "buttonText", "codeText", "navbarText", "success", "warning", "error"]) {
      const suggestion = this.suggest(colors, key);
      if (suggestion) colors[key] = suggestion;
    }
    return colors;
  }
};
