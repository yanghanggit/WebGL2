#version 300 es
        
layout(location=0) in vec4 position;
layout(location=1) in vec2 offset;
layout(location=2) in vec4 color;

out vec4 vColor;
void main() {
    vColor = color;
    gl_Position = position;
    gl_Position.xy += offset;
}