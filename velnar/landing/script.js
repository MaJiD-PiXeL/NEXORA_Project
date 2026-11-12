(() => {
  const worlds = NEXORA.PRESET_THEMES.filter(theme => theme.scene);
  const picker = document.getElementById("worldPicker");
  const search = document.getElementById("worldSearch");
  const worldCount = document.getElementById("worldCount");
  const worldEmpty = document.getElementById("worldEmpty");
  const filters = document.getElementById("worldFilters");
  const categoryById = {
    "spider-man":"comics", "the-last-of-us":"games", "red-dead":"games", "rick-and-morty":"animation", "iron-man":"comics",
    batman:"comics", "star-wars":"film-tv", "harry-potter":"film-tv", deadpool:"comics", "stranger-things":"film-tv",
    wednesday:"film-tv", "squid-game":"film-tv", "god-of-war":"games", "assassins-creed":"games", minecraft:"games"
  };
  const categoryLabels = { all:"All worlds", "film-tv":"Film & TV", games:"Games", comics:"Comics", animation:"Animation" };
  let activeCategory = "all";
  const description = {
    "spider-man": "Deep blue surfaces, red accents and coordinated contribution colors.",
    "the-last-of-us": "Muted survival tones with forest greens and soft highlights.",
    "red-dead": "Warm frontier reds, dusty surfaces and sunset highlights.",
    "rick-and-morty": "Surreal greens and vivid accents over a deep background.",
    "iron-man": "Arc-reactor blues and gold highlights on dark surfaces."
  };
  for (let i = 0; i < 182; i++) {
    const cell = document.createElement("i");
    cell.style.setProperty("--level", (i * 11 + Math.floor(i / 7)) % 5);
    document.getElementById("demoGrid").append(cell);
  }
  for (let i = 0; i < 196; i++) {
    const cell = document.createElement("i");
    cell.style.setProperty("--level", (i * 7 + Math.floor(i / 5)) % 5);
    document.getElementById("previewCells").append(cell);
  }
  function select(theme, index) {
    const root = document.documentElement;
    root.style.setProperty("--world-bg", theme.colors.background);
    root.style.setProperty("--world-surface", theme.colors.backgroundSecondary);
    root.style.setProperty("--world-accent", theme.colors.accent);
    root.style.setProperty("--world-accent-two", theme.colors.accentSecondary);
    root.style.setProperty("--world-text", theme.colors.textPrimary);
    document.getElementById("heroThemeName").textContent = theme.name;
    document.getElementById("heroThemeTagline").textContent = theme.tagline;
    document.querySelector("#heroPill b").textContent = String(index + 1).padStart(2, "0");
    document.getElementById("featureIndex").textContent = `WORLD ${String(index + 1).padStart(2, "0")} / ${String(worlds.length).padStart(2, "0")}`;
    document.getElementById("featureName").textContent = theme.name;
    document.getElementById("featureTagline").textContent = theme.tagline;
    document.getElementById("featureDescription").textContent = description[theme.id] || `${theme.name}: a static palette for your GitHub workspace.`;
    document.getElementById("featureArt").innerHTML = NEXORA.SceneArt.svg(theme.id);
    document.getElementById("featurePreviewLink").href = `../extension/preview/preview.html#${theme.id}`;
    document.getElementById("studioThemeLabel").textContent = `Live theme · ${theme.name}`;
    document.getElementById("studioThemeName").value = theme.name;
    document.getElementById("studioOpenLink").href = `../extension/preview/preview.html#${theme.id}`;
    for (const [key, color] of [["Bg",theme.colors.background],["Surface",theme.colors.backgroundSecondary],["Accent",theme.colors.accent],["Text",theme.colors.textPrimary]]) {
      document.getElementById(`studio${key}Swatch`).style.background = color;
      document.getElementById(`studio${key}Value`).textContent = color.toUpperCase();
    }
    picker.querySelectorAll("button").forEach(button => {
      const selected = button.dataset.id === theme.id;
      button.setAttribute("aria-pressed", String(selected));
      button.tabIndex = selected ? 0 : -1;
    });
  }
  worlds.forEach((theme, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.id = theme.id;
    button.dataset.category = categoryById[theme.id] || "film-tv";
    button.setAttribute("aria-label", `${theme.name} theme`);
    button.setAttribute("aria-pressed", "false");
    button.tabIndex = index === 0 ? 0 : -1;
    const swatches = document.createElement("span");
    swatches.className = "world-swatches";
    for (const color of [theme.colors.accent, theme.colors.accentSecondary]) {
      const dot = document.createElement("i");
      dot.style.setProperty("--swatch", color);
      swatches.append(dot);
    }
    const number = document.createElement("span");
    number.className = "world-number";
    number.textContent = String(index + 1).padStart(2, "0");
    const name = document.createElement("b");
    name.textContent = theme.name;
    button.append(swatches, number, name);
    button.addEventListener("click", () => select(theme, index));
    button.addEventListener("keydown", event => {
      if (!["ArrowDown", "ArrowRight", "ArrowUp", "ArrowLeft", "Home", "End"].includes(event.key)) return;
      event.preventDefault();
      const buttons = [...picker.querySelectorAll("button:not([hidden])")];
      const current = buttons.indexOf(button);
      const next = event.key === "Home" ? 0 : event.key === "End" ? buttons.length - 1 : (current + (["ArrowDown", "ArrowRight"].includes(event.key) ? 1 : -1) + buttons.length) % buttons.length;
      buttons[next]?.focus();
      buttons[next]?.click();
    });
    picker.append(button);
  });
  for (const [id, label] of Object.entries(categoryLabels)) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = label;
    button.dataset.category = id;
    button.setAttribute("aria-pressed", String(id === activeCategory));
    button.addEventListener("click", () => {
      activeCategory = id;
      filters.querySelectorAll("button").forEach(item => item.setAttribute("aria-pressed", String(item.dataset.category === id)));
      filterWorlds();
    });
    filters.append(button);
  }
  const compareA = document.getElementById("compareA");
  const compareB = document.getElementById("compareB");
  for (const theme of worlds) {
    for (const select of [compareA, compareB]) {
      const option = document.createElement("option");
      option.value = theme.id;
      option.textContent = theme.name;
      select.append(option);
    }
  }
  compareB.value = worlds[1]?.id || worlds[0].id;
  function renderComparison() {
    const a = worlds.find(theme => theme.id === compareA.value) || worlds[0];
    const b = worlds.find(theme => theme.id === compareB.value) || worlds[1] || worlds[0];
    const root = document.getElementById("compareResult");
    root.replaceChildren();
    for (const theme of [a,b]) {
      const card = document.createElement("article");
      card.className = "compare-card";
      const colors = theme.colors;
      card.innerHTML = `<div class="compare-preview" style="--compare-bg:${colors.background};--compare-surface:${colors.backgroundSecondary};--compare-accent:${colors.accent};--compare-text:${colors.textPrimary}"><div class="compare-preview-top"></div><div class="compare-preview-content"><b>nexora / workspace</b><span>124 contributions</span><i></i><i></i><i></i></div></div><div class="compare-card-heading"><div><p>WORLD ${String(worlds.indexOf(theme)+1).padStart(2,"0")}</p><h4>${theme.name}</h4><span>${theme.tagline}</span></div><a href="../extension/preview/preview.html#${theme.id}" aria-label="Open ${theme.name} preview">Preview ↗</a></div><div class="compare-swatches"><div><i style="--swatch:${colors.background}"></i><span>Background<code>${colors.background.toUpperCase()}</code></span></div><div><i style="--swatch:${colors.backgroundSecondary}"></i><span>Surface<code>${colors.backgroundSecondary.toUpperCase()}</code></span></div><div><i style="--swatch:${colors.accent}"></i><span>Accent<code>${colors.accent.toUpperCase()}</code></span></div><div><i style="--swatch:${colors.textPrimary}"></i><span>Text<code>${colors.textPrimary.toUpperCase()}</code></span></div></div>`;
      root.append(card);
    }
  }
  compareA.addEventListener("change", renderComparison);
  compareB.addEventListener("change", renderComparison);
  renderComparison();
  function filterWorlds() {
    const query = search.value.trim().toLocaleLowerCase();
    let visible = 0;
    picker.querySelectorAll("button").forEach(button => {
      const matches = button.textContent.toLocaleLowerCase().includes(query) && (activeCategory === "all" || button.dataset.category === activeCategory);
      button.hidden = !matches;
      if (matches) visible++;
    });
    const detail = query ? "matching your search" : activeCategory === "all" ? "pick a palette" : categoryLabels[activeCategory];
    worldCount.replaceChildren(document.createTextNode(`${visible} ${visible === 1 ? "world" : "worlds"} `));
    const separator = document.createElement("span"); separator.textContent = "·";
    worldCount.append(separator, document.createTextNode(` ${detail}`));
    worldEmpty.hidden = visible !== 0;
  }
  search.addEventListener("input", filterWorlds);
  search.addEventListener("keydown", event => {
    if (event.key === "Enter") {
      const first = picker.querySelector("button:not([hidden])");
      if (first) { event.preventDefault(); first.focus(); first.click(); }
    }
    if (event.key === "Escape") { search.value = ""; filterWorlds(); }
  });
  document.addEventListener("keydown", event => {
    if (event.key === "/" && !event.ctrlKey && !event.metaKey && !["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)) {
      event.preventDefault(); search.focus();
    }
  });
  const menuToggle = document.getElementById("menuToggle");
  const navigation = document.getElementById("siteNavigation");
  menuToggle.addEventListener("click", () => {
    const open = menuToggle.getAttribute("aria-expanded") !== "true";
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
    navigation.classList.toggle("is-open", open);
  });
  navigation.addEventListener("click", event => {
    if (event.target.closest("a")) {
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "Open navigation");
      navigation.classList.remove("is-open");
    }
  });
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && menuToggle.getAttribute("aria-expanded") === "true") {
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "Open navigation");
      navigation.classList.remove("is-open");
      menuToggle.focus();
    }
  });
  const copyStatus = document.getElementById("copyStatus");
  document.querySelectorAll(".copy-install").forEach(button => button.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(button.dataset.copy);
      copyStatus.textContent = `${button.dataset.copy} copied. Paste it into your browser’s address bar.`;
    } catch {
      copyStatus.textContent = `Copy was unavailable. Enter ${button.dataset.copy} in your browser’s address bar.`;
    }
  }));
  select(worlds[0], 0);
})();
