#!/usr/bin/env node

const fs = require("fs");
const marked = require("marked");
const stripAnsi = require("strip-ansi");
const colors = require("colors");
const size = require("window-size");
const highlight = require("cli-highlight").highlight;
const decode = require("unescape");

const blockFont = require("./block-font");
const { onResize } = require("./resizer");
const transition = require("./transition");

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
    const headingText = blockFont(text);
    const length = headingText.split("\n")[0].length - 1;
    const line = Array.from({ length })
      .map(() => "▄")
      .join("");

    slides.push({
      title:
        level === 1
          ? randomColor(`\n${line}\n${headingText}${line}\n`)
          : randomColor(`\n${headingText}`),
      content: ""
    });
  };

  renderer.listitem = text => pushContent(`${colors.green("▶")} ${text}\n\n`);
  renderer.paragraph = text => pushContent(`\n${text}\n\n`);
  renderer.codespan = text => `${colors.italic(text)}`;
  renderer.code = (code, language) =>
    language
      ? pushContent(highlight(`\n${code}\n`, { language }))
      : pushContent(`\n${code}\n`);
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
function hideCursor() {
  process.stdout.write("\u001b[?25l");
}
function showCursor() {
  process.stdout.write("\u001b[?25h");
}

function spaces(length) {
  return Array.from({ length })
    .map(() => " ")
    .join("");
}

function getCentered(str) {
  const lines = str.split("\n");
  const plainLines = lines.map(line => stripAnsi(line));

  const maxWidth = plainLines.reduce(
    (acc, line) => Math.max(acc, line.length),
    0
  );
  const leftPad = Math.floor((size.get().width - maxWidth) / 2);

  const width = size.get().width;

  return lines.map((line, index) => {
    const spacesLeft = spaces(leftPad);
    const spacesRight = spaces(
      width - spacesLeft.length - plainLines[index].length
    );
    return `${spacesLeft}${line}${spacesRight}`;
  });
}

function getContentPadding(title, content) {
  const titleLines = title.split("\n").length;
  const contentLines = content.split("\n").length;

  const padding = Math.round(
    (size.get().height - titleLines - contentLines) / 2
  );
  return Array.from({ length: padding }).map(() => spaces(size.get().width));
}

function getTitlePadding(title, content) {
  const titleLines = title.split("\n").length;
  const contentLines = content.split("\n").length;

  const padding = Math.round(
    (size.get().height - titleLines - contentLines) / 2
  );
  return Array.from({ length: padding }).map(() => spaces(size.get().width));
}

function getSlide(slideIndex) {
  const { height, width } = size.get();
  const { title, content } = slides[slideIndex];
  const rows = [];
  if (slideIndex === 0) {
    rows.push(...getTitlePadding(title, content));
    rows.push(...getCentered(title));
    rows.push(...getCentered(content));
  } else {
    rows.push(...getCentered(title));
    rows.push(...getContentPadding(title, content));
    rows.push(...getCentered(content));
  }

  rows.push(
    ...Array.from({ length: height - rows.length }).map(() => spaces(width))
  );
  return rows;
}

function renderSlide(slideIndex) {
  clearScreen();
  hideCursor();
  const slide = getSlide(slideIndex);
  slide.forEach(line => console.log(line));
  hideCursor();
}

clearScreen();
renderSlide(slideIndex);

onResize(() => {
  renderSlide(slideIndex);
});

stdin.on("data", function(key) {
  if (["\u001b[C", " "].includes(key)) {
    slideIndex = Math.min(slides.length - 1, slideIndex + 1);
    renderSlide(slideIndex);
  }
  if (key === "t") {
    slideIndex = Math.min(slides.length - 1, slideIndex + 1);
    transition(getSlide(slideIndex));
  }
  if (key === "T") {
    slideIndex = Math.max(0, slideIndex - 1);
    transition(getSlide(slideIndex));
  }
  if (key === "\u001b[D") {
    slideIndex = Math.max(0, slideIndex - 1);
    renderSlide(slideIndex);
  }
  if (["\u0003", "q"].includes(key)) {
    process.stdout.write("\u001b[?25h");
    process.exit();
  }
  if (key.length === 1 && key.charCodeAt(0) === 27) {
    process.stdout.write("\u001b[?25h");
    process.exit();
  }
});
