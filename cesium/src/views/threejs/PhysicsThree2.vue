<template>
    <div ref="threeOcean" class="threeMap"></div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as CANNON from 'cannon-es'
//加载gltf模型
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
const threeOcean = ref(null)
let cubeMesh, world, BBBoxBody, planeBody, defaultMaterial, defaultContactMaterial, box, boxBody;
let vehicle, options;
const keysPressed = { W: false, A: false, S: false, D: false };
onMounted(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    threeOcean.value.appendChild(renderer.domElement);
    defaultMaterial = new CANNON.Material('default');
    defaultContactMaterial = new CANNON.ContactMaterial(
        defaultMaterial,
        defaultMaterial,
        {
            friction: 0.1,
            restitution: 0,
        }
    );
    world = new CANNON.World({
        gravity: new CANNON.Vec3(0, -9.82, 0), // m/s²
    })
    world.defaultContactMaterial = defaultContactMaterial;
    world.addContactMaterial(defaultContactMaterial);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.set(500, 800, 1300);
    camera.lookAt(0, 0, 0);
    scene.add(camera);

    scene.add(camera);
    const ambientLight = new THREE.AmbientLight(0x606060, 3);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 3);
    directionalLight.position.set(1, 0.75, 0.5).normalize();
    scene.add(directionalLight);
    gridHelper(scene);
    addObject(scene);
    box = addCube(scene);
    document.addEventListener('keydown', onDocumentKeyDown, false);
    document.addEventListener('keyup', onDocumentKeyUp, false);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.2;
    controls.enableZoom = true;
    controls.enableRotate = true;
    controls.enablePan = true;
    const axisHelper = new THREE.AxesHelper(1000);
    scene.add(axisHelper);

    var chassisShape;
    chassisShape = new CANNON.Box(new CANNON.Vec3(25, 25,25));
    var chassisBody = new CANNON.Body({ mass: 10 });
    chassisBody.addShape(chassisShape);
    chassisBody.position.set(200, 30, 0);
    chassisBody.angularVelocity.set(0, 0, 0.5);
    vehicle = new CANNON.RaycastVehicle({
        chassisBody: chassisBody,
        indexRightAxis: 0,
        indexForwardAxis: 2,
        indexUpAxis: 1,
    });
    options = {
        radius: 0.5,
        directionLocal: new CANNON.Vec3(0, 0, -1),
        suspensionStiffness: 30,
        suspensionRestLength: 0.3,
        frictionSlip: 5,
        dampingRelaxation: 2.3,
        dampingCompression: 4.4,
        maxSuspensionForce: 100000,
        rollInfluence:  0.01,
        axleLocal: new CANNON.Vec3(0, 1, 0),
        chassisConnectionPointLocal: new CANNON.Vec3(1, 1, 0),
        maxSuspensionTravel: 0.3,
        customSlidingRotationalSpeed: -30,
        useCustomSlidingRotationalSpeed: true
    };
    options.chassisConnectionPointLocal.set(1, 1, 0);
    vehicle.addWheel(options);

    options.chassisConnectionPointLocal.set(1, -1, 0);
    vehicle.addWheel(options);

    options.chassisConnectionPointLocal.set(-1, 1, 0);
    vehicle.addWheel(options);

    options.chassisConnectionPointLocal.set(-1, -1, 0);
    vehicle.addWheel(options);

    vehicle.addToWorld(world);
    var wheelBodies = [];
    for (var i = 0; i < vehicle.wheelInfos.length; i++) {
        var wheel = vehicle.wheelInfos[i];
        var cylinderShape = new CANNON.Cylinder(wheel.radius, wheel.radius, wheel.radius / 2, 20);
        var wheelBody = new CANNON.Body({
            mass: 0
        });
        wheelBody.type = CANNON.Body.KINEMATIC;
        wheelBody.collisionFilterGroup = 0; // turn off collisions
        var q = new CANNON.Quaternion();
        q.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), Math.PI / 2);// 把竖着的圆柱体放倒作为车轮
        wheelBody.addShape(cylinderShape, new CANNON.Vec3(), q);
        wheelBodies.push(wheelBody);
        world.addBody(wheelBody);
    }
    world.addEventListener('postStep', function () {
        for (var i = 0; i < vehicle.wheelInfos.length; i++) {
            var t = vehicle.wheelInfos[i].worldTransform;
            var wheelBody = wheelBodies[i];
            wheelBody.position.copy(t.position);
            wheelBody.quaternion.copy(t.quaternion);
            }
    });
    var maxSteerVal = 0.5;
    var maxForce = 100000;
    var brakeForce = 100000000;
    function handler(event){
            var up = (event.type == 'keyup');

            if(!up && event.type !== 'keydown'){
                return;
            }

            vehicle.setBrake(0, 0);
            vehicle.setBrake(0, 1);
            vehicle.setBrake(0, 2);
            vehicle.setBrake(0, 3);

            switch(event.keyCode){

            case 38: // forward
                vehicle.applyEngineForce(up ? 0 : -maxForce, 2);
                vehicle.applyEngineForce(up ? 0 : -maxForce, 3);
                break;

            case 40: // backward
                vehicle.applyEngineForce(up ? 0 : maxForce, 2);
                vehicle.applyEngineForce(up ? 0 : maxForce, 3);
                break;

            case 66: // b
                vehicle.setBrake(brakeForce, 0);
                vehicle.setBrake(brakeForce, 1);
                vehicle.setBrake(brakeForce, 2);
                vehicle.setBrake(brakeForce, 3);
                break;

            case 39: // right
                vehicle.setSteeringValue(up ? 0 : -maxSteerVal, 0);
                vehicle.setSteeringValue(up ? 0 : -maxSteerVal, 1);
                break;

            case 37: // left
                vehicle.setSteeringValue(up ? 0 : maxSteerVal, 0);
                vehicle.setSteeringValue(up ? 0 : maxSteerVal, 1);
                break;

            }
    }
    document.onkeydown = handler;
    document.onkeyup = handler;



    (function animate() {
        requestAnimationFrame(animate);
        // addForce();
        const timeDelta = 1 / 60;
        world.step(timeDelta)
        cubeMesh.position.copy(chassisBody.position)
        cubeMesh.quaternion.copy(chassisBody.quaternion)
        box.position.copy(boxBody.position)
        box.quaternion.copy(boxBody.quaternion)
        updateMovement();
        controls.update();
        renderer.render(scene, camera);
    })();

})
function gridHelper(scene) {
    const gridHelper = new THREE.GridHelper(1000, 20);
    planeBody = new CANNON.Body({
        mass: 0, // kg
        shape: new CANNON.Plane(),
        material: defaultMaterial,
    })
    planeBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2)
    planeBody.position.set(0, 0, 0) // m
    world.addBody(planeBody)
    const plane = new THREE.PlaneGeometry(1000, 1000, 100, 100);
    const planeMaterial = new THREE.MeshLambertMaterial({ color: 0xfeb74c });
    const planeMesh = new THREE.Mesh(plane, planeMaterial);
    planeMesh.rotation.x = -Math.PI / 2;
    planeMesh.position.set(0, 0, 0);
    scene.add(planeMesh);
    scene.add(gridHelper);
}
function addObject(scene) {
    BBBoxBody = new CANNON.Body({
        mass: 10, // kg
        material: defaultMaterial,
        shape: new CANNON.Box(new CANNON.Vec3(25, 25, 25)),
    })
    BBBoxBody.position.set(0, 25, 0) // m
    world.addBody(BBBoxBody)

    const cube = new THREE.BoxGeometry(50, 50, 50);
    const cubeMaterial = new THREE.MeshLambertMaterial({ color: 0x66cc00 });
    cubeMesh = new THREE.Mesh(cube, cubeMaterial);
    const sphere = new THREE.SphereGeometry(25, 50, 50);
    const sphereMaterial = new THREE.MeshLambertMaterial({ color: 0x66cc00 });
    const sphereMesh = new THREE.Mesh(sphere, sphereMaterial);
    sphereMesh.position.set(0, 0, -25);
    cubeMesh.add(sphereMesh)
    cubeMesh.position.set(0, 25, 0);
    scene.add(cubeMesh);
}

