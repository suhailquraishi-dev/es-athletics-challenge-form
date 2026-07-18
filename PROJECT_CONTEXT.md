# ES Athletics Challenge: Project Context

Last updated: 18 July 2026

## Product

This product replaces a weekly Google Form used by EssentiallySports newsletters. Readers review selected ES stories, answer scored questions, and submit an email address. Scores remain private for the editorial team and results are announced in the following day's Essentially Athletics newsletter. Editors use a separate protected page to create a draft, preview it, publish it, and copy the final reader link.

The first category is Athletics. The product is designed to move under an EssentiallySports domain later without changing the public frontend contract.

## Public Routes

- `/index.html`: reader page; resolves the latest published challenge.
- `/index.html?challenge=slug`: stable link to a specific published challenge.
- `/editor.html`: noindexed, password-protected editorial workspace.
- `/api/news?category=track-and-field`: current ES story feed.
- `/api/athletics-ticker`: cached Yahoo Olympics medal data with a current ES headline fallback.
- `/api/challenges/current`: latest public challenge definition.
- `/api/challenges/:slug`: public challenge definition by slug.
- `/api/challenge-submissions`: validated reader submissions.
- `/api/editor/session`: editor session state.
- `/api/editor/login` and `/api/editor/logout`: editor authentication.
- `/api/editor/challenges`: authenticated list, load, save, and publish operations.

## Design Source Of Truth

The UI is a child of EssentiallySports, not a standalone redesign.

- Header, footer, colors, spacing rhythm, links, and component behavior follow `essentiallysports.com` and the ES Social Hub.
- Acumin Pro Condensed Black is reserved for section and product display headings.
- Roboto Condensed Bold is used for editorial titles and compact headline UI.
- Roboto is used for fields, answers, help text, and body copy.
- Primary blue is `#0A7DFA`.
- The reader uses one shared white challenge canvas. Questions are separated by one light-grey rule rather than individual outer cards.
- Question metadata, answer controls, focus, and selected states are neutral; ES blue is reserved for links and genuine command buttons.
- Answer rows are 48-52px on desktop and 46px on phone, with visible radio/checkbox indicators and restrained 8px corners.
- The form includes a live answered count and slim progress indicator at the top, plus a completion summary above Submit.
- Controls target clear scanning and comfortable hit areas for newsletter readers, including readers aged 50-60.
- Mobile story modules use horizontal scrolling; desktop/tablet news modules remain sticky where space permits.
- Only command buttons receive blue CTA hover behavior.

Brand and font assets are local under `/assets`; no external font dependency is required.

## Reader Data Flow

1. `script.js` reads the `challenge` query parameter, defaulting to `current`.
2. The reader requests `/api/challenges/:slug`.
3. The Vercel function loads the stored challenge from Apps Script, validates it, removes every `answer` property, and returns the public shape.
4. The browser renders questions, source stories, and the ES news rail.
5. On submit, the browser sends only the email, challenge ID, selected values, and an invisible honeypot value.
6. The Vercel function fetches the published challenge again, grades against the server-side answers, creates a submission ID, hashes the request IP for abuse control, and sends the server-derived result to Apps Script.
7. Apps Script independently regrades the response, checks duplicate email and rate limits, and appends a readable row.
8. The reader receives only submission status and a newsletter confirmation state. Scores and totals stay server-side and in the response Sheet.

Client-provided scores, titles, categories, timestamps, and answer keys are never trusted.

## Editor Workflow

1. Open `/editor.html` and enter the editor password.
2. Choose an existing draft or select **New challenge** from the sticky command bar.
3. Use the **Questions**, **Source Stories**, and **Settings** workspace tabs.
4. Edit one expanded question at a time. Inactive questions collapse to their number, title, type, points, and required state.
5. Set the question type, points, options, correct answer, and required state; keep hints and image URLs under **More options**.
6. Reorder with drag-and-drop or the keyboard-accessible Move Up and Move Down buttons. Use the single **Add question** menu for all eight supported types.
7. Use the sticky live preview on desktop or the preview toggle on tablet and phone.
8. Select **Save draft** to make the draft available to other authenticated editors.
9. Select **Publish challenge** to create the response tab and final reader URL.
10. Use **Copy link** and place that URL in the newsletter.

