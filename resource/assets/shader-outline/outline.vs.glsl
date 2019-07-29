 #version 300 es

layout(std140, column_major) uniform;

layout(location=0) in vec4 position;
layout(location=3) in mat4 modelMatrix;

uniform SceneUniforms {
    mat4 uViewProj;
    vec4 uEyePosition;
    vec4 uLightPosition;
};       

void main() {
    gl_Position = uViewProj * modelMatrix * (vec4(1.1, 1.1, 1.1, 1.0) * position);
}