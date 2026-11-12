globalThis.NEXORA = globalThis.NEXORA || {};

NEXORA.Studio = {
  create({ getSettings, apply }) {
    const $ = id => document.getElementById(id);
    const UI = NEXORA.UI;
    let selected = NEXORA.Catalog.themes(getSettings()).find(theme => NEXORA.Catalog.isActive(theme, getSettings()))?.id || UI.activeThemeId(getSettings());
    let surface = "repository";
    const templates = {
      review: `<div class="sample-header"><span>⑂</span> <strong>Improve theme readability</strong><small>#42</small></div><div class="sample-review"><h3>Pull request · Files changed</h3><p class="sample-review-status">✓ All checks passed · Ready for review</p><div class="sample-diff"><span>  src/theme.ts</span><span class="deleted">− const contrast = 2.1;</span><span class="added">+ const contrast = 4.5;</span><span class="added">+ ensureReadable(theme);</span><span>  export default theme;</span></div><div class="sample-review-comment"><strong>Reviewer</strong><p>The updated colors are easier to read.</p><small>Comment on added lines</small><button type="button" tabindex="-1">Resolve conversation</button></div></div>`,
      repository: `<div class="sample-header"><span>⌘</span> workspace / <strong>project</strong><small>Public</small></div><div class="sample-tabs"><b>Code</b><span>Issues <i>3</i></span><span>Pull requests</span></div><div class="sample-content"><div class="sample-tools"><span>⑂ main</span><b>Code ▾</b></div><div class="sample-files"><div><span>▱ src</span><small>Refine the details</small></div><div><span>▱ components</span><small>Build something useful</small></div><div><span>◇ README.md</span><small>Getting started</small></div><div><span>◇ package.json</span><small>Update dependencies</small></div></div><div class="sample-readme"><small>README.md</small><h3>A place for your next idea.</h3><p>Thoughtfully built. Ready to make your own.</p><span class="sample-tag">TypeScript</span><span class="sample-tag">Open source</span></div></div>`,
      code: `<div class="sample-header"><span>◇</span> src / <strong>workspace.ts</strong></div><div class="sample-code-meta"><span>42 lines · 1.2 KB</span><span>Raw · Copy</span></div><pre class="sample-code"><span class="line"><i>1</i><b>import</b> { createTheme }</span><span class="line"><i>2</i>  <b>from</b> <em>'@nexora/core'</em>;</span><span class="line"><i>3</i></span><span class="line"><i>4</i><b>const</b> workspace = {</span><span class="line"><i>5</i>  name: <em>'Your workspace'</em>,</span><span class="line"><i>6</i>  focus: <b>true</b>,</span><span class="line"><i>7</i>  possibilities: <em>'endless'</em></span><span class="line"><i>8</i>};</span><span class="line"><i>9</i></span><span class="line"><i>10</i><b>export default</b></span><span class="line"><i>11</i>  createTheme(workspace);</span></pre><div class="sample-code-footer">UTF-8 <span>TypeScript</span></div>`,
      profile: `<div class="sample-header"><span>◉</span> <strong>developer</strong><small>Overview</small></div><div class="sample-content"><div class="sample-person"><div>JD</div><section><strong>Jordan Davis</strong><p>@jordan · Building with purpose</p></section></div><p class="sample-bio">Small details. Better experiences.<br>Working on what comes next.</p><div class="sample-profile-stats"><span><b>128</b> followers</span><span><b>24</b> following</span></div><div class="sample-pinned"><span>▣ design-system <small>Public</small></span><p>Thoughtful components for the web.</p><small>● TypeScript　☆ 128　⑂ 16</small></div><div class="sample-activity"><small>Contributions this year</small><div class="sample-graph" aria-hidden="true"></div><span>Less <i></i><i></i><i></i> More</span></div></div>`
    };
    function sample(target, colors) {
      NEXORA.Catalog.paint(target, colors);
      if (target.dataset.surface === surface) return;
      target.dataset.surface = surface;
      target.innerHTML = templates[surface];
      const graph = target.querySelector('.sample-graph');
      if (graph) for (let i = 0; i < 91; i++) {
        const cell = document.createElement('i');
        cell.style.opacity = [.12, .25, .5, .75, 1][(i * 7 + Math.floor(i / 9)) % 5]; graph.append(cell);
      }
    }
    function refresh() {
      const settings = getSettings();
      const theme = NEXORA.Catalog.find(selected, settings) || NEXORA.getThemeById(UI.activeThemeId(settings));
      selected = theme.id;
      const isCurrent = NEXORA.Catalog.isActive(theme, settings);
      $('previewThemeName').textContent = theme.name;
      const appearance = NEXORA.Catalog.appearance(theme);
      $('previewThemeDescription').textContent = theme.tagline || (appearance === 'light' ? 'A light palette for a clear workspace.' : appearance === 'dark' ? 'A dark palette for focused work.' : 'A personal palette with translucent surfaces.');
      $('previewState').textContent = isCurrent ? 'Current theme' : 'Preview only';
      $('previewState').classList.toggle('is-current', isCurrent);
      $('btnApplyPreview').textContent = isCurrent ? 'Applied to GitHub' : `Apply ${theme.name}`;
      $('btnApplyPreview').disabled = isCurrent;
      $('btnApplyCompared').disabled = isCurrent;
      $('previewCategory').textContent = theme.category;
      const ratio = NEXORA.Catalog.contrast(theme.colors.textPrimary, theme.colors.background);
      $('previewContrast').textContent = ratio === null ? 'Not measured' : `${ratio.toFixed(1)}:1 ${ratio >= 4.5 ? '· AA' : ''}`;
      sample($('workspacePreview'), theme.colors);
      $('previewPalette').replaceChildren(...['background', 'backgroundSecondary', 'border', 'accent', 'textPrimary'].map(key => {
        const chip = document.createElement('span'); chip.style.background = theme.colors[key]; chip.title = `${key}: ${theme.colors[key]}`; return chip;
      }));
      if ($('compareDialog').open) renderComparison();
    }
    function renderComparison() {
      const settings = getSettings();
      const theme = NEXORA.Catalog.find(selected, settings) || NEXORA.getThemeById(UI.activeThemeId(settings));
      $('compareCurrentName').textContent = settings.customThemeApplied && !settings.autoDarkMode && settings.customTheme ? settings.customTheme.name : NEXORA.getThemeById(UI.activeThemeId(settings)).name;
      $('comparePreviewName').textContent = theme.name;
      sample($('compareCurrent'), UI.colors(settings));
      sample($('comparePreview'), theme.colors);
    }
    const inspector = document.querySelector('.studio-inspector');
    function expandPreview(expanded) {
      inspector.classList.toggle('is-collapsed', !expanded);
      $('btnPreviewPanel').setAttribute('aria-expanded', String(expanded));
    }
    const mobile = matchMedia('(max-width:700px)');
    expandPreview(!mobile.matches);
    mobile.addEventListener('change', event => expandPreview(!event.matches));
    UI.on($('btnPreviewPanel'), 'click', () => expandPreview(inspector.classList.contains('is-collapsed')));
    document.querySelectorAll('[data-surface]').forEach(button => UI.on(button, 'click', () => {
      surface = button.dataset.surface;
      document.querySelectorAll('[data-surface]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
      refresh();
    }));
    UI.on($('btnApplyPreview'), 'click', () => apply(selected));
    UI.on($('btnCompare'), 'click', () => { $('compareDialog').showModal(); renderComparison(); });
    UI.on($('btnCloseCompare'), 'click', () => $('compareDialog').close());
    UI.on($('btnApplyCompared'), 'click', async () => { await apply(selected); $('compareDialog').close(); });
    return { refresh, selectedId: () => selected, select(id) { if (!NEXORA.Catalog.find(id, getSettings())) return; selected = id; expandPreview(true); refresh(); if (mobile.matches) inspector.scrollIntoView({ block: "start", behavior: "instant" }); } };
  }
};
