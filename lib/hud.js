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
    ctx.fillStyle = rgba(255, 255, 255, this.opacity);
    ctx.font = this.fontSize + 'px ' + this.fontFamily;
    var x = this.canvas.width - ctx.measureText(data).width - 5;
    ctx.fillText(data, x, 20);
  });
};

// draw a battery
HUD.prototype.battery = function(data) {
  this._last.push(function(ctx) {
    var x = 5, y = 5, w = 40, h = 25;
    if (data <= 0) data = 0;

    // battery shape
    if (data < 25) ctx.fillStyle = rgba(255, 125, 0, this.opacity);
    else ctx.fillStyle = rgba(255, 255, 255, this.opacity);
    ctx.fillRect(x+w, y+h/4, w/12, h/2);
    ctx.fillRect(x, y, w, h);
    ctx.clearRect(x+5, y+5, w-10, h-10);

    // text
    ctx.font = this.fontSize + 'px ' + this.fontFamily;
    ctx.lineWidth = 2;
    ctx.fillText(data + '%', x+w+15, y+(h/2)+8);

    // power level
    if (data < 25) ctx.fillStyle = rgba(255, 125, 0, this.opacity);
    else ctx.fillStyle = rgba(0, 125, 255, this.opacity);
    ctx.fillRect(x+8, y+8, (w-16) * (data/100), h-16);
  });
};

// draw a drone :D
HUD.prototype.drone = function(data) {
  this._initThree();

  // init drone
  // todo: turn into drone model
  if (!this._drone) {
    var geo = new this._three.CubeGeometry(300, 300, 70);
    var mat = new this._three.MeshBasicMaterial({
      color: 0xffffff,
      wireframe: true,
      transparent: true,
      opacity: this.opacity
    });
    this._drone = new this._three.Mesh(geo, mat);
    this._scene.add(this._drone);
  }

  this._drone.rotation.x = PI180 * -data.rotation.x;
  this._drone.rotation.y = PI180 * data.rotation.y;
  this._drone.rotation.z = PI180 * -data.rotation.z;
};

// draw cartesian coordinates
HUD.prototype.cartesian = function(data) {
  var self = this;
  self._initThree();

  // init cartesian
  if (!self._cartesian) {
    [{
      color: 0x990000,
      vertices: [
        new self._three.Vector3(200, 0, 0),
        new self._three.Vector3(500, 0, 0)
      ]
    }, {
      color: 0x009900,
      vertices: [
        new self._three.Vector3(0, 200, 0),
        new self._three.Vector3(0, 500, 0)
      ]
    }, {
      color: 0x000099,
      vertices: [
        new self._three.Vector3(0, 0, 200),
        new self._three.Vector3(0, 0, 500)
      ]
    }].forEach(function(line) {
      var mat = new self._three.LineBasicMaterial({
        color:line.color,
        transparent: true,
        opacity: self.opacity
      });
      var geo = new self._three.Geometry();
      geo.vertices = line.vertices;
      var mesh = new self._three.Line(geo, mat);
      self._scene.add(mesh);
    });
  }

  // label font
  var font = (self.fontSize-4) + 'px ' + self.fontFamily;;
  var x = data.rotation.x.toFixed(2) + '\u00B0';
  var y = data.rotation.y.toFixed(2) + '\u00B0';
  var z = data.rotation.z.toFixed(2) + '\u00B0';

  // x label
  self._last.push(function(ctx) {
    var v = this.threeToTwo(new this._three.Vector3(500, 0, 0));
    ctx.font = font;
    ctx.fillStyle = rgba(255, 0, 0, self.opacity);
    var txtW = ctx.measureText(x).width;
    ctx.fillText(x, v.x-txtW, v.y);
  });

  // y label
  self._last.push(function(ctx) {
    var v = this.threeToTwo(new this._three.Vector3(0, 500, 0));
    ctx.font = font;
    ctx.fillStyle = rgba(0, 255, 0, self.opacity);
    ctx.fillText(y, v.x, v.y);
  });

  // z label
  self._last.push(function(ctx) {
    var v = this.threeToTwo(new this._three.Vector3(0, 0, 500));
    ctx.font = font;
    ctx.fillStyle = rgba(0, 0, 255, self.opacity);
    ctx.fillText(z, v.x, v.y);
  });

  // todo: length of lines based on velocity
};

// draw altitude lines
HUD.prototype.altitude = function(data) {
  this._last.push(function(ctx) {
    var txt = data + 'm';
    var o = this.opacity - 0.2;
    var maxH = 30;

    // convert meters to 200 - 1500 on z axis
    // assume 30m is the max the drone will fly
    var alt = ((data * (1500 - 200)) / maxH) + 200;
    var v = this.threeToTwo(new this._three.Vector3(0, 0, -alt));

    var lineW = ((data * (40 - 150)) / maxH) + 150;
    ctx.beginPath();
    ctx.strokeStyle = rgba(255, 255, 255, o);
    ctx.moveTo(v.x-(lineW/2), v.y);
    ctx.lineTo(v.x+(lineW/2), v.y);
    ctx.stroke();

    ctx.font = (this.fontSize-4) + 'px ' + this.fontFamily;
    ctx.fillStyle = rgba(255, 255, 255, o);
    var txtW = ctx.measureText(txt).width;
    ctx.fillText(txt, v.x - (txtW/2), v.y-5);
  });
};

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
