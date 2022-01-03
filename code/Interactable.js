import { mat4, quat } from "../lib/gl-matrix-module.js";
import { Node } from "./Node.js";


export class Interactable extends Node {
  constructor(options) {
    super(options);
    this.master;
    this.inFocus = options.inFocus;
    this.yOffset = this.translation[1];
    this.zOffset = this.translation[2];
    this.type = options.type;
  }

  updateTransform() {
    if (this.master) {
      mat4.getTranslation(this.translation, mat4.clone(this.master.matrix));
      this.translation[1] += this.yOffset;
      //this.translation[2] += this.zOffset;
      quat.multiply(this.rotation, this.master.parent.rotation, this.master.rotation);
    }
  }
}
