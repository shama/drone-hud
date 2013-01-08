// shim for creating canvas elements in node
// with three.js. Pop this on top.
var document = document || {};
if (!process.browser) {
  document.createElement = function(type) {
    if (type === 'canvas') {
      var c = new (require('canvas'));
      c.style = {width:0,height:0};
      return c;
    }
  };
}
