(async function () {
  const $ = id => document.getElementById(id);
  const UI = NEXORA.UI;
  let settings = await NEXORA.Storage.get();
  NEXORA.I18n.start(settings.language);
  let category = "all";
  let librarySignature = "";
  let connection = null;
  let workspace = null;
  let previewMode = false;
  let candidate = null;
  let savingPreview = false;

  function cancelPreview(notify = true) {
    previewMode = false;
    candidate = null;
    if (notify) connection?.postMessage({ type: "cancel" });
  }

  function renderWorkspace() {
    const repository = workspace?.repository;
    const rule = repository && settings.repositoryThemes[repository];
    const live = candidate && workspace?.previewId === candidate.id ? candidate : null;
    const ready = !!live && !savingPreview && settings.enabled;
    $("workspaceControls").hidden = !workspace;
    $("repositoryStatus").hidden = !repository || (!rule && !previewMode);
    $("repositoryName").textContent = repository || "";
    $("btnClearRepository").hidden = !rule;
    $("btnClearRepository").disabled = savingPreview;
    $("btnLivePreview").disabled = !settings.enabled || savingPreview;
    $("btnLivePreview").textContent = previewMode ? "Cancel preview" : "Preview on this page";
    $("btnLivePreview").setAttribute("aria-pressed", String(previewMode));
    $("btnReviewFocus").hidden = !workspace?.review;
    $("btnReviewFocus").disabled = !settings.enabled;
    $("btnReviewFocus").setAttribute("aria-pressed", String(!!workspace?.focus));
    $("previewActions").hidden = !previewMode;
    $("previewHint").textContent = live ? "Previewing on GitHub. Press Esc to cancel." : "Choose a theme to preview it on this tab.";
    $("btnKeepPreview").disabled = !ready;
    $("btnKeepRepository").hidden = !repository;
    $("btnKeepRepository").disabled = !ready;
    return live || rule;
  }

  async function applyGlobal(theme, fromPreview = false) {
    settings = fromPreview && theme.id.startsWith("personal-")
      ? await NEXORA.Storage.set({ customTheme: theme, customThemeApplied: true, autoDarkMode: false })
      : await NEXORA.Storage.selectTheme(theme.id);
    UI.status(settings.repositoryThemes[workspace?.repository] ? "Global theme saved. This repo uses its own theme." : `${theme.name} applied.`);
  }

  async function keepPreview(forRepository) {
    const theme = candidate, repository = workspace?.repository;
    if (!theme || workspace?.previewId !== theme.id || savingPreview || !settings.enabled) return;
    savingPreview = true;
    render();
    try {
      if (forRepository) {
        if (!repository) return;
        settings = await NEXORA.Storage.setRepositoryTheme(repository, theme);
        UI.status("Theme saved for this repository.");
      } else await applyGlobal(theme, true);
      cancelPreview();
    } finally {
      savingPreview = false;
      render();
    }
  }

  UI.on($("btnLivePreview"), "click", () => {
    if (previewMode) cancelPreview();
    else previewMode = true;
    render();
  });
  UI.on($("btnKeepPreview"), "click", () => keepPreview(false));
  UI.on($("btnKeepRepository"), "click", () => keepPreview(true));
  UI.on($("btnReviewFocus"), "click", () => connection?.postMessage({ type: "focus" }));
  UI.on($("btnClearRepository"), "click", async () => {
    if (!workspace?.repository) return;
    settings = await NEXORA.Storage.setRepositoryTheme(workspace.repository, null);
    cancelPreview();
    render();
    UI.status("Global theme restored for this repository.");
  });
  UI.on(document, "keydown", event => {
    if (event.key === "Escape" && previewMode && !savingPreview) {
      event.preventDefault();
      cancelPreview();
      render();
    }
  });
  UI.on($("btnUndoTheme"), "click", async () => {
    if (!settings.appearanceHistory.length) return;
    settings = await NEXORA.Storage.restoreHistory(settings.appearanceHistory.length - 1, settings.appearanceHistory.at(-1).at); render(); UI.status("Previous appearance restored.");
  });
  const personalFilter = document.createElement("button"); personalFilter.type = "button"; personalFilter.dataset.category = "personal"; personalFilter.textContent = "My themes"; personalFilter.setAttribute("aria-pressed", "false"); $("popupFilters").append(personalFilter);
  document.querySelectorAll("#popupFilters button").forEach(button => UI.on(button, "click", () => { category = button.dataset.category; render(); }));
  function render() {
    NEXORA.I18n.setLanguage(settings.language);
    const workspaceTheme = renderWorkspace();
    const colors = workspaceTheme?.colors || UI.colors(settings);
    const globalName = settings.customThemeApplied && !settings.autoDarkMode && settings.customTheme ? settings.customTheme.name : NEXORA.getThemeById(UI.activeThemeId(settings)).name;
    $("popupThemeName").textContent = workspaceTheme?.name || globalName;
    $("popupCurrent").style.setProperty("--current-accent", colors.accent);
    $("popupPalette").replaceChildren(...["background", "backgroundSecondary", "accent", "accentSecondary", "textPrimary"].map(key => { const dot = document.createElement("i"); dot.style.background = colors[key]; return dot; }));
    $("btnUndoTheme").disabled = !settings.appearanceHistory.length;
    document.querySelectorAll("#popupFilters button").forEach(button => button.setAttribute("aria-pressed", String(button.dataset.category === category)));
    UI.switch($("enabledSwitch"), settings.enabled);
    $("extensionState").textContent = settings.enabled ? "Active on GitHub" : "Paused";
    $("autoDarkBanner").hidden = !settings.autoDarkMode || previewMode || !!workspaceTheme;
    const signature = JSON.stringify([$("themeSearch").value, category, UI.activeThemeId(settings),
      settings.customThemeApplied, settings.customTheme, settings.personalThemes, settings.language, settings.autoDarkMode, settings.favoriteThemeIds, previewMode, workspaceTheme, savingPreview]);
    if (signature === librarySignature) return;
    librarySignature = signature;
    const focusedTheme = document.activeElement?.dataset.themeId;
    let focusTarget;
    const cards = [];
    const themes = NEXORA.Catalog.filter(NEXORA.Catalog.themes(settings), { query: $("themeSearch").value, category, sort: "favorites", favorites: settings.favoriteThemeIds });
    $("themeCount").textContent = `${themes.length} themes`;
    $("themeEmpty").hidden = themes.length > 0;
    themes.forEach(theme => {
      const active = workspaceTheme ? theme.name === workspaceTheme.name && Object.keys(NEXORA.CSS_VAR_MAP).every(key => theme.colors[key] === workspaceTheme.colors[key]) : NEXORA.Catalog.isActive(theme, settings);
      const item = document.createElement("div"); item.className = "gs-theme-swatch"; item.classList.toggle("is-active", active);
      const choose = document.createElement("button"); choose.type = "button"; choose.className = "gs-theme-select";
      choose.dataset.themeId = theme.id;
      if (theme.id === focusedTheme) focusTarget = choose;
      choose.style.background = theme.colors.background; choose.style.color = theme.colors.textPrimary;
      choose.setAttribute("aria-label", previewMode ? `Preview ${theme.name}` : `Apply ${theme.name} theme`); choose.setAttribute("aria-pressed", String(active));
      choose.disabled = savingPreview;
      const dot = document.createElement("i"); dot.className = "gs-dot"; dot.style.background = `linear-gradient(135deg, ${theme.colors.accent}, ${theme.colors.accentSecondary})`;
      const name = document.createElement("span"); name.className = "gs-swatch-name"; name.textContent = theme.name;
      choose.append(dot, name);
      UI.on(choose, "click", async () => {
        if (previewMode && connection && workspace) {
          candidate = { id: theme.id, name: theme.name, colors: theme.colors };
          connection.postMessage({ type: "preview", path: workspace.path, id: candidate.id, theme: candidate });
        } else await applyGlobal(theme);
        render();
      });
      const star = document.createElement("button"); star.type = "button"; star.className = "gs-star"; star.textContent = "★";
      star.classList.toggle("is-fav", settings.favoriteThemeIds.includes(theme.id)); star.setAttribute("aria-label", `Favorite ${theme.name}`); star.setAttribute("aria-pressed", String(settings.favoriteThemeIds.includes(theme.id)));
      UI.on(star, "click", async () => { settings = await NEXORA.Storage.toggleFavorite(theme.id); render(); });
      item.append(choose, star); cards.push(item);
    });
    $("themeGrid").replaceChildren(...cards);
    focusTarget?.focus({ preventScroll: true });
  }
  UI.on($("themeSearch"), "input", render);
  UI.on($("enabledSwitch"), "click", async () => { settings = await NEXORA.Storage.toggle("enabled"); render(); });
  UI.on($("btnRandom"), "click", async () => { settings = await NEXORA.Storage.randomTheme(); render(); });
  UI.on($("btnReset"), "click", async () => {
    settings = await NEXORA.Storage.set({ activeThemeId: "dark", customThemeApplied: false, customCss: "", customCssEnabled: false, autoDarkMode: false }); render(); UI.status("Theme reset.");
  });
  UI.on($("btnDisableAutoDark"), "click", async () => { settings = await NEXORA.Storage.set({ autoDarkMode: false }); render(); });
  UI.on($("btnSettings"), "click", () => chrome.runtime.openOptionsPage());
  NEXORA.Storage.onChange(next => {
    settings = next;
    if (!settings.enabled && previewMode) cancelPreview();
    render();
  });
  matchMedia("(prefers-color-scheme: dark)").addEventListener("change", render);
  render();
  const tabs = globalThis.browser?.tabs || chrome.tabs;
  const [tab] = await tabs.query({ active: true, currentWindow: true });
  if (!tab?.url?.startsWith("https://github.com/")) return;
  const port = tabs.connect(tab.id, { name: "nexora:workspace", frameId: 0 });
  connection = port;
  port.onMessage.addListener(next => {
    if ((workspace && next.path !== workspace.path) || (workspace?.previewId && !next.previewId)) cancelPreview(false);
    workspace = next;
    render();
  });
  port.onDisconnect.addListener(() => {
    void chrome.runtime.lastError;
    connection = workspace = null;
    cancelPreview(false);
    render();
  });
})().catch(error => NEXORA.UI.status(error.message, true));
