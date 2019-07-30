#version 300 es
precision highp float;

uniform vec3 uLightPosition;
uniform vec3 uEyePosition;
uniform sampler2D uTextureMap;
uniform samplerCube uShadowMap;

in vec3 vPosition;
in vec3 vNormal;
in vec2 vTexCoord;
in vec4 vPositionFromLight;
in vec3 vModelPosition;

out vec4 fragColor;
void main() {
    vec3 dir = vPosition - uLightPosition;
    float shadow = texture(uShadowMap, dir).r < length(dir) - 0.01 ? 0.0 : 1.0;

    vec4 baseColor = texture(uTextureMap, vTexCoord);

    vec3 normal = normalize(vNormal);

    if (!gl_FrontFacing) {
        normal *= -1.0;
    }

    vec3 eyeDirection = normalize(uEyePosition - vPosition);
    vec3 lightDirection = normalize(uLightPosition - vPosition);
    vec3 reflectionDirection = reflect(-lightDirection, normal);
    float diffuse = shadow * max(dot(lightDirection, normal), 0.0);
    float ambient = 0.2;
    float specular = shadow * pow(max(dot(reflectionDirection, eyeDirection), 0.0), 20.0);

    fragColor = vec4((ambient + diffuse + specular) * baseColor.rgb, baseColor.a);
}