Published challenges are immutable. This protects grading and response columns after readers begin submitting. Use **Duplicate as new** and a new slug for the next weekly edition.

Supported types:

- Short answer
- Paragraph
- Multiple choice
- Checkboxes
- Dropdown
- Linear scale
- Date
- Time

File upload is intentionally excluded until ES provides controlled upload storage, malware scanning, retention rules, and access policy.

## Google Sheets Layout

Each published challenge gets one visible response tab named `Responses - <slug>`. The tab is intentionally similar to Google Forms:

1. Timestamp
2. Email
3. Score (out of the challenge total)
4. Percentage
5. One column per question

The final submission ID column is hidden. Visible response tabs do not contain JSON, source URLs, user agents, IP addresses, challenge IDs, or answer keys.

Two hidden tabs support the application:

- `_Challenges`: draft/published definitions, answer keys, status, dates, and response-tab name.
- `_RateLimits`: hashed abuse counters with short retention.

The first publish reuses the legacy `Sheet1` only when it has no response data. Existing data is never cleared automatically.

Default retention is 90 days for response rows and eight days for rate counters. The daily time-based `runMaintenance` trigger was installed and verified in Apps Script on July 16, 2026. Re-run `installMaintenanceTrigger` only if the trigger is removed or the Apps Script project is replaced. Any change to response retention requires editorial/privacy approval.

## Security Model

- Answer keys are absent from `script.js`, HTML, public challenge responses, and browser storage.
- Grading occurs in both the Vercel server function and Apps Script.
- Editor authentication uses a signed, HttpOnly, Secure, SameSite=Strict cookie with an eight-hour lifetime.
- Login and publishing actions require same-origin requests.
- Editor writes require the additional `x-es-editor-request` request header.
- Login and submission abuse controls persist in the hidden Sheet tab.
- Reader and editor payloads have strict size, count, string-length, type, and URL validation.
- Story links must be on EssentiallySports domains.
- Editorial images must be on EssentiallySports-controlled domains.
- Spreadsheet formula injection is neutralized before cell writes.
- Secrets and the Apps Script URL exist only in Vercel/Apps Script configuration.
- `/editor.html` is noindex and no-store.
- Vercel applies CSP, clickjacking protection, MIME sniffing protection, a strict referrer policy, and a restricted permissions policy.

This password gate is appropriate for the current small editorial team and static-first phase. Before a wider internal rollout, replace the shared password with ES SSO and role-based permissions.

## Environment Configuration

Required Vercel Production and Preview variables:

```text
GOOGLE_APPS_SCRIPT_URL
SHEETS_WEBHOOK_SECRET
EDITOR_ADMIN_PASSWORD
EDITOR_SESSION_SECRET
ABUSE_HASH_SECRET
```

`SUBMISSION_SECRET` in Apps Script properties must equal `SHEETS_WEBHOOK_SECRET`. Real values must never appear in Git, logs, screenshots, chat, or client JavaScript.

## Deployment

Repository: `suhailquraishi-dev/es-athletics-challenge-form`

Production host: Vercel

Production URL: `https://es-athletics-challenge-form.vercel.app/`

Pushes to `main` deploy automatically. Netlify is not used. Before pushing:

```text
npm run check
git diff --check
```

After Vercel reports Ready, verify the production reader, editor, API responses, security headers, and Sheet row layout.

## News And Ticker

