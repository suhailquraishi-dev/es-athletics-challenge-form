const STORAGE_KEY = "es-athletics-challenge-draft-v2";

const seedArticles = [
  {
    tag: "Athletics",
    title: "Noah Lyles' Rival Who Made Unsportsmanlike Comment Reveals Their Current Standing",
    url: "https://www.essentiallysports.com/olympics-news-track-and-field-news-noah-lyles-rival-who-made-unsportsmanlike-comment-reveals-their-current-standing/",
    dek: "Noah Lyles' rival revealed where things stand nearly a year after their heated clash at the USATF Championships.",
    image: "https://image-cdn.essentiallysports.com/wp-content/uploads/Noah-Lyles-5.1.jpg",
    author: "Pranav Venkatesh",
    date: "19 hrs ago"
  },
  {
    tag: "Track",
    title: "Sha'Carri Richardson and Melissa Jefferson-Wooden Set to Go Against Each Other Once Again",
    url: "https://www.essentiallysports.com/olympics-news-track-and-field-news-shacarri-richardson-and-melissa-jefferson-wooden-set-to-go-against-each-other-once-again/",
    dek: "Richardson and Jefferson-Wooden are set for another showdown after their thrilling Prefontaine Classic battle.",
    image: "https://image-cdn.essentiallysports.com/wp-content/uploads/image-13-5.png",
    author: "Karthik Sri Hari KC",
    date: "19 hrs ago"
  },
  {
    tag: "Sprints",
    title: "Noah Lyles Chooses Gold Medal in Every Race Over $100 Million for This Reason",
    url: "https://www.essentiallysports.com/olympics-news-track-and-field-news-noah-lyles-chooses-gold-medal-in-every-race-over-hundred-million-dollars-for-this-reason/",
    dek: "Lyles explained why he would rather win gold in every event he enters than accept a massive offer.",
    image: "https://image-cdn.essentiallysports.com/wp-content/uploads/Noah-Lyles-1-1.jpeg",
    author: "Pranav Venkatesh",
    date: "20 hrs ago"
  },
  {
    tag: "Diamond League",
    title: "World Champion Climbs Back to the Top After Shocking Loss to NCAA Athlete",
    url: "https://www.essentiallysports.com/olympics-news-track-and-field-news-world-champion-climbs-back-to-the-top-after-shocking-loss-to-ncaa-athlete/",
    dek: "Oblique Seville answered a rare defeat with a commanding 100m victory at the Monaco Diamond League.",
    image: "https://image-cdn.essentiallysports.com/wp-content/uploads/imago833691748.jpg",
    author: "Karthik Sri Hari KC",
    date: "20 hrs ago"
  }
];

const seedQuestions = [
  {
    id: "q1",
    type: "radio",
    title: "Which sprinter's rival revealed their current standing after a heated USATF Championships clash?",
    points: 5,
    required: true,
    options: ["Noah Lyles", "Fred Kerley", "Kenny Bednarek", "Oblique Seville"],
    answer: "Noah Lyles",
    source: "Noah Lyles' Rival Who Made Unsportsmanlike Comment Reveals Their Current Standing"
  },
  {
    id: "q2",
    type: "checkbox",
    title: "Which athletes are framed for another showdown after the Prefontaine Classic battle?",
    points: 6,
    required: true,
    options: ["Sha'Carri Richardson", "Melissa Jefferson-Wooden", "Gabby Thomas", "Julien Alfred"],
    answer: ["Sha'Carri Richardson", "Melissa Jefferson-Wooden"],
    source: "Sha'Carri Richardson and Melissa Jefferson-Wooden Set to Go Against Each Other Once Again"
  },
  {
    id: "q3",
    type: "select",
    title: "What did Noah Lyles say he would choose over a $100 million offer?",
    points: 4,
    required: true,
    options: ["Gold in every race", "A coaching role", "A marathon debut", "A Diamond League bye"],
    answer: "Gold in every race",
    source: "Noah Lyles Chooses Gold Medal in Every Race Over $100 Million for This Reason"
  },
  {
    id: "q4",
    type: "short",
    title: "Which world champion answered a rare defeat with a 100m win at the Monaco Diamond League?",
    points: 5,
    required: true,
    answer: "Oblique Seville",
    source: "World Champion Climbs Back to the Top After Shocking Loss to NCAA Athlete"
  },
  {
    id: "q5",
    type: "scale",
    title: "How closely did you follow this Athletics news set?",
    points: 5,
    required: true,
    answer: "5",
    source: "All source reads"
  },
];

