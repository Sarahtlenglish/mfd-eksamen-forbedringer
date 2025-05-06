<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import TablesComponent from '@/components/ui/TablesComponent.vue'
import ButtonComponent from '@/components/ui/ButtonComponent.vue'
import GruppePanelComponent from '@/components/ui/panels/GruppePanelComponent.vue'
import { IconPlus } from '@tabler/icons-vue'
import DetailPanelComponent from '@/components/ui/panels/DetailPanelComponent.vue'
import { useBrugerStore } from '@/stores/brugerStore'
import { processBrugere } from '@/utils/labelHelpers'

const router = useRouter()
const brugerStore = useBrugerStore()

// Process checklist data to include labels
const processedBrugere = computed(() => processBrugere(brugerStore.brugere))

// Define columns for this view
const columns = [
  { key: 'fuldeNavn', label: 'Navn' },
  { key: 'rolle', label: 'Rolle' }
]

// Data state from store
const loading = ref(false)

const selectedItem = ref(null)

// Handle row click
const handleRowClick = (item) => {
  selectedItem.value = item
}

// Handle panel actions
const closeDetailPanel = () => {
  selectedItem.value = null
}

const handleEdit = (item) => {
  console.log('Edit item:', item)
  // Implement edit functionality
}

const handleDelete = async (item) => {
  if (confirm(`Er du sikker på, at du vil slette ${item.fuldeNavn}?`)) {
    try {
      await brugerStore.deleteBruger(item.id)
      selectedItem.value = null
    } catch (error) {
      console.error('Error deleting bruger:', error)
      alert('Der opstod en fejl under sletningen af brugeren.')
    }
  }
}

const createBruger = () => {
  router.push('/brugere/opret')
}

// Set up real-time listener when component mounts
let unsubscribe
onMounted(async () => {
  loading.value = true
  try {
    // Initial fetch
    await brugerStore.fetchBrugere()
    // Set up real-time listener
    unsubscribe = brugerStore.setupBrugereListener()
  } catch (error) {
    console.error('Error setting up brugere:', error)
  } finally {
    loading.value = false
  }
})

// Clean up listener when component unmounts
onUnmounted(() => {
  if (unsubscribe) {
    unsubscribe()
  }
})
</script>

<template>
  <div class="brugere-view">
    <div class="page-header">
      <h1 class="heading-1">{{ $route.meta.title || 'Brugere' }}</h1>
      <ButtonComponent
        variant="primary"
        @click="createBruger"
      >
        <template #icon>
          <IconPlus />
        </template>
        Opret Bruger
      </ButtonComponent>
    </div>
    <div class="content-layout">
      <div class="gruppe-panel-section">
        <GruppePanelComponent />
      </div>
      <div class="table-section">
        <div v-if="loading" class="loading">Loading...</div>
        <TablesComponent
          v-else
          :items="processedBrugere"
          :columns="columns"
          :columnWidths="['50%', '50%']"
          :selectedItemId="selectedItem?.id"
          @row-click="handleRowClick"
        />
      </div>
      <div class="detail-panel-section">
        <DetailPanelComponent
          v-if="selectedItem"
          context="brugere"
          :item="selectedItem"
          :showEditButton="true"
          :showBackButton="false"
          @close="closeDetailPanel"
          @edit="handleEdit"
          @delete="handleDelete"
        />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '@/assets/variables' as *;

.brugere-view {
  height: 100%;
  min-height: 0;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0 0 24px 0;
}

.content-layout {
  display: flex;
  flex: 1;
  gap: $spacing-large;
  overflow: hidden;
  width: 100%;
  min-height: 800px;

  .table-section {
    min-width: 50%;
  }

  .gruppe-panel-section {
    width: 25%;
    height: 100%;
  }

  .detail-panel-section {
    width: 25%;
    height: 100%;
  }
}

.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  font-size: 1.2rem;
  color: $neutral-600;
}
</style>
