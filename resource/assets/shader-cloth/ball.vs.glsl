#version 300 es

layout(location=0) in vec3 aPosition;
layout(location=1) in vec3 aNormal;

layout(std140) uniform; 

uniform BallUniforms {
    vec4 position;
    float radius;
} ball;

uniform SceneUniforms {
    mat4 viewProj;
    vec4 lightPosition;
};

out vec3 vPosition;
out vec2 vUV;
out vec3 vNormal;

void main() {
    vPosition = aPosition + ball.position.xyz;
    vUV = vec2(0.0, 0.0);
    vNormal = aNormal;

    gl_Position = viewProj * vec4(vPosition, 1.0);
}