#version 300 es

precision highp float;

layout(std140, column_major) uniform;

uniform SceneUniforms {
    mat4 uViewProj;
    vec4 uEyePosition;
    //bool useDebugColor;
};

uniform samplerCube skyCubemap;

in vec3 vPosition;
in vec2 vUV;

out vec4 fragColor;

void main() {
    vec3 color = texture(skyCubemap, vPosition).rgb;
    fragColor = vec4(color, 1.0);
}