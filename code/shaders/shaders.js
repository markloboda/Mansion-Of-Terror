const glsl = x => x;

const vertex = glsl`#version 300 es
#pragma vscode_glsllint_stage: vert

layout (location = 0) in vec4 aPosition;
layout (location = 1) in vec2 aTexCoord;

uniform vec4 aColor;
out vec4 vColor;

uniform mat4 uMvpMatrix;

out vec2 vTexCoord;

void main() {
    vTexCoord = aTexCoord;
    vColor = aColor;
    gl_Position = uMvpMatrix * aPosition;
}
`;


const fragment = glsl`#version 300 es
#pragma vscode_glsllint_stage: frag
precision mediump float;

uniform mediump sampler2D uTexture;

in vec2 vTexCoord;
in vec4 vColor;
out vec4 oColor;

void main() {
    oColor = texture(uTexture, vTexCoord) * vColor;
}
`;

export const shaders = {
    simple: { vertex, fragment },
};

