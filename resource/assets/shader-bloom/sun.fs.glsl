#version 300 es
precision highp float;

layout(std140) uniform SunUniforms {
    mat4 uMVP;
    vec4 uColor;
};

layout(location=0) out vec4 fragColor;
layout(location=1) out vec4 bloom;    
void main() {
    fragColor = vec4(uColor.rgb, 1.0);
    bloom = vec4(uColor.rgb, 1.0);
}