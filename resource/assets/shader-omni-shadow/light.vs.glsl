#version 300 es

layout(location=0) in vec4 position;

uniform mat4 uMVP;

void main() {
    gl_Position = uMVP * position;
}