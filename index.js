#!/usr/bin/env node

const fs = require("fs");
const marked = require("marked");
const stripAnsi = require("strip-ansi");
const cfonts = require("cfonts");
const colors = require("colors");
const size = require("window-size");
const highlight = require("cli-highlight").highlight;
const decode = require("unescape");

const blockFont = require("./block-font");
const { onResize } = require("./resizer");

function randomColor(str) {
  const headlineColors = [colors.green, colors.blue, colors.magenta];
  const index = Math.floor(Math.random() * headlineColors.length);
  return headlineColors[index](str);
}

function extractSlides(markdown) {
  const slideIndex = 0;
  const slides = [];
  const renderer = new marked.Renderer();
  function pushContent(text) {
    if (slides.length === 0) {
      return;
    }
    const currentSlide = slides[slides.length - 1];
    currentSlide.content += decode(text);
  }

  renderer.heading = function(text, level) {
    if (level === 1) {
      const font = cfonts.render(text, {
        font: "block",
        colors: ["white", "red"]
      });
      slides.push({
        title: font.string,
        content: ""
      });
    } else {
      slides.push({
        title: `\n${randomColor(blockFont(text))}\n`,
        content: ""
      });
    }
  };

  renderer.listitem = text => pushContent(`${colors.green("▶")} ${text}\n\n`);
  renderer.paragraph = text => pushContent(`${text}\n\n`);
  renderer.codespan = text => pushContent(`\`${colors.italic(text)}\``);
  renderer.code = (code, language) =>
    language ? pushContent(highlight(code, { language })) : pushContent(code);
  renderer.strong = text => colors.bold(text);
  renderer.em = text => colors.italic(text);
  renderer.br = () => pushContent("\n");
  renderer.del = text => colors.strikethrough(text);

  marked(markdown, { renderer: renderer });

  return slides;
}

if (process.argv.length !== 3) {
  console.log("Usage: termd [markdown file]");
  process.exit(1);
}

const slides = extractSlides(fs.readFileSync(process.argv[2]).toString());

let slideIndex = 0;

var stdin = process.openStdin();
stdin.setRawMode(true);
stdin.resume();
stdin.setEncoding("utf8");

function clearScreen() {
  process.stdout.write("\x1Bc");
}

function spaces(length) {
  return Array.from({ length })
    .map(() => " ")
    .join("");
}

function printCentered(str) {
  const lines = str.split("\n");
  const plainLines = lines.map(line => stripAnsi(line));

  const maxWidth = plainLines.reduce(
    (acc, line) => Math.max(acc, line.length),
    0
  );
  const leftPad = Math.floor((size.get().width - maxWidth) / 2);

  console.log(lines.map(line => `${spaces(leftPad)}${line}`).join("\n"));
}

function printContentPadding(title, content) {
  const titleLines = title.split("\n").length;
  const contentLines = content.split("\n").length;

  const padding = Math.round(
    (size.get().height - titleLines - contentLines) / 2
  );
  Array.from({ length: padding }).forEach(() => console.log(""));
}

function renderSlide(slideIndex) {
  clearScreen();
  process.stdout.write("\u001b[?25l");
  const { title, content } = slides[slideIndex];
  printCentered(title);
  printContentPadding(title, content);
  printCentered(content);
  process.stdout.write("\u001b[?25l");
}

clearScreen();
renderSlide(slideIndex);

onResize(() => {
  renderSlide(slideIndex);
});

stdin.on("data", function(key) {
  if (key === "\u001b[C") {
    slideIndex = Math.min(slides.length - 1, slideIndex + 1);
    renderSlide(slideIndex);
  }
  if (key === "\u001b[D") {
    slideIndex = Math.max(0, slideIndex - 1);
    renderSlide(slideIndex);
  }
  if (key === "\u0003") {
    process.stdout.write("\u001b[?25h");
    process.exit();
  }
});
