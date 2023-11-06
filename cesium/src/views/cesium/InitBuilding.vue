<template>
  <div ref="cesiumContainer"></div>
</template>

<script setup>
window.CESIUM_BASE_URL = "/";
import { onMounted, ref } from "vue";
import * as Cesium from "cesium";
import "cesium/Build/Cesium/Widgets/widgets.css";
const cesiumContainer = ref(null);

onMounted(() => {
  Cesium.Ion.defaultAccessToken =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI3ZmQxNDc1MS05ZGYwLTQyMDktYjVlOS02MzQ0ZGJkNzkxZDEiLCJpZCI6MTIwOTE1LCJpYXQiOjE2NzMzNTY4NjF9.IJXioTp0FvkLeyEsrCPt1Fql0iZzS3GpeFXRacToz_Y";
  init();
});
async function init() {
  const viewer = new Cesium.Viewer(cesiumContainer.value, {
    //   useDefaultRenderLoop: false,
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
      requestWebgl1: true,
      /* webgl: {
        alpha: false,
        antialias: true,
        preserveDrawingBuffer: true,
        failIfMajorPerformanceCaveat: false,
        depth: true,
        stencil: false,
        anialias: false,
      }, */
    },
    targetFrameRate: 60,
    resolutionScale: 0.1,
    orderIndependentTranslucency: true,
    imageryProvider: new Cesium.WebMapTileServiceImageryProvider({
      url: "http://t0.tianditu.gov.cn/img_w/wmts?tk=e034011fa32a63ed6f23d6782590f00b", // 这是天地图卫星图层URL的示例，确保你有正确的URL
      layer: "tdtBasicLayer",
      style: "default",
      format: "image/jpeg",
      tileMatrixSetID: "GoogleMapsCompatible",
      show: true,
    }),
    baseLayerPicker: true,
    geocoder: false,
    automaticallyTrackDataSourceClocks: false,
    dataSources: null,
    clock: null,
    terrainShadows: Cesium.ShadowMode.DISABLED,
  });
  const riverCenter = {
    x:118.19554800000003,
    y:29.65301500000004,
    z:0
  }
  InitBuilding(viewer, riverCenter)
  
}
function InitBuilding(viewer, center) {
  viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(center.x, center.y, 10000),
    orientation: {
      heading: Cesium.Math.toRadians(0),
      pitch: Cesium.Math.toRadians(-90),
      roll: 0.0,
    },
    duration: 3,
  });


}
</script>
<style scoped></style>
