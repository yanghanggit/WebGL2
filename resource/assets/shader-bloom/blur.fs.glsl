#version 300 es

precision highp float;

uniform ivec2 uTexelOffset;
uniform sampler2D uTexture;

out vec4 fragColor;
void main() {
    ivec2 resolution = textureSize(uTexture, 0);

    float blurWeights[5];
    blurWeights[0] = 0.227027;
    blurWeights[1] = 0.1945946;
    blurWeights[2] = 0.1216216;
    blurWeights[3] = 0.054054;
    blurWeights[4] = 0.016216;

    ivec2 fragCoord = ivec2(gl_FragCoord.xy);
    
    vec3 color = vec3(0.0);
    for (int i = 0; i < 5; ++i) {
        ivec2 lowSampleCoord = clamp(fragCoord - uTexelOffset * i, ivec2(0), resolution);
        ivec2 highSampleCoord = clamp(fragCoord + uTexelOffset * i, ivec2(0), resolution);
        color += texelFetch(uTexture, lowSampleCoord, 0).rgb * blurWeights[i];
        color += texelFetch(uTexture, highSampleCoord, 0).rgb * blurWeights[i];
    }

    fragColor = vec4(color, 1.0);
}