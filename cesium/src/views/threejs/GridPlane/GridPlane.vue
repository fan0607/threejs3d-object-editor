<template>
    <div ref="threeOcean" class="threeOcean"></div>
    <div class="save">
        <el-button @click="sceneSave()">保存</el-button>
        <el-button @click="toCube()">矩形</el-button>
        <el-button @click="toSphere()">球形</el-button>
        <el-button @click="toEnclosureZ()">围墙Z</el-button>
        <el-button @click="toEnclosureH()">围墙H</el-button>
        <el-button @click="toModel()">模型</el-button>

    </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import * as THREE from 'three'
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js'
import onWindowResize from './utils/events'
import { initScene } from './utils/initScene'
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';
import model from '../../../assets/grids/68-futuristic_trike_high-poly_2-fbx-7.4-binary-mit-animation/Futuristic_Trike_High-Poly_2-(FBX 7.4 binary mit Animation).fbx?url'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
let gui = null;
const threeOcean = ref(null)
let basicGeometry,
    cubeMaterial,
    plane,
    objects = [],
    isShiftDown = false,
    camera, rollOverMaterial, scene, renderer, controls;
let objType = 'cube';
let itemAxisHelper = new THREE.AxesHelper(100);
let selectItem = false;
let selectObject = null;
let rollOverMesh = null;//鼠标移动的小方块
let raycaster = null;//射线
let pointer = null;//鼠标位置
onMounted(async() => {
    [scene, renderer, camera, controls] =await initScene(threeOcean.value.clientWidth, threeOcean.value.clientHeight, threeOcean);
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
function createrollOverMesh() {
    if (rollOverMesh) {
        scene.remove(rollOverMesh);
    }
    if(!basicGeometry){
        return;
    }
    rollOverMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000, opacity: 0.5, transparent: true });
    rollOverMesh = new THREE.Mesh(basicGeometry, rollOverMaterial);
    scene.add(rollOverMesh);
    return rollOverMesh;
}
function initObjects(scene) {


    // cubes 立方体
    basicGeometry = new THREE.BoxGeometry(50, 50, 50);
    cubeMaterial = new THREE.MeshLambertMaterial({ color: 0xfeb74c });
    // roll-over helpers
    rollOverMesh = createrollOverMesh(objType)
    // grid
    const gridHelper = new THREE.GridHelper(5000, 100, 0x00ffff, 0x00ffff);
    scene.add(gridHelper);

    const geometry = new THREE.PlaneGeometry(5000, 5000);
    geometry.rotateX(- Math.PI / 2);

    plane = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ visible: true, color: 0x000000, opacity: 0.6, transparent: true }));
    scene.add(plane);

    objects.push(plane);

}
function bindEvents() {
    document.addEventListener('pointermove', onPointerMove);
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onDocumentKeyDown);
    document.addEventListener('keyup', onDocumentKeyUp);
    window.addEventListener('resize', () => { onWindowResize(camera, renderer, threeOcean.value.clientWidth, threeOcean.value.clientHeight) }, false);
}
function onPointerMove(event) {
    //归一化的二维向量，确定鼠标指针在3D世界中的位置
    pointer.set((event.clientX / threeOcean.value.clientWidth) * 2 - 1, - (event.clientY / threeOcean.value.clientHeight) * 2 + 1);

    raycaster.setFromCamera(pointer, camera);

    const intersects = raycaster.intersectObjects(objects, false);

    if (intersects.length > 0) {

        const intersect = intersects[0];
        if (rollOverMesh) {
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

        } else if (intersect && selectItem) {
            if (intersect.object !== plane) {
                /* //记录相机位置
                let cameraPosition = camera.position.clone();
                console.log('cameraPosition: ', cameraPosition); */
                itemAxisHelper.removeFromParent()
                selectObject = intersect.object;
                selectObject.add(itemAxisHelper);
                if (gui) {
                    gui.destroy();
                }
                gui = new GUI();
                let geo = {
                    width: 50,
                    height: 50,
                    depth: 50,
                    rotateX: 0,
                    rotateY: 0,
                    rotateZ: 0,
                }
                gui.add(geo, 'width', 0, 100, 2).onChange(function (value) {
                    selectObject.scale.x = value;

                });
                gui.add(geo, 'height', 0, 100, 2).onChange(function (value) {

                    selectObject.scale.y = value;

                });
                gui.add(geo, 'depth', 0, 100, 2).onChange(function (value) {

                    selectObject.scale.z = value;

                });
                gui.add(geo, 'rotateX', 0, 360, 1).onChange(function (value) {

                    selectObject.rotation.x = value * Math.PI / 180;

                });
                gui.add(geo, 'rotateY', 0, 360, 1).onChange(function (value) {

                    selectObject.rotation.y = value * Math.PI / 180;

                });
                gui.add(geo, 'rotateZ', 0, 360, 1).onChange(function (value) {

                    selectObject.rotation.z = value * Math.PI / 180;

                });

            }


        } else {
            if(basicGeometry){
                // const voxel = new THREE.Mesh( basicGeometry, cubeMaterial );
                if(objType==='model'){
                    const voxel = new THREE.Mesh(basicGeometry, cubeMaterial);
                    voxel.position.copy(intersect.point).add(intersect.face.normal);
                    voxel.position.divideScalar(50).floor().multiplyScalar(50).addScalar(25);
                    voxel.rotation.copy(rollOverMesh.rotation);
                    scene.add(voxel);
                    objects.push(voxel);
                    return;
                }else{
                    const voxel = new THREE.Mesh(basicGeometry, new THREE.MeshLambertMaterial({ color: 0xfeb74c }));
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

    }

}

function onDocumentKeyDown(event) {

    switch (event.keyCode) {

        case 16: isShiftDown = true; break;
        case 17: {
            selectItem = true;
            break;
        }
        //esc
        case 27: {
            if (selectObject) {
                selectObject.remove(itemAxisHelper);
                selectObject = null;
            }
            if(basicGeometry){
                basicGeometry = null;
                objType = null;
                createrollOverMesh(objType)
            }
            break;
        }

    }

}

function onDocumentKeyUp(event) {

    switch (event.keyCode) {

        case 16: isShiftDown = false; break;
        case 17: {
            selectItem = false;
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
function toModel() {
    const loader = new FBXLoader();
    loader.load(model, function (object) {
        // object.scale.set(0.01, 0.01, 0.01);
        object.position.set(0, 0, 0);
        object.rotation.set(0, 0, 0);
        object.traverse(function (child) {
            if (child.isMesh) {
                if (child.geometry) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                    basicGeometry = child.geometry;
                    basicGeometry.rotateX(- Math.PI / 2)
                    basicGeometry.scale(100, 100, 100);
                    objType = 'model';
                    cubeMaterial = child.material;
                    createrollOverMesh(objType)
                }
            }
        });
    });
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
    top: 0px;
    left: 90px;
    z-index: 1;
    background-color: #fff;
}
</style>
