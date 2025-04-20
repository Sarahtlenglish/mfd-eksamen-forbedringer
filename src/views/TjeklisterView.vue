<script setup>
import { ref, onMounted } from 'vue'
import TablesComponent from '@/components/ui/TablesComponent.vue'
import DetailPanel from '@/components/ui/panels/DetailPanelComponent.vue'
import ButtonComponent from '@/components/ui/ButtonComponent.vue'
import { IconPlus } from '@tabler/icons-vue'

// Define columns for this view
const columns = [
  { key: 'type', label: 'Type' },
  { key: 'tjekliste', label: 'Tjeklister' },
  { key: 'frequency', label: 'Frekvens' }
]

// Data state
const TjeklistData = ref([
  { id: 1, type: 'BR18', tjekliste: 'AVS anlæg', frequency: 'Ugentlig 7.5.2.1', description: 'Tjeklisten er til gennemgåelse af AVS anlæg, det er en type BR18 som skal udføres ugentlig' },
  { id: 2, type: 'BR18', tjekliste: 'Røgalarm anlæg', frequency: 'Kvartal 7.5.4.1', description: 'Tjeklisten er til gennemgåelse af Røgalarm anlæg, det er en type BR18 som skal udføres per kvartal' }
])

const selectedItem = ref(null)
// Add this missing variable
const selectedItemKey = ref(0)

// Handle row click
const handleRowClick = (item) => {
  selectedItem.value = item
  selectedItemKey.value++ // Increment to force re-render
}

// Add these missing functions
const closeDetailPanel = () => {
  selectedItem.value = null
}

const handleEdit = (item) => {
  console.log('Edit item:', item)
  // Implement edit functionality
}

const handleDelete = (item) => {
  console.log('Delete item:', item)
  TjeklistData.value = TjeklistData.value.filter(i => i.id !== item.id)
  selectedItem.value = null
}

const handleMicrocopy = (item) => {
  console.log('Microcopy for item:', item)
  // Implement microcopy functionality
}

const createTjekliste = () => {
  console.log('Opret item:')
  // Here you would typically open an edit form or dialog
  alert('Oprettelse af enhed - denne funktionalitet er ikke implementeret endnu')
}

</script>

<template>
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
      <TablesComponent
      :items="TjeklistData"
      :columns="columns"
      :columnWidths="['33%', '33%', '33%']"
      :selectedItemId="selectedItem?.id"
      @row-click="handleRowClick"
      />
    </div>
    <div class="detail-panel-section">
    <DetailPanel
      v-if="selectedItem"
      context="tjeklister"
      :item="selectedItem"
      :key="selectedItemKey"
      :showEditButton="true"
      :showBackButton="false"
      @close="closeDetailPanel"
      @edit="handleEdit"
      @delete="handleDelete"
      @microcopy="handleMicrocopy"
    />
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '@/assets/variables' as *;

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

  .table-section {
    min-width: 66%;
  }

  .detail-panel-section {
      min-width: 32%;
      height: 100%;
      max-height: 900px;
  }
}
</style>
