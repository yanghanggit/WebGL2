#version 300 es
precision highp float;
precision lowp sampler3D;

in vec3 vUV;

uniform sampler3D tex;
uniform float uTime;

out vec4 fragColor;
void main() {
    float alpha = texture(tex, vUV + vec3(0.0, 0.0, uTime)).r * 0.03;
    fragColor = vec4(fract(vUV) * alpha, alpha);
}