<template>
  <div id="appContainer">
    <el-menu
      :router="true"
      default-active="2"
      class="el-menu-vertical-demo"
      :collapse="isCollapse"
      @open="handleOpen"
      @close="handleClose"
    >
    <el-menu-item index="/">
      <el-icon><HomeFilled /></el-icon>
      <template #title><span>Home</span></template>
    </el-menu-item>
      <el-sub-menu index="1">
        <template #title>
          <el-icon><location /></el-icon>
          <span>CESIUMJS</span>
        </template>
          <el-menu-item-group>
            <template #title><span>CESIUMJS</span></template>
            <el-menu-item index="/CircleScan">CircleScan</el-menu-item>
            <el-menu-item index="/InitBuilding">InitBuilding</el-menu-item>
            <el-menu-item index="/InitCesium">InitCesium</el-menu-item>
            <el-menu-item index="/initThree">initThree</el-menu-item>
            <el-menu-item index="/NormalWater">NormalWater</el-menu-item>
            <el-menu-item index="/ThreejsWater">ThreejsWater</el-menu-item>
            <el-menu-item index="/ThreejsWaterWebgl1">ThreejsWaterWebgl1</el-menu-item>
            <el-menu-item index="/FloodingAnalysis">FloodingAnalysis</el-menu-item>
            <el-menu-item index="/ClippingPlanes">ClippingPlanes</el-menu-item>
          </el-menu-item-group>
      </el-sub-menu>
      <el-sub-menu>
        <template #title>
        <el-icon><icon-menu /></el-icon>
        <span>THREEJS</span>
        </template>
        <el-menu-item-group>
            <template #title><span>THREEJS</span></template>
            <el-menu-item index="/basicThree">basicThree</el-menu-item>
            <el-menu-item index="/PhysicsThree">PhysicsThree</el-menu-item>
            <el-menu-item index="/GridPlane">GridPlane</el-menu-item>
            <el-menu-item index="/load">LoadModel</el-menu-item>
            <el-menu-item index="/initWater">initWater</el-menu-item>

          </el-menu-item-group>
    </el-sub-menu>
    </el-menu>
    <router-view />
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import router from "./router";

const count = ref(0);
import {
  Menu as IconMenu,
  Location,
  HomeFilled
} from '@element-plus/icons-vue'

const isCollapse = ref(true)
onMounted(() => {
});

</script>

<style lang="scss" scoped>
.el-menu--collapse {
  // opacity: 0;
  // display: none;
  position: absolute;
  // min-height: 400px;
  z-index: 1;
}
</style>
