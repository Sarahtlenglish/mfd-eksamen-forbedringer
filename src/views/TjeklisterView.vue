<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import TablesComponent from '@/components/ui/TablesComponent.vue'
import DetailPanel from '@/components/ui/panels/DetailPanelComponent.vue'
import ButtonComponent from '@/components/ui/ButtonComponent.vue'
import { IconPlus } from '@tabler/icons-vue'
import { useTjeklisteStore } from '@/stores/tjeklisteStore'
import { tjeklisteConfig } from '@/config/tjeklisteConfig'

// Get store og router
const tjeklisteStore = useTjeklisteStore()
const router = useRouter()

// Helper functions to get labels
const getFrekvensLabel = (value) => {
  const option = tjeklisteConfig.frekvensOptions.find(opt => opt.value === value)
  return option ? option.label : value
}

const getTypeLabel = (value) => {
  const option = tjeklisteConfig.typeOptions.find(opt => opt.value === value)
  return option ? option.label : value
}

// Process checklist data to include labels
const processedTjeklister = computed(() => {
  return tjeklisteStore.tjeklisterData.map(item => ({
    ...item,
    type: getTypeLabel(item.type),
    frekvens: getFrekvensLabel(item.frekvens)
  }))
})

// Define columns for this view
const columns = [
  { key: 'type', label: 'Type' },
  { key: 'tjeklisteNavn', label: 'Tjeklistenavn' },
  { key: 'frekvens', label: 'Frekvens' }
]

// State for selected item
const selectedItem = ref(null)
const loading = ref(true)

// Event handlers
const handleRowClick = (item) => {
  selectedItem.value = item
}

const createTjekliste = () => {
  router.push('/tjeklister/opret')
}

const closeDetailPanel = () => {
  selectedItem.value = null
}

const handleEdit = (item) => {
  console.log('Edit item:', item)
  // Here you would typically open an edit form or dialog
  alert(`Redigering af ${item.tjeklisteNavn} - denne funktionalitet er ikke implementeret endnu`)
}

const handleDelete = async (item) => {
  if (confirm(`Er du sikker på, at du vil slette ${item.tjeklisteNavn}?`)) {
    try {
      await tjeklisteStore.deleteTjekliste(item.id)
      selectedItem.value = null
    } catch (error) {
      console.error('Error deleting tjekliste:', error)
      alert('Der opstod en fejl under sletningen af tjeklisten.')
    }
  }
}

// Set up real-time listener when component mounts
let unsubscribe
onMounted(async () => {
  loading.value = true
  try {
    // Initial fetch
    await tjeklisteStore.fetchTjeklister()
    // Set up real-time listener
    unsubscribe = tjeklisteStore.setupTjeklisterListener()
  } catch (error) {
    console.error('Error setting up tjeklister:', error)
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
<div class="tjeklister-view">
  <div class="page-header">
    <h1 class="heading-1">{{ $route.meta.title }}</h1>
    <ButtonComponent
      variant="primary"
      @click="createTjekliste"
    >
      <template #icon>
        <IconPlus />
      </template>
      Opret Tjekliste
    </ButtonComponent>
  </div>
  <div class="content-layout">
    <div class="table-section">
      <div v-if="loading" class="loading-state">
        Henter tjeklister...
      </div>
      <div v-else-if="tjeklisteStore.error" class="error-state">
        Der opstod en fejl: {{ tjeklisteStore.error.message }}
      </div>
      <TablesComponent
        v-else
        :items="processedTjeklister"
        :columns="columns"
        :columnWidths="['33%', '33%', '33%']"
        :selectedItemId="selectedItem?.id"
        @row-click="handleRowClick"
      />
    </div>
    <DetailPanel
      v-if="selectedItem"
      context="tjeklister"
      :item="selectedItem"
      :showEditButton="true"
      :showBackButton="false"
      @close="closeDetailPanel"
      @edit="handleEdit"
      @delete="handleDelete"
    />
  </div>
</div>
</template>

<style lang="scss" scoped>
@use '@/assets/variables' as *;

.tjeklister-view {
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
  min-height: 800px;

  .table-section {
    min-width: 66%;
  }
}

.loading-state,
.error-state {
  padding: $spacing-large;
  text-align: center;
  color: $neutral-600;
}

.error-state {
  color: $error-500;
}
</style>
