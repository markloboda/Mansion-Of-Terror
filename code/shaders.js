const vertex = `#version 300 es

layout (location = 0) in vec4 aPosition;
layout (location = 1) in vec2 aTexCoord;

uniform mat4 uMvpMatrix;

out vec2 vTexCoord;

void main() {
    vTexCoord = aTexCoord;
    gl_Position = uMvpMatrix * aPosition;
}
`;

const vertexColor = `#version 300 es

in vec4 aPosition;
in vec4 aColor;

uniform mat4 uMvpMatrix;

out vec4 vColor;

void main() {
    gl_Position = uMvpMatrix * aPosition;
    vColor = aColor;
}
`;

const fragment = `#version 300 es
precision mediump float;

uniform mediump sampler2D uTexture;

in vec2 vTexCoord;

out vec4 oColor;

void main() {
    oColor = texture(uTexture, vTexCoord);
}
`;


const fragmentColor = `#version 300 es
precision mediump float;
in vec4 vColor

out vec4 oColor;

void main() {
    oColor = vColor;
}
`;




export const shaders = {
    simple: { vertex, fragment },
    simpleColor: { vertexColor, fragmentColor }
};

