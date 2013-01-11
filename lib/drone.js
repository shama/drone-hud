var PI180 = Math.PI / 180;

module.exports = function(data) {
  this._initThree();

  // init drone
  // todo: turn into drone model
  if (!this._drone) {
    var geo = new this._three.CubeGeometry(300, 300, 70);
    var mat = new this._three.MeshLambertMaterial({
      color: 0x0066ff,
      //wireframe: true,
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