The right rail requests at least ten current Track and Field stories through `/api/news`; static ES stories are retained only as a graceful fallback. `/api/athletics-ticker` attempts to extract the Yahoo Olympics medal table and returns source, status, and timestamp metadata. Completed standings are explicitly labelled as final rather than presented as live. When medal data is unavailable, it returns current ES Track and Field headlines; when both sources fail, the reader shows an honest unavailable state instead of old medal values.

## Advertising Integration

Five logical placements exist on desktop/tablet: after Questions 2 and 4, after the form, in the desktop rail, and after source stories. Mobile omits the rail placement. Each placement matches the ES 280px real-estate shell and remains hidden by default.

The standalone Vercel deployment does not load advertising vendors. `?debugAds=1` renders labelled placeholders for QC. On the ES domain, the host supplies `window.ES_AD_CONFIG` with environment, category, consent, and logical slot mappings, plus `window.ESAds.display()`. Eligible inventory is queued by `IntersectionObserver` before it reaches the viewport; an explicit host no-fill response collapses its reserved shell. The implementation delegates to the existing ES Google Ad Manager/Marfeel/Monti stack rather than loading GPT, Prebid, Amazon APS, or consent scripts a second time.

## Required Release QC

Reader:

- `current` and a specific slug load successfully.
- Public challenge JSON contains no answer keys.
- Empty email and missing required answers show clear inline errors.
- Correct, incorrect, checkbox-order, dropdown, text, and scale grading are server-derived.
- Duplicate email returns submission status without exposing the original score or adding a row.
- Failure preserves the reader's selections.
- Source titles and news titles remain clickable without unwanted underlines.

Editor:

- Unauthenticated APIs return 401.
- Wrong-password and rate-limited states are generic and do not leak configuration.
- Draft save survives another browser session.
- Publish creates a final link and response tab.
- Published content is locked and can be duplicated into a new slug.
- Add, edit, reorder, remove, preview, and article controls work by keyboard and pointer.

Visual:

- Test `1440x900`, `1280x720`, `768x1024`, `390x844`, and `360x800`.
- No horizontal page scroll, clipping, overlap, broken images, hidden focus, or button-text overflow.
- Navbar, ticker, shared question canvas, sticky rail, horizontal mobile rails, source cards, newsletter confirmation, ad shells, and footer align at each breakpoint.

Security/leak scan:

- No real secret, Apps Script URL, answer key, email, localhost URL, debug statement, `TODO`, or stale Netlify/localStorage copy in the deployed files.
- CSP allows required ES images/news requests and blocks unexpected hosts.
- Editor HTML has noindex/no-store headers.

## Repository Map

```text
index.html                         Reader page
editor.html                        Protected editor structure
script.js                          Reader UI, navigation, ticker, ads, analytics
editor.js                          Authenticated draft/publish editor
styles.css                         ES-aligned responsive design system
api/challenges/[slug].js           Public challenge API
api/challenge-submissions.js       Reader submission adapter
api/editor/*.js                    Editor session and challenge APIs
api/news.js                        Current ES news adapter
api/athletics-ticker.js            Cached medals/current ES ticker adapter
server/challenge-schema.js         Validation, public projection, grading
server/challenge-submissions.js    Submission validation and server grading
server/athletics-ticker.js         Ticker source parsing and fallback logic
server/editor-session.js           Signed editor session and origin checks
server/google-sheet-client.js      Server-only Apps Script client
integrations/google-sheets/Code.gs Sheet storage, grading, tabs, retention
tests/*.test.js                    Security and data-contract tests
vercel.json                        Production headers and caching
```

## Remaining Production Decisions

- Confirm the formal response-retention period and reader consent language with ES privacy/legal owners.
- Replace the shared editor password with ES SSO before broad internal access.
- Obtain final GAM slot paths and consent-wrapper details from ES Ad Ops before enabling ads on the ES domain.
- Decide whether the production ES backend will retain Google Sheets or migrate the stable `/api` contracts to a database.
- Define a controlled file-upload service before adding that question type.
