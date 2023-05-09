import { createRouter, createWebHistory } from 'vue-router'
import DemoCesium from '../views/DemoCesium.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: DemoCesium
    }
  ]
})

export default router
