#version 300 es
precision highp float;

uniform vec3 uPickColor;

out vec4 fragColor;
void main() {
    fragColor = vec4(uPickColor, 1.0);
}