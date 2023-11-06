<template>
  <div ref="cesiumContainer" class="cesiumClass"></div>
</template>

<script setup>
window.CESIUM_BASE_URL = "/";
// import { Cartesian3, createOsmBuildingsAsync, Ion, Math as CesiumMath, Terrain, Viewer, WebMapTileServiceImageryProvider } from 'cesium';
import * as Cesium from "cesium";
import "cesium/Build/Cesium/Widgets/widgets.css";
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
  let fa = null;
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
      200
    );
    var terrainProvider = cesium.viewer.terrainProvider;
    var positions = [Cesium.Cartographic.fromDegrees((minWGS84[0] + maxWGS84[0]) / 2,
      (minWGS84[1] + maxWGS84[1]) / 2 - 1)];

    Cesium.sampleTerrain(terrainProvider, 17, positions)
    .then(function(samples) {

      var height = samples[0].height;
      console.log('height: ', height);

      // Use this height value to adjust your Three.js object's position.

    });


  }
  async function load3DTiles(){
    let resource = null;
    let clippingPlanes = new Cesium.ClippingPlaneCollection({
      planes: [
        new Cesium.ClippingPlane(
          new Cesium.Cartesian3(0.0, 0.0, -1.0),
          0.0
        ),
      ],
      edgeWidth: viewModel.edgeStylingEnabled ? 1.0 : 0.0,
    });
    const url = await Promise.resolve(resource);
    tileset = await Cesium.Cesium3DTileset.fromUrl(url, {
      clippingPlanes: clippingPlanes,
    });

  }

  function renderCesium() {
    cesium.viewer.render();
  }
  function loop() {
    if(destroyed.value) return;
    requestAnimationFrame(loop);
    renderCesium();
  }
  initCesium(); // Initialize Cesium renderer
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
