<script setup>
import { ref, onMounted } from 'vue'
import TablesComponent from '@/components/ui/TablesComponent.vue'
import ButtonComponent from '@/components/ui/ButtonComponent.vue'
import { IconPlus } from '@tabler/icons-vue'

// Define columns for this view
const columns = [
  { key: 'name', label: 'Enhed' },
  { key: 'location', label: 'Lokation' }
]

// Data state
const enhederData = ref([])
const selectedItem = ref(null)

onMounted(async () => {
  // Fetch data from API or store
  // For demo, using static data
  enhederData.value = [
    { id: 1, name: 'Branddør', location: 'Bygning A' },
    { id: 2, name: 'Flugtvejs skilte', location: 'Bygning A' }
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
      @click="createEnhed"
    >
      <template #icon>
        <IconPlus />
      </template>
      Opret Enhed
    </ButtonComponent>
  </div>
  <TablesComponent
    :items="enhederData"
    :columns="columns"
    :columnWidths="['50%', '50%']"
    :selectedItemId="selectedItem?.id"
    @row-click="handleRowClick"
  />
</template>

<style scoped>
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 0 0 24px 0;
  }
</style>
