import { mat4 } from "../../lib/gl-matrix-module.js";

export class Armature {
  constructor(jointMatrices, inverseBindMatrices) {
    this.inverseBindMatrices = inverseBindMatrices;
    this.jointMatrices = jointMatrices;
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
    for (const [index, jointMatrix] of this.jointMatrices.entries()) {
      mat4.mul(this.inverseBindMatrices[index], this.inverseBindMatrices[index], jointMatrix);
    }
    gl.bindTexture(gl.TEXTURE_2D, this.jointTexture);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      4,
      this.jointMatrices.length,
      0,
      gl.RGBA,
      gl.FLOAT,
      this.inverseBindMatrices
    );
    // console.log(this.jointMatrices[5])
    // const globalWorldInverse = m4.inverse(node.worldMatrix);
    // // go through each joint and get its current worldMatrix
    // // apply the inverse bind matrices and store the
    // // entire result in the texture
    // for (let j = 0; j < this.joints.length; ++j) {
    //   const joint = this.joints[j];
    //   const dst = this.jointMatrices[j];
    //   m4.multiply(globalWorldInverse, joint.worldMatrix, dst);
    //   m4.multiply(dst, this.inverseBindMatrices[j], dst);
    // }
    // gl.bindTexture(gl.TEXTURE_2D, this.jointTexture);
    // gl.texImage2D(
    //   gl.TEXTURE_2D,
    //   0,
    //   gl.RGBA,
    //   4,
    //   this.joints.length,
    //   0,
    //   gl.RGBA,
    //   gl.FLOAT,
    //   this.jointData
    // );
  }
}
