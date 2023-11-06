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
      // requestWebgl1: true,
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
  viewer.scene.globe.depthTestAgainstTerrain = true; //开启深度检测

    viewer.scene.setTerrain(
      new Cesium.Terrain(Cesium.CesiumTerrainProvider.fromIonAssetId(1))
    );
    const tilesetBuildings = viewer.scene.primitives.add(
      await Cesium.Cesium3DTileset.fromIonAssetId(75343)
    );
    const center = {
      x: 121.466139,
      y: 31.257341,
      z: 0,
    };
  viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(center.x, center.y, 10000),
    orientation: {
      heading: Cesium.Math.toRadians(0),
      pitch: Cesium.Math.toRadians(-90),
      roll: 0.0,
    },
    duration: 3,
  });
  var cartographicCenter = new Cesium.Cartographic(
    Cesium.Math.toRadians(center.x),
    Cesium.Math.toRadians(center.y),
    center.z
  );
  addCircleScanPostStage(
    viewer,
    cartographicCenter,
    1500,
    new Cesium.Color(0.0, 1.0, 1.0, 1.0),
    4000
  );
  
}


/*
    cartographicCenter 扫描中心
    radius  半径 米
    scanColor 扫描颜色
    duration 持续时间 毫秒
*/
function addCircleScanPostStage(
  viewer,
  cartographicCenter,
  maxRadius,
  scanColor,
  duration
) {
  const _Cartesian3Center = Cesium.Cartographic.toCartesian(cartographicCenter);
  const _Cartesian4Center = new Cesium.Cartesian4(
    _Cartesian3Center.x,
    _Cartesian3Center.y,
    _Cartesian3Center.z,
    1
  );
  const _CartograhpicCenter1 = new Cesium.Cartographic(
    cartographicCenter.longitude,
    cartographicCenter.latitude,
    cartographicCenter.height + 500
  );
  const _Cartesian3Center1 =
    Cesium.Cartographic.toCartesian(_CartograhpicCenter1);
  const _Cartesian4Center1 = new Cesium.Cartesian4(
    _Cartesian3Center1.x,
    _Cartesian3Center1.y,
    _Cartesian3Center1.z,
    1
  );

  let _time = new Date().getTime();

  const _scratchCartesian4Center = new Cesium.Cartesian4();
  const _scratchCartesian4Center1 = new Cesium.Cartesian4();
  const _scratchCartesian3Normal = new Cesium.Cartesian3();

  const ScanPostStage = new Cesium.PostProcessStage({
    fragmentShader: getScanSegmentShader(),
    uniforms: {
      u_scanCenterEC: function () {
        const temp = Cesium.Matrix4.multiplyByVector(
          viewer.camera._viewMatrix,
          _Cartesian4Center,
          _scratchCartesian4Center
        );
        return temp;
      },
      u_scanPlaneNormalEC: function () {
        const temp = Cesium.Matrix4.multiplyByVector(
          viewer.camera._viewMatrix,
          _Cartesian4Center,
          _scratchCartesian4Center
        );
        const temp1 = Cesium.Matrix4.multiplyByVector(
          viewer.camera._viewMatrix,
          _Cartesian4Center1,
          _scratchCartesian4Center1
        );

        _scratchCartesian3Normal.x = temp1.x - temp.x;
        _scratchCartesian3Normal.y = temp1.y - temp.y;
        _scratchCartesian3Normal.z = temp1.z - temp.z;

        Cesium.Cartesian3.normalize(
          _scratchCartesian3Normal,
          _scratchCartesian3Normal
        );

        return _scratchCartesian3Normal;
      },
      u_radius: function () {
        return (
          (maxRadius * ((new Date().getTime() - _time) % duration)) / duration
        );
      },
      u_scanColor: scanColor,
    },
  });

  viewer.scene.postProcessStages.add(ScanPostStage);
  return ScanPostStage;
}
function getScanSegmentShader() {
  const scanSegmentShader = `#version 300 es
     precision highp float;
     
     in vec2 v_textureCoordinates;
     uniform sampler2D colorTexture;
     uniform sampler2D depthTexture;
     uniform vec4 u_scanCenterEC;
     uniform vec3 u_scanPlaneNormalEC;
     uniform float u_radius;
     uniform vec4 u_scanColor;

     vec4 toEye(in vec2 uv, in float depth) {
         vec2 xy = vec2((uv.x * 2.0 - 1.0), (uv.y * 2.0 - 1.0));
         vec4 posIncamera = inverse(mat4(czm_projection)) * vec4(xy, depth, 1.0);
         posIncamera = posIncamera / posIncamera.w;
         return posIncamera;
     }

     vec3 pointProjectOnPlane(in vec3 planeNormal, in vec3 planeOrigin, in vec3 point) {
         vec3 v01 = point - planeOrigin;
         float d = dot(planeNormal, v01);
         return (point - planeNormal * d);
     }

     float getDepth(in vec4 depth) {
         float z_window = czm_unpackDepth(depth);
         z_window = czm_reverseLogDepth(z_window);
         float n_range = czm_depthRange.near;
         float f_range = czm_depthRange.far;
         return (2.0 * z_window - n_range - f_range) / (f_range - n_range);
     }

     out vec4 FragColor;

     void main() {
         FragColor = texture(colorTexture, v_textureCoordinates);
         float depth = getDepth(texture(depthTexture, v_textureCoordinates));
         vec4 viewPos = toEye(v_textureCoordinates, depth);
         vec3 prjOnPlane = pointProjectOnPlane(u_scanPlaneNormalEC.xyz, u_scanCenterEC.xyz, viewPos.xyz);
         float dis = length(prjOnPlane.xyz - u_scanCenterEC.xyz);
         if (dis < u_radius) {
             float f = 1.0 - abs(u_radius - dis) / u_radius;
             f = pow(f, 4.0);
             FragColor = mix(FragColor, u_scanColor, f);
         }
     }`;
  return scanSegmentShader;
}
</script>
<style scoped></style>
