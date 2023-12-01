<template>
    <div ref="threeOcean" class="threeOcean"></div>
    <div class="save w-36 border-e-gray-600">
        工具栏
        <button @click="initDrawTubes()">管道</button>
        <button @click="toCube()">立方</button>
        <button @click="toSphere()">球形</button>
        <button @click="toEnclosureZ()">围墙Z</button>
        <button @click="toEnclosureH()">围墙H</button>
        <button @click="toModel()">模型</button>
        <button @click="toImportModel()">导入模型
            <input type="file" name="导入模型" ref="importModel" id="导入模型" @click="toModelImport()">
        </button>
        <button @click="sceneSave()">保存</button>
        <button @click="changeType('translate', controlsType)">移动</button>
        <button @click="changeType('rotate', controlsType)">旋转</button>
        <button @click="changeType('scale', controlsType)">缩放</button>


    </div>
</template>

<script setup lang="ts">
import { onMounted, ref, type Ref } from 'vue';
import * as THREE from 'three'
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js'
import onWindowResize from './utils/events'
import { initScene } from './utils/initScene'
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';
import model from '@/assets/grids/68-futuristic_trike_high-poly_2-fbx-7.4-binary-mit-animation/Futuristic_Trike_High-Poly_2-(FBX 7.4 binary mit Animation).fbx?url'
import grass from '@/assets/grids/grass.glb?url'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { setTransformControls, removeTransformControls, changeType, initTransform } from './utils/transform'
import { useModelStore } from '@/stores/useModelStore'
import { drawTubes, initDraw } from './utils/drawTubes'

let gui: GUI | null = null;
const threeOcean = ref()
const importModel = ref()
let basicGeometry: THREE.BoxGeometry | THREE.TubeGeometry | THREE.SphereGeometry | THREE.BufferGeometry | null = null,
    cubeMaterial: THREE.Material | null = null,
    plane: THREE.Mesh | null = null,
    objects: THREE.Mesh[] = [],
    isShiftDown = false,
    camera: THREE.PerspectiveCamera, rollOverMaterial: THREE.Material, scene: THREE.Scene, renderer: THREE.Renderer, controls: any;
let objType = 'cube';
let isMove = false;
const store = useModelStore();//store.models

let selectItem = false;
let selectObject: THREE.Mesh | null = null;
let rollOverMesh: THREE.Mesh | null = null;//鼠标移动的小方块
let raycaster: THREE.Raycaster = new THREE.Raycaster();
let pointer = new THREE.Vector2();
let controlsType = ref('translate');
onMounted(async () => {
    [scene, renderer, camera, controls] = await initScene(threeOcean.value.clientWidth, threeOcean.value.clientHeight, threeOcean);
    initDraw(scene, renderer, camera, controls, objects)
    initTransform(scene, renderer, camera, controls)
    initObjects();
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
    if (!basicGeometry) {
        return;
    }
    rollOverMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000, opacity: 0.5, transparent: true });
    rollOverMesh = new THREE.Mesh(basicGeometry, rollOverMaterial);
    scene.add(rollOverMesh);
    return rollOverMesh;
}
function initObjects() {


    // cubes 立方体
    basicGeometry = new THREE.BoxGeometry(50, 50, 50);
    cubeMaterial = new THREE.MeshLambertMaterial({ color: 0xfeb74c });
    // grid
    const gridHelper = new THREE.GridHelper(1000, 20, 0x00ffff, 0x00ffff);
    scene.add(gridHelper);

    const geometry = new THREE.PlaneGeometry(1000, 1000);
    geometry.rotateX(- Math.PI / 2);
    plane = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ visible: false, color: 0x707070, opacity: 0.6, transparent: false }));
    plane.translateY(-.5);
    new GLTFLoader().load(grass, function (gltf) {
        const planeGrass = gltf.scene;
        planeGrass.traverse(function (child) {
            if (child instanceof THREE.Mesh) {
                if (child.geometry) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            }
        });
        planeGrass.scale.set(5, 5, 5);
        planeGrass.translateY(-50)
        // scene.add(planeGrass)
    });
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
function onPointerMove(event: PointerEvent) {
    if (!(threeOcean?.value?.clientWidth || threeOcean?.value?.clientHeight)) return;
    //归一化的二维向量，确定鼠标指针在3D世界中的位置
    pointer.set((event.clientX / threeOcean.value.clientWidth) * 2 - 1, - (event.clientY / threeOcean.value.clientHeight) * 2 + 1);

    raycaster.setFromCamera(pointer, camera);

    const intersects = raycaster.intersectObjects(objects, false);

    if (intersects.length > 0) {

        const intersect = intersects[0];
        if (rollOverMesh) {
            if (intersect.face) {
                rollOverMesh.position.copy(intersect.point).add(intersect.face.normal);//沿交点的法线方向稍作偏移
                rollOverMesh.position.divideScalar(50).floor().multiplyScalar(50).addScalar(25);
            }

        }

    }

}

