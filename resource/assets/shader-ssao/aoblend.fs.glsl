#version 300 es
precision highp float;

uniform sampler2D uColorBuffer;
uniform sampler2D uOcclusionBuffer;

out vec4 color;
void main() {
    ivec2 fragCoord = ivec2(gl_FragCoord.xy);
    color = vec4(clamp(texelFetch(uColorBuffer, fragCoord, 0).rgb - texelFetch(uOcclusionBuffer, fragCoord, 0).r, 0.0, 1.0), 1.0);
}