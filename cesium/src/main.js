import './assets/main.css'
import './style.css'
import { createApp } from 'vue'
//路由
import router from './router'
// import VueCesium from 'vue-cesium'
import App from './App.vue'

// import 'vue-cesium/dist/index.css'
const app = createApp(App)
app.use(router)

/* app.use(VueCesium,{
    accessToken:'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI3ZmQxNDc1MS05ZGYwLTQyMDktYjVlOS02MzQ0ZGJkNzkxZDEiLCJpZCI6MTIwOTE1LCJpYXQiOjE2NzMzNTY4NjF9.IJXioTp0FvkLeyEsrCPt1Fql0iZzS3GpeFXRacToz_Y'
}) // 将默认使用 https://unpkg.com/cesium@latest/Build/Cesium/Cesium.js */
// 由于Cesium更新可能有破坏性更新，建议在生产环境中锁定 Cesium 版本
// app.use(VueCesium, {
//   cesiumPath: 'https://unpkg.com/cesium@1.104.0/Build/Cesium/Cesium.js'
// })
app.mount('#app')

