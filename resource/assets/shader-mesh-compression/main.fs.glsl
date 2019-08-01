 #version 300 es
precision highp float;

in vec3 vNormal;

out vec4 fragColor;
void main() {
    fragColor = vec4(normalize(vNormal) * vec3(1.0, 1.0, -1.0), 1.0);
}