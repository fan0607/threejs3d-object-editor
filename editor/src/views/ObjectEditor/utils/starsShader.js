import * as THREE from 'three'
import vertexShader from './vertexShader.glsl?raw'
import fragmentShader from './fragmentShader.glsl?raw'
// 创建自定义着色器材料
const starMaterial = new THREE.ShaderMaterial({
    uniforms: {
        time: { value: 0 }
    },
    vertexShader: vertexShader,
    fragmentShader: fragmentShader
});

// 创建几何体并应用材质
const starGeometry = new THREE.SphereGeometry(1000, 32, 32);
const starField = new THREE.Mesh(starGeometry, starMaterial);
starField.scale.x = -1; // 翻转球体的法线向内

// 添加到场景
scene.add(starField);

// 在动画循环中更新时间
function animate() {
    requestAnimationFrame(animate);

    starMaterial.uniforms.time.value = performance.now() / 1000;
    
    renderer.render(scene, camera);
}
animate();
