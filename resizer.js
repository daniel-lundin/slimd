const size = require("window-size");

function onResize(cb) {
  let _width = size.width;
  let _height = size.height;
  setInterval(() => {
    const { width, height } = size.get();
    if (width !== _width || height !== _height) {
      cb(width, height);
      _width = width;
      _height = height;
    }
  }, 300);
}

module.exports = { onResize };

if (require.main === module) {
  onResize((height, width) => {
    console.log("new size", width, height);
  });
}
