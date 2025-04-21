<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import TablesComponent from '@/components/ui/TablesComponent.vue'
import ButtonComponent from '@/components/ui/ButtonComponent.vue'
import DetailPanel from '@/components/ui/panels/DetailPanelComponent.vue'
import { IconPlus } from '@tabler/icons-vue'
import { useEgenkontrolStore } from '../stores/egenkontrolStore'

// Get store og router
const egenkontrolStore = useEgenkontrolStore()
const router = useRouter()

// Define columns for this view
const columns = [
  { key: 'name', label: 'Egenkontroller' },
  { key: 'type', label: 'Type' }
]

// State for selected item
const selectedItem = ref(null)

// Event handlers
const handleRowClick = (item) => {
  selectedItem.value = item
}

const createEgenkontrol = () => {
  // Naviger til opret egenkontrol-view
  router.push('/egenkontrol/opret')
}

const closeDetailPanel = () => {
  selectedItem.value = null
}

const handleEdit = (item) => {
  console.log('Edit item:', item)
  // Here you would typically open an edit form or dialog
  alert(`Redigering af ${item.name} - denne funktionalitet er ikke implementeret endnu`)
}

const handleDelete = (item) => {
  console.log('Delete item:', item)
  // Delete the item from the store
  egenkontrolStore.deleteEgenkontrol(item.id)
  selectedItem.value = null
}

</script>

<template>
<div class="egenkontrol-view">
  <div class="page-header">
    <h1 class="heading-1">{{ $route.meta.title }}</h1>
    <ButtonComponent
      variant="primary"
      @click="createEgenkontrol"
    >
      <template #icon>
        <IconPlus />
      </template>
      Opret Egenkontrol
    </ButtonComponent>
  </div>
  <div class="content-layout">
    <div class="table-section">
      <TablesComponent
        :items="egenkontrolStore.egenkontrollerData"
        :columns="columns"
        :columnWidths="['50%', '50%']"
        :selectedItemId="selectedItem?.id"
        @row-click="handleRowClick"
      />
    </div>
    <DetailPanel
        v-if="selectedItem"
        context="egenkontroller"
        :item="selectedItem"
        :showBackButton="true"
        :showDeleteButton="true"
        :showEditButton="true"
        @close="closeDetailPanel"
        @edit="handleEdit"
        @delete="handleDelete"
      />
  </div>
</div>
</template>

<style lang="scss" scoped>
@use '@/assets/variables' as *;

.egenkontrol-view {
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
