#version 300 es

layout(location=0) in vec4 position;
layout(location=1) in vec3 normal;

uniform mat4 model;

out vec3 vNormal;

void main() {
    vNormal = normal;
    gl_Position = model * position;
}