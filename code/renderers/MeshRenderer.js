import { mat4, vec3 } from "../../lib/gl-matrix-module.js";

export default class MeshRenderer {
  constructor(mesh) {
    this.mesh = mesh;
  }
  render(gl, model, view, projection, programs, glObjects, lights) {
    const program = programs.spotlight;
    gl.useProgram(program.program);
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
      // gl.uniformMatrix4fv(program.uniforms.uViewModel, false, uViewModel);
      gl.uniformMatrix4fv(program.uniforms.uView, false, view);
      gl.uniformMatrix4fv(program.uniforms.uModel, false, model);
      gl.uniformMatrix4fv(program.uniforms.uProjection, false, projection);

      const modelInverse = mat4.clone(model);
      mat4.invert(modelInverse, modelInverse);

      gl.uniformMatrix4fv(program.uniforms.uModelInverseTranspose, true, modelInverse);
      
      const lightNode = lights[0];
      const light = lightNode.children[0].light;
      const cameraMat = mat4.clone(view);
      const cameraPos = mat4.getTranslation(vec3.create(), mat4.invert(cameraMat, cameraMat));
      gl.uniform3fv(program.uniforms.uLightPosition, lightNode.translation);
      gl.uniform3fv(program.uniforms.uCameraPosition, cameraPos);
      gl.uniform1fv(program.uniforms.uShininess, [light.intensity]);
      gl.uniform3fv(program.uniforms.uLightDirection, vec3.transformQuat(vec3.create(), [0, -1, 0], lightNode.children[0].rotation));
      gl.uniform1fv(program.uniforms.uInnerLimit, [light.spot.innerConeAngle])
      gl.uniform1fv(program.uniforms.uOuterLimit, [light.spot.outerConeAngle])
      gl.uniform4fv(program.uniforms.uColor, [...light.color, 1]);

      // light
      // for (const [index, node] of lights.entries()) {
      //   const light = node.children[0].light;
      //   let color = vec3.clone(light.ambientColor)
      //   vec3.scale(color, color, 1.0 / 255.0);
      //   gl.uniform3fv(program.uniforms['uAmbientColor[' + index + ']'], color);
      //   color = vec3.clone(light.diffuseColor)
      //   vec3.scale(color, color, 1.0 / 255.0);
      //   gl.uniform3fv(program.uniforms['uDiffuseColor[' + index + ']'], color);
      //   color = vec3.clone(light.specularColor)
      //   vec3.scale(color, color, 1.0 / 255.0);
      //   gl.uniform3fv(program.uniforms['uSpecularColor[' + index + ']'], color);
      //   let position = node.translation;
      //   gl.uniform3fv(program.uniforms['uLightPosition[' + index + ']'], position);
      //   gl.uniform1f(program.uniforms['uShininess[' + index + ']'], node.children[0].node.shininess);
      //   gl.uniform3fv(program.uniforms['uLightAttenuation[' + index + ']'], node.children[0].node.attenuation);
      // }

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
