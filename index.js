#!/usr/bin/env node

import fs from "fs";
import readline from "readline";
import marked from "marked";
import stripAnsi from "strip-ansi";
import colors from "colors";
import size from "window-size";
import { highlight } from "cli-highlight";
import decode from "unescape";
import { createChart } from "aboxd";

import blockFont from "./block-font.js";
import { onResize } from "./resizer.js";
import { renderSlide, transition } from "./transition.js";
import { imgToBlocks } from "./block-paint.js";

function randomColor(str) {
  const headlineColors = [colors.green, colors.blue, colors.magenta];
  const index = Math.round(Math.random() * (headlineColors.length - 1));
  return headlineColors[index](str);
}

async function extractImages(markdown, width) {
  const renderer = new marked.Renderer();
  const imagePromises = {};

  renderer.image = (href) => {
    imagePromises[href] = imgToBlocks(href, width);
  };

  marked(markdown, { renderer });

  for (const href in imagePromises) {
    imagePromises[href] = await imagePromises[href];
  }

  return imagePromises;
}

function extractSlides(markdown, imageMap) {
  const slides = [];
  const renderer = new marked.Renderer();
  function pushContent(text) {
    if (slides.length === 0) {
      return;
    }
    const currentSlide = slides[slides.length - 1];
    currentSlide.content += decode(text);
  }

  renderer.heading = function (text, level) {
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
      content: "",
    });
  };

  renderer.listitem = (text) => pushContent(`${colors.green("▶")} ${text}\n\n`);
  renderer.paragraph = (text) => pushContent(`\n${text}\n\n`);
  renderer.codespan = (text) => `${colors.italic(text)}`;
  renderer.code = (code, language) => {
    if (language === "aboxd") return pushContent(createChart(code));
    language
      ? pushContent(highlight(`\n${code}\n`, { language }))
      : pushContent(`\n${code}\n`);
  };
  renderer.strong = (text) => colors.bold(text);
  renderer.em = (text) => colors.italic(text);
  renderer.br = () => pushContent("\n");
  renderer.del = (text) => colors.strikethrough(text);
  renderer.image = (href) => imageMap[href].image;

  marked(markdown, { renderer: renderer });

  return slides;
}

if (process.argv.length !== 3) {
  console.log("Usage: slimd [markdown file]");
  process.exit(1);
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
  const plainLines = lines.map((line) => stripAnsi(line));

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

async function init() {
  const markdownContent = fs.readFileSync(process.argv[2]).toString();
  const { width } = size.get();
  const imageMap = await extractImages(
    markdownContent,
    Math.round(width * 0.8)
  );
  let slides = extractSlides(markdownContent, imageMap);

  let slideIndex = 0;


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
      // rows.push(content);
    }

    rows.push(
      ...Array.from({ length: height - rows.length }).map(() => spaces(width))
    );
    return rows;
  }

  hideCursor();
  renderSlide(getSlide(slideIndex));

  onResize(async () => {
    const { width } = size.get();
    const imageMap = await extractImages(
      markdownContent,
      Math.round(width * 0.8)
    );
    slides = extractSlides(
      fs.readFileSync(process.argv[2]).toString(),
      imageMap
    );
    renderSlide(getSlide(slideIndex));
  });

  readline.emitKeypressEvents(process.stdin);
  process.stdin.setRawMode(true);
  process.stdin.on("keypress", (str, key) => {
    if (["right", "space"].includes(key.name)) {
      slideIndex = Math.min(slides.length - 1, slideIndex + 1);
      renderSlide(getSlide(slideIndex));
    }
    if (["left"].includes(key.name)) {
      slideIndex = Math.max(0, slideIndex - 1);
      renderSlide(getSlide(slideIndex));
    }
    if (key.name === "t") {
      slideIndex = Math.min(slides.length - 1, slideIndex + 1);
      transition(getSlide(slideIndex));
    }
    if (key.name === "T") {
      slideIndex = Math.max(0, slideIndex - 1);
      transition(getSlide(slideIndex));
    }
    if (key.name === "q" || (key.ctrl === true && key.name === "c")) {
      showCursor();
      process.exit();
    }
  });
}

init();
