<template>
  <!-- PWA Install Prompt - shows when app can be installed -->
  <div v-if="showPrompt" class="install-prompt">
    <div class="install-content">
      <div class="install-icon">
        <IconDownload />
      </div>
      <div class="install-text">
        <h3>Installer DBI App</h3>
        <p>Få hurtig adgang og brug appen offline</p>
      </div>
      <div class="install-actions">
        <button @click="installApp" class="install-btn">Installer</button>
        <button @click="dismissPrompt" class="dismiss-btn">Ikke nu</button>
      </div>
    </div>
  </div>
</template>

<script setup>
// Shows install prompt if app is not installed
// PWA Install Component - handles app installation prompt
import { ref, onMounted, onUnmounted } from 'vue'
import { IconDownload } from '@tabler/icons-vue'

// Component state
const showPrompt = ref(false)
const deferredPrompt = ref(null) // Browser's install event

let beforeInstallPromptHandler = null

// Check if PWA is already installed
const isInstalled = () => {
  // Check standalone mode or previous installation record
  return window.matchMedia('(display-mode: standalone)').matches
    || window.navigator.standalone === true
    || localStorage.getItem('pwa-installed') === 'true'
}

onMounted(() => {
  // Don't show prompt if already installed
  if (isInstalled()) {
    console.log('📱 PWA already installed')
    return
  }

  // Listen for install prompt event
  beforeInstallPromptHandler = (e) => {
    // Double-check installation status
    if (isInstalled()) return

    console.log('📱 PWA install prompt available')
    e.preventDefault()
    deferredPrompt.value = e

    // Show prompt if not recently dismissed
    const dismissedTime = localStorage.getItem('install-prompt-dismissed')
    const weekInMs = 7 * 24 * 60 * 60 * 1000

    if (!dismissedTime || Date.now() - parseInt(dismissedTime) > weekInMs) {
      showPrompt.value = true
    }
  }

  window.addEventListener('beforeinstallprompt', beforeInstallPromptHandler)

  // Listen for successful installation
  window.addEventListener('appinstalled', () => {
    console.log('✅ PWA installed successfully')
    showPrompt.value = false
    deferredPrompt.value = null
    localStorage.setItem('pwa-installed', 'true')
  })
})

onUnmounted(() => {
  if (beforeInstallPromptHandler) {
    window.removeEventListener('beforeinstallprompt', beforeInstallPromptHandler)
  }
})

const installApp = async () => {
  if (!deferredPrompt.value) {
    console.log('❌ Install prompt not available')
    return
  }

  console.log('🚀 Triggering PWA install')
  deferredPrompt.value.prompt()

  const { outcome } = await deferredPrompt.value.userChoice
  console.log('👤 Install choice:', outcome)

  deferredPrompt.value = null
  showPrompt.value = false
}

const dismissPrompt = () => {
  showPrompt.value = false
  localStorage.setItem('install-prompt-dismissed', Date.now().toString())
}
</script>

<style lang="scss" scoped>
@use '@/assets/variables' as *;
@use '@/assets/icons' as *;

.install-prompt {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid $neutral-200;
  max-width: 400px;
  width: calc(100% - 40px);

  @media (max-width: 768px) {
    bottom: 0;
    left: 0;
    right: 0;
    transform: none;
    border-radius: 12px 12px 0 0;
    max-width: none;
    width: 100%;
  }
}

.install-content {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
}

.install-icon {
  font-size: 32px;
  flex-shrink: 0;
}

.install-text {
  flex: 1;

  h3 {
    margin: 0 0 4px 0;
    font-size: 16px;
    font-weight: 600;
    color: $neutral-900;
  }

  p {
    margin: 0;
    font-size: 14px;
    color: $neutral-600;
  }
}

.install-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.install-btn {
  background: $primary-500;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background: $primary-600;
  }
}

.dismiss-btn {
  background: none;
  color: $neutral-600;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: color 0.2s;

  &:hover {
    color: $neutral-900;
  }
}
</style>
