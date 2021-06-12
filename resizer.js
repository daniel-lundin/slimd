import size from "window-size";

export function onResize(cb) {
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
