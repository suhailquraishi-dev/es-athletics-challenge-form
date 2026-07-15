const SPREADSHEET_ID = "1zwzex2sC6bpWKJ-rQ1Gh1cy1Baio4MZIC7nfyROlbxs";
const CHALLENGES_SHEET = "_Challenges";
const RATE_LIMITS_SHEET = "_RateLimits";
const RESPONSE_PREFIX = "Responses - ";
const RESPONSE_RETENTION_DAYS = 90;
const RATE_LIMIT_RETENTION_DAYS = 8;

const CHALLENGE_HEADERS = [
  "Slug",
  "Title",
  "Category",
  "Status",
  "Updated At",
  "Published At",
  "Response Sheet",
  "Challenge JSON"
];

const RATE_LIMIT_HEADERS = [
  "Scope",
  "Key",
  "Window Start",
  "Count",
  "Updated At"
];

function doGet() {
  return jsonOutput_({ ok: true, service: "ES challenge storage" });
}

function doPost(event) {
  try {
    const body = JSON.parse(event && event.postData && event.postData.contents || "{}");
    authenticate_(body.secret);

    switch (String(body.action || "")) {
      case "getChallenge":
        return jsonOutput_(getChallenge_(body.slug, body.includeDraft === true));
      case "listChallenges":
        return jsonOutput_(listChallenges_());
      case "saveChallenge":
        return jsonOutput_(saveChallenge_(body.challenge));
      case "publishChallenge":
        return jsonOutput_(publishChallenge_(body.challenge));
      case "submitResponse":
        return jsonOutput_(submitResponse_(body.submission));
      case "consumeRateLimit":
        return jsonOutput_(consumeRateLimit_(body.rateLimit));
      default:
        return jsonOutput_({ ok: false, code: "UNKNOWN_ACTION" });
    }
  } catch (error) {
    return jsonOutput_({
      ok: false,
      code: error && error.code || "REQUEST_FAILED",
      retryAfter: error && error.retryAfter || 0
    });
  }
}

function saveChallenge_(input) {
  const challenge = validateChallenge_(input);
  return withLock_(function () {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ensureSystemSheet_(spreadsheet, CHALLENGES_SHEET, CHALLENGE_HEADERS);
    const existing = findChallenge_(sheet, challenge.slug);
    if (existing && existing.status === "published") {
      throw codedError_("PUBLISHED_CHALLENGE_LOCKED");
    }

    const now = new Date();
    const responseSheet = existing ? existing.responseSheet : "";
    const publishedAt = existing ? existing.publishedAt : "";
    const row = challengeRow_(challenge, "draft", now, publishedAt, responseSheet);
    writeChallengeRow_(sheet, existing && existing.rowNumber, row);
    hideSystemSheets_(spreadsheet);

    return {
      ok: true,
      status: "draft",
      slug: challenge.slug,
      updatedAt: now.toISOString()
    };
  });
}

function publishChallenge_(input) {
  const challenge = validateChallenge_(input);
  return withLock_(function () {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const challengeSheet = ensureSystemSheet_(spreadsheet, CHALLENGES_SHEET, CHALLENGE_HEADERS);
    const existing = findChallenge_(challengeSheet, challenge.slug);

    if (existing && existing.status === "published") {
      if (JSON.stringify(existing.challenge) !== JSON.stringify(challenge)) {
        throw codedError_("PUBLISHED_CHALLENGE_LOCKED");
      }
      return {
        ok: true,
        status: "published",
        slug: challenge.slug,
        responseSheet: existing.responseSheet,
        publishedAt: toIsoString_(existing.publishedAt)
      };
    }

    const responseSheet = prepareResponseSheet_(spreadsheet, challenge, existing && existing.responseSheet);
    const now = new Date();
    const row = challengeRow_(challenge, "published", now, now, responseSheet.getName());
    writeChallengeRow_(challengeSheet, existing && existing.rowNumber, row);
    hideSystemSheets_(spreadsheet);

    return {
      ok: true,
      status: "published",
      slug: challenge.slug,
      responseSheet: responseSheet.getName(),
      publishedAt: now.toISOString()
    };
  });
}

