import { createRouter, createWebHistory } from 'vue-router'
import StyleguideView from '../views/StyleguideView.vue'
import ComponentView from '../views/ComponentView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'styleguide',
      component: StyleguideView
    },
    {
      path: '/components',
      name: 'components',
      component: ComponentView
    }
  ]
})

export default router
