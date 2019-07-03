#version 300 es
precision highp float;
precision highp sampler2DShadow;

uniform vec3 uLightPosition;
uniform vec3 uEyePosition;
uniform sampler2D uTextureMap;
uniform sampler2DShadow uShadowMap;

in vec3 vPosition;
in vec3 vNormal;
in vec2 vTexCoord;
in vec4 vPositionFromLight;
in vec3 vModelPosition;

out vec4 fragColor;
void main() {
    vec3 shadowCoord = (vPositionFromLight.xyz / vPositionFromLight.w) / 2.0 + 0.5;
    shadowCoord.z -= 0.01;
    float shadow = texture(uShadowMap, shadowCoord);

    vec4 baseColor = texture(uTextureMap, vTexCoord);

    vec3 normal = normalize(vNormal);
    vec3 eyeDirection = normalize(uEyePosition - vPosition);
    vec3 lightDirection = normalize(uLightPosition - vPosition);
    vec3 reflectionDirection = reflect(-lightDirection, normal);
    float diffuse = shadow * max(dot(lightDirection, normal), 0.0) * 0.7;
    float ambient = 0.2;
    float specular = shadow * pow(max(dot(reflectionDirection, eyeDirection), 0.0), 20.0) * 0.7;

    fragColor = vec4((ambient + diffuse + specular) * baseColor.rgb, baseColor.a);
}