function getChallenge_(requestedSlug, includeDraft) {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ensureSystemSheet_(spreadsheet, CHALLENGES_SHEET, CHALLENGE_HEADERS);
  let record;

  if (String(requestedSlug || "") === "current") {
    record = listChallengeRecords_(sheet)
      .filter(function (item) { return item.status === "published"; })
      .sort(function (left, right) {
        return dateValue_(right.publishedAt) - dateValue_(left.publishedAt);
      })[0];
  } else {
    record = findChallenge_(sheet, normalizeSlug_(requestedSlug));
  }

  if (!record || (!includeDraft && record.status !== "published")) {
    throw codedError_("CHALLENGE_NOT_FOUND");
  }

  return {
    ok: true,
    status: record.status,
    challenge: record.challenge,
    updatedAt: toIsoString_(record.updatedAt),
    publishedAt: toIsoString_(record.publishedAt),
    responseSheet: record.responseSheet || ""
  };
}

function listChallenges_() {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ensureSystemSheet_(spreadsheet, CHALLENGES_SHEET, CHALLENGE_HEADERS);
  const challenges = listChallengeRecords_(sheet)
    .sort(function (left, right) { return dateValue_(right.updatedAt) - dateValue_(left.updatedAt); })
    .map(function (record) {
      return {
        slug: record.slug,
        title: record.title,
        category: record.category,
        status: record.status,
        updatedAt: toIsoString_(record.updatedAt),
        publishedAt: toIsoString_(record.publishedAt),
        responseSheet: record.responseSheet || ""
      };
    });
  return { ok: true, challenges: challenges };
}

function submitResponse_(input) {
  const submission = validateSubmission_(input);
  return withLock_(function () {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const challengeSheet = ensureSystemSheet_(spreadsheet, CHALLENGES_SHEET, CHALLENGE_HEADERS);
    const record = findChallenge_(challengeSheet, submission.challengeId);
    if (!record || record.status !== "published") throw codedError_("CHALLENGE_NOT_FOUND");

    const responseSheet = spreadsheet.getSheetByName(record.responseSheet);
    if (!responseSheet) throw codedError_("RESPONSE_SHEET_MISSING");
    assertResponseSchema_(responseSheet, record.challenge);

    const duplicate = findDuplicateResponse_(responseSheet, submission.email, record.challenge);
    if (duplicate) return duplicate;

    if (submission.requestFingerprint) {
      const rateSheet = ensureSystemSheet_(spreadsheet, RATE_LIMITS_SHEET, RATE_LIMIT_HEADERS);
      const limit = consumeRateLimitLocked_(rateSheet, {
        scope: "submission:" + record.slug,
        key: submission.requestFingerprint,
        limit: 40,
        windowSeconds: 86400
      });
      if (!limit.allowed) {
        const error = codedError_("RATE_LIMITED");
        error.retryAfter = limit.retryAfter;
        throw error;
      }
    }

    const grade = gradeSubmission_(record.challenge, submission.answers);
    if (!grade.ok) throw codedError_("MISSING_REQUIRED_ANSWERS");

    const answerMap = {};
    grade.answers.forEach(function (answer) { answerMap[answer.id] = answer.value; });
    const row = [
      new Date(submission.submittedAt),
      safeCell_(submission.email),
      grade.score,
      grade.totalPoints > 0 ? grade.score / grade.totalPoints : 0
    ];
    record.challenge.questions.forEach(function (question) {
      row.push(formatAnswer_(answerMap[question.id]));
    });
    row.push(safeCell_(submission.submissionId));
    responseSheet.appendRow(row);

    const writtenRow = responseSheet.getLastRow();
    responseSheet.getRange(writtenRow, 1).setNumberFormat("mmm d, yyyy h:mm AM/PM");
    responseSheet.getRange(writtenRow, 4).setNumberFormat("0%");
    responseSheet.getRange(writtenRow, 1, 1, row.length).setVerticalAlignment("middle");

    return {
      ok: true,
      duplicate: false,
      submissionId: submission.submissionId,
      score: grade.score,
      totalPoints: grade.totalPoints
    };
  });
}

