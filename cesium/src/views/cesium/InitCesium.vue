<template>
  <div ref="cesiumContainer" class="cesiumClass"></div>
  <div ref="ThreeContainer" class="threeClass"></div>
</template>

<script setup>
window.CESIUM_BASE_URL = "/";
// import { Cartesian3, createOsmBuildingsAsync, Ion, Math as CesiumMath, Terrain, Viewer, WebMapTileServiceImageryProvider } from 'cesium';
import * as Cesium from "cesium";
import "cesium/Build/Cesium/Widgets/widgets.css";
import * as THREE from "three";
import {  renderTarget, renderTargetanimate } from '@/utils/ThreeOcean/renderTarget/index.js'
import { onMounted, onUnmounted, ref } from "vue";
var cesiumContainer = ref(null);
var ThreeContainer = ref(null);
let destroyed = ref(false);
onMounted(() => {
  init();
});
//离开时卸载
onUnmounted(() => {
  destroyed.value = true;
});

async function init() {
  Cesium.Ion.defaultAccessToken =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI3ZmQxNDc1MS05ZGYwLTQyMDktYjVlOS02MzQ0ZGJkNzkxZDEiLCJpZCI6MTIwOTE1LCJpYXQiOjE2NzMzNTY4NjF9.IJXioTp0FvkLeyEsrCPt1Fql0iZzS3GpeFXRacToz_Y";
  // "eetyuiopo6JhbCI6IkpXVCJ9.eyJqdGkiOiI3ZmQxNDc1MS05ZGYwLTQyMxZDEiLCJpZCI6MTIwOTE1LCJpYXQiOjE2NzMzNTY4NjF9.IJXioTp0FvkLeyEsrCPt1Fql0iZzS3GpeFXRacToz_Y";
  var minWGS84 = [115.23, 39.55];
  var maxWGS84 = [116.23, 41.55];
  var _3Dobjects = []; //Could be any Three.js object mesh
  var three = {
    renderer: null,
    camera: null,
    scene: null,
  };
  var cesium = {
    viewer: null,
  };
  function _3DObject() {
    //THREEJS 3DObject.mesh
    this.threeMesh = null;
    //location bounding box
    this.minWGS84 = null;
    this.maxWGS84 = null;
  }
  function initCesium() {
    cesium.viewer = new Cesium.Viewer(cesiumContainer.value, {
      useDefaultRenderLoop: false,
      selectionIndicator: false,
      homeButton: false,
      sceneModePicker: false,
      navigationHelpButton: false,
      infoBox: false,
      navigationHelpButton: false,
      navigationInstructionsInitiallyVisible: false,
      animation: false,
      timeline: false,
      fullscreenButton: false,
      allowTextureFilterAnisotropic: false,
      contextOptions: {
        webgl: {
          alpha: false,
          antialias: true,
          preserveDrawingBuffer: true,
          failIfMajorPerformanceCaveat: false,
          depth: true,
          stencil: false,
          anialias: false,
        },
      },
      targetFrameRate: 60,
      resolutionScale: 0.1,
      orderIndependentTranslucency: true,
      //   creditContainer: "hidecredit",
      imageryProvider: new Cesium.WebMapTileServiceImageryProvider({
        url: "http://t0.tianditu.gov.cn/img_w/wmts?tk=e034011fa32a63ed6f23d6782590f00b", // 这是天地图卫星图层URL的示例，确保你有正确的URL
        layer: "tdtBasicLayer",
        style: "default",
        format: "image/jpeg",
        tileMatrixSetID: "GoogleMapsCompatible",
        show: true,
      }),
      // terrain: Cesium.Terrain.fromWorldTerrain(),
      baseLayerPicker: true,
      geocoder: false,
      automaticallyTrackDataSourceClocks: false,
      dataSources: null,
      clock: null,
      terrainShadows: Cesium.ShadowMode.DISABLED,
    });
    cesium.viewer.scene.globe.depthTestAgainstTerrain = true;
    var center = Cesium.Cartesian3.fromDegrees(
      (minWGS84[0] + maxWGS84[0]) / 2,
      (minWGS84[1] + maxWGS84[1]) / 2 - 1,
      200000
    );

    /* var terrainProvider = cesium.viewer.terrainProvider;
    var positions = [Cesium.Cartographic.fromDegrees((minWGS84[0] + maxWGS84[0]) / 2,
      (minWGS84[1] + maxWGS84[1]) / 2 - 1)];

    Cesium.sampleTerrain(terrainProvider, 17, positions)
    .then(function(samples) {

      var height = samples[0].height;
      console.log('height: ', height);

      // Use this height value to adjust your Three.js object's position.

    }); */

    cesium.viewer.camera.flyTo({
      destination: center,
      orientation: {
        heading: Cesium.Math.toRadians(0),
        pitch: Cesium.Math.toRadians(-60),
        roll: Cesium.Math.toRadians(0),
      },
      duration: 3,
    });
  }
  function initThree() {
    var fov = 45;
    var width = window.innerWidth;
    var height = window.innerHeight;
    var aspect = width / height;
    var near = 1;
    var far = 10 * 1000 * 1000; // needs to be far to support Cesium's world-scale rendering

    three.scene = new THREE.Scene({
      antialias: true, //抗锯齿
      alpha: true, //背景透明
      //深度检测
      depthTest: true,
      logarithmicDepthBuffer: true,
    });
    // three.scene.background = renderTarget.texture;

    three.camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    three.renderer = new THREE.WebGLRenderer({ alpha: true });
    ThreeContainer.value.appendChild(three.renderer.domElement);
  }
  function init3DObject() {
    //Cesium entity
    var entity = {
      name: "Polygon",
      polygon: {
        hierarchy: Cesium.Cartesian3.fromDegreesArray([
          minWGS84[0],
          minWGS84[1],
          maxWGS84[0],
          minWGS84[1],
          maxWGS84[0],
          maxWGS84[1],
          minWGS84[0],
          maxWGS84[1],
        ]),
        material: Cesium.Color.RED.withAlpha(0.2),
      },
    };
    var Polygon = cesium.viewer.entities.add(entity);


    // dodecahedron

    let geometry = new THREE.BoxGeometry( 6, 6, 6,8 );
    // const geometry = new THREE.CircleGeometry( 5, 32 );
    // const geometry = new THREE.TorusKnotGeometry( 10, 3, 100, 16 );
    var dodecahedronMesh = new THREE.Mesh(
      geometry,
      // new THREE.MeshNormalMaterial()
      new THREE.MeshBasicMaterial({
        map: renderTarget.texture,
        side: THREE.DoubleSide,
      })
    );
    // sphereMesh
    dodecahedronMesh.scale.set(5000, 5000, 5000); //scale object to be visible at planet scale
    dodecahedronMesh.position.z += 15000.0; // translate "up" in Three.js space so the "bottom" of the mesh is the handle
    dodecahedronMesh.rotation.x = -Math.PI; // rotate mesh for Cesium's Y-up system
    var dodecahedronMeshYup = new THREE.Group();
    dodecahedronMeshYup.add(dodecahedronMesh);
    // dodecahedronMeshYup.add(sphereMesh);

    three.scene.add(dodecahedronMeshYup); // don’t forget to add it to the Three.js scene manually

    //Assign Three.js object mesh to our object array
    let _3DOB = new _3DObject();
    _3DOB.threeMesh = dodecahedronMeshYup;
    _3DOB.minWGS84 = minWGS84;
    _3DOB.maxWGS84 = maxWGS84;
    _3Dobjects.push(_3DOB);
  }

  function renderCesium() {
    cesium.viewer.render();
  }
  function renderThreeObj() {
    // register Three.js scene with Cesium
    three.camera.fov = Cesium.Math.toDegrees(cesium.viewer.camera.frustum.fovy); // ThreeJS FOV is vertical
    three.camera.updateProjectionMatrix();

    var cartToVec = function (cart) {
      return new THREE.Vector3(cart.x, cart.y, cart.z);
    };

    // Configure Three.js meshes to stand against globe center position up direction
    for (let id in _3Dobjects) {
      minWGS84 = _3Dobjects[id].minWGS84;
      maxWGS84 = _3Dobjects[id].maxWGS84;
      // convert lat/long center position to Cartesian3
      var center = Cesium.Cartesian3.fromDegrees(
        (minWGS84[0] + maxWGS84[0]) / 2,
        (minWGS84[1] + maxWGS84[1]) / 2
      );

      // get forward direction for orienting model
      var centerHigh = Cesium.Cartesian3.fromDegrees(
        (minWGS84[0] + maxWGS84[0]) / 2,
        (minWGS84[1] + maxWGS84[1]) / 2,
        1
      );

      // use direction from bottom left to top left as up-vector
      var bottomLeft = cartToVec(
        Cesium.Cartesian3.fromDegrees(minWGS84[0], minWGS84[1])
      );
      var topLeft = cartToVec(
        Cesium.Cartesian3.fromDegrees(minWGS84[0], maxWGS84[1])
      );
      var latDir = new THREE.Vector3()
        .subVectors(bottomLeft, topLeft)
        .normalize();

      // configure entity position and orientation
      _3Dobjects[id].threeMesh.position.copy(center);
      // _3Dobjects[id].threeMesh.lookAt(centerHigh);
      _3Dobjects[id].threeMesh.lookAt(centerHigh.x,centerHigh.y,centerHigh.z);
      _3Dobjects[id].threeMesh.up.copy(latDir);
    }

    // Clone Cesium Camera projection position so the
    // Three.js Object will appear to be at the same place as above the Cesium Globe
    three.camera.matrixAutoUpdate = false;
    var cvm = cesium.viewer.camera.viewMatrix;
    var civm = cesium.viewer.camera.inverseViewMatrix;
    three.camera.lookAt(0, 0, 0);

    three.camera.matrixWorld.set(
      civm[0],
      civm[4],
      civm[8],
      civm[12],
      civm[1],
      civm[5],
      civm[9],
      civm[13],
      civm[2],
      civm[6],
      civm[10],
      civm[14],
      civm[3],
      civm[7],
      civm[11],
      civm[15]
    );
    three.camera.matrixWorldInverse.set(
      cvm[0],
      cvm[4],
      cvm[8],
      cvm[12],
      cvm[1],
      cvm[5],
      cvm[9],
      cvm[13],
      cvm[2],
      cvm[6],
      cvm[10],
      cvm[14],
      cvm[3],
      cvm[7],
      cvm[11],
      cvm[15]
    );

    var width = ThreeContainer.value.clientWidth;
    var height = ThreeContainer.value.clientHeight;
    var aspect = width / height;
    three.camera.aspect = aspect;
    three.camera.updateProjectionMatrix();

    three.renderer.setSize(width, height);
    three.renderer.clear();
    three.renderer.render(three.scene, three.camera);
  }
  function loop() {
    if(destroyed.value) return;
    requestAnimationFrame(loop);
    renderCesium();
    renderThreeObj();
    renderTargetanimate(three.renderer)
  }
  initCesium(); // Initialize Cesium renderer
  initThree(); // Initialize Three.js renderer
  init3DObject(); // Initialize Three.js object mesh with Cesium Cartesian coordinate system
  loop(); // Looping renderer
}
</script>

<style lang="scss" scoped>
.cesiumClass {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  margin: 0;
  overflow: hidden;
  padding: 0;
  font-family: sans-serif;
}
.threeClass {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  margin: 0;
  overflow: hidden;
  padding: 0;
  font-family: sans-serif;
  pointer-events: none;
}
</style>
