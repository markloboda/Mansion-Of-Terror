
const vertex = vert`#version 300 es
  #pragma vscode_glsllint_stage: vert

  uniform mat4 uModelViewProjection;
  in vec4 position;
  in vec4 aColor;
  out vec4 vColor;

  void main() {
    vColor = aColor;
    gl_Position = uModelViewProjection * position;
  }
`;

const fragment = frag`#version 300 es
  #pragma vscode_glsllint_stage: frag
  precision mediump float;
  
  in vec4 vColor;

  out vec4 oColor;
  void main() {
    oColor = vColor;
  }
`;


export const shaders = {
  cube: {vertex, fragment}
};
