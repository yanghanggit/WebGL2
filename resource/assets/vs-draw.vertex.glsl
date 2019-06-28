#version 300 es

#define OFFSET_LOCATION 0
#define ROTATION_LOCATION 1
#define POSITION_LOCATION 2
#define COLOR_LOCATION 3

layout(location=0) in vec2 aPosition;
layout(location=1) in vec3 aColor;
layout(location=2) in vec2 aOffset;
layout(location=3) in float aRotation;

flat out vec3 vColor;

void main() {
    vColor = aColor;

    float cosR = cos(aRotation);
    float sinR = sin(aRotation);
    mat2 rot = mat2(
        cosR, sinR,
        -sinR, cosR
    );
    gl_Position = vec4(rot * aPosition + aOffset, 0.0, 1.0);
}