function onPointerDown(event: PointerEvent) {
    pointer.set((event.clientX / threeOcean.value.clientWidth) * 2 - 1, - (event.clientY / threeOcean.value.clientHeight) * 2 + 1);

    raycaster.setFromCamera(pointer, camera);

    const intersects = raycaster.intersectObjects(objects, false);

    if (intersects.length > 0) {

        const intersect = intersects[0];

        // delete cube

        if (isShiftDown) {

            if (intersect.object !== plane) {

                scene.remove(intersect.object);

                objects.splice(objects.indexOf(intersect.object as THREE.Mesh), 1);

            }

            // create cube

        } else if (intersect && selectItem) {
            if (intersect.object !== plane) {
                /* //记录相机位置
                let cameraPosition = camera.position.clone();
                console.log('cameraPosition: ', cameraPosition); */
                if (selectObject) {
                    selectObject = null;
                }
                selectObject = intersect.object as THREE.Mesh;
                setTransformControls(selectObject, controlsType.value, store.models);
                if (gui) {
                    gui.destroy();
                }
                gui = new GUI();
                gui.add(selectObject.userData, 'data');

            }
        } else if (isMove) {
            if (intersect.object) {
                if (selectObject && intersect.face) {
                    selectObject.position.copy(intersect.point).add(intersect.face.normal);
                    selectObject.position.divideScalar(50).floor().multiplyScalar(50).addScalar(25);
                    //刷新相关的管道
                    const name = selectObject.userData.name;
                    const tubes = scene.children.filter(item =>
                        item.userData?.referTube?.find((item: string) => item === name)
                    );
                    tubes.forEach((item) => {
                        scene.remove(item);
                        //重新绘制管道
                        const modelArray: THREE.Object3D[] = [];
                        item.userData.referTube.forEach((item: string) => {
                            const model = scene.children.find(item2 => item2.userData.name === item);
                            if (model)
                                modelArray.push(model);
                        });
                        drawTubes(scene, store.models, 5, 0x00ff00)
                    });
                }
            }
        }
        else if (objType === 'tube') {
            if (intersect.object !== plane) {
                store.models.push(intersect.object);



                if (store.models.length === 2) {
                    drawTubes(scene, store.models, 5, 0x00ff00)
                }
            }
        }
        else {
            // if(!rollOverMesh||intersect.object != plane) return;//如果没有创建rollOverMesh或者点击的不是plane，就不创建
            if (!rollOverMesh) return;

            if (basicGeometry) {
                // const voxel = new THREE.Mesh( basicGeometry, cubeMaterial );
                if (objType === 'model' && intersect.face) {
                    if (cubeMaterial) {
                        const voxel = new THREE.Mesh(basicGeometry, cubeMaterial);
                        voxel.position.copy(intersect.point).add(intersect.face.normal);
                        voxel.position.divideScalar(50).floor().multiplyScalar(50).addScalar(25);
                        // voxel.rotation.copy(rollOverMesh.rotation);
                        voxel.userData.data = '1',
                            voxel.userData.name = `model${objects.length + 1}`;
                        scene.add(voxel);
                        objects.push(voxel);
                        return;
                    }

                } else {
                    if (intersect.face) {
                        const voxel = new THREE.Mesh(basicGeometry, new THREE.MeshLambertMaterial({ color: 0xfeb74c }));
                        voxel.position.copy(intersect.point).add(intersect.face.normal);
                        //voxel.position.divideScalar( 50 )归一化   
                        //voxel.position.divideScalar( 50 ).floor()对齐
                        //voxel.position.divideScalar( 50 ).floor().multiplyScalar( 50 )缩放回原来的规模
                        //voxel.position.divideScalar( 50 ).floor().multiplyScalar( 50 ).addScalar( 25 )加上偏移量，对齐到网格中心，因为网格中心是25
                        voxel.position.divideScalar(50).floor().multiplyScalar(50).addScalar(25);
                        voxel.userData.data = '1',
                            voxel.userData.name = `voxel${objects.length + 1}`;
                        scene.add(voxel);
                        objects.push(voxel);
                    }
                }
            }


        }

    }

}

function onDocumentKeyDown(event: KeyboardEvent) {

    switch (event.keyCode) {

        case 16: isShiftDown = true; break;
        case 17: {
            selectItem = true;
            break;
        }
        //esc
        case 27: {
            if (selectObject) {
                removeTransformControls();
                selectObject = null;
            }
            if (basicGeometry) {
                basicGeometry = null;
                createrollOverMesh()
            }
            objType = '';
            break;
        }
        //m
        case 77: {
            isMove = true;
            break;
        }

    }

}

