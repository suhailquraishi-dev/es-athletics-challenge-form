# EssentiallySports Athletics Challenge

An EssentiallySports newsletter challenge product with a public reader form and a protected editorial builder.

## Routes

- `/index.html` loads the latest published challenge.
- `/index.html?challenge=challenge-slug` loads a specific published challenge.
- `/editor.html` is the password-protected draft and publish workspace.
- `/api/news` returns current ES Athletics stories.
- `/api/challenges/[slug]` returns a public challenge without answer keys.
- `/api/challenge-submissions` grades and records a reader response on the server.

## Commands

```text
npm test
npm run check
```

Vercel is the only deployment target. Pushes to `main` deploy the production site. Google Sheets stores shared drafts and readable response tabs through the server-only Apps Script bridge.

See [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md) for architecture, security, editorial operations, design rules, deployment configuration, and QC requirements.
