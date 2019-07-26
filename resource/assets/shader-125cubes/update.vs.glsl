#version 300 es

#define ROTATION_SPEED 0.04

layout(location=0) in float rotation;

out float vRotation;

void main() {
    vRotation = rotation + ROTATION_SPEED;
}