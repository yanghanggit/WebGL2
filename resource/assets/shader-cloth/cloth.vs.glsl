#version 300 es   

layout(location=0) in ivec2 aTexelCoord;
layout(location=1) in vec2 aUV;

uniform sampler2D uPositionBuffer;
uniform sampler2D uNormalBuffer;

layout(std140, column_major) uniform  SceneUniforms {
    mat4 viewProj;
    vec4 lightPosition;
};

out vec3 vPosition;
out vec2 vUV;
out vec3 vNormal;

void main() {
    vec3 position = texelFetch(uPositionBuffer, aTexelCoord, 0).xyz;

    vPosition = position;
    vNormal = texelFetch(uNormalBuffer, aTexelCoord, 0).xyz;
    vUV = aUV;
    gl_PointSize = 4.0;
    gl_Position = viewProj * vec4(position, 1.0);
}