#version 300 es
precision highp float;

in vec4 vColor;
in vec4 vColorMask;

out vec4 fragColor;

void main() {
    fragColor = vColor * vColorMask;
}