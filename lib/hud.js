/*
 * drone-hud
 * https://github.com/shama/drone-hud
 *
 * Copyright (c) 2013 Kyle Robinson Young
 * Licensed under the MIT license.
 */

'use strict';

// globals
var PI180 = Math.PI / 180;

// HUD object
function HUD(canvas) {
  this.canvas     = canvas;
  this.ctx        = canvas.getContext('2d');
  this.opacity    = 0.8;
  this.fontFamily = 'impact';
  this.fontSize   = 18;
  this._three     = false;
  this._scene     = false;
  this._camera    = false;
  this._renderer  = false;
  // stuff to render last after three.js
  this._last      = [];

  // shim for running on server
  this.canvas.style = this.canvas.style || {
    width: canvas.width,
    height: canvas.height
  };
}

module.exports = HUD;

// draw a name
HUD.prototype.name = function(data) {
  this._last.push(function(ctx) {
    ctx.fillStyle = this.rgba(255, 255, 255, this.opacity);
    ctx.font = this.fontSize + 'px ' + this.fontFamily;
    var x = this.canvas.width - ctx.measureText(data).width - 5;
    ctx.fillText(data, x, 20);
  });
};

// draw a battery
HUD.prototype.battery = require('./battery');

// draw a drone :D
HUD.prototype.drone = require('./drone');

// draw cartesian coordinates
HUD.prototype.cartesian = require('./cartesian');

// draw altimeter (WIP)
HUD.prototype.altimeter = require('./altimeter');

// render scene
HUD.prototype.render = function() {
  var self = this;
  if (self._renderer) {
    self._renderer.render(self._scene, self._camera);
  }
  if (self._last.length > 0) {
    self._last.forEach(function(fn, i) {
      var opts = fn.call(self, self.ctx);
      delete self._last[i];
    });
  }
};

// clear for redraw
HUD.prototype.clear = function() {
  this.canvas.width = this.canvas.width;
};

// helper for rgba
HUD.prototype.rgba = function(r, g, b, a) {
  return 'rgba(' + r + ', ' + g + ', ' + b + ', ' + (a || 1) + ')';
};

// helper for 3dto2d
HUD.prototype.threeToTwo = function(vector) {
  if (typeof vector === 'number') {
    vector = new this._three.Vector3(arguments[0], arguments[1], arguments[2]);
  } else {
    // create a new vector to not affect the one passed in
    vector = new this._three.Vector3(vector.x, vector.y, vector.z);
  }
  var v = (new this._three.Projector()).projectVector(vector, this._camera);
  var w = this.canvas.width / 2;
  var h = this.canvas.height / 2;
  return {
    x: Math.round(v.x * w + w),
    y: Math.round(-v.y * h + h)
  };
};

// initialize three.js
HUD.prototype._initThree = function() {
  if (this._three !== false) return this._three;
  this._three = require('../vendor/three.shimd.js');
  this._camera = new this._three.PerspectiveCamera(75, this.canvas.width / this.canvas.height, 1, 10000);
  this._camera.position.x = 1000;
  this._camera.position.y = 1000;
  this._camera.position.z = 500;
  this._camera.lookAt(new this._three.Vector3(0, 0, 0));
  this._camera.rotation.z = PI180 * 160;
  this._scene = new this._three.Scene();
  this._renderer = new this._three.CanvasRenderer({canvas:this.canvas});
  this._renderer.setSize(this.canvas.width, this.canvas.height);

  // lights
  var ambient = new this._three.AmbientLight(0x808080);
  this._scene.add(ambient);

  this._initCelShader();
};

// Cel Shader - Thanks to http://www.neocomputer.org/projects/donut/
HUD.prototype._initCelShader = function() {
  this._three.ShaderLib['lambert'].fragmentShader = this._three.ShaderLib['lambert'].fragmentShader.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
  this._three.ShaderLib['lambert'].fragmentShader = "uniform vec3 diffuse;\n" + this._three.ShaderLib['lambert'].fragmentShader.substr(0, this._three.ShaderLib['lambert'].fragmentShader.length-1);
  this._three.ShaderLib['lambert'].fragmentShader += [
    "#ifdef USE_MAP",
    " gl_FragColor = texture2D( map, vUv );",
    "#else",
    " gl_FragColor = vec4(diffuse, 1.0);",
    "#endif",
    " vec3 basecolor = vec3(gl_FragColor[0], gl_FragColor[1], gl_FragColor[2]);",
    " float alpha = gl_FragColor[3];",
    " float vlf = vLightFront[0];",
    // Clean and simple //
    " if (vlf< 0.50) { gl_FragColor = vec4(mix( basecolor, vec3(0.0), 0.5), alpha); }",
    " if (vlf>=0.50) { gl_FragColor = vec4(mix( basecolor, vec3(0.0), 0.3), alpha); }",
    " if (vlf>=0.75) { gl_FragColor = vec4(mix( basecolor, vec3(1.0), 0.0), alpha); }",
    //" if (vlf>=0.95) { gl_FragColor = vec4(mix( basecolor, vec3(1.0), 0.3), alpha); }",
    //" gl_FragColor.xyz *= vLightFront;",
    "}"
    ].join("\n");
};
