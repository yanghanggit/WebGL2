 #version 300 es
        
layout(std140, column_major) uniform;

layout(location=0) in vec4 position;
layout(location=1) in vec2 uv;

uniform SceneUniforms {
    mat4 uViewProj;
};

out vec3 vPosition;

void main() {

    vec4 worldPosition = vec4(position.xyz * 5.0, 1.0);            
    vPosition = position.xyz;
    gl_Position = uViewProj * worldPosition;
    
}