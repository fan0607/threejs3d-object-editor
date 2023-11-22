<template>
    <div ref="threeOcean" class="threeOcean"></div>
    <div class="save">
        <el-button @click="sceneSave()">保存</el-button>
        <el-button @click="toCube()">矩形</el-button>
        <el-button @click="toSphere()">球形</el-button>
        <el-button @click="toEnclosureZ()">围墙Z</el-button>
        <el-button @click="toEnclosureH()">围墙H</el-button>
    </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import * as THREE from 'three'
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js'
import onWindowResize from './utils/events'
import {initScene} from './utils/initScene'

const threeOcean = ref(null)
let basicGeometry,
    cubeMaterial,
    plane,
    objects = [],
    isShiftDown = false,
    camera, rollOverMaterial, scene, renderer,controls;
let objType = 'cube';
let autoDrawer = false;
let rollOverMesh = null;//鼠标移动的小方块
let raycaster = null;//射线
let pointer = null;//鼠标位置
onMounted(() => {
    [scene,renderer,camera,controls] = initScene(threeOcean.value.clientWidth, threeOcean.value.clientHeight, threeOcean);
    raycaster = new THREE.Raycaster();
    pointer = new THREE.Vector2();
    initObjects(scene);
    bindEvents();
    (function animate() {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
    })();
})
function createrollOverMesh(){
    if(rollOverMesh){
        scene.remove(rollOverMesh);
    }
    rollOverMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000, opacity: 0.5, transparent: true });
    rollOverMesh = new THREE.Mesh(basicGeometry, rollOverMaterial);
    scene.add(rollOverMesh);
    return rollOverMesh;
}
function initObjects(scene){
    

    // cubes 立方体
    basicGeometry = new THREE.BoxGeometry(50, 50, 50);
    cubeMaterial = new THREE.MeshLambertMaterial({ color: 0xfeb74c });
    // roll-over helpers
    rollOverMesh = createrollOverMesh(objType)
    // grid
    const gridHelper = new THREE.GridHelper(10000, 200);
    scene.add(gridHelper);

    const geometry = new THREE.PlaneGeometry(10000, 10000);
    geometry.rotateX(- Math.PI / 2);

    plane = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ visible: false }));
    scene.add(plane);

    objects.push(plane);

    const axisHelper = new THREE.AxesHelper(1000);
    scene.add(axisHelper);
}
function bindEvents(){
    document.addEventListener('pointermove', onPointerMove);
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onDocumentKeyDown);
    document.addEventListener('keyup', onDocumentKeyUp);
    window.addEventListener('resize', ()=>{onWindowResize(camera, renderer, threeOcean.value.clientWidth, threeOcean.value.clientHeight)}, false);
}
function onPointerMove(event) {
    //归一化的二维向量，确定鼠标指针在3D世界中的位置
    pointer.set((event.clientX / threeOcean.value.clientWidth) * 2 - 1, - (event.clientY / threeOcean.value.clientHeight) * 2 + 1);

    raycaster.setFromCamera(pointer, camera);

    const intersects = raycaster.intersectObjects(objects, false);

    if (intersects.length > 0) {

        const intersect = intersects[0];
        if(rollOverMesh){
            rollOverMesh.position.copy(intersect.point).add(intersect.face.normal);//沿交点的法线方向稍作偏移
            rollOverMesh.position.divideScalar(50).floor().multiplyScalar(50).addScalar(25);
        }
        //rollOverMesh.position.divideScalar(n).floor().multiplyScalar(n).addScalar(n / 2);
        /**
         * divideScalar(n) 将位置坐标的每个分量除以新的格子大小 n。
         * .floor() 向下取整，确保结果是整数，这样可以对齐到格子的边缘。
         * multiplyScalar(n) 再将结果乘以格子大小 n，将坐标放回原来的比例中，但现在它对齐到了格子的边缘。
         * addScalar(n / 2) 最后，加上 n / 2，这样做是为了将对象的位置从格子的边缘移动到格子的中心。
         */
        /* if(autoDrawer){
            const voxel = new THREE.Mesh(basicGeometry, cubeMaterial);
            voxel.position.copy(intersect.point).add(intersect.face.normal);
            voxel.position.divideScalar(50).floor().multiplyScalar(50).addScalar(25);
            scene.add(voxel);
            objects.push(voxel);
        } */
        


    }

}

