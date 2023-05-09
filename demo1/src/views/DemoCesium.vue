<template>
    <div id="cesiumContainer"></div>
</template>

<script setup>
import "cesium/Build/Cesium/Widgets/widgets.css"
import { onMounted } from 'vue';
import {getPolyline,Cesium} from "@/hooks/init"
// import {Picking,Cesium} from "@/hooks/Picking.js"
function initViewer(){
    return new Cesium.Viewer('cesiumContainer',{
        terrainProvider: Cesium.createWorldTerrain()
    })
}
onMounted(()=>{
    console.log('123');
    const viewer = new Cesium.Viewer("cesiumContainer", {
        terrainProvider: Cesium.createWorldTerrain(),
    });
    // Picking(viewer)
    // let viewer = initViewer()
    let polyline = getPolyline(viewer)
    viewer.zoomTo(polyline)
    
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
