#version 300 es

precision highp float;

uniform sampler2D uColor;
uniform sampler2D uBloom;

out vec4 fragColor;
void main() {
    ivec2 fragCoord = ivec2(gl_FragCoord.xy);
    fragColor = texelFetch(uColor, fragCoord, 0) + texelFetch(uBloom, fragCoord, 0);
}