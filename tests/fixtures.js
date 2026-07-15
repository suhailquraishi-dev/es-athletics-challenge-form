const challenge = {
  slug: "athletics-weekly-2026-07-15",
  id: "athletics-weekly-2026-07-15",
  title: "Weekly Challenge",
  category: "Athletics",
  intro: "Read the stories and answer the questions.",
  articles: [{
    tag: "Athletics",
    title: "A source story",
    url: "https://www.essentiallysports.com/example-story/",
    image: "https://image-cdn.essentiallysports.com/example.jpg",
    author: "ES Staff",
    date: "Today"
  }],
  questions: [
    {
      id: "q1",
      type: "radio",
      title: "Who won?",
      points: 5,
      required: true,
      options: ["Alex", "Jordan"],
      answer: "Alex",
      image: "",
      source: "Read the opening paragraph."
    },
    {
      id: "q2",
      type: "checkbox",
      title: "Select both finalists.",
      points: 5,
      required: true,
      options: ["Alex", "Jordan", "Sam"],
      answer: ["Alex", "Jordan"],
      image: "",
      source: "Two names are required."
    }
  ]
};

module.exports = { challenge };
