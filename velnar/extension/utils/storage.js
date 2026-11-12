globalThis.NEXORA = globalThis.NEXORA || {};

// Mutations are serialized by the one service worker shared by all extension pages.
NEXORA.Storage = {
  isWriter: false,
  _writeQueue: Promise.resolve(),
  // Read-only compatibility with installations made before the NEXORA rename; legacy data is never deleted.
  _legacyKeys: ["velnar_settings_v1", "mavaj_settings_v1", "gitskin_settings_v1"],
  _read(keys) {
    return new Promise((resolve, reject) => chrome.storage.local.get(keys, result => {
      const error = chrome.runtime.lastError;
      if (error) reject(new Error(error.message)); else resolve(result);
    }));
  },
  async get() {
    const result = await this._read([NEXORA.STORAGE_KEY, ...this._legacyKeys]);
    const saved = result[NEXORA.STORAGE_KEY] ?? this._legacyKeys.map(key => result[key]).find(Boolean) ?? {};
    return NEXORA.Validator.settings(NEXORA.Validator.isRecord(saved) ? saved : {}, { strict: false });
  },
  _merge(current, partial) {
    const next = { ...current, ...partial };
    for (const key of ["layout", "typography", "componentOverrides"]) {
      if (NEXORA.Validator.isRecord(partial[key])) next[key] = { ...current[key], ...partial[key] };
    }
    return next;
  },
  _commit(action, payload) {
    const run = async () => {
      let next;
      let current;
      if (action === "reset") next = structuredClone(NEXORA.DEFAULT_SETTINGS);
      else if (action === "restore") {
        if (!NEXORA.Validator.isRecord(payload) || !Object.keys(NEXORA.DEFAULT_SETTINGS).some(key => Object.hasOwn(payload, key))) throw new Error("This file is not a settings backup.");
        next = NEXORA.Validator.settings(payload);
      }
      else {
        current = await this.get();
        if (action === "patch") {
          if (!NEXORA.Validator.isRecord(payload)) throw new Error("Settings must be an object.");
          next = NEXORA.Validator.settings(this._merge(current, payload));
        } else if (action === "select") {
          const personal = current.personalThemes.find(theme => theme.id === payload);
          const theme = personal || NEXORA.getThemeById(payload);
          if (!theme) throw new Error("Unknown theme.");
          next = personal ? { ...current, customTheme: NEXORA.Validator.theme(personal), customThemeApplied: true, autoDarkMode: false }
            : { ...current, activeThemeId: theme.id, customThemeApplied: false, autoDarkMode: false };
        } else if (action === "repositoryTheme") {
          const key = NEXORA.Validator.repositoryKey(payload?.repository);
          if (!key) throw new Error("Invalid repository name.");
          const repositoryThemes = { ...current.repositoryThemes };
          if (payload.theme === null) delete repositoryThemes[key];
          else {
            if (!Object.hasOwn(repositoryThemes, key) && Object.keys(repositoryThemes).length >= NEXORA.REPOSITORY_THEME_LIMIT) throw new Error("Save up to 100 repository themes.");
            repositoryThemes[key] = NEXORA.Validator.theme(payload.theme);
          }
          next = { ...current, repositoryThemes };
        } else if (action === "savePersonal") {
          if (!NEXORA.Validator.isRecord(payload)) throw new Error("Invalid personal theme.");
          const theme = NEXORA.Validator.theme(payload.theme);
          const index = current.personalThemes.findIndex(theme => theme.id === payload.id);
          if (payload.id && index < 0) throw new Error("Personal theme no longer exists. Save a copy instead.");
          if (index < 0 && current.personalThemes.length >= NEXORA.PERSONAL_THEME_LIMIT) throw new Error("Save up to 50 personal themes.");
          const id = payload.id || `personal-${crypto.randomUUID()}`;
          const personalThemes = [...current.personalThemes];
          if (index < 0) personalThemes.push({ id, ...theme }); else personalThemes[index] = { id, ...theme };
          next = { ...current, personalThemes, builderDraft: { ...theme, editingId: id } };
        } else if (action === "deletePersonal") {
          if (!current.personalThemes.some(theme => theme.id === payload)) throw new Error("Unknown personal theme.");
          next = { ...current, personalThemes: current.personalThemes.filter(theme => theme.id !== payload), favoriteThemeIds: current.favoriteThemeIds.filter(id => id !== payload),
            builderDraft: current.builderDraft?.editingId === payload ? { ...current.builderDraft, editingId: null } : current.builderDraft };
        } else if (action === "history") {
          const index = payload?.index;
          if (!Number.isInteger(index) || index < 0 || index >= current.appearanceHistory.length || (payload.at !== undefined && payload.at !== current.appearanceHistory[index].at)) throw new Error("History entry no longer exists.");
          next = { ...current, ...current.appearanceHistory[index].appearance, appearanceHistory: current.appearanceHistory.slice(0, index) };
        } else if (action === "toggle") {
          if (typeof current[payload] !== "boolean") throw new Error("Unknown toggle.");
          next = NEXORA.Validator.settings({ ...current, [payload]: !current[payload] });
        } else if (action === "component") {
          if (!Object.hasOwn(current.componentOverrides, payload)) throw new Error("Unknown component.");
          next = this._merge(current, { componentOverrides: { [payload]: !current.componentOverrides[payload] } });
        } else if (action === "favorite") {
          if (!NEXORA.getThemeById(payload) && !current.personalThemes.some(theme => theme.id === payload)) throw new Error("Unknown theme.");
          const favorites = new Set(current.favoriteThemeIds);
          if (favorites.has(payload)) favorites.delete(payload); else favorites.add(payload);
          next = { ...current, favoriteThemeIds: [...favorites] };
        } else if (action === "random") {
          const pool = NEXORA.PRESET_THEMES.filter(theme => theme.id !== current.activeThemeId);
          const theme = pool[Math.floor(Math.random() * pool.length)];
          next = { ...current, activeThemeId: theme.id, customThemeApplied: false, autoDarkMode: false };
        } else throw new Error("Unknown settings action.");
      }
      if (current && action !== "history") {
        const appearance = value => Object.fromEntries(NEXORA.APPEARANCE_KEYS.map(key => [key, structuredClone(value[key])]));
        const before = appearance(current);
        if (JSON.stringify(before) !== JSON.stringify(appearance(next))) next.appearanceHistory = [...current.appearanceHistory, { at: Math.max(Date.now(), (current.appearanceHistory.at(-1)?.at || 0) + 1), appearance: before }].slice(-NEXORA.HISTORY_LIMIT);
      }
      await new Promise((resolve, reject) => chrome.storage.local.set({ [NEXORA.STORAGE_KEY]: next }, () => {
        const error = chrome.runtime.lastError;
        if (error) reject(new Error(error.message)); else resolve();
      }));
      return next;
    };
    const result = this._writeQueue.then(run);
    this._writeQueue = result.catch(() => {});
    return result;
  },
  _request(action, payload) {
    if (this.isWriter) return this._commit(action, payload);
    return new Promise((resolve, reject) => chrome.runtime.sendMessage({ type: "nexora:settings", action, payload }, response => {
      const error = chrome.runtime.lastError;
      if (error) reject(new Error(error.message));
      else if (!response?.ok) reject(new Error(response?.error || "Unable to save settings."));
      else resolve(response.settings);
    }));
  },
  set(partial) { return this._request("patch", partial); },
  selectTheme(id) { return this._request("select", id); },
  setRepositoryTheme(repository, theme) { return this._request("repositoryTheme", { repository, theme }); },
  restore(settings) { return this._request("restore", settings); },
  reset() { return this._request("reset"); },
  toggle(key) { return this._request("toggle", key); },
  toggleComponent(id) { return this._request("component", id); },
  toggleFavorite(id) { return this._request("favorite", id); },
  randomTheme() { return this._request("random"); },
  savePersonal(theme, id = null) { return this._request("savePersonal", { theme, id }); },
  deletePersonal(id) { return this._request("deletePersonal", id); },
  restoreHistory(index, at) { return this._request("history", { index, at }); },
  onChange(callback) {
    const listener = (changes, area) => {
      if (area !== "local" || !changes[NEXORA.STORAGE_KEY]) return;
      callback(NEXORA.Validator.settings(changes[NEXORA.STORAGE_KEY].newValue || {}, { strict: false }));
    };
    chrome.storage.onChanged.addListener(listener);
    return () => chrome.storage.onChanged.removeListener(listener);
  }
};
