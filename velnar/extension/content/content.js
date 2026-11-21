// entry point e content script. injaa hame chizo behem vasl mikonim
(function () {
  // age Auto Dark Mode roshan bashe, theme haghighi az rooye prefers-color-scheme
  // system entekhab mishe, na az activeThemeId e sabet
  function resolveActiveThemeId(settings) {
    if (settings.autoDarkMode) {
      const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
      return prefersDark
        ? (settings.autoDarkModeDarkTheme || "dark")
        : (settings.autoDarkModeLightTheme || "light");
    }
    return settings.activeThemeId;
  }

  function resolveActiveColors(settings) {
    if (settings.customThemeApplied && settings.customTheme && !settings.autoDarkMode) {
      return settings.customTheme.colors || settings.customTheme;
    }
    const themeId = resolveActiveThemeId(settings);
    const theme = NEXORA.getThemeById(themeId) || NEXORA.getThemeById("dark");
    return theme.colors;
  }

  const applied = new Map();
  function applyStyle(id, values, render) {
    const key = JSON.stringify(values);
    const previous = applied.get(id), tag = document.getElementById(id);
    if (previous?.key === key && tag === previous.tag && tag?.textContent === previous.css) return;
    render();
    const next = document.getElementById(id);
    applied.set(id, { key, tag: next, css: next?.textContent });
  }

  function applyAll(settings, colors, focus) {
    if (!settings.enabled) {
      NEXORA.Injector.removeAll();
      applied.clear();
      return;
    }
    applyStyle(NEXORA.STYLE_TAG_ID, [colors, settings.layout], () => NEXORA.Injector.applyThemeVars(colors, settings.layout));
    applyStyle(NEXORA.COMPONENTS_TAG_ID, settings.componentOverrides, () => NEXORA.Injector.applyComponents(settings.componentOverrides));
    applyStyle(NEXORA.TYPOGRAPHY_TAG_ID, settings.typography, () => NEXORA.Injector.applyTypography(settings.typography));
    if (focus) applyStyle(NEXORA.REVIEW_FOCUS_TAG_ID, true, () => NEXORA.Injector.applyReviewFocus());
    else if (applied.delete(NEXORA.REVIEW_FOCUS_TAG_ID)) document.getElementById(NEXORA.REVIEW_FOCUS_TAG_ID)?.remove();
    applyStyle(NEXORA.CUSTOM_CSS_TAG_ID, [settings.customCss, settings.customCssEnabled], () => NEXORA.Injector.applyCustomCss(settings.customCss, settings.customCssEnabled));
  }

  let currentSettings = null;
  let popup = null;
  let preview = null;
  let focusedReview = null;
  let published = "";

  function workspace() {
    const path = location.pathname;
    const repository = NEXORA.Validator.repositoryKey(path.split("/").slice(1, 3).join("/"));
    const metadata = NEXORA.Validator.repositoryKey(document.head?.querySelector(NEXORA.REPOSITORY_META_SELECTOR)?.content);
    const review = path.match(/^\/[^/]+\/[^/]+\/pull\/(\d+)\/(?:files|changes)(?:\/|$)/i);
    const confirmed = repository === metadata ? repository : null;
    return { path, repository: confirmed, review: confirmed && review ? `${confirmed}/${review[1]}` : null };
  }

  function sync() {
    const { path, repository, review } = workspace();
    if (preview && (preview.path !== path || currentSettings?.enabled === false)) preview = null;
    if (focusedReview !== review || currentSettings?.enabled === false) focusedReview = null;
    if (currentSettings) {
      const colors = preview?.theme.colors || currentSettings.repositoryThemes[repository]?.colors || resolveActiveColors(currentSettings);
      applyAll(currentSettings, colors, !!focusedReview);
    }
    const state = { path, repository, review: !!review, focus: !!focusedReview, previewId: preview?.id || null };
    const signature = JSON.stringify(state);
    if (popup && currentSettings && signature !== published) {
      published = signature;
      popup.postMessage(state);
    }
  }

  function toggleFocus() {
    const { review } = workspace();
    if (!review || !currentSettings?.enabled) return;
    focusedReview = focusedReview === review ? null : review;
    sync();
  }

  chrome.runtime.onConnect.addListener(port => {
    if (port.name !== "nexora:workspace" || port.sender?.id !== chrome.runtime.id ||
      port.sender.url !== chrome.runtime.getURL("popup/popup.html")) return;
    popup?.disconnect();
    popup = port;
    preview = null;
    published = "";
    port.onMessage.addListener(message => {
      if (popup !== port) return;
      if (message?.type === "preview" && message.path === location.pathname && currentSettings?.enabled) {
        try { preview = { id: message.id, path: message.path, theme: NEXORA.Validator.theme(message.theme) }; }
        catch { preview = null; }
      } else if (message?.type === "cancel") preview = null;
      else if (message?.type === "focus") { toggleFocus(); return; }
      published = "";
      sync();
    });
    port.onDisconnect.addListener(() => {
      if (popup !== port) return;
      popup = preview = null;
      sync();
    });
    sync();
  });

  chrome.runtime.onMessage.addListener((message, sender) => {
    if (message?.type === "nexora:review-focus" && sender.id === chrome.runtime.id) toggleFocus();
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && preview) { preview = null; sync(); }
  });
  window.addEventListener("pagehide", () => {
    popup?.disconnect();
    popup = preview = focusedReview = null;
    sync();
  });

  async function init() {
    // vaghti user az popup ya options chizi avaz kard, bedune reload update besh
    NEXORA.Storage.onChange((newSettings) => {
      currentSettings = newSettings;
      sync();
    });

    const saved = await NEXORA.Storage.get();
    currentSettings ||= saved;
    sync();

    // vaghti safhe avaz shod (SPA navigation) dobare bezan ru safhe jadid
    NEXORA.Observer.start(sync);

    // vaghti Auto Dark Mode roshane, taghire system theme (OS) ham bayad live apply beshe
    if (window.matchMedia) {
      window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
        if (currentSettings?.autoDarkMode) sync();
      });
    }
  }

  init();
})();
