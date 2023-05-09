<template>
    <div id="cesiumContainer"></div>
</template>

<script setup>
// import * as Cesium from 'cesium'
import "cesium/Build/Cesium/Widgets/widgets.css"
import { onMounted } from 'vue';
// import {getPolyline} from "../hooks/init"
let viewer;
function initViewer(){
    viewer = new Cesium.Viewer('cesiumContainer',{
        terrainProvider: Cesium.createWorldTerrain()
    })
}
onMounted(()=>{
    console.log('123');
    initViewer()
    
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
