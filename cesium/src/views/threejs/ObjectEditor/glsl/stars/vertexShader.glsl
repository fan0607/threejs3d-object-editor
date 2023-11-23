uniform float time;

float noise(vec3 point) {

    return fract(sin(dot(point.xyz, vec3(12.9898, 78.233, 45.543))) * 43758.5453);
}

void main() {
    float offset = noise(position + time);
    vec3 animatedPosition = position + vec3(0, offset * 0.2, 0); // 在y轴方向添加偏移

    gl_Position = projectionMatrix * modelViewMatrix * vec4(animatedPosition, 1.0);
}

