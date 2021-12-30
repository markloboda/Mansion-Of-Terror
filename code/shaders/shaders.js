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
layout (location = 2) in vec4 aBoneIndex;
layout (location = 3) in vec4 aWeight;

uniform mat4 uMvpMatrix;
uniform sampler2D boneMatrixTexture;
uniform float numBones;

layout (location = 1) in vec2 aTexCoord;
out vec2 vTexCoord;

// these offsets assume the texture is 4 pixels across
#define ROW0_U ((0.5 + 0.0) / 4.)
#define ROW1_U ((0.5 + 1.0) / 4.)
#define ROW2_U ((0.5 + 2.0) / 4.)
#define ROW3_U ((0.5 + 3.0) / 4.)

mat4 getBoneMatrix(float boneIndex) {
  float v = (boneIndex + 0.5) / numBones;
  return mat4(
    texture(boneMatrixTexture, vec2(ROW0_U, v)),
    texture(boneMatrixTexture, vec2(ROW1_U, v)),
    texture(boneMatrixTexture, vec2(ROW2_U, v)),
    texture(boneMatrixTexture, vec2(ROW3_U, v)));
}
 
void main() {
    mat4 skinMat = getBoneMatrix(aBoneIndex[0]) * aWeight[0] +
                   getBoneMatrix(aBoneIndex[1]) * aWeight[1] +
                   getBoneMatrix(aBoneIndex[2]) * aWeight[2] +
                   getBoneMatrix(aBoneIndex[3]) * aWeight[3];
  gl_Position = uMvpMatrix * skinMat * aPosition;
}
` 
const vertexSkinnedM = glsl`#version 300 es
#pragma vscode_glslint_stage: vert
layout (location = 0) in vec4 aPosition;
layout (location = 2) in vec4 aBoneIndex;
layout (location = 3) in vec4 aWeight;

uniform mat4 uMvpMatrix;
uniform mat4 uBoneMatrix[50];
uniform float numBones;

layout (location = 1) in vec2 aTexCoord;
out vec2 vTexCoord;

 
void main() {
    mat4 skinMat = uBoneMatrix[int(aBoneIndex[0])] * aWeight[0] +
                    uBoneMatrix[int(aBoneIndex[1])] * aWeight[1] +
                    uBoneMatrix[int(aBoneIndex[2])] * aWeight[2] +
                    uBoneMatrix[int(aBoneIndex[3])] * aWeight[3];
  gl_Position = uMvpMatrix * skinMat * aPosition;
}
`

export const shaders = {
    simple: { vertex, fragment },
    simpleSkinned: { vertex: vertexSkinned, fragment: fragment },
    simpleSkinnedM: { vertex: vertexSkinnedM, fragment: fragment }
};

