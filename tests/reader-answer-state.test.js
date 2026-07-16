const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const source = fs.readFileSync("script.js", "utf8");
const context = {
  document: { addEventListener() {} }
};
vm.createContext(context);
vm.runInContext(`${source}\nthis.__readerTest = { getFormValues, hasAnswer };`, context);

function formWith(elements) {
  return { elements };
}

test("does not count an unanswered radio or scale as answered", () => {
  const radio = { id: "q1", type: "radio" };
  const scale = { id: "q2", type: "scale" };
  const form = formWith([
    { name: "q1", value: "First option", checked: false },
    { name: "q1", value: "Second option", checked: false },
    { name: "q2", value: "1", checked: false },
    { name: "q2", value: "5", checked: false }
  ]);

  assert.equal(context.__readerTest.getFormValues(form, radio), "");
  assert.equal(context.__readerTest.getFormValues(form, scale), "");
  assert.equal(context.__readerTest.hasAnswer(form, radio), false);
  assert.equal(context.__readerTest.hasAnswer(form, scale), false);
});

test("returns only the checked radio value", () => {
  const question = { id: "q1", type: "radio" };
  const form = formWith([
    { name: "q1", value: "First option", checked: false },
    { name: "q1", value: "Second option", checked: true }
  ]);

  assert.equal(context.__readerTest.getFormValues(form, question), "Second option");
  assert.equal(context.__readerTest.hasAnswer(form, question), true);
});

test("returns every checked checkbox value", () => {
  const question = { id: "q1", type: "checkbox" };
  const form = formWith([
    { name: "q1", value: "First option", checked: true },
    { name: "q1", value: "Second option", checked: false },
    { name: "q1", value: "Third option", checked: true }
  ]);

  assert.deepEqual(Array.from(context.__readerTest.getFormValues(form, question)), ["First option", "Third option"]);
});
