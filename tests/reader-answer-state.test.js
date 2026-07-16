const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const source = fs.readFileSync("script.js", "utf8");
const context = {
  document: { addEventListener() {} }
};
vm.createContext(context);
vm.runInContext(`${source}\nthis.__readerTest = { getFormValues, hasAnswer, mergeStories };`, context);

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

test("deduplicates news stories by URL, normalized title, and image", () => {
  const stories = context.__readerTest.mergeStories([
    { title: "First Story", url: "https://example.com/first/", image: "https://images.example/first.jpg" },
    { title: "Second Story", url: "https://example.com/second", image: "https://images.example/second.jpg" }
  ], [
    { title: "First Story", url: "https://example.com/first?ref=feed", image: "https://images.example/new.jpg" },
    { title: "Different headline", url: "https://example.com/third", image: "https://images.example/second.jpg?size=large" },
    { title: "Third Story", url: "https://example.com/fourth", image: "https://images.example/fourth.jpg" }
  ]);

  assert.deepEqual(Array.from(stories, (story) => story.title), ["First Story", "Second Story", "Third Story"]);
});
