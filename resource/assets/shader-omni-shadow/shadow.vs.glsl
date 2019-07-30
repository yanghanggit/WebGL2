#version 300 es

layout(location=0) in vec4 aPosition;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjection;

out vec4 vViewPos;
void main() {
    vViewPos = uViewMatrix * uModelMatrix * aPosition;
    gl_Position = uProjection * vViewPos;
}