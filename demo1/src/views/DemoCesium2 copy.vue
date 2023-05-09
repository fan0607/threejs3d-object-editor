<template>
    <div id="cesiumContainer"></div>
</template>

<script setup>
import "cesium/Build/Cesium/Widgets/widgets.css"
import * as Cesium from 'cesium'
import { onMounted } from 'vue';
Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI3ZmQxNDc1MS05ZGYwLTQyMDktYjVlOS02MzQ0ZGJkNzkxZDEiLCJpZCI6MTIwOTE1LCJpYXQiOjE2NzMzNTY4NjF9.IJXioTp0FvkLeyEsrCPt1Fql0iZzS3GpeFXRacToz_Y'

// import {getPolyline,Cesium} from "@/hooks/init"
// import {Picking,Cesium} from "@/hooks/Picking.js"
function initViewer(){
    return new Cesium.Viewer('cesiumContainer',{
        terrainProvider: Cesium.createWorldTerrain()
    })
}
onMounted(()=>{
    const viewer = new Cesium.Viewer("cesiumContainer", {
    terrainProvider: Cesium.createWorldTerrain(),
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
 var handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas);
 handler.setInputAction(function(movement) {
    // var feature = viewer.scene.pick(movement.endPosition);
    var feature = viewer.scene.pick((410.3999938964844, 385.6000061035156));

    if (feature instanceof Cesium.Cesium3DTileFeature) {
        var propertyNames = feature.getPropertyIds();
        feature.color = Cesium.Color.YELLOW;
        let batchId = feature.batchId;//feature.featureId
        var length = propertyNames.length;
        /* for (var i = 0; i < length; ++i) {
            var propertyName = propertyNames[i];
            console.log(propertyName + ': ' + feature.getProperty(propertyName));
        } */
    }
}, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
 viewer.zoomTo(tileset);





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
