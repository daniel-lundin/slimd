const ESC = "\u001B[";

const sleep = time => new Promise(resolve => setTimeout(resolve, time));

function cursorTo(x, y) {
  return `${ESC}${y + 1};${x + 1}H`;
}

function transition(slide) {
  return slide.reduce((acc, curr, index) => {
    return acc.then(() => sleep(20)).then(() => {
      process.stdout.write(cursorTo(0, index));
      process.stdout.write(curr);
    });
  }, Promise.resolve());
}

module.exports = transition;
