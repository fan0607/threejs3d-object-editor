<template>
  <el-container>
    <LoginTop />
    <LoginBottom />
  </el-container>
</template>

<script setup>
import LoginTop from "@/views/login/LoginTop.vue";
import LoginBottom from "@/views/login/LoginBottom.vue";
</script>

<style scoped>
.el-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
</style>
