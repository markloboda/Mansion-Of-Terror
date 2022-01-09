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
    Object.assign(this, options);
    this.isActive = options.isActive;
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
    this.after = this.parseAfterAction(this.after);
    this.before = this.parseAfterAction(this.before);
    document.addEventListener(`play_${this.name}`, this._playAnimation.bind(this))
  }

  activate() {
    this.isActive = true;
  }

  disable() {
    this.startTime = null;
    this.isActive = false;
  }

  _playAnimation(e) {
    let allConditions = false;
    if (this.conditions) {
      for (let condition of this.conditions) {
        const negate = condition[0] === "!";
        if (negate) {
          condition = condition.substring(1, condition.length)
        }
        allConditions = negate ? !this.gameState[condition] : this.gameState[condition];
        if (!allConditions) {
          return;
        }
      }
    }
    !this.isActive && this.activate()
  }

  update(reset) {
    if (!this.startTime) {
      this.startTime = Date.now();
      if (this.before) {
        for (const action of this.before) {
          action();
        }
      }
    }

    let t = Date.now() - this.startTime;
    if (t > this.timestamps[this.targetKeyframe]) {
      if (this.timestamps.length-1 == this.targetKeyframe) {
        if (this.loop) {
          this.targetKeyframe = 0;
        }
        else {
          if (!reset && this.after) {
            for (const action of this.after) {
              action();
            }
          }
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

  playSound() {
    const query = document.querySelectorAll("audio");
    let found = false;
    let sound;
    for (let i = 0; i < query.length; i++) {
      if (i.src == "../common/sound/" + this.soundName) {
        found = true;
        sound = i;
        break;
      }
    }
    if (!found) {
      let sound = document.createElement("audio");
      sound.setAttribute("id", "main-soundtrack");
      sound.className = "audio";
      sound.src = "../common/sound/" + this.soundName;
      sound.play();
      document.getElementById("audio-div").appendChild(sound);
    } else {
      i.play();
    }

    

    
  }
  
  parseAfterAction(after) {
    if (!after) {
      return null;
    }
    const actions = [];
    for (const action of after) {
      switch(action) {
        case "disableAABB": actions.push(this.disableAABB.bind(this)); break;
        case "trigger": actions.push(this.triggerAnimation.bind(this)); break;
        case "setCondition": actions.push(this.setCondition.bind(this)); break;
        case "disableInteractable": actions.push(this.disableInteractable.bind(this)); break;
        case "resetAnimation": actions.push(this.resetAnimation.bind(this)); break;
        case "playSound": actions.push(this.playSound.bind(this)); break;
      }
    }
    return actions;
  }

  resetAnimation() {
    this.targetKeyframe = 0;
    this.startTime = 0;
    this.update(true);
    this.startTime = null;
    this.targetKeyframe = 0;
  }

  disableInteractable() {
    for (const interactable of this.disableInteractables) {
      interactable.disable();
    }
  }

  disableAABB() {
    for (const node of this.disableNodes) {
      node.disableAABB();
    }
  }

  triggerAnimation() {
    for (const animation of this.trigger) {
      document.dispatchEvent(new Event(`play_${animation}`))
    }
  }

  setCondition() {
    if (this.gameState) {
      for (const condition in this.setConditions) {
        this.gameState[condition] = this.setConditions[condition];
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
