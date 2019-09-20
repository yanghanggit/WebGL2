#version 300 es   

precision highp float;

#define GRAVITY vec3(0.0, -0.0003, 0.0)
#define WIND vec3(0.0, 0.0, 0.00008)
#define DAMPING 0.99

in vec2 vScreenUV;

uniform sampler2D uPositionBuffer;
uniform sampler2D uNormalBuffer;
uniform sampler2D uOldPositionBuffer;

layout(location=0) out vec3 outPosition;
layout(location=1) out vec3 outOldPosition;

void main() {
    ivec2 dimensions = textureSize(uPositionBuffer, 0);
    ivec2 maxTexelCoord = dimensions - 1;
    ivec2 texelCoord = ivec2(vScreenUV * vec2(dimensions));
    vec3 position = texelFetch(uPositionBuffer, texelCoord, 0).xyz;
    vec3 normal = texelFetch(uNormalBuffer, texelCoord, 0).xyz;
    vec3 oldPosition = texelFetch(uOldPositionBuffer, texelCoord, 0).xyz;
    vec3 temp = position;

    if (texelCoord != ivec2(0, 0) && texelCoord != ivec2(maxTexelCoord.x, 0)) {
        position += (position - oldPosition) * DAMPING + GRAVITY;
        float wDotN = dot(WIND, normal);
        position += abs(wDotN) * sign(wDotN) * normal;
    }

    outPosition = position;
    outOldPosition = temp;
}