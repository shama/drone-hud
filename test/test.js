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

  ctx.shadowColor = 'black';
  ctx.shadowBlur = 1;

  //ctx.strokeStyle = h.rgba(0, 125, 255, h.opacity);
  h.name('NODECOPTER')
  h.cartesian(data);
  h.drone(data);
  h.battery(data.batteryPercentage);

  // simulate up/down altitude since test data dont have it
  // between 0 and 30m
  data.altitudeMeters = Math.abs(Math.floor((Math.sin((Math.PI * 2) * i) - 1) * 15));
  h.altimeter(data.altitudeMeters);

  h.render();
  i += 0.01;
}, 100);
