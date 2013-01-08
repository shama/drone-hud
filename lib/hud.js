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
  this.canvas    = canvas;
  this.ctx       = canvas.getContext('2d');
  this._three    = false;
  this._scene    = false;
  this._camera   = false;
  this._renderer = false;
  // stuff to render flat after three.js
  this._flat     = [];

  // shim for running on server
  this.canvas.style = this.canvas.style || {
    width: canvas.width,
    height: canvas.height
  };
}

module.exports = HUD;

// draw a battery
HUD.prototype.battery = function(data) {
  var x = 0, y = 0, w = 60, h = 30;
  var o = 0.8;
  if (data <= 0) data = 0;

  // battery shape
  if (data < 25) this.ctx.fillStyle = rgba(255, 125, 0, o);
  else this.ctx.fillStyle = rgba(255, 255, 255, o);
  this.ctx.fillRect(x, y, w, h);
  this.ctx.fillRect(w, h/4, w/12, h/2);
  this.ctx.clearRect(x+5, y+5, w-10, h-10);

  // text
  this.ctx.font = '22px impact';
  this.ctx.lineWidth = 2;
  this.ctx.fillText(data + '%', x+w+15, y+(h/2)+8);

  // power level
  if (data < 25) this.ctx.fillStyle = rgba(255, 125, 0, o);
  else this.ctx.fillStyle = rgba(0, 125, 255, o);
  this.ctx.fillRect(x+8, y+8, (w-16) * (data/100), h-16);
};

// draw a drone :D
HUD.prototype.drone = function(data) {
  this._initThree();

  // init drone
  // todo: turn into drone model
  if (!this._drone) {
    var geo = new this._three.CubeGeometry(300, 300, 70);
    var mat = new this._three.MeshBasicMaterial({color: 0x0066ff, wireframe: true});
    this._drone = new this._three.Mesh(geo, mat);
    this._scene.add(this._drone);
  }

  this._drone.rotation.x = PI180 * -data.rotation.x;
  this._drone.rotation.y = PI180 * data.rotation.y;
  this._drone.rotation.z = PI180 * -data.rotation.z;
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
};

// draw cartesian coordinates
HUD.prototype.cartesian = function(data) {
  var self = this;
  self._initThree();

  // init cartesian
  if (!self._cartesian) {
    [{
      color: 0xaa0000,
      vertices: [
        new self._three.Vector3(200, 0, 0),
        new self._three.Vector3(500, 0, 0)
      ]
    }, {
      color: 0x00aa00,
      vertices: [
        new self._three.Vector3(0, 200, 0),
        new self._three.Vector3(0, 500, 0)
      ]
    }, {
      color: 0x0000aa,
      vertices: [
        new self._three.Vector3(0, 0, 200),
        new self._three.Vector3(0, 0, 500)
      ]
    }].forEach(function(line) {
      var mat = new self._three.LineBasicMaterial({color:line.color});
      var geo = new self._three.Geometry();
      geo.vertices = line.vertices;
      var mesh = new self._three.Line(geo, mat);
      self._scene.add(mesh);
    });
  }

  // label font
  var font = '12px impact';
  var x = data.rotation.x.toFixed(2) + '\u00B0';
  var y = data.rotation.y.toFixed(2) + '\u00B0';
  var z = data.rotation.z.toFixed(2) + '\u00B0';

  // x label
  self._flat.push(function(ctx) {
    var v = this.threeToTwo(new this._three.Vector3(500, 0, 0));
    ctx.font = font;
    ctx.fillStyle = rgba(255, 0, 0);
    ctx.fillText(x, v.x+10, v.y+4);
  });

  // y label
  self._flat.push(function(ctx) {
    var v = this.threeToTwo(new this._three.Vector3(0, 500, 0));
    ctx.font = font;
    ctx.fillStyle = rgba(0, 255, 0);
    ctx.fillText(y, v.x-10, v.y-5);
  });

  // z label
  self._flat.push(function(ctx) {
    var v = this.threeToTwo(new this._three.Vector3(0, 0, 500));
    ctx.font = font;
    ctx.fillStyle = rgba(0, 0, 255);
    ctx.fillText(z, v.x-10, v.y+15);
  });

  // todo: length of lines based on velocity

};

// render scene
HUD.prototype.render = function() {
  var self = this;
  if (self._renderer) {
    self._renderer.render(self._scene, self._camera);
  }
  if (self._flat.length > 0) {
    self._flat.forEach(function(fn, i) {
      fn.call(self, self.ctx);
      delete self._flat[i];
    });
  }
};

// clear for redraw
HUD.prototype.clear = function() {
  this.canvas.width = this.canvas.width;
};

// helper for rgba
var rgba = HUD.prototype.rgba = function(r, g, b, a) {
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
