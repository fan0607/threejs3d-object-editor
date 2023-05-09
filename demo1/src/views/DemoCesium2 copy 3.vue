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
    var feature = viewer.scene.pick(movement.endPosition);
    // var feature = viewer.scene.pick((410.3999938964844, 385.6000061035156));

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
