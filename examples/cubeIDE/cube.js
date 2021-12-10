import { Application } from "../../common/engine/Application.js";
import { shaders } from "./shaders.js";
import { WebGL } from "../../common/engine/WebGL.js";
import { mat4 } from "../../lib/gl-matrix-min.js";


class App extends Application {

  start() {
    const gl = this.gl;
    const program = WebGL.buildPrograms(gl, shaders);
  }

}
