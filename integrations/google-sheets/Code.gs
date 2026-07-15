const SPREADSHEET_ID = "1zwzex2sC6bpWKJ-rQ1Gh1cy1Baio4MZIC7nfyROlbxs";
const SHEET_NAME = "Sheet1";
const HEADERS = [
  "Submission ID",
  "Submitted At (UTC)",
  "Challenge ID",
  "Challenge Title",
  "Category",
  "Email",
  "Score",
  "Total Points",
  "Percentage",
  "Answers JSON",
  "Source URL",
  "User Agent"
];

function doGet() {
  return jsonOutput({ ok: true, service: "ES challenge submissions", sheet: SHEET_NAME });
}

function doPost(event) {
  let lock;
  try {
    const body = JSON.parse(event && event.postData && event.postData.contents || "{}");
    const expectedSecret = PropertiesService.getScriptProperties().getProperty("SUBMISSION_SECRET");
    if (!expectedSecret || body.secret !== expectedSecret) {
      return jsonOutput({ ok: false, code: "UNAUTHORIZED" });
    }

    const submission = body.submission || {};
    validateSubmission(submission);

    lock = LockService.getScriptLock();
    if (!lock.tryLock(10000)) {
      return jsonOutput({ ok: false, code: "SHEET_BUSY" });
    }

    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = spreadsheet.getSheetByName(SHEET_NAME);
    if (!sheet) throw new Error("Configured sheet tab was not found");
    ensureHeaders(sheet);

    const duplicateId = findDuplicateSubmission(sheet, submission.challengeId, submission.email);
    if (duplicateId) {
      return jsonOutput({ ok: true, duplicate: true, submissionId: duplicateId });
    }

    const percentage = submission.totalPoints > 0
      ? Math.round((submission.score / submission.totalPoints) * 10000) / 100
      : 0;
    sheet.appendRow([
      safeCell(submission.submissionId),
      safeCell(submission.submittedAt),
      safeCell(submission.challengeId),
      safeCell(submission.challengeTitle),
      safeCell(submission.category),
      safeCell(String(submission.email).toLowerCase()),
      Number(submission.score),
      Number(submission.totalPoints),
      percentage,
      JSON.stringify(submission.answers || []),
      safeCell(submission.sourceUrl || ""),
      safeCell(submission.userAgent || "")
    ]);

    return jsonOutput({ ok: true, duplicate: false, submissionId: submission.submissionId });
  } catch (error) {
    return jsonOutput({ ok: false, code: "INVALID_OR_FAILED_SUBMISSION" });
  } finally {
    if (lock && lock.hasLock()) lock.releaseLock();
  }
}

function validateSubmission(submission) {
  const required = [
    "submissionId",
    "submittedAt",
    "challengeId",
    "challengeTitle",
    "category",
    "email"
  ];
  if (required.some((key) => !submission[key])) throw new Error("Missing submission field");
  if (!Array.isArray(submission.answers) || !submission.answers.length) throw new Error("Missing answers");
  if (!Number.isFinite(Number(submission.score))) throw new Error("Invalid score");
  if (!Number.isFinite(Number(submission.totalPoints)) || Number(submission.totalPoints) <= 0) {
    throw new Error("Invalid total points");
  }
}

function ensureHeaders(sheet) {
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    sheet.setFrozenRows(1);
    return;
  }

  const currentHeaders = sheet.getRange(1, 1, 1, HEADERS.length).getDisplayValues()[0];
  if (HEADERS.some((header, index) => currentHeaders[index] !== header)) {
    throw new Error("Sheet headers do not match the integration schema");
  }
}

function findDuplicateSubmission(sheet, challengeId, email) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return "";

  const values = sheet.getRange(2, 1, lastRow - 1, 6).getDisplayValues();
  const normalizedEmail = String(email).trim().toLowerCase();
  const match = values.find((row) => (
    row[2] === String(challengeId) && String(row[5]).trim().toLowerCase() === normalizedEmail
  ));
  return match ? match[0] : "";
}

function safeCell(value) {
  const text = String(value == null ? "" : value);
  return /^[=+\-@]/.test(text) ? "'" + text : text;
}

function jsonOutput(value) {
  return ContentService
    .createTextOutput(JSON.stringify(value))
    .setMimeType(ContentService.MimeType.JSON);
}
