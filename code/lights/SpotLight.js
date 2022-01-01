

export class SpotLight {
  constructor(options) {
    this.color = options.color;
    this.intensity = options.intensity;
    this.spot = options.spot;
    this.name = options.name;
    Object.assign(this, {
      ambientColor     : [255, 255, 255],
      diffuseColor     : [0, 0, 0],
      specularColor    : [0, 0 ,0],
      shininess        : 10,
      attenuation     : [1.0, 0, 0.02]
  });
  }
}
