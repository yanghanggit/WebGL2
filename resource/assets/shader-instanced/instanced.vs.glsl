#version 300 es
        
layout(location=0) in vec4 position;
layout(location=1) in vec2 offset;
layout(location=2) in vec4 color;
layout(location=3) in vec4 colorMask;

out vec4 vColor;
out vec4 vColorMask;

void main() {

    vColor = color;
    vColorMask = colorMask;

    gl_Position = position;
    gl_Position.xy += offset;
}