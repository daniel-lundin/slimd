const stripAnsi = require("strip-ansi");
const ESC = "\u001B[";

const sleep = time => new Promise(resolve => setTimeout(resolve, time));

function cursorTo(x, y) {
  return `${ESC}${y + 1};${x + 1}H`;
}

function nonAnsiSlice(str, len) {
  let plainCount = 0;
  for (let i = 0; i < str.length; ++i) {
    if (stripAnsi(str[i]).length === 1) {
      plainCount += 1;
    }

    if (plainCount === len) {
      return str.slice(0, i + 1);
    }
  }
  return "";
}

function transition2(slide) {
  const maxXY = Math.max(slide.length, slide[0].length) * 4;
  const sleeper = () => sleep(5);

  Array.from({ length: maxXY })
    .map((_, index) => index)
    .reduce((wait, current) => {
      return wait.then(sleeper).then(() => {
        for (let i = 0; i <= current; ++i) {
          if (slide[i]) {
            process.stdout.write(cursorTo(0, i));
            process.stdout.write(nonAnsiSlice(slide[i], current - i));
          }
        }
      });
    }, Promise.resolve());
}

function renderSlide(slide) {
  slide.forEach((s, index) => {
    process.stdout.write(cursorTo(0, index));
    process.stdout.write(slide[index]);
  });
}

function transition(slide) {
  return slide.reduce((acc, curr, index) => {
    return acc.then(() => sleep(20)).then(() => {
      process.stdout.write(cursorTo(0, index));
      process.stdout.write(curr);
    });
  }, Promise.resolve());
}

module.exports = {
  renderSlide,
  transition: transition2
};

if (require.main === module) {
  const slide = ["1234", "1234", "1234"];
  console.log("");
  console.log("");
  console.log("");
  // console.log(nonAnsiSlice("123", 3));
  transition2(slide);
  // console.log(printWord(process.argv[2]));
}
