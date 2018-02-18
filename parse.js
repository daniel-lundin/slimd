const fs = require("fs");
const marked = require("marked");

function extractStartSlide(tokens) {
  const heading = tokens.findIndex(
    token => token.type === "heading" && token.depth === 1
  );
  if (heading === -1) {
    return { heading: null, content: null, rest: tokens };
  }

  const nextHeading = tokens.findIndex(
    token => token.type === "heading" && token.depth !== 1
  );

  return {
    heading: tokens[heading],
    content: tokens.slice(heading + 1, nextHeading),
    rest: tokens.slice(nextHeading)
  };
}

function parseSlide(slide) {
  const heading = slide.find(token => token.type === "heading");
}
function extractSlides(tokens) {
  let subHeading = tokens.findIndex(
    token => token.type === "heading" && token.depth === 2
  );
  const slides = [];

  while (subHeading !== -1) {
    const nextHeading = tokens.findIndex(
      (token, index) =>
        index > subHeading && token.type === "heading" && token.depth === 2
    );
    console.log("nextHeading at", nextHeading);

    slides.push(
      tokens.slice(subHeading, nextHeading === -1 ? tokens.length : nextHeading)
    );

    subHeading = tokens.findIndex(
      (token, index) =>
        index > subHeading && token.type === "heading" && token.depth === 2
    );
  }
  return slides;
}

function parseMD(text) {
  const tokens = marked.lexer(text);

  const { heading, content, rest } = extractStartSlide(tokens);

  const slides = extractSlides(rest);

  console.log("slides", slides);
}

if (require.main === module) {
  const md = fs.readFileSync("./md.md").toString();

  console.log(parseMD(md));
}