function consumeRateLimit_(input) {
  const rateLimit = validateRateLimit_(input);
  return withLock_(function () {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ensureSystemSheet_(spreadsheet, RATE_LIMITS_SHEET, RATE_LIMIT_HEADERS);
    const result = consumeRateLimitLocked_(sheet, rateLimit);
    hideSystemSheets_(spreadsheet);
    return Object.assign({ ok: true }, result);
  });
}

function consumeRateLimitLocked_(sheet, input) {
  const now = new Date();
  const values = sheet.getLastRow() > 1
    ? sheet.getRange(2, 1, sheet.getLastRow() - 1, RATE_LIMIT_HEADERS.length).getValues()
    : [];
  let rowIndex = -1;
  for (let index = 0; index < values.length; index += 1) {
    if (String(values[index][0]) === input.scope && String(values[index][1]) === input.key) {
      rowIndex = index;
      break;
    }
  }

  let windowStart = rowIndex >= 0 ? new Date(values[rowIndex][2]) : now;
  let count = rowIndex >= 0 ? Number(values[rowIndex][3]) || 0 : 0;
  const elapsedSeconds = Math.max(0, (now.getTime() - windowStart.getTime()) / 1000);
  if (!Number.isFinite(windowStart.getTime()) || elapsedSeconds >= input.windowSeconds) {
    windowStart = now;
    count = 0;
  }

  const allowed = count < input.limit;
  if (allowed) count += 1;
  const row = [input.scope, input.key, windowStart, count, now];
  if (rowIndex >= 0) {
    sheet.getRange(rowIndex + 2, 1, 1, row.length).setValues([row]);
  } else {
    sheet.appendRow(row);
  }

  return {
    allowed: allowed,
    remaining: Math.max(0, input.limit - count),
    retryAfter: allowed ? 0 : Math.max(1, Math.ceil(input.windowSeconds - elapsedSeconds))
  };
}

function prepareResponseSheet_(spreadsheet, challenge, existingName) {
  const requestedName = existingName || responseSheetName_(challenge.slug);
  let sheet = spreadsheet.getSheetByName(requestedName);
  if (!sheet) {
    const legacy = spreadsheet.getSheetByName("Sheet1");
    if (canReuseLegacySheet_(legacy)) {
      legacy.clear();
      legacy.setName(requestedName);
      sheet = legacy;
    } else {
      sheet = spreadsheet.insertSheet(uniqueSheetName_(spreadsheet, requestedName));
    }
  }

  const headers = responseHeaders_(challenge);
  if (sheet.getLastRow() > 1) {
    assertResponseSchema_(sheet, challenge);
    return sheet;
  }

  sheet.clear();
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.setFrozenRows(1);
  sheet.getRange(1, 1, 1, headers.length)
    .setBackground("#0A7DFA")
    .setFontColor("#FFFFFF")
    .setFontWeight("bold")
    .setVerticalAlignment("middle")
    .setWrap(true);
  sheet.setRowHeight(1, 44);
  sheet.setColumnWidth(1, 180);
  sheet.setColumnWidth(2, 240);
  sheet.setColumnWidth(3, 120);
  sheet.setColumnWidth(4, 110);
  for (let column = 5; column < headers.length; column += 1) {
    sheet.setColumnWidth(column, 260);
  }
  sheet.getRange("A:A").setNumberFormat("mmm d, yyyy h:mm AM/PM");
  sheet.getRange("D:D").setNumberFormat("0%");
  sheet.hideColumns(headers.length);
  return sheet;
}

function responseHeaders_(challenge) {
  const total = challenge.questions.reduce(function (sum, question) {
    return sum + Number(question.points || 0);
  }, 0);
  const headers = ["Timestamp", "Email", "Score (out of " + total + ")", "Percentage"];
  challenge.questions.forEach(function (question, index) {
    headers.push("Q" + (index + 1) + " - " + question.title);
  });
  headers.push("_Submission ID");
  return headers;
}

