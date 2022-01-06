import { mat4, quat } from "../lib/gl-matrix-module.js";
import { Node } from "./Node.js";


export class Interactable extends Node {
  constructor(options) {
    super(options);
    Object.assign(this, options);
    this.master;
    this.yOffset = this.translation[1];
    this.zOffset = this.translation[2];
    this.action;
    this._parseAction();
    this.keys = {};
    document.addEventListener('keydown', this.keydownHandler.bind(this));
    document.addEventListener('keyup', this.keyupHandler.bind(this));
  }

  _updateTransform() {
    if (!this.carrying) {
      if (this.keys?.KeyF) {
        this.carrying = true;
        this.disableAABB();
        if (this.setConditions) {
          this._setConditions();
        }
      }
    }
    else {
      mat4.getTranslation(this.translation, this.master.matrix);
      this.translation[1] += this.yOffset;
      // this.translation[2] += this.zOffset;
      quat.multiply(this.rotation, this.master.parent.rotation, this.master.rotation);
      this.updateMatrix();
    }
  }

  _setConditions() {
    document.dispatchEvent(new CustomEvent("setConditions", {detail: this.setConditions}));
  }

  _parseAction() {
    switch (this.type) {
      case 'carry': this.action = this._updateTransform; break;
      case 'interact': 
        this.action = this._interact;
        break;
    }
  }

  _interact() {
    if (!this.keys?.KeyF) {
      return;
    }
    for (const type in this.interact) {
      for (const event of this.interact[type]) {
        document.dispatchEvent(new Event(`${type}_${event}`));
      }
    }
  }
}
