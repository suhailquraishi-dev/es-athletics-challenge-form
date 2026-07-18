const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");

const html = fs.readFileSync("index.html", "utf8");
const readerScript = fs.readFileSync("script.js", "utf8");
const editorHtml = fs.readFileSync("editor.html", "utf8");
const editorScript = fs.readFileSync("editor.js", "utf8");
const styles = fs.readFileSync("styles.css", "utf8");

test("reader confirmation contains no public score UI", () => {
  assert.doesNotMatch(html, /score-line|score-meter|Your score|Score revealed/i);
  assert.doesNotMatch(readerScript, /showScore|totalPoints|result\.score/i);
  assert.match(html, /Results will be announced in tomorrow's Essentially Athletics newsletter/);
  assert.doesNotMatch(html, /result-actions|newsletter-result-cta|Read the stories/);
});

test("reader defines five host-controlled ad placements and no editor ads", () => {
  const keys = ["challenge_q2", "challenge_q4", "challenge_end", "challenge_sidebar", "challenge_eof"];
  keys.forEach((key) => assert.match(`${html}\n${readerScript}`, new RegExp(key)));
  assert.match(readerScript, /debugAds/);
  assert.match(readerScript, /ES_AD_CONFIG/);
  assert.doesNotMatch(editorHtml, /es-ad-slot|debugAds|ES_AD_CONFIG/);
});

test("host ads are consent-gated, lazy-loaded, and collapse explicit no-fill", () => {
  assert.match(readerScript, /adConsentGranted/);
  assert.match(readerScript, /IntersectionObserver/);
  assert.match(readerScript, /rootMargin:\s*"800px 0px"/);
  assert.match(readerScript, /result\?\.filled === false/);
});

test("mobile editorial rails expose accessible carousel controls", () => {
  assert.match(html, /aria-label="Previous top stories"/);
  assert.match(html, /aria-label="Next top stories"/);
  assert.match(html, /aria-label="Previous newsletters"/);
  assert.match(html, /aria-label="Next newsletters"/);
});

test("editor explains text-question scoring behavior", () => {
  assert.match(editorScript, /wording must otherwise match the answer key/);
  assert.match(editorScript, /award their points for any non-empty response/);
});

test("reader and editor do not offer multi-select questions", () => {
  assert.doesNotMatch(editorHtml, /data-add-type="checkbox"|>Checkboxes</);
  assert.doesNotMatch(editorScript, /\["checkbox", "Checkboxes"\]/);
  assert.match(editorHtml, /data-add-type="radio">Single choice</);
});
test("every reader question keeps a visible separator even around ad slots", () => {
  assert.match(styles, /#challenge-form \.question-card:not\(:first-child\)/);
  assert.doesNotMatch(styles, /#challenge-form \.question-card \+ \.question-card/);
});