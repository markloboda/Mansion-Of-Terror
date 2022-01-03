const glsl = x => x;

const vertex = glsl`#version 300 es
#pragma vscode_glsllint_stage: vert
precision mediump float;

layout (location = 0) in vec4 aPosition;
layout (location = 1) in vec2 aTexCoord;
layout (location = 4) in vec3 aNormal;

uniform vec4 aColor;
out vec4 vColor;

uniform mat4 uViewModel;
uniform mat4 uProjection;

out vec3 vVertexPosition;
out vec3 vNormal;
out vec2 vTexCoord;

void main() {
    vColor = aColor;
    vVertexPosition = (uViewModel * aPosition).xyz;
    vNormal = aNormal;
    vTexCoord = aTexCoord;
    gl_Position = uProjection * vec4(vVertexPosition, 1);
}
`;


const fragment = glsl`#version 300 es
precision mediump float;
#pragma vscode_glsllint_stage: frag

uniform mat4 uViewModel;

uniform mediump sampler2D uTexture;

uniform vec3 uAmbientColor[1];
uniform vec3 uDiffuseColor[1];
uniform vec3 uSpecularColor[1];

uniform float uShininess[1];
uniform vec3 uLightPosition[1];
uniform vec3 uLightAttenuation[1];

in vec3 vVertexPosition;
in vec3 vNormal;
in vec2 vTexCoord;
in vec4 vColor;
out vec4 oColor;

void main() {
    oColor = vColor;

    for (int i = 0; i < 1; i++) {
        vec3 lightPosition = (uViewModel * vec4(uLightPosition[i], 1)).xyz;
        float d = distance(vVertexPosition, lightPosition);
        float attenuation = 1.0 / dot(uLightAttenuation[i], vec3(1, d, d * d));

        vec3 N = (uViewModel * vec4(vNormal, 0)).xyz;
        vec3 L = normalize(lightPosition - vVertexPosition);
        vec3 E = normalize(-vVertexPosition);
        vec3 R = normalize(reflect(-L, N));

        float lambert = max(0.0, dot(L, N));
        float phong = pow(max(0.0, dot(E, R)), uShininess[i]);

        vec3 ambient = uAmbientColor[i];
        vec3 diffuse = uDiffuseColor[i] * lambert;
        vec3 specular = uSpecularColor[i] * phong;

        vec3 light = (ambient + diffuse + specular) * attenuation;

        oColor += texture(uTexture, vTexCoord) * vec4(light, 1);
    }
}`;


const spotlightVert = glsl`#version 300 es
precision mediump float;
precision mediump int;
#pragma vscode_glsllint_stage: vert


layout (location = 0) in vec4 aPosition;
layout (location = 1) in vec2 aTexCoord;
layout (location = 4) in vec3 aNormal;

uniform vec3 uLightPosition[2];
uniform vec3 uCameraPosition;

uniform vec4 aColor;
uniform mat4 uView;
uniform mat4 uModel;
uniform mat4 uProjection;
uniform mat4 uModelInverseTranspose;
uniform int numLights;

out vec3 vNormal;
out vec4 vColor;

out vec3 vSurfaceToLight[2];
out vec3 vSurfaceToCamera;
out vec2 vTexCoord;

void main() {
  // Multiply the position by the matrix.
  gl_Position = uProjection * (uView * uModel * aPosition);

  // orient the normals and pass to the fragment shader
  vNormal = mat3(uModelInverseTranspose) * aNormal;

  // compute the world position of the surfoace
  vec3 surfaceWorldPosition = (uModel * aPosition).xyz;

  // compute the vector of the surface to the light
  // and pass it to the fragment shader
  for (int i=0; i<numLights; i++) {
    vSurfaceToLight[i] = uLightPosition[i] - surfaceWorldPosition;
  }

  // compute the vector of the surface to the view/camera
  // and pass it to the fragment shader
  vSurfaceToCamera = uCameraPosition - surfaceWorldPosition;
  vColor = aColor;
  vTexCoord = aTexCoord;
}
`;

const spotlightFrag = glsl`#version 300 es
precision mediump float;
precision mediump int;
#pragma vscode_glsllint_stage: frag

uniform int numLights;

// Passed in from the vertex shader.
in vec3 vNormal;
in vec3 vSurfaceToLight[2];
in vec3 vSurfaceToCamera;
in vec2 vTexCoord;
in vec4 vColor;

uniform sampler2D uTexture;
uniform vec3 uColor[2];
uniform float uShininess[2];
uniform vec3 uLightDirection[2];
uniform float uInnerLimit[2];          // in dot space
uniform float uOuterLimit[2];          // in dot space

// we need to declare an output for the fragment shader
out vec4 oColor;


void main() {
  // because vNormal is a varying it's interpolated
  // so it will not be a unit vector. Normalizing it
  // will make it a unit vector again
  vec3 normal = normalize(vNormal);
  vec3 surfaceToViewDirection = normalize(vSurfaceToCamera);
  oColor = texture(uTexture, vTexCoord) * vColor;
  for (int i=0; i<numLights; i++) {
    vec3 surfaceToLightDirection = normalize(vSurfaceToLight[i]);
    vec3 halfVector = normalize(surfaceToLightDirection + surfaceToViewDirection);
  
    float dotFromDirection = dot(surfaceToLightDirection,
                                 -uLightDirection[i]);
    float limitRange = uInnerLimit[i] - uOuterLimit[i];
    float inLight = clamp((dotFromDirection - uOuterLimit[i]) / limitRange, 0.0, 1.0);
    float light = inLight * dot(normal, surfaceToLightDirection) + 0.1;
    float specular = inLight * pow(dot(normal, halfVector), uShininess[i]);
    // Lets multiply just the color portion (not the alpha)
    // by the light
    oColor.rgb = (light + specular) * uColor[i];
    oColor *= texture(uTexture, vTexCoord) * vColor;

    // float attenuation = 1.0 / (vSurfaceToCamera*vSurfaceToCamera);
  
  }
}
`;


export const shaders = {
    simple: { vertex, fragment },
    spotlight: { vertex: spotlightVert, fragment: spotlightFrag }
};

