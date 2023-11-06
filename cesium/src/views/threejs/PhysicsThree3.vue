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
// import * as Ammo from 'three/examples/jsm/libs/ammo.wasm.js';
const threeOcean = ref(null);
onMounted(() => {
    Ammo().then(function (Ammo) {
    var transformAux1 = new Ammo.btTransform();
    var container, stats;
    var camera, controls, scene, renderer;
    var textureLoader;
    var clock = new THREE.Clock();

    // 物理引擎相关变量
    var gravityConstant = -9.8;
    var collisionConfiguration;
    var dispatcher;
    var broadphase;
    var solver;
    var physicsWorld;
    var rigidBodies = [];
    var margin = 0.05;
    // var transformAux1 = new Ammo.btTransform();

    //
    var time = 0;

    // 鼠标输入相关
    var mouseCoords = new THREE.Vector2();
    var raycaster = new THREE.Raycaster();
    var ballMaterial = new THREE.MeshPhongMaterial( { color: 0x202020 } );
    init()
    animate()
    function init(){
        initGraphics();
        initPhysics();
        createObjects();
        initInput();
    }
    function initGraphics(){
        camera = new THREE.PerspectiveCamera(60, window.innerWidth/window.innerHeight, 0.1, 2000);
        camera.position.x = -7;
        camera.position.y = 5;
        camera.position.z = 8;
        renderer = new THREE.WebGLRenderer({
            alias: true,
            alpha: true
        });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.shadowMap.enabled = true;
        scene = new THREE.Scene();
        const ambientLight = new THREE.AmbientLight(0xfa6900,10);
        scene.add(ambientLight);
        // 线性光
        var light = new THREE.DirectionalLight(0xffffff, 10);
        light.position.set(-10, 10, 5);
        light.castShadow = true;
        var d = 10;
        light.shadow.camera.left = -d;
        light.shadow.camera.right = d;
        light.shadow.camera.top = d;
        light.shadow.camera.bottom = -d;

        light.shadow.camera.near = 2;
        light.shadow.camera.far = 2;

        light.shadow.mapSize.x = 1024;
        light.shadow.mapSize.y = 1024;

        scene.add(light);
        threeOcean.value.appendChild(renderer.domElement);
        controls = new OrbitControls(camera, renderer.domElement);
        controls.target.y = 2;
        window.addEventListener('resize', onWindowResize, false);
    }
    function onWindowResize(){
        camera.aspect = window.innerWidth/window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
    function initPhysics(){
        collisionConfiguration = new Ammo.btDefaultCollisionConfiguration();
        dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration);
        broadphase = new Ammo.btDbvtBroadphase();
        solver = new Ammo.btSequentialImpulseConstraintSolver();
        physicsWorld = new Ammo.btDiscreteDynamicsWorld(dispatcher, broadphase, solver, collisionConfiguration);
        physicsWorld.setGravity(new Ammo.btVector3(0, gravityConstant, 0));
    }
    function createObjects(){
        const pos = new THREE.Vector3();
        const quat = new THREE.Quaternion();
        // 创建地板
        pos.set(0, -0.5, 0);
        quat.set(0, 0, 0, 1);
        const ground = createParalellepiped(40, 1, 40, 0, pos, quat, new THREE.MeshPhongMaterial({ color: 0x202020 }));
        ground.castShadow = true;
        ground.receiveShadow = true;
    }
    function createParalellepiped(sx,sy,sz,mass,pos,quat,material){
        const threeObject = new THREE.Mesh(new THREE.BoxGeometry(sx,sy,sz,1,1,1),material);
        const shape = new Ammo.btBoxShape(new Ammo.btVector3(sx*0.5,sy*0.5,sz*0.5));
        shape.setMargin(margin);
        createRigidBody(threeObject,shape,mass,pos,quat);
        return threeObject;
    }
    function createRigidBody(threeObjects,physicsShape,mass,pos,quat){
        threeObjects.position.copy(pos);
        threeObjects.quaternion.copy(quat);
        const transform = new Ammo.btTransform();
        transform.setIdentity();//设置初始位置
        transform.setOrigin(new Ammo.btVector3(pos.x,pos.y,pos.z));//设置位置
        transform.setRotation(new Ammo.btQuaternion(quat.x,quat.y,quat.z,quat.w));//设置旋转
        const motionState = new Ammo.btDefaultMotionState(transform);//设置运动状态
        const localInertia = new Ammo.btVector3(0,0,0);//设置惯性
        physicsShape.calculateLocalInertia(mass,localInertia);//计算惯性
        const rbInfo = new Ammo.btRigidBodyConstructionInfo(mass,motionState,physicsShape,localInertia);//创建刚体信息
        const body = new Ammo.btRigidBody(rbInfo);//创建刚体
        threeObjects.userData.physicsBody = body;
        scene.add(threeObjects);
        if(mass>0){
            rigidBodies.push(threeObjects);
            // Disable deactivation
            body.setActivationState(4);
        }
        physicsWorld.addRigidBody(body);
        return body;
    }
    function animate(){
        requestAnimationFrame(animate);
        render();
    }
    function render(){
        const deltaTime = clock.getDelta();
        updatePhysics(deltaTime);
        controls.update(deltaTime);
        renderer.render(scene, camera);
        time += deltaTime;
    }
    function updatePhysics(deltaTime){
        physicsWorld.stepSimulation(deltaTime,10);
        for(let i=0;i<rigidBodies.length;i++){
            const objThree = rigidBodies[i];//获取刚体对应的three对象
            const objPhys = objThree.userData.physicsBody;//获取刚体
            const ms = objPhys.getMotionState();//获取运动状态
            if(ms){
                ms.getWorldTransform(transformAux1);//获取世界变换
                const p = transformAux1.getOrigin();//获取位置
                const q = transformAux1.getRotation();//获取旋转
                objThree.position.set(p.x(),p.y(),p.z());//设置位置
                objThree.quaternion.set(q.x(),q.y(),q.z(),q.w());//设置旋转
            }
        }
    }
    function initInput() {

        window.addEventListener( 'mousedown', function( event ) {

            mouseCoords.set(
                    ( event.clientX / window.innerWidth ) * 2 - 1,
                    - ( event.clientY / window.innerHeight ) * 2 + 1
            );

            raycaster.setFromCamera( mouseCoords, camera );

            // Creates a ball and throws it
            var ballMass = 35;
            var ballRadius = 0.4;

            var ball = new THREE.Mesh( new THREE.SphereGeometry( ballRadius, 14, 10 ), ballMaterial );
            ball.castShadow = true;
            ball.receiveShadow = true;
            var ballShape = new Ammo.btSphereShape( ballRadius );
            ballShape.setMargin( margin );
            var pos = new THREE.Vector3();
            var quat = new THREE.Quaternion();
            pos.copy( raycaster.ray.direction );
            pos.add( raycaster.ray.origin );
            quat.set( 0, 0, 0, 1 );
            var ballBody = createRigidBody( ball, ballShape, ballMass, pos, quat );

            pos.copy( raycaster.ray.direction );//设置位置
            pos.multiplyScalar( 24 );
            ballBody.setLinearVelocity( new Ammo.btVector3( pos.x, pos.y, pos.z ) );//设置线性速度

        }, false );

}
});
})


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
