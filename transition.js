const ESC = "\u001B[";

const sleep = time => new Promise(resolve => setTimeout(resolve, time));

function cursorTo(x, y) {
  return `${ESC}${y + 1};${x + 1}H`;
}

function transition2(slide) {
  const maxXY = Math.max(slide.length, slide[0].length) * 2;
  const sleeper = () => sleep(10);
  // console.log("maxXY", maxXY);

  Array.from({ length: maxXY })
    .map((_, index) => index)
    .reduce((wait, current) => {
      return wait.then(sleeper).then(() => {
        for (let i = current; i >= 0; --i) {
          if (slide[i] && slide[i][current - i]) {
            process.stdout.write(cursorTo(current - i, i));
            process.stdout.write(slide[i][current - i]);
          }
        }
      });
    }, Promise.resolve());
}

// 1 => [0,0],
// 2 => [0, 1], [1, 0]
// 3 => [0, 2], [1, 1], [2, 0]
// 4 => [0, 3], [1, 2], [2, 1], [3, 0]

function transition(slide) {
  return slide.reduce((acc, curr, index) => {
    return acc.then(() => sleep(20)).then(() => {
      process.stdout.write(cursorTo(0, index));
      process.stdout.write(curr);
    });
  }, Promise.resolve());
}

module.exports = transition;

if (require.main === module) {
  const slide = ["1234", "1234", "1234"];
  console.log("");
  console.log("");
  console.log("");
  transition2(slide);
  // console.log(printWord(process.argv[2]));
}
