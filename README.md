# raadddr.digital

[![Site](https://img.shields.io/badge/site-raadddr.digital-067a96)](https://raadddr.digital/)
[![Issues](https://img.shields.io/github/issues/OllieJC/raadddr.digital)](https://github.com/OllieJC/raadddr.digital/issues)
[![PRs](https://img.shields.io/badge/PRs-welcome-brightgreen)](https://github.com/OllieJC/raadddr.digital/pulls)
[![License](https://img.shields.io/badge/license-CC0%2FUnlicense-555)](#licence)

Source code for the public RAADDDR framework site - a deliberately simple, static microsite that explains the RAADDDR model and makes it easy to consume, translate, and reuse.

This repo exists to publish the framework in a form that is:

- human-readable (the website and Markdown)
- machine-readable (JSON-LD, llms.txt)
- easy to localise without duplicating content
- trivial to host anywhere

---

## What this builds

A static site at <https://raadddr.digital> plus a set of build artefacts designed for reuse:

- A single-page microsite (HTML, CSS, JS)
- Per-language Markdown (`dist/raadddr.<lang>.md`)
- Per-language JSON-LD (`dist/raadddr.<lang>.jsonld`)
- An `llms.txt` helper for model ingestion and summarisation

All output is generated at build time.

## Quick start

Requirements:

- Node.js (LTS)
- npm

```bash
npm install
npm run dev
```

This will build the site and serve `dist/` locally on port 8005 with live rebuilds.

## Scripts

- `npm run build`  
  Generates `dist/` with translated Markdown, JSON-LD, minified assets, and an index page wired to the default language.

- `npm run serve`  
  Serves the built `dist/` folder on port 8005.

- `npm run watch`  
  Rebuilds on changes to `index.html`, `assets/**/*`, or `scripts/build.js`.

- `npm run dev`  
  Runs watch and serve together for local development.

## Content and localisation model

All source content lives in `assets/translations.js`.

- `en-gb` is the canonical source of truth.
- Other languages inherit missing keys from `en-gb`.
- Translations can selectively override titles, descriptions, role names, or body copy.
- Languages are identified using BCP 47 language tags.

To add a language:

1. Extend `TRANSLATIONS` with a new language code.
2. Provide overrides only where needed.
3. Run the build - outputs are generated automatically.

The build produces:

- `dist/raadddr.<lang>.md`
- `dist/raadddr.<lang>.jsonld`
- `dist/index.html` with inlined, minified CSS/JS for performance
- `dist/llms.txt` for model ingestion
- `sitemap.xml`, `_headers`, and `robots.txt` copied from the root

## Contributing

Contributions are welcome, especially:

- clarity improvements to the framework wording
- translation additions or fixes
- accessibility improvements
- build simplifications

Please:

- open an issue for discussion before large or opinionated changes
- keep the framework concise and outcome-focused
- avoid adding tooling or dependencies without strong justification

This is intentionally minimal.

## Accessibility notes

- Modals are keyboard-focus trapped.
- The language picker prefers the browser or saved language and falls back to `en-gb`.
- Colour contrast and text sizing are chosen to prioritise readability over branding.

## Licence

Public Domain | CC0 | The Unlicense
