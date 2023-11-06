<template>
    <div id="threeOcean"></div>
</template>

<script setup>
import { onMounted } from 'vue'
import * as THREE from 'three'
import {  renderTarget, renderTargetanimate } from '@/utils/ThreeOcean/renderTarget/index.js'
onMounted(() => {  
    const width = window.innerWidth;
    const height = window.innerHeight;
    const renderer = new THREE.WebGLRenderer({antialias:true});
    renderer.setSize(width, height);
    const element = document.getElementById('threeOcean');
    element.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width/height, 1, 2000);
    scene.background = renderTarget.texture;
    camera.position.set(0,0,360);

    scene.add(camera);
    (function animate() {
        requestAnimationFrame( animate );
        renderTargetanimate(renderer)
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
