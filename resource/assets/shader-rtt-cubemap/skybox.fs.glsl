#version 300 es
precision highp float;

layout(std140, column_major) uniform;


uniform SceneUniforms {
    mat4 uViewProj;
    vec4 uEyePosition;
    bool useDebugColor;
};

uniform samplerCube renderCubemap;
uniform samplerCube skyCubemap;

in vec3 vPosition;
in vec2 vUV;

out vec4 fragColor;
void main() {
    vec3 debugColor;
    vec3 mags = abs(vPosition);
    if (mags.x > mags.y && mags.x > mags.z) {
        debugColor = vPosition.x > 0.0 ? vec3(0.2, 0.0, 0.0) : vec3(0.0, 0.2, 0.0); 
    } else if (mags.y > mags.x && mags.y > mags.z) { 
        debugColor = vPosition.y > 0.0 ? vec3(0.0, 0.0, 0.2) : vec3(0.2, 0.2, 0.0); 
    } else {
        debugColor = vPosition.z > 0.0 ? vec3(0.0, 0.2, 0.2) : vec3(0.2, 0.0, 0.2); 
    }
    vec3 color = texture(renderCubemap, vPosition).rgb * texture(skyCubemap, vPosition).rgb;
    fragColor = useDebugColor ? vec4(color * debugColor, 1.0) : vec4(color, 1.0);
}