function onDocumentKeyDown(event) {
    switch (event.keyCode) {
        case 87: keysPressed.W = true; break; // W
        case 65: keysPressed.A = true; break; // A
        case 83: keysPressed.S = true; break; // S
        case 68: keysPressed.D = true; break; // D
    }
}

function onDocumentKeyUp(event) {
    switch (event.keyCode) {
        case 87: keysPressed.W = false; break; // W
        case 65: keysPressed.A = false; break; // A
        case 83: keysPressed.S = false; break; // S
        case 68: keysPressed.D = false; break; // D
    }
}
/* function updateMovement() {
    const moveDelta = 5;
    const rotationDelta = THREE.MathUtils.degToRad(5);

    // Get the forward direction of the object
    let forward = new CANNON.Vec3(0, 0, -1);
    forward = BBBoxBody.quaternion.vmult(forward);

    if (keysPressed.W) {
        BBBoxBody.position.x += forward.x * moveDelta;
        BBBoxBody.position.z += forward.z * moveDelta;
    }
    if (keysPressed.S) {
        BBBoxBody.position.x -= forward.x * moveDelta;
        BBBoxBody.position.z -= forward.z * moveDelta;
    }
    if (keysPressed.A) {
        let q = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, 1, 0), rotationDelta);
        BBBoxBody.quaternion = q.mult(BBBoxBody.quaternion).normalize();
    }
    if (keysPressed.D) {
        let q = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, 1, 0), -rotationDelta);
        BBBoxBody.quaternion = q.mult(BBBoxBody.quaternion).normalize();
    }
} */
function updateMovement() {
    const forceMagnitude = 500; // Adjust as needed for desired speed

    // Get the forward direction of the object
    let forward = new CANNON.Vec3(0, 0, -1);
    forward = BBBoxBody.quaternion.vmult(forward).scale(forceMagnitude);
    const positon = BBBoxBody.position.clone();
    positon.y -= 10;
    if (keysPressed.W) {
        BBBoxBody.applyForce(forward, positon);
    }
    /* if (keysPressed.W) {
        BBBoxBody.velocity.x = forward.x * moveSpeed;
        BBBoxBody.velocity.z = forward.z * moveSpeed;
    } */

    if (keysPressed.S) {
        BBBoxBody.applyForce(forward.scale(-1), BBBoxBody.position);
    }

    // For rotation, you can still use quaternions to rotate the body:
    const rotationDelta = THREE.MathUtils.degToRad(2); // Smaller value for smoother rotation
    if (keysPressed.A) {
        let q = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, 1, 0), rotationDelta);
        BBBoxBody.quaternion = q.mult(BBBoxBody.quaternion).normalize();
    }
    if (keysPressed.D) {
        let q = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, 1, 0), -rotationDelta);
        BBBoxBody.quaternion = q.mult(BBBoxBody.quaternion).normalize();
    }
}

function addCube(scene) {
    const cube = new THREE.BoxGeometry(50, 50, 50);
    const cubeMaterial = new THREE.MeshLambertMaterial({ color: 0xe1cead });
    let c = new THREE.Mesh(cube, cubeMaterial);
    c.position.set(100, 25, 25);
    scene.add(c);
    boxBody = new CANNON.Body({
        shape: new CANNON.Box(new CANNON.Vec3(25, 25, 25)),
        mass: 10,
        material: defaultMaterial,
    })
    boxBody.position.set(100, 25, 25) // m
    world.addBody(boxBody)
    return c;

}




</script>

<style lang="scss" scoped>
.threeMap {
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
</style>
