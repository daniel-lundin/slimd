// ▀ upper half
// ▄ lower half

const jimp = require("jimp");
const colors = require("ansi-256-colors");

function imgToBlocks(filePath, width) {
  return new Promise((resolve, reject) => {
    jimp.read(filePath, (err, img) => {
      if (err) return reject(err);
      const resized = img.resize(width, jimp.AUTO);

      let blockImage = "";

      for (let row = 0; row < resized.bitmap.height; row += 2) {
        let rowPixels = "";
        for (let col = 0; col < resized.bitmap.width; ++col) {
          const bgColor = jimp.intToRGBA(resized.getPixelColor(col, row));
          const fgColor = jimp.intToRGBA(resized.getPixelColor(col, row + 1));

          rowPixels +=
            colors.bg.getRgb(
              Math.round((bgColor.r / 255) * 5),
              Math.round((bgColor.g / 255) * 5),
              Math.round((bgColor.b / 255) * 5)
            ) +
            colors.fg.getRgb(
              Math.round((fgColor.r / 255) * 5),
              Math.round((fgColor.g / 255) * 5),
              Math.round((fgColor.b / 255) * 5)
            ) +
            "▄" +
            colors.reset;
        }
        blockImage += rowPixels + "\n";
      }
      resolve({
        image: blockImage,
        width: resized.bitmap.width,
        height: resized.bitmap.height,
      });
    });
  });
}

module.exports = {
  imgToBlocks,
};