function onDocumentKeyUp(event: KeyboardEvent) {

    switch (event.keyCode) {

        case 16: isShiftDown = false; break;
        case 17: {
            selectItem = false;
            break;
        }
        case 77: {
            isMove = false;
            break;
        }
    }


}
function sceneSave() {
    const exporter = new GLTFExporter();

    // 创建一个新的空场景，用于保存只包含 Mesh 的场景
    const filteredScene = new THREE.Scene();

    // 遍历原始场景中的所有对象
    scene.traverse(function (child) {
        // 如果当前对象是 Mesh，则将其克隆并添加到新场景中
        if (child instanceof THREE.Mesh) {
            if (child.userData.name)
                filteredScene.add(child.clone());
        }
    });

    // 使用新场景（只包含 Mesh 对象）进行导出
    exporter.parse(filteredScene, function (gltf) {
        console.log(gltf);
        const output = JSON.stringify(gltf, null, 2);
        console.log(output);
        saveString(output, 'scene.gltf');
    }, function (e) {
        console.error(e);
    });
}
function saveString(text: string, filename: string) {
    save(new Blob([text], { type: 'text/plain' }), filename);
}
function save(blob: Blob, filename: string) {
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
    createrollOverMesh()

}
function toSphere() {
    basicGeometry = new THREE.SphereGeometry(25);
    objType = 'sphere';
    createrollOverMesh()

}
function toEnclosureZ() {
    basicGeometry = new THREE.BoxGeometry(50, 50, 10);
    basicGeometry.translate(0, 0, 20);
    objType = 'enclosureZ';
    createrollOverMesh()

}
function toEnclosureH() {
    basicGeometry = new THREE.BoxGeometry(50, 50, 10);
    basicGeometry.translate(0, 0, 20);
    basicGeometry.rotateY(Math.PI / 2);
    objType = 'enclosureH';
    createrollOverMesh()


}
function toModel() {
    const loader = new FBXLoader();
    loader.load(model, function (object) {
        // object.scale.set(0.01, 0.01, 0.01);
        object.position.set(0, 0, 0);
        object.rotation.set(0, 0, 0);
        object.traverse(function (child) {
            if (child instanceof THREE.Mesh) {
                if (child.geometry) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                    basicGeometry = child.geometry;
                    if (basicGeometry) {
                        basicGeometry.scale(10, 10, 10);
                        //将中心点对其到几何体的中心
                        basicGeometry.center();
                    }
                    objType = 'model';
                    cubeMaterial = child.material;
                    createrollOverMesh()
                }
            }
        });
    });
}
function toImportModel() {
    if (importModel.value) {
        importModel.value.click();
    }
}
function toModelImport() {
    //gltf
    const input = document.getElementById('导入模型') as HTMLInputElement;
    if (input) {
        input.addEventListener('change', function (event) {
            const file = (event.target as HTMLInputElement).files![0];
            const reader = new FileReader();
            reader.onload = function (event) {
                const contents = event.target!.result;
                const loader = new GLTFLoader();
                loader.load(contents as string, function (gltf) {
                    const object = gltf.scene;
                    object.traverse(function (child) {
                        if (child instanceof THREE.Mesh) {
                            if (child.geometry) {
                                child.castShadow = true;
                                child.receiveShadow = true;
                                basicGeometry = child.geometry;
                                if (basicGeometry) {
                                    // basicGeometry.scale(10, 10, 10);
                                    //将中心点对其到几何体的中心
                                    basicGeometry.center();
                                }
                                objType = 'model';
                                cubeMaterial = child.material;
                                createrollOverMesh()
                            }
                        }
                    });
                });
            };
            reader.readAsDataURL(file);
        }, false);
    }

    /* const input = document.getElementById('导入模型') as HTMLInputElement;
    if(input){
        input.addEventListener('change', function (event) {
            const file = (event.target as HTMLInputElement).files![0];
            const reader = new FileReader();
            reader.onload = function (event) {
                const contents = event.target!.result;
                const loader = new FBXLoader();
                loader.load(contents as string, function (object) {
                    // object.scale.set(0.01, 0.01, 0.01);
                    object.position.set(0, 0, 0);
                    object.rotation.set(0, 0, 0);
                    object.traverse(function (child) {
                        if (child instanceof THREE.Mesh) {
                            if (child.geometry) {
                                child.castShadow = true;
                                child.receiveShadow = true;
                                basicGeometry = child.geometry;
                                if(basicGeometry){
                                    basicGeometry.scale(10, 10, 10);
                                    //将中心点对其到几何体的中心
                                    basicGeometry.center();
                                }
                                objType = 'model';
                                cubeMaterial = child.material;
                                createrollOverMesh()
                            }
                        }
                    });
                });
            };
            reader.readAsDataURL(file);
        }, false);
    } */
}
function initDrawTubes() {
    store.models = [];
    objType = 'tube';
}

// export { scene, renderer, camera, controls, objects, models };
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
    left: 10px;
    z-index: 1;
    background-color: #fff;
    display: flex;
    flex-direction: column;
    padding: 10px;
    border-radius: 5px;

    button {
        margin-bottom: 10px;
        border: 1px solid #000;
        border-radius: 5px;
        padding: 3px;
        cursor: pointer;
    }

    input {
        display: none;
    }

}
</style>
