import * as THREE from 'three'
import vertexShader from '@/utils/ThreeCloud/shader/vertexShader.glsl?raw'
import fragmentShader from '@/utils/ThreeCloud/shader/fragmentShader.glsl?raw'
const oceanScene = new THREE.Scene();
const oceanSceneWidth = window.innerWidth;
const oceanSceneHeight = window.innerHeight;
export const renderTarget = new THREE.WebGLRenderTarget(oceanSceneWidth, oceanSceneHeight);

const oceanCamera = new THREE.PerspectiveCamera( 20, oceanSceneWidth / oceanSceneHeight, 1, 10000 );
oceanCamera.position.set(0, 0, 1000);
oceanCamera.lookAt(0, 0, 0);
oceanScene.add(oceanCamera);

const uniforms = {
    iTime: { value: 1.0 },
    iResolution: { value: new THREE.Vector2(oceanSceneWidth * 1.0, oceanSceneHeight * 1.0)},
    iMouse: { value: new THREE.Vector2(0.0, 0.0) }
}
const material = new THREE.ShaderMaterial( {
    uniforms: uniforms,
    vertexShader: vertexShader,
    fragmentShader: fragmentShader
});
const geom = new THREE.PlaneGeometry(oceanSceneWidth, oceanSceneHeight);
const mesh = new THREE.Mesh( geom, material );
oceanScene.add(mesh);
const clock = new THREE.Clock();
export function renderTargetanimate(renderer){
    //这个camera是不是应该是oceanCamera？可以是
    const delta = clock.getDelta();
    uniforms.iTime.value += delta;
    renderer.setRenderTarget(renderTarget);
    renderer.render(oceanScene,oceanCamera);
    renderer.setRenderTarget(null); // 设回默认的渲染目标
}
/* 监听鼠标移动，并改变着色器使用的 iMouse 参数 */
//监听鼠标拖拽
let dragging = false;
let mouseStartPosition = null;

window.addEventListener("mousedown", function (event) {
    dragging = true;
    mouseStartPosition = {x: event.clientX, y: event.clientY};
});

window.addEventListener("mouseup", function (event) {
    dragging = false;
    mouseStartPosition = null;
});

window.addEventListener("mousemove", function (event) {
    if (!dragging || !mouseStartPosition) return;
    
    let dx = event.clientX - mouseStartPosition.x;
    let dy = event.clientY - mouseStartPosition.y;

    uniforms.iMouse.value.x += dx;
    uniforms.iMouse.value.y += dy;

    mouseStartPosition = {x: event.clientX, y: event.clientY};
});
window.addEventListener("resize", function (event) {
    oceanCamera.aspect = window.innerWidth / window.innerHeight;
    oceanCamera.updateProjectionMatrix();
    uniforms.iResolution.value.x = window.innerWidth;
    uniforms.iResolution.value.y = window.innerHeight;
});
