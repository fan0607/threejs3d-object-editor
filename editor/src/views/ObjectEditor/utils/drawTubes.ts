import * as THREE from "three";
import { type Ref, ref } from "vue";
let camera: any, controls, renderer: any, scene, objects;
export function initDraw(
  Ascene: any,
  Arenderer: any,
  Acamera: any,
  Acontrols: any,
  Aobjects: any,
) {
  [scene, renderer, camera, controls, objects] = [
    Ascene,
    Arenderer,
    Acamera,
    Acontrols,
    Aobjects,
  ];
}
export function drawTubes(
  scene: THREE.Scene,
  models: any,
  radius = 5,
  color: number
) {
  const name = `tube${objects.length + 1}`;
  const points: Ref<Array<THREE.Vector3>> = ref([]);
  const userDatas: any = [];
  const names: Array<string> = [];
  models.forEach((item: THREE.Mesh) => {
    const pos = ref(item.position);
    const userData = ref(item.userData);
    points.value.push(pos.value);
    userDatas.push(userData.value);
    names.push(userData.value.name);
  });
  const curve = new THREE.CatmullRomCurve3(points.value);
  const geometry = new THREE.TubeGeometry(curve, 20, radius, 8, false);
  const material = new THREE.MeshBasicMaterial({
    color: 0x00ff00,
    transparent: true,
    opacity: 0.5,
    blending: THREE.AdditiveBlending,
  });
  //流动线
  const curveObject = new THREE.Mesh(geometry, material);
  curveObject.userData = userDatas;
  curveObject.userData.referTube = names;
  curveObject.userData.name = name;
  scene.add(curveObject);
  // objects.push(curveObject);
  particles();
  function particles() {
    const particleCount = 1000;
    const particles = new THREE.BufferGeometry();
    const positions = [];
    for (let i = 0; i < particleCount; i++) {
      const position = curve.getPoint(i / particleCount);
      positions.push(position.x, position.y, position.z);
    }

    particles.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(positions, 3)
    );
    const particleMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.1,
    });
    const particleSystem = new THREE.Points(particles, particleMaterial);
    particleSystem.userData.referParticleSystem = names;
    scene.add(particleSystem);
    function animate() {
      requestAnimationFrame(animate);
      const positions = particleSystem.geometry.attributes.position.array;
      for (let i = 0; i < positions.length; i += 3) {
        // 为每个粒子计算在曲线上的一个新位置
        let t = ((Date.now() % 1000) / 1000) * (i / positions.length); // 这个比例因子决定了粒子沿曲线的速度和分布

        if (curveObject.userData[0].data < curveObject.userData[1].data) {
          t = 1 - ((Date.now() % 1000) / 1000) * (i / positions.length);
        }
        const position = curve.getPoint(t);

        // positions[i] = position.x;
        // positions[i + 1] = position.y;
        // positions[i + 2] = position.z;
        //在管道扩散
        positions[i] = position.x + ((Math.random() - 0.5) * radius) / 2; //乘以半径的一半
        positions[i + 1] = position.y + ((Math.random() - 0.5) * radius) / 2;
        positions[i + 2] = position.z + ((Math.random() - 0.5) * radius) / 2;
      }

      particleSystem.geometry.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    }

    animate();
  }
}
