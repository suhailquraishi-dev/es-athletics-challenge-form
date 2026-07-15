# EssentiallySports Athletics Challenge Form

Static first version for an EssentiallySports newsletter challenge product.

See [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md) for the full product brief, design rules, current architecture, data flow, QC checklist, and backend roadmap.

## Pages

- `index.html` - reader challenge form with instant score, source articles, and Athletics news rail.
- `editor.html` - lightweight editor view for creating Google Forms-style questions and saving a browser-local draft.

## Netlify

The site is static. Netlify can publish the repository root directly.

## Google Sheets

A staged, server-only response bridge is available at `/api/challenge-submissions`. Complete the one-time Google deployment before connecting the public form. See [integrations/google-sheets/README.md](integrations/google-sheets/README.md).
