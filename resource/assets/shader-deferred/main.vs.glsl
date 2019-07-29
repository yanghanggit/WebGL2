#version 300 es
        
layout(location=0) in vec4 aPosition;

layout(std140) uniform LightUniforms {
    mat4 uMVP;
    vec4 uLightPosition;
    vec4 uLightColor;
};

void main() {
    gl_Position = uMVP * aPosition;
}