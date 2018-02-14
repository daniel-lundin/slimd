const blocks = require("./fonts/blocks.js");

const HEIGHT = 3;
function printWord(str) {
  const letterIndices = Array.from(str).map(letter => {
    return letter.toUpperCase().charCodeAt(0);
  });

  console.log(letterIndices);
  const letters = letterIndices
    .map(index => index - 65)
    .map(index => console.log("index", index) || index)
    .filter(index => index >= 0 && index <= blocks.length - 2 || index === -33);
  let output = '';
  for (let i = 0; i < HEIGHT; ++i) {
    letters.forEach(letter => {
        if (letter === -33) {
      output += "  ";
        } else {


      output += blocks[letter][i] + " ";
        }
      // process.stdout.write(blocks[letter][i] + " ");
    });
    output += "\n";
    //process.stdout.write("\n");
  }
  return output;
}

function printLetter(index) {
  const letter = blocks[index];

  letter.forEach(line => {
    console.log(line);
  });
}
// printWord("daniel");
// printWord("abcdefghijklmnopq");
module.exports = printWord;
