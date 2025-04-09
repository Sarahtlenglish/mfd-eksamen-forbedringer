<script setup>
import { ref, onMounted } from 'vue'
import TablesComponent from '@/components/ui/TablesComponent.vue'
import ButtonComponent from '@/components/ui/ButtonComponent.vue'
import { IconPlus } from '@tabler/icons-vue'

// Define columns for this view
const columns = [
  { key: 'type', label: 'Type' },
  { key: 'tjekliste', label: 'Tjeklister' },
  { key: 'frequency', label: 'Frekvens' }
]

// Data state
const TjeklistData = ref([])
const selectedItem = ref(null)

onMounted(async () => {
  // Fetch data from API or store
  // For demo, using static data
  TjeklistData.value = [
    { id: 1, type: 'BR18', tjekliste: 'AVS anlæg', frequency: 'Ugentlig 7.5.2.1' },
    { id: 2, type: 'BR18', tjekliste: 'Røgalarm anlæg', frequency: 'Kvartal 7.5.4.1' }
    // More items...
  ]
})

// Handle row click
const handleRowClick = (item) => {
  selectedItem.value = item
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
