#version 300 es

precision highp float;

in vec2 vScreenUV;

uniform sampler2D uPositionBuffer;

out vec3 outNormal;

void main() {
    ivec2 dimensions = textureSize(uPositionBuffer, 0);
    ivec2 texelCoord = ivec2(vScreenUV * vec2(dimensions));
    vec3 position = texelFetch(uPositionBuffer, texelCoord, 0).xyz;

    vec3 normal = vec3(0.0);

    if (texelCoord.x > 0) {
        vec3 left = texelFetch(uPositionBuffer, texelCoord - ivec2(1, 0), 0).xyz;

        if (texelCoord.y > 0) {
            vec3 down = texelFetch(uPositionBuffer, texelCoord - ivec2(0, 1), 0).xyz;
            normal += normalize(cross(left - position, down - position));
        }

        if (texelCoord.y < dimensions.y - 1) {
            vec3 up = texelFetch(uPositionBuffer, texelCoord + ivec2(0, 1), 0).xyz;
            normal += normalize(cross(up - position, left - position));
        }
    }

    if (texelCoord.x < dimensions.x - 1) {
        vec3 right = texelFetch(uPositionBuffer, texelCoord + ivec2(1, 0), 0).xyz;

        if (texelCoord.y > 0) {
            vec3 down = texelFetch(uPositionBuffer, texelCoord - ivec2(0, 1), 0).xyz;
            normal += normalize(cross(down - position, right - position));
        }

        if (texelCoord.y < dimensions.y - 1) {
            vec3 up = texelFetch(uPositionBuffer, texelCoord + ivec2(0, 1), 0).xyz;
            normal += normalize(cross(right - position, up - position));
        }
    }

    outNormal = normalize(normal);
}