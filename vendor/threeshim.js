// shim for creating canvas elements in node
// with three.js. Pop this on top when you
// want to run on the server.
// TODO: Figure out a way to do this automatically

//var document = document || {};
//document.createElement = function(type) { if (type === 'canvas') return new (require('canvas')); };
