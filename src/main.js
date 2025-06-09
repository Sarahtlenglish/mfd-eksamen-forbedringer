import './assets/main.scss'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

// Registers service worker for offline support
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js', { scope: '/' })
    .then((registration) => {
      registration.addEventListener('updatefound', () => {
        console.log('🔄 New content is available, reload?')
      })

      if (registration.waiting) {
        console.log('🔄 New content is available, reload?')
      }

      if (registration.active) {
        console.log('📱 App ready to work offline')
      }

      console.log('✅ SW Registered:', registration)
    })
    .catch((error) => {
      console.log('❌ SW registration error', error)
    })
}

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')

// PWA initialization logs
console.log('🚀 PWA App initialized')
console.log('🌐 Online status:', navigator.onLine)

// Track route changes for PWA navigation
router.beforeEach((to, from) => {
  console.log('🧭 Route changed:', from.path, '→', to.path)
})
