#version 300 es

precision highp float;

in vec2 vScreenUV;

// uModVal and dir used to select the direction
// to look for the neighbour we're going to check
layout(std140) uniform ConstraintUniforms {
    ivec2 uDir;
    int uModVal;
    float uRestDistance;   
};

uniform sampler2D uPositionBuffer;

out vec3 outPosition;

void main() {
    ivec2 dimensions = textureSize(uPositionBuffer, 0);
    ivec2 texelCoord = ivec2(vScreenUV * vec2(dimensions));
    vec3 position = texelFetch(uPositionBuffer, texelCoord, 0).xyz;

    int iDot = abs(texelCoord.x * uDir.x) + abs(texelCoord.y * uDir.y);
    int neg = iDot % 2 == uModVal ? 1 : -1;

    bool otherPin = false;

    if (texelCoord != ivec2(0, 0) && texelCoord != ivec2(dimensions.x - 1, 0)) {
        ivec2 otherCoord = texelCoord + uDir * neg;

        if (otherCoord == ivec2(0, 0) || otherCoord == ivec2(dimensions.x - 1, 0)) {
            otherPin = true;
        }

        if (all(greaterThanEqual(otherCoord, ivec2(0, 0))) && all(lessThan(otherCoord, dimensions))) {
            vec3 otherPosition = texelFetch(uPositionBuffer, otherCoord, 0).xyz;
            
            vec3 diffVec = otherPosition - position;
            float dist = length(diffVec);
            if (dist > uRestDistance) {
                position += diffVec * (1.0 - uRestDistance / dist) * (otherPin ? 1.0 : 0.5);
            }
        }
    }

    outPosition = position;
}