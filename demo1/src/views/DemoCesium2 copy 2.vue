<template>
    <div id="cesiumContainer"></div>
    <button id="pick" ref="pickTiles" :style="{position:'absolute',top:'6rem'}" @click="pick">pick</button>
</template>

<script setup>
import "cesium/Build/Cesium/Widgets/widgets.css"
import * as Cesium from 'cesium'
import { onMounted,ref } from 'vue';
Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI3ZmQxNDc1MS05ZGYwLTQyMDktYjVlOS02MzQ0ZGJkNzkxZDEiLCJpZCI6MTIwOTE1LCJpYXQiOjE2NzMzNTY4NjF9.IJXioTp0FvkLeyEsrCPt1Fql0iZzS3GpeFXRacToz_Y'
function pick(){
    console.log('pick');
    updateOffscreenCamera()
}

// import {getPolyline,Cesium} from "@/hooks/init"
// import {Picking,Cesium} from "@/hooks/Picking.js"
function initViewer(){
    return new Cesium.Viewer('cesiumContainer',{
        terrainProvider: Cesium.createWorldTerrain()
    })
}
onMounted(()=>{
    const viewer = new Cesium.Viewer("cesiumContainer", {
        animation: false,
        timeline: false,
        fullscreenButton: false,
        geocoder: false,
        homeButton: false,
        navigationHelpButton: false,
        sceneModePicker: false,
        baseLayerPicker: false,
        creditContainer: document.createElement('div')
  });

  viewer.scene.globe.depthTestAgainstTerrain = true;

  // Load the NYC buildings tileset
  const tileset = new Cesium.Cesium3DTileset({
    // url: Cesium.IonResource.fromAssetId(75343),
    url:"https://kc3.kcgis.cn:9001/2022/scqt/all/empty_line.json"
  });
  viewer.scene.primitives.add(tileset);
  // HTML overlay for showing feature name on mouseover
  const nameOverlay = document.createElement("div");
  viewer.container.appendChild(nameOverlay);
  nameOverlay.className = "backdrop";
  nameOverlay.style.display = "none";
  nameOverlay.style.position = "absolute";
  nameOverlay.style.bottom = "0";
  nameOverlay.style.left = "0";
  nameOverlay.style["pointer-events"] = "none";
  nameOverlay.style.padding = "4px";
  nameOverlay.style.backgroundColor = "black";
  tileset.colorBlendMode = Cesium.Cesium3DTileColorBlendMode.REPLACE;  //定义用于在目标颜色和图元的源颜色之间混合的不同模式，HIGHLIGHT将源颜色乘以目标颜色REPLACE将源颜色替换为目标颜色MIX将源颜色和目标颜色混合在一起。
  /* tileset.tileLoad.addEventListener(function(tile) {
     let content = tile.content;
     let featuresLength = content.featuresLength;
     console.log("要素数量为：");
     console.log(featuresLength);
    //  console.log("第一个要素为：");
     
     for(let i = 0;i<featuresLength;i++){
        let feature = content.getFeature(i);
        feature.color = Cesium.Color.BLUE;
     }

    //  debugger
     console.log(feature);
 }) */
//  var handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas);
//  handler.setInputAction(function(movement) {
//     // var feature = viewer.scene.pick(movement.endPosition);
//     var feature = viewer.scene.pick((410.3999938964844, 385.6000061035156));

//     if (feature instanceof Cesium.Cesium3DTileFeature) {
//         var propertyNames = feature.getPropertyIds();
//         feature.color = Cesium.Color.YELLOW;
//         let batchId = feature.batchId;//feature.featureId
//         var length = propertyNames.length;
//         /* for (var i = 0; i < length; ++i) {
//             var propertyName = propertyNames[i];
//             console.log(propertyName + ': ' + feature.getProperty(propertyName));
//         } */
//     }
// }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
 viewer.zoomTo(tileset);
// 1. 创建基础场景
viewer.scene.globe.depthTestAgainstTerrain = true;

// 创建坐标点集合容器
const pointPrimitives = viewer.scene.primitives.add(new Cesium.PointPrimitiveCollection());
// 创建视锥体集合容器
const frustumPrimitives = viewer.scene.primitives.add(new Cesium.PrimitiveCollection());

//#region ----------------------- CORE --------------------------------------------------

// 创建常量，避免循环中多次实例化
const pickTilesetPassState = new Cesium.Cesium3DTilePassState({
  pass: Cesium.Cesium3DTilePass.PICK
});
const scratchRectangle = new Cesium.BoundingRectangle(0, 0, 3, 3);
const scratchColorZero = new Cesium.Color(0, 0, 0, 0);
const packedDepthScale = new Cesium.Cartesian4(1.0, 1.0 / 255.0, 1.0 / 65025.0, 1.0 / 16581375.0);  // 1, 1 / 255, 1 / (255^2), 1 / (255^3)

// 根据射线更新相机参数
function updateOffscreenCamera(position, direction, up, width, height, camera) {
  const right = Cesium.Cartesian3.cross(direction, up, new Cesium.Cartesian3());

  camera.position = position;
  camera.direction = direction;
  camera.up = up;
  camera.right = right;

  camera.frustum.width = width;
  camera.frustum.aspectRatio = width / height;
  return camera.frustum.computeCullingVolume(camera.positionWC, camera.directionWC, camera.upWC);
}

// 可视化相机视锥体
function getFrustumOutline(camera) {
  const matrix = new Cesium.Matrix3();
  const cameraLeftWC = Cesium.Cartesian3.negate(camera.rightWC, new Cesium.Cartesian3());
  Cesium.Matrix3.setColumn(matrix, 0, cameraLeftWC, matrix);
  Cesium.Matrix3.setColumn(matrix, 1, camera.upWC, matrix);
  Cesium.Matrix3.setColumn(matrix, 2, camera.directionWC, matrix);
  const geometryInstances = new Cesium.GeometryInstance({
    geometry: new Cesium.FrustumOutlineGeometry({
      frustum: camera.frustum,
      origin: camera.positionWC,
      orientation: Cesium.Quaternion.fromRotationMatrix(matrix, new Cesium.Quaternion())
    }),
    attributes: {
      color: Cesium.ColorGeometryInstanceAttribute.fromColor(Cesium.Color.WHITE)
    }
  });
  return new Cesium.Primitive({
    geometryInstances,
    appearance: new Cesium.PerInstanceColorAppearance({
      flat: true,
      translucent: false
    }),
    asynchronous: false
  });
}

// 获取深度缓存中的深度值
//! REFERENCE: Cesium.PickDepth.getDepth
function getDepth(context, x, y, width, height, framebuffer) {
  // 获取颜深度缓存中的所有像素值
  const pixels = context.readPixels({
    x,
    y,
    width,
    height,
    framebuffer
  });
  const packedDepthArray = Cesium.Cartesian4.unpackArray(pixels);
  // 像素值转深度值
  return packedDepthArray.map((t) => {
    Cesium.Cartesian4.divideByScalar(t, 255.0, t);
    return Cesium.Cartesian4.dot(t, packedDepthScale);
  });
}

// 纹理像素值转 RGBA 颜色值
//! REFERENCE: Cesium.PickFramebuffer.end
function pixelsToColor(pixels) {
  const steps = pixels.length / 4;
  const res = [];
  for (let i = 0; i < steps; i++) {
    const color = new Cesium.Color();
    const index = i * 4;
    color.red = Cesium.Color.byteToFloat(pixels[index]);
    color.green = Cesium.Color.byteToFloat(pixels[index + 1]);
    color.blue = Cesium.Color.byteToFloat(pixels[index + 2]);
    color.alpha = Cesium.Color.byteToFloat(pixels[index + 3]);
    const target = res.find((t) => Cesium.Color.equals(t, color));
    if (!target) {
      res.push(color);
    }
  }
  return res;
}

// 通过颜色缓存拾取对象
//! REFERENCE: Cesium.PickFramebuffer.end
function pickObjects(framebuffer, context, viewport) {
  const width = Cesium.defaultValue(viewport.width, 1);
  const height = Cesium.defaultValue(viewport.height, 1);
  // 获取颜色缓存中的所有像素值
  const pixels = context.readPixels({
    x: 0,
    y: 0,
    width,
    height,
    framebuffer
  });
  // 像素值转 RGBA
  const colors = pixelsToColor(pixels);
  // 通过颜色 ID 查找拾取对象
  return colors.map((t) => context.getObjectByPickColor(t));
}

// 通过深度缓存拾取坐标
//! REFERENCE: Cesium.Picking getRayIntersection
function pickPositions(ray, picking, scene, width, height, depthMapSize) {
  const res = [];
  const { context } = scene;
  if (!context.depthTexture) { return res; }
  const view = picking._pickOffscreenView;
  const { camera } = view;
  const numFrustums = view.frustumCommandsList.length;
  const offset = new Cesium.Cartesian3();
  for (let i = 0; i < numFrustums; ++i) {
    // 获取每个视锥体的深度缓存
    const pickDepth = picking.getPickDepth(scene, i);
    const depths = getDepth(context, 0, 0, depthMapSize, depthMapSize, pickDepth.framebuffer);

    for (let j = 0, len = depths.length; j < len; j++) {
      const depth = depths[j];
      if (Cesium.defined(depth) && depth > 0.0 && depth < 1.0) {
        // 根据视锥体远近截面计算出相机到物体表面的距离
        const renderedFrustum = view.frustumCommandsList[i];
        const near = renderedFrustum.near * (j !== 0 ? scene.opaqueFrustumNearOffset : 1.0);
        const distance = near + depth * (renderedFrustum.far - near);

        // 将深度图像素点位置映射到世界坐标（以中心点相机位置为起始点进行偏移映射）
        const column = Math.floor(j / depthMapSize);
        const row = j % depthMapSize;
        const columnScalar = ((column - depthMapSize / 2) * height) / depthMapSize;
        const rowScalar = ((row - depthMapSize / 2) * width) / depthMapSize;
        const point = new Cesium.Cartesian3();
        Cesium.Cartesian3.multiplyByScalar(camera.up, columnScalar, offset);
        Cesium.Cartesian3.add(offset, camera.position, point);
        Cesium.Cartesian3.multiplyByScalar(camera.right, rowScalar, offset);
        Cesium.Cartesian3.add(offset, point, point);

        // 利用射线获取坐标高程
        const clonedRay = Cesium.Ray.clone(ray);
        clonedRay.origin = point;
        const position = Cesium.Ray.getPoint(clonedRay, distance);

        if (!res[j]) {
          res[j] = position;
        }
      }
    }
  }
  return res;
}

//! REFERENCE: Cesium.Picking getRayIntersection
function getRayIntersecting(camera, width, height, depthMapSize) {
  // 2. 创建拾取相机
  const { scene } = viewer;
  const ray = new Cesium.Ray(camera.position, camera.direction);
  const picking = new Cesium.Picking(viewer.scene);
  const { context, frameState } = scene;
  const view = picking._pickOffscreenView;
  const boundingRectangle = new Cesium.BoundingRectangle(0, 0, depthMapSize, depthMapSize);
  view.viewport = boundingRectangle;
  view.passState.viewport = boundingRectangle;
  scene.view = view;
  updateOffscreenCamera(ray.origin, ray.direction, camera.up, width, height, view.camera);
  
  // 3. 更新拾取相机对应的帧缓存
  Cesium.BoundingRectangle.clone(view.viewport, scratchRectangle);
  const passState = view.pickFramebuffer.begin(scratchRectangle, view.viewport);
  scene.jobScheduler.disableThisFrame();
  scene.updateFrameState();
  frameState.invertClassification = false;
  frameState.passes.pick = true;
  frameState.passes.offscreen = true;
  frameState.tilesetPassState = pickTilesetPassState;
  context.uniformState.update(frameState);
  scene.updateEnvironment();
  scene.updateAndExecuteCommands(passState, Cesium.Color.TRANSPARENT);
  scene.resolveFramebuffers(passState);
  
  // 4. 通过颜色缓存拾取对象
  const objs = pickObjects(view.pickFramebuffer._fb._framebuffer, context, scratchRectangle);

  // 5. 通过深度缓存拾取坐标
  const positions = pickPositions(ray, picking, scene, width, height, depthMapSize);

  // 6. 绘制相机视锥体（可选）
  frustumPrimitives.add(getFrustumOutline(view.camera));

  scene.view = scene.defaultView;
  context.endFrame();

  return { objs, positions };
}

//#regionend ----------------------- CORE --------------------------------------------------
let pickTiles = ref(null)
// 拾取方法入口函数
function pick() {
  const { objs, positions } = getRayIntersecting(viewer.camera, 1000, 1000, 1024);
  objs.forEach((obj) => {
    if (obj && obj instanceof Cesium.Cesium3DTileFeature) {
      obj.color = Cesium.Color.YELLOW;
    }
  });
  positions.forEach((position) =>
    pointPrimitives.add({
      pixelSize: 5,
      color: Cesium.Color.GREEN,
      position
    })
  );
}
setTimeout(() => {
    console.log('pick');
    pick()
}, 6000);

// // Cesium 沙盒快速添加测试按钮
// Sandcastle.addToolbarButton("pick", pick);
// Sandcastle.addToolbarButton("clear", function () {
//   pointPrimitives.removeAll();
//   frustumPrimitives.removeAll();
//   tileset.style = new Cesium.Cesium3DTileStyle();
// });





  /* // Set the initial camera view to look at Manhattan
  const initialPosition = Cesium.Cartesian3.fromDegrees(
    -74.01881302800248,
    40.69114333714821,
    753
  );
  const initialOrientation = new Cesium.HeadingPitchRoll.fromDegrees(
    21.27879878293835,
    -21.34390550872461,
    0.0716951918898415
  );
  viewer.scene.camera.setView({
    destination: initialPosition,
    orientation: initialOrientation,
    endTransform: Cesium.Matrix4.IDENTITY,
  }); */
/*   // Information about the currently selected feature
  const selected = {
    feature: undefined,
    originalColor: new Cesium.Color(),
  };

  // An entity object which will hold info about the currently selected feature for infobox display
  const selectedEntity = new Cesium.Entity();

  // Get default left click handler for when a feature is not picked on left click
  const clickHandler = viewer.screenSpaceEventHandler.getInputAction(
    Cesium.ScreenSpaceEventType.LEFT_CLICK
  );

  // If silhouettes are supported, silhouette features in blue on mouse over and silhouette green on mouse click.
  // If silhouettes are not supported, change the feature color to yellow on mouse over and green on mouse click.
   if (Cesium.PostProcessStageLibrary.isSilhouetteSupported(viewer.scene)) {
    // Silhouettes are supported
    const silhouetteBlue =
      Cesium.PostProcessStageLibrary.createEdgeDetectionStage();
    silhouetteBlue.uniforms.color = Cesium.Color.BLUE;
    silhouetteBlue.uniforms.length = 0.01;
    silhouetteBlue.selected = [];

    const silhouetteGreen =
      Cesium.PostProcessStageLibrary.createEdgeDetectionStage();
    silhouetteGreen.uniforms.color = Cesium.Color.LIME;
    silhouetteGreen.uniforms.length = 0.01;
    silhouetteGreen.selected = [];

    viewer.scene.postProcessStages.add(
      Cesium.PostProcessStageLibrary.createSilhouetteStage([
        silhouetteBlue,
        silhouetteGreen,
      ])
    );

    // Silhouette a feature blue on hover.
    viewer.screenSpaceEventHandler.setInputAction(function onMouseMove(
      movement
    ) {
        console.log('111');
        debugger
      // If a feature was previously highlighted, undo the highlight
      silhouetteBlue.selected = [];

      // Pick a new feature
      const pickedFeature = viewer.scene.pick(movement.endPosition);
      if (!Cesium.defined(pickedFeature)) {
        nameOverlay.style.display = "none";
        return;
      }

      // A feature was picked, so show it's overlay content
      nameOverlay.style.display = "block";
      nameOverlay.style.bottom = `${
        viewer.canvas.clientHeight - movement.endPosition.y
      }px`;
      nameOverlay.style.left = `${movement.endPosition.x}px`;
      const name = pickedFeature.getProperty("BIN");
      nameOverlay.textContent = name;

      // Highlight the feature if it's not already selected.
      if (pickedFeature !== selected.feature) {
        silhouetteBlue.selected = [pickedFeature];
      }
    },
    Cesium.ScreenSpaceEventType.MOUSE_MOVE);

    // Silhouette a feature on selection and show metadata in the InfoBox.
    viewer.screenSpaceEventHandler.setInputAction(function onLeftClick(
      movement
    ) {
        console.log('111');
      // If a feature was previously selected, undo the highlight
      silhouetteGreen.selected = [];

      // Pick a new feature
      const pickedFeature = viewer.scene.pick(movement.position);
      if (!Cesium.defined(pickedFeature)) {
        clickHandler(movement);
        return;
      }

      // Select the feature if it's not already selected
      if (silhouetteGreen.selected[0] === pickedFeature) {
        return;
      }

      // Save the selected feature's original color
      const highlightedFeature = silhouetteBlue.selected[0];
      if (pickedFeature === highlightedFeature) {
        silhouetteBlue.selected = [];
      }

      // Highlight newly selected feature
      silhouetteGreen.selected = [pickedFeature];

      // Set feature infobox description
      const featureName = pickedFeature.getProperty("name");
      selectedEntity.name = featureName;
      selectedEntity.description =
        'Loading <div class="cesium-infoBox-loading"></div>';
      viewer.selectedEntity = selectedEntity;
      selectedEntity.description =
        `${
          '<table class="cesium-infoBox-defaultTable"><tbody>' +
          "<tr><th>BIN</th><td>"
        }${pickedFeature.getProperty("BIN")}</td></tr>` +
        `<tr><th>DOITT ID</th><td>${pickedFeature.getProperty(
          "DOITT_ID"
        )}</td></tr>` +
        `<tr><th>SOURCE ID</th><td>${pickedFeature.getProperty(
          "SOURCE_ID"
        )}</td></tr>` +
        `</tbody></table>`;
    },
    Cesium.ScreenSpaceEventType.LEFT_CLICK);
  } else {
    // Silhouettes are not supported. Instead, change the feature color.

    // Information about the currently highlighted feature
    const highlighted = {
      feature: undefined,
      originalColor: new Cesium.Color(),
    };

    // Color a feature yellow on hover.
    viewer.screenSpaceEventHandler.setInputAction(function onMouseMove(
      movement
    ) {
        console.log('111');
      // If a feature was previously highlighted, undo the highlight
      if (Cesium.defined(highlighted.feature)) {
        highlighted.feature.color = highlighted.originalColor;
        highlighted.feature = undefined;
      }
      // Pick a new feature
      const pickedFeature = viewer.scene.pick(movement.endPosition);
      if (!Cesium.defined(pickedFeature)) {
        nameOverlay.style.display = "none";
        return;
      }
      // A feature was picked, so show it's overlay content
      nameOverlay.style.display = "block";
      nameOverlay.style.bottom = `${
        viewer.canvas.clientHeight - movement.endPosition.y
      }px`;
      nameOverlay.style.left = `${movement.endPosition.x}px`;
      let name = pickedFeature.getProperty("name");
      if (!Cesium.defined(name)) {
        name = pickedFeature.getProperty("id");
      }
      nameOverlay.textContent = name;
      // Highlight the feature if it's not already selected.
      if (pickedFeature !== selected.feature) {
        highlighted.feature = pickedFeature;
        Cesium.Color.clone(pickedFeature.color, highlighted.originalColor);
        pickedFeature.color = Cesium.Color.YELLOW;
      }
    },
    Cesium.ScreenSpaceEventType.MOUSE_MOVE);

    // Color a feature on selection and show metadata in the InfoBox.
    viewer.screenSpaceEventHandler.setInputAction(function onLeftClick(
      movement
    ) {
        console.log('111');
      // If a feature was previously selected, undo the highlight
      if (Cesium.defined(selected.feature)) {
        selected.feature.color = selected.originalColor;
        selected.feature = undefined;
      }
      // Pick a new feature
      const pickedFeature = viewer.scene.pick(movement.position);
      if (!Cesium.defined(pickedFeature)) {
        clickHandler(movement);
        return;
      }
      // Select the feature if it's not already selected
      if (selected.feature === pickedFeature) {
        return;
      }
      selected.feature = pickedFeature;
      // Save the selected feature's original color
      if (pickedFeature === highlighted.feature) {
        Cesium.Color.clone(highlighted.originalColor, selected.originalColor);
        highlighted.feature = undefined;
      } else {
        Cesium.Color.clone(pickedFeature.color, selected.originalColor);
      }
      // Highlight newly selected feature
      pickedFeature.color = Cesium.Color.LIME;
      // Set feature infobox description
      const featureName = pickedFeature.getProperty("name");
      selectedEntity.name = featureName;
      selectedEntity.description =
        'Loading <div class="cesium-infoBox-loading"></div>';
      viewer.selectedEntity = selectedEntity;
      selectedEntity.description =
        `${
          '<table class="cesium-infoBox-defaultTable"><tbody>' +
          "<tr><th>BIN</th><td>"
        }${pickedFeature.getProperty("BIN")}</td></tr>` +
        `<tr><th>DOITT ID</th><td>${pickedFeature.getProperty(
          "DOITT_ID"
        )}</td></tr>` +
        `<tr><th>SOURCE ID</th><td>${pickedFeature.getProperty(
          "SOURCE_ID"
        )}</td></tr>` +
        `<tr><th>Longitude</th><td>${pickedFeature.getProperty(
          "longitude"
        )}</td></tr>` +
        `<tr><th>Latitude</th><td>${pickedFeature.getProperty(
          "latitude"
        )}</td></tr>` +
        `<tr><th>Height</th><td>${pickedFeature.getProperty(
          "height"
        )}</td></tr>` +
        `<tr><th>Terrain Height (Ellipsoid)</th><td>${pickedFeature.getProperty(
          "TerrainHeight"
        )}</td></tr>` +
        `</tbody></table>`;
    },
    Cesium.ScreenSpaceEventType.LEFT_CLICK);
  }  */
})
</script>

<style scoped lang="scss">
$width: 100vw;
*{
    margin: 0;
    padding: 0;
}
#cesiumContainer{
    width: $width;
    height: 100vh;
}
</style>
