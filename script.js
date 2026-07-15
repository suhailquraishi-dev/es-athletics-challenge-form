const STORAGE_KEY = "es-athletics-challenge-draft-v2";
const Q1_IMAGE_REMOVAL_KEY = "es-athletics-q1-image-removed-v2";

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
    image: "",
    source: "Think back to the rivalry covered after the heated USATF Championships clash."
  },
  {
    id: "q2",
    type: "checkbox",
    title: "Which athletes are framed for another showdown after the Prefontaine Classic battle?",
    points: 6,
    required: true,
    options: ["Sha'Carri Richardson", "Melissa Jefferson-Wooden", "Gabby Thomas", "Julien Alfred"],
    answer: ["Sha'Carri Richardson", "Melissa Jefferson-Wooden"],
    source: "Two leading U.S. sprinters are expected to meet again after the Prefontaine Classic."
  },
  {
    id: "q3",
    type: "select",
    title: "What did Noah Lyles say he would choose over a $100 million offer?",
    points: 4,
    required: true,
    options: ["Gold in every race", "A coaching role", "A marathon debut", "A Diamond League bye"],
    answer: "Gold in every race",
    image: "https://image-cdn.essentiallysports.com/wp-content/uploads/Noah-Lyles-1-1.jpeg",
    source: "Lyles valued competitive legacy over the financial offer."
  },
  {
    id: "q4",
    type: "short",
    title: "Which world champion answered a rare defeat with a 100m win at the Monaco Diamond League?",
    points: 5,
    required: true,
    answer: "Oblique Seville",
    source: "Look for the sprinter who rebounded at the Monaco Diamond League."
  },
  {
    id: "q5",
    type: "scale",
    title: "How closely did you follow this Athletics news set?",
    points: 5,
    required: true,
    answer: "5",
    source: "Choose the number that best reflects how closely you followed this week's stories."
  },
];

const legacySourceHints = {
  "Noah Lyles' Rival Who Made Unsportsmanlike Comment Reveals Their Current Standing": "Think back to the rivalry covered after the heated USATF Championships clash.",
  "Sha'Carri Richardson and Melissa Jefferson-Wooden Set to Go Against Each Other Once Again": "Two leading U.S. sprinters are expected to meet again after the Prefontaine Classic.",
  "Noah Lyles Chooses Gold Medal in Every Race Over $100 Million for This Reason": "Lyles valued competitive legacy over the financial offer.",
  "World Champion Climbs Back to the Top After Shocking Loss to NCAA Athlete": "Look for the sprinter who rebounded at the Monaco Diamond League.",
  "All source reads": "Choose the number that best reflects how closely you followed this week's stories.",
  "Source article": "Add a short clue that helps readers without revealing the answer."
};

