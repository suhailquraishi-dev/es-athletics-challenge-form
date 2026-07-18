(function () {
  const QUESTION_TYPES = [
    ["short", "Short answer"],
    ["paragraph", "Paragraph"],
    ["radio", "Multiple choice"],
    ["checkbox", "Checkboxes"],
    ["select", "Dropdown"],
    ["scale", "Linear scale"],
    ["date", "Date"],
    ["time", "Time"]
  ];
  const CHOICE_TYPES = new Set(["radio", "checkbox", "select"]);

  const loginShell = document.querySelector("#editor-login");
  const workspace = document.querySelector("#editor-workspace");
  if (!loginShell || !workspace) return;

  const loginForm = document.querySelector("#editor-login-form");
  const loginError = document.querySelector("#editor-login-error");
  const picker = document.querySelector("#challenge-picker");
  const statusPill = document.querySelector("#editor-status");
  const feedback = document.querySelector("#editor-feedback");
  const questionList = document.querySelector("#editor-question-list");
  const articleList = document.querySelector("#editor-article-list");
  const previewList = document.querySelector("#editor-preview-list");
  const publishedLink = document.querySelector("#published-link");
  const publishedUrl = document.querySelector("#published-url");
  const tabButtons = Array.from(document.querySelectorAll("[data-editor-tab]"));
  const tabPanels = Array.from(document.querySelectorAll("[data-editor-panel]"));
  const addQuestionToggle = document.querySelector("#add-question-toggle");
  const addQuestionMenu = document.querySelector("#add-question-menu");
  const previewToggle = document.querySelector("#toggle-editor-preview");
  const settings = {
    slug: document.querySelector("#edit-slug"),
    title: document.querySelector("#edit-title"),
    category: document.querySelector("#edit-category"),
    intro: document.querySelector("#edit-intro")
  };

  let challenge = null;
  let challengeStatus = "draft";
  let summaries = [];
  let dirty = false;
  let activeQuestionIndex = 0;
  let activeEditorTab = "questions";
  let draggedQuestionIndex = null;

  async function request(path, options = {}) {
    const response = await fetch(path, {
      ...options,
      headers: {
        accept: "application/json",
        ...(options.body ? { "content-type": "application/json", "x-es-editor-request": "1" } : {}),
        ...(options.headers || {})
      }
    });
    const result = await response.json().catch(() => null);
    if (response.status === 401) showLogin();
    if (!response.ok || !result?.ok) {
      const error = new Error(result?.code || "EDITOR_REQUEST_FAILED");
      error.code = result?.code;
      error.fields = result?.fields;
      throw error;
    }
    return result;
  }

  function showLogin() {
    loginShell.classList.remove("is-hidden");
    workspace.classList.add("is-hidden");
    loginForm.reset();
    document.querySelector("#editor-password").focus();
  }

  function showWorkspace() {
    loginShell.classList.add("is-hidden");
    workspace.classList.remove("is-hidden");
  }

  function createBlankChallenge(source) {
    const date = new Date().toISOString().slice(0, 10);
    const baseSlug = `athletics-weekly-${date}`;
    const slugExists = summaries.some((item) => item.slug === baseSlug);
    const slug = slugExists ? `${baseSlug}-${String(Date.now()).slice(-4)}` : baseSlug;
    if (source) {
      return {
        ...JSON.parse(JSON.stringify(source)),
        id: slug,
        slug,
        title: source.title || "Weekly Challenge"
      };
    }
    return {
      id: slug,
      slug,
      title: "Weekly Challenge",
      category: "Athletics",
      intro: "Answer the questions from this week's Essentially Athletics stories and see your points instantly.",
      articles: [],
      questions: [newQuestion("radio")]
    };
  }

  function newQuestion(type) {
    const hasChoices = CHOICE_TYPES.has(type);
    return {
      id: `q${Date.now()}${Math.floor(Math.random() * 100)}`,
      type,
      title: "New question",
      points: 5,
      required: true,
      options: hasChoices ? ["Option 1", "Option 2", "Option 3"] : [],
      answer: type === "checkbox" ? ["Option 1"] : type === "paragraph" ? "" : hasChoices ? "Option 1" : "",
      image: "",
      source: ""
    };
  }

  async function loadChallengeList(preferredSlug) {
    const result = await request("/api/editor/challenges");
    summaries = result.challenges || [];
    renderPicker();
    const target = preferredSlug || summaries[0]?.slug;
    if (target) {
      await loadChallenge(target);
    } else {
      setChallenge(createBlankChallenge(), "draft");
    }
  }

  function renderPicker() {
    picker.innerHTML = summaries.length
      ? summaries.map((item) => `<option value="${escapeHtml(item.slug)}">${escapeHtml(item.title)} (${escapeHtml(item.status)})</option>`).join("")
      : `<option value="">New unsaved challenge</option>`;
  }

  async function loadChallenge(slug) {
    setFeedback("Loading challenge...", "");
    try {
      const result = await request(`/api/editor/challenges?slug=${encodeURIComponent(slug)}`);
      setChallenge(result.challenge, result.status);
      picker.value = result.challenge.slug || result.challenge.id;
      setFeedback("", "");
    } catch (error) {
      setFeedback("This challenge could not be loaded.", "error");
    }
  }

  function setChallenge(nextChallenge, status) {
    challenge = {
      ...nextChallenge,
      slug: nextChallenge.slug || nextChallenge.id || "",
      id: nextChallenge.slug || nextChallenge.id || "",
      articles: Array.isArray(nextChallenge.articles) ? nextChallenge.articles : [],
      questions: Array.isArray(nextChallenge.questions) ? nextChallenge.questions : []
    };
    challengeStatus = status || "draft";
    dirty = false;
    activeQuestionIndex = Math.min(activeQuestionIndex, Math.max(0, challenge.questions.length - 1));
    settings.slug.value = challenge.slug;
    settings.title.value = challenge.title || "";
    settings.category.value = challenge.category || "";
    settings.intro.value = challenge.intro || "";
    renderEditor();
  }

  function renderEditor() {
    renderQuestions();
    renderArticles();
    renderPreview();
    setEditorTab(activeEditorTab);
    updatePublishState();
  }

  function renderQuestions() {
    if (!challenge.questions.length) {
      questionList.innerHTML = `<p class="editor-empty-state">Add a question to begin building the challenge.</p>`;
      return;
    }
    questionList.innerHTML = challenge.questions.map((question, index) => {
      const active = index === activeQuestionIndex;
      const typeLabel = QUESTION_TYPES.find(([value]) => value === question.type)?.[1] || "Question";
      const choiceFields = CHOICE_TYPES.has(question.type) ? `
        <label class="full-width"><span>Options, one per line</span><textarea data-field="options" rows="3">${escapeHtml((question.options || []).join("\n"))}</textarea></label>
      ` : "";
      const answerHelp = question.type === "checkbox" ? "Correct answers, one per line" : "Correct answer";
      const answerField = question.type === "paragraph" ? "" : `
        <label class="full-width"><span>${answerHelp}</span><textarea data-field="answer" rows="2">${escapeHtml(Array.isArray(question.answer) ? question.answer.join("\n") : question.answer || "")}</textarea></label>
      `;
      const scoringNote = question.type === "short"
        ? "Short answers ignore capitalization and surrounding spaces, but the wording must otherwise match the answer key."
        : question.type === "paragraph"
          ? "Paragraph questions award their points for any non-empty response."
          : "";
      return `
        <article class="editor-question${active ? " is-active" : ""}" data-index="${index}">
          <div class="editor-question-summary-row">
            <button class="editor-drag-handle" type="button" draggable="true" aria-label="Drag Question ${index + 1} to reorder" title="Drag to reorder">&#8597;</button>
            <button class="editor-question-summary" type="button" data-action="activate" aria-expanded="${active}">
              <span class="editor-question-index">Question ${index + 1}</span>
              <strong>${escapeHtml(question.title || "Untitled question")}</strong>
              <span class="editor-question-summary-meta">${escapeHtml(typeLabel)} &middot; ${Number(question.points || 0)} pts${question.required !== false ? " &middot; Required" : ""}</span>
            </button>
          </div>
          ${active ? `
          <div class="editor-question-body">
            <div class="editor-card-actions" aria-label="Question actions">
              <button type="button" data-action="up" aria-label="Move question up" title="Move up" ${index === 0 ? "disabled" : ""}>&uarr;</button>
              <button type="button" data-action="down" aria-label="Move question down" title="Move down" ${index === challenge.questions.length - 1 ? "disabled" : ""}>&darr;</button>
              <button type="button" data-action="duplicate">Duplicate</button>
              <button class="danger-button" type="button" data-action="remove">Delete</button>
            </div>
            <div class="editor-card-grid">
            <label class="full-width"><span>Question</span><input data-field="title" maxlength="300" value="${escapeHtml(question.title)}"></label>
            <label><span>Question type</span><select data-field="type">${QUESTION_TYPES.map(([value, label]) => `<option value="${value}" ${value === question.type ? "selected" : ""}>${label}</option>`).join("")}</select></label>
            <label><span>Points</span><input data-field="points" type="number" min="0" max="100" value="${escapeHtml(question.points || 0)}"></label>
            ${choiceFields}
            ${answerField}
            ${scoringNote ? `<p class="editor-scoring-note full-width" role="note"><strong>Scoring:</strong> ${scoringNote}</p>` : ""}
            <label class="editor-required-toggle"><input data-field="required" type="checkbox" ${question.required !== false ? "checked" : ""}> Required</label>
            <details class="editor-more-options full-width">
              <summary>More options</summary>
              <div class="editor-more-options-grid">
                <label><span>Hint</span><input data-field="source" maxlength="300" value="${escapeHtml(question.source || "")}" placeholder="A useful clue that does not reveal the answer"></label>
                <label><span>Image URL (optional, maximum two questions)</span><input data-field="image" type="url" value="${escapeHtml(question.image || "")}" placeholder="https://..."></label>
              </div>
            </details>
            </div>
          </div>
          ` : ""}
        </article>
      `;
    }).join("");
  }

  function renderArticles() {
    if (!challenge.articles.length) {
      articleList.innerHTML = `<p class="editor-empty-state">Add the stories readers should review before answering.</p>`;
      return;
    }
    articleList.innerHTML = challenge.articles.map((article, index) => `
      <article class="editor-article" data-index="${index}">
        <div class="editor-question-head"><strong>Story ${index + 1}</strong><button class="danger-button" type="button" data-action="remove-article">Remove</button></div>
        <div class="editor-card-grid">
          <label>Category tag<input data-article-field="tag" maxlength="60" value="${escapeHtml(article.tag || "")}"></label>
          <label>Author<input data-article-field="author" maxlength="100" value="${escapeHtml(article.author || "")}"></label>
          <label class="full-width">Headline<input data-article-field="title" maxlength="300" value="${escapeHtml(article.title || "")}"></label>
          <label class="full-width">Story URL<input data-article-field="url" type="url" value="${escapeHtml(article.url || "")}" placeholder="https://www.essentiallysports.com/..."></label>
          <label class="full-width">Image URL<input data-article-field="image" type="url" value="${escapeHtml(article.image || "")}" placeholder="https://..."></label>
          <label>Published label<input data-article-field="date" maxlength="60" value="${escapeHtml(article.date || "")}" placeholder="2 hrs ago"></label>
        </div>
      </article>
    `).join("");
  }

  function renderPreview() {
    previewList.innerHTML = challenge.questions.length
      ? challenge.questions.map((question, index) => renderQuestion(question, index, true)).join("")
      : `<p class="editor-empty-state">Questions will appear here.</p>`;
    setupSimpleSelects(previewList);
    previewList.children[activeQuestionIndex]?.classList.add("is-preview-active");
  }

  function setEditorTab(name) {
    activeEditorTab = ["questions", "stories", "settings"].includes(name) ? name : "questions";
    tabButtons.forEach((button) => {
      const active = button.dataset.editorTab === activeEditorTab;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-selected", String(active));
      button.tabIndex = active ? 0 : -1;
    });
    tabPanels.forEach((panel) => {
      const active = panel.dataset.editorPanel === activeEditorTab;
      panel.hidden = !active;
      panel.classList.toggle("is-active", active);
    });
  }

  function closeAddQuestionMenu() {
    addQuestionMenu.hidden = true;
    addQuestionToggle.setAttribute("aria-expanded", "false");
  }

  function updatePublishState() {
    const published = challengeStatus === "published";
    statusPill.textContent = published ? "Published" : "Draft";
    statusPill.classList.toggle("is-published", published);
    document.querySelector("#editor-lock-note").classList.toggle("is-hidden", !published);
    document.querySelector("#duplicate-challenge").classList.toggle("is-hidden", !published);
    document.querySelector("#save-challenge").disabled = published;
    document.querySelector("#publish-challenge").disabled = published;
    document.querySelector("#builder").classList.toggle("is-published", published);
    document.querySelectorAll("#builder input:not(#published-url), #builder textarea, #builder select, .builder-toolbar button, #add-article, .editor-question button:not([data-action='activate']), .editor-article button")
      .forEach((control) => { control.disabled = published; });
    questionList.querySelectorAll("[draggable='true']").forEach((handle) => {
      handle.draggable = !published;
    });
    if (published) {
      publishedUrl.value = readerUrl(challenge.slug);
      publishedLink.classList.remove("is-hidden");
    } else {
      publishedLink.classList.add("is-hidden");
    }
  }

  function markDirty() {
    dirty = true;
    if (challengeStatus !== "published") setFeedback("Unsaved changes", "muted");
  }

  function setFeedback(message, state) {
    feedback.textContent = message;
    feedback.dataset.state = state || "";
  }

  function readerUrl(slug) {
    return `${window.location.origin}/index.html?challenge=${encodeURIComponent(slug)}`;
  }

  async function save(action) {
    syncSettings();
    setFeedback(action === "publish" ? "Publishing challenge..." : "Saving draft...", "");
    const button = document.querySelector(action === "publish" ? "#publish-challenge" : "#save-challenge");
    button.disabled = true;
    try {
      const result = await request("/api/editor/challenges", {
        method: "POST",
        body: JSON.stringify({ action, challenge })
      });
      dirty = false;
      challengeStatus = result.status || (action === "publish" ? "published" : "draft");
      setFeedback(action === "publish" ? "Published. The reader link is ready." : "Draft saved to the shared editor.", "success");
      await loadChallengeList(challenge.slug);
    } catch (error) {
      const message = error.code === "PUBLISHED_CHALLENGE_LOCKED" || error.code === "RESPONSE_SCHEMA_LOCKED"
        ? "This published challenge is locked. Duplicate it to create a new edition."
        : error.code === "INVALID_CHALLENGE"
          ? `Check the required challenge fields${Array.isArray(error.fields) && error.fields.length ? `: ${error.fields.slice(0, 4).join(", ")}` : "."}`
          : "The challenge could not be saved. Please try again.";
      setFeedback(message, "error");
    } finally {
      if (challengeStatus !== "published") button.disabled = false;
    }
  }

  function syncSettings() {
    challenge.slug = settings.slug.value.trim();
    challenge.id = challenge.slug;
    challenge.title = settings.title.value.trim();
    challenge.category = settings.category.value.trim();
    challenge.intro = settings.intro.value.trim();
  }

  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const button = loginForm.querySelector("button[type='submit']");
    button.disabled = true;
    loginError.textContent = "";
    try {
      await request("/api/editor/login", {
        method: "POST",
        body: JSON.stringify({
          password: loginForm.elements.password.value,
          website: loginForm.elements.website.value
        })
      });
      loginForm.reset();
      showWorkspace();
      await loadChallengeList();
    } catch (error) {
      loginError.textContent = error.code === "RATE_LIMITED"
        ? "Too many sign-in attempts. Try again later."
        : "The password was not accepted.";
    } finally {
      button.disabled = false;
    }
  });

  picker.addEventListener("change", () => {
    if (picker.value) loadChallenge(picker.value);
  });

  tabButtons.forEach((button, index) => {
    button.addEventListener("click", () => setEditorTab(button.dataset.editorTab));
    button.addEventListener("keydown", (event) => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const nextIndex = event.key === 'Home'
        ? 0
        : event.key === 'End'
          ? tabButtons.length - 1
          : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabButtons.length) % tabButtons.length;
      setEditorTab(tabButtons[nextIndex].dataset.editorTab);
      tabButtons[nextIndex].focus();
    });
  });

  Object.entries(settings).forEach(([field, input]) => {
    input.addEventListener("input", () => {
      challenge[field] = input.value;
      if (field === "slug") challenge.id = input.value;
      markDirty();
    });
  });

  addQuestionToggle.addEventListener("click", (event) => {
    event.stopPropagation();
    const opening = addQuestionMenu.hidden;
    addQuestionMenu.hidden = !opening;
    addQuestionToggle.setAttribute("aria-expanded", String(opening));
    if (opening) addQuestionMenu.querySelector("button")?.focus();
  });

  document.querySelector(".builder-toolbar").addEventListener("click", (event) => {
    const type = event.target.dataset.addType;
    if (!type) return;
    challenge.questions.push(newQuestion(type));
    activeQuestionIndex = challenge.questions.length - 1;
    markDirty();
    closeAddQuestionMenu();
    setEditorTab("questions");
    renderQuestions();
    renderPreview();
  });

  addQuestionMenu.addEventListener("keydown", (event) => {
    const items = Array.from(addQuestionMenu.querySelectorAll("[role='menuitem']"));
    const index = items.indexOf(document.activeElement);
    if (event.key === "Escape") {
      event.preventDefault();
      closeAddQuestionMenu();
      addQuestionToggle.focus();
    } else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      items[(index + (event.key === "ArrowDown" ? 1 : -1) + items.length) % items.length].focus();
    }
  });

  questionList.addEventListener("input", (event) => {
    const card = event.target.closest(".editor-question");
    if (!card) return;
    const question = challenge.questions[Number(card.dataset.index)];
    const field = event.target.dataset.field;
    if (!field) return;
    if (field === "options") {
      question.options = event.target.value.split("\n").map((item) => item.trim()).filter(Boolean);
    } else if (field === "answer" && question.type === "checkbox") {
      question.answer = event.target.value.split("\n").map((item) => item.trim()).filter(Boolean);
    } else if (field === "points") {
      question.points = Number(event.target.value || 0);
    } else if (field === "required") {
      question.required = event.target.checked;
    } else {
      question[field] = event.target.value;
    }
    markDirty();
    renderPreview();
  });

  questionList.addEventListener("change", (event) => {
    if (event.target.dataset.field !== "type") return;
    const card = event.target.closest(".editor-question");
    const question = challenge.questions[Number(card.dataset.index)];
    question.type = event.target.value;
    if (CHOICE_TYPES.has(question.type) && (!question.options || question.options.length < 2)) {
      question.options = ["Option 1", "Option 2", "Option 3"];
      question.answer = question.type === "checkbox" ? ["Option 1"] : "Option 1";
    }
    if (question.type === "paragraph") question.answer = "";
    markDirty();
    renderQuestions();
    renderPreview();
  });

  questionList.addEventListener("click", (event) => {
    const actionControl = event.target.closest("[data-action]");
    const action = actionControl?.dataset.action;
    if (!action) return;
    const card = actionControl.closest(".editor-question");
    const index = Number(card.dataset.index);
    if (action === "activate") {
      activeQuestionIndex = index;
      renderQuestions();
      renderPreview();
      updatePublishState();
      return;
    }
    if (action === "remove") {
      challenge.questions.splice(index, 1);
      activeQuestionIndex = Math.min(index, Math.max(0, challenge.questions.length - 1));
    }
    if (action === "duplicate") {
      const copy = JSON.parse(JSON.stringify(challenge.questions[index]));
      copy.id = `q${Date.now()}${Math.floor(Math.random() * 100)}`;
      challenge.questions.splice(index + 1, 0, copy);
      activeQuestionIndex = index + 1;
    }
    if (action === "up" && index > 0) {
      [challenge.questions[index - 1], challenge.questions[index]] = [challenge.questions[index], challenge.questions[index - 1]];
      activeQuestionIndex = index - 1;
    }
    if (action === "down" && index < challenge.questions.length - 1) {
      [challenge.questions[index + 1], challenge.questions[index]] = [challenge.questions[index], challenge.questions[index + 1]];
      activeQuestionIndex = index + 1;
    }
    markDirty();
    renderQuestions();
    renderPreview();
  });

  questionList.addEventListener("dragstart", (event) => {
    const handle = event.target.closest(".editor-drag-handle");
    if (!handle || challengeStatus === "published") return event.preventDefault();
    const card = handle.closest(".editor-question");
    draggedQuestionIndex = Number(card.dataset.index);
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", String(draggedQuestionIndex));
    card.classList.add("is-dragging");
  });

  questionList.addEventListener("dragover", (event) => {
    if (draggedQuestionIndex === null) return;
    const card = event.target.closest(".editor-question");
    if (!card) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    questionList.querySelectorAll(".is-drag-target").forEach((item) => item.classList.remove("is-drag-target"));
    card.classList.add("is-drag-target");
  });

  questionList.addEventListener("drop", (event) => {
    const card = event.target.closest(".editor-question");
    if (!card || draggedQuestionIndex === null) return;
    event.preventDefault();
    const targetIndex = Number(card.dataset.index);
    const [moved] = challenge.questions.splice(draggedQuestionIndex, 1);
    challenge.questions.splice(targetIndex, 0, moved);
    activeQuestionIndex = targetIndex;
    draggedQuestionIndex = null;
    markDirty();
    renderQuestions();
    renderPreview();
  });

  questionList.addEventListener("dragend", () => {
    draggedQuestionIndex = null;
    questionList.querySelectorAll(".is-dragging, .is-drag-target").forEach((item) => item.classList.remove("is-dragging", "is-drag-target"));
  });

  document.querySelector("#add-article").addEventListener("click", () => {
    challenge.articles.push({ tag: challenge.category || "Athletics", title: "", url: "", image: "", author: "", date: "" });
    markDirty();
    renderArticles();
  });

  articleList.addEventListener("input", (event) => {
    const card = event.target.closest(".editor-article");
    if (!card || !event.target.dataset.articleField) return;
    challenge.articles[Number(card.dataset.index)][event.target.dataset.articleField] = event.target.value;
    markDirty();
  });

  articleList.addEventListener("click", (event) => {
    if (event.target.dataset.action !== "remove-article") return;
    const card = event.target.closest(".editor-article");
    challenge.articles.splice(Number(card.dataset.index), 1);
    markDirty();
    renderArticles();
  });

  document.querySelector("#new-challenge").addEventListener("click", () => {
    activeQuestionIndex = 0;
    setChallenge(createBlankChallenge(), "draft");
    picker.innerHTML = `<option value="">New unsaved challenge</option>` + picker.innerHTML;
    picker.value = "";
    settings.slug.focus();
  });

  document.querySelector("#duplicate-challenge").addEventListener("click", () => {
    activeQuestionIndex = 0;
    setChallenge(createBlankChallenge(challenge), "draft");
    picker.innerHTML = `<option value="">New unsaved challenge</option>` + picker.innerHTML;
    picker.value = "";
    setFeedback("Duplicated. Update the slug and content before publishing.", "muted");
  });

  document.querySelector("#save-challenge").addEventListener("click", () => save("draft"));
  document.querySelector("#publish-challenge").addEventListener("click", () => save("publish"));

  document.querySelector("#copy-published-link").addEventListener("click", async () => {
    await navigator.clipboard.writeText(publishedUrl.value);
    setFeedback("Reader link copied.", "success");
  });

  previewToggle.addEventListener("click", () => {
    const open = workspace.classList.toggle("is-preview-open");
    previewToggle.setAttribute("aria-expanded", String(open));
    previewToggle.textContent = open ? "Close preview" : "Preview";
  });

  document.addEventListener("click", (event) => {
    if (!event.target.closest(".builder-toolbar")) closeAddQuestionMenu();
  });

  document.querySelector("#editor-logout").addEventListener("click", async () => {
    await request("/api/editor/logout", { method: "POST", body: JSON.stringify({}) }).catch(() => null);
    challenge = null;
    showLogin();
  });

  window.addEventListener("beforeunload", (event) => {
    if (!dirty) return;
    event.preventDefault();
    event.returnValue = "";
  });

  async function initialise() {
    try {
      const session = await request("/api/editor/session");
      if (!session.authenticated) return showLogin();
      showWorkspace();
      await loadChallengeList();
    } catch (error) {
      showLogin();
    }
  }

  initialise();
}());
