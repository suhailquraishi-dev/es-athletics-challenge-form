const { randomUUID } = require("node:crypto");
const { callSheet } = require("./google-sheet-client.js");
const { validateAndNormalizeChallenge, gradeChallenge, cleanIdentifier, cleanText } = require("./challenge-schema.js");
const { requestFingerprint } = require("./editor-session.js");

const MAX_BODY_BYTES = 64 * 1024;
const MAX_ANSWERS = 50;

async function handleSubmissionRequest({ method, body, headers = {}, env = process.env, fetchImpl = fetch }) {
  const requestMethod = String(method || "GET").toUpperCase();
  if (requestMethod === "OPTIONS") return response(204, null, { allow: "POST, OPTIONS" });
  if (requestMethod !== "POST") {
    return response(405, { ok: false, code: "METHOD_NOT_ALLOWED" }, { allow: "POST, OPTIONS" });
  }

  const rawBody = normalizeBody(body);
  if (Buffer.byteLength(rawBody, "utf8") > MAX_BODY_BYTES) {
    return response(413, { ok: false, code: "PAYLOAD_TOO_LARGE" });
  }

  let payload;
  try {
    payload = typeof body === "object" && body !== null && !Buffer.isBuffer(body)
      ? body
      : JSON.parse(rawBody || "{}");
  } catch (error) {
    return response(400, { ok: false, code: "INVALID_JSON" });
  }

  if (payload?.website) {
    return response(202, { ok: true, duplicate: false });
  }

  const validation = validateReaderPayload(payload);
  if (!validation.ok) {
    return response(400, { ok: false, code: "INVALID_SUBMISSION", fields: validation.fields });
  }

  try {
    const stored = await callSheet("getChallenge", {
      slug: validation.value.challengeId,
      includeDraft: false
    }, { env, fetchImpl });
    const challengeValidation = validateAndNormalizeChallenge(stored.challenge, { requireAnswers: true });
    if (!challengeValidation.ok || stored.status !== "published") {
      return response(404, { ok: false, code: "CHALLENGE_NOT_FOUND" });
    }

    const challenge = challengeValidation.value;
    const grade = gradeChallenge(challenge, validation.value.answers);
    if (!grade.ok) {
      return response(400, { ok: false, code: "MISSING_REQUIRED_ANSWERS", fields: grade.missing });
    }

    const submission = {
      submissionId: randomUUID(),
      submittedAt: new Date().toISOString(),
      challengeId: challenge.slug,
      challengeTitle: challenge.title,
      category: challenge.category,
      email: validation.value.email,
      score: grade.score,
      totalPoints: grade.totalPoints,
      answers: grade.answers,
      requestFingerprint: requestFingerprint(headers, env)
    };
    const sheetResult = await callSheet("submitResponse", { submission }, { env, fetchImpl });

    return response(sheetResult.duplicate ? 200 : 201, {
      ok: true,
      duplicate: Boolean(sheetResult.duplicate),
      submissionId: sheetResult.submissionId || submission.submissionId
    });
  } catch (error) {
    if (error.code === "CHALLENGE_NOT_FOUND") {
      return response(404, { ok: false, code: "CHALLENGE_NOT_FOUND" });
    }
    if (error.code === "RATE_LIMITED") {
      return response(429, { ok: false, code: "RATE_LIMITED" }, {
        "retry-after": String(error.details?.retryAfter || 3600)
      });
    }
    const unavailable = error.code === "STORAGE_NOT_CONFIGURED";
    return response(unavailable ? 503 : 502, {
      ok: false,
      code: unavailable ? "STORAGE_NOT_CONFIGURED" : "SUBMISSION_STORAGE_FAILED"
    });
  }
}

function validateReaderPayload(payload) {
  const fields = [];
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return { ok: false, fields: ["payload"] };
  }

  const email = cleanText(payload.email, 254).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fields.push("email");
  const challengeId = cleanIdentifier(payload.challenge?.id, 80).toLowerCase();
  if (!challengeId) fields.push("challenge.id");

  const rawAnswers = Array.isArray(payload.answers) ? payload.answers : [];
  if (!rawAnswers.length || rawAnswers.length > MAX_ANSWERS) fields.push("answers");
  const answers = rawAnswers.slice(0, MAX_ANSWERS).map((answer, index) => {
    const id = cleanIdentifier(answer?.id, 80);
    if (!id) fields.push(`answers.${index}.id`);
    return { id, value: normalizeAnswerValue(answer?.value) };
  });

  if (fields.length) return { ok: false, fields: [...new Set(fields)] };
  return { ok: true, value: { email, challengeId, answers } };
}

function normalizeAnswerValue(value) {
  if (Array.isArray(value)) return value.slice(0, 20).map((item) => cleanText(item, 500));
  return cleanText(value, 2000);
}

function normalizeBody(body) {
  if (Buffer.isBuffer(body)) return body.toString("utf8");
  if (typeof body === "string") return body;
  return JSON.stringify(body || {});
}

function response(statusCode, body, extraHeaders = {}) {
  return {
    statusCode,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
      ...extraHeaders
    },
    body
  };
}

module.exports = {
  handleSubmissionRequest,
  _internal: { validateReaderPayload, normalizeAnswerValue }
};
