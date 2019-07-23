 #version 300 es
        
layout(std140, column_major) uniform;

layout(location=0) in vec4 position;
layout(location=1) in vec2 uv;

uniform SceneUniforms {
    mat4 uViewProj;
    vec4 uEyePosition;
    bool useDebugColor;
};

out vec3 vPosition;
out vec2 vUV;
void main() {
    vec4 worldPosition = vec4(position.xyz * 5.0, 1.0);            
    vPosition = position.xyz;
    vUV  = uv;
    gl_Position = uViewProj * worldPosition;
}