const backupNews = [
  {
    tag: "Athletics",
    title: "Melissa Jefferson-Wooden Keeps Awkward Tension as Rival Becomes 3rd Fastest Ever",
    url: "https://www.essentiallysports.com/olympics-news-track-and-field-news-melissa-jefferson-wooden-keeps-awkward-tension-as-rival-becomes-third-fastest-ever/",
    date: "20 hrs ago",
    image: "https://image-cdn.essentiallysports.com/wp-content/uploads/imago1066769294.jpg"
  },
  {
    tag: "Athletics",
    title: "College Athlete Announces Early Track and Field Retirement to Pursue Another Passion",
    url: "https://www.essentiallysports.com/olympics-news-track-and-field-college-athlete-announces-early-track-and-field-retirement-to-pursue-another-passion/",
    date: "22 hrs ago",
    image: "https://image-cdn.essentiallysports.com/wp-content/uploads/Sanaa-Morris-2.1.jpg"
  },
  {
    tag: "Athletics",
    title: "Noah Lyles' Rival Who Made Unsportsmanlike Comment Reveals Their Current Standing",
    url: "https://www.essentiallysports.com/olympics-news-track-and-field-news-noah-lyles-rival-who-made-unsportsmanlike-comment-reveals-their-current-standing/",
    date: "1 day ago",
    image: "https://image-cdn.essentiallysports.com/wp-content/uploads/Noah-Lyles-5.1.jpg"
  },
  {
    tag: "Athletics",
    title: "Sha'Carri Richardson and Melissa Jefferson-Wooden Set to Go Against Each Other Once Again",
    url: "https://www.essentiallysports.com/olympics-news-track-and-field-news-shacarri-richardson-and-melissa-jefferson-wooden-set-to-go-against-each-other-once-again/",
    date: "1 day ago",
    image: "https://image-cdn.essentiallysports.com/wp-content/uploads/image-13-5.png"
  },
  {
    tag: "Athletics",
    title: "Noah Lyles Chooses Gold Medal in Every Race Over $100 Million for This Reason",
    url: "https://www.essentiallysports.com/olympics-news-track-and-field-news-noah-lyles-chooses-gold-medal-in-every-race-over-hundred-million-dollars-for-this-reason/",
    date: "1 day ago",
    image: "https://image-cdn.essentiallysports.com/wp-content/uploads/Noah-Lyles-1-1.jpeg"
  },
  {
    tag: "Athletics",
    title: "World Champion Climbs Back to the Top After Shocking Loss to NCAA Athlete",
    url: "https://www.essentiallysports.com/olympics-news-track-and-field-news-world-champion-climbs-back-to-the-top-after-shocking-loss-to-ncaa-athlete/",
    date: "2 days ago",
    image: "https://image-cdn.essentiallysports.com/wp-content/uploads/imago833691748.jpg"
  },
  {
    tag: "Athletics",
    title: "Very Bad Injury: Olympic Champion Addresses Back-to-Back Losses After Failing to Make Podium at Monaco DL",
    url: "https://www.essentiallysports.com/olympics-news-track-and-field-news-very-bad-injury-olympic-champion-addresses-back-to-back-losses-after-failing-to-make-podium-at-monaco-dl/",
    date: "2 days ago",
    image: "https://image-cdn.essentiallysports.com/wp-content/uploads/imago1065216240.jpg"
  },
  {
    tag: "Athletics",
    title: "I Was Screaming: Julien Alfred Defeats Gabby Thomas to Take Olympics Revenge After 2 Years",
    url: "https://www.essentiallysports.com/olympics-news-track-and-field-news-i-was-screaming-julien-alfred-defeats-gabby-thomas-to-take-olympics-revenge-after-two-years/",
    date: "2 days ago",
    image: "https://image-cdn.essentiallysports.com/wp-content/uploads/Gabby-Thomas-and-Julien-Alfred-1.jpg"
  },
  {
    tag: "Athletics",
    title: "Olympic Champion Switches Events to Break 27-Year-Old World Record After Last Disappointing Race",
    url: "https://www.essentiallysports.com/olympics-news-track-and-field-news-olympic-champion-switches-events-to-break-twenty-seven-year-old-world-record-after-last-disappointing-race/",
    date: "2 days ago",
    image: "https://image-cdn.essentiallysports.com/wp-content/uploads/imago1078386869.jpg.jpeg"
  },
  {
    tag: "Athletics",
    title: "Track Legend Reveals Alleged Altercation Rumor at Sha'Carri Richardson's Training Camp",
    url: "https://www.essentiallysports.com/olympics-news-track-and-field-news-track-legend-reveals-alleged-altercation-rumor-at-shacarri-richardsons-training-camp/",
    date: "2 days ago",
    image: "https://image-cdn.essentiallysports.com/wp-content/uploads/Olympics-16.png"
  }
];

const sampleChallenge = {
  title: "Weekly Challenge",
  category: "Athletics",
  intro: "Answer the questions from this week's Essentially Athletics stories and see your points instantly.",
  articles: seedArticles,
  questions: seedQuestions
};

