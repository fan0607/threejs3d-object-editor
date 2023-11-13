<template>
    <div id="threeContainer" ref="threeContainer"></div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
//导入fbx模型
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js'
//导入gltf模型
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import * as YUKA from 'yuka'
// import navMeshModel from '@/assets/navMesh.glb';
// import yqMeshModel from '@/assets/园区.glb';
// import modelMeshModel from '@/assets/模型.glb';
const threeContainer = ref(null)
let vehicle;
onMounted(async() => {
    let model = null;
    let line;
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0xaaaaaa)
    const camera = new THREE.PerspectiveCamera(75, threeContainer.value.clientWidth / threeContainer.value.clientHeight, 0.1, 1000)
    camera.position.set(5, 10, 10)
    const renderer = new THREE.WebGLRenderer({
        antialias: true,
        // alpha: true
    })
    renderer.setSize(threeContainer.value.clientWidth, threeContainer.value.clientHeight)
    renderer.shadowMap.enabled = true
    threeContainer.value.appendChild(renderer.domElement)
    const light = new THREE.SpotLight(0xffffff,3, 100, Math.PI/6, 0.5, .5)//prenumber是光源强度，
    light.position.set(0,30, 10)
    light.castShadow = true
    scene.add(light)
    const lightHelper = new THREE.SpotLightHelper(light)
    // scene.add(lightHelper)
    const ambientLight = new THREE.AmbientLight(0xffffff, .5)
    scene.add(ambientLight)
    const controls = new OrbitControls(camera, renderer.domElement)
    const clock = new THREE.Clock()
    const axisHelper = new THREE.AxesHelper(5)
    scene.add(axisHelper)
    const loader = new GLTFLoader();
    await new Promise((resolve, reject) => {
        // loader.load(modelMeshModel, (gltf) => {
            loader.load(new URL('../assets/模型.glb', import.meta.url).href, (gltf) => {

            const gltfscene = gltf.scene; // 使用gltf.scene替换错误的object引用
            model = gltfscene.children[0]
            model.castShadow = true
            model.position.set(0, .5, 0)
            model.matrixAutoUpdate = false
            scene.add(model)

            vehicle = new YUKA.Vehicle()
            vehicle.maxSpeed = 5
            vehicle.setRenderComponent(model,callback)
            resolve()
        }, undefined, function (error) {
            console.error(error);
        })
    })
    let intersectObjects = []
    new Promise((resolve, reject) => {
        // loader.load(yqMeshModel, (gltf) => {
            loader.load(new URL('../assets/园区.glb', import.meta.url).href, (gltf) => {

            const gltfscene = gltf.scene; // 使用gltf.scene替换错误的object引用
            // gltfscene.scale.set(0.01, 0.01, 0.01);
            gltfscene.position.set(0, 2, 0);
            gltfscene.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                    // intersectObjects.push(child)
                }
            });
            // 将GLTF模型的场景添加到您现有的Three.js场景中
            scene.add(gltfscene); // 将'yourScene'替换为实际持有您场景的变量名
            resolve(gltfscene)
        }, undefined, function (error) {
            console.error(error);
        });
    })
    let navMesh;
    const navMeshLoader = new YUKA.NavMeshLoader()
    await new Promise((res,rej)=>{
        navMeshLoader.load(new URL('../assets/navMesh.glb', import.meta.url).href).then((navigationMesh) => {
            navMesh = navigationMesh
            res()
        }
        /* navMeshLoader.load(navMeshModel).then((navigationMesh) => {
            navMesh = navigationMesh
            res()
        } */
        )
    })
    let plane;
    await new Promise((resolve, reject) => {
        // loader.load(navMeshModel, (gltf) => {
            loader.load(new URL('../assets/navMesh.glb', import.meta.url).href, (gltf) => {

            plane = gltf.scene; // 使用gltf.scene替换错误的object引用
            plane.position.set(0, 2.5, 0);
            plane.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                    child.visible = false
                    intersectObjects.push(child)
                }
            });
            // 将GLTF模型的场景添加到您现有的Three.js场景中
            scene.add(plane); // 将'yourScene'替换为实际持有您场景的变量名
            resolve(plane)
        }, undefined, function (error) {
            console.error(error);
        });
    })
    
    function callback(entity, renderTarget){
        renderTarget.matrix.copy(entity.worldMatrix)
    }

    // const path = new YUKA.Path()
    // path.add(new YUKA.Vector3(0, 0, 0))
    // path.add(new YUKA.Vector3(0, 0, 10))
    // path.add(new YUKA.Vector3(10, 0, 10))
    // path.add(new YUKA.Vector3(10, 0, 0))
    // path.add(new YUKA.Vector3(0, 0, 0))
    // // path.loop = true
    // vehicle.position.copy(path.current())
    // const followPathBehavior = new YUKA.FollowPathBehavior(path)
    // // vehicle.steering.add(followPathBehavior)
    // const keepOnPathBehavior = new YUKA.OnPathBehavior(path)
    // keepOnPathBehavior.weight = 10
    // // vehicle.steering.add(keepOnPathBehavior)
    // const arriveBehavior = new YUKA.ArriveBehavior(new YUKA.Vector3(0, 0, 0), 1, 0.01)
    // // arriveBehavior.weight = 10
    // // vehicle.steering.add(arriveBehavior)
    const entityManger = new YUKA.EntityManager()
    entityManger.add(vehicle)
    // vehicle.smoother = new YUKA.Smoother( 10 );
    // //阻挡物
    // const boxGeometry = new THREE.BoxGeometry(1, 1, 1)
    // boxGeometry.computeBoundingSphere()
    // const boxMaterial = new THREE.MeshStandardMaterial({
    //     color: 0xff0000
    // })
    // const boxMesh = new THREE.Mesh(boxGeometry, boxMaterial)
    // boxMesh.position.set(0, 0, 5)
    // boxMesh.castShadow = true
    // scene.add(boxMesh)

    // const obstacle = new YUKA.GameEntity()
    // obstacle.setRenderComponent(boxMesh,(entity, renderTarget)=>{
    //     // renderTarget.matrix.copy(entity.worldMatrix)
    // })
    // obstacle.position.copy(boxMesh.position)
    // obstacle.boundingRadius = boxGeometry.boundingSphere.radius
    // entityManger.add(obstacle)
    // const aviodObstacleBehavior = new YUKA.ObstacleAvoidanceBehavior([obstacle])
    // aviodObstacleBehavior.weight =  10  
    // // vehicle.steering.add(aviodObstacleBehavior)
    // showPathLine(path)
    function showPathLine(path) {
        if(line){
            scene.remove(line)
            line.geometry.dispose()
            line.material.dispose()
        }
        let points = []
        for (let i = 0; i < path._waypoints.length; i++) {
            points.push(path._waypoints[i].x, path._waypoints[i].y, path._waypoints[i].z)
        }
        const lineMaterial = new THREE.LineBasicMaterial({
            color: 0xff0000
        })
        const lineGeometry = new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(points, 3))
        line = new THREE.Line(lineGeometry, lineMaterial)
        scene.add(line)
    }

    const raycaster = new THREE.Raycaster()
    const mouse = new THREE.Vector2()

    const clickMesh = new THREE.Mesh(new THREE.SphereGeometry(0.1, 32, 32), new THREE.MeshBasicMaterial({
        color: 0x00ff00
    }))
    clickMesh.position.set(0, 0, 0)
    scene.add(clickMesh)
    window.addEventListener('click', (event) => {
        mouse.x = (event.clientX / threeContainer.value.clientWidth) * 2 - 1
        mouse.y = -(event.clientY / threeContainer.value.clientHeight) * 2 + 1
        raycaster.setFromCamera(mouse, camera)
        const intersects = raycaster.intersectObjects(intersectObjects)
        if (intersects.length > 0) {
            console.log('intersects: ', intersects);
            const intersect = intersects[0]
                const target = intersect.point
                clickMesh.position.copy(target)
                // arriveBehavior.target.copy(target)
                let from = vehicle.position
                // 假设你有一个THREE.Vector3对象 named threeTarget
                let yukaTarget = new YUKA.Vector3(target.x, target.y, target.z);
                let to = yukaTarget

                const path = navMesh.findPath(from, to)
                const path1 = new YUKA.Path()
                for(let item of path){
                    path1.add(new YUKA.Vector3(item.x,item.y,item.z))
                }
                showPathLine(path1)
                vehicle.steering.clear();
                // const followPathBehavior = new YUKA.FollowPathBehavior(path1)
                // followPathBehavior.weight = 10;
                // vehicle.steering.add(followPathBehavior)

                const onPathBehavior = new YUKA.OnPathBehavior(path1,.1,.1)
                onPathBehavior.weight = 10;
                vehicle.steering.add(onPathBehavior)

                const arriveBehavior = new YUKA.ArriveBehavior(yukaTarget, 3, .1)
                arriveBehavior.weight = 1;
                vehicle.steering.add(arriveBehavior)

        }
    })
    window.addEventListener('resize', () => {
        camera.aspect = threeContainer.value.clientWidth / threeContainer.value.clientHeight
        camera.updateProjectionMatrix()
        renderer.setSize(threeContainer.value.clientWidth, threeContainer.value.clientHeight)
    })
    requestAnimationFrame(function animate() {
        controls.update()
        controls.target.copy(vehicle.position)
        const delta = clock.getDelta()
        if(navMesh){
            const currentRegion = navMesh.getRegionForPoint(vehicle.position)
            if(currentRegion){
                const distance = currentRegion.distanceToPoint(vehicle.position)
                vehicle.position.y -= distance*.2
            }
        }
        // world.update(delta)
        if(entityManger)
        entityManger.update(delta)
        renderer.render(scene, camera)
        requestAnimationFrame(animate)

    })


})

</script>

<style lang="scss" scoped>
#threeContainer {
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    overflow: hidden;
    // background-color: #fff;
}
</style>
