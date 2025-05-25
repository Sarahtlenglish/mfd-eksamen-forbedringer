<script setup>
import { onMounted } from 'vue'
import SideNavigation from '@/components/navigation/SideNavigationComponent.vue'
import Header from '@/components/navigation/HeaderComponent.vue'
import { useRoute } from 'vue-router'
import { useEgenkontrolStore } from '@/stores/egenkontrolStore'
import { useBrugerStore } from '@/stores/brugerStore'
import { useEnhedStore } from '@/stores/enhedStore'
import { useTjeklisteStore } from '@/stores/tjeklisteStore'
import ModalComponent from '@/components/ui/ModalComponent.vue'
import { useModal } from '@/composables/useModal'

const route = useRoute()

const egenkontrolStore = useEgenkontrolStore()
const brugerStore = useBrugerStore()
const enhedStore = useEnhedStore()
const tjeklisteStore = useTjeklisteStore()

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

const shouldHideNavigation = () => {
  return route.path === '/components' || route.path === '/styleguide'
}
</script>

<template>
  <div class="app-container" :class="{ 'no-nav': shouldHideNavigation() }">
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
}

.app-container.no-nav {
  display: block;
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
</style>
