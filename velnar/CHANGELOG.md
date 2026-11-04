# Changelog

## NEXORA brand update

- Adopted the canonical NEXORA silver N mark, obsidian/titanium/electric-blue palette and local Manrope/Vazirmatn typography.
- Updated English and Persian interface copy, metadata, previews, landing page, exports and release package to NEXORA.
- Migrated existing VELNAR settings on the next successful write; earlier backups, personal themes and card density remain compatible.


## Unreleased — Repository layout fix (2026-11-01)

- Scoped repository card styling to the profile repository list instead of matching unrelated GitHub utility rows and source-list wrappers.
- Added inline insets and space between repository entries, retaining native vertical padding, star/list controls and pagination. Long names can wrap within their content column.
- Kept file-list rows joined inside their Box, rounding only outer corners instead of every row.
- Added a screenshot-shaped browser fixture covering desktop/mobile layouts, long names, component toggles, custom radius, dynamic list entries and native-layout restoration.

## Unreleased — Personalization (2026-11-01)

- Added a local personal-theme library (50 palettes) with save, edit/rename, copy, favorite, preview, apply and delete in the existing theme library and popup.
- Added recoverable Theme Builder drafts, explicit draft discard and seed-based light/dark palette generation.
- Extended readability checks to text on cards, secondary text, links, button states, navbar, status colors, code and diff lines, with foreground repair suggestions and explicit unmeasured translucent colors.
- Added pull request/code review samples to preview and comparison, including added/deleted lines and review comments.
- Replaced panel-local one-step undo with serialized persistent history for 20 appearance changes, including typography, layout, components and CSS; library, draft, favorites and language remain independent.
- Added live English/Persian localization and RTL interface layouts while preserving LTR source code and user theme names.
- Included the new state in validated backups, kept older backups compatible, and raised the JSON import cap to 2 MB.
- Aligned root documentation with 45 built-in palettes, 30 editable colors and the Alt+Shift+R random-theme shortcut.
- Added unit and browser regressions for personal-theme lifecycle, drafts, history, seed generation, readability repairs, localization, backup roundtrips and responsive RTL layouts.

## Unreleased — Workspace studio (2026-10-31)

- Removed motion controls, automatic motion activation and decorative engines from GitHub. All 45 palettes remain available. Old motion preferences are ignored when loading or restoring settings.
- Removed URL polling and body scans; styles recover through navigation events and observers limited to the head and document root.
- Replaced repeated character SVGs in the theme library with lightweight palette previews, and removed UI transitions.

- Rebuilt the appearance panel in a minimal developer-tool style, with a unified library, sticky preview inspector, consistent SVG navigation, neutral surfaces and a matching compact popup.
- Added non-destructive preview of repository, code and profile samples, plus a modal comparison with the active palette and explicit application.
- Added persistent card density, keyboard search with `/`, component search, focus preservation when cards refresh, and a collapsible preview on mobile.
- Prioritized official and community palettes in the default library order.

- Redesigned settings and popup with an active palette preview, clearer navigation and responsive layouts.
- Added collection and appearance filters, collection-scoped alphabetical sorting, favorite-first sorting, matching counts and recoverable empty states.
- Added one-step theme undo in each open panel, preserving unrelated settings and favorites. Undo history lasts until the panel is closed.
- Added live typography previews, comfortable-reading and default presets, and an opaque-color text contrast indicator in the builder.
- Kept popup controls within Chrome's 600px height limit while scrolling the theme library independently.
- Added unit coverage and a real-extension browser smoke suite at `tests/studio-smoke.cjs`; screenshots and results are saved under `artifacts/studio/`.


## 2.3.1 — 2026-09-13

- Redrew all five character sets with a shared vector illustration library: Spider-Man's mask, suit webs and chest emblem; Ellie's hair, face, backpack and clothing; Arthur Morgan's beard, hat, vest and gun belt; Rick and Morty's faces and outfits; and Iron Man's helmet, armor panels and reactor.
- Increased graph actors from at most 44px to at most 76px, adapting their size to the graph height and realigning web, gun and repulsor origins to the new hands.
- Used the same character designs in graph stories, dashboard banners, theme cards and the live preview.
- Kept 4–6 transform/opacity animations per graph, zero animations on contribution cells, offscreen pause, click-through and reduced-motion behavior.
- Added a character gallery and refreshed browser screenshots with sample data.

