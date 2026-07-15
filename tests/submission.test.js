const test = require("node:test");
const assert = require("node:assert/strict");
const { handleSubmissionRequest } = require("../server/challenge-submissions.js");
const { challenge } = require("./fixtures.js");

const env = {
  GOOGLE_APPS_SCRIPT_URL: "https://script.google.com/macros/s/example/exec",
  SHEETS_WEBHOOK_SECRET: "s".repeat(40),
  ABUSE_HASH_SECRET: "a".repeat(40)
};

function mockFetch(responses, calls) {
  return async (url, options) => {
    calls.push({ url, body: JSON.parse(options.body) });
    const payload = responses.shift();
    return { ok: true, text: async () => JSON.stringify(payload) };
  };
}

test("ignores a forged client score and grades on the server", async () => {
  const calls = [];
  const result = await handleSubmissionRequest({
    method: "POST",
    headers: { "x-forwarded-for": "203.0.113.10" },
    env,
    fetchImpl: mockFetch([
      { ok: true, status: "published", challenge },
      { ok: true, duplicate: false }
    ], calls),
    body: {
      email: "reader@example.com",
      challenge: { id: challenge.slug },
      score: 9999,
      totalPoints: 9999,
      answers: [
        { id: "q1", value: "Jordan" },
        { id: "q2", value: ["Alex", "Jordan"] }
      ]
    }
  });
  assert.equal(result.statusCode, 201);
  assert.equal(result.body.score, 5);
  assert.equal(calls[1].body.submission.score, 5);
  assert.equal(calls[1].body.submission.totalPoints, 10);
  assert.equal(calls[1].body.submission.sourceUrl, undefined);
  assert.equal(calls[1].body.submission.userAgent, undefined);
});

test("returns a field error before calling storage for an invalid email", async () => {
  const calls = [];
  const result = await handleSubmissionRequest({
    method: "POST",
    env,
    fetchImpl: mockFetch([], calls),
    body: { email: "bad", challenge: { id: challenge.slug }, answers: [{ id: "q1", value: "Alex" }] }
  });
  assert.equal(result.statusCode, 400);
  assert.deepEqual(calls, []);
});

test("returns retry information when persistent storage rate-limits a reader", async () => {
  const calls = [];
  const result = await handleSubmissionRequest({
    method: "POST",
    headers: { "x-forwarded-for": "203.0.113.11" },
    env,
    fetchImpl: mockFetch([
      { ok: true, status: "published", challenge },
      { ok: false, code: "RATE_LIMITED", retryAfter: 120 }
    ], calls),
    body: {
      email: "reader@example.com",
      challenge: { id: challenge.slug },
      answers: [{ id: "q1", value: "Alex" }, { id: "q2", value: ["Alex", "Jordan"] }]
    }
  });
  assert.equal(result.statusCode, 429);
  assert.equal(result.headers["retry-after"], "120");
});
