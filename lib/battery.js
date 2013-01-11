module.exports = function(data) {
  this._last.push(function(ctx) {
    var x = 5, y = 5, w = 40, h = 25;
    if (data <= 0) data = 0;

    // battery shape
    if (data < 25) ctx.fillStyle = this.rgba(255, 125, 0, this.opacity);
    else ctx.fillStyle = this.rgba(255, 255, 255, this.opacity);
    ctx.fillRect(x+w, y+h/4, w/12, h/2);
    ctx.fillRect(x, y, w, h);
    ctx.clearRect(x+5, y+5, w-10, h-10);

    // text
    ctx.font = this.fontSize + 'px ' + this.fontFamily;
    ctx.lineWidth = 2;
    ctx.fillText(data + '%', x+w+15, y+(h/2)+8);

    // power level
    if (data < 25) ctx.fillStyle = this.rgba(255, 125, 0, this.opacity);
    else ctx.fillStyle = this.rgba(0, 125, 255, this.opacity);
    ctx.fillRect(x+8, y+8, (w-16) * (data/100), h-16);
  });
};