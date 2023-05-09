import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
// import App from './views/demoCesium.vue'
import router from './router'

import './assets/main.css'
window.CESIUM_BASE_URL = '/';

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
