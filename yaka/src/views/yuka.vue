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
    const camera = new THREE.PerspectiveCamera(75, threeContainer.value.clientWidth / threeContainer.value.clientHeight, 0.1, 1000)
    camera.position.set(5, 10, 10)
    camera.lookAt(0, 0, 0)
    const renderer = new THREE.WebGLRenderer({
        antialias: true,
        // alpha: true
    })
    renderer.setSize(threeContainer.value.clientWidth, threeContainer.value.clientHeight)
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
    coneMesh.castShadow = true
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
    // path.loop = true
    vehicle.position.copy(path.current())
    vehicle.smoother = new YUKA.Smoother( 20 );
    const followPathBehavior = new YUKA.FollowPathBehavior(path)
    // vehicle.steering.add(followPathBehavior)
    const keepOnPathBehavior = new YUKA.OnPathBehavior(path)
    keepOnPathBehavior.weight = 10
    // vehicle.steering.add(keepOnPathBehavior)
    const arriveBehavior = new YUKA.ArriveBehavior(new YUKA.Vector3(0, 0, 0), 1, 0.01)
    arriveBehavior.weight = 10
    vehicle.steering.add(arriveBehavior)
    const entityManger = new YUKA.EntityManager()
    entityManger.add(vehicle)
    //阻挡物
    const boxGeometry = new THREE.BoxGeometry(1, 1, 1)
    boxGeometry.computeBoundingSphere()
    const boxMaterial = new THREE.MeshStandardMaterial({
        color: 0xff0000
    })
    const boxMesh = new THREE.Mesh(boxGeometry, boxMaterial)
    boxMesh.position.set(0, 0, 5)
    boxMesh.castShadow = true
    scene.add(boxMesh)

    const obstacle = new YUKA.GameEntity()
    obstacle.setRenderComponent(boxMesh,(entity, renderTarget)=>{
        // renderTarget.matrix.copy(entity.worldMatrix)
    })
    obstacle.position.copy(boxMesh.position)
    obstacle.boundingRadius = boxGeometry.boundingSphere.radius
    entityManger.add(obstacle)
    const aviodObstacleBehavior = new YUKA.ObstacleAvoidanceBehavior([obstacle])
    aviodObstacleBehavior.weight = 20   
    vehicle.steering.add(aviodObstacleBehavior)
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
        const intersects = raycaster.intersectObjects(scene.children)
        if (intersects.length > 0) {
            console.log('intersects: ', intersects);
            const intersect = intersects[0]
            if (intersect.object === groundMesh) {
                const target = intersect.point
                clickMesh.position.copy(target)
                arriveBehavior.target.copy(target)
            }
        }
    })
    window.addEventListener('resize', () => {
        camera.aspect = threeContainer.value.clientWidth / threeContainer.value.clientHeight
        camera.updateProjectionMatrix()
        renderer.setSize(threeContainer.value.clientWidth, threeContainer.value.clientHeight)
    })
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
