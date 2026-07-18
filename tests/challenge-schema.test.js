const test = require("node:test");
const assert = require("node:assert/strict");
const {
  validateAndNormalizeChallenge,
  toPublicChallenge,
  gradeChallenge
} = require("../server/challenge-schema.js");
const { challenge } = require("./fixtures.js");

test("normalizes a valid challenge and strips answers from the public shape", () => {
  const result = validateAndNormalizeChallenge(challenge, { requireAnswers: true });
  assert.equal(result.ok, true);
  const publicChallenge = toPublicChallenge(result.value);
  assert.equal(publicChallenge.questions.some((question) => Object.hasOwn(question, "answer")), false);
  assert.equal(JSON.stringify(publicChallenge).includes("Alex\""), true);
  assert.equal(publicChallenge.questions[0].options.includes("Alex"), true);
  assert.equal(publicChallenge.questions[1].type, "radio");
  assert.equal(publicChallenge.questions[1].options.includes("Alex & Jordan"), true);
});

 test("rejects new checkbox questions while preserving legacy reads", () => {
  const result = validateAndNormalizeChallenge(challenge, {
    requireAnswers: true,
    allowLegacyCheckbox: false
  });
  assert.equal(result.ok, false);
  assert.ok(result.errors.includes("questions.1.type"));
});

test("rejects a choice answer that is not one of the options", () => {
  const invalid = structuredClone(challenge);
  invalid.questions[0].answer = "Not listed";
  const result = validateAndNormalizeChallenge(invalid, { requireAnswers: true });
  assert.equal(result.ok, false);
  assert.ok(result.errors.includes("questions.0.answer"));
});

test("rejects externally hosted editorial images", () => {
  const invalid = structuredClone(challenge);
  invalid.questions[0].image = "https://tracking.example/image.jpg";
  const result = validateAndNormalizeChallenge(invalid, { requireAnswers: true });
  assert.equal(result.ok, true);
  assert.equal(result.value.questions[0].image, "");
});

test("grades entirely on the stored challenge definition", () => {
  const normalized = validateAndNormalizeChallenge(challenge, { requireAnswers: true }).value;
  const grade = gradeChallenge(normalized, [
    { id: "q1", value: "Alex" },
    { id: "q2", value: ["Jordan", "Alex"] }
  ]);
  assert.deepEqual({ ok: grade.ok, score: grade.score, totalPoints: grade.totalPoints }, {
    ok: true,
    score: 10,
    totalPoints: 10
  });
});

test("grades a migrated legacy checkbox as one bundled single choice", () => {
  const normalized = validateAndNormalizeChallenge(challenge, { requireAnswers: true }).value;
  const grade = gradeChallenge(normalized, [
    { id: "q1", value: "Alex" },
    { id: "q2", value: "Alex & Jordan" }
  ]);
  assert.equal(grade.score, 10);
});

test("reports missing required answers", () => {
  const normalized = validateAndNormalizeChallenge(challenge, { requireAnswers: true }).value;
  const grade = gradeChallenge(normalized, [{ id: "q1", value: "Alex" }]);
  assert.equal(grade.ok, false);
  assert.deepEqual(grade.missing, ["q2"]);
});
