#version 300 es

layout(std140, column_major) uniform;

layout(location=0) in vec3 position;
layout(location=1) in vec2 uv;
layout(location=2) in vec3 normal;
layout(location=3) in vec3 translation;
layout(location=4) in vec3 axis;
layout(location=5) in float rotation;

uniform SceneUniforms {
    mat4 viewProj;
    vec4 eyePosition;
    vec4 lightPosition;
};


out vec3 vPosition;
out vec2 vUV;
out vec3 vNormal;

void main() {
    float s = sin(rotation);
    float c = cos(rotation);
    float t = 1.0 - c;
    float xt = axis.x * t;
    float yt = axis.y * t;
    float zt = axis.z * t;
    float xs = axis.x * s;
    float ys = axis.y * s;
    float zs = axis.z * s;

    mat3 rotationMat = mat3(
        axis.x * xt + c,
        axis.y * xt + zs,
        axis.z * xt - ys,
        axis.x * yt - zs,
        axis.y * yt + c,
        axis.z * yt + xs,
        axis.x * zt + ys,
        axis.y * zt - xs,
        axis.z * zt + c
    );


    vPosition = rotationMat * position + translation;
    vUV = uv;
    vNormal = rotationMat * normal;
    gl_Position = viewProj * vec4(vPosition, 1.0);
}