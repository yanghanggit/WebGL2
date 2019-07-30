#version 300 es

layout(location=0) in vec4 aPosition;
layout(location=1) in vec3 aNormal;
layout(location=2) in vec2 aTexCoord;

uniform mat4 uModelMatrix;
uniform mat4 uMVP;

out vec3 vPosition;
out vec3 vNormal;
out vec2 vTexCoord;
out vec3 vModelPosition;
void main() {
    gl_Position = uMVP * aPosition;

    vModelPosition = vec3(aPosition);
    vPosition = vec3(uModelMatrix * aPosition);
    vNormal = vec3(uModelMatrix * vec4(aNormal, 0.0));
    vTexCoord = aTexCoord;
}