const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const { challenge } = require("./fixtures.js");

const source = fs.readFileSync("integrations/google-sheets/Code.gs", "utf8");
const context = { console };
vm.createContext(context);
vm.runInContext(`${source}\nthis.__test = { responseHeaders_, gradeSubmission_, safeCell_, validateChallenge_ };`, context);

test("creates readable Google Forms-style response headers", () => {
  const headers = Array.from(context.__test.responseHeaders_(challenge));
  assert.deepEqual(headers.slice(0, 4), ["Timestamp", "Email", "Score (out of 10)", "Percentage"]);
  assert.equal(headers[4], "Q1 - Who won?");
  assert.equal(headers.at(-1), "_Submission ID");
  assert.equal(headers.some((header) => /JSON|User Agent|Source URL|Challenge ID/.test(header)), false);
});

test("prevents spreadsheet formula execution", () => {
  assert.equal(context.__test.safeCell_("=IMPORTDATA(\"https://example.com\")"), "'=IMPORTDATA(\"https://example.com\")");
  assert.equal(context.__test.safeCell_("Normal answer"), "Normal answer");
});

test("regrades a submission inside Apps Script", () => {
  const grade = context.__test.gradeSubmission_(challenge, [
    { id: "q1", value: "Alex" },
    { id: "q2", value: ["Jordan", "Alex"] }
  ]);
  assert.equal(grade.ok, true);
  assert.equal(grade.score, 10);
  assert.equal(grade.totalPoints, 10);
});
