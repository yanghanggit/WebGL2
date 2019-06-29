#version 300 es

layout(location=0) in vec4 position;

layout(std140) uniform TriangleUniforms {
    vec4 color;
    vec2 offset;
};

void main() {
    gl_Position = position;
    gl_Position.xy += offset;
}