function assertResponseSchema_(sheet, challenge) {
  const expected = responseHeaders_(challenge);
  if (sheet.getLastColumn() !== expected.length || sheet.getLastRow() < 1) {
    throw codedError_("RESPONSE_SCHEMA_LOCKED");
  }
  const actual = sheet.getRange(1, 1, 1, expected.length).getDisplayValues()[0];
  for (let index = 0; index < expected.length; index += 1) {
    if (actual[index] !== expected[index]) throw codedError_("RESPONSE_SCHEMA_LOCKED");
  }
}

function findDuplicateResponse_(sheet, email, challenge) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return null;
  const idColumn = responseHeaders_(challenge).length;
  const values = sheet.getRange(2, 1, lastRow - 1, idColumn).getDisplayValues();
  const normalizedEmail = String(email).trim().toLowerCase();
  for (let index = 0; index < values.length; index += 1) {
    if (String(values[index][1]).trim().toLowerCase() === normalizedEmail) {
      return {
        ok: true,
        duplicate: true,
        submissionId: values[index][idColumn - 1],
        score: Number(values[index][2]) || 0,
        totalPoints: challenge.questions.reduce(function (sum, question) {
          return sum + Number(question.points || 0);
        }, 0)
      };
    }
  }
  return null;
}

function gradeSubmission_(challenge, submittedAnswers) {
  const answerMap = {};
  submittedAnswers.forEach(function (answer) { answerMap[String(answer.id)] = answer.value; });
  const missing = [];
  let score = 0;
  let totalPoints = 0;
  const answers = challenge.questions.map(function (question) {
    const value = Object.prototype.hasOwnProperty.call(answerMap, question.id) ? answerMap[question.id] : "";
    const hasValue = Array.isArray(value) ? value.length > 0 : normalizeText_(value) !== "";
    if (question.required !== false && !hasValue) missing.push(question.id);
    const points = Number(question.points || 0);
    totalPoints += points;
    if (isCorrectAnswer_(value, question.answer, question.type)) score += points;
    return { id: question.id, value: value };
  });
  return { ok: missing.length === 0, missing: missing, score: score, totalPoints: totalPoints, answers: answers };
}

function isCorrectAnswer_(value, expected, type) {
  if (type === "checkbox") {
    if (!Array.isArray(value) || !Array.isArray(expected)) return false;
    const left = value.map(normalizeText_).sort().join("|");
    const right = expected.map(normalizeText_).sort().join("|");
    return left === right;
  }
  if (type === "paragraph" && normalizeText_(expected) === "") {
    return normalizeText_(value) !== "";
  }
  return normalizeText_(value) === normalizeText_(expected);
}

function listChallengeRecords_(sheet) {
  if (sheet.getLastRow() < 2) return [];
  return sheet.getRange(2, 1, sheet.getLastRow() - 1, CHALLENGE_HEADERS.length).getValues()
    .map(function (row, index) { return challengeRecord_(row, index + 2); })
    .filter(function (record) { return Boolean(record); });
}

function findChallenge_(sheet, slug) {
  if (!slug) return null;
  const records = listChallengeRecords_(sheet);
  for (let index = 0; index < records.length; index += 1) {
    if (records[index].slug === slug) return records[index];
  }
  return null;
}

function challengeRecord_(row, rowNumber) {
  if (!row[0]) return null;
  let challenge;
  try {
    challenge = JSON.parse(String(row[7] || "{}"));
  } catch (error) {
    throw codedError_("INVALID_STORED_CHALLENGE");
  }
  return {
    rowNumber: rowNumber,
    slug: String(row[0]),
    title: String(row[1]),
    category: String(row[2]),
    status: String(row[3]),
    updatedAt: row[4],
    publishedAt: row[5],
    responseSheet: String(row[6] || ""),
    challenge: challenge
  };
}

function challengeRow_(challenge, status, updatedAt, publishedAt, responseSheet) {
  return [
    challenge.slug,
    safeCell_(challenge.title),
    safeCell_(challenge.category),
    status,
    updatedAt,
    publishedAt || "",
    responseSheet || "",
    JSON.stringify(challenge)
  ];
}

