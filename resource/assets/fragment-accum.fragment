#version 300 es
precision highp float;

layout(std140, column_major) uniform;

uniform SceneUniforms {
    mat4 uViewProj;
    vec4 uEyePosition;
    vec4 uLightPosition;
};

uniform sampler2D uTexture;

in vec3 vPosition;
in vec2 vUV;
in vec3 vNormal;
flat in vec4 vColor;

layout(location=0) out vec4 accumColor;
layout(location=1) out float accumAlpha;

float weight(float z, float a) {
    return clamp(pow(min(1.0, a * 10.0) + 0.01, 3.0) * 1e8 * pow(1.0 - z * 0.9, 3.0), 1e-2, 3e3);
}

void main() {
    vec3 position = vPosition.xyz;
    vec3 normal = normalize(vNormal.xyz);
    vec2 uv = vUV;

    vec4 baseColor = vColor * texture(uTexture, uv);
    vec3 eyeDirection = normalize(uEyePosition.xyz - position);
    vec3 lightVec = uLightPosition.xyz - position;
    vec3 lightDirection = normalize(lightVec);
    vec3 reflectionDirection = reflect(-lightDirection, normal);
    float nDotL = max(dot(lightDirection, normal), 0.0);
    float diffuse = nDotL;
    float ambient = 0.2;
    float specular = pow(max(dot(reflectionDirection, eyeDirection), 0.0), 20.0);

    vec4 color = vec4((ambient + diffuse + specular) * baseColor.rgb, vColor.a);
    color.rgb *= color.a;
    float w = weight(gl_FragCoord.z, color.a);
    accumColor = vec4(color.rgb * w, color.a);
    accumAlpha = color.a * w;
}