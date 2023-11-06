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
  // viewer.scene.globe.depthTestAgainstTerrain = true; //开启深度检测

    /* viewer.scene.setTerrain(
      new Cesium.Terrain(Cesium.CesiumTerrainProvider.fromIonAssetId(1))
    );
    const tilesetBuildings = viewer.scene.primitives.add(
      await Cesium.Cesium3DTileset.fromIonAssetId(75343)
    ); */
    /* const center = {
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
  }); */
  waterOpacity(viewer)
  
}
function waterOpacity(viewer, center) {
  /* var primitive = viewer.scene.primitives.add(
    new Cesium.GroundPrimitive({
        geometryInstances: new Cesium.GeometryInstance({
            geometry: new Cesium.RectangleGeometry({
                rectangle: Cesium.Rectangle.fromDegrees(
                  center.x, center.y, center.x + 0.1, center.y + 0.1
                ),
                // perPositionHeight : true//注释掉此属性水面就贴地了
                // vertexFormat: Cesium.EllipsoidSurfaceAppearance.VERTEX_FORMAT,
            }),
        }),
        appearance: new Cesium.EllipsoidSurfaceAppearance({
            aboveGround: true,
            fragmentShaderSource: 'varying vec3 v_positionMC;\n' +
              'varying vec3 v_positionEC;\n' +
              'varying vec2 v_st;\n' +
              'void main()\n' +
              '{\n' +
              'czm_materialInput materialInput;\n' +
              'vec3 normalEC = normalize(czm_normal3D * czm_geodeticSurfaceNormal(v_positionMC, vec3(0.0), vec3(1.0)));\n' +
              '#ifdef FACE_FORWARD\n' +
              'normalEC = faceforward(normalEC, vec3(0.0, 0.0, 1.0), -normalEC);\n' +
              '#endif\n' +
              'materialInput.s = v_st.s;\n' +
              'materialInput.st = v_st;\n' +
              'materialInput.str = vec3(v_st, 0.0);\n' +
              'materialInput.normalEC = normalEC;\n' +
              'materialInput.tangentToEyeMatrix = czm_eastNorthUpToEyeCoordinates(v_positionMC, materialInput.normalEC);\n' +
              'vec3 positionToEyeEC = -v_positionEC;\n' +
              'materialInput.positionToEyeEC = positionToEyeEC;\n' +
              'czm_material material = czm_getMaterial(materialInput);\n' +
              '#ifdef FLAT\n' +
              'gl_FragColor = vec4(material.diffuse + material.emission, material.alpha);\n' +
              '#else\n' +
              'gl_FragColor = czm_phong(normalize(positionToEyeEC), material, czm_lightDirectionEC);\n' +
              'gl_FragColor.a=0.85;\n' +
              '#endif\n' +
              '}\n'
        }),
        show: true
    })
);
  primitive.appearance.material = new Cesium.Material({
      fabric: {
          type: "Water",
          uniforms: {
              normalMap: Cesium.buildModuleUrl(
                  "Assets/Textures/waterNormals.jpg"
              ),
              frequency: 10000.0,
              animationSpeed: 0.01,
              amplitude: 10.0,
          },
      },
  }); */
  let aper = new Cesium.EllipsoidSurfaceAppearance({
    aboveGround: true,
    fragmentShaderSource: 'varying vec3 v_positionMC;\n' +
      'varying vec3 v_positionEC;\n' +
      'varying vec2 v_st;\n' +
      'void main()\n' +
      '{\n' +
      'czm_materialInput materialInput;\n' +
      'vec3 normalEC = normalize(czm_normal3D * czm_geodeticSurfaceNormal(v_positionMC, vec3(0.0), vec3(1.0)));\n' +
      '#ifdef FACE_FORWARD\n' +
      'normalEC = faceforward(normalEC, vec3(0.0, 0.0, 1.0), -normalEC);\n' +
      '#endif\n' +
      'materialInput.s = v_st.s;\n' +
      'materialInput.st = v_st;\n' +
      'materialInput.str = vec3(v_st, 0.0);\n' +
      'materialInput.normalEC = normalEC;\n' +
      'materialInput.tangentToEyeMatrix = czm_eastNorthUpToEyeCoordinates(v_positionMC, materialInput.normalEC);\n' +
      'vec3 positionToEyeEC = -v_positionEC;\n' +
      'materialInput.positionToEyeEC = positionToEyeEC;\n' +
      'czm_material material = czm_getMaterial(materialInput);\n' +
      '#ifdef FLAT\n' +
      'gl_FragColor = vec4(material.diffuse + material.emission, material.alpha);\n' +
      '#else\n' +
      'gl_FragColor = czm_phong(normalize(positionToEyeEC), material, czm_lightDirectionEC);\n' +
      'gl_FragColor.a=0.85;\n' +
      '#endif\n' +
      '}\n'
  })
  aper.material = new Cesium.Material({
      fabric: {
          type: "Water",
          uniforms: {
              normalMap: Cesium.buildModuleUrl(
                  "Assets/Textures/waterNormals.jpg"
              ),
              frequency: 10000.0,
              animationSpeed: 0.01,
              amplitude: 10.0,
          },
      },
  });
  // 加载GeoJSON数据
  Cesium.GeoJsonDataSource.load('src/assets/shuixi.json',{
      stroke: Cesium.Color.PINK.withAlpha(0.0),
      fill: Cesium.Color.PINK.withAlpha(0.0),
      strokeWidth: 0,
  }).then(function(dataSource) {
      viewer.dataSources.add(dataSource);
      const entities = dataSource.entities.values;
      const geometryInstances = []
      
      for (let i = 0; i < entities.length; i++) {
          const entity = entities[i];
          if (entity.polygon) {
              const positions = entity.polygon.hierarchy.getValue().positions;

              // 创建多边形几何体
              const polygonGeometry = new Cesium.PolygonGeometry({
                  polygonHierarchy: new Cesium.PolygonHierarchy(positions),
                  vertexFormat: Cesium.EllipsoidSurfaceAppearance.VERTEX_FORMAT,
                  // stRotation: Cesium.Math.toRadians(45)  
              });

              // 创建几何体实例
              const geometryInstance = new Cesium.GeometryInstance({
                  geometry: polygonGeometry
              });
              geometryInstances.push(geometryInstance)
          }
      }
      // 使用Primitive API将其添加到场景中
      let primitives = viewer.scene.primitives.add(new Cesium.GroundPrimitive({
          geometryInstances: geometryInstances,
          appearance: aper,
          asynchronous: false
      }));
      const riverCenter = {
        x:118.19554800000003,
        y:29.65301500000004,
        z:0
      }
      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(riverCenter.x, riverCenter.y, 10000),
        orientation: {
          heading: Cesium.Math.toRadians(0),
          pitch: Cesium.Math.toRadians(-90),
          roll: 0.0,
        },
        duration: 3,
      });
  });


}
</script>
<style scoped></style>
