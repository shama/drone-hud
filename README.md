# drone-hud

_work in progress_

HUD for [drone-video](https://github.com/TooTallNate/node-drone-video).

**Goals**

1. ~~battery meter in a corner~~
1. ~~integrate with three.js~~
1. ~~cartesian coordinates with rotation values~~
1. mirroring ar drone model (building a model)
1. ~~altitude bar shrink/grow below~~
1. ticks that slide along coordinates (or something) to show velocity
1. ~~display name of drone/wifi net~~
1. cell shade everything to look cool
1. nodecopter logo ftw

## demo

[Here is a youtube video](http://www.youtube.com/watch?v=TtwjykeRAsE&list=UUpqYfSWEcyBGorRGvPsHkgg&index=1) demonstrating three.js coordinates and placeholder for the ar drone model.

and a screenshot so far:

![screenshot](https://raw.github.com/shama/drone-hud/master/test/fixtures/hud-screen.jpg)

## example
Load the following into [drone-video](https://github.com/TooTallNate/node-drone-video)

```js
var Canvas = require('canvas');
var HUD = require('drone-hud');

var canvas = new Canvas(width, height);
var h = new HUD(canvas);

var draw = module.exports = function(data, width, height, fn) {

  // name of drone in top right
  h.name('NODECOPTER');

  // battery level in top left
  h.battery(data.demo.batteryPercentage);

  // drone model (WIP)
  h.drone(data.demo);

  // 3d cartesian coordinates
  h.cartesian(data.demo);

  // altitude in meters
  h.altitude(data.altitudeMeters);

  // render the scene
  h.render();

  canvas.toBuffer(fn);
};
```

_Please note!_ A shim for three.js is needed to render to canvas with
drone-video. Add these lines to the top of three.js:

```js
var document = document || {};
document.createElement = function(type) { if (type === 'canvas') return new (require('canvas')); };
```

## install / using

Install with `npm install`.

Test on the browser with `npm test`.

## license
Copyright (c) 2013 Kyle Robinson Young<br/>
Licensed under the MIT license.
