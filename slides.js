const blessed = require("blessed");
const cfonts = require("cfonts");
const print = require("./print");

const slides = [
  {
    headline: "First slide",
    content: [
      {
        type: "text",
        text: "First note"
      },
      {
        type: "text",
        text: "Never use anything"
      },
      {
        type: "text",
        text: "Something will proceed"
      }
    ]
  },
  {
    headline: "Second slide",
    content: [
      {
        type: "text",
        text: "Kewl"
      },
      {
        type: "text",
        text: "Use whatever suits you"
      }
    ]
  }
];

// Create a screen object.
var screen = blessed.screen({
  smartCSR: true
});

const headlineBox = blessed.box({
  content: "empty",
  top: "1",
  left: "0",
  width: "100%",
  align: "center"
});
const bodyBox = blessed.box({
  content: "body",
  top: 14,
  width: "100%",
  align: "center",
  style: {
    bold: true
  }
});

screen.append(headlineBox);
screen.append(bodyBox);

function renderScreen(index) {
  const slide = slides[index];
  const headline = cfonts.render(slide.headline, {
    font: "block",
    colors: ["white", "red"]
  }).string;
  headlineBox.setContent(headline);
  bodyBox.setContent(slide.content.map(s => print(s.text)).join("\n"));
  screen.render();
}

let currentScreen = 0;

screen.key("left", () => {
  currentScreen = Math.max(0, currentScreen - 1);
  renderScreen(currentScreen);
});

screen.key("right", () => {
  currentScreen = Math.min(slides.length - 1, currentScreen + 1);
  renderScreen(currentScreen);
});
screen.key("escape", () => {
  process.exit(0);
});

screen.render();
