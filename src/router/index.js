import { createRouter, createWebHistory } from 'vue-router'
import { IconCalendarEvent, IconClipboardText, IconListDetails, IconFireExtinguisher, IconUsers } from '@tabler/icons-vue'
import StyleguideView from '@/views/StyleguideView.vue'
import ComponentView from '@/views/ComponentView.vue'
import HomeView from '@/views/HomeView.vue'
import EgenkontrolView from '@/views/EgenkontrolView.vue'
import TjeklisterView from '@/views/TjeklisterView.vue'
import EnhederView from '@/views/EnhederView.vue'
import BrugereView from '@/views/BrugereView.vue'

// Define routes with additional metadata
export const routes = [
  {
    path: '/',
    name: 'root',
    component: HomeView,
    meta: { 
      showInNav: false 
    }
  },
  {
    path: '/styleguide',
    name: 'styleguide',
    component: StyleguideView,
    meta: { 
      showInNav: false 
    }
  },
  {
    path: '/components',
    name: 'components',
    component: ComponentView,
    meta: { 
      showInNav: false 
    }
  },
  {
    path: '/home',
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
    component: EgenkontrolView,
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
    component: TjeklisterView,
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
    component: EnhederView,
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
    component: BrugereView,
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
