import { Application } from "../../common/engine/Application.js";
import { WebGL } from "../../common/engine/WebGL.js";
import { shaders } from "./shaders.js";

class App extends Application {
  start() {
    const gl = this.gl;
    this.programs = WebGL.buildPrograms(this.gl, shaders);
    this.primitiveTypes = {
      Points: gl.POINTS,
      Lines: gl.LINES,
      LineStrip: gl.LINE_STRIP,
      LineLoop: gl.LINE_LOOP,
      Triangles: gl.TRIANGLES,
      TriangleStrip: gl.TRIANGLE_STRIP,
      TriangleFan: gl.TRIANGLE_FAN,
    };
    const program = this.programs.based;
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    const positions = [
      0, 0, 
      0, 0.5, 
      0.7, 0
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
  }
  render() {
    const gl = this.gl;
    const program = this.programs.based;
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    gl.enableVertexAttribArray(program.attributes.a_location);
    gl.vertexAttribPointer(
      program.attributes.a_location, 2, gl.FLOAT, false, 0, 0
    );

    gl.clearColor(1, 1, 1, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(program.program);

    gl.drawArrays(this.primitiveTypes.Triangles, 0, 3);
  }
}
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.querySelector('canvas');
  const app = new App(canvas);
});
