// libs
var HUD = require('../lib/hud');

// data
var testdata = (require('./fixtures/navdata.json')).data;

// canvas
var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

var h = new HUD(canvas);
var i = 0;

setInterval(function() {
  h.clear();
  var data = (testdata.shift()).demo;

  ctx.strokeStyle = h.rgba(0, 125, 255, 0.8);
  h.cartesian(data);
  h.drone(data);
  h.battery(data.batteryPercentage);

  h.render();
}, 100);
