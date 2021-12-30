

export default class SkinRenderer {
  constructor(mesh, armature) {
    this.mesh = mesh;
    this.armature = armature;
  }
  render(gl, mvpMatrix, programs, glObjects) {
    this.armature.update(gl);
    for (const primitive of this.mesh.primitives) {
      const program = programs.simpleSkinned;
      gl.useProgram(program.program);
      const vao = glObjects.get(primitive);

      gl.bindVertexArray(vao);
      gl.uniform1fv(program.uniforms.numBones, [this.armature.jointMatrices.length]);

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.armature.jointTexture);
      gl.uniform1i(program.uniforms.boneMatrixTexture, 0);
      gl.uniformMatrix4fv(program.uniforms.uMvpMatrix, false, mvpMatrix);
      if (primitive.indices) {
        const mode = primitive.mode;
        const count = primitive.indices.count;
        const type = primitive.indices.componentType;
        gl.drawElements(mode, count, type, 0);
    } else {
        const mode = primitive.mode;
        const count = primitive.attributes.POSITION.count;
        gl.drawArrays(mode, 0, count);
    }
    // webglUtils.setBuffersAndAttributes(gl, this.armatureProgramInfo, primitive.bufferInfo);
      // webglUtils.setUniforms(this.armatureProgramInfo, {
      //   u_projection: projection,
      //   u_view: view,
      //   u_world: node.worldMatrix,
      //   u_jointTexture: this.armature.jointTexture,
      //   u_numJoints: this.armature.joints.length,
      // });
      // webglUtils.setUniforms(this.armatureProgramInfo, primitive.material.uniforms);
      // webglUtils.drawBufferInfo(gl, primitive.bufferInfo);
    }
  }
}
