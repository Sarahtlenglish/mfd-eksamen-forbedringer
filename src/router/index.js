import { createRouter, createWebHistory } from 'vue-router'
import { IconCalendarEvent, IconClipboardText, IconListDetails, IconFireExtinguisher, IconUsers } from '@tabler/icons-vue'
import HomeView from '@/views/HomeView.vue'

// Define routes with additional metadata
export const routes = [
  {
    path: '/styleguide',
    name: 'styleguide',
    component: () => import('@/views/StyleguideView.vue'),
    meta: { 
      showInNav: false 
    }
  },
  {
    path: '/components',
    name: 'components',
    component: () => import('@/views/ComponentView.vue'),
    meta: { 
      showInNav: false 
    }
  },
  {
    path: '/',
    name: 'home',
    component: HomeView,
    meta: { 
      showInNav: true,
      navName: 'Kalender',
      icon: IconCalendarEvent
    }
  },
  {
    path: '/egenkontrol',
    name: 'egenkontrol',
    component: () => import('@/views/EgenkontrolView.vue'),
    meta: { 
      showInNav: true,
      navName: 'Egenkontrol',
      icon: IconClipboardText,
      //requiresAuth: true 
    }
  },
  {
    path: '/tjeklister',
    name: 'tjeklister',
    component: () => import('@/views/TjeklisterView.vue'),
    meta: { 
      showInNav: true,
      navName: 'Tjeklister',
      icon: IconListDetails,
      //requiresAuth: true 
    }
  },
  {
    path: '/enheder',
    name: 'enheder',
    component: () => import('@/views/EnhederView.vue'),
    meta: { 
      showInNav: true,
      navName: 'Enheder',
      icon: IconFireExtinguisher,
      //requiresAuth: true 
    }
  },
  {
    path: '/brugere',
    name: 'brugere',
    component: () => import('@/views/BrugereView.vue'),
    meta: { 
      showInNav: true,
      navName: 'Brugere',
      icon: IconUsers,
      //requiresAuth: true 
    }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
