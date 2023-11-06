import * as THREE from "three";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import * as dat from "dat.gui";
import * as d3 from "d3";
import { outLineItem,outLineItem2,composer,initComposer } from './outline'

export function init3(){
let outlinePass = null;
let outlinePass2 = null;
// Vertex Shader
const vertexShader = `
    varying vec2 vUv;
    void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;

// Fragment Shader
const fragmentShader = `
    varying vec2 vUv;
    uniform float uTime;
    void main() {
        float dist = distance(vUv, vec2(0.5)) * 2.0; 
        float pulse = 0.5 + 0.5 * sin(dist * 10.0 - uTime * 2.0);
        pulse = clamp(pulse, 0.0, 1.0);
        
        if(pulse > 0.5) {
            float opacity = (pulse - 0.5) * 2.0;
            gl_FragColor = vec4(vec3(1.0, 0.0, 0.0), opacity); // Red color with variable opacity
        } else {
            discard;
        }

    }
`;

const uniforms = {
  uTime: { value: 0 }
};
  //创建gui对象
const gui = new dat.GUI();
// 初始化场景
const scene = new THREE.Scene();
// 创建透视相机
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerHeight / window.innerHeight,
  0.1,
  100
);
camera.position.set(6, 6, 5);
camera.aspect = window.innerWidth / window.innerHeight;
camera.updateProjectionMatrix();//任何时候摄像机的设置变动，我们需要调用摄像机的updateProjectionMatrix来更新设置
scene.add(camera);
const axesHelper = new THREE.AxesHelper(5);
// scene.add(axesHelper);

const map = new THREE.Object3D();
const light = new THREE.AmbientLight(0xffffff, 1); // soft white light
scene.add(light);
// 初始化渲染器
const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true,
//阴影
shadowMap: true, });
renderer.gammaOutput = true;
// renderer.gammaFactor = 2.2;
renderer.setClearColor(	0x102a36, 1);
// 设置渲染尺寸大小
renderer.setSize(window.innerWidth, window.innerHeight);
initComposer(renderer,camera,scene);
outlinePass = outLineItem(renderer,scene,camera)
outlinePass2 = outLineItem2(renderer,scene,camera)
composer.setSize(window.innerWidth, window.innerHeight);

// 监听屏幕大小改变的变化，设置渲染的尺寸
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
});
document.getElementById('threeMap').appendChild(renderer.domElement);
const canvas = renderer.domElement;
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
function animate(t) {
  controls.update();
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
  composer.render();
  uniforms.uTime.value += 0.05; // Increase the time
}
animate();
// 创建纹理加载器对象
const textureLoader = new THREE.TextureLoader();
const projection1 = d3.geoMercator().center([118.3151, 29.679395822382347]).translate([0, 0, 0]);
const loader = new THREE.FileLoader();
loader.load("/ThreeMap/黄山市line.json", (data) => {
  const jsonData = JSON.parse(data);
  operationData(jsonData);
});
loader.load("/ThreeMap/黄山kml.json", (data) => {
  const jsonData = JSON.parse(data);
  operationData2(jsonData);
});

function operationData(jsondata) {
  const features = jsondata.features;
  features.forEach((feature) => {
    const province = new THREE.Object3D();
    province.properties = feature.properties.name;
    const coordinates = feature.geometry.coordinates;
    const color = "gray";
    if (feature.geometry.type === "Polygon") {//黄山市line.json
      coordinates.forEach((coordinate) => {
        const mesh = drawShapeMesh(coordinate, color, projection1);
        const line = lineDraw(coordinate, "#00ffff", projection1,0);
        mesh.properties = feature.properties.name;
        province.add(line);
        province.add(mesh);
      });
    }
    map.add(province);  
  });
  map.scale.set(10,10,10);
  map.rotateX(-Math.PI/3);
  addPoint();
  // outlinePass2.selectedObjects.push(map);
  scene.add(map);
}
function operationData2(jsondata) {

  const features = jsondata.features;
  features.forEach((feature) => {

    const province = new THREE.Object3D();

    province.properties = feature.properties.name;
    const coordinates = feature.geometry.coordinates;

    const color = "gray";
    if (feature.geometry.type === "Polygon") {//黄山市line.json
      coordinates.forEach((coordinate) => {
        const mesh = drawShapeMeshPlane(coordinate, color, projection1);
      });
    }
  });
}
function lineDraw(polygon, color, projection,depth=0.11) {
  const lineGeometry = new THREE.BufferGeometry();
  const pointsArray = new Array();
  polygon.forEach((row) => {
    const [x, y] = projection(row);
    // 创建三维点
    pointsArray.push(new THREE.Vector3(x, -y, depth));
  });
  // 放入多个点
  lineGeometry.setFromPoints(pointsArray);
  const lineMaterial = new THREE.LineBasicMaterial({
    linewidth: 10.0,
    color: color,
  });
  return new THREE.Line(lineGeometry, lineMaterial);
}
let shapegeo = null;
// 根据经纬度坐标生成物体
function drawShapeMesh(polygon, color, projection) {
  const shape = new THREE.Shape();
  console.log(polygon, projection);
  polygon.forEach((row, i) => {
    const [x, y] = projection(row);
    if (i === 0) {
      shape.moveTo(x, -y);
    }
    shape.lineTo(x, -y);
  });
  // const geometry = new THREE.ShapeGeometry(shape);
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: -0.001,
    bevelEnabled: false,
    material: 0,
    extrudeMaterial: 1
  });
  shapegeo = geometry;

  const material = new THREE.MeshStandardMaterial({
    side: THREE.DoubleSide,
    transparent: true,
    color: '0x00ffff',  
    //阴影
    opacity: 0.9,
  });
  // let mesh = new THREE.Mesh(geometry, material);
  return new THREE.Mesh(geometry, material);
}
function drawShapeMeshPlane(polygon, color, projection) {
  const shape = new THREE.Shape();
  console.log(polygon, projection);
  polygon.forEach((row, i) => {
    const [x, y] = projection(row);
    if (i === 0) {
      shape.moveTo(x, -y);
    }
    shape.lineTo(x, -y);
  });
  const geometry = new THREE.ShapeGeometry(shape);
  const material = new THREE.MeshPhongMaterial({
    // color: 0xffffff,
    transparent: true,
    opacity: 0,
    side: THREE.DoubleSide,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.rotateX(-Math.PI/2);
  mesh.scale.set(9.9,9.9,9.9);
  mesh.position.set(0,-0.6,0);
  //边缘模糊
  scene.add(mesh);
  const meshOverlay = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({
    color: 'gray',
    transparent: true,
    opacity: 1,
    side: THREE.DoubleSide,
  }));
  meshOverlay.rotateX(-Math.PI/3);
  meshOverlay.scale.set(10.5,10.5,10.5);
  meshOverlay.position.set(0,-0.2,0);
  scene.add(meshOverlay);
  outlinePass.selectedObjects.push(mesh);
}
function drawExtrudeMesh(polygon, color, projection) {
  const shape = new THREE.Shape();
  console.log(polygon, projection);
  polygon.forEach((row, i) => {
    const [x, y] = projection(row);
    if (i === 0) {
      shape.moveTo(x, -y);
    }
    shape.lineTo(x, -y);
  });
  // 拉伸
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: 0.1,
    bevelEnabled: false,
    material: 0,
    extrudeMaterial: 1
  });
  const material = new THREE.MeshPhongMaterial({
    transparent: true,
    side: THREE.DoubleSide,
    opacity: 1,
  });
  const mapTexture = textureLoader.load("/ThreeMap/img/road1.jpg")
  mapTexture.wrapS = THREE.RepeatWrapping;
  mapTexture.wrapT = THREE.RepeatWrapping;
  mapTexture.repeat.set(1, 1);
  const material2 = new THREE.MeshPhongMaterial({
    side: THREE.DoubleSide,
    transparent: true,
    color: 'gray',  
    opacity: 0.5,
  });
  const materials = [
    material2,
    material
];
  return new THREE.Mesh(geometry, materials);
}

/**
 * 在map上添加点，传入经纬度
 */
function addPoint() {
  const point = new THREE.Object3D();
  const geometry = new THREE.SphereGeometry(0.1, 32, 32);
  const material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
  const sphere = new THREE.Mesh(geometry, material);
  point.add(sphere);
  const [x, y] = projection1([118.2838, 29.7413]);
  point.position.set(x, -y, 0);
  point.scale.set(0.1, 0.1, 0.1)
  map.add(point);
  const material2 = new THREE.ShaderMaterial({
    vertexShader: vertexShader,
    transparent: true,
    fragmentShader: fragmentShader,
    uniforms: uniforms
  });
  //平面园
  const circleGeometry = new THREE.CircleGeometry(0.02, 32);
  const mesh = new THREE.Mesh(circleGeometry, material2);
  mesh.position.set(x, -y, 0.001);
  map.add(mesh);
}
}