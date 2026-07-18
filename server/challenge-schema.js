const ALLOWED_TYPES = new Set(["short", "paragraph", "radio", "checkbox", "select", "scale", "date", "time"]);
const CHOICE_TYPES = new Set(["radio", "checkbox", "select"]);

function validateAndNormalizeChallenge(input, { requireAnswers = true, allowLegacyCheckbox = true } = {}) {
  const errors = [];
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return { ok: false, errors: ["challenge"] };
  }

  const slug = cleanSlug(input.slug || input.id);
  const title = cleanText(input.title, 120);
  const category = cleanText(input.category, 60);
  const intro = cleanText(input.intro, 500);
  if (!slug) errors.push("slug");
  if (title.length < 3) errors.push("title");
  if (category.length < 2) errors.push("category");

  const rawQuestions = Array.isArray(input.questions) ? input.questions : [];
  if (!rawQuestions.length || rawQuestions.length > 50) errors.push("questions");
  const seenIds = new Set();
  let imageCount = 0;
  let totalPoints = 0;

  const questions = rawQuestions.slice(0, 50).map((question, index) => {
    const source = question && typeof question === "object" ? question : {};
    const id = cleanIdentifier(source.id, 80);
    const type = cleanIdentifier(source.type, 20).toLowerCase();
    const questionTitle = cleanText(source.title, 300);
    const points = Math.max(0, Math.min(100, Number(source.points) || 0));
    const options = uniqueStrings(source.options, 20, 160);
    const hint = cleanText(source.source || source.hint, 300);
    const image = cleanMediaUrl(source.image, 1000);
    const answer = normalizeExpectedAnswer(source.answer, type);

    if (!id || seenIds.has(id)) errors.push(`questions.${index}.id`);
    if (id) seenIds.add(id);
    if (!ALLOWED_TYPES.has(type)) errors.push(`questions.${index}.type`);
    if (type === "checkbox" && !allowLegacyCheckbox) errors.push(`questions.${index}.type`);
    if (!questionTitle) errors.push(`questions.${index}.title`);
    if (CHOICE_TYPES.has(type) && options.length < 2) errors.push(`questions.${index}.options`);
    if (type === "checkbox" && Array.isArray(answer) && answer.some((item) => !options.includes(item))) {
      errors.push(`questions.${index}.answer`);
    }
    if ((type === "radio" || type === "select") && answer && !options.includes(answer)) {
      errors.push(`questions.${index}.answer`);
    }
    if (requireAnswers && points > 0 && !hasExpectedAnswer(answer, type)) {
      errors.push(`questions.${index}.answer`);
    }
    if (image) imageCount += 1;
    totalPoints += points;

    return {
      id,
      type,
      title: questionTitle,
      points,
      required: source.required !== false,
      options: CHOICE_TYPES.has(type) ? options : [],
      answer,
      image,
      source: hint
    };
  });

  if (imageCount > 2) errors.push("questionImages");
  if (totalPoints <= 0 || totalPoints > 10000) errors.push("totalPoints");

  const rawArticles = Array.isArray(input.articles) ? input.articles : [];
  if (rawArticles.length > 12) errors.push("articles");
  const articles = rawArticles.slice(0, 12).map((article, index) => {
    const source = article && typeof article === "object" ? article : {};
    const url = cleanArticleUrl(source.url);
    const articleTitle = cleanText(source.title, 300);
    if (!url) errors.push(`articles.${index}.url`);
    if (!articleTitle) errors.push(`articles.${index}.title`);
    return {
      tag: cleanText(source.tag, 60),
      title: articleTitle,
      url,
      image: cleanMediaUrl(source.image, 1000),
      author: cleanText(source.author, 100),
      date: cleanText(source.date, 60)
    };
  });

  if (errors.length) return { ok: false, errors: [...new Set(errors)] };
  return {
    ok: true,
    value: { slug, id: slug, title, category, intro, articles, questions }
  };
}

function toPublicChallenge(challenge) {
  return {
    ...challenge,
    questions: challenge.questions.map((question) => {
      if (question.type === "checkbox") return legacyCheckboxToSingleChoice(question);
      const { answer, ...publicQuestion } = question;
      return publicQuestion;
    })
  };
}

