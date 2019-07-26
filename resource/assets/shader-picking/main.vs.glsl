#version 300 es
        
layout(std140, column_major) uniform;

layout(location=0) in vec4 aPosition;
layout(location=1) in vec3 aNormal;
layout(location=2) in vec2 aTexCoord;

uniform FrameUniforms {
    mat4 uMVP;
    mat4 uModelMatrix;
    vec4 uHighlightColor;
};

out vec3 vPosition;
out vec3 vNormal;
out vec2 vTexCoord;
void main() {
    gl_Position = uMVP * aPosition;

    vPosition = vec3(uModelMatrix * aPosition);
    vNormal = vec3(uModelMatrix * vec4(aNormal, 0.0));
    vTexCoord = aTexCoord;
}