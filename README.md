# drone-hud

_work in progress_

HUD for [drone-video](https://github.com/TooTallNate/node-drone-video).

**Goals**
1. ~~battery meter in a corner~~
1. ~~integrate with three.js~~
1. ~~cartesian coordinates with rotation values~~
1. mirroring ar drone model (building a model)
1. altitude bar shrink/grow below
1. ticks that slide along coordinates (or something) to show velocity
1. display name of drone/wifi net
1. cell shade everything to look cool
1. nodecopter logo ftw

## demo

Video demonstrating three.js coordinates and placeholder for the ar drone model:
<iframe width="560" height="315" src="http://www.youtube.com/embed/TtwjykeRAsE?list=UUpqYfSWEcyBGorRGvPsHkgg" frameborder="0" allowfullscreen></iframe>

and the battery level:
![battery level](http://i.imgur.com/4stMG.jpg)

## example
Load the following into [drone-video](https://github.com/TooTallNate/node-drone-video)

```js
var Canvas = require('canvas');
var HUD = require('drone-hud');

var draw = module.exports = function(data, width, height, fn) {
  var canvas = new Canvas(width, height);
  var ctx = canvas.getContext('2d');

  var h = new HUD(canvas);
  h.drone(data.demo);
  h.cartesian(data.demo);
  h.battery(data.demo.batteryPercentage);
  h.render();

  canvas.toBuffer(fn);
};
```

## license
Copyright (c) 2013 Kyle Robinson Young

Licensed under the MIT license.
