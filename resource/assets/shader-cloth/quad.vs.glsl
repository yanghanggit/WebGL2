#version 300 es   

layout(location=0) in vec4 aPosition;

out vec2 vScreenUV;
void main() {
    vScreenUV = aPosition.xy * 0.5 + 0.5;
    gl_Position = aPosition;
}