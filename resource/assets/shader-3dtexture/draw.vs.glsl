 #version 300 es

layout(location=0) in vec4 position;

uniform mat4 uMVP;

out vec3 vUV;
void main() {
    vUV = position.xyz + 0.5;
    gl_Position = uMVP * position;
    gl_PointSize = 2.0;
}