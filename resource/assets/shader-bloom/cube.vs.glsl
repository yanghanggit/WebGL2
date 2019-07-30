#version 300 es

layout(location=0) in vec4 position;
layout(location=1) in vec2 uv;
layout(location=2) in vec4 normal;

layout(std140) uniform SceneUniforms {
    uniform vec4 eyePosition;
    uniform mat4 uViewProj;
    uniform vec4 lightPosition;
    uniform vec4 lightColor;
    uniform vec4 lightPosition2;
    uniform vec4 lightColor2;
};

uniform mat4 uModel;

out vec3 vPosition;
out vec2 vUV;
out vec3 vNormal;
void main() {
    vec4 worldPosition = uModel * position;
    vPosition = worldPosition.xyz;
    vUV = uv;
    vNormal = (uModel * normal).xyz;
    gl_Position = uViewProj * worldPosition;
}