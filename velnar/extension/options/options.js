(async function () {
  const $ = id => document.getElementById(id);
  const UI = NEXORA.UI;
  let settings = await NEXORA.Storage.get();
  NEXORA.I18n.start(settings.language);
  let builderColors = { ...(settings.builderDraft?.colors || UI.colors(settings)) };
  let editingPersonalId = settings.builderDraft?.editingId || null;
  $("themeNameInput").value = settings.builderDraft?.name || "";
  $("draftStatus").textContent = settings.builderDraft ? "Draft recovered. Your active theme has not changed." : "Changes are saved as a draft automatically.";
  let cssDirty = false;
  let category = "all";
  let librarySignature = "";
  async function changeTheme(id) {
    settings = await NEXORA.Storage.selectTheme(id);
    studio.select(id);
    refresh(); UI.status(`${currentThemeName()} applied.`);
  }
  UI.on($("btnUndoTheme"), "click", async () => {
    if (!settings.appearanceHistory.length) return;
    settings = await NEXORA.Storage.restoreHistory(settings.appearanceHistory.length - 1, settings.appearanceHistory.at(-1).at);
    refresh(); UI.status("Previous appearance restored.");
  });
  UI.on($("btnCustomizeActive"), "click", async () => {
    await loadActiveIntoBuilder();
    document.querySelector('[data-tab="builder"]').click();
  });

  function currentThemeName() {
    return settings.customThemeApplied && !settings.autoDarkMode && settings.customTheme
      ? settings.customTheme.name : NEXORA.getThemeById(UI.activeThemeId(settings)).name;
  }
  document.querySelectorAll(".gs-nav-item").forEach(button => UI.on(button, "click", () => {
    document.querySelectorAll(".gs-nav-item").forEach(item => {
      item.classList.toggle("is-active", item === button);
      if (item === button) item.setAttribute("aria-current", "page"); else item.removeAttribute("aria-current");
    });
    document.querySelectorAll(".gs-tab").forEach(tab => tab.classList.toggle("is-active", tab.id === "tab-" + button.dataset.tab));
    $("tab-" + button.dataset.tab).querySelector("h1").focus();
  }));

  const studio = NEXORA.Studio.create({ getSettings: () => settings, apply: changeTheme });
  let compact = (localStorage.getItem("nexora-card-density") ?? localStorage.getItem("velnar-card-density")) === "compact";
  $("themeGallery").classList.toggle("is-compact", compact);
  $("btnDensity").setAttribute("aria-pressed", String(compact));
  UI.on($("btnDensity"), "click", () => {
    compact = !compact; localStorage.setItem("nexora-card-density", compact ? "compact" : "comfortable");
    $("themeGallery").classList.toggle("is-compact", compact);
    $("btnDensity").setAttribute("aria-pressed", String(compact));
    $("btnDensity").setAttribute("aria-label", compact ? "Use comfortable theme cards" : "Use compact theme cards");
  });
  UI.on(document, "keydown", event => {
    if (/INPUT|TEXTAREA|SELECT/.test(event.target.tagName) || event.ctrlKey || event.metaKey || event.altKey || $("compareDialog").open) return;
    if (event.key === "/" && $("tab-themes").classList.contains("is-active")) { event.preventDefault(); $("themeSearch").focus(); }
  });
  function themeCard(theme) {
    const card = document.createElement("div");
    card.className = "gs-theme-card";
    card.dataset.themeId = theme.id;
    const active = NEXORA.Catalog.isActive(theme, settings);
    card.classList.toggle("is-active", active);
    const choose = document.createElement("button");
    choose.type = "button";
    choose.className = "gs-theme-choice";
    choose.setAttribute("aria-label", `Apply ${theme.name} theme`);
    choose.setAttribute("aria-pressed", String(active));
    const preview = document.createElement("div");
    preview.className = "gs-preview";
    preview.style.background = theme.colors.background;
    preview.style.setProperty("--mini-text", theme.colors.textSecondary);
    preview.style.setProperty("--mini-accent", theme.colors.accent);
    preview.innerHTML = '<div></div><div></div><span class="gs-preview-dot"></span>';
    preview.children[0].style.background = theme.colors.sidebarBackground;
    preview.children[1].style.background = theme.colors.backgroundSecondary;
    preview.children[2].style.background = `linear-gradient(135deg, ${theme.colors.accent}, ${theme.colors.accentSecondary})`;
    const name = document.createElement("div");
    name.className = "gs-theme-name";
    name.style.background = theme.colors.backgroundSecondary;
    name.style.color = theme.colors.textPrimary;
    name.textContent = theme.name + (active ? " ✓" : "");
    if (theme.scene) { const subtitle = document.createElement("small"); subtitle.className = "vn-scene-tagline"; subtitle.textContent = theme.tagline; name.append(subtitle); }
    choose.append(preview, name);
    UI.on(choose, "click", async () => {
      await changeTheme(theme.id);
    });
    const favorite = document.createElement("button");
    favorite.type = "button";
    favorite.className = "gs-fav-star";
    favorite.textContent = "★";
    favorite.classList.toggle("is-fav", settings.favoriteThemeIds.includes(theme.id));
    favorite.setAttribute("aria-label", `Favorite ${theme.name}`);
    favorite.setAttribute("aria-pressed", String(settings.favoriteThemeIds.includes(theme.id)));
    UI.on(favorite, "click", async () => { settings = await NEXORA.Storage.toggleFavorite(theme.id); refresh(); });
    const inspect = document.createElement("button"); inspect.className = "studio-inspect"; inspect.type = "button";
    inspect.textContent = "Preview"; inspect.setAttribute("aria-label", `Preview ${theme.name}`);
    UI.on(inspect, "click", () => { studio.select(theme.id); document.querySelectorAll(".gs-theme-card").forEach(item => item.classList.toggle("is-previewed", item.dataset.themeId === theme.id)); });
    card.classList.toggle("is-previewed", studio.selectedId() === theme.id);
    card.append(choose, favorite, inspect);
    if (theme.category === "personal") {
      const actions = document.createElement("div"); actions.className = "personal-actions";
      const edit = document.createElement("button"); edit.textContent = "Edit / Rename"; edit.type = "button";
      edit.setAttribute("aria-label", `Edit ${theme.name}`);
      UI.on(edit, "click", async () => {
        builderColors = { ...theme.colors }; editingPersonalId = theme.id; $("themeNameInput").value = theme.name;
        renderBuilder(); await persistDraft(); document.querySelector('[data-tab="builder"]').click();
      });
      const remove = document.createElement("button"); remove.textContent = "Delete"; remove.type = "button";
      remove.setAttribute("aria-label", `Delete ${theme.name}`);
      UI.on(remove, "click", async () => { settings = await NEXORA.Storage.deletePersonal(theme.id); if (editingPersonalId === theme.id) editingPersonalId = null; refresh(); UI.status("Personal theme deleted. The active appearance is unchanged."); });
      actions.append(edit, remove); card.append(actions);
    }
    if (theme.rgbCycle) {
      const badge = document.createElement("span"); badge.className = "gs-rgb-badge"; badge.textContent = "RGB"; card.append(badge);
    }
    return card;
  }
  function renderThemes() {
    const signature = JSON.stringify([$("themeSearch").value, category, $("themeAppearance").value,
      $("themeSort").value, UI.activeThemeId(settings), settings.customThemeApplied,
      settings.autoDarkMode, settings.customTheme, settings.personalThemes, settings.language, settings.favoriteThemeIds, studio.selectedId()]);
    if (signature === librarySignature) return;
    librarySignature = signature;
    const focused = document.activeElement.closest?.(".gs-theme-card");
    const focusLabel = focused ? document.activeElement.getAttribute("aria-label") : null;
    const themes = NEXORA.Catalog.filter(NEXORA.Catalog.themes(settings), {
      query: $("themeSearch").value, category, appearance: $("themeAppearance").value,
      sort: $("themeSort").value, favorites: settings.favoriteThemeIds
    });
    $("libraryCount").textContent = `${themes.length} themes`;
    document.querySelectorAll("#themeFilters button").forEach(button => button.setAttribute("aria-pressed", String(button.dataset.category === category)));
    $("themeGallery").replaceChildren(...themes.map(themeCard));
    if (focusLabel) [...$("themeGallery").querySelectorAll("button")].find(button => button.getAttribute("aria-label") === focusLabel)?.focus({ preventScroll: true });
    $("themeEmpty").hidden = themes.length > 0;
    $("activeThemeName").textContent = currentThemeName();
  }
  UI.on($("themeSearch"), "input", renderThemes);
  for (const id of ["themeAppearance", "themeSort"]) UI.on($(id), "change", renderThemes);
  document.querySelectorAll("#themeFilters button").forEach(button => UI.on(button, "click", () => { category = button.dataset.category; renderThemes(); }));
  UI.on($("btnClearFilters"), "click", () => { category = "all"; $("themeSearch").value = ""; $("themeAppearance").value = "all"; $("themeSort").value = "default"; renderThemes(); });
  UI.on($("btnRandomTheme"), "click", async () => {
    settings = await NEXORA.Storage.randomTheme(); refresh(); UI.status(`${currentThemeName()} applied.`);
  });
  UI.on($("btnDisableAutoDarkOptions"), "click", async () => { settings = await NEXORA.Storage.set({ autoDarkMode: false }); refresh(); });

  const groups = {
    Surfaces: ["background", "backgroundSecondary", "backgroundTertiary", "hoverBackground", "activeBackground", "repoBackground", "sidebarBackground", "navbarBackground"],
    Text: ["textPrimary", "textSecondary", "textTertiary", "navbarText", "codeText"],
    Interactive: ["link", "linkHover", "button", "buttonText", "buttonHover", "accent", "accentSecondary"],
    Borders: ["border", "borderMuted", "codeBackground", "dropdownBackground", "tooltipBackground", "scrollbarThumb", "shadow"],
    Status: ["success", "warning", "error"]
  };
  function renderBuilder() {
    for (const [group, keys] of Object.entries(groups)) {
      const target = $("colorGrid" + group); target.replaceChildren();
      keys.forEach(key => NEXORA.ColorPicker.create(target, {
        label: key.replace(/([A-Z])/g, " $1").replace(/^./, char => char.toUpperCase()),
        value: builderColors[key], hexOnly: key === "accent" || key === "accentSecondary",
        onChange(value) { builderColors[key] = value; updateBuilderPreview(); persistDraft().catch(error => UI.status(error.message, true)); }
      }));
    }
    updateBuilderPreview();
  }
  function updateBuilderPreview() {
    const preview = $("builderPreview");
    preview.style.background = builderColors.background;
    preview.style.color = builderColors.textPrimary;
    preview.style.borderColor = builderColors.border;
    preview.querySelector("button").style.background = builderColors.button;
    preview.querySelector("button").style.color = builderColors.buttonText;
    preview.querySelector("a").style.color = builderColors.link;
    const ratio = NEXORA.Catalog.contrast(builderColors.textPrimary, builderColors.background);
    $("builderContrast").textContent = ratio === null ? "Text contrast: use opaque colors to measure readability." : `Text contrast ${ratio.toFixed(2)}:1 · ${ratio >= 4.5 ? "Meets AA for normal text" : "Below AA for normal text — increase the difference between text and surface colors"}`;
    $("builderContrast").classList.toggle("is-low", ratio !== null && ratio < 4.5);
    $("readabilityChecks").replaceChildren(...NEXORA.Palette.audit(builderColors).map(check => {
      const row = document.createElement("div"); row.className = "readability-row"; row.dataset.color = check.key;
      row.classList.toggle("is-low", check.ratio !== null && check.ratio < 4.5);
      const label = document.createElement("span"); label.textContent = check.label;
      const result = document.createElement("strong"); result.textContent = check.ratio === null ? "Not measured" : `${check.ratio.toFixed(2)}:1 · ${check.ratio >= 4.5 ? "Meets AA" : "Below AA"}`;
      row.append(label, result);
      if (check.ratio !== null && check.ratio < 4.5) {
        const suggestion = NEXORA.Palette.suggest(builderColors, check.key);
        const fix = document.createElement("button"); fix.type = "button"; fix.textContent = suggestion ? `Use ${suggestion}` : "Adjust the surface colors";
        fix.disabled = !suggestion; fix.setAttribute("aria-label", `Fix ${check.label}`);
        UI.on(fix, "click", async () => { builderColors[check.key] = suggestion; renderBuilder(); await persistDraft(); }); row.append(fix);
      }
      return row;
    }));
  }
  function builderTheme() {
    const invalid = document.querySelector('.gs-color-hex[aria-invalid="true"]');
    if (invalid) { invalid.reportValidity(); invalid.focus(); throw new Error("Fix invalid colors before saving."); }
    return NEXORA.Validator.theme({ name: $("themeNameInput").value.trim() || "My Theme", colors: builderColors });
  }
  async function persistDraft() {
    $("draftStatus").textContent = "Saving draft…";
    settings = await NEXORA.Storage.set({ builderDraft: { ...builderTheme(), editingId: editingPersonalId } });
    $("draftStatus").textContent = "Draft saved. Your active theme has not changed.";
  }
  async function loadActiveIntoBuilder() {
    builderColors = { ...UI.colors(settings) }; $("themeNameInput").value = currentThemeName();
    editingPersonalId = NEXORA.Catalog.themes(settings).find(theme => theme.category === "personal" && NEXORA.Catalog.isActive(theme, settings))?.id || null;
    renderBuilder(); await persistDraft();
  }
  UI.on($("themeNameInput"), "input", persistDraft);
  UI.on($("btnLoadPresetIntoBuilder"), "click", loadActiveIntoBuilder);
  UI.on($("btnGeneratePalette"), "click", async () => { builderColors = NEXORA.Palette.generate($("paletteSeed").value, $("paletteMode").value); renderBuilder(); await persistDraft(); });
  UI.on($("btnDiscardDraft"), "click", async () => {
    settings = await NEXORA.Storage.set({ builderDraft: null }); editingPersonalId = null;
    builderColors = { ...UI.colors(settings) }; $("themeNameInput").value = ""; renderBuilder();
    $("draftStatus").textContent = "Draft discarded.";
  });
  for (const [id, copy] of [["btnSavePersonal", false], ["btnSaveCopy", true]]) UI.on($(id), "click", async () => {
    settings = await NEXORA.Storage.savePersonal(builderTheme(), copy ? null : editingPersonalId);
    editingPersonalId = settings.builderDraft.editingId; refresh(); UI.status("Personal theme saved to your library.");
    $("draftStatus").textContent = "Draft saved. Your active theme has not changed.";
  });
  UI.on($("btnApplyCustom"), "click", async () => {
    const invalid = document.querySelector('.gs-color-hex[aria-invalid="true"]');
    if (invalid) { invalid.reportValidity(); invalid.focus(); return; }
    const customTheme = builderTheme();
    settings = await NEXORA.Storage.set({ customTheme, customThemeApplied: true, autoDarkMode: false });
    refresh(); UI.status(`${customTheme.name} applied.`);
  });
  for (const id of ["borderRadius", "shadowIntensity"]) {
    UI.on($(id), "input", () => $(id + "Value").textContent = $(id).value + (id === "borderRadius" ? "px" : "%"));
    UI.on($(id), "change", async () => { settings = await NEXORA.Storage.set({ layout: { [id]: Number($(id).value) } }); UI.status("Layout saved."); });
  }
  for (const id of ["fontFamily", "codeFont", "fontSize", "lineHeight", "fontWeight"]) {
    UI.on($(id), "change", async () => {
      const value = ["fontFamily", "codeFont"].includes(id) ? $(id).value.trim() : Number($(id).value);
      settings = await NEXORA.Storage.set({ typography: { [id]: value } }); UI.status("Typography saved.");
    });
  }
  for (const id of ["fontSize", "lineHeight"]) UI.on($(id), "input", () => $(id + "Value").textContent = $(id).value + (id === "fontSize" ? "px" : ""));

  function renderComponents() {
    $("componentList").replaceChildren();
    $("componentSummary").textContent = `${Object.values(settings.componentOverrides).filter(Boolean).length} of ${NEXORA.COMPONENTS.length} components enabled`;
    const query = $("componentSearch").value.trim().toLowerCase();
    const matches = component => `${component.label} ${NEXORA.I18n.t(component.label)}`.toLowerCase().includes(query);
    $("componentEmpty").hidden = NEXORA.COMPONENTS.some(matches);
    NEXORA.COMPONENTS.filter(matches).forEach(component => {
      const row = document.createElement("div"); row.className = "gs-component-item";
      const label = document.createElement("span"); label.textContent = component.label;
      const button = document.createElement("button"); button.type = "button"; button.className = "gs-switch";
      button.setAttribute("role", "switch"); button.setAttribute("aria-label", `Theme ${component.label}`);
      UI.switch(button, settings.componentOverrides[component.id]);
      UI.on(button, "click", async () => { settings = await NEXORA.Storage.toggleComponent(component.id); refresh(); });
      row.append(label, button); $("componentList").append(row);
    });
  }
  UI.on($("componentSearch"), "input", renderComponents);
  for (const [id, enabled] of [["btnAllComponentsOn", true], ["btnAllComponentsOff", false]]) UI.on($(id), "click", async () => {
    settings = await NEXORA.Storage.set({ componentOverrides: Object.fromEntries(NEXORA.COMPONENTS.map(component => [component.id, enabled])) }); refresh();
  });
  UI.on($("customCssInput"), "input", () => { cssDirty = true; });
  UI.on($("customCssSwitch"), "click", async () => { settings = await NEXORA.Storage.toggle("customCssEnabled"); refresh(); });
  UI.on($("btnValidateCss"), "click", async () => {
    const css = $("customCssInput").value;
    const check = NEXORA.Validator.validateCss(css);
    $("cssErrorBox").hidden = check.valid;
    $("cssErrorBox").textContent = check.errors.join("\n");
    if (!check.valid) return;
    settings = await NEXORA.Storage.set({ customCss: css, customCssEnabled: true }); cssDirty = false;
    refresh(); UI.status("Custom CSS applied.");
  });
  UI.on($("btnResetCss"), "click", async () => {
    settings = await NEXORA.Storage.set({ customCss: "", customCssEnabled: false }); cssDirty = false; $("cssErrorBox").hidden = true; refresh();
  });

  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a"); link.href = url; link.download = filename; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  function downloadJson(value, filename) {
    downloadBlob(new Blob([JSON.stringify(value, null, 2)], { type: "application/json" }), filename);
  }
  async function downloadCard(theme) {
    downloadBlob(await NEXORA.ThemeCard.create(theme), "nexora-theme-card.png");
  }
  UI.on($("btnExportTheme"), "click", () => downloadJson({ name: currentThemeName(), colors: UI.colors(settings) }, "nexora-theme.json"));
  UI.on($("btnExportThemeCard"), "click", () => downloadCard({ name: currentThemeName(), colors: UI.colors(settings) }));
  UI.on($("btnExportDraftCard"), "click", () => {
    const invalid = $("tab-builder").querySelector('.gs-color-hex[aria-invalid="true"]');
    if (invalid) { invalid.reportValidity(); invalid.focus(); return; }
    return downloadCard(builderTheme());
  });
  UI.on($("btnBackupSettings"), "click", async () => downloadJson(await NEXORA.Storage.get(), "nexora-settings-backup.json"));
  async function importJson(event, restore) {
    const file = event.target.files[0]; if (!file) return;
    try {
      if (file.size > NEXORA.Validator.MAX_IMPORT_BYTES) throw new Error("Choose a JSON file smaller than 2 MB.");
      const parsed = JSON.parse(await file.text());
      settings = restore ? await NEXORA.Storage.restore(NEXORA.Validator.settings(parsed))
        : await NEXORA.Storage.set({ customTheme: NEXORA.Validator.theme(parsed), customThemeApplied: true, autoDarkMode: false });
      cssDirty = false; editingPersonalId = settings.builderDraft?.editingId || null; builderColors = { ...(settings.builderDraft?.colors || UI.colors(settings)) }; $("themeNameInput").value = settings.builderDraft?.name || currentThemeName(); renderBuilder(); refresh();
      UI.status(restore ? "Settings restored." : "Theme imported and applied.");
    } finally { event.target.value = ""; }
  }
  UI.on($("importThemeFile"), "change", event => importJson(event, false));
  UI.on($("restoreSettingsFile"), "change", event => importJson(event, true));

  const switches = { sidebarEnabledSwitch: "enabled", settingEnabled: "enabled", settingCustomTheme: "customThemeApplied", settingAutoDark: "autoDarkMode" };
  for (const [id, key] of Object.entries(switches)) UI.on($(id), "click", async () => {
    if (key === "customThemeApplied" && !settings.customTheme) throw new Error("Create or import a custom theme first.");
    settings = key === "customThemeApplied" && !settings.customThemeApplied
      ? await NEXORA.Storage.set({ customThemeApplied: true, autoDarkMode: false }) : await NEXORA.Storage.toggle(key);
    refresh();
  });
  for (const [id, key] of [["autoDarkLight", "autoDarkModeLightTheme"], ["autoDarkDark", "autoDarkModeDarkTheme"]]) {
    NEXORA.PRESET_THEMES.forEach(theme => { const option = document.createElement("option"); option.value = theme.id; option.textContent = theme.name; $(id).append(option); });
    UI.on($(id), "change", async () => { settings = await NEXORA.Storage.set({ [key]: $(id).value }); refresh(); });
  }
  UI.on($("btnResetAll"), "click", async () => {
    if (!confirm(NEXORA.I18n.t("Reset all NEXORA settings? Your personal themes, draft, history and CSS will be removed."))) return;
    settings = await NEXORA.Storage.reset(); editingPersonalId = null; cssDirty = false; builderColors = { ...UI.colors(settings) }; $("themeNameInput").value = ""; $("draftStatus").textContent = "Changes are saved as a draft automatically."; renderBuilder(); refresh(); UI.status("Default settings restored.");
  });
  function updateTypographyPreview() {
    for (const preview of [$("typographyPreview"), document.querySelector(".bilingual-preview")]) {
      preview.style.fontFamily = $("fontFamily").value || "var(--ui-font)";
      preview.style.fontSize = $("fontSize").value + "px";
      preview.style.lineHeight = $("lineHeight").value;
      preview.style.fontWeight = $("fontWeight").value;
      preview.querySelector("code").style.fontFamily = $("codeFont").value || "monospace";
    }
  }
  for (const id of ["fontFamily", "codeFont", "fontSize", "lineHeight", "fontWeight"]) UI.on($(id), "input", updateTypographyPreview);
  for (const [id, value] of [["btnReadingComfort", { fontSize: 16, lineHeight: 1.7, fontWeight: 400 }], ["btnResetTypography", NEXORA.DEFAULT_SETTINGS.typography]]) UI.on($(id), "click", async () => {
    settings = await NEXORA.Storage.set({ typography: value });
    // A focused range must also reflect a preset applied from another control.
    for (const [key, entry] of Object.entries(settings.typography)) $(key).value = entry;
    refresh(); UI.status("Typography saved.");
  });
  function refresh() {
    NEXORA.I18n.setLanguage(settings.language);
    renderThemes(); renderComponents();
    studio.refresh();
    $("workspaceSummary").textContent = `${settings.enabled ? "Active on GitHub" : "Extension paused"} · ${settings.autoDarkMode ? "Following system" : "Manual appearance"} · Static themes`;
    $("btnUndoTheme").disabled = !settings.appearanceHistory.length;
    $("interfaceLanguage").value = settings.language;
    if (editingPersonalId && !settings.personalThemes.some(theme => theme.id === editingPersonalId)) editingPersonalId = null;
    $("btnSavePersonal").textContent = editingPersonalId ? "Update saved theme" : "Save to library";
    renderHistory();
    for (const [id, key] of Object.entries(switches)) UI.switch($(id), settings[key]);
    for (const [key, value] of Object.entries(settings.typography)) UI.setValue($(key), value);
    for (const [key, value] of Object.entries(settings.layout)) UI.setValue($(key), value);
    for (const id of ["fontSize", "lineHeight", "borderRadius", "shadowIntensity"]) $(id + "Value").textContent = $(id).value + (id === "lineHeight" ? "" : id === "shadowIntensity" ? "%" : "px");
    UI.switch($("customCssSwitch"), settings.customCssEnabled);
    if (!cssDirty) UI.setValue($("customCssInput"), settings.customCss);
    $("autoDarkBannerOptions").hidden = !settings.autoDarkMode;
    $("autoDarkLight").value = settings.autoDarkModeLightTheme;
    $("autoDarkDark").value = settings.autoDarkModeDarkTheme;
    $("autoDarkLight").disabled = $("autoDarkDark").disabled = !settings.autoDarkMode;
    $("extensionState").textContent = settings.enabled ? "Active on GitHub" : "Paused";
    updateTypographyPreview();
  }
  function renderHistory() {
    const rows = settings.appearanceHistory.map((entry, index) => {
      const row = document.createElement("div"); row.className = "history-row";
      const label = document.createElement("span");
      const name = entry.appearance.customThemeApplied && !entry.appearance.autoDarkMode ? entry.appearance.customTheme?.name : NEXORA.getThemeById(UI.activeThemeId(entry.appearance))?.name;
      label.textContent = `${name || "Theme"} · ${new Intl.DateTimeFormat(settings.language, { dateStyle: "short", timeStyle: "short" }).format(entry.at)}`;
      label.dataset.i18nSkip = "";
      const button = document.createElement("button"); button.textContent = "Restore"; button.type = "button";
      UI.on(button, "click", async () => { settings = await NEXORA.Storage.restoreHistory(index, entry.at); refresh(); UI.status("Previous appearance restored."); });
      row.append(label, button); return row;
    }).reverse();
    if (!rows.length) { const empty = document.createElement("p"); empty.textContent = "No appearance changes yet."; rows.push(empty); }
    $("appearanceHistory").replaceChildren(...rows);
  }
  UI.on($("interfaceLanguage"), "change", async () => { settings = await NEXORA.Storage.set({ language: $("interfaceLanguage").value }); refresh(); });
  const personalFilter = document.createElement("button"); personalFilter.type = "button"; personalFilter.dataset.category = "personal"; personalFilter.textContent = "My themes"; personalFilter.setAttribute("aria-pressed", "false");
  UI.on(personalFilter, "click", () => { category = "personal"; renderThemes(); }); $("themeFilters").append(personalFilter);
  NEXORA.Storage.onChange(next => { settings = next; refresh(); });
  matchMedia("(prefers-color-scheme: dark)").addEventListener("change", refresh);
  renderBuilder(); refresh();
})().catch(error => NEXORA.UI.status(error.message, true));
