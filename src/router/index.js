import { createRouter, createWebHistory } from 'vue-router'
import StyleguideView from '@/views/StyleguideView.vue'
import ComponentView from '@/views/ComponentView.vue'
import HomeView from '@/views/HomeView.vue'
import EgenkontrolView from '@/views/EgenkontrolView.vue'
import ChecklisterView from '@/views/ChecklisterView.vue'
import EnhederView from '@/views/EnhederView.vue'
import BrugereView from '@/views/BrugereView.vue'

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
    },
    {
      path: '/home',
      name: 'home',
      component: HomeView
    },
    {
      path: '/egenkontrol',
      name: 'egenkontrol',
      component: () => import('@/views/EgenkontrolView.vue'),
      //meta: { requiresAuth: true }
    },
    {
      path: '/checklister',
      name: 'checklister',
      component: () => import('@/views/ChecklisterView.vue'),
      //meta: { requiresAuth: true }
    },
    {
      path: '/enheder',
      name: 'enheder',
      component: () => import('@/views/EnhederView.vue'),
      //meta: { requiresAuth: true }
    },
    {
      path: '/brugere',
      name: 'brugere',
      component: () => import('@/views/BrugereView.vue'),
      //meta: { requiresAuth: true }
    }
  ]
})

export default router