function getChallenge() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    const removeLegacyQ1Image = localStorage.getItem(Q1_IMAGE_REMOVAL_KEY) !== "true";
    if (!saved) {
      localStorage.setItem(Q1_IMAGE_REMOVAL_KEY, "true");
      return sampleChallenge;
    }
    const challenge = JSON.parse(saved);
    let challengeChanged = false;
    if (challenge.title === "Essentially Athletics Weekly Challenge") {
      challenge.title = "Weekly Challenge";
      challengeChanged = true;
    }
    if (Array.isArray(challenge.questions)) {
      const questionCount = challenge.questions.length;
      challenge.questions = challenge.questions.filter((question) => !(
        question.id === "q6" &&
        question.title === "In one line, which story would you want the newsletter to follow up on next?"
      ));
      if (challenge.questions.length !== questionCount) challengeChanged = true;
      let imageCount = 0;
      challenge.questions = challenge.questions.map((question) => {
        let nextQuestion = question;
        const migratedHint = legacySourceHints[nextQuestion.source];
        if (migratedHint) {
          nextQuestion = { ...nextQuestion, source: migratedHint };
          challengeChanged = true;
        }
        if (!Object.prototype.hasOwnProperty.call(question, "image")) {
          const seedQuestion = seedQuestions.find((item) => item.id === question.id);
          nextQuestion = { ...nextQuestion, image: seedQuestion?.image || "" };
          challengeChanged = true;
        }
        if (removeLegacyQ1Image && nextQuestion.id === "q1") {
          nextQuestion = { ...nextQuestion, image: "" };
          challengeChanged = true;
        }
        if (nextQuestion.image && imageCount >= 2) {
          challengeChanged = true;
          return { ...nextQuestion, image: "" };
        }
        if (nextQuestion.image) imageCount += 1;
        return nextQuestion;
      });
    }
    if (challengeChanged) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(challenge));
    }
    localStorage.setItem(Q1_IMAGE_REMOVAL_KEY, "true");
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

function setupTickerLoop() {
  const windowElement = document.querySelector(".ticker-window");
  const track = document.querySelector(".ticker-track");
  const firstLoop = track?.querySelector(".ticker-loop");
  if (!windowElement || !track || !firstLoop) return;

  let lastWindowWidth = 0;

  const rebuild = () => {
    const windowWidth = Math.round(windowElement.getBoundingClientRect().width);
    if (!windowWidth || windowWidth === lastWindowWidth) return;
    lastWindowWidth = windowWidth;

    track.querySelectorAll(".ticker-loop").forEach((loop, index) => {
      if (index > 0) loop.remove();
    });

    const loopWidth = Math.round(firstLoop.getBoundingClientRect().width);
    if (!loopWidth) return;

    const clonesNeeded = Math.max(1, Math.ceil(windowWidth / loopWidth));
    for (let index = 0; index < clonesNeeded; index += 1) {
      const clone = firstLoop.cloneNode(true);
      clone.setAttribute("aria-hidden", "true");
      track.append(clone);
    }

    track.style.setProperty("--ticker-shift", `-${loopWidth}px`);
    track.style.setProperty("--ticker-duration", `${Math.max(22, loopWidth / 34).toFixed(2)}s`);
  };

  rebuild();
  if ("ResizeObserver" in window) {
    new ResizeObserver(rebuild).observe(windowElement);
  } else {
    window.addEventListener("resize", rebuild, { passive: true });
  }
}

function setupTickerElevation() {
  const header = document.querySelector(".es-site-header");
  const ticker = document.querySelector(".score-ticker");
  if (!header || !ticker) return;

  const syncHeaderOffset = () => {
    ticker.style.setProperty("--ticker-sticky-top", `${Math.round(header.getBoundingClientRect().height)}px`);
  };
  const syncElevation = () => {
    ticker.classList.toggle("is-elevated", window.scrollY > 0);
  };

  syncHeaderOffset();
  syncElevation();
  window.addEventListener("scroll", syncElevation, { passive: true });

  if ("ResizeObserver" in window) {
    new ResizeObserver(syncHeaderOffset).observe(header);
  } else {
    window.addEventListener("resize", syncHeaderOffset, { passive: true });
  }
}

