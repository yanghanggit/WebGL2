#version 300 es
precision highp float;

layout(std140, column_major) uniform;

uniform SceneUniforms {
    vec4 uLightPosition;
    vec4 uEyePosition;
};

uniform FrameUniforms {
    mat4 uMVP;
    mat4 uModelMatrix;
    vec4 uHighlightColor;
};

uniform sampler2D uTextureMap;

in vec3 vPosition;
in vec3 vNormal;
in vec2 vTexCoord;

out vec4 fragColor;
void main() {
    vec4 baseColor = texture(uTextureMap, vTexCoord);

    vec3 normal = normalize(vNormal);
    vec3 eyeDirection = normalize(uEyePosition.xyz - vPosition);
    vec3 lightDirection = normalize(uLightPosition.xyz - vPosition);
    vec3 reflectionDirection = reflect(-lightDirection, normal);
    float nDotL = max(dot(lightDirection, normal), 0.0);
    float diffuse = nDotL;
    float ambient = 0.1;
    float specular = pow(max(dot(reflectionDirection, eyeDirection), 0.0), 20.0);

    fragColor = vec4(uHighlightColor.rgb * (ambient + diffuse + specular) * baseColor.rgb, baseColor.a);
}