const backupNews = [
  {
    title: "Noah Lyles' Rival Who Made Unsportsmanlike Comment Reveals Their Current Standing",
    url: "https://www.essentiallysports.com/olympics-news-track-and-field-news-noah-lyles-rival-who-made-unsportsmanlike-comment-reveals-their-current-standing/",
    date: "19 hrs ago",
    image: "https://image-cdn.essentiallysports.com/wp-content/uploads/Noah-Lyles-5.1.jpg"
  },
  {
    title: "Sha'Carri Richardson and Melissa Jefferson-Wooden Set to Go Against Each Other Once Again",
    url: "https://www.essentiallysports.com/olympics-news-track-and-field-news-shacarri-richardson-and-melissa-jefferson-wooden-set-to-go-against-each-other-once-again/",
    date: "19 hrs ago",
    image: "https://image-cdn.essentiallysports.com/wp-content/uploads/image-13-5.png"
  },
  {
    title: "Noah Lyles Chooses Gold Medal in Every Race Over $100 Million for This Reason",
    url: "https://www.essentiallysports.com/olympics-news-track-and-field-news-noah-lyles-chooses-gold-medal-in-every-race-over-hundred-million-dollars-for-this-reason/",
    date: "20 hrs ago",
    image: "https://image-cdn.essentiallysports.com/wp-content/uploads/Noah-Lyles-1-1.jpeg"
  }
];

const sampleChallenge = {
  title: "Essentially Athletics Weekly Challenge",
  category: "Athletics",
  intro: "Answer the questions from this week's Essentially Athletics stories and see your points instantly.",
  articles: seedArticles,
  questions: seedQuestions
};

function getChallenge() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return sampleChallenge;
    const challenge = JSON.parse(saved);
    if (Array.isArray(challenge.questions)) {
      challenge.questions = challenge.questions.filter((question) => !(
        question.id === "q6" &&
        question.title === "In one line, which story would you want the newsletter to follow up on next?"
      ));
    }
    return challenge;
  } catch (error) {
    return sampleChallenge;
  }
}

function saveChallenge(challenge) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(challenge));
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function normalize(value) {
  return String(value ?? "").trim().toLowerCase();
}

function getTotalPoints(questions) {
  return questions.reduce((sum, question) => sum + Number(question.points || 0), 0);
}

function renderReaderPage() {
  const form = document.querySelector("#challenge-form");
  const questionList = document.querySelector("#question-list");
  if (!form || !questionList) return;

  const challenge = getChallenge();
  const totalPoints = getTotalPoints(challenge.questions);
  const totalPointsEl = document.querySelector("#total-points");
  const challengeTitleEl = document.querySelector("#challenge-title");
  if (totalPointsEl) totalPointsEl.textContent = totalPoints;
  if (challengeTitleEl) challengeTitleEl.textContent = challenge.title;

  questionList.innerHTML = challenge.questions.map((question, index) => renderQuestion(question, index, false)).join("");
  renderSources(challenge.articles);
  fetchNews(challenge.category || "Athletics");

  document.querySelector("#refresh-news")?.addEventListener("click", () => fetchNews(challenge.category || "Athletics"));
  document.querySelector("#reset-form").addEventListener("click", () => {
    form.reset();
    document.querySelector("#result-panel").classList.add("is-hidden");
    document.querySelector("#form-error").textContent = "";
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const email = document.querySelector("#reader-email").value.trim();
    const error = document.querySelector("#form-error");
    if (!email || !email.includes("@")) {
      error.textContent = "Enter a valid email ID before submitting.";
      return;
    }

    const missing = challenge.questions.find((question) => question.required && !hasAnswer(form, question));
    if (missing) {
      error.textContent = "Complete all required questions before submitting.";
      return;
    }

    error.textContent = "";
    const score = calculateScore(form, challenge.questions);
    showScore(score, totalPoints);
  });
}