function setupMobileMenu() {
  const header = document.querySelector(".es-site-header");
  const button = document.querySelector(".es-menu-button");
  const nav = document.querySelector("#es-primary-nav");
  if (!header || !button || !nav) return;

  const sportsColumns = [
    [
      ["NFL", "https://www.essentiallysports.com/category/nfl/", true],
      ["College Football", "https://www.essentiallysports.com/category/college-football/"],
      ["College Basketball", "https://www.essentiallysports.com/category/college-basketball/"],
      ["Golf", "https://www.essentiallysports.com/category/golf/"]
    ],
    [
      ["Tennis", "https://www.essentiallysports.com/category/tennis/"],
      ["Boxing", "https://www.essentiallysports.com/category/boxing/"],
      ["NBA", "https://www.essentiallysports.com/category/nba/"],
      ["NASCAR", "https://www.essentiallysports.com/category/nascar/"]
    ],
    [
      ["Olympics", "https://www.essentiallysports.com/category/olympics/"],
      ["UFC", "https://www.essentiallysports.com/category/ufc/"],
      ["WNBA", "https://www.essentiallysports.com/category/wnba/"],
      ["MLB", "https://www.essentiallysports.com/category/mlb/"]
    ]
  ];
  const sportsLinks = sportsColumns.flat();
  const sportsGrid = sportsColumns.map((column) => `
    <div class="es-sports-column">
      ${column.map(([label, url, hasArrow]) => `<a href="${url}"${hasArrow ? ' class="has-inline-arrow"' : ""}>${label}</a>`).join("")}
    </div>
  `).join("");

  nav.innerHTML = `
    <div class="es-nav-item"><a href="https://www.essentiallysports.com/latest-news/">Latest</a></div>
    <div class="es-nav-item es-nav-item-menu">
      <button class="es-nav-trigger" type="button" aria-expanded="false" aria-controls="es-sports-dropdown" data-nav-trigger="sports">Sports<span class="es-nav-chevron" aria-hidden="true"></span></button>
      <section class="es-nav-dropdown es-sports-dropdown" id="es-sports-dropdown" aria-label="Sports" data-nav-dropdown="sports" hidden>
        <h2>Sports</h2>
        <div class="es-sports-grid">${sportsGrid}</div>
      </section>
    </div>
    <div class="es-nav-item"><a href="https://www.essentiallysports.com/newsletter-hub/">Newsletters</a></div>
    <div class="es-nav-item"><a href="https://www.essentiallysports.com/think-tank/">Think Tank</a></div>
    <div class="es-nav-item es-nav-item-menu">
      <button class="es-nav-trigger" type="button" aria-expanded="false" aria-controls="es-case-dropdown" data-nav-trigger="case-studies">Case Studies<span class="es-nav-chevron" aria-hidden="true"></span></button>
      <section class="es-nav-dropdown es-case-dropdown" id="es-case-dropdown" aria-label="Case Studies" data-nav-dropdown="case-studies" hidden>
        <h2>Case Studies</h2>
        <div class="es-case-links">
          <a href="https://www.essentiallysports.com/case-studies/">Partnerships<span aria-hidden="true"></span></a>
          <a href="https://www.essentiallysports.com/case-studies/">Events<span aria-hidden="true"></span></a>
        </div>
      </section>
    </div>
  `;

  header.insertAdjacentHTML("beforeend", `
    <button class="es-nav-overlay" type="button" aria-label="Close navigation menu" hidden></button>
    <aside class="es-mobile-panel" id="es-mobile-panel" aria-label="EssentiallySports mobile navigation" hidden>
      <nav class="es-mobile-nav">
        <a class="es-mobile-main-link" href="https://www.essentiallysports.com/latest-news/">Latest</a>
        <details class="es-mobile-details">
          <summary>Sports<span class="es-nav-chevron" aria-hidden="true"></span></summary>
          <div class="es-mobile-sports-grid">
            ${sportsLinks.map(([label, url]) => `<a href="${url}">${label}</a>`).join("")}
          </div>
        </details>
        <a class="es-mobile-main-link" href="https://www.essentiallysports.com/newsletter-hub/">Newsletters</a>
        <a class="es-mobile-main-link" href="https://www.essentiallysports.com/think-tank/">Think Tank</a>
        <details class="es-mobile-details">
          <summary>Case Studies<span class="es-nav-chevron" aria-hidden="true"></span></summary>
          <div class="es-mobile-case-links">
            <a href="https://www.essentiallysports.com/case-studies/">Partnerships</a>
            <a href="https://www.essentiallysports.com/case-studies/">Events</a>
          </div>
        </details>
        <div class="es-mobile-socials"></div>
      </nav>
    </aside>
  `);

  const overlay = header.querySelector(".es-nav-overlay");
  const panel = header.querySelector(".es-mobile-panel");
  const mobileSocials = panel.querySelector(".es-mobile-socials");
  const desktopTriggers = Array.from(nav.querySelectorAll(".es-nav-trigger"));
  const dropdowns = Array.from(nav.querySelectorAll(".es-nav-dropdown"));
  let activeTrigger = null;

  mobileSocials.innerHTML = document.querySelector(".header-actions")?.innerHTML || "";
  button.setAttribute("aria-controls", "es-mobile-panel");

  const closeDesktopMenus = (restoreFocus = false) => {
    dropdowns.forEach((dropdown) => { dropdown.hidden = true; });
    desktopTriggers.forEach((trigger) => trigger.setAttribute("aria-expanded", "false"));
    overlay.hidden = true;
    header.classList.remove("has-open-dropdown");
    if (restoreFocus) activeTrigger?.focus();
    activeTrigger = null;
  };

  const positionDropdown = (trigger, dropdown) => {
    const width = Math.min(775, window.innerWidth - 32);
    const left = Math.min(Math.max(16, trigger.getBoundingClientRect().left - 9), window.innerWidth - width - 16);
    dropdown.style.width = `${width}px`;
    dropdown.style.left = `${left}px`;
  };

  const closeMenu = (restoreFocus = false) => {
    header.classList.remove("is-menu-open");
    button.setAttribute("aria-expanded", "false");
    button.setAttribute("aria-label", "Open menu");
    panel.hidden = true;
    if (restoreFocus) button.focus();
  };

  desktopTriggers.forEach((trigger) => {
    trigger.addEventListener("click", () => {
      const dropdown = nav.querySelector(`[data-nav-dropdown="${trigger.dataset.navTrigger}"]`);
      const opening = trigger.getAttribute("aria-expanded") !== "true";
      closeDesktopMenus();
      if (!opening) return;
      closeMenu();
      positionDropdown(trigger, dropdown);
      dropdown.hidden = false;
      overlay.hidden = false;
      trigger.setAttribute("aria-expanded", "true");
      header.classList.add("has-open-dropdown");
      activeTrigger = trigger;
    });
  });

  overlay.addEventListener("click", () => closeDesktopMenus());

  button.addEventListener("click", () => {
    const open = !header.classList.contains("is-menu-open");
    closeDesktopMenus();
    header.classList.toggle("is-menu-open", open);
    button.setAttribute("aria-expanded", String(open));
    button.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    panel.hidden = !open;
  });

  panel.addEventListener("click", (event) => {
    if (event.target.closest("a")) closeMenu();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      if (header.classList.contains("is-menu-open")) {
        closeMenu(true);
      } else if (header.classList.contains("has-open-dropdown")) {
        closeDesktopMenus(true);
      }
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 1023) {
      closeMenu();
      if (activeTrigger) {
        const dropdown = nav.querySelector(`[data-nav-dropdown="${activeTrigger.dataset.navTrigger}"]`);
        positionDropdown(activeTrigger, dropdown);
      }
    } else {
      closeDesktopMenus();
    }
  }, { passive: true });
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
  setupSimpleSelects(questionList);
  renderSources(challenge.articles);
  setupNewsScroller();
  fetchNews(challenge.category || "Athletics");

  document.querySelector("#refresh-news")?.addEventListener("click", () => fetchNews(challenge.category || "Athletics"));
  document.querySelector("#reset-form").addEventListener("click", () => {
    form.reset();
    resetSimpleSelects(form);
    form.querySelectorAll("[aria-invalid='true']").forEach((field) => field.removeAttribute("aria-invalid"));
    document.querySelector("#result-panel").classList.add("is-hidden");
    document.querySelector("#form-error").textContent = "";
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const emailField = document.querySelector("#reader-email");
    const email = emailField.value.trim();
    const error = document.querySelector("#form-error");
    if (!email || !emailField.checkValidity()) {
      error.textContent = "Enter a valid email ID before submitting.";
      emailField.setAttribute("aria-invalid", "true");
      emailField.focus();
      return;
    }

    const missing = challenge.questions.find((question) => question.required && !hasAnswer(form, question));
    if (missing) {
      error.textContent = "Complete all required questions before submitting.";
      const missingField = Array.from(form.elements).find((field) => field.name === missing.id);
      const missingSelect = Array.from(form.querySelectorAll(".simple-select"))
        .find((select) => select.dataset.selectName === missing.id);
      const invalidControl = missingSelect?.querySelector(".simple-select-trigger") || missingField;
      invalidControl?.setAttribute("aria-invalid", "true");
      invalidControl?.focus();
      return;
    }

    error.textContent = "";
    const score = calculateScore(form, challenge.questions);
    showScore(score, totalPoints);
  });

  form.addEventListener("input", (event) => {
    event.target.removeAttribute?.("aria-invalid");
  });
}

