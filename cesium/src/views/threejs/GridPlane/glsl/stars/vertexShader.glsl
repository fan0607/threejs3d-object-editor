uniform float time;

// 柏林噪声函数（简化版本）
float noise(vec3 point) {
    // 实现噪声逻辑
    // 这里你可以使用一个标准的噪声函数，如柏林噪声
    return fract(sin(dot(point.xyz, vec3(12.9898, 78.233, 45.543))) * 43758.5453);
}

void main() {
    // 使用噪声函数创建随机偏移
    float offset = noise(position + time);
    vec3 animatedPosition = position + vec3(0, offset * 0.2, 0); // 在y轴方向添加偏移

    gl_Position = projectionMatrix * modelViewMatrix * vec4(animatedPosition, 1.0);
}

