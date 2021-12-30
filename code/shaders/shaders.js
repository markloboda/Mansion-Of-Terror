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

const vertexSkinned = glsl`#version 300 es
#pragma vscode_glslint_stage: vert
layout (location = 0) in vec4 aPosition;
layout (location=2) in vec4 aBoneNdx;
layout (location=3) in vec4 aWeight;

uniform mat4 uMvpMatrix;
uniform mat4 view;
uniform sampler2D boneMatrixTexture;
uniform float numBones;

layout (location = 1) in vec2 aTexCoord;
out vec2 vTexCoord;

// these offsets assume the texture is 4 pixels across
#define ROW0_U ((0.5 + 0.0) / 4.)
#define ROW1_U ((0.5 + 1.0) / 4.)
#define ROW2_U ((0.5 + 2.0) / 4.)
#define ROW3_U ((0.5 + 3.0) / 4.)
 
mat4 getBoneMatrix(float boneNdx) {
  float v = (boneNdx + 0.5) / numBones;
  return mat4(
    texture(boneMatrixTexture, vec2(ROW0_U, v)),
    texture(boneMatrixTexture, vec2(ROW1_U, v)),
    texture(boneMatrixTexture, vec2(ROW2_U, v)),
    texture(boneMatrixTexture, vec2(ROW3_U, v)));
}
 
void main() {
  gl_Position = uMvpMatrix * aPosition; +
                (getBoneMatrix(aBoneNdx[0]) * aPosition * aWeight[0] +
                 getBoneMatrix(aBoneNdx[1]) * aPosition * aWeight[1] +
                 getBoneMatrix(aBoneNdx[2]) * aPosition * aWeight[2] +
                 getBoneMatrix(aBoneNdx[3]) * aPosition * aWeight[3]);
 
}
` 

export const shaders = {
    simple: { vertex, fragment },
    simpleSkinned: { vertex: vertexSkinned, fragment: fragment }
};

