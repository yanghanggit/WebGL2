#version 300 es

precision highp float;

layout(std140, column_major) uniform;

uniform SceneUniforms {
    mat4 uViewProj;
    vec4 uEyePosition;
};

uniform sampler2D tex;
uniform samplerCube cubemap;

in vec3 vPosition;
in vec2 vUV;
in vec3 vNormal;

out vec4 fragColor;
void main() {
    vec3 color = texture(tex, vUV).rgb;
    vec3 normal = normalize(vNormal);
    vec3 viewVec = normalize(vPosition - uEyePosition.xyz);
    color *= texture(cubemap, reflect(viewVec, normal)).rgb;
    fragColor = vec4(color, 1.0);
}