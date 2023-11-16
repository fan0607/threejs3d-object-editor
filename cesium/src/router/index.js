//使用路由
import { createRouter, createWebHashHistory } from 'vue-router'
const router = createRouter({
    history: createWebHashHistory(),
    routes: [
        { path: '/', component: () => import('../views/index/index.vue') },
        { path: '/GridPlane', component: () => import('../views/threejs/GridPlane.vue') },
        { path: '/basicThree', component: () => import('../views/threejs/basicThree.vue') },
        { path: '/PhysicsThree', component: () => import('../views/threejs/PhysicsThree.vue') },
        { path: '/load', component: () => import('../views/threejs/LoadModel.vue') },
        { path: '/quaternionThree', component: () => import('../views/threejs/quaternionThree.vue') },
        { path: '/initWater', component: () => import('../views/threejs/initWater.vue') },

        { path: '/CircleScan', component: () => import('../views/cesium/CircleScan.vue') },
        { path: '/InitBuilding', component: () => import('../views/cesium/InitBuilding.vue') },
        { path: '/InitCesium', component: () => import('../views/cesium/InitCesium.vue') },
        { path: '/initThree', component: () => import('../views/cesium/initThree.vue') },
        { path: '/NormalWater', component: () => import('../views/cesium/NormalWater.vue') },
        { path: '/ThreejsWater', component: () => import('../views/cesium/ThreejsWater.vue') },
        { path: '/ThreejsWaterWebgl1', component: () => import('../views/cesium/ThreejsWaterWebgl1.vue') },
        { path: '/FloodingAnalysis', component: () => import('../views/cesium/FloodingAnalysis.vue') },
        { path: '/ClippingPlanes', component: () => import('../views/cesium/ClippingPlanes.vue') },
        { path: '/WallCesium', component: () => import('../views/cesium/WallCesium.vue') },
    ]
})
export default router
