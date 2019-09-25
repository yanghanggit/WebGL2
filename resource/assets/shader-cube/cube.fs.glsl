#version 300 es
precision highp float;

layout(std140, column_major) uniform;

uniform SceneUniforms {
    mat4 viewProj;
    vec4 eyePosition;
    vec4 lightPosition;
};

uniform sampler2D tex;

in vec3 vPosition;
in vec2 vUV;
in vec3 vNormal;

out vec4 fragColor;
void main() {
    vec3 color = texture(tex, vUV).rgb;

    vec3 normal = normalize(vNormal);
    vec3 eyeVec = normalize(eyePosition.xyz - vPosition);
    vec3 incidentVec = normalize(vPosition - lightPosition.xyz);
    vec3 lightVec = -incidentVec;
    float diffuse = max(dot(lightVec, normal), 0.0);
    float highlight = pow(max(dot(eyeVec, reflect(incidentVec, normal)), 0.0), 100.0);
    const float ambient = 0.1;
    fragColor = vec4(color * (diffuse + highlight + ambient), 1.0);
}