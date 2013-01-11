module.exports = function(data) {
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
    ctx.strokeStyle = this.rgba(255, 255, 255, o);
    ctx.moveTo(v.x-(lineW/2), v.y);
    ctx.lineTo(v.x+(lineW/2), v.y);
    ctx.stroke();

    ctx.font = (this.fontSize-4) + 'px ' + this.fontFamily;
    ctx.fillStyle = this.rgba(255, 255, 255, o);
    var txtW = ctx.measureText(txt).width;
    ctx.fillText(txt, v.x - (txtW/2), v.y-5);
  });
};