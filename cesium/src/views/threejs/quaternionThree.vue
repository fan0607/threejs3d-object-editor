<template>
    <div id="threeOcean"></div>
</template>

<script setup>
import { onMounted, render } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
onMounted(() => {  
    const width = window.innerWidth;
    const height = window.innerHeight;
    const renderer = new THREE.WebGLRenderer({antialias:true});
    renderer.setSize(width, height);
    const element = document.getElementById('threeOcean');
    element.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width/height, 1, 2000);
    camera.position.set(0,0,20);
    const controls = new OrbitControls(camera, renderer.domElement);
    const Axis = new THREE.AxesHelper(1000);
    scene.add(Axis);
    scene.add(camera);
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(9, 0, 9);
    const ambientLight = new THREE.AmbientLight(0x999999);
    scene.add(ambientLight,light);
    const geometry = new THREE.ConeGeometry( 1, 2, 3);//创建一个圆锥几何体
    const material = new THREE.MeshLambertMaterial( {color: 0xffff00} );//创建一个材质
    const cone = new THREE.Mesh( geometry, material );//创建一个圆锥网格模型
    cone.position.copy(new THREE.Vector3(2,0,0));
    cone.rotateZ(Math.PI/2)
    const coneAxis = new THREE.AxesHelper(2);
    cone.add(coneAxis);
    scene.add( cone );//将圆锥网格模型添加到场景中
    const R = 2;
    let angle = 0;
    const a = new THREE.Vector3(-1,0,0);
    const target = new THREE.Vector3(0,0,0);
    /* function renderCenter() {
        angle += 0.01;
        const x = R * Math.cos(angle);
        const z = R * Math.sin(angle);
        cone.position.set(x,0,z);
        const b = target.clone().sub(cone.position).normalize();
        const quaternion = new THREE.Quaternion().setFromUnitVectors(a,b)
            .multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,0,1),Math.PI/2))
        cone.quaternion.copy(quaternion);

    } */
    
    function renderTangent() {
        const x1 = R * Math.cos(angle);
        const z1 = R * Math.sin(angle);
        angle += 0.01;
        const x2 = R * Math.cos(angle);
        const z2 = R * Math.sin(angle);
        cone.position.set(x2,0,z2);
        const b = new THREE.Vector3(x2-x1,0,z2-z1).normalize();
        const quaternion = new THREE.Quaternion().setFromUnitVectors(a,b)
            .multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,0,1),Math.PI/2))
        cone.quaternion.copy(quaternion);

    }

    




    (function animate() {
        requestAnimationFrame( animate );
        controls.update();
        // renderCenter();
        renderTangent();
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
