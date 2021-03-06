#version 300 es
precision highp float;
precision lowp sampler3D;

in vec3 vUV;

uniform sampler3D tex;
uniform float uTime;

out vec4 fragColor;
void main() {
    fragColor = texture(tex, vUV + vec3(0.0, 0.0, uTime));
    // fragColor = texture(tex, vUV + vec3(uTime, 0.0, 0.0));
    // fragColor = texture(tex, vUV + vec3(0.0, uTime, 0.0));
    fragColor.rgb *= fragColor.a;
}