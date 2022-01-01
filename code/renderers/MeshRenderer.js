import { mat4, vec3 } from "../../lib/gl-matrix-module.js";

export default class MeshRenderer {
  constructor(mesh) {
    this.mesh = mesh;
  }
  render(gl, model, view, projection, programs, glObjects, lights) {
    gl.useProgram(programs.simple.program);
    const program = programs.simple;
    for (const primitive of this.mesh.primitives) {
      const vao = glObjects.get(primitive);

      const material = primitive.material;
      const texture = material.baseColorTexture;
      const glTexture = glObjects.get(texture.image || texture.data);
      const glSampler = glObjects.get(texture.sampler);
      // mesh related
      gl.bindVertexArray(vao);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, glTexture);
      gl.bindSampler(0, glSampler);
      gl.uniform4fv(program.uniforms.aColor, material.baseColorFactor)
      const uViewModel = mat4.create();
      mat4.multiply(uViewModel, view, model);
      gl.uniformMatrix4fv(program.uniforms.uViewModel, false, uViewModel);
      gl.uniformMatrix4fv(program.uniforms.uProjection, false, projection);

      // lights
      for (const [index, light] of lights.entries()) {
        const spotlight = light.children[0].light;
        let color = vec3.clone(spotlight.ambientColor)
        vec3.scale(color, color, 1.0 / 255.0);
        gl.uniform3fv(program.uniforms['uAmbientColor[' + index + ']'], color);
        color = vec3.clone(spotlight.diffuseColor)
        vec3.scale(color, color, 1.0 / 255.0);
        gl.uniform3fv(program.uniforms['uDiffuseColor[' + index + ']'], color);
        color = vec3.clone(spotlight.specularColor)
        vec3.scale(color, color, 1.0 / 255.0);
        gl.uniform3fv(program.uniforms['uSpecularColor[' + index + ']'], color);
        let position = light.translation;
        gl.uniform3fv(program.uniforms['uLightPosition[' + index + ']'], position);
        gl.uniform1f(program.uniforms['uShininess[' + index + ']'], light.children[0].light.shininess);
        gl.uniform3fv(program.uniforms['uLightAttenuation[' + index + ']'], light.children[0].light.attenuation);
      }

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
    }
  }
}
