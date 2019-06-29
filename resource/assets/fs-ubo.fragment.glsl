#version 300 es
precision highp float;

layout(std140) uniform TriangleUniforms {
    vec4 color;
    vec2 offset;
};

out vec4 fragColor;
void main() {
    fragColor = color;
}