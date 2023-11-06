<template>
    <div id="threeContainer" ref="threeContainer"></div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as YUKA from 'yuka'

const threeContainer = ref(null)
onMounted(() => {
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    camera.position.set(5, 10, 10)
    camera.lookAt(0, 0, 0)
    const renderer = new THREE.WebGLRenderer({
        antialias: true,
        // alpha: true
    })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.shadowMap.enabled = true
    threeContainer.value.appendChild(renderer.domElement)
    const groundGeometry = new THREE.PlaneGeometry(100, 100)
    const groundMaterial = new THREE.MeshStandardMaterial({
        color: 0x999999,
        // side: THREE.DoubleSide
    })
    const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial)

    groundMesh.receiveShadow = true
    groundMesh.rotation.x = -Math.PI/2
    groundMesh.position.y = -0.5
    scene.add(groundMesh)
    const light = new THREE.SpotLight(0xffffff,3, 100, Math.PI/6, 0.5, .5)//prenumber是光源强度，
    light.position.set(0,30, 10)
    light.castShadow = true
    scene.add(light)
    const lightHelper = new THREE.SpotLightHelper(light)
    scene.add(lightHelper)
    
    const controls = new OrbitControls(camera, renderer.domElement)
    const clock = new THREE.Clock()
    const axisHelper = new THREE.AxesHelper(5)
    scene.add(axisHelper)
    

    const coneGeometry = new THREE.ConeGeometry(.2, 1, 32)
    const coneMaterial = new THREE.MeshStandardMaterial({
        color: 0x00ff00
    })
    const coneMesh = new THREE.Mesh(coneGeometry, coneMaterial)
    //改变几何体顶点和默认方向时，geometry可以不用更新，但是mesh的matrix需要更新
    // coneGeometry.rotateX(Math.PI / 2)
    // coneMesh.quaternion.copy(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI / 2))
    coneMesh.position.set(0, 0.5, 0)
    coneMesh.matrixAutoUpdate = false
    scene.add(coneMesh)

    const vehicle = new YUKA.Vehicle()
    vehicle.maxSpeed = 5
    vehicle.setRenderComponent(coneMesh,callback)
    function callback(entity, renderTarget){
        renderTarget.matrix.copy(entity.worldMatrix)
        //旋转矩阵绕x轴旋转
        renderTarget.matrix.multiply(new THREE.Matrix4().makeRotationX(Math.PI / 2))
        // renderTarget.position.copy(entity.position)
        // renderTarget.quaternion.copy(entity.rotation)
    }

    const path = new YUKA.Path()
    path.add(new YUKA.Vector3(0, 0, 0))
    path.add(new YUKA.Vector3(0, 0, 10))
    path.add(new YUKA.Vector3(10, 0, 10))
    path.add(new YUKA.Vector3(10, 0, 0))
    path.add(new YUKA.Vector3(0, 0, 0))
    path.loop = true
    vehicle.position.copy(path.current())

    const followPathBehavior = new YUKA.FollowPathBehavior(path)
    vehicle.steering.add(followPathBehavior)

    const entityManger = new YUKA.EntityManager()
    entityManger.add(vehicle)
    showPathLine(path)
    function showPathLine(path) {
        let points = []
        for (let i = 0; i < path._waypoints.length; i++) {
            points.push(path._waypoints[i].x, path._waypoints[i].y, path._waypoints[i].z)
        }
        const lineMaterial = new THREE.LineBasicMaterial({
            color: 0xff0000
        })
        const lineGeometry = new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(points, 3))
        const line = new THREE.Line(lineGeometry, lineMaterial)
        scene.add(line)
    }
    requestAnimationFrame(function animate() {
        controls.update()
        const delta = clock.getDelta()
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
