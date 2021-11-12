const vertex = `#version 300 es
  #pragma vscode_glsllint_stage: vert
  in vec4 a_position;

  void main() {
    gl_Position = a_position;
  }
`;

const fragment = `#version 300 es
  #pragma vscode_glsllint_stage: frag
  precision highp float;
  out vec4 outColor;

  void main() {
    outColor = vec4(0, 1, 0, 1);
  }
`;

export const shaders = {
  based: {vertex, fragment} // Based XD
};