function renderQuestion(question, index, editorPreview) {
  const name = escapeHtml(question.id);
  const points = Number(question.points || 0);
  const required = question.required ? "required" : "";
  const source = question.source ? `<span><strong>Hint:</strong> ${escapeHtml(question.source)}</span>` : "<span></span>";
  const image = String(question.image || "").trim();
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
    const listId = `question-select-${index}`;
    control = `
      <div class="simple-select" data-select-name="${name}">
        <input type="hidden" name="${name}" value="">
        <button class="simple-select-trigger" type="button" aria-haspopup="listbox" aria-expanded="false" aria-controls="${listId}">
          <span>Select an answer</span>
          <i aria-hidden="true"></i>
        </button>
        <div class="simple-select-menu" id="${listId}" role="listbox" hidden>
          ${(question.options || []).map((option) => `
            <button type="button" role="option" aria-selected="false" data-value="${escapeHtml(option)}">${escapeHtml(option)}</button>
          `).join("")}
        </div>
      </div>`;
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
    <article class="question-card${image ? " has-question-image" : ""}" role="group" aria-labelledby="question-title-${index}">
      ${image ? `<figure class="question-media"><img src="${escapeHtml(image)}" alt="Related to ${escapeHtml(question.title)}" loading="lazy" decoding="async"></figure>` : ""}
      <div class="question-card-content">
        <div class="question-header">
          <div class="question-heading">
            ${meta}
            <h3 id="question-title-${index}">${escapeHtml(question.title)}</h3>
          </div>
        </div>
        ${control}
        ${editorPreview ? "" : `<div class="question-meta question-source">${source}</div>`}
      </div>
    </article>
  `;
}

function setupSimpleSelects(root) {
  root.querySelectorAll(".simple-select").forEach((select) => {
    const trigger = select.querySelector(".simple-select-trigger");
    const menu = select.querySelector(".simple-select-menu");
    const input = select.querySelector("input[type='hidden']");
    const options = Array.from(menu.querySelectorAll("[role='option']"));

    const close = (restoreFocus = false) => {
      menu.hidden = true;
      select.classList.remove("is-open");
      trigger.setAttribute("aria-expanded", "false");
      if (restoreFocus) trigger.focus();
    };

    const open = () => {
      document.querySelectorAll(".simple-select.is-open").forEach((openSelect) => {
        if (openSelect !== select) openSelect.querySelector(".simple-select-trigger").click();
      });
      menu.hidden = false;
      select.classList.add("is-open");
      trigger.setAttribute("aria-expanded", "true");
    };

    const choose = (option) => {
      input.value = option.dataset.value;
      trigger.querySelector("span").textContent = option.textContent.trim();
      trigger.classList.add("has-value");
      trigger.removeAttribute("aria-invalid");
      options.forEach((item) => item.setAttribute("aria-selected", String(item === option)));
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.dispatchEvent(new Event("change", { bubbles: true }));
      close(true);
    };

    trigger.addEventListener("click", () => {
      if (select.classList.contains("is-open")) {
        close();
      } else {
        open();
      }
    });

    trigger.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && select.classList.contains("is-open")) {
        event.preventDefault();
        close();
        return;
      }
      if (!["ArrowDown", "ArrowUp", "Enter", " "].includes(event.key)) return;
      event.preventDefault();
      open();
      const selected = options.find((option) => option.getAttribute("aria-selected") === "true");
      (selected || options[event.key === "ArrowUp" ? options.length - 1 : 0])?.focus();
    });

    options.forEach((option, optionIndex) => {
      option.addEventListener("click", () => choose(option));
      option.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
          event.preventDefault();
          close(true);
        } else if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          choose(option);
        } else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
          event.preventDefault();
          const direction = event.key === "ArrowDown" ? 1 : -1;
          options[(optionIndex + direction + options.length) % options.length].focus();
        } else if (event.key === "Home" || event.key === "End") {
          event.preventDefault();
          options[event.key === "Home" ? 0 : options.length - 1].focus();
        }
      });
    });

  });

  if (!document.documentElement.dataset.simpleSelectOutsideClick) {
    document.documentElement.dataset.simpleSelectOutsideClick = "true";
    document.addEventListener("click", (event) => {
      document.querySelectorAll(".simple-select.is-open").forEach((select) => {
        if (select.contains(event.target)) return;
        select.classList.remove("is-open");
        select.querySelector(".simple-select-trigger").setAttribute("aria-expanded", "false");
        select.querySelector(".simple-select-menu").hidden = true;
      });
    });
  }
}

function resetSimpleSelects(root) {
  root.querySelectorAll(".simple-select").forEach((select) => {
    const trigger = select.querySelector(".simple-select-trigger");
    const menu = select.querySelector(".simple-select-menu");
    select.querySelector("input[type='hidden']").value = "";
    trigger.querySelector("span").textContent = "Select an answer";
    trigger.classList.remove("has-value");
    trigger.removeAttribute("aria-invalid");
    trigger.setAttribute("aria-expanded", "false");
    select.classList.remove("is-open");
    menu.hidden = true;
    menu.querySelectorAll("[role='option']").forEach((option) => option.setAttribute("aria-selected", "false"));
  });
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
        <img src="${escapeHtml(article.image || sourceImages[index % sourceImages.length])}" alt="${escapeHtml(article.title)}" loading="lazy" decoding="async">
      </a>
      <div class="source-card-body">
        <span class="source-tag">${escapeHtml(article.tag)}</span>
        <h3><a href="${escapeHtml(article.url)}" target="_blank" rel="noopener">${escapeHtml(article.title)}</a></h3>
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
  const scoreMeter = document.querySelector("#score-meter");
  document.querySelector("#score-line").textContent = `${score} / ${totalPoints}`;
  document.querySelector("#score-meter-fill").style.width = `${percent}%`;
  scoreMeter.setAttribute("aria-valuemax", String(totalPoints));
  scoreMeter.setAttribute("aria-valuenow", String(score));
  document.querySelector("#score-message").textContent =
    percent >= 80
      ? "Great read. You were locked in on this week's biggest athletics stories."
      : "Your answers are in. Thanks for taking on this week's athletics challenge.";
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
  const endpoint = `https://www.essentiallysports.com/wp-json/wp/v2/posts?search=${encodeURIComponent(searchTerm)}&per_page=12&_embed=1`;
  try {
    const functionResponse = await fetch(`${functionEndpoint}&limit=12&ts=${Date.now()}`, { cache: "no-store" });
    if (functionResponse.ok) {
      const payload = await functionResponse.json();
      if (Array.isArray(payload.stories) && payload.stories.length >= 10) {
        status.textContent = "Latest Athletics picks";
        renderNews(mergeStories(payload.stories, backupNews).slice(0, 12));
        return;
      }
    }

    const response = await fetch(endpoint, { cache: "no-store" });
    if (!response.ok) throw new Error("News fetch failed");
    const posts = await response.json();
    if (!Array.isArray(posts) || posts.length === 0) throw new Error("No posts found");
    status.textContent = "Latest Athletics picks";
    const mappedPosts = posts.map((post) => ({
      title: stripTags(post.title?.rendered || "EssentiallySports story"),
      url: post.link,
      date: new Date(post.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      image: post._embedded?.["wp:featuredmedia"]?.[0]?.source_url || "",
      tag: post._embedded?.["wp:term"]?.flat()?.find((term) => term.taxonomy === "category")?.name || "Athletics"
    }));
    renderNews(mergeStories(mappedPosts, backupNews).slice(0, 12));
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

function mergeStories(primary, secondary) {
  return [...primary, ...secondary].filter((story, index, stories) => (
    stories.findIndex((candidate) => candidate.url === story.url) === index
  ));
}

function setupNewsScroller() {
  const list = document.querySelector("#news-list");
  const button = document.querySelector("#news-more-button");
  if (!list || !button) return;

  const label = button.querySelector("span");
  const updateControl = () => {
    const isAtEnd = list.scrollTop + list.clientHeight >= list.scrollHeight - 8;
    button.classList.toggle("is-return", isAtEnd);
    label.textContent = isAtEnd ? "Back to top" : "See more updates";
  };

  button.addEventListener("click", () => {
    const isAtEnd = list.scrollTop + list.clientHeight >= list.scrollHeight - 8;
    list.scrollTo({
      top: isAtEnd ? 0 : Math.min(list.scrollHeight, list.scrollTop + Math.round(list.clientHeight * 0.72)),
      behavior: "smooth"
    });
  });

  list.addEventListener("scroll", updateControl, { passive: true });
  let resizeFrame;
  window.addEventListener("resize", () => {
    cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(syncNewsFeedHeight);
  }, { passive: true });
  updateControl();
}

function syncNewsFeedHeight() {
  const list = document.querySelector("#news-list");
  if (window.matchMedia("(max-width: 680px)").matches) {
    list?.style.removeProperty("--news-feed-height");
    return;
  }
  const fourthStory = list?.children[3];
  if (!list || !fourthStory) {
    list?.style.removeProperty("--news-feed-height");
    return;
  }

  const listRect = list.getBoundingClientRect();
  const fourthRect = fourthStory.getBoundingClientRect();
  const previewHeight = Math.min(130, Math.max(110, fourthRect.height * 0.5));
  list.style.setProperty("--news-feed-height", `${Math.ceil(fourthRect.top - listRect.top + previewHeight)}px`);
}

function renderNews(items) {
  const list = document.querySelector("#news-list");
  const shell = document.querySelector("#news-feed-shell");
  const button = document.querySelector("#news-more-button");
  list.scrollTop = 0;
  list.scrollLeft = 0;
  shell?.classList.toggle("has-more-stories", items.length > 3);
  button?.classList.remove("is-return");
  if (button) button.querySelector("span").textContent = "See more updates";
  list.innerHTML = items.map((item) => `
    <article class="news-item">
      <a class="news-thumb" href="${escapeHtml(item.url)}" target="_blank" rel="noopener" aria-label="${escapeHtml(item.title)}">
        <img src="${escapeHtml(item.image || "assets/workspace-card-newsletter-assets.webp")}" alt="" loading="lazy" decoding="async">
      </a>
      <div>
        <a href="${escapeHtml(item.url)}" target="_blank" rel="noopener">${escapeHtml(item.title)}</a>
        <span class="news-source"><img src="assets/es-rounded-logo.png" alt="">${escapeHtml(item.date)}</span>
      </div>
    </article>
  `).join("");
  requestAnimationFrame(syncNewsFeedHeight);
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
        <label>Hint<input data-field="source" placeholder="Give readers a useful clue" value="${escapeHtml(question.source || "")}"></label>
        <label class="full-width">Question image URL (maximum 2)<input data-field="image" type="url" placeholder="https://..." value="${escapeHtml(question.image || "")}"></label>
        <label>Points<input data-field="points" type="number" min="0" value="${escapeHtml(question.points || 0)}"></label>
      </article>
    `).join("");
    renderEditorPreview();
  }

  function renderEditorPreview() {
    const preview = document.querySelector("#editor-preview-list");
    preview.innerHTML = challenge.questions.map((question, index) => renderQuestion(question, index, true)).join("");
    setupSimpleSelects(preview);
  }

  function captureSettings() {
    challenge.title = titleInput.value.trim() || "Weekly Challenge";
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
      image: "",
      source: "Add a short clue that helps readers without revealing the answer."
    });
    renderBuilder();
  });

  editorList.addEventListener("input", (event) => {
    const card = event.target.closest(".editor-question");
    if (!card) return;
    const questionIndex = Number(card.dataset.index);
    const question = challenge.questions[questionIndex];
    const field = event.target.dataset.field;
    if (field === "options") {
      question.options = event.target.value.split(",").map((item) => item.trim()).filter(Boolean);
    } else if (field === "answer" && question.type === "checkbox") {
      question.answer = event.target.value.split(",").map((item) => item.trim()).filter(Boolean);
    } else if (field === "points") {
      question.points = Number(event.target.value || 0);
    } else if (field === "image") {
      const value = event.target.value.trim();
      const otherImages = challenge.questions.filter((item, index) => index !== questionIndex && item.image).length;
      if (value && otherImages >= 2) {
        event.target.value = question.image || "";
        event.target.setCustomValidity("A challenge can include images on a maximum of two questions.");
        event.target.reportValidity();
        return;
      }
      event.target.setCustomValidity("");
      question.image = value;
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
  setupTickerLoop();
  setupTickerElevation();
  setupMobileMenu();
  renderReaderPage();
  renderEditorPage();
});
