#version 300 es

layout(std140, column_major) uniform;

layout(location=0) in vec4 position;
layout(location=1) in vec2 uv;
layout(location=2) in vec4 normal;
layout(location=3) in mat4 model;

uniform SceneUniforms {
    mat4 viewProj;
    vec4 eyePosition;
    vec4 lightPosition;
};


out vec3 vPosition;
out vec2 vUV;
out vec3 vNormal;

void main() {
    vec4 worldPosition = model * position;
    vPosition = worldPosition.xyz;
    vUV = uv;
    vNormal = (model * vec4(normal.xyz, 0.0)).xyz;
    gl_Position = viewProj * worldPosition;
}