import * as THREE from "three";
import SweepLightShader from "./SweepLightShader";
const clock = new THREE.Clock();
const uniform = {
  u_color: { value: new THREE.Color("#5588aa") },
  u_tcolor: { value: new THREE.Color("red") },
  u_r: { value: 0.25 },
  u_length: { value: 10 }, //扫过区域
  u_height: { value: 30.5 },
};
const Shader = SweepLightShader;

export const material = new THREE.ShaderMaterial({
  vertexShader: Shader.Shader.vertexShader,
  fragmentShader: Shader.Shader.fragmentShader,
  side: THREE.DoubleSide,
  uniforms: uniform,
  transparent: true,
  depthWrite: false,
});
// //光波
requestAnimationFrame(function animate() {
  requestAnimationFrame(animate);
  material.uniforms.u_r.value += clock.getDelta() * 80;
  if (material.uniforms.u_r.value >= 300) {
    material.uniforms.u_r.value = 20;
  }
}
);
// material.uniforms.u_r.value += clock.getDelta() * 80;
// if (material.uniforms.u_r.value >= 300) {
//   material.uniforms.u_r.value = 20;
// }
