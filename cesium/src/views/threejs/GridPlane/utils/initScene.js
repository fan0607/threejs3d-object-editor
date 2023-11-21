import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
export function initScene(threeOceanWidth, threeOceanHeight, threeOcean) {
  const scene = new THREE.Scene();
  // scene.background = new THREE.Color(0xffffff);
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(threeOceanWidth, threeOceanHeight);
  threeOcean.value.appendChild(renderer.domElement);
  const camera = initCamera(threeOceanWidth, threeOceanHeight, scene);
  const controls = initControls(camera, renderer);
  return [scene, renderer, camera, controls];
}
function initCamera(threeOceanWidth, threeOceanHeight, scene){
    const camera = new THREE.PerspectiveCamera(45, threeOceanWidth / threeOceanHeight, 1, 10000);
    camera.position.set(500, 800, 1300);
    camera.lookAt(0, 0, 0);
    scene.add(camera);
    initLight(scene);
    return camera;
}
function initLight(scene){
  const ambientLight = new THREE.AmbientLight(0x606060, 3);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 3);
  directionalLight.position.set(1, 0.75, 0.5).normalize();
  scene.add(directionalLight);
}
function initControls(camera, renderer){
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.2;
  controls.enableZoom = true;
  controls.enableRotate = true;
  controls.enablePan = true;
  return controls;
}