function writeChallengeRow_(sheet, rowNumber, row) {
  if (rowNumber) {
    sheet.getRange(rowNumber, 1, 1, row.length).setValues([row]);
  } else {
    sheet.appendRow(row);
  }
}

function ensureSystemSheet_(spreadsheet, name, headers) {
  let sheet = spreadsheet.getSheetByName(name);
  if (!sheet) sheet = spreadsheet.insertSheet(name);
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold");
  } else {
    const actual = sheet.getRange(1, 1, 1, headers.length).getDisplayValues()[0];
    for (let index = 0; index < headers.length; index += 1) {
      if (actual[index] !== headers[index]) throw codedError_("SYSTEM_SCHEMA_MISMATCH");
    }
  }
  return sheet;
}

function hideSystemSheets_(spreadsheet) {
  [CHALLENGES_SHEET, RATE_LIMITS_SHEET].forEach(function (name) {
    const sheet = spreadsheet.getSheetByName(name);
    if (sheet && !sheet.isSheetHidden() && spreadsheet.getSheets().length > 1) sheet.hideSheet();
  });
}

function validateChallenge_(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw codedError_("INVALID_CHALLENGE");
  const slug = normalizeSlug_(input.slug || input.id);
  const title = cleanText_(input.title, 120);
  const category = cleanText_(input.category, 60);
  const questions = Array.isArray(input.questions) ? input.questions : [];
  if (!slug || title.length < 3 || category.length < 2 || questions.length < 1 || questions.length > 50) {
    throw codedError_("INVALID_CHALLENGE");
  }

  const seenIds = {};
  questions.forEach(function (question) {
    const id = cleanIdentifier_(question && question.id, 80);
    const questionTitle = cleanText_(question && question.title, 300);
    const points = Number(question && question.points || 0);
    if (!id || seenIds[id] || !questionTitle || !Number.isFinite(points) || points < 0 || points > 100) {
      throw codedError_("INVALID_CHALLENGE");
    }
    seenIds[id] = true;
    if (points > 0 && question.type !== "paragraph" && !hasAnswer_(question.answer)) {
      throw codedError_("INVALID_CHALLENGE");
    }
  });

  const normalized = JSON.parse(JSON.stringify(input));
  normalized.slug = slug;
  normalized.id = slug;
  normalized.title = title;
  normalized.category = category;
  return normalized;
}

function validateSubmission_(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw codedError_("INVALID_SUBMISSION");
  const submission = {
    submissionId: cleanIdentifier_(input.submissionId, 80),
    submittedAt: String(input.submittedAt || ""),
    challengeId: normalizeSlug_(input.challengeId),
    email: cleanText_(input.email, 254).toLowerCase(),
    answers: Array.isArray(input.answers) ? input.answers.slice(0, 50) : [],
    requestFingerprint: cleanIdentifier_(input.requestFingerprint, 80)
  };
  if (!submission.submissionId || !submission.challengeId || !/^\S+@\S+\.\S+$/.test(submission.email)) {
    throw codedError_("INVALID_SUBMISSION");
  }
  if (!Number.isFinite(new Date(submission.submittedAt).getTime()) || !submission.answers.length) {
    throw codedError_("INVALID_SUBMISSION");
  }
  return submission;
}

function validateRateLimit_(input) {
  const rateLimit = {
    scope: cleanIdentifier_(input && input.scope, 100),
    key: cleanIdentifier_(input && input.key, 100),
    limit: Math.floor(Number(input && input.limit)),
    windowSeconds: Math.floor(Number(input && input.windowSeconds))
  };
  if (!rateLimit.scope || !rateLimit.key || rateLimit.limit < 1 || rateLimit.limit > 1000 ||
      rateLimit.windowSeconds < 60 || rateLimit.windowSeconds > 604800) {
    throw codedError_("INVALID_RATE_LIMIT");
  }
  return rateLimit;
}

