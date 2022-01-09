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
    this.prompt = document.getElementById(`${this.type}_prompt`);
    document.addEventListener('keydown', this.keydownHandler.bind(this));
    document.addEventListener('keyup', this.keyupHandler.bind(this));
  }

  showPrompt() {
    if (!this.prompt) {
      return;
    }
    if (this.disabled || this.carrying || document.getElementById("main-menu").style.visibility != "hidden") {
      this.prompt.className = "hide";
      return;
    }
    this.prompt.className = "show";
  }

  hidePrompt() {
    if (!this.prompt) {
      return;
    }
    this.prompt.className = "hide";
  }

  _updateTransform() {
    if (!this.disabled && !this.carrying) {
      if (this.keys?.KeyF) {
        this.carrying = true;
        this.disableAABB();
        if (this.setConditions) {
          this._setConditions();
        }
      }
    }
    else if (!this.disabled) {
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
      case 'collide':
        this.action = this._collide;
        break;
    }
  }

  disable() {
    this.carrying = false;
    this.disabled = true;
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
  
  _collide() {
    for (const type in this.interact) {
      for (const event of this.interact[type]) {
        document.dispatchEvent(new Event(`${type}_${event}`));
      }
    }
  }
}
