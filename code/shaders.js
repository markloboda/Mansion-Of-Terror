const glsl = x => x;

const vertex = glsl`#version 300 es
#pragma vscode_glsllint_stage: vert

layout (location = 0) in vec4 aPosition;
layout (location = 1) in vec2 aTexCoord;

uniform mat4 uMvpMatrix;

out vec2 vTexCoord;

void main() {
    vTexCoord = aTexCoord;
    gl_Position = uMvpMatrix * aPosition;
}
`;

const vertexColor = glsl`#version 300 es
#pragma vscode_glsllint_stage: vert

in vec4 aPosition;
in vec4 aColor;

uniform mat4 uMvpMatrix;

out vec4 vColor;

void main() {
    gl_Position = uMvpMatrix * aPosition;
    vColor = vec4(1) - aColor;
    vColor.a = 1.0;
}
`;

const fragment = glsl`#version 300 es
#pragma vscode_glsllint_stage: frag
precision mediump float;

uniform mediump sampler2D uTexture;

in vec2 vTexCoord;

out vec4 oColor;

void main() {
    oColor = texture(uTexture, vTexCoord);
}
`;


const fragmentColor = glsl`#version 300 es
#pragma vscode_glsllint_stage: frag
precision mediump float;
in vec4 vColor;

out vec4 oColor;

void main() {
    oColor = vColor;
}
`;




export const shaders = {
    simple: { vertex, fragment },
    simpleColor: { vertex: vertexColor, fragment: fragmentColor }
};

