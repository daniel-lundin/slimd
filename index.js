const fs = require("fs");
const marked = require("marked");
const cfonts = require("cfonts");
const colors = require("colors");
const print = require("./print");

function printMD(markdown) {
  const renderer = new marked.Renderer();

  renderer.heading = function(text, level) {
    if (level === 1) {
      const font = cfonts.render(text, {
        font: "block",
        colors: ["white", "red"]
      });
      return font.string;
    }
    return print(text);
  };

  renderer.list = text => text;
  renderer.listitem = text => ` - ${text}\n`;
  renderer.paragraph = text => `${text}\n`;
  renderer.strong = text => colors.bold(text);
  renderer.em = text => colors.italic(text);
  renderer.codespan = text => `\`${text}\``;
  renderer.br = () => "\n";
  renderer.del = text => colors.strikethrough(text);
  renderer.link = href => colors.underline(href);

  console.log(marked(markdown, { renderer: renderer }));
}

if (process.argv.length !== 3) {
  console.log("Usage: termd [markdown file]");
  process.exit(1);
}

printMD(fs.readFileSync(process.argv[2]).toString());