function onPointerDown(event) {
    
    pointer.set((event.clientX / threeOcean.value.clientWidth) * 2 - 1, - (event.clientY / threeOcean.value.clientHeight) * 2 + 1);

    raycaster.setFromCamera(pointer, camera);

    const intersects = raycaster.intersectObjects(objects, false);

    if (intersects.length > 0) {

        const intersect = intersects[0];

        // delete cube

        if (isShiftDown) {

            if (intersect.object !== plane) {

                scene.remove(intersect.object);

                objects.splice(objects.indexOf(intersect.object), 1);

            }

            // create cube

        } else {

            // const voxel = new THREE.Mesh( basicGeometry, cubeMaterial );
            const voxel = new THREE.Mesh(basicGeometry, cubeMaterial);
            voxel.position.copy(intersect.point).add(intersect.face.normal);
            //voxel.position.divideScalar( 50 )归一化   
            //voxel.position.divideScalar( 50 ).floor()对齐
            //voxel.position.divideScalar( 50 ).floor().multiplyScalar( 50 )缩放回原来的规模
            //voxel.position.divideScalar( 50 ).floor().multiplyScalar( 50 ).addScalar( 25 )加上偏移量，对齐到网格中心，因为网格中心是25
            voxel.position.divideScalar(50).floor().multiplyScalar(50).addScalar(25);

            scene.add(voxel);

            objects.push(voxel);

        }

    }

}

function onDocumentKeyDown(event) {

    switch (event.keyCode) {

        case 16: isShiftDown = true; break;
        case 17: {
            autoDrawer = true;
            break;
        }

    }

}

function onDocumentKeyUp(event) {

    switch (event.keyCode) {

        case 16: isShiftDown = false; break;
        case 17: {
            autoDrawer = false;
            break;
        }
    }


}
function sceneSave() {
    const exporter = new GLTFExporter();
    exporter.parse(scene, function (gltf) {
        console.log(gltf);
        const output = JSON.stringify(gltf, null, 2);
        console.log(output);
        saveString(output, 'scene.gltf');
    }, {});
}
function saveString(text, filename) {
    save(new Blob([text], { type: 'text/plain' }), filename);
}
function save(blob, filename) {
    const link = document.createElement('a');
    link.style.display = 'none';
    document.body.appendChild(link); // Firefox workaround, see #6594
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
}
function toCube() {
    basicGeometry = new THREE.BoxGeometry(50, 50, 50);
    objType = 'cube';
    createrollOverMesh(objType)

}
function toSphere() {
    basicGeometry = new THREE.SphereGeometry(25);
    objType = 'sphere';
    createrollOverMesh(objType)

}
function toEnclosureZ() {
    basicGeometry = new THREE.BoxGeometry(50, 50, 10);
    basicGeometry.translate(0, 0, 20);
    objType = 'enclosureZ';
    createrollOverMesh(objType)

}
function toEnclosureH() {
    basicGeometry = new THREE.BoxGeometry(50, 50, 10);
    basicGeometry.translate(0, 0, 20);
    basicGeometry.rotateY(Math.PI / 2);
    objType = 'enclosureH';
    createrollOverMesh(objType)


}
</script>

<style lang="scss" scoped>
.threeOcean {
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    z-index: 0;
    background-image: -moz-linear-gradient(0deg, rgb(255, 216, 189), rgb(255, 185, 179));
    background-image: -webkit-linear-gradient(0deg, rgb(255, 216, 189), rgb(255, 185, 179));
    background-image: linear-gradient(0deg, rgb(255, 216, 189), rgb(255, 185, 179));
}

.save {
    position: absolute;
    top: 10px;
    right: 10px;
    z-index: 1;
}
</style>
