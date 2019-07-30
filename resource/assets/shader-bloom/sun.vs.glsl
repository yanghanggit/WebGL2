 #version 300 es

layout(location=0) in vec4 position;

layout(std140) uniform SunUniforms {
    mat4 uMVP;
    vec4 uColor;
};

void main() {
    gl_Position = uMVP * position;
}