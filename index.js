const fs = require("fs");
const marked = require("marked");
const cfonts = require("cfonts");
const colors = require("colors");
const print = require("./print");

function extractSlides(markdown) {
  const slideIndex = 0;
  const slides = [];
  const renderer = new marked.Renderer();
  function pushContent(text) {
    if (slides.length === 0) {
      return;
    }
    const currentSlide = slides[slides.length - 1];
    currentSlide.content += text;
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
        title: print(text),
        content: ""
      });
    }
  };

  renderer.listitem = text => pushContent(` - ${text}\n`);
  renderer.paragraph = text => pushContent(`${text}\n`);
  renderer.codespan = text => pushContent(`\`${text}\``);
  renderer.code = code => pushContent(code);
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

slides.forEach(slide => {
  console.log(slide.title);
  console.log(slide.content);
});
