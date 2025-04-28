<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import TablesComponent from '@/components/ui/TablesComponent.vue'
import DetailPanel from '@/components/ui/panels/DetailPanelComponent.vue'
import ButtonComponent from '@/components/ui/ButtonComponent.vue'
import { IconPlus } from '@tabler/icons-vue'
import { useTjeklisteStore } from '@/stores/tjeklisteStore'

// Get store og router
const tjeklisteStore = useTjeklisteStore()
const router = useRouter()

// Define columns for this view
const columns = [
  { key: 'type', label: 'Type' },
  { key: 'tjekliste', label: 'Tjeklister' },
  { key: 'frequency', label: 'Frekvens' }
]

// State for selected item
const selectedItem = ref(null)

// Event handlers
const handleRowClick = (item) => {
  selectedItem.value = item
}

const createTjekliste = () => {
  // Naviger til opret tjekliste-view
  router.push('/tjeklister/opret')
}

const closeDetailPanel = () => {
  selectedItem.value = null
}

const handleEdit = (item) => {
  console.log('Edit item:', item)
  // Here you would typically open an edit form or dialog
  alert(`Redigering af ${item.tjekliste} - denne funktionalitet er ikke implementeret endnu`)
}

const handleDelete = (item) => {
  console.log('Delete item:', item)
  // Delete the item from the store
  tjeklisteStore.deleteTjekliste(item.id)
  selectedItem.value = null
}
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
      <TablesComponent
      :items="tjeklisteStore.tjeklisterData"
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
</style>
