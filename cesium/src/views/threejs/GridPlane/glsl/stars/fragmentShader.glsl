uniform float time;

void main() {
    // 创建一个基于坐标和时间的随机值
    float starDensity = 0.005;
    float randomness = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453);
    randomness += sin(time * 0.0005) * 0.5;
    
    // 基于随机值和密度决定是否显示星星
    if(randomness > starDensity) {
        discard;
    } else {
        gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0); // 星星的颜色（白色）
    }
}
