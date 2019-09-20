#version 300 es

precision highp float;

in vec2 vScreenUV;

layout(std140) uniform BallUniforms {
    vec4 position;
    float radius;
} ball;

uniform sampler2D uPositionBuffer;

out vec3 outPosition;

void main() {
    vec2 dimensions = vec2(textureSize(uPositionBuffer, 0));
    ivec2 texelCoord = ivec2(vScreenUV * dimensions);
    vec3 position = texelFetch(uPositionBuffer, texelCoord, 0).xyz;

    vec3 diff = position - ball.position.xyz;
    float dist = length(diff);
    if (dist < ball.radius + 0.01) {
        position += (ball.radius + 0.01 - dist) * normalize(diff);
    }

    outPosition = position;
}