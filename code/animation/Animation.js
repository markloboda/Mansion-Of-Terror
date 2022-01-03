import { quat, vec3 } from "../../lib/gl-matrix-module.js";

class AnimationError {
  static keyframesNotSupplied() {
    return new Error(
      "Couldn't instantiate animation: `keyframes` not supplied!"
    );
  }
}

/** Animation wrapper class
 *  */
export class Animation {
  constructor(options = {}) {
    this.isActive = false;
    this.name = options.name;
    this.keyframes = options.keyframes;
    if (this.keyframes) {
      this.timestamps = Object.keys(this.keyframes).map((key) => parseInt(key));
      this.duration = Math.max(...this.timestamps);
      this.startTime = 0;
      this.targetKeyframe = 0;
    } else {
      throw AnimationError.keyframesNotSupplied();
    }
    this.interpolations = {
      LINEAR: this.linearInterpolation.bind(this),
      STEP: this.stepInterpolation.bind(this),
      CUBICSPLINE: this._notImplemented.bind(this),
    };
    this.loop = false;
  }

  activate() {
    this.isActive = true;
  }

  disable() {
    this.startTime = null;
    this.isActive = false;
  }

  update() {
    if (!this.startTime) {
      this.startTime = Date.now();
    }

    let t = Date.now() - this.startTime;
    if (t > this.timestamps[this.targetKeyframe]) {
      if (this.timestamps.length-1 == this.targetKeyframe) {
        if (this.loop) {
          this.targetKeyframe = 0;
        }
        else {
          this.disable();
        }
      }
      else {
        this.targetKeyframe++;
      }
      if (!this.targetKeyframe) {
        this.startTime = Date.now();
        t = 0;
      }
    }

    for (const transform of this.keyframes[
      this.timestamps[this.targetKeyframe]
    ]) {
      if (transform.transform.length) {
        this.interpolations[transform.interpolation](transform, t);
      }
    }
  }

  linearInterpolation(transform, t) {
    const keyframeStart = this.targetKeyframe
      ? this.timestamps[this.targetKeyframe - 1]
      : this.timestamps[this.timestamps.length - 1];
    const iAmmount =
      (t - keyframeStart) /
      (this.timestamps[this.targetKeyframe] - keyframeStart);

    switch (transform.type) {
      case "rotation":
        quat.slerp(
          transform.node.rotation,
          transform.node.rotation,
          transform.transform,
          iAmmount
        );
        break;
      case "translation":
        vec3.lerp(
          transform.node.translation,
          transform.node.translation,
          transform.transform,
          iAmmount
        );
        break;
      case "scale":
        vec3.lerp(
          transform.node.scale,
          transform.node.scale,
          transform.transform,
          iAmmount
        );
        break;
      case "weights":
        this._notImplemented();
        break;
    }
    transform.node.updateMatrix();
  }

  stepInterpolation(transform, t) {
    switch (transform.type) {
      case "rotation":
        transform.node.rotation = transform.transform;
        break;
      case "translation":
        transform.node.translation = transform.transform;
        break;
      case "scale":
        transform.node.scale = transform.transform;
        break;
      case "weights":
        this._notImplemented();
        break;
    }
    transform.node.updateMatrix();
  }

  _notImplemented(...args) {
    if (!this.logged) {
      console.error("Your type of animation is not supported!");
      this.logged = true;
    }
  }
}
