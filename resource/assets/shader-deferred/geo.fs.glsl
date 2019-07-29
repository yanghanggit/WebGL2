#version 300 es
precision highp float;

in vec4 vPosition;
in vec4 vNormal;
in vec4 vUV;

layout(location=0) out vec4 position;
layout(location=1) out vec4 normal;
layout(location=3) out vec4 uv;
void main() {
    position = vPosition;
    normal = vec4(normalize(vNormal.xyz), 0.0);
    uv = vUV;
}