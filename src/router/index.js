import { createRouter, createWebHistory } from 'vue-router'
import StyleguideView from '@/views/StyleguideView.vue'
import ComponentView from '@/views/ComponentView.vue'
import HomeView from '@/views/HomeView.vue'
import EgenkontrolView from '@/views/EgenkontrolView.vue'
import TjeklisterView from '@/views/TjeklisterView.vue'
import EnhederView from '@/views/EnhederView.vue'
import BrugereView from '@/views/BrugereView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'root',
      component: HomeView
    },
    {
      path: '/styleguide',
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
      component: EgenkontrolView,
      //meta: { requiresAuth: true }
    },
    {
      path: '/tjeklister',
      name: 'tjeklister',
      component: TjeklisterView,
      //meta: { requiresAuth: true }
    },
    {
      path: '/enheder',
      name: 'enheder',
      component: EnhederView,
      //meta: { requiresAuth: true }
    },
    {
      path: '/brugere',
      name: 'brugere',
      component: BrugereView,
      //meta: { requiresAuth: true }
    }
  ]
})

export default router
