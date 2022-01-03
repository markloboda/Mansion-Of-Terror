import { mat4 } from "../lib/gl-matrix-module.js";
import { Node } from "./Node.js";


export class Interactable extends Node{
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
      this.rotation = this.master.rotation;
      mat4.getRotation(this.rotation, mat4.clone(this.master.matrix));
    }
  }
}
