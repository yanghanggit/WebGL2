#version 300 es

layout(std140, column_major) uniform;

layout(location=0) in vec4 position;
layout(location=1) in vec2 uv;
layout(location=2) in vec3 normal;
layout(location=3) in uint textureIndex;
layout(location=4) in mat4 modelMatrix;

uniform SceneUniforms {
    mat4 viewProj;
    vec4 eyePosition;
    vec4 lightPosition;
};

out vec3 vPosition;
out vec2 vUV;
out vec3 vNormal;
flat out uint vTextureIndex;

void main() {
    vec4 worldPosition = modelMatrix * position;
    vPosition = worldPosition.xyz;
    vUV = vec2(uv.x, 1.0 - uv.y);
    vNormal = (modelMatrix * vec4(normal, 0.0)).xyz;
    vTextureIndex = textureIndex;
    gl_Position = viewProj * worldPosition;
}