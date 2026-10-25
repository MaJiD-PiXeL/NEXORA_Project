(() => {
  const worlds = VELNAR.PRESET_THEMES.filter(theme => theme.scene);
  const picker = document.getElementById("worldPicker");
  const description = {
    "spider-man": "Web traces across the frame, a charged palette, and an animated contribution-grid story.",
    "the-last-of-us": "Muted survival tones, organic texture, and a quiet scene of spores, light, and exploration.",
    "red-dead": "Frontier light, dusty depth, and a Dead Eye moment built around your activity graph.",
    "rick-and-morty": "Portal energy, surreal greens, and a brisk cross-dimensional loop.",
    "iron-man": "Arc-reactor light, technical HUD detail, and a compact repulsor flight scene."
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
    document.getElementById("heroThemeName").textContent = theme.name;
    document.getElementById("heroThemeTagline").textContent = theme.tagline;
    document.querySelector("#heroPill b").textContent = String(index + 1).padStart(2, "0");
    document.getElementById("featureIndex").textContent = `WORLD ${String(index + 1).padStart(2, "0")} / ${String(worlds.length).padStart(2, "0")}`;
    document.getElementById("featureName").textContent = theme.name;
    document.getElementById("featureTagline").textContent = theme.tagline;
    document.getElementById("featureDescription").textContent = description[theme.id] || VELNAR.CollectionArt.descriptions[theme.id];
    document.getElementById("featureArt").innerHTML = VELNAR.SceneArt.svg(theme.id);
    document.querySelector(".world-feature a").href = `../extension/preview/preview.html#${theme.id}`;
    picker.querySelectorAll("button").forEach(button => button.setAttribute("aria-pressed", String(button.dataset.id === theme.id)));
  }
  worlds.forEach((theme, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.id = theme.id;
    button.innerHTML = `<i style="background:${theme.colors.accent}"></i><span>${String(index + 1).padStart(2, "0")}</span><b>${theme.name}</b>`;
    button.addEventListener("click", () => select(theme, index));
    picker.append(button);
  });
  select(worlds[0], 0);
})();
