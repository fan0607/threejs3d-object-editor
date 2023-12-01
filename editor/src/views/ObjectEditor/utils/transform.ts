export let transformControls: any[] = [];
export let translateControls: any;
export let rotateControls: any;
export let scaleControls: any;
import { TransformControls } from "three/examples/jsm/controls/TransformControls.js";
import { drawTubes } from "./drawTubes";
let camera: any, controls: any, renderer: any, scene: any;
export function initTransform(
  Ascene: THREE.Scene,
  Arenderer: any,
  Acamera: THREE.PerspectiveCamera,
  Acontrols: any,
) {
  scene = Ascene;
  renderer = Arenderer;
  camera = Acamera;
  controls = Acontrols;
}
export function setTransformControls(
  selectObject: THREE.Mesh,
  type: string,
  models: any
) {
  removeTransformControls();
  transformControls = [];
  if (type == "translate") {
    translateControls = new TransformControls(camera, renderer.domElement);
    translateControls.setMode("translate");
    translateControls.addEventListener(
      "dragging-changed",
      function (event: any) {
        controls.enabled = !event.value;
        //刷新相关的管道
        const name = selectObject.userData.name;
        const tubes = scene.children.filter((item: any) =>
          item.userData?.referTube?.find((item: string) => item === name)
        );
        tubes.forEach((item: any) => {
          scene.remove(item);
          //重新绘制管道
          const modelArray: THREE.Object3D[] = [];
          item.userData.referTube.forEach((item: string) => {
            const model = scene.children.find(
              (item2: any) => item2.userData.name === item
            );
            if (model) modelArray.push(model);
          });
          drawTubes(scene, models, 5, 0x00ff00);
        });
      }
    );
    translateControls.attach(selectObject);
    transformControls.push(translateControls);
    scene.add(translateControls);
  } else if (type == "rotate") {
    rotateControls = new TransformControls(camera, renderer.domElement);
    rotateControls.setMode("rotate");
    rotateControls.addEventListener("dragging-changed", function (event: any) {
      controls.enabled = !event.value;
    });
    rotateControls.attach(selectObject);
    transformControls.push(rotateControls);
    scene.add(rotateControls);
  } else if (type == "scale") {
    scaleControls = new TransformControls(camera, renderer.domElement);
    scaleControls.setMode("scale");
    scaleControls.addEventListener("dragging-changed", function (event: any) {
      controls.enabled = !event.value;
    });
    scaleControls.attach(selectObject);
    transformControls.push(scaleControls);
    scene.add(scaleControls);
  }
}
export function removeTransformControls() {
  if (transformControls.length > 0) {
    transformControls.forEach((item: any) => {
      item.detach();
      item.dispose();
    });
  }
}
export function changeType(type: string, controlsType: any) {
  controlsType.value = type;
}
