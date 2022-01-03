import { mat4, quat } from "../lib/gl-matrix-module.js";
import { Node } from "./Node.js";


export class Interactable extends Node {
  constructor(options) {
    super(options);
    this.master;
    this.inFocus = false;
    this.yOffset = this.translation[1];
  }

  updateTransform() {
    if (this.master) {
      mat4.getTranslation(this.translation, mat4.clone(this.master.matrix));
      this.translation[1] += this.yOffset;
      quat.multiply(this.rotation, this.master.parent.rotation, this.master.rotation);
    }
  }
}
