#version 300 es

#define M_2PI 6.28318530718

// We simulate the wandering of agents using transform feedback in this vertex shader
// The simulation goes like this: 
// Assume there's a circle in front of the agent whose radius is WANDER_CIRCLE_R
// the origin of which has a offset to the agent's pivot point, which is WANDER_CIRCLE_OFFSET
// Each frame we pick a random point on this circle
// And the agent moves MOVE_DELTA toward this target point
// We also record the rotation facing this target point, so it will be the base rotation
// for our next frame, which means the WANDER_CIRCLE_OFFSET vector will be on this direction
// Thus we fake a smooth wandering behavior

#define MAP_HALF_LENGTH 1.01
#define WANDER_CIRCLE_R 0.01
#define WANDER_CIRCLE_OFFSET 0.04
#define MOVE_DELTA 0.001

layout(location=0) in vec2 aOffset;
layout(location=1) in float aRotation;

out vec2 vOffset;
out float vRotation;

float rand(vec2 co) {
    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

void main() {
    float theta = M_2PI * rand(vec2(aRotation * aOffset.x / aOffset.y, aRotation + aOffset.x + aOffset.y));
    
    float cosR = cos(aRotation);
    float sinR = sin(aRotation);
    mat2 rot = mat2(
        cosR, sinR,
        -sinR, cosR
    );
    
    vec2 p = WANDER_CIRCLE_R * vec2(cos(theta), sin(theta)) + vec2(WANDER_CIRCLE_OFFSET, 0.0);
    vec2 move = normalize(rot * p);
    vRotation = atan(move.y, move.x);

    vOffset = aOffset + MOVE_DELTA * move;

    // wrapping at edges
    vOffset = vec2 ( 
        vOffset.x > MAP_HALF_LENGTH ? - MAP_HALF_LENGTH : ( vOffset.x < - MAP_HALF_LENGTH ? MAP_HALF_LENGTH : vOffset.x ) , 
        vOffset.y > MAP_HALF_LENGTH ? - MAP_HALF_LENGTH : ( vOffset.y < - MAP_HALF_LENGTH ? MAP_HALF_LENGTH : vOffset.y )
    );
}