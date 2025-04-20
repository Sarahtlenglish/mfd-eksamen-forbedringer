<script setup>
import { ref, onMounted } from 'vue'
import TablesComponent from '@/components/ui/TablesComponent.vue'
import DetailPanel from '@/components/ui/DetailPanelComponent.vue'
import ButtonComponent from '@/components/ui/ButtonComponent.vue'
import { IconPlus } from '@tabler/icons-vue'
import { enhederData as initialEnhederData, enhederHistoryItems as initialHistoryItems } from '@/mock/index'

// Define columns for this view
const columns = [
  { key: 'name', label: 'Enhed' },
  { key: 'location', label: 'Lokation' }
]

// Brug data fra mock-filen
const enhederData = ref([...initialEnhederData])
const historyItems = ref([...initialHistoryItems])

// State for selected item
const selectedItem = ref(null)
const selectedItemKey = ref(0)

const handleRowClick = (item) => {
  selectedItem.value = item
  selectedItemKey.value++ // Increment the key to force a complete re-render
}

// Event handlers
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
  // Here you would typically call an API to delete the item
  enhederData.value = enhederData.value.filter(i => i.id !== item.id)
  selectedItem.value = null
}

// Opret en ny enhed (dummy funktion)
const createEnhed = () => {
  alert('Opret enhed funktionalitet er ikke implementeret endnu')
}

// Fetch data on component mount - in a real application
onMounted(async () => {
  // In a real app, you would fetch data from an API
  // Example:
  // try {
  //   const response = await fetch('/api/enheder');
  //   enhederData.value = await response.json();
  // } catch (error) {
  //   console.error('Error fetching data:', error);
  // }
})

</script>

<template>
  <div class="page-header">
    <h1 class="heading-1">{{ $route.meta.title }}</h1>
    <ButtonComponent
      variant="primary"
      @click="createEnhed"
    >
      <template #icon>
        <IconPlus />
      </template>
      Opret Enhed
    </ButtonComponent>
  </div>
  <div class="content-layout">
    <div class="table-section">
    <TablesComponent
      :items="enhederData"
      :columns="columns"
      :columnWidths="['50%', '50%']"
      :selectedItemId="selectedItem?.id"
      @row-click="handleRowClick"
    />
    </div>
    <DetailPanel
      v-if="selectedItem"
      :key="selectedItemKey"
      context="enheder"
      :item="selectedItem"
      :historyItems="historyItems"
      @close="closeDetailPanel"
      @edit="handleEdit"
      @delete="handleDelete"
      />
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
  }
</style>
