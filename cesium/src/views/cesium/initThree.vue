<template>
    <div id="threeOcean"></div>
</template>

<script setup>
import { onMounted } from 'vue'
import * as THREE from 'three'
// import {  renderTarget, renderTargetanimate } from '@/utils/ThreeOcean/renderTarget/index.js'
import vertexShader from '@/utils/ThreeWater/shader/vertexShader.glsl?raw'
import fragmentShader from '@/utils/ThreeWater/shader/fragmentShader.glsl?raw'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
onMounted(() => {  
    const width = window.innerWidth;
    const height = window.innerHeight;
    const renderer = new THREE.WebGLRenderer({antialias:true});
    renderer.setSize(width, height);
    const element = document.getElementById('threeOcean');
    element.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(1, width/height, 1, 2000);
    // scene.background = renderTarget.texture;
    camera.position.set(0,0,10);
    const controls = new OrbitControls(camera, renderer.domElement);
    const uniforms = {
        iTime: { value: 1.0 },
        iResolution: { value: new THREE.Vector2(width * 1.0, height * 1.0)},
        iMouse: { value: new THREE.Vector2(0.0, 0.0) }
    }
    const material = new THREE.ShaderMaterial( {
        uniforms: uniforms,
        vertexShader: vertexShader,
        fragmentShader: fragmentShader
    });
    // const geom = new THREE.PlaneGeometry(oceanSceneWidth, oceanSceneHeight);
    // const mesh = new THREE.Mesh( geom, material );
    // 创建一个不规则的二维形状
    var shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.lineTo(0, 1);
    shape.lineTo(1, 1);
    shape.lineTo(0.5, 0.5);
    shape.lineTo(1, 0);
    shape.lineTo(0, 0);

    // 定义拉伸参数
    var extrudeSettings = {
        steps: 2,
        depth: 2,
        bevelEnabled: false
    };

    // 创建拉伸几何体
    var geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);



    // 创建网格（Mesh）
    var mesh2 = new THREE.Mesh(geometry, material);

    // 将网格添加到场景
    scene.add(mesh2);

    const axis = new THREE.AxesHelper(5);
    scene.add(axis);

    // oceanScene.add(mesh);
    const clock = new THREE.Clock();

    scene.add(camera);
    (function animate() {
        requestAnimationFrame( animate );
        const delta = clock.getDelta();
        controls.update();
        uniforms.iTime.value += delta;
        // renderTargetanimate(renderer)
        renderer.render( scene, camera ); // 重新渲染
    })();
    
})

</script>

<style lang="scss" scoped>
#threeMap{
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    z-index: 0;
}
</style>
