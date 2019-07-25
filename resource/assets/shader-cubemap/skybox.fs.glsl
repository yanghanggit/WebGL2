#version 300 es
precision highp float;

layout(std140, column_major) uniform;

uniform samplerCube cubemap;

in vec3 vPosition;
out vec4 fragColor;
void main() {
    vec3 color = texture(cubemap, vPosition).rgb;
    fragColor = vec4(color, 1.0);
}