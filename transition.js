const ESC = "\u001B[";

function cursorTo(x, y) {
  return `${ESC}${y + 1};${x + 1}H`;
}

function transition(slide) {}