function renderQuestion(question, index, editorPreview) {
  const name = escapeHtml(question.id);
  const points = Number(question.points || 0);
  const required = question.required ? "required" : "";
  const source = question.source ? `<span>Source: ${escapeHtml(question.source)}</span>` : "<span></span>";
  const meta = `
    <div class="question-meta">
      <strong>Question ${index + 1}</strong>
      <span class="question-points">${points} pts</span>
    </div>
  `;
  let control = "";

  if (question.type === "radio") {
    control = `<div class="option-list">${(question.options || []).map((option) => `
      <label><input type="radio" name="${name}" value="${escapeHtml(option)}" ${required}> <span>${escapeHtml(option)}</span></label>
    `).join("")}</div>`;
  } else if (question.type === "checkbox") {
    control = `<div class="option-list">${(question.options || []).map((option) => `
      <label><input type="checkbox" name="${name}" value="${escapeHtml(option)}"> <span>${escapeHtml(option)}</span></label>
    `).join("")}</div>`;
  } else if (question.type === "select") {
    control = `<select name="${name}" ${required}>
      <option value="">Select an answer</option>
      ${(question.options || []).map((option) => `<option value="${escapeHtml(option)}">${escapeHtml(option)}</option>`).join("")}
    </select>`;
  } else if (question.type === "scale") {
    control = `<div class="scale-row">${[1, 2, 3, 4, 5].map((value) => `
      <label><input type="radio" name="${name}" value="${value}" ${required}> ${value}</label>
    `).join("")}</div>`;
  } else if (question.type === "paragraph") {
    control = `<textarea name="${name}" rows="4" placeholder="Write your response" ${required}></textarea>`;
  } else if (question.type === "date") {
    control = `<input type="date" name="${name}" ${required}>`;
  } else if (question.type === "time") {
    control = `<input type="time" name="${name}" ${required}>`;
  } else if (question.type === "file") {
    control = `<input type="file" name="${name}" ${required}>`;
  } else {
    control = `<input type="text" name="${name}" placeholder="Short answer" ${required}>`;
  }

  return `
    <article class="question-card">
      ${meta}
      <h3>${escapeHtml(question.title)}</h3>
      ${control}
      ${editorPreview ? "" : `<div class="question-meta question-source">${source}</div>`}
    </article>
  `;
}

function renderSources(articles) {
  const sourceList = document.querySelector("#source-list");
  if (!sourceList) return;
  const sourceImages = [
    "assets/workspace-card-newsletter-assets.webp",
    "assets/workspace-card-social-media.webp",
    "assets/workspace-card-creative-guide.webp",
    "assets/workspace-card-youtube-thumbnail.webp"
  ];
  sourceList.innerHTML = articles.map((article, index) => `
    <article class="source-card">
      <a class="source-card-image" href="${escapeHtml(article.url)}" target="_blank" rel="noopener">
        <img src="${escapeHtml(article.image || sourceImages[index % sourceImages.length])}" alt="">
      </a>
      <div class="source-card-body">
        <span class="source-tag">${escapeHtml(article.tag)}</span>
        <h3><a href="${escapeHtml(article.url)}" target="_blank" rel="noopener">${escapeHtml(article.title)}</a></h3>
        <p>${escapeHtml(article.dek || "Read the full story behind this challenge question.")}</p>
        <div class="source-meta">
          <img class="source-publisher-logo" src="assets/es-rounded-logo.png" alt="">
          <a href="${escapeHtml(article.url)}" target="_blank" rel="noopener">${escapeHtml(article.author || "EssentiallySports")}</a>
          <span>${escapeHtml(article.date || "Just now")}</span>
        </div>
        <a class="read-article-button" href="${escapeHtml(article.url)}" target="_blank" rel="noopener">Read Full Story</a>
      </div>
    </article>
  `).join("");
}

function hasAnswer(form, question) {
  const values = getFormValues(form, question);
  if (Array.isArray(values)) return values.length > 0;
  return normalize(values).length > 0;
}

