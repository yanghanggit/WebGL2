#version 300 es
precision highp float;

layout(std140, column_major) uniform SceneUniforms {
    mat4 viewProj;
    vec4 lightPosition;
};

uniform sampler2D uDiffuse;

in vec3 vPosition;
in vec2 vUV;
in vec3 vNormal;

out vec4 fragColor;
void main() {
    vec3 color = texture(uDiffuse, vUV).rgb;

    vec3 normal = normalize(vNormal);
    vec3 lightVec = -normalize(vPosition - lightPosition.xyz);
    float diffuse = abs(dot(lightVec, normal));
    float ambient = 0.1;
    fragColor = vec4(color * (diffuse + ambient), 1.0);
}