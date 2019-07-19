#version 300 es
precision highp float;

layout(std140, column_major) uniform;

uniform SceneUniforms {
    mat4 uViewProj;
    vec4 uEyePosition;
};

uniform sampler2D tex;

in vec2 vUV;

layout(location=0) out vec4 fragColor;
layout(location=1) out vec4 fragColor1;
layout(location=2) out vec4 fragColor2;
layout(location=3) out vec4 fragColor3;
layout(location=4) out vec4 fragColor4;
layout(location=5) out vec4 fragColor5;

void main() {
    fragColor = vec4(texture(tex, vUV).rgb, 1.0);
    fragColor1 = fragColor;
    fragColor2 = fragColor;
    fragColor3 = fragColor;
    fragColor4 = fragColor;
    fragColor5 = fragColor;
}