# Google Sheets Challenge Storage

The Sheet is both the response destination and the small static-first content store for the challenge editor. Browser code never receives the Apps Script URL, shared secret, answer keys, or hidden administration data.

## What Editors See

Each published challenge receives its own visible tab, named from the challenge slug. Responses use a Google Forms-style layout:

1. Timestamp
2. Email
3. Score (out of the challenge total)
4. Percentage
5. One readable column for each question

The final submission-ID column is hidden. Raw JSON, IP-derived fingerprints, browser metadata, challenge IDs, and answer keys are not placed in the visible response tabs.

The script keeps two hidden tabs:

- `_Challenges` stores drafts, published challenge definitions, and answer keys.
- `_RateLimits` stores short-lived hashed abuse-control counters.

Published challenges are immutable. Use a new slug for a new weekly challenge so existing response columns and grading cannot change after readers begin submitting.

## One-Time Google Setup

1. Open the target Sheet.
2. Choose **Extensions > Apps Script**.
3. Replace the default script with `Code.gs` from this directory.
4. Open **Project Settings > Script Properties**.
5. Add `SUBMISSION_SECRET` with a random value of at least 32 characters.
6. Choose **Deploy > New deployment > Web app**.
7. Set **Execute as** to `Me` and **Who has access** to `Anyone`.
8. Deploy and copy the final `/exec` URL. Do not use the `/dev` URL.
9. Select `installMaintenanceTrigger` in Apps Script and run it once. Approve the requested spreadsheet and trigger permissions.

If the original `Sheet1` has only the legacy header and no responses, the first publish automatically reuses and renames it. Existing response data is never cleared.

## Vercel Environment

Set these values for Production and Preview:

```text
GOOGLE_APPS_SCRIPT_URL=https://script.google.com/macros/s/DEPLOYMENT_ID/exec
SHEETS_WEBHOOK_SECRET=the-same-secret-used-in-Script-Properties
EDITOR_ADMIN_PASSWORD=a-strong-editor-password
EDITOR_SESSION_SECRET=a-random-secret-of-at-least-32-characters
ABUSE_HASH_SECRET=a-different-random-secret-of-at-least-32-characters
```

Never commit real values. Redeploy after changing environment variables.

## Retention And Migration

`runMaintenance` removes response rows older than 90 days and rate-limit counters older than eight days. Change `RESPONSE_RETENTION_DAYS` only after confirming the editorial privacy policy.

The public contracts remain same-origin routes under `/api`. When this product moves to the EssentiallySports domain, the ES backend can retain this adapter or replace Google Sheets without changing the reader form markup.
