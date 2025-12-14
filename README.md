# raadddr.digital

Static microsite for the RAADDDR framework with light localisation support and static build output.

## Scripts
- `npm run build` – generate `dist/` with translated markdown, JSON-LD, minified assets, and an index page wired to the default language.
- `npm run serve` – serve the built `dist/` folder on port 8005.
- `npm run watch` – rebuild on changes to `index.html`, `assets/**/*`, or `scripts/build.js`.
- `npm run dev` – watch and serve together for local development.

## Content and translations
- Base copy lives in `assets/translations.js` under the `en-gb` key; other languages inherit missing keys from it.
- Add a new language by extending `TRANSLATIONS` with a BCP 47 code and optional overrides (title, description, role names, etc.).
- Build artifacts include per-language markdown (`dist/raadddr.<lang>.md`), JSON-LD (`dist/raadddr.<lang>.jsonld`), and an `llms.txt` helper for model ingestion.

## Accessibility notes
- Modals are keyboard-focus trapped, and the language picker prefers the browser or saved language but falls back to `en-gb`.
