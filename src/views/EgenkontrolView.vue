<script setup>
import { ref, onMounted } from 'vue'
import TablesComponent from '@/components/ui/TablesComponent.vue'
import ButtonComponent from '@/components/ui/ButtonComponent.vue'
import { IconPlus } from '@tabler/icons-vue'

// Define columns for this view
const columns = [
  { key: 'name', label: 'Egenkontroller' },
  { key: 'type', label: 'Type' }
]

// Data state
const egenkontrollerData = ref([])
const selectedItem = ref(null)
const isLoading = ref(false)

// Fetch data on component mount
onMounted(async () => {
  isLoading.value = true
  try {
    // Fetch data from API or store
    // egenkontrollerData.value = await fetchEgenkontroller();
    // For demo, using static data
    egenkontrollerData.value = [
      { id: 1, name: 'Reparer slangevinder - A1.27', type: 'Opgave' },
      { id: 2, name: 'Håndtrykskap inspektion', type: 'Egenkontrol' },
      { id: 3, name: 'Branddørs inspektion', type: 'Egenkontrol' }
      // More items...
    ]
  } catch (error) {
    console.error('Error fetching data:', error)
  } finally {
    isLoading.value = false
  }
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
      @click="createEgenkontrol"
    >
      <template #icon>
        <IconPlus />
      </template>
      Opret Egenkontrol
    </ButtonComponent>
  </div>
  <TablesComponent
      :items="egenkontrollerData"
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