## 2.3.0 — 2026-09-12

- Added five stories inside the contribution grid: Spider-Man shoots webs and swings, a Last of Us survivor explores growing fungal colonies, a Red Dead outlaw aims and shoots, Rick and Morty cross between portals, and Iron Man flies and fires a repulsor.
- Anchored scene targets to actual contribution cells and kept native hover, click, keyboard and tooltip behavior available.
- Used 4–6 transform/opacity animations per graph, with no cell animations or per-frame JavaScript; offscreen scenes pause automatically.
- Added resizing, horizontal-scroll support, late-loaded graph recovery, reduced-motion handling and cleanup when animations, the contribution component or the extension are disabled.
- Updated the live preview and verified all five scenes with the actual extension in an isolated Edge profile using sample contribution data.

## 2.2.1 — 2026-09-12

- Removed dark strips inside changelog timelines and separate backgrounds behind profile names and bios. Profile columns and content wrappers now share a single cinematic canvas.
- Kept card backgrounds stable on hover and themed the contribution legend and selected year.
- Replaced per-day contribution animations with one transform/opacity sweep; made headers static and primary-button glows interactive. Scene artwork and particles remain animated.
- Reused unchanged styles and banner SVGs, combined navigation events within a frame, applied the palette before DOMContentLoaded, and stopped generic motion in hidden tabs.
- Added browser regressions for all five profile palettes, changelog surfaces, early rendering, pause/resume identity, style recovery, cleanup and mobile overflow. On the same 371-cell fixture, active cell animations fell from 371 to zero, with one graph sweep replacing them; these counts are not a page-load speed benchmark.

## 2.2.0 — 2026-09-12

- Redesigned the five cinematic themes with distinct card surfaces, full-page backdrops, patterned headers, themed borders and sidebar artwork.
- Added an illustrated dashboard banner with scene-specific particles and animation, and recovery after React replaces dashboard content.
- Kept the static cinematic design visible when motion is paused or reduced; moved decorative overlays away from the top repository list.
- Extended coverage to main page containers and feed cards with fixed background colors.
- Verified banner cleanup, route changes, component controls, reduced motion, responsive layouts and all five themes in a real extension browser session using a representative dashboard fixture.

## 2.1.1 — 2026-09-11

- Fixed incomplete dashboard coverage by mapping current and legacy Primer color tokens to the active NEXORA palette.
- Covered nested theme providers, dashboard surfaces, feed cards, controls and floating menus, including content loaded after navigation.
- Kept component-specific token overrides behind their switches and preserved semantic status colors, images and transparent surfaces.
- Added a representative dashboard regression fixture covering all five cinematic themes, Light/Dark, late styles, dynamic cards, cleanup and mobile layout.

## 2.1.0 — 2026-09-11

- Added five cinematic themes: Spider-Man, The Last of Us, Red Dead, Rick and Morty, and Iron Man.
- Created original SVG scene artwork for the theme cards and a bundled interactive preview with pause/apply controls.
- Added distinct animated atmospheric layers, navbar patterns, button glows and contribution effects.
- Enabled effects when selecting a cinematic theme; respected reduced motion, background-tab visibility and component controls.
- Kept all 30 existing palettes and the default Dark theme; added browser checks for effect cleanup, navigation, interaction and mobile layouts.
- Removed generated archives and unused logo assets carrying the previous names.

## 2.0.0 — 2026-09-11

- Renamed the extension, namespace, interface, documentation and release archive to NEXORA.
- Adopted the latest NEXORA V/N vector mark with 16/32/48/128 px browser icons.
- Fixed service-worker startup and missing Custom CSS validation in content scripts.
- Centralized and serialized settings changes; added legacy-key migration and storage error handling.
- Validated theme/settings imports and made full restore replace old settings, including null values.
- Initialized all Theme Builder controls on first load and added a palette preview.
- Added theme search, keyboard-accessible buttons and switches, status feedback and live settings synchronization.
- Fixed automatic-theme handling for random selection, imports and export.
- Applied shadow intensity and respected reduced motion and component animation switches.
- Improved preset link, secondary text and primary-button hover contrast; kept RGB motion on the contribution graph.
- Updated installation links, documentation and automated regression tests.
