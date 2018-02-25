const blocks = require("./fonts/blocks.js");

const HEIGHT = 3;
function printWord(str) {
  const letterIndices = Array.from(str).map(letter => {
    return letter.toUpperCase().charCodeAt(0);
  });

  const letters = letterIndices
    .map(index => index - 65)
    .filter(index => (index >= 0 && index <= blocks.length - 1) || index === -33);
  let output = "";
  for (let i = 0; i < HEIGHT; ++i) {
    letters.forEach(letter => {
      if (letter === -33) {
        output += "  ";
      } else {
        output += blocks[letter][i] + " ";
      }
    });
    output += "\n";
  }
  return output;
}

if (require.main === module) {
  console.log(printWord(process.argv[2]));
}
module.exports = printWord;
