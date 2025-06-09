<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import SideNavigation from '@/components/navigation/SideNavigationComponent.vue'
import Header from '@/components/navigation/HeaderComponent.vue'
import { useRoute } from 'vue-router'
import { useEgenkontrolStore } from '@/stores/egenkontrolStore'
import { useBrugerStore } from '@/stores/brugerStore'
import { useEnhedStore } from '@/stores/enhedStore'
import { useTjeklisteStore } from '@/stores/tjeklisteStore'
import { useOfflineStore } from '@/stores/offlineStore'
import ModalComponent from '@/components/ui/ModalComponent.vue'
import InstallPromptComponent from '@/components/ui/InstallPromptComponent.vue'
import { useModal } from '@/composables/useModal'

const route = useRoute()

const egenkontrolStore = useEgenkontrolStore()
const brugerStore = useBrugerStore()
const enhedStore = useEnhedStore()
const tjeklisteStore = useTjeklisteStore()
const offlineStore = useOfflineStore()

const showOfflineNotification = ref(false)

const {
  showModal,
  modalTitle,
  modalMessage,
  modalPrimaryText,
  modalSecondaryText,
  modalPrimaryAction,
  modalSecondaryAction
} = useModal()

onMounted(async () => {
  // Setup offline store
  offlineStore.setupNetworkListeners()
  offlineStore.loadPendingActions()

  // Listen for PWA events
  window.addEventListener('pwa-offline-ready', () => {
    showOfflineNotification.value = true
    setTimeout(() => {
      showOfflineNotification.value = false
    }, 5000)
  })

  // Process pending actions when coming back online
  window.addEventListener('online', () => {
    offlineStore.processPendingActions()
  })

  try {
    await Promise.all([
      egenkontrolStore.fetchEgenkontroller(),
      brugerStore.fetchBrugere(),
      enhedStore.fetchEnheder(),
      tjeklisteStore.fetchTjeklister()
    ])
  } catch (error) {
    console.error('Error loading initial data:', error)
  }
})

onUnmounted(() => {
  offlineStore.removeNetworkListeners()
})

const shouldHideNavigation = () => {
  return route.path === '/components' || route.path === '/styleguide'
}
</script>

<template>
  <div class="app-container" :class="{ 'no-nav': shouldHideNavigation() }">
    <!-- Offline notification -->
    <div v-if="showOfflineNotification" class="offline-notification">
      <div class="notification-content">
        <span>📱 App er klar til offline brug!</span>
        <button @click="showOfflineNotification = false" class="close-btn">×</button>
      </div>
    </div>

    <!-- Network status indicator -->
    <div v-if="!offlineStore.isOnline" class="network-status offline">
      <span>⚠️ Offline tilstand - ændringer gemmes lokalt</span>
    </div>
    <div v-else-if="offlineStore.hasPendingActions" class="network-status syncing">
      <span>🔄 Synkroniserer ændringer...</span>
    </div>

    <SideNavigation v-if="!shouldHideNavigation()" />
    <div class="main-content" :class="{ 'full-width': shouldHideNavigation() }">
      <Header v-if="!shouldHideNavigation()" />
      <main class="content-area" :class="{ 'no-margin': shouldHideNavigation() }">
        <router-view />
      </main>
    </div>
    <ModalComponent
      :show="showModal"
      :title="modalTitle"
      :message="modalMessage"
      :primaryButtonText="modalPrimaryText"
      :secondaryButtonText="modalSecondaryText"
      :onPrimary="modalPrimaryAction"
      :onSecondary="modalSecondaryAction"
    />
    <InstallPromptComponent />
  </div>
</template>

<style lang="scss" scoped>
@use '@/assets/variables' as *;

body, html {
  margin: 0;
  padding: 0;
  font-family: $font-family-base;
  color: $neutral-700;
  height: 100%;
}

.app-container {
  display: flex;
  height: 100vh;
  overflow: hidden;
  position: relative;
}

.app-container.no-nav {
  display: block;
}

.offline-notification {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  background: #4caf50;
  color: white;
  padding: 12px 16px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);

  .notification-content {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .close-btn {
    background: none;
    border: none;
    color: white;
    font-size: 18px;
    cursor: pointer;
    padding: 0;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

.network-status {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 999;
  padding: 8px 16px;
  text-align: center;
  font-size: 14px;
  font-weight: 500;

  &.offline {
    background: #ff9800;
    color: white;
  }

  &.syncing {
    background: #2196f3;
    color: white;
  }
}

.main-content {
  flex: 1;
  margin-left: 250px;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.main-content.full-width {
  margin-left: 0;
}

.content-area {
  padding: $main-padding;
  margin-top: 70px;
  flex: 1;
  overflow-y: auto;
  box-sizing: border-box;
}

.content-area.no-margin {
  margin-top: 0;
}

// Adjust content when network status is shown
.app-container:has(.network-status) .content-area {
  margin-top: calc(70px + 40px);
}

.app-container:has(.network-status) .content-area.no-margin {
  margin-top: 40px;
}
</style>