function getFormValues(form, question) {
  const fields = Array.from(form.elements).filter((field) => field.name === question.id);
  if (question.type === "checkbox") {
    return fields.filter((field) => field.checked).map((field) => field.value);
  }
  const checked = fields.find((field) => field.checked);
  if (checked) return checked.value;
  return fields[0]?.value || "";
}

function calculateScore(form, questions) {
  return questions.reduce((sum, question) => {
    const answer = question.answer;
    const value = getFormValues(form, question);
    if (question.type === "paragraph" && normalize(value)) return sum + Number(question.points || 0);
    if (Array.isArray(answer)) {
      const selected = Array.isArray(value) ? value.map(normalize).sort().join("|") : "";
      const expected = answer.map(normalize).sort().join("|");
      return selected === expected ? sum + Number(question.points || 0) : sum;
    }
    if (!answer && normalize(value)) return sum + Number(question.points || 0);
    return normalize(value) === normalize(answer) ? sum + Number(question.points || 0) : sum;
  }, 0);
}

function showScore(score, totalPoints) {
  const resultPanel = document.querySelector("#result-panel");
  const percent = totalPoints ? Math.round((score / totalPoints) * 100) : 0;
  document.querySelector("#score-line").textContent = `${score} / ${totalPoints} points`;
  document.querySelector("#score-meter-fill").style.width = `${percent}%`;
  document.querySelector("#reader-points").textContent = `${score} pts`;
  document.querySelector("#reader-rank").textContent = percent >= 80 ? "Leaderboard range" : "Keep climbing";
  document.querySelector("#score-message").textContent =
    percent >= 80
      ? "Strong read. You are in leaderboard range for this challenge."
      : "Thanks for playing. Your score is ready for the challenge board.";
  resultPanel.classList.remove("is-hidden");
  resultPanel.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

async function fetchNews(category) {
  const list = document.querySelector("#news-list");
  const status = document.querySelector("#news-status");
  if (!list || !status) return;

  status.textContent = "Fetching from EssentiallySports...";
  list.innerHTML = "";

  const searchTerm = category.toLowerCase() === "athletics" ? "track and field" : category;
  const functionCategory = category.toLowerCase() === "athletics" ? "track-and-field" : category.toLowerCase();
  const functionEndpoint = `/.netlify/functions/news?category=${encodeURIComponent(functionCategory)}`;
  const endpoint = `https://www.essentiallysports.com/wp-json/wp/v2/posts?search=${encodeURIComponent(searchTerm)}&per_page=5&_embed=1`;
  try {
    const functionResponse = await fetch(functionEndpoint);
    if (functionResponse.ok) {
      const payload = await functionResponse.json();
      if (Array.isArray(payload.stories) && payload.stories.length > 0) {
        status.textContent = "Live category feed loaded";
        renderNews(payload.stories);
        return;
      }
    }

    const response = await fetch(endpoint);
    if (!response.ok) throw new Error("News fetch failed");
    const posts = await response.json();
    if (!Array.isArray(posts) || posts.length === 0) throw new Error("No posts found");
    status.textContent = "Live feed loaded";
    renderNews(posts.map((post) => ({
      title: stripTags(post.title?.rendered || "EssentiallySports story"),
      url: post.link,
      date: new Date(post.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      image: post._embedded?.["wp:featuredmedia"]?.[0]?.source_url || ""
    })));
  } catch (error) {
    status.textContent = "Latest Athletics picks";
    renderNews(backupNews);
  }
}

function stripTags(value) {
  const div = document.createElement("div");
  div.innerHTML = value;
  return div.textContent || div.innerText || "";
}

function renderNews(items) {
  const list = document.querySelector("#news-list");
  list.innerHTML = items.map((item) => `
    <article class="news-item">
      <a class="news-thumb" href="${escapeHtml(item.url)}" target="_blank" rel="noopener" aria-label="${escapeHtml(item.title)}">
        <img src="${escapeHtml(item.image || "assets/workspace-card-newsletter-assets.webp")}" alt="">
      </a>
      <div>
        <a href="${escapeHtml(item.url)}" target="_blank" rel="noopener">${escapeHtml(item.title)}</a>
        <span class="news-source"><img src="assets/es-rounded-logo.png" alt="">${escapeHtml(item.date)}</span>
      </div>
    </article>
  `).join("");
}

function renderEditorPage() {
  const editorList = document.querySelector("#editor-question-list");
  if (!editorList) return;

  let challenge = getChallenge();
  const titleInput = document.querySelector("#edit-title");
  const categoryInput = document.querySelector("#edit-category");
  const introInput = document.querySelector("#edit-intro");

  function syncInputs() {
    titleInput.value = challenge.title;
    categoryInput.value = challenge.category;
    introInput.value = challenge.intro;
  }

  function renderBuilder() {
    editorList.innerHTML = challenge.questions.map((question, index) => `
      <article class="editor-question" data-index="${index}">
        <div class="editor-question-head">
          <strong>${escapeHtml(question.type)}</strong>
          <button class="danger-button" type="button" data-remove="${index}">Remove</button>
        </div>
        <label>Question<input data-field="title" value="${escapeHtml(question.title)}"></label>
        <label>Options, comma separated<input data-field="options" value="${escapeHtml((question.options || []).join(", "))}"></label>
        <label>Correct answer<input data-field="answer" value="${escapeHtml(Array.isArray(question.answer) ? question.answer.join(", ") : question.answer)}"></label>
        <label>Source article<input data-field="source" value="${escapeHtml(question.source || "")}"></label>
        <label>Points<input data-field="points" type="number" min="0" value="${escapeHtml(question.points || 0)}"></label>
      </article>
    `).join("");
    renderEditorPreview();
  }

  function renderEditorPreview() {
    const preview = document.querySelector("#editor-preview-list");
    preview.innerHTML = challenge.questions.map((question, index) => renderQuestion(question, index, true)).join("");
  }

  function captureSettings() {
    challenge.title = titleInput.value.trim() || "Essentially Athletics Weekly Challenge";
    challenge.category = categoryInput.value.trim() || "Athletics";
    challenge.intro = introInput.value.trim();
  }

  syncInputs();
  renderBuilder();

  [titleInput, categoryInput, introInput].forEach((input) => {
    input.addEventListener("input", () => {
      captureSettings();
      renderEditorPreview();
    });
  });

  document.querySelector(".builder-toolbar").addEventListener("click", (event) => {
    const type = event.target.dataset.addType;
    if (!type) return;
    challenge.questions.push({
      id: `q${Date.now()}`,
      type,
      title: `New ${type} question`,
      points: type === "file" ? 0 : 5,
      required: true,
      options: ["Option 1", "Option 2", "Option 3"],
      answer: type === "checkbox" ? ["Option 1"] : "Option 1",
      source: "Source article"
    });
    renderBuilder();
  });

  editorList.addEventListener("input", (event) => {
    const card = event.target.closest(".editor-question");
    if (!card) return;
    const question = challenge.questions[Number(card.dataset.index)];
    const field = event.target.dataset.field;
    if (field === "options") {
      question.options = event.target.value.split(",").map((item) => item.trim()).filter(Boolean);
    } else if (field === "answer" && question.type === "checkbox") {
      question.answer = event.target.value.split(",").map((item) => item.trim()).filter(Boolean);
    } else if (field === "points") {
      question.points = Number(event.target.value || 0);
    } else {
      question[field] = event.target.value;
    }
    renderEditorPreview();
  });

  editorList.addEventListener("click", (event) => {
    const index = event.target.dataset.remove;
    if (index === undefined) return;
    challenge.questions.splice(Number(index), 1);
    renderBuilder();
  });

  document.querySelector("#load-sample").addEventListener("click", () => {
    challenge = JSON.parse(JSON.stringify(sampleChallenge));
    syncInputs();
    renderBuilder();
  });

  document.querySelector("#save-challenge").addEventListener("click", () => {
    captureSettings();
    saveChallenge(challenge);
    const button = document.querySelector("#save-challenge");
    button.textContent = "Saved";
    setTimeout(() => {
      button.textContent = "Save draft";
    }, 1400);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  renderReaderPage();
  renderEditorPage();
});
