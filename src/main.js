import './assets/main.scss'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

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
