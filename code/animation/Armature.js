import { mat4 } from "../../lib/gl-matrix-module.js";

export class Armature {
  constructor(joints, inverseBindMatrices) {
    this.joints = joints
    this.inverseBindMatrices = inverseBindMatrices;
    this.jointMatrices = [];
    this.jointData = new Float32Array(16*this.joints.length);
    for (let i=0; i<this.joints.length; ++i) {
      this.jointMatrices.push(new Float32Array(this.jointData.buffer, Float32Array.BYTES_PER_ELEMENT * 16 * i, 16));
    }
  }

  prepareTexture(gl) {
    this.jointTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.jointTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  }
  update(gl) {
    for (const index in this.joints) {
      mat4.multiply(this.jointMatrices[index], this.joints[index].matrix, this.inverseBindMatrices[index]);
    }
    gl.bindTexture(gl.TEXTURE_2D, this.jointTexture);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA32F,
      4,
      this.joints.length,
      0,
      gl.RGBA,
      gl.FLOAT,
      this.jointData
    );
  }
}
