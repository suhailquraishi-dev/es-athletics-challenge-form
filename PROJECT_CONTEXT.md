# EssentiallySports Athletics Challenge - Project Context

## 1. Product Summary

This repository contains a static-first newsletter challenge product for EssentiallySports (ES). It is the third product in the same family as:

- ES Social Hub: https://www.essentiallysports.com/tennis/social-hub/
- FrameUp: https://frameup.essentiallysports.com/login.html?redirect=index.html%23frames
- Gamezone design reference: https://es-frontend-mddblr7sl-essentiallysports.vercel.app/es-gamezone-golf/

The current launch category is **Athletics / Track and Field**. The public title is **Weekly Challenge**; the product does not yet have a separate brand name.

The core loop is:

1. Newsletter editors select several ES stories.
2. Editors create scored questions based on those stories.
3. Newsletter readers enter an email address and answer the questions.
4. The page validates required answers and reveals the score immediately.
5. Readers see the underlying stories, current Athletics news, and ES exclusives.

The intended reader is a newsletter subscriber, with particular attention to readers aged roughly 50-60. Clarity, comfortable target sizes, legible typography, predictable controls, and low visual noise are more important than novelty.

## 2. Current Scope

The current version is a frontend prototype with two pages:

- `/index.html`: reader challenge, score reveal, story cards, Top Stories, and Exclusives.
- `/editor.html`: browser-local challenge builder and live preview.

It also exposes one Netlify Function:

- `/.netlify/functions/news?category=athletics`
- `/.netlify/functions/news?category=track-and-field&mode=exclusive`

No authentication, database, server-side submission storage, production leaderboard, or email identity system is connected yet.

## 3. Source of Truth for Design

The main EssentiallySports website is the canonical design system:

- https://www.essentiallysports.com/
- https://www.essentiallysports.com/tennis/social-hub/

Do not redesign the product into a generic form builder or standalone SaaS interface. It must look like an ES child product. When a component exists on the ES website, inspect and match its typography, colors, spacing, borders, radii, interaction states, and responsive behavior.

Original local ES design assets were studied from:

`C:\Users\Suhail\Documents\Codex\For Showcase\essentiallysports-combined-optimized-netlify`

Newsletter references supplied during design:

- `Newsletter-LITE.pdf`
- `ES Athletics.svg`
- `Poll.png`
- `design-layers.json`

These reference files are not required to run the repository. The required brand assets and fonts have already been copied into `/assets`.

### Typography

Only these font families should be used:

- **Acumin Pro Condensed Black**: section headings, question labels, tags, and strong ES display moments.
- **Roboto Condensed**: article titles, news titles, video/editorial titles, and compact UI copy.
- **Roboto**: body text, form fields, descriptions, hints, and supporting metadata.

Local font files are loaded with `@font-face` from `/assets/fonts`. Do not replace them with system approximations or unrelated web fonts.

### Core Visual Rules

- ES blue is `#0A7DFA`.
- The page background is a very light grey (`#F7F8FA`) so white cards remain distinguishable.
- Question cards use a very light, calm newsletter tint; controls use restrained pale-yellow borders and states.
- Question cards use a `1px` very light blue (`#E8F2F6`) stroke.
- Question cards do not use a drop shadow; separation comes from the light-blue stroke and spacing.
- Cards and images retain rounded corners, generally no more than `8px` unless a control intentionally uses a larger radius.
- CTA buttons have no drop shadows.
- Blue CTA hover treatment belongs to actual buttons, not article titles, footer links, option labels, or general text links.
- Article/news titles remain visually stable on hover and selection: no underline and no blue color shift.
- Avoid nested decorative cards, oversized marketing heroes, gradient ornaments, or generic dashboard styling.
- Inner padding must be consistent on all sides of boxes, cards, tags, and controls.
- Images and cards in the same grid should have consistent heights and alignment.
- Category tags should reproduce ES article tags: Acumin condensed black, uppercase, ES blue border, and equal visual padding.

## 4. Reader Experience

### Header and Footer

The header and footer are based directly on the ES website:

- Desktop navigation: Latest, Sports, Newsletters, Think Tank, Case Studies.
- ES logo and official social icons come from local assets.
- Desktop navigation includes ES-style dropdown behavior.
- Mobile uses a compact menu panel.
- Footer includes the ES blue brand band, social icons, link columns, sports columns, legal links, and responsive stacking.
- The rounded ES logo is used for the favicon and ES source indicators.

There is no extra promotional banner above the navigation. Public editor links, points badges, and the old "Newsletter challenge" eyebrow were intentionally removed from the reader header.

### Athletics Ticker

The ticker sits immediately below the navigation and follows the ES Social Hub scoreboard pattern.

- The left identity block uses the rounded ES icon and Athletics label.
- Cards are labeled `Olympics / Medal Table`.
- Gold, silver, and bronze indicators use medal-appropriate colors.
- The ticker content is duplicated into two identical loops so the animation restarts seamlessly.
- Hover pauses the animation; reduced-motion preferences disable unnecessary motion.

**Current limitation:** medal values are static sample data in `index.html`. Live Yahoo Sports/Olympics ingestion has not been implemented.

### Challenge Header

- Athletics logo appears above the title as a logo, not as an eyebrow.
- Public title is `Weekly Challenge`.
- Logo, title, email field, and first question use a measured vertical rhythm.
- Email is required for scoring and is styled as a single outlined fieldset with its label embedded in the border.
- Email input text and the scoring note share a centered baseline with equal horizontal inset.

### Question Cards

Supported reader question types:

- Short answer
- Paragraph
- Multiple choice
- Checkboxes
- Dropdown
- Linear scale
- Date
- Time
- File upload

Current sample challenge contains five scored questions worth 25 total points.

Question card rules:

- Calm spacing and strong readability for older readers.
- Question number is an Acumin/ES label with restrained rounded corners; points are shown in a matching separate badge.
- Options are large enough to tap but are reduced appropriately on phones.
- Selected states are obvious without excessive saturation.
- Text-field focus uses one subtle translucent blue ring rather than stacked outlines.
- Dropdown trigger and open menu form one continuous control with joined corners.
- A maximum of two question cards may include an image.
- Question images, when used, are full width with limited height and rounded top corners.
- The first sample question intentionally has no image.
- The footer says `Hint:` and contains a clue; it must not display the article title as `Source:`.
- The source divider is a single line, never a doubled border.

### Submission and Score

The browser validates:

- Valid email address.
- Completion of all required questions.
- Custom dropdown state as well as native inputs.

On valid submission, `script.js` calculates the score from the current question configuration and reveals:

- Score and total possible points.
- Percentage-based progress meter.
- A short result message.
- A static leaderboard tease with the reader's score.

**Current limitation:** the score is not persisted remotely, the leaderboard names are illustrative, and the email address is not submitted to a backend.

### Story Cards

The `Questions picked from these stories` section lists the ES articles used to construct the challenge.

- Story titles are clickable and open the real ES article.
- Cards use ES category tags, image treatment, title typography, author/date metadata, and `Read Full Story` CTA styling.
- Card heights and image dimensions should remain aligned across each row.
- On phones, the story cards become a horizontal, touch-scrollable rail with scroll snapping and a visible next-card peek instead of a long vertical list.

### Right News Rail

The right rail contains:

1. **Top Stories**: latest Athletics/Track and Field stories.
2. **Exclusives**: ES Athletics-related exclusive stories.

Top Stories behavior:

- Requests up to 12 current stories.
- Desktop and tablet show three full stories plus a faded preview of the fourth.
- `See more updates` scrolls the internal feed; at the end it changes to `Back to top`.
- The internal scrollbar is visually hidden.
- Mobile removes the nested scrolling/fade and displays the stories in the natural page flow.
- The fade must be gradual, readable, and never create an abrupt white cut.

Rail cards use real thumbnails, ES article tags, clickable Roboto Condensed titles, rounded images, and the rounded ES logo in source metadata.

## 5. Editor Experience

The editor is intentionally a lightweight static builder, not a complete CMS.

Editors can:

- Edit challenge title, category, and intro copy.
- Add any supported question type.
- Edit question, comma-separated options, correct answer, hint, image URL, and point value.
- Remove questions.
- Add images to no more than two questions.
- Load the sample challenge.
- See a live reader-form preview.
- Save a draft in the current browser.

The editor currently stores data in `localStorage` under:

`es-athletics-challenge-draft-v2`

The code also migrates older saved drafts:

- Old long title becomes `Weekly Challenge`.
- Removed sample question 6 stays removed.
- Old source-article labels are converted to useful hints.
- The removed first-question image stays removed.
- More than two saved question images are trimmed to the two-image limit.

**Current limitations:** there is no login, role management, collaboration, revision history, publishing workflow, server validation, or shared storage.

## 6. News Data Flow

### Latest Athletics Stories

`fetchNews()` uses this order:

1. Netlify Function `/.netlify/functions/news`.
2. Direct ES WordPress REST request if the function does not return enough stories.
3. Curated `backupNews` entries in `script.js` if both live paths fail.

The Netlify Function fetches the official ES category page and extracts ES article URLs, titles, dates, and nearby image URLs. It supports these category mappings:

- athletics / track-and-field
- golf
- tennis
- nascar
- nba
- nfl

Latest-story responses use `no-store` so the rail is refreshed rather than treated as long-lived static content.

### Exclusives

Exclusive mode queries the ES staging WordPress API for the exclusive category, filters to Track and Field/Athletics-related titles, and returns up to three stories. Curated ES exclusives remain visible if the live request fails.

### Data Safety Rules

- Keep all rendered external values escaped with `escapeHtml()`.
- Keep story links on `https://www.essentiallysports.com/`.
- External article links open with `target="_blank"` and `rel="noopener"`.
- A failed live fetch must leave a polished populated fallback, not a broken or empty card.

## 7. Repository Structure

```text
/
|-- index.html                 Reader page and static ticker/footer structure
|-- editor.html                Browser-local editor and live preview structure
|-- styles.css                 ES tokens, responsive layout, and all component styles
|-- script.js                  Challenge model, rendering, scoring, editor, news, menus
|-- netlify.toml               Static publish and Functions configuration
|-- netlify/functions/news.js  Latest-news scraper and exclusives endpoint
|-- assets/
|   |-- fonts/                 Acumin, Roboto Condensed, and Roboto files
|   |-- social-icons/          Separate ES nav and footer icon sets
|   |-- es-athletics.svg       Athletics newsletter logo
|   |-- es-rounded-logo.png    Favicon and ES story/source mark
|   |-- brand-logo-blue.svg    Header logo
|   |-- brand-logo-white.svg   Footer logo
|   `-- ...                    Supporting local image assets
|-- README.md                  Short setup summary
`-- PROJECT_CONTEXT.md         This handoff document
```

This is a dependency-free static project. There is no `package.json`, framework, bundler, or build step.

## 8. Responsive and Accessibility Expectations

Required visual checks:

- `1440x900`
- `1280x720`
- `390x844`
- `360x800`

The page must have no horizontal overflow, clipped text, overlapping controls, broken thumbnails, or mismatched card widths.

Accessibility behavior already present:

- Semantic form fields and fieldsets.
- Visible focus states.
- ARIA labels for navigation, ticker, controls, and result regions.
- Keyboard-operable custom dropdown.
- Escape and outside-click handling for menus.
- `aria-invalid` on failed controls.
- Reduced-motion support.
- Minimum practical mobile touch targets.

Future changes should preserve these behaviors and verify color contrast, focus order, screen-reader labels, and 200% zoom behavior.

## 9. Git and Deployment

Canonical repository:

`https://github.com/suhailquraishi-dev/es-athletics-challenge-form.git`

Primary branch:

`main`

Only this repository should be modified or pushed for this product.

Netlify configuration publishes the repository root and serves functions from `netlify/functions`. The connected Netlify site should deploy automatically after a push to `main`.

For a static-only local preview, serve the repository root on a local HTTP server. To exercise the Netlify Function locally, use Netlify Dev or a deployed Netlify preview rather than opening the HTML file directly.

## 10. Quality-Control Checklist

Before pushing UI changes:

1. Confirm the header, ticker, reader form, story section, rail, and footer align at desktop and mobile sizes.
2. Check empty submission shows email validation.
3. Check missing required answers focus the correct native or custom control.
4. Complete the sample challenge and confirm `25 / 25 points` can still be reached.
5. Reset the form and confirm all native/custom controls clear.
6. Verify editor add, edit, remove, load sample, save draft, and live preview behavior.
7. Confirm only two question images are accepted.
8. Confirm Top Stories has at least 10 merged stories when the live endpoint succeeds.
9. Confirm article URLs and thumbnails resolve to real ES content.
10. Confirm there is no horizontal scroll at supported viewport sizes.
11. Scan for `TODO`, `lorem`, debug logging, localhost URLs, broken asset paths, and visible prototype/fallback wording.
12. Run `git diff --check` and inspect the final diff before committing.

## 11. Product Decisions Already Made

- Athletics is the first category.
- Reader and editor are separate pages.
- Email is collected in the reader form but not yet stored.
- Scoring is instant and shown on the same page.
- The reader sees article context and additional category news.
- The public page follows ES Social Hub/editorial structure with some Gamezone challenge energy.
- The newsletter visual language influences the question area, but ES remains the parent design system.
- Question cards prioritize calm readability for a 50-60 audience.
- Hints replace article-title source labels inside question cards.
- The reader page does not expose editor navigation.
- Top Stories uses real-time ES fetching with curated resilience.
- Exclusives replace unrelated YouTube content in the secondary rail card.
- Blue hover fills are reserved for real CTA buttons.

## 12. Recommended Backend Roadmap

Connect backend functions one at a time, preserving the current frontend contract:

1. **Challenge storage:** persist challenge metadata, articles, questions, answers, hints, points, and image references.
2. **Editor authentication:** restrict editor routes and publishing actions to ES staff.
3. **Draft/publish workflow:** separate drafts from published newsletter challenges.
4. **Reader submissions:** store email, answers, score, challenge ID, and submission timestamp securely.
5. **Leaderboard:** replace illustrative names with privacy-aware rankings and anti-abuse controls.
6. **Media upload:** replace freeform image URLs with controlled ES media selection/upload.
7. **Live ticker:** connect a reliable Athletics/Olympics data provider and define refresh/cache behavior.
8. **Analytics:** track challenge starts, completion rate, question drop-off, score distribution, and story click-throughs.
9. **Operational safeguards:** rate limiting, validation, monitoring, error reporting, and content sanitization.
10. **Multi-category support:** generalize the same product for Golf, Tennis, and other ES newsletters without breaking Athletics branding.

Any backend work should keep the current public routes stable unless a migration plan is agreed first.
