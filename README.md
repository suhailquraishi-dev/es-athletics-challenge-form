# EssentiallySports Athletics Challenge Form

Static first version for an EssentiallySports newsletter challenge product.

See [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md) for the full product brief, design rules, current architecture, data flow, QC checklist, and backend roadmap.

## Pages

- `index.html` - reader challenge form with instant score, source articles, and Athletics news rail.
- `editor.html` - lightweight editor view for creating Google Forms-style questions and saving a browser-local draft.

## Hosting

Vercel is the current preview host. It publishes the repository root and serves the stable `/api/news` and `/api/challenge-submissions` endpoints from `/api`.

## Google Sheets

Reader responses are sent through the server-only `/api/challenge-submissions` bridge. See [integrations/google-sheets/README.md](integrations/google-sheets/README.md) for the Google writer and Vercel environment setup.
