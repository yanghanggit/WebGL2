  #version 300 es
        
layout(location=0) in vec4 aPosition;
layout(location=1) in vec3 aNormal;
layout(location=2) in vec4 aUV;

layout(std140) uniform BoxUniforms {
    mat4 uMVP;
    mat4 uModelMatrix;
};

out vec4 vPosition;
out vec4 vNormal;
out vec4 vUV;
void main() {
    vPosition = uModelMatrix * aPosition;
    vNormal = uModelMatrix * vec4(aNormal, 0.0);
    vUV = aUV;
    gl_Position = uMVP * aPosition;
}