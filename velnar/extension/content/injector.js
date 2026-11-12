// masuliyate in file: sakhtane style tag ha va zadane ru sahfe
// hich vaght az eval ya innerHTML ba data khatarnak estefade nemikonim
globalThis.NEXORA = globalThis.NEXORA || {};

NEXORA.Injector = {
  _getOrCreateTag(id) {
    let tag = document.getElementById(id);
    if (!tag) {
      tag = document.createElement("style");
      tag.id = id;
      (document.head || document.documentElement).appendChild(tag);
    }
    return tag;
  },

  // css variable haye theme ro ru :root minevisim
  applyThemeVars(colors, layout) {
    const tag = this._getOrCreateTag(NEXORA.STYLE_TAG_ID);
    let css = ":root {\n";
    for (const key in NEXORA.CSS_VAR_MAP) {
      const value = colors[key];
      if (value) css += `  ${NEXORA.CSS_VAR_MAP[key]}: ${value};\n`;
    }
    // Contribution shades use RGB channels from the static accent colors.
    if (colors.accent && typeof gsHexToRgb === "function") {
      const rgb = gsHexToRgb(colors.accent);
      css += `  --gs-accent-rgb: ${rgb.r}, ${rgb.g}, ${rgb.b};\n`;
    }
    if (colors.accentSecondary && typeof gsHexToRgb === "function") {
      const rgb2 = gsHexToRgb(colors.accentSecondary);
      css += `  --gs-accent2-rgb: ${rgb2.r}, ${rgb2.g}, ${rgb2.b};\n`;
    }
    if (layout) {
      css += `  --gs-radius: ${layout.borderRadius ?? 8}px;\n`;
      css += `  --gs-shadow-opacity: ${(layout.shadowIntensity ?? 30) / 100};\n`;
      css += `  --gs-shadow-effective: color-mix(in srgb, var(--gs-shadow) ${layout.shadowIntensity ?? 30}%, transparent);\n`;
    }
    css += "}\n\n";
    css += this._primerCss();
    css += this._baseCss();
    if (tag.textContent !== css) tag.textContent = css;
  },

  // Primer React uses semantic tokens even when its generated class names change.
  // Include nested ThemeProviders: declarations on :root alone do not override them.
  // Token reference: https://primer.style/product/primitives/color/
  _primerDeclarations(tokens) {
    return `:root, [data-color-mode], [data-color-scheme], [data-light-theme], [data-dark-theme] {\n${Object.entries(tokens).map(([name, value]) => `  --${name}: ${value} !important;`).join("\n")}\n}\n`;
  },

  _primerCss() {
    const tokens = {};
    const map = (names, value) => names.split(" ").forEach(name => { tokens[name] = value; });
    map("bgColor-default color-canvas-default", "var(--gs-repo-bg)");
    map("bgColor-inset color-canvas-inset", "var(--gs-bg)");
    map("bgColor-muted color-canvas-subtle", "var(--gs-bg-secondary)");
    map("bgColor-neutral-muted bgColor-disabled color-neutral-muted", "var(--gs-bg-tertiary)");
    map("fgColor-default color-fg-default", "var(--gs-text-primary)");
    map("fgColor-muted fgColor-neutral color-fg-muted", "var(--gs-text-secondary)");
    map("fgColor-disabled color-fg-subtle color-primer-fg-disabled", "var(--gs-text-tertiary)");
    map("fgColor-link fgColor-accent color-accent-fg", "var(--gs-link)");
    map("borderColor-default color-border-default", "var(--gs-border)");
    map("borderColor-muted borderColor-neutral-muted color-border-muted color-border-subtle", "var(--gs-border-muted)");
    map("borderColor-emphasis borderColor-neutral-emphasis color-neutral-emphasis", "var(--gs-scrollbar-thumb)");
    map("borderColor-accent-emphasis focus-outlineColor", "var(--gs-accent)");
    map("bgColor-accent-muted color-accent-subtle", "color-mix(in srgb, var(--gs-accent) 14%, var(--gs-bg))");
    // Preserve semantic status/diff colors, transparent surfaces and scrim tokens.
    return this._primerDeclarations(tokens);
  },

  // rule haii ke hamishe active hastan, mostaghel az inke kodum component roshane
  _baseCss() {
    return `
html, body { background-color: var(--gs-bg) !important; color: var(--gs-text-primary) !important; }
main, [role="main"], .application-main, .Layout-main {
  background-color: var(--gs-bg) !important;
  color: var(--gs-text-primary) !important;
}
.color-bg-inset, .bgColor-inset {
  background-color: var(--gs-bg) !important;
}
.color-bg-default, .bgColor-default { background-color: var(--gs-repo-bg) !important; }
.color-bg-subtle, .bgColor-muted { background-color: var(--gs-bg-secondary) !important; }
.color-bg-emphasis, .bgColor-emphasis { background-color: var(--gs-text-primary) !important; color: var(--gs-bg) !important; }
/* Timeline rows and their text share the enclosing card's surface. */
.TimelineItem, .TimelineItem-body:not(.Box), [data-testid="issue-pr-title"] { background-color: transparent !important; }
a { color: var(--gs-link); }
a:hover { color: var(--gs-link-hover); }
::selection { background: var(--gs-accent); color: var(--gs-button-text); }
::-webkit-scrollbar { width: 12px; height: 12px; }
::-webkit-scrollbar-thumb { background: var(--gs-scrollbar-thumb) !important; border-radius: 8px; }
::-webkit-scrollbar-track { background: var(--gs-bg-secondary) !important; }
.color-fg-default { color: var(--gs-text-primary); }
.color-fg-muted, .text-small.color-fg-muted { color: var(--gs-text-secondary) !important; }
.color-fg-subtle { color: var(--gs-text-tertiary) !important; }
.color-fg-success, .octicon-check.color-fg-success { color: var(--gs-success) !important; }
.color-fg-attention { color: var(--gs-warning) !important; }
.color-fg-danger { color: var(--gs-error) !important; }
.color-border-default, .color-border-muted, hr { border-color: var(--gs-border) !important; }
/* IMPORTANT - in rule hamishe fa'ale, hata age user component "Dropdowns & Menus"
   ro khamush kone: hich backdrop/scrim e safheh nabayad opaque beshe. In daghigh oon
   bug e "cover kardane safhe" bud (vaghti ye rule e digar ehtemalan .Overlay ro be
   taur e kolli opaque mikard) - pas in safety net mostaghel az hameye component ha
   hamishe active mimune */
dialog::backdrop,
.Overlay-backdrop,
[class*="Backdrop" i],
[data-backdrop],
.modal-backdrop {
  background-color: transparent !important;
  backdrop-filter: none !important;
}
`;
  },

  // in ja har bakhsh (component) ye block e joda CSS daare
  // selector ha az tarkib class, data-attribute va aria estefade mikonan
  // ta hardche mishe be class haye shekananda vabaste nabashim
  _componentBlocks() {
    const textButton = ':where(.btn-link, .btn-invisible, .Button--invisible, .pinned-items-setting-link, [data-variant="invisible"], .p-0.border-0, .tmp-p-0.border-0)';
    return {
      navbar: `
.AppHeader, div[data-testid="global-navigation"], .Header, .AppHeader-globalBar, .AppHeader-context, body > header {
  background-color: var(--gs-navbar-bg) !important;
  color: var(--gs-navbar-text) !important;
  border-color: var(--gs-border) !important;
}
header.AppHeader a, .AppHeader-context a, .Header a { color: var(--gs-navbar-text) !important; }

/* icon-only buttons + search inside the header should stay subtle, never a solid accent block.
   in az .Button/[class*=ButtonBase] tarafe kolliye buttons block "ezafe" nemikone
   chun in selector ha (header ...) specificity balatari daran va ru hamun override mishan */
header.AppHeader .Button, header.AppHeader .btn, header.AppHeader button,
.AppHeader-globalBar .Button, .AppHeader-actions .Button, .AppHeader-actions button,
.AppHeader-search, .AppHeader-search .Button, .AppHeader-search button {
  background-color: var(--gs-bg-secondary) !important;
  border: 1px solid var(--gs-border) !important;
  color: var(--gs-navbar-text) !important;
  box-shadow: none !important;
}
header.AppHeader .Button:hover, .AppHeader-globalBar .Button:hover,
.AppHeader-actions .Button:hover, .AppHeader-search:hover {
  background-color: var(--gs-hover-bg) !important;
  border-color: var(--gs-accent) !important;
}
/* avatar dropdown trigger nabayad box beshe */
header.AppHeader summary, .AppHeader-actions summary {
  background-color: transparent !important;
  border-color: transparent !important;
}`,

      sidebar: `
.Layout-sidebar, .BorderGrid, aside[aria-label], .repository-content .Layout-sidebar,
.dashboard-sidebar, .feed-left-sidebar, .feed-right-sidebar {
  background-color: var(--gs-sidebar-bg) !important;
  border-color: var(--gs-border) !important;
}`,

      repoCards: `
.Box, [data-testid="results-list"] > div,
[data-testid="feed-item"], [data-testid="feed-card"] {
  background-color: var(--gs-repo-bg) !important;
  border-color: var(--gs-border) !important;
  border-radius: var(--gs-radius) !important;
}
/* A GitHub utility-class row is not necessarily a card. Only inset repository
   list entries inside the profile's repository list, keeping native controls. */
#user-repositories-list > ul > li {
  box-sizing: border-box;
  min-width: 0;
  background-color: var(--gs-repo-bg) !important;
  border: 1px solid var(--gs-border) !important;
  border-radius: var(--gs-radius) !important;
  padding-inline: clamp(12px, 2vw, 20px) !important;
  margin-block: 0 12px !important;
}
#user-repositories-list > ul > li [itemprop~="name"] { overflow-wrap: anywhere; }
/* Rows in a shared Box remain joined; round only the container's outer corners. */
.Box > .Box-row { border-color: var(--gs-border) !important; border-radius: 0 !important; }
.Box > .Box-row:first-child { border-start-start-radius: var(--gs-radius) !important; border-start-end-radius: var(--gs-radius) !important; }
.Box > .Box-row:last-child { border-end-start-radius: var(--gs-radius) !important; border-end-end-radius: var(--gs-radius) !important; }
/* The profile overview shares an edge with the graph above it. */
.js-yearly-contributions .graph-before-activity-overview { border-radius: var(--gs-radius); }
.Box.activity-overview-box {
  border-start-start-radius: 0 !important;
  border-start-end-radius: 0 !important;
}
.Box:not(:where(.activity-overview-box)):hover { border-color: var(--gs-accent) !important; }
/* Primer's header reaches the outer border of its Box. Match that curve. */
.Box > .Box-header:first-child {
  border-start-start-radius: inherit;
  border-start-end-radius: inherit;
}
.Box > .Box-footer:last-child {
  border-end-start-radius: inherit;
  border-end-end-radius: inherit;
}
.Box > .Box-row:hover { background-color: var(--gs-hover-bg) !important; }`,

      buttons: `
/* halate defaulte dokme ha: sobresh be surface theme, na ye block tokh rangi.
   faghat dokme haye "primary" (asli/submit) rang e accent solid migiran, in shabihe
   tarahi haye vaghei hast: rang faghat baraye action asli estefade beshe */
:is(.btn, .Button, [class*="ButtonBase"]):not(${textButton}) {
  background-color: var(--gs-bg-tertiary) !important;
  color: var(--gs-text-primary) !important;
  border: 1px solid var(--gs-border) !important;
  border-radius: var(--gs-radius) !important;
  box-shadow: none;
}
:is(.btn, .Button):not(${textButton}):hover { background-color: var(--gs-hover-bg) !important; border-color: var(--gs-accent) !important; }
:is(.btn, .Button):not(${textButton}):active { background-color: var(--gs-active-bg) !important; }

.btn-primary, .Button--primary, [data-variant="primary"] {
  background-color: var(--gs-button) !important;
  color: var(--gs-button-text) !important;
  border-color: transparent !important;
  box-shadow: 0 2px 8px var(--gs-shadow-effective, var(--gs-shadow));
}
.btn-primary:hover, .Button--primary:hover, [data-variant="primary"]:hover {
  background-color: var(--gs-button-hover) !important;
}

.btn-danger, .Button--danger, [data-variant="danger"] {
  background-color: var(--gs-error) !important;
  color: #ffffff !important;
  border-color: transparent !important;
}`,

      inputs: `
input, textarea, select, .FormControl-input, .form-control {
  background-color: var(--gs-bg-secondary) !important;
  color: var(--gs-text-primary) !important;
  border-color: var(--gs-border) !important;
  border-radius: var(--gs-radius) !important;
}
input:focus, textarea:focus, select:focus { border-color: var(--gs-accent) !important; }`,

      searchBox: `
.header-search-input, .search-input, [data-testid="search-input"], .AppHeader-search input {
  background-color: var(--gs-bg-secondary) !important;
  color: var(--gs-text-primary) !important;
  border-color: var(--gs-border) !important;
  border-radius: var(--gs-radius) !important;
}`,

      codeBlocks: `
pre, code, .highlight, .blob-code, .blob-code-inner, .react-code-text, .CodeMirror {
  background-color: var(--gs-code-bg) !important;
  color: var(--gs-code-text) !important;
}
.blob-num { background-color: var(--gs-bg-secondary) !important; color: var(--gs-text-tertiary) !important; }`,

      markdown: `
.markdown-body, .comment-body, article.markdown-body {
  background-color: transparent !important;
  color: var(--gs-text-primary) !important;
}
.markdown-body pre, .markdown-body code { background-color: var(--gs-code-bg) !important; }
.markdown-body blockquote { border-color: var(--gs-border) !important; color: var(--gs-text-secondary) !important; }
.markdown-body table tr { background-color: var(--gs-bg) !important; border-color: var(--gs-border) !important; }
.markdown-body table tr:nth-child(2n) { background-color: var(--gs-bg-secondary) !important; }`,

      issues: `
.js-issue-row, .Box-row.js-navigation-item {
  background-color: var(--gs-bg) !important;
  border-color: var(--gs-border) !important;
}
.Label, .IssueLabel { border-color: var(--gs-border) !important; }
.State { border-radius: var(--gs-radius) !important; }`,

      pullRequests: `
.pr-toolbar, .diffbar, .file-header, .merge-status-list, .merge-status-item {
  background-color: var(--gs-bg-secondary) !important;
  border-color: var(--gs-border) !important;
}
.merge-status-icon .octicon-check { color: var(--gs-success) !important; }`,

      profile: `
.vcard-names, .h-card, .user-profile-bio, .UnderlineNav {
  background-color: transparent !important;
  border-color: var(--gs-border) !important;
}
.user-profile-nav { background-color: var(--gs-bg) !important; border-color: var(--gs-border) !important; }
.avatar, img.avatar { border-color: var(--gs-border) !important; border-radius: var(--gs-radius) !important; }`,

      followers: `
.follow-list, .follow-list-item, [data-testid="followers-list"] {
  background-color: var(--gs-bg-secondary) !important;
  border-color: var(--gs-border) !important;
  border-radius: var(--gs-radius) !important;
}`,

      notifications: `
.notifications-list, .notification-list-item, [data-testid="notifications-list"] {
  background-color: var(--gs-bg-secondary) !important;
  border-color: var(--gs-border) !important;
}
.notification-list-item:hover { background-color: var(--gs-hover-bg) !important; }`,

      commitList: `
.commit, .Box-row[id^="commit"] {
  background-color: var(--gs-repo-bg) !important;
  border-color: var(--gs-border) !important;
}
.commit:hover { background-color: var(--gs-hover-bg) !important; }`,

      fileExplorer: `
.js-tree-browser-result, [role="tree"], [role="treeitem"], .react-directory-filename-column {
  background-color: var(--gs-repo-bg) !important;
  color: var(--gs-text-primary) !important;
}
[role="treeitem"]:hover, [role="treeitem"][aria-selected="true"] { background-color: var(--gs-hover-bg) !important; }`,

      dropdowns: `
.dropdown-menu, .SelectMenu-modal, [role="menu"], [role="listbox"], [role="dialog"], .tooltipped::after {
  background-color: var(--gs-dropdown-bg) !important;
  border-color: var(--gs-border) !important;
  border-radius: var(--gs-radius) !important;
  box-shadow: 0 8px 24px var(--gs-shadow-effective, var(--gs-shadow)) !important;
}
.tooltipped::after { background-color: var(--gs-tooltip-bg) !important; }
[role="menuitem"]:hover, .SelectMenu-item:hover { background-color: var(--gs-hover-bg) !important; }
/* IMPORTANT: ".Overlay" ru GitHub ham baraye panel e dialog ham gahi baraye
   khode backdrop/scrim e poshte safhe estefade mishe, va chun DOM e daghigh e
   GitHub dar dastres nist, amdan az style dadan be khode ".Overlay" khodداری
   mikonim va faghat sub-part haye shenakhte shode (body/header/footer) ro
   rang mikonim - in daghigh oon bug e "cover kardane safhe" bud ke ghablan
   ba style dadan be ".Overlay" be taur e kolli ijad shode bud. Safety net e
   asli (transparent kardane backdrop) dar _baseCss() hast va hamishe active-e */
.Overlay-body, .Overlay-header, .Overlay-footer {
  background-color: var(--gs-dropdown-bg) !important;
  border-color: var(--gs-border) !important;
}`,

      diffs: `
.diff-table, .blob-code-addition, .blob-code-deletion, .file-diff-split {
  border-color: var(--gs-border) !important;
}
.blob-code-addition { background-color: color-mix(in srgb, var(--gs-success) 15%, var(--gs-code-bg)) !important; }
.blob-code-deletion { background-color: color-mix(in srgb, var(--gs-error) 15%, var(--gs-code-bg)) !important; }`,

      contributionGraph: `
/* nemudare contribution ro az sabze sabete GitHub be rang e accent e theme tabdil mikonim
   ta vaghean ba baghiye safhe hamrang bashe, na ye jazire sabz vasate ye theme mokhtalef */
.js-calendar-graph-table [data-level="0"], .ContributionCalendar-day[data-level="0"] {
  fill: var(--gs-bg-secondary) !important;
  background-color: var(--gs-bg-secondary) !important;
  stroke: var(--gs-border) !important;
}
.js-calendar-graph-table [data-level="1"], .ContributionCalendar-day[data-level="1"] {
  fill: rgba(var(--gs-accent-rgb), 0.28) !important;
  background-color: rgba(var(--gs-accent-rgb), 0.28) !important;
}
.js-calendar-graph-table [data-level="2"], .ContributionCalendar-day[data-level="2"] {
  fill: rgba(var(--gs-accent-rgb), 0.5) !important;
  background-color: rgba(var(--gs-accent-rgb), 0.5) !important;
}
.js-calendar-graph-table [data-level="3"], .ContributionCalendar-day[data-level="3"] {
  fill: rgba(var(--gs-accent-rgb), 0.75) !important;
  background-color: rgba(var(--gs-accent-rgb), 0.75) !important;
}
.js-calendar-graph-table [data-level="4"], .ContributionCalendar-day[data-level="4"] {
  fill: var(--gs-accent) !important;
  background-color: var(--gs-accent) !important;
}
.js-calendar-graph, .js-calendar-graph-table { background-color: transparent !important; }
.js-yearly-contributions .filter-item.selected, .js-yearly-contributions .filter-item[aria-current="true"],
.js-yearly-contributions .filter-item[aria-current="page"] { background-color: var(--gs-button) !important; color: var(--gs-button-text) !important; }
.js-calendar-graph-table th, .js-calendar-graph text { fill: var(--gs-text-secondary) !important; color: var(--gs-text-secondary) !important; }`
    };
  },

  _componentTokens() {
    const tokens = { navbar: {}, buttons: {}, inputs: {}, dropdowns: {} };
    const map = (component, names, value) => names.split(" ").forEach(name => { tokens[component][name] = value; });
    map("navbar", "header-bgColor color-header-bg", "var(--gs-navbar-bg)");
    map("navbar", "header-fgColor-default header-fgColor-logo color-header-text color-header-logo", "var(--gs-navbar-text)");
    map("navbar", "header-borderColor-divider", "var(--gs-border)");
    map("buttons", "button-default-bgColor-rest color-btn-bg", "var(--gs-bg-tertiary)");
    map("buttons", "button-default-bgColor-hover color-btn-hover-bg button-invisible-bgColor-hover button-outline-bgColor-rest", "var(--gs-hover-bg)");
    map("buttons", "button-default-bgColor-active button-default-bgColor-selected color-btn-active-bg color-btn-selected-bg button-invisible-bgColor-active", "var(--gs-active-bg)");
    map("buttons", "button-default-fgColor-rest button-invisible-fgColor-rest button-invisible-fgColor-hover button-invisible-fgColor-active color-btn-text", "var(--gs-text-primary)");
    map("buttons", "button-default-borderColor-rest button-default-borderColor-hover button-default-borderColor-active color-btn-border color-btn-hover-border", "var(--gs-border)");
    map("buttons", "button-default-bgColor-disabled button-primary-bgColor-disabled", "var(--gs-bg-tertiary)");
    map("buttons", "button-default-fgColor-disabled button-primary-fgColor-disabled button-invisible-fgColor-disabled", "var(--gs-text-tertiary)");
    map("buttons", "button-invisible-iconColor-rest button-invisible-iconColor-hover", "var(--gs-text-secondary)");
    map("buttons", "button-primary-bgColor-rest color-btn-primary-bg", "var(--gs-button)");
    map("buttons", "button-primary-bgColor-hover button-primary-bgColor-active color-btn-primary-hover-bg color-btn-primary-selected-bg", "var(--gs-button-hover)");
    map("buttons", "button-primary-fgColor-rest button-primary-iconColor-rest color-btn-primary-text", "var(--gs-button-text)");
    map("buttons", "button-primary-borderColor-rest button-primary-borderColor-hover button-primary-borderColor-active color-btn-primary-border", "var(--gs-button)");
    map("inputs", "control-bgColor-rest control-bgColor-selected color-input-bg", "var(--gs-bg-secondary)");
    map("inputs", "control-bgColor-hover control-transparent-bgColor-hover", "var(--gs-hover-bg)");
    map("inputs", "control-bgColor-active control-transparent-bgColor-active control-transparent-bgColor-selected", "var(--gs-active-bg)");
    map("inputs", "control-borderColor-rest control-borderColor-selected color-input-border", "var(--gs-border)");
    map("inputs", "control-fgColor-rest", "var(--gs-text-primary)");
    map("inputs", "control-fgColor-placeholder control-iconColor-rest", "var(--gs-text-secondary)");
    map("inputs", "control-checked-bgColor-rest control-checked-bgColor-hover control-checked-bgColor-active control-checked-borderColor-rest", "var(--gs-button)");
    map("inputs", "control-checked-fgColor-rest", "var(--gs-button-text)");
    map("dropdowns", "overlay-bgColor color-canvas-overlay", "var(--gs-dropdown-bg)");
    map("dropdowns", "overlay-borderColor", "var(--gs-border)");
    return tokens;
  },

  applyComponents(overrides) {
    const tag = this._getOrCreateTag(NEXORA.COMPONENTS_TAG_ID);
    const blocks = this._componentBlocks();
    const componentTokens = this._componentTokens();
    let css = "";
    NEXORA.COMPONENTS.forEach((c) => {
      if (!overrides || overrides[c.id] !== false) {
        const tokens = componentTokens[c.id];
        if (tokens) css += this._primerDeclarations(tokens);
        css += blocks[c.id] || "";
        css += "\n";
      }
    });
    if (tag.textContent !== css) tag.textContent = css;
  },

  applyTypography(typography) {
    const tag = this._getOrCreateTag(NEXORA.TYPOGRAPHY_TAG_ID);
    if (!typography) {
      tag.textContent = "";
      return;
    }
    let css = "";
    const bodyRules = [];
    if (typography.fontFamily) bodyRules.push(`font-family: ${typography.fontFamily} !important;`);
    if (typography.fontSize) bodyRules.push(`font-size: ${typography.fontSize}px !important;`);
    if (typography.lineHeight) bodyRules.push(`line-height: ${typography.lineHeight} !important;`);
    if (typography.fontWeight) bodyRules.push(`font-weight: ${typography.fontWeight} !important;`);
    if (bodyRules.length) {
      css += `body, .markdown-body, .Header, .btn { ${bodyRules.join(" ")} }\n`;
    }
    if (typography.codeFont) {
      css += `pre, code, .blob-code, .CodeMirror { font-family: ${typography.codeFont} !important; }\n`;
    }
    if (tag.textContent !== css) tag.textContent = css;
  },

  applyReviewFocus() {
    const tag = this._getOrCreateTag(NEXORA.REVIEW_FOCUS_TAG_ID);
    const customCss = document.getElementById(NEXORA.CUSTOM_CSS_TAG_ID);
    if (customCss?.previousElementSibling !== tag) customCss?.before(tag);
    const tree = ':is(file-tree, #diff_file_tree, #diff-file-tree, [data-testid="diff-file-tree"], [role="tree"][aria-label="File Tree" i])';
    tag.textContent = `
:root, [data-color-mode], [data-light-theme], [data-dark-theme] {
  --nexora-diff-added: color-mix(in srgb, var(--gs-success) 30%, var(--gs-code-bg));
  --nexora-diff-removed: color-mix(in srgb, var(--gs-error) 30%, var(--gs-code-bg));
  --diffBlob-addition-bgColor-line: var(--nexora-diff-added) !important;
  --diffBlob-deletion-bgColor-line: var(--nexora-diff-removed) !important;
  --diffBlob-addition-fgColor-text: var(--gs-code-text) !important;
  --diffBlob-deletion-fgColor-text: var(--gs-code-text) !important;
  --color-diff-blob-addition-line-bg: var(--nexora-diff-added) !important;
  --color-diff-blob-deletion-line-bg: var(--nexora-diff-removed) !important;
}
:is(main, #repo-content-pjax-container) :is(.container-xl, .container-lg),
main:is(.container-xl, .container-lg) { max-width: none !important; }
[data-target~="diff-layout.layoutContainer"] {
  --Layout-sidebar-width: 0px !important;
  --Layout-gutter: 0px !important;
}
[data-target~="diff-layout.sidebarContainer"],
:is(.Layout-sidebar, aside, [class*="PageLayout-Pane"]):has(${tree}),
${tree} { display: none !important; }
[data-target~="diff-layout.mainContainer"], .Layout-main:has(:is(#files, .diff-table, [data-testid="virtualized-diffs-list"])) {
  min-width: 0;
  width: 100% !important;
}
:is(.blob-code-addition, [data-line-type="addition"], [data-line-type="ADDITION"]) {
  background-color: var(--nexora-diff-added) !important;
  box-shadow: inset 3px 0 var(--gs-success);
}
:is(.blob-code-deletion, [data-line-type="deletion"], [data-line-type="DELETION"]) {
  background-color: var(--nexora-diff-removed) !important;
  box-shadow: inset 3px 0 var(--gs-error);
}`;
  },

  applyCustomCss(cssText, enabled) {
    const tag = this._getOrCreateTag(NEXORA.CUSTOM_CSS_TAG_ID);
    if (!enabled || !cssText) {
      tag.textContent = "";
      return;
    }
    const check = NEXORA.Validator.validateCss(cssText);
    if (!check.valid) {
      tag.textContent = "";
      return;
    }
    tag.textContent = NEXORA.Validator.sanitize(cssText);
  },

  removeAll() {
    [NEXORA.STYLE_TAG_ID, NEXORA.CUSTOM_CSS_TAG_ID, NEXORA.TYPOGRAPHY_TAG_ID, NEXORA.COMPONENTS_TAG_ID, NEXORA.REVIEW_FOCUS_TAG_ID, NEXORA.ANIMATIONS_TAG_ID, NEXORA.WEB_SWINGER_STYLE_ID].forEach((id) => {
      const tag = document.getElementById(id);
      if (tag) tag.remove();
    });
    const swinger = document.getElementById(NEXORA.WEB_SWINGER_ELEMENT_ID);
    if (swinger) swinger.remove();
  }
};