function runMaintenance() {
  return withLock_(function () {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const challengeSheet = spreadsheet.getSheetByName(CHALLENGES_SHEET);
    if (challengeSheet) {
      listChallengeRecords_(challengeSheet).forEach(function (record) {
        const sheet = spreadsheet.getSheetByName(record.responseSheet);
        if (sheet) purgeOldRows_(sheet, RESPONSE_RETENTION_DAYS, 1);
      });
    }
    const rateSheet = spreadsheet.getSheetByName(RATE_LIMITS_SHEET);
    if (rateSheet) purgeOldRows_(rateSheet, RATE_LIMIT_RETENTION_DAYS, 5);
    return { ok: true };
  });
}

function installMaintenanceTrigger() {
  ScriptApp.getProjectTriggers().forEach(function (trigger) {
    if (trigger.getHandlerFunction() === "runMaintenance") ScriptApp.deleteTrigger(trigger);
  });
  ScriptApp.newTrigger("runMaintenance").timeBased().everyDays(1).atHour(3).create();
}

function purgeOldRows_(sheet, retentionDays, dateColumn) {
  if (sheet.getLastRow() < 2) return;
  const cutoff = Date.now() - retentionDays * 24 * 60 * 60 * 1000;
  const values = sheet.getRange(2, dateColumn, sheet.getLastRow() - 1, 1).getValues();
  for (let index = values.length - 1; index >= 0; index -= 1) {
    const value = new Date(values[index][0]).getTime();
    if (Number.isFinite(value) && value < cutoff) sheet.deleteRow(index + 2);
  }
}

function withLock_(callback) {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(10000)) throw codedError_("SHEET_BUSY");
  try {
    return callback();
  } finally {
    lock.releaseLock();
  }
}

function authenticate_(secret) {
  const expected = PropertiesService.getScriptProperties().getProperty("SUBMISSION_SECRET");
  if (!expected || String(secret || "") !== expected) throw codedError_("UNAUTHORIZED");
}

function canReuseLegacySheet_(sheet) {
  if (!sheet) return false;
  if (sheet.getLastRow() === 0) return true;
  if (sheet.getLastRow() > 1) return false;
  const firstHeader = String(sheet.getRange(1, 1).getDisplayValue());
  return firstHeader === "" || firstHeader === "Submission ID";
}

function responseSheetName_(slug) {
  return (RESPONSE_PREFIX + slug).slice(0, 100);
}

function uniqueSheetName_(spreadsheet, requested) {
  if (!spreadsheet.getSheetByName(requested)) return requested;
  for (let counter = 2; counter < 100; counter += 1) {
    const suffix = " (" + counter + ")";
    const candidate = requested.slice(0, 100 - suffix.length) + suffix;
    if (!spreadsheet.getSheetByName(candidate)) return candidate;
  }
  throw codedError_("SHEET_NAME_UNAVAILABLE");
}

function formatAnswer_(value) {
  if (Array.isArray(value)) return safeCell_(value.join("; "));
  return safeCell_(value == null ? "" : value);
}

function safeCell_(value) {
  const text = String(value == null ? "" : value);
  return /^[=+\-@]/.test(text) ? "'" + text : text;
}

function normalizeSlug_(value) {
  const slug = cleanText_(value, 80).toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug.length >= 3 ? slug : "";
}

function cleanIdentifier_(value, limit) {
  return cleanText_(value, limit).replace(/[^a-zA-Z0-9:_-]/g, "");
}

function cleanText_(value, limit) {
  if (value === undefined || value === null) return "";
  return String(value).trim().slice(0, limit);
}

function normalizeText_(value) {
  return cleanText_(value, 2000).toLowerCase().replace(/\s+/g, " ");
}

function hasAnswer_(value) {
  return Array.isArray(value) ? value.length > 0 : cleanText_(value, 2000) !== "";
}

function dateValue_(value) {
  const timestamp = new Date(value).getTime();
  return Number.isFinite(timestamp) ? timestamp : 0;
}

function toIsoString_(value) {
  if (!value) return "";
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? date.toISOString() : "";
}

function codedError_(code) {
  const error = new Error(code);
  error.code = code;
  return error;
}

function jsonOutput_(value) {
  return ContentService
    .createTextOutput(JSON.stringify(value))
    .setMimeType(ContentService.MimeType.JSON);
}
