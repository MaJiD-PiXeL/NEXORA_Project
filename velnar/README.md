# NEXORA

Make GitHub yours. A private, local-first Chrome and Edge extension with 45 themes, 30 editable colors, typography controls with static styling.

## Install

1. Extract `dist/nexora-extension.zip`.
2. Open `chrome://extensions` or `edge://extensions`.
3. Enable **Developer mode**, choose **Load unpacked**, and select the extracted folder containing `manifest.json`.
4. Visit GitHub and open **NEXORA** in your browser toolbar.

For development, load the `extension/` directory directly. Chrome/Edge 111 or newer is required. No bundler or server is needed for the extension.

## Features

- Fifteen cinematic palettes inspired by movie, television and game worlds, alongside static artwork in the collection preview.
- 30 additional official, community, vivid and gaming palettes, searchable in the popup and settings.
- Favorites, random themes, and automatic light/dark selection based on your system.
- Theme Builder with 30 editable colors, recoverable autosaved drafts and light/dark palette generation from one seed color.
- A local library of up to 50 personal themes: save, rename, edit, copy, favorite, preview, apply and delete without changing the currently applied copy.
- Readability checks for text, cards, links, buttons, status colors, code and diffs, with foreground repair suggestions. Translucent colors are marked unmeasured.
- Repository, code, profile and pull request/code review previews, including side-by-side comparison.
- Persistent history for the last 20 appearance changes, including typography, layout, components and CSS. Undo works across popup and settings sessions.
- English and Persian interface languages, live synchronization and RTL support with LTR source code.
- 18 component switches, global typography, border radius and shadow intensity.
- Lightweight static themes: no animation engine, particles, character overlays or URL polling.
- Custom CSS with size, delimiter and external-resource checks.
- Theme import/export and complete settings backup/restore with validation.
- Accessible keyboard controls, save feedback and live synchronization across settings windows.
- SPA navigation support, including restoration of removed styles and replaced document heads.

Shortcuts: **Ctrl+Shift+G** (macOS: **Command+Shift+G**) toggles the extension; **Alt+Shift+R** selects a random theme. Customize them in your browser's extension-shortcut settings if needed.

Manual theme selection, import and random selection turn automatic system theme selection off. Background, shared Primer surface/text/border colors and typography remain global when individual component rules are disabled. Component switches control additional rules and component-specific tokens. Both current and legacy Primer tokens are mapped, including nested theme providers and dynamically loaded dashboard content. Styles target GitHub selectors; changes to GitHub's markup may require maintenance.

## Personalization

Choose **My themes** in the library or popup to find saved palettes. **Save to library** creates a palette; **Edit / Rename** loads it into the builder and **Update saved theme** replaces that library entry. **Save a copy** creates another entry. Applying is explicit, so editing/deleting a library entry preserves the independent theme copy already active on GitHub.

Valid color/name edits are saved as a builder draft without changing the active palette. Reopening settings recovers the draft automatically. **Discard draft** removes it and returns the builder to the active colors. Drafts are shared between settings windows; the last saved edit wins.

**Settings → Appearance history** restores a prior appearance and removes that entry and newer entries. Undo restores the latest entry. The library, favorites, draft, language and extension enabled state are preserved. A full reset clears these along with history. Complete backups include the library, draft, history and language, with a 2 MB JSON import limit. Existing backups without these fields continue to load with defaults.

**Settings → Interface language** switches English/Persian for the extension UI independently of GitHub. Persian layouts use RTL; code, diffs, CSS and color values stay LTR. The bilingual typography sample shows both reading directions.

Readability uses a 4.5:1 target for the measured foreground/surface combinations, including 15% status-color mixes on code backgrounds for diff rows. A suggested fix considers all checked backgrounds sharing that foreground. If a single foreground cannot satisfy them, adjust the surface colors. Translucent colors are not assigned a misleading ratio. These checks describe the sampled pairs, rather than certifying every GitHub page.

## Cinematic collection

All 15 cinematic palettes remain available in the popup and **Themes** library. They apply colors to GitHub backgrounds, text, buttons, code and contribution cells. The **Profile** switch controls profile styles.

**Open interactive collection** opens a static demo repository with locally bundled artwork. Choose a palette and apply it to GitHub, or open `extension/preview/preview.html` without installing to preview colors. Applying a theme requires the installed extension.

Motion controls and engines have been removed. Older settings and backups remain compatible; obsolete motion preferences are ignored. Theme cards use compact palette samples. Unchanged library cards and preview markup are reused, and GitHub styles are restored through navigation events and observers limited to the document head and root, without polling or body scans.

## Brand

The canonical silver N mark is taken directly from the NEXORA website design. The original vector is in `assets/nexora-mark.svg`; PNG exports and browser icons are generated from it without redrawing the mark.

NEXORA uses the website’s obsidian (`#08090B`), titanium (`#BFC3C8`) and electric blue (`#426BFF`) palette, with bundled Manrope and Vazirmatn fonts under their included OFL licenses. Its brand statement is **Beyond what exists. / فراتر از آنچه هست.**

## Development and checks

- `extension/`: installable extension source.
- `landing/`: static introduction and ZIP download link. Serve the project root to preview it.
- `assets/`: canonical vector logo and large PNG export.
- `tests/`: regression checks and real-browser smoke tests.
- `scripts/`: icon generation and ZIP packaging.

```sh
npm install
npm test
npm run icons
python scripts/build_zip.py
```

Python 3 is needed only for packaging. `sharp` is used only to generate PNG icons; the installed extension has no runtime dependencies. The ZIP contains only `extension/` files, with the manifest at its root.

Browser smoke tests use Playwright and a separate, disposable browser profile:

```sh
npm install --no-save playwright
# Set NEXORA_BROWSER to an Edge/Chromium executable if required.
node tests/browser-smoke.cjs
npm run test:branding
node tests/studio-smoke.cjs
node tests/static-themes.cjs
npm run test:personalization
npm run test:repositories
```

## Existing installations

The branding check verifies migration of an existing personal library, favorites, history, typography and language from VELNAR, preserves the original storage record, and captures the English/Persian interface and responsive landing page in `artifacts/nexora/`.

After replacing files in an existing unpacked installation, click **Reload** on NEXORA in `chrome://extensions` or `edge://extensions`, then refresh open GitHub tabs so they receive the updated content scripts.

The new settings key is `nexora_settings_v1`. Existing `velnar_settings_v1`, `mavaj_settings_v1` and `gitskin_settings_v1` data are read in that order and migrated on the next successful write, without deleting the original keys. Keep the existing `velnar/extension` folder path when reloading so the unpacked extension keeps its identity. Installing a different folder as a separate unpacked extension may receive a different extension ID; export your old settings and restore that backup in NEXORA in that case. Old theme JSON exports remain supported.

## Privacy

Preferences stay in `chrome.storage.local`. There are no accounts, trackers, analytics or remote assets. Custom CSS cannot load URLs, imports or external fonts. Font-family controls use fonts already installed on your computer. No GitHub tokens or cookies are read.

## License

MIT. See `LICENSE`.
