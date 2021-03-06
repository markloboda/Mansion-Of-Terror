import { vec3 } from "../../lib/gl-matrix-module.js";


export class SpotLight {
  constructor(options) {
    this.color = options.color;
    this.intensity = [options.intensity];
    this.spot = {
      innerConeAngle: [Math.cos(options.spot.innerConeAngle)],
      outerConeAngle: [Math.cos(options.spot.outerConeAngle)],
    };
    this.name = options.name;

    Object.assign(this, {
      ambientColor: [255, 255, 255],
      diffuseColor: [0, 0, 0],
      specularColor: [0, 0, 0],
      shininess: 10,
      attenuation: [1.0, 0, 0.02],
    });
  }
}
