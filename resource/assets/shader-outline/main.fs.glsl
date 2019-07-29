#version 300 es
precision highp float;

layout(std140, column_major) uniform;

uniform SceneUniforms {
    mat4 uViewProj;
    vec4 uEyePosition;
    vec4 uLightPosition;
};

uniform sampler2D uTexture;

in vec4 vPosition;
in vec2 vUV;
in vec4 vNormal;

out vec4 fragColor;
void main() {
    vec3 position = vPosition.xyz;
    vec3 normal = normalize(vNormal.xyz);
    vec2 uv = vUV;

    vec4 baseColor = texture(uTexture, uv);
    vec3 eyeDirection = normalize(uEyePosition.xyz - position);
    vec3 lightVec = uLightPosition.xyz - position;
    vec3 lightDirection = normalize(lightVec);
    vec3 reflectionDirection = reflect(-lightDirection, normal);
    float nDotL = max(dot(lightDirection, normal), 0.0);
    float diffuse = nDotL;
    float ambient = 0.2;
    float specular = pow(max(dot(reflectionDirection, eyeDirection), 0.0), 20.0);

    fragColor = vec4((ambient + diffuse + specular) * baseColor.rgb, 1.0);
}