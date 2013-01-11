module.exports = function(data) {
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
    ctx.fillStyle = self.rgba(255, 0, 0, self.opacity);
    var txtW = ctx.measureText(x).width;
    ctx.fillText(x, v.x-txtW, v.y);
  });

  // y label
  self._last.push(function(ctx) {
    var v = this.threeToTwo(new this._three.Vector3(0, 500, 0));
    ctx.font = font;
    ctx.fillStyle = self.rgba(0, 255, 0, self.opacity);
    ctx.fillText(y, v.x, v.y);
  });

  // z label
  self._last.push(function(ctx) {
    var v = this.threeToTwo(new this._three.Vector3(0, 0, 500));
    ctx.font = font;
    ctx.fillStyle = self.rgba(0, 0, 255, self.opacity);
    ctx.fillText(z, v.x, v.y);
  });

  // todo: length of lines based on velocity
};