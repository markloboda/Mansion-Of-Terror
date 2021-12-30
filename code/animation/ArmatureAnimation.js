import { quat } from "../../lib/gl-matrix-module.js";

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
		this.isActive = true;
		this.name = options.name;
		this.keyframes = options.keyframes;
		if (this.keyframes) {
			this.timestamps = Object.keys(this.keyframes).map((key) => parseInt(key));
			this.duration = Math.max(...this.timestamps);
			this.startTime = 0;
			this.targetKeyframe = {
				index: 0,
				val: parseInt(Object.keys(this.keyframes)[0]),
			};
		} else {
			throw AnimationError.keyframesNotSupplied();
		}
		console.log(this);
	}
	
	update() {
		if (!this.startTime) {
			this.startTime = Date.now();
		}
		let t = Date.now() - this.startTime;
		
		if (t > this.targetKeyframe.val) {
			const newIndex =
			this.timestamps.length - 1 == this.targetKeyframe.index
			? 0
			: this.targetKeyframe.index + 1;
			this.targetKeyframe = { index: newIndex, val: this.timestamps[newIndex] };
			if (!newIndex) {
				this.startTime = Date.now();
				t = 0;
			}
		}
		const keyframeStart = this.targetKeyframe.index
		? this.timestamps[this.targetKeyframe.index - 1]
		: this.timestamps[this.timestamps.length - 1];
		const iAmmount = (t - keyframeStart) / (this.targetKeyframe.val - keyframeStart);
		for (const transform of this.keyframes[this.targetKeyframe.val]) {
			if (transform.transform.length) {
				switch (transform.type) {
					case "rotation":
					quat.slerp(
						transform.node.rotation,
						transform.node.rotation,
						quat.fromValues(...Array.from(transform.transform)),
						iAmmount
						);
						transform.node.updateMatrix();
						break;
					}
				}
			}
		}
	}
	