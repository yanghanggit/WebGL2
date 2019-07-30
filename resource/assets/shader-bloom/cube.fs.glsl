#version 300 es
precision highp float;

layout(std140) uniform SceneUniforms {
    uniform vec4 eyePosition;
    uniform mat4 uViewProj;
    uniform vec4 lightPosition;
    uniform vec4 lightColor;
    uniform vec4 lightPosition2;
    uniform vec4 lightColor2;
};

uniform sampler2D tex;

in vec3 vPosition;
in vec2 vUV;
in vec3 vNormal;

layout(location=0) out vec4 fragColor;
layout(location=1) out vec4 bloom;
void main() {
    vec3 color = texture(tex, vUV).rgb;

    vec3 normal = normalize(vNormal);
    vec3 eyeVec = normalize(eyePosition.xyz - vPosition);
    vec3 incidentVec = normalize(vPosition - lightPosition.xyz);
    vec3 lightVec = -incidentVec;
    float diffuse = max(dot(lightVec, normal), 0.0);
    float highlight = pow(max(dot(eyeVec, reflect(incidentVec, normal)), 0.0), 100.0);
    vec3 light = lightColor.rgb * (diffuse + highlight);

    incidentVec = normalize(vPosition - lightPosition2.xyz);
    lightVec = -incidentVec;
    diffuse = max(dot(lightVec, normal), 0.0);
    highlight = pow(max(dot(eyeVec, reflect(incidentVec, normal)), 0.0), 100.0);
    light += lightColor2.rgb * (diffuse + highlight);
    light += 0.1;

    fragColor = vec4(color * light, 1.0);
    if (dot(fragColor.rgb, vec3(0.2126, 0.7152, 0.0722)) > 1.0) {
        bloom = fragColor;
    }
}