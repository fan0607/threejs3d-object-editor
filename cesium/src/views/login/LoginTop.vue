<template>
    <ElMain>
        <div class="loginTop">
        <span class="title">{{ title }}</span>
        <el-button class="officeColor" :icon="OfficeBuilding">{{ changeButton }}</el-button>
        <button class="config w-12 h-12">
            配置
        </button>
    </div>
    <div class="loginMain">
        <el-input
        v-model="input1" size="small"
        class="w-11/12 m-3 h-14"
        placeholder="请输入账号"
        :prefix-icon="User"
      />
      <el-input 
        v-model="input2" size="small"
        class="w-11/12 m-3 h-14"
        type="password"
        placeholder="请输入密码"
        :prefix-icon="Lock"
      />
      <el-button 
        class="w-11/12 m-3 h-14"
       type="primary">登录</el-button>
    </div>
    </ElMain>   
</template>

<script setup>
import { defineProps,ref } from 'vue'
import { OfficeBuilding,User,Lock } from '@element-plus/icons-vue'
const input1 = ref('');
const input2 = ref('');
const title = ref('')
const changeButton = ref('企业端')
</script>

<style lang="scss" scoped>
.loginTop{
    display: flex;
    align-items: center;
    flex-direction: column;
    background-image: url('@/assets/附件.png');
    background-size: cover;
    padding: 1rem;
    height: 50%;
    .title{
        font-size: 29px;
        color: #fff;
        margin-top: 15.5rem;
        margin-bottom:1rem;
        font-weight:600;
    }
    .config{
        position: absolute;
        right: 1.5rem;
        top:3.5rem;
        background-color: rgba(117, 111, 107, 0.5);
        color:#fff;
        border-radius: 5%;
        display: flex;
        align-items:flex-end;
        justify-content: center;
    }
    .officeColor{
    background-color: #fff;
    color: #1e93ff;
}
}
.el-main{
  flex-grow: 1;
  padding: 0;
}
.loginMain{
    display: flex;
    align-items: center;
    flex-direction: column;
    margin-top: 1rem;
    .el-input{
        width: 80%;
        --el-input-height:1.8rem;
        font-size:1.6rem;
    }
}
</style>
