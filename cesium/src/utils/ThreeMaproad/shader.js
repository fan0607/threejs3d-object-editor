export const blurShader = {
    uniforms: {
        tDiffuse: { value: null },
        uBlurAmount: { value: 0.02 } // 这决定了模糊的大小
    },
    vertexShader: `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform float uBlurAmount;
        varying vec2 vUv;
        
        void main() {
            vec4 color = vec4(0.0);
            vec2 offset;
            int count = 0;
            for(float x = -uBlurAmount; x <= uBlurAmount; x += uBlurAmount) {
                for(float y = -uBlurAmount; y <= uBlurAmount; y += uBlurAmount) {
                    offset = vec2(x, y);
                    color += texture2D(tDiffuse, vUv + offset);
                    count++;
                }
            }
            gl_FragColor = color / float(count);
        }
    `
};