function gradeChallenge(challenge, submittedAnswers) {
  const answers = new Map(
    (Array.isArray(submittedAnswers) ? submittedAnswers : []).map((answer) => [
      cleanIdentifier(answer?.id, 80),
      normalizeSubmittedValue(answer?.value)
    ])
  );
  const missing = [];
  let score = 0;
  let totalPoints = 0;

  const storedAnswers = challenge.questions.map((question) => {
    const value = answers.get(question.id);
    const hasValue = Array.isArray(value) ? value.length > 0 : Boolean(cleanText(value, 2000));
    if (question.required && !hasValue) missing.push(question.id);
    const points = Number(question.points || 0);
    totalPoints += points;
    if (isCorrectAnswer(value, question.answer, question.type)) score += points;
    return { id: question.id, title: question.title, type: question.type, value: value ?? "" };
  });

  return { ok: missing.length === 0, missing, score, totalPoints, answers: storedAnswers };
}

function isCorrectAnswer(value, expected, type) {
  if (type === "checkbox") {
    if (!Array.isArray(expected)) return false;
    if (Array.isArray(value)) {
      return value.map(normalizeText).sort().join("|") === expected.map(normalizeText).sort().join("|");
    }
    return normalizeText(value) === normalizeText(formatChoiceGroup(expected));
  }
  if (type === "paragraph" && !normalizeText(expected)) return Boolean(normalizeText(value));
  return normalizeText(value) === normalizeText(expected);
}

function legacyCheckboxToSingleChoice(question) {
  const correctAnswers = Array.isArray(question.answer) ? question.answer.filter(Boolean) : [];
  const groupSize = Math.max(1, correctAnswers.length);
  const correctOption = formatChoiceGroup(correctAnswers);
  const distractors = combinations(question.options || [], groupSize)
    .map(formatChoiceGroup)
    .filter((option) => option && normalizeText(option) !== normalizeText(correctOption))
    .slice(0, 3);
  const options = [...distractors];
  options.splice(Math.min(1, options.length), 0, correctOption);
  const title = /^which athletes\b/i.test(question.title)
    ? question.title.replace(/^which athletes\b/i, "Which pair of athletes")
    : question.title;
  const { answer, ...publicQuestion } = question;
  return { ...publicQuestion, type: "radio", title, options: options.filter(Boolean) };
}

function combinations(items, size, start = 0, current = [], result = []) {
  if (current.length === size) {
    result.push([...current]);
    return result;
  }
  for (let index = start; index <= items.length - (size - current.length); index += 1) {
    current.push(items[index]);
    combinations(items, size, index + 1, current, result);
    current.pop();
  }
  return result;
}

function formatChoiceGroup(items) {
  return (Array.isArray(items) ? items : []).join(" & ");
}

function normalizeExpectedAnswer(value, type) {
  if (type === "checkbox") return uniqueStrings(value, 20, 500);
  return cleanText(value, 2000);
}

function normalizeSubmittedValue(value) {
  if (Array.isArray(value)) return uniqueStrings(value, 20, 500);
  return cleanText(value, 2000);
}

function hasExpectedAnswer(answer, type) {
  if (type === "checkbox") return Array.isArray(answer) && answer.length > 0;
  if (type === "paragraph") return true;
  return Boolean(cleanText(answer, 2000));
}

function uniqueStrings(value, limit, itemLimit) {
  const items = Array.isArray(value) ? value : typeof value === "string" ? value.split(",") : [];
  return [...new Set(items.map((item) => cleanText(item, itemLimit)).filter(Boolean))].slice(0, limit);
}

function cleanArticleUrl(value) {
  const url = parseHttpsUrl(value);
  if (!url) return "";
  const hostname = url.hostname.toLowerCase();
  return hostname === "essentiallysports.com" || hostname.endsWith(".essentiallysports.com") ? url.href : "";
}

function cleanMediaUrl(value, limit) {
  const url = parseHttpsUrl(cleanText(value, limit));
  if (!url) return "";
  const hostname = url.hostname.toLowerCase();
  return hostname === "essentiallysports.com" || hostname.endsWith(".essentiallysports.com") ? url.href : "";
}

function parseHttpsUrl(value) {
  if (!value) return null;
  try {
    const url = new URL(String(value));
    return url.protocol === "https:" ? url : null;
  } catch (error) {
    return null;
  }
}

function cleanSlug(value) {
  const slug = cleanText(value, 80).toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "");
  return slug.length >= 3 ? slug : "";
}

function cleanIdentifier(value, limit) {
  return cleanText(value, limit).replace(/[^a-zA-Z0-9_-]/g, "");
}

function cleanText(value, limit) {
  if (value === undefined || value === null) return "";
  return String(value).trim().slice(0, limit);
}

function normalizeText(value) {
  return cleanText(value, 2000).toLowerCase().replace(/\s+/g, " ");
}

module.exports = {
  ALLOWED_TYPES,
  validateAndNormalizeChallenge,
  toPublicChallenge,
  gradeChallenge,
  cleanIdentifier,
  cleanSlug,
  cleanText
};
