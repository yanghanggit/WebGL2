#version 300 es
precision highp float;

layout(std140, column_major) uniform;

uniform SceneUniforms {
    mat4 uViewProj;
    vec4 uEyePosition;
};

uniform samplerCube renderCubemap;
uniform samplerCube skyCubemap;

in vec3 vPosition;
in vec3 vNormal;

in vec3 vModelPosition;

out vec4 fragColor;

void main() {
    vec3 normal = normalize(vNormal);
    vec3 viewVec = normalize(vPosition - uEyePosition.xyz);
    vec3 dir = reflect(viewVec, normal);
    vec3 color1 = texture(renderCubemap, dir).rgb;
    vec3 color2 = texture(skyCubemap, dir).rgb;
    fragColor = vec4(color1 * color2, 1.0);
}