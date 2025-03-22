import { createRouter, createWebHistory } from 'vue-router'
import StyleguideView from '../views/StyleguideView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'styleguide',
      component: StyleguideView
    }
  ]
})

export default router
