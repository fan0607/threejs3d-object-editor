<template>
    <div ref="threeOcean" class="threeMap"></div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import font from '../assets/Alimama FangYuanTi VF_Regular.json?url'
import { FontLoader } from 'three/examples/jsm/Addons.js'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';
const threeOcean = ref();
onMounted(() => {
    if (!threeOcean.value) return;
    Ammo().then(function (Ammo: any) {
        const transformAux1 = new Ammo.btTransform();//变换
        let camera: THREE.PerspectiveCamera, controls: OrbitControls, scene: THREE.Scene, renderer: THREE.WebGLRenderer;
        const maxDistance = 16;//camera和vehicle
        const clock: THREE.Clock = new THREE.Clock();
        let objCar: any = null;

        // 物理引擎相关变量
        const gravityConstant = -9.8;
        let collisionConfiguration;//碰撞配置
        let dispatcher;//调度器
        let broadphase;//宽相
        let solver;//求解器
        let physicsWorld: any;//物理世界
        let rigidBodies: any = [];//刚体列表
        const margin = 0.05;//边距
        let time = 0;

        // 鼠标输入相关
        // let mouseCoords = new THREE.Vector2();
        // let raycaster = new THREE.Raycaster();
        // let ballMaterial = new THREE.MeshPhongMaterial( { color: 0x202020 } );

        //bullet内置宏
        const DISABLE_DEACTIVATION = 4;//禁用休眠
        const TRANSFORM_AUX = new Ammo.btTransform();//变换
        const ZERO_QUATERNION = new THREE.Quaternion(0, 0, 0, 1);//四元数

        // 车辆系统辅助
        // let speedometer;
        const syncList: any[] = []; // 车辆系统用syncList保存事件列表,不再使用rigidBodies变量.存放用于绘制和同步物理场景的方法

        let vehicleBody: any;
        let vehicleBodyTransform = new Ammo.btTransform();

        // 键盘相关
        const actions: { [key: string]: boolean } = {
            'acceleration': false,
            'braking': false,
            'left': false,
            'right': false
        };
        const keysActions: { [key: string]: string } = {
            KeyW: "acceleration",
            ArrowUp: "acceleration",
            KeyS: "braking",
            ArrowDown: "braking",
            ShiftLeft: "ShiftLeft",
            ShiftRight: "ShiftRight",
            KeyA: "left",
            ArrowLeft: "left",
            KeyD: "right",
            ArrowRight: "right"
        };
        init()
        animate()
        async function init() {
            initGraphics();
            initPhysics();
            createObjects();
            initInput();
            const fonts = await initFontLoader();
            scene.add(fonts);
        }
        function initGraphics() {
            camera = new THREE.PerspectiveCamera(60, threeOcean.value.clientWidth / threeOcean.value.clientHeight, 0.1, 2000);
            camera.position.y = 5;
            camera.position.z = -30;
            renderer = new THREE.WebGLRenderer({
                alpha: true,
                antialias: true,
            });
            renderer.setPixelRatio(window.devicePixelRatio);
            renderer.setSize(threeOcean.value.clientWidth, threeOcean.value.clientHeight);
            renderer.shadowMap.enabled = true;
            scene = new THREE.Scene();
            const ambientLight = new THREE.AmbientLight(0xfa6900, 10);
            scene.add(ambientLight);
            // 线性光
            const light = new THREE.DirectionalLight(0xffffff, 10);
            light.position.set(-10, 10, 5);
            light.castShadow = true;
            const d = 10;
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
            // controls.maxDistance = maxDistance;
            controls.maxPolarAngle = Math.PI / 2;
            window.addEventListener('resize', onWindowResize, false);
        }
        function onWindowResize() {
            camera.aspect = threeOcean.value.clientWidth / threeOcean.value.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(threeOcean.value.clientWidth, threeOcean.value.clientHeight);
        }
        function initPhysics() {
            collisionConfiguration = new Ammo.btDefaultCollisionConfiguration();
            dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration);
            broadphase = new Ammo.btDbvtBroadphase();
            solver = new Ammo.btSequentialImpulseConstraintSolver();
            physicsWorld = new Ammo.btDiscreteDynamicsWorld(dispatcher, broadphase, solver, collisionConfiguration);
            physicsWorld.setGravity(new Ammo.btVector3(0, gravityConstant, 0));
        }
        /**
         * 创建物体
         */
        function createObjects() {
            //ground
            createBox(new THREE.Vector3(0, -0.5, 0), ZERO_QUATERNION, 750, 1, 750, 0, 2);
            //车辆的创建
            objCar = createVehicle(new THREE.Vector3(0, 4, -20), ZERO_QUATERNION);

            createRondomObject(new THREE.Vector3(0, 20, 0), ZERO_QUATERNION, 3);

            const size = .75;
            const nw = 8;
            const nh = 6;
            for (let j = 0; j < nw; j++) {
                for (let i = 0; i < nh; i++) {
                    createBox(new THREE.Vector3(size * j - (size * (nw - 1)) / 2, size * i, 10), ZERO_QUATERNION, size, size, size, 10);
                }
            }
        }
        /**
         * 创建随机物体
         * @param pos 
         * @param quat 
         * @param objectSize 
         */
        function createRondomObject(pos: THREE.Vector3, quat: THREE.Quaternion, objectSize: number) {
            const numTypes = 4;
            const objectType = Math.ceil(Math.random() * numTypes);

            let threeObject = null;
            let shape = null;
            let radius = null;
            let height = null;

            switch (objectType) {
                case 1:
                    // Sphere
                    radius = 1 + Math.random() * objectSize;
                    threeObject = new THREE.Mesh(new THREE.SphereGeometry(radius, 20, 20), createRendomColorObjectMeatrial());
                    shape = new Ammo.btSphereShape(radius);
                    shape.setMargin(margin);
                    break;
                case 2:
                    // Box
                    const sx = 1 + Math.random() * objectSize;
                    const sy = 1 + Math.random() * objectSize;
                    const sz = 1 + Math.random() * objectSize;
                    threeObject = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz, 1, 1, 1), createRendomColorObjectMeatrial());
                    shape = new Ammo.btBoxShape(new Ammo.btVector3(sx * 0.5, sy * 0.5, sz * 0.5));
                    shape.setMargin(margin);
                    break;
                case 3:
                    // Cylinder
                    radius = 1 + Math.random() * objectSize;
                    height = 1 + Math.random() * objectSize;
                    threeObject = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, height, 20, 1), createRendomColorObjectMeatrial());
                    shape = new Ammo.btCylinderShape(new Ammo.btVector3(radius, height * 0.5, radius));
                    shape.setMargin(margin);
                    break;
                default:
                    // Cone
                    radius = 1 + Math.random() * objectSize;
                    height = 2 + Math.random() * objectSize;
                    threeObject = new THREE.Mesh(new THREE.CylinderGeometry(0, radius, height, 20, 2), createRendomColorObjectMeatrial());
                    shape = new Ammo.btConeShape(radius, height);
                    break;
            }

            const mass = objectSize * 5; // 体积越大质量越大

            createRigidBody(threeObject, shape, mass, pos, quat);

        }

        /**
         * 创建随机颜色的物体材质
         */
        function createRendomColorObjectMeatrial() {
            const color = Math.floor(Math.random() * (1 << 24));
            return new THREE.MeshPhongMaterial({ color: color });
        }
        /**
         * 创建刚体
         * @param threeObjects 
         * @param physicsShape 
         * @param mass 
         * @param pos 
         * @param quat 
         */
        function createRigidBody(threeObjects: THREE.Object3D, physicsShape: any, mass: number, pos: THREE.Vector3, quat: THREE.Quaternion) {
            threeObjects.position.copy(pos);
            threeObjects.quaternion.copy(quat);
            const transform = new Ammo.btTransform();
            transform.setIdentity();//设置初始位置
            transform.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z));//设置位置
            transform.setRotation(new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w));//设置旋转
            const motionState = new Ammo.btDefaultMotionState(transform);//设置运动状态
            const localInertia = new Ammo.btVector3(0, 0, 0);//设置惯性
            physicsShape.calculateLocalInertia(mass, localInertia);//计算惯性
            const rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, physicsShape, localInertia);//创建刚体信息
            const body = new Ammo.btRigidBody(rbInfo);//创建刚体
            threeObjects.userData.physicsBody = body;
            scene.add(threeObjects);
            if (mass > 0) {
                rigidBodies.push(threeObjects);
                // Disable deactivation
                body.setActivationState(4);
            }
            physicsWorld.addRigidBody(body);
            return body;
        }
        /**
         * 动画
         */
        function animate() {
            requestAnimationFrame(animate);
            render();
        }
        /**
         * 渲染
         */
        function render() {
            const deltaTime = clock.getDelta();
            updatePhysics(deltaTime);
            if (objCar) {
                controls.target.copy(objCar.position);
            }
            controls.update(deltaTime);
            if (camera.position.y < 0.1) {
                // camera.position.y = 0.1; 
            }
            renderer.render(scene, camera);
            time += deltaTime;
        }
        /**
         * 更新物理
         * @param deltaTime 
         */
        function updatePhysics(deltaTime: number) {
            if (vehicleBody) {//vehicleBody是车辆的刚体
                const d = 350;
                vehicleBody.getMotionState().getWorldTransform(vehicleBodyTransform);
                let origin = vehicleBodyTransform.getOrigin();
                if (origin.y() < -d || origin.y() > d || origin.x() < -d || origin.x() > d || origin.z() < -d || origin.z() > d
                ) {
                    vehicleBodyTransform.setOrigin(new Ammo.btVector3(0, 0, 0));
                    vehicleBody.getMotionState().setWorldTransform(vehicleBodyTransform);
                    vehicleBody.setCenterOfMassTransform(vehicleBodyTransform);
                }

            }

            for (let i = 0; i < rigidBodies.length; i++) {
                const objThree = rigidBodies[i];//获取刚体对应的three对象
                const objPhys = objThree.userData.physicsBody;//获取刚体
                const ms = objPhys.getMotionState();//获取运动状态
                if (ms) {
                    ms.getWorldTransform(transformAux1);//获取世界变换
                    const p = transformAux1.getOrigin();//获取位置
                    const q = transformAux1.getRotation();//获取旋转
                    objThree.position.set(p.x(), p.y(), p.z());//设置位置
                    objThree.quaternion.set(q.x(), q.y(), q.z(), q.w());//设置旋转
                }
            }
            for (let i = 0; i < syncList.length; i++)
                syncList[i](deltaTime);
            physicsWorld.stepSimulation(deltaTime, 10);
        }
        /**
         * 初始化键盘输入
         */
        function initInput() {
            window.addEventListener('keydown', function (e) {
                console.log('e: ', e.code);
                if (keysActions[e.code]) {
                    actions[keysActions[e.code]] = true;
                    if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
                        actions['acceleration'] = true;
                        actions['braking'] = true;
                    }
                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                }
            });

            window.addEventListener('keyup', function (e) {
                if (keysActions[e.code]) {
                    actions[keysActions[e.code]] = false;
                    if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
                        actions['acceleration'] = false;
                        actions['braking'] = false;
                    }
                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                }
            })
        }
        /**
         * 车辆系统
         * @param pos 位置
         * @param quat 姿态四元数
         * @param w width
         * @param l length
         * @param h height
         * @param mass 质量
         * @param friction 摩擦力
         */
        function createBox(pos: THREE.Vector3, quat: THREE.Quaternion, w: number, l: number, h: number, mass: number = 0, friction: number = 1) {
            const material = createRendomColorObjectMeatrial();
            const shape = new THREE.BoxGeometry(w, l, h, 1, 1, 1);
            const geometry = new Ammo.btBoxShape(new Ammo.btVector3(w * 0.5, l * 0.5, h * 0.5));
            const mesh = new THREE.Mesh(shape, material);
            mesh.position.copy(pos);
            mesh.quaternion.copy(quat);
            scene.add(mesh);
            const transform = new Ammo.btTransform();
            transform.setIdentity();
            transform.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z));
            transform.setRotation(new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w));
            const motionState = new Ammo.btDefaultMotionState(transform);
            const localInertia = new Ammo.btVector3(0, 0, 0);
            geometry.calculateLocalInertia(mass, localInertia);
            const rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, geometry, localInertia);
            const body = new Ammo.btRigidBody(rbInfo);
            body.setFriction(friction);

            physicsWorld.addRigidBody(body);
            if (mass > 0) {
                body.setActivationState(DISABLE_DEACTIVATION);
                // 同步物理场景和绘图空间
                function sync() {
                    const ms = body.getMotionState();
                    if (ms) {
                        ms.getWorldTransform(TRANSFORM_AUX);
                        const p = TRANSFORM_AUX.getOrigin();
                        const q = TRANSFORM_AUX.getRotation();
                        mesh.position.set(p.x(), p.y(), p.z());
                        mesh.quaternion.set(q.x(), q.y(), q.z(), q.w());
                    }
                }
                syncList.push(sync);
            }
        }

        /**
         * 绘制车轮
         * @param radius 
         * @param radius 
         */
        function createWheelMesh(radius: number, width: number) {
            const t = new THREE.CylinderGeometry(radius, radius, width, 24, 1);
            t.rotateZ(Math.PI / 2);
            const mesh = new THREE.Mesh(t, createRendomColorObjectMeatrial());
            mesh.add(new THREE.Mesh(new THREE.BoxGeometry(width * 1.5, radius * 1.75, radius * .25, 1, 1, 1), createRendomColorObjectMeatrial()));
            scene.add(mesh);
            return mesh;
        }

        /**
         * 绘制底盘
         * @param w chassisWidth
         * @param l chassisHeight
         * @param h chassisLength
         */
        function createChassisMesh(w: number, l: number, h: number) {
            const shape = new THREE.BoxGeometry(w, l, h, 1, 1, 1);
            const mesh = new THREE.Mesh(shape, createRendomColorObjectMeatrial());
            scene.add(mesh);
            return mesh;
        }
        /**
         * 绘制车辆
         * @param pos 位置
         * @param quat 姿态四元数
         */
        function createVehicle(pos: THREE.Vector3, quat: THREE.Quaternion) {
            // 车辆常量
            const chassisWidth = 1.8;
            const chassisHeight = .6;
            const chassisLength = 4;
            const massVehicle = 800;
            const wheelAxisPositionBack = -1;
            const wheelRadiusBack = .4;
            const wheelWidthBack = .3;
            const wheelHalfTrackBack = 1;
            const wheelAxisHeightBack = .3;
            const wheelAxisFrontPosition = 1.7;
            const wheelHalfTrackFront = 1;
            const wheelAxisHeightFront = .3;
            const wheelRadiusFront = .35;
            const wheelWidthFront = .2;
            const friction = 1000;
            const suspensionStiffness = 20.0; // 悬挂刚性
            const suspensionDamping = 2.3;    // 悬挂阻尼
            const suspensionCompression = 4.4;// 悬挂压缩
            const suspensionRestLength = 0.6; // 悬挂能恢复的长度
            const rollInfluence = 0.2;
            const steeringIncrement = .04;
            const steeringClamp = .5;
            const maxEngineForce = 2000;
            const maxBreakingForce = 100;

            // 底盘
            const geometry = new Ammo.btBoxShape(new Ammo.btVector3(chassisWidth * .5, chassisHeight * .5, chassisLength * .5));
            const transform = new Ammo.btTransform();
            transform.setIdentity();
            transform.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z));
            transform.setRotation(new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w));
            const motionState = new Ammo.btDefaultMotionState(transform);
            const localInertia = new Ammo.btVector3(0, 0, 0);
            geometry.calculateLocalInertia(massVehicle, localInertia);
            const body = new Ammo.btRigidBody(new Ammo.btRigidBodyConstructionInfo(massVehicle, motionState, geometry, localInertia));
            body.setActivationState(DISABLE_DEACTIVATION);
            physicsWorld.addRigidBody(body);
            const chassisMesh = createChassisMesh(chassisWidth, chassisHeight, chassisLength);

            // Raycast Vehicle
            let engineForce = 0;
            let vehicleSteering = 0;
            let breakingForce = 0;
            const tuning = new Ammo.btVehicleTuning(); // 保存车辆参数配置
            const rayCaster = new Ammo.btDefaultVehicleRaycaster(physicsWorld);
            const vehicle = new Ammo.btRaycastVehicle(tuning, body, rayCaster);
            vehicle.setCoordinateSystem(0, 1, 2);
            physicsWorld.addAction(vehicle);

            // 车轮
            const FRONT_LEFT = 0;
            const FRONT_RIGHT = 1;
            const BACK_LEFT = 2;
            const BACK_RIGHT = 3;

            const wheelMeshes: any = [];
            const wheelDirectionCS0 = new Ammo.btVector3(0, -1, 0);
            const wheelAxleCS = new Ammo.btVector3(-1, 0, 0);

            function addWheel(isFront: any, pos: THREE.Vector3, radius: number, width: number, index: number) {
                const wheelInfo = vehicle.addWheel(
                    pos,
                    wheelDirectionCS0,
                    wheelAxleCS,
                    suspensionRestLength,
                    radius,
                    tuning,
                    isFront
                );
                wheelInfo.set_m_suspensionStiffness(suspensionStiffness);
                wheelInfo.set_m_wheelsDampingRelaxation(suspensionDamping);
                wheelInfo.set_m_wheelsDampingCompression(suspensionCompression);
                wheelInfo.set_m_frictionSlip(friction);
                wheelInfo.set_m_rollInfluence(rollInfluence);
                wheelMeshes[index] = createWheelMesh(radius, width);
            }

            addWheel(true, new Ammo.btVector3(wheelHalfTrackFront, wheelAxisHeightFront, wheelAxisFrontPosition), wheelRadiusFront, wheelWidthFront, FRONT_LEFT);
            addWheel(true, new Ammo.btVector3(-wheelHalfTrackFront, wheelAxisHeightFront, wheelAxisFrontPosition), wheelRadiusFront, wheelWidthFront, FRONT_RIGHT);
            addWheel(false, new Ammo.btVector3(-wheelHalfTrackBack, wheelAxisHeightBack, wheelAxisPositionBack), wheelRadiusBack, wheelWidthBack, BACK_LEFT);
            addWheel(false, new Ammo.btVector3(wheelHalfTrackBack, wheelAxisHeightBack, wheelAxisPositionBack), wheelRadiusBack, wheelWidthBack, BACK_RIGHT);

            // 将键盘输入,物理和绘制同步
            function sync() {
                const speed = vehicle.getCurrentSpeedKmHour();
                // speedometer.innerHTML = (speed < 0 ? '(R) ' : '') + Math.abs(speed).toFixed(1) + ' km/h';
                breakingForce = 0;
                engineForce = 0;
                if (actions.acceleration) {
                    if (speed < -1)
                        breakingForce = maxBreakingForce;
                    else engineForce = maxEngineForce;
                }
                if (actions.braking) {
                    if (speed > 1)
                        breakingForce = maxBreakingForce;
                    else engineForce = -maxEngineForce / 2;
                }
                if (actions.left) {
                    if (vehicleSteering < steeringClamp)
                        vehicleSteering += steeringIncrement;
                }
                else {
                    if (actions.right) {
                        if (vehicleSteering > -steeringClamp)
                            vehicleSteering -= steeringIncrement;
                    }
                    else {
                        if (vehicleSteering < -steeringIncrement)
                            vehicleSteering += steeringIncrement;
                        else {
                            if (vehicleSteering > steeringIncrement)
                                vehicleSteering -= steeringIncrement;
                            else {
                                vehicleSteering = 0;
                            }
                        }
                    }
                }

                vehicle.applyEngineForce(engineForce, BACK_LEFT);
                vehicle.applyEngineForce(engineForce, BACK_RIGHT);
                vehicle.setBrake(breakingForce / 2, FRONT_LEFT);
                vehicle.setBrake(breakingForce / 2, FRONT_RIGHT);
                vehicle.setBrake(breakingForce, BACK_LEFT);
                vehicle.setBrake(breakingForce, BACK_RIGHT);
                vehicle.setSteeringValue(vehicleSteering, FRONT_LEFT);
                vehicle.setSteeringValue(vehicleSteering, FRONT_RIGHT);
                let tm, p, q, i;
                const n = vehicle.getNumWheels();
                //车轮
                for (i = 0; i < n; i++) {
                    vehicle.updateWheelTransform(i, true);//更新车轮变换
                    tm = vehicle.getWheelTransformWS(i);//获取车轮世界变换
                    p = tm.getOrigin();//获取位置
                    q = tm.getRotation();//获取旋转
                    wheelMeshes[i].position.set(p.x(), p.y(), p.z());//设置位置
                    wheelMeshes[i].quaternion.set(q.x(), q.y(), q.z(), q.w());//设置旋转
                }

                // console.log(vehicle);
                //底盘
                tm = vehicle.getChassisWorldTransform();
                vehicle.getChassisWorldTransform();
                p = tm.getOrigin();
                q = tm.getRotation();
                chassisMesh.position.set(p.x(), p.y(), p.z());
                chassisMesh.quaternion.set(q.x(), q.y(), q.z(), q.w());

            }
            vehicleBody = vehicle.getRigidBody();
            syncList.push(sync);
            return chassisMesh;
        }

    });
})
async function initFontLoader() {
    const loader = new FontLoader();
    let fonts = await new Promise<THREE.Mesh>((resolve) => {
        loader.load(font, (font) => {
            const geometry = new TextGeometry('上下左右控制方向', {
                font: font,
                size: 1.6,
                height: .05,
                curveSegments: 12,//曲线段数
                bevelEnabled: true,
                bevelThickness: .010,//斜角厚度
                bevelSize: .08,//斜角大小
                bevelOffset: 0,
                bevelSegments: 5
            });
            const material = new THREE.MeshPhongMaterial({ color: 0xffffff });
            const mesh = new THREE.Mesh(geometry, material);
            // mesh.applyQuaternion(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI / 2));
            mesh.rotateY(Math.PI);
            mesh.rotateX(-Math.PI / 2);
            resolve(mesh);
        }, (xhr) => {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        }, (err) => {
            console.log('err: ', err);
            console.log('An error happened');

        });
    })
    return fonts;
}



</script>

<style lang="scss" scoped>
.threeMap {
    width: 100%;
    height: 100%;
    position: absolute;
    overflow: hidden;
    top: 0;
    left: 0;
    z-index: 0;
    background-image: -moz-linear-gradient(0deg, rgb(255, 216, 189), rgb(255, 185, 179));
    background-image: -webkit-linear-gradient(0deg, rgb(255, 216, 189), rgb(255, 185, 179));
    background-image: linear-gradient(0deg, rgb(255, 216, 189), rgb(255, 185, 179));
}
</style>
