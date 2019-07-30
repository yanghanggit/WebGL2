#version 300 es
precision highp float;

in vec4 vViewPos;

out float lightDistance;
void main() {
    lightDistance = length(vViewPos.xyz);
}