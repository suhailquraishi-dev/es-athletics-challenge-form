# Google Sheets Submission Bridge

This staged integration writes challenge responses to:

- Spreadsheet: `Athletics Trivia Response Sheet`
- Spreadsheet ID: `1zwzex2sC6bpWKJ-rQ1Gh1cy1Baio4MZIC7nfyROlbxs`
- Worksheet tab: `Sheet1`

The browser never receives Google credentials or the Apps Script URL. It will eventually post to the stable same-origin route `/api/challenge-submissions`; Netlify currently maps that route to `netlify/functions/challenge-submissions.js`.

## Submission Schema

The first accepted submission creates and freezes this header row:

1. Submission ID
2. Submitted At (UTC)
3. Challenge ID
4. Challenge Title
5. Category
6. Email
7. Score
8. Total Points
9. Percentage
10. Answers JSON
11. Source URL
12. User Agent

The writer allows one row per normalized email address and challenge ID. A later weekly challenge must use a new challenge ID; the same reader can then enter again.

## One-Time Google Setup

1. Open the target Sheet.
2. Choose **Extensions > Apps Script**.
3. Replace the default script with `Code.gs` from this directory.
4. Open **Project Settings > Script Properties**.
5. Add `SUBMISSION_SECRET` with a random value of at least 32 characters.
6. Choose **Deploy > New deployment > Web app**.
7. Set **Execute as** to `Me` and **Who has access** to `Anyone`.
8. Deploy and copy the final `/exec` URL. Do not use the `/dev` URL.

The public web-app URL is protected by the shared secret and is called only from the server adapter.

## Netlify Setup

Add these environment variables in the Netlify site settings:

```text
GOOGLE_APPS_SCRIPT_URL=https://script.google.com/macros/s/DEPLOYMENT_ID/exec
SHEETS_WEBHOOK_SECRET=the-same-secret-used-in-Script-Properties
```

Redeploy the site after setting them. Never commit real values to `.env` or `.env.example`.

## Activation Sequence

The public form is intentionally not connected to the endpoint yet. This prevents the live challenge from becoming un-submittable while the Google deployment URL is missing.

After the Apps Script URL and Netlify variables are configured:

1. Verify a server-side test submission creates the header and first row.
2. Connect the form submit handler to `/api/challenge-submissions`.
3. Verify duplicate, timeout, validation, success, and retry states.
4. Confirm no answer or email data appears in browser logs.

## ES Domain Migration

The frontend contract remains `/api/challenge-submissions`. When this product moves to the EssentiallySports domain, the ES backend can implement that route and either keep this Sheet writer or replace it with the production datastore. No form markup or reader workflow needs to depend on Netlify or Google.
