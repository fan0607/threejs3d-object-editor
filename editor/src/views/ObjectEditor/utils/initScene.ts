import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { initFontLoader } from './initFontLoader'
import vertexShader from '../glsl/stars/vertexShader.glsl?raw'
import fragmentShader from '../glsl/stars/fragmentShader.glsl?raw'
import { type Ref } from 'vue';
import { createFlowWallMat,creatWallByPath } from '../glsl/flowLights/index';
import bgTexture from "@/assets/grids/bg.png?url";
import flowTexture from "@/assets/grids/flow.png?url";
export async function initScene(threeOceanWidth:number, threeOceanHeight:number, threeOcean:Ref<HTMLElement>):Promise<[THREE.Scene, THREE.WebGLRenderer, THREE.PerspectiveCamera, OrbitControls]> {
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0xcccccc, 1000, 5000);
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: false,
    logarithmicDepthBuffer: true
  });
  renderer.setSize(threeOceanWidth, threeOceanHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap; // 默认的是，没有设置的这个清晰 THREE.PCFShadowMap
  threeOcean.value.appendChild(renderer.domElement);
  const camera = initCamera(threeOceanWidth, threeOceanHeight, scene);
  const controls = initControls(camera, renderer);
  const font = await initFontLoader('按住 Ctrl 选中物体',new THREE.Vector3(-10, 0, 0));
  const font2 = await initFontLoader('按住 Shift 删除物体',new THREE.Vector3(-10, 0, 50));
  const font3 = await initFontLoader('按住 Esc 取消选中物体',new THREE.Vector3(-10, 0, -50));
  if(font&&font2&&font3)
  scene.add(font,font2,font3);

	const path = [
    [500, 0 ,500],
    [500, 0 ,-500],
    [-500, 0 ,-500],
    [-500, 0 ,500],
    [500, 0 ,500],
  ];
  const wallMat = createFlowWallMat({bgUrl:bgTexture,flowUrl:flowTexture});
  const wallMesh = creatWallByPath({
    material: wallMat,
    path,
    height: 100,
  });

  scene.add(wallMesh);

  // 创建WebGLRenderTarget
  const renderTarget = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight);

  // 创建星空材质和几何体
  const starMaterial = new THREE.ShaderMaterial({
      uniforms: {
          time: { value: 0 }
      },
      vertexShader: vertexShader,
      fragmentShader: fragmentShader
  });
  const starGeometry = new THREE.PlaneGeometry(2, 2); // 使用一个平面
  const starMesh = new THREE.Mesh(starGeometry, starMaterial);

  // 创建一个专用场景和相机来渲染星空
  const starScene = new THREE.Scene();
  const starCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  starScene.add(starMesh);
  const clock = new THREE.Clock();
  let time = 0;
  // 在动画循环中更新和渲染星空
  function animate() {
      requestAnimationFrame(animate);
      wallMat.uniforms.time.value += 0.01;
      const delta = clock.getDelta();

      // 更新星空材质的时间
      // starMaterial.uniforms.time.value += delta;

      // 渲染星空到离屏缓冲区
      renderer.setRenderTarget(renderTarget);
      renderer.render(starScene, starCamera);

      // 渲染主场景
      renderer.setRenderTarget(null); // 重置到默认的渲染目标
      renderer.render(scene, camera);
  }
  animate();
//   scene.background = renderTarget.texture;
  // scene.background = new THREE.Color(0xcccccc);
//   scene.background = 
//             new THREE.CubeTextureLoader().load([
//                 px, nx,
//                 py, ny,
//                 pz, nz
//             ]);
  return [scene, renderer, camera, controls];
}
function initCamera(threeOceanWidth:number, threeOceanHeight:number, scene:THREE.Scene){
    const camera = new THREE.PerspectiveCamera(45, threeOceanWidth / threeOceanHeight, 1, 6000);
    camera.position.set(0, 100, 260);
    camera.lookAt(0, 0, 0);
    scene.add(camera);
    initLight(scene);
    // initPoints(scene);
    return camera;
}
function initLight(scene:THREE.Scene){
//   const ambientLight = new THREE.AmbientLight(0x606060, 3);
  const ambientLight = new THREE.AmbientLight(0xffffff, 1);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(1, 0.75, 0.5).normalize();
  scene.add(directionalLight);
//   const directionalLightHelper = new DirectionalLightHelper(directionalLight, 5);
  const axisHelper = new THREE.AxesHelper(1000);
  scene.add(axisHelper);
}
function initControls(camera:THREE.PerspectiveCamera, renderer:THREE.WebGLRenderer){
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.2;
  controls.enableZoom = true;
  controls.enableRotate = true;
  controls.enablePan = true;
  return controls;
}
function initPoints(scene:THREE.Scene){
  // 创建星星粒子
  const starsGeometry = new THREE.BufferGeometry();
  // 创建随机星星位置
  const starVertices = [];
  for (let i = 0; i < 10000; i++) {
      const x = THREE.MathUtils.randFloatSpread(2000);
      const y = THREE.MathUtils.randFloatSpread(2000);
      const z = THREE.MathUtils.randFloatSpread(2000);
      starVertices.push(x, y, z);
  }
  starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));

  // 使用自定义着色器
  const starsMaterial = new THREE.ShaderMaterial({
      uniforms: {
          time: { value: 1.0 },
          size: { value: 1.0 }
      },
      vertexShader: `
          uniform float size;
          uniform float time;
          void main() {
              vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
              gl_PointSize = size * (1.0 + sin(time + position.x * 2.0));
              gl_Position = projectionMatrix * mvPosition;
          }
      `,
      fragmentShader: `
          void main() {
              gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
          }
      `
  });

  // 创建粒子系统
  const starField = new THREE.Points(starsGeometry, starsMaterial);
  scene.add(starField);

  // 渲染循环
  function animate() {
      requestAnimationFrame(animate);
      starsMaterial.uniforms.time.value = performance.now() * 0.005;
      // Three.js 将自动更新着色器和材质
  }
  animate();
}
