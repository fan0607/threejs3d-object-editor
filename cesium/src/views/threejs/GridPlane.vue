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
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { DragControls } from 'three/examples/jsm/controls/DragControls.js'
// import { saveString } from 'three/examples/jsm/utils/FileSaver.js'
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js'

const threeOcean = ref(null)
const meshArr = ref([])
let basicGeometry, cubeMaterial, raycaster, pointer, plane, objects = [], isShiftDown = false, camera, rollOverMaterial, rollOverMesh, scene, renderer;
onMounted(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    threeOcean.value.appendChild(renderer.domElement);

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.set(500, 800, 1300);
    camera.lookAt(0, 0, 0);
    scene.add(camera);
    scene.background = new THREE.Color(0xf0f0f0);
    // roll-over helpers
    const rollOverGeo = new THREE.BoxGeometry(50, 50, 50);
    rollOverMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000, opacity: 0.5, transparent: true });
    rollOverMesh = new THREE.Mesh(rollOverGeo, rollOverMaterial);
    scene.add(rollOverMesh);

    // cubes
    basicGeometry = new THREE.BoxGeometry(50, 50, 50);
    cubeMaterial = new THREE.MeshLambertMaterial({ color: 0xfeb74c });

    // grid
    const gridHelper = new THREE.GridHelper(1000, 20);
    scene.add(gridHelper);

    raycaster = new THREE.Raycaster();
    pointer = new THREE.Vector2();

    const geometry = new THREE.PlaneGeometry(1000, 1000);
    geometry.rotateX(- Math.PI / 2);

    plane = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ visible: false }));
    scene.add(plane);

    objects.push(plane);

    // lights

    const ambientLight = new THREE.AmbientLight(0x606060, 3);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 3);
    directionalLight.position.set(1, 0.75, 0.5).normalize();
    scene.add(directionalLight);


    document.addEventListener('pointermove', onPointerMove);
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onDocumentKeyDown);
    document.addEventListener('keyup', onDocumentKeyUp);

    window.addEventListener('resize', onWindowResize);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.2;
    controls.enableZoom = true;
    controls.enableRotate = true;
    controls.enablePan = true;
    const axisHelper = new THREE.AxesHelper(1000);
    scene.add(axisHelper);
    // gridHelper(scene);
    // const dragControls = new DragControls(meshArr.value, camera, renderer.domElement);

    (function animate() {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
    })();

})
function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);


}

function onPointerMove(event) {

    pointer.set((event.clientX / window.innerWidth) * 2 - 1, - (event.clientY / window.innerHeight) * 2 + 1);

    raycaster.setFromCamera(pointer, camera);

    const intersects = raycaster.intersectObjects(objects, false);

    if (intersects.length > 0) {

        const intersect = intersects[0];

        rollOverMesh.position.copy(intersect.point).add(intersect.face.normal);
        rollOverMesh.position.divideScalar(50).floor().multiplyScalar(50).addScalar(25);


    }

}

function onPointerDown(event) {

    pointer.set((event.clientX / window.innerWidth) * 2 - 1, - (event.clientY / window.innerHeight) * 2 + 1);

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

    }

}

function onDocumentKeyUp(event) {

    switch (event.keyCode) {

        case 16: isShiftDown = false; break;

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
}
function toSphere() {
    basicGeometry = new THREE.SphereGeometry(25);
}
function toEnclosureZ() {
    basicGeometry = new THREE.BoxGeometry(50, 50, 10);
}
function toEnclosureH() {
    basicGeometry = new THREE.BoxGeometry(10, 50, 50);
}
</script>

<style lang="scss" scoped>
#threeMap {
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
