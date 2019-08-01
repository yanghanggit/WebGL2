#version 300 es

layout(location=0) in uvec4 position;
layout(location=1) in vec2 normal;

uniform mat4 decode;
uniform mat4 model;

out vec3 vNormal;


vec3 octDecode(vec2 oct) {
    vec3 v = vec3(oct.xy, 1.0 - abs(oct.x) - abs(oct.y));
    if (v.z < 0.0) {
        v.xy = (1.0 - abs(v.yx)) * vec2(v.x >= 0.0 ? 1.0 : -1.0, v.y >= 0.0 ? 1.0 : -1.0);
    }
    return normalize(v);
}

void main() {
    vNormal = octDecode(normal);
    gl_Position = model * decode * vec4(position);
}