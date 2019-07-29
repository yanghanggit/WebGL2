#version 300 es
        
layout(location=0) in vec4 aPosition;
layout(location=1) in vec2 aUV;
layout(location=2) in vec3 aNormal;
layout(location=3) in mat4 uModel;

layout(std140) uniform SceneUniforms {
    mat4 uViewProj;
    vec4 uEyePosition;
    vec4 uLightPosition;    
};

out vec3 vPosition;
out vec2 vUV;
out vec3 vNormal;
void main() {
    vec4 worldPosition = uModel * aPosition;
    vPosition = worldPosition.xyz;
    vUV = aUV;
    vNormal = (uModel * vec4(aNormal, 0.0)).xyz;
    gl_Position = uViewProj * worldPosition;
}