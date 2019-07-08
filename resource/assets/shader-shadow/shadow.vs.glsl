#version 300 es

layout(location=0) in vec4 aPosition;

uniform mat4 uMVP;
void main() {
    gl_Position = uMVP * aPosition;
}