<script setup>
import { ref, onMounted } from 'vue'
import TablesComponent from '@/components/ui/TablesComponent.vue'
import DetailPanel from '@/components/ui/DetailPanelComponent.vue'
import ButtonComponent from '@/components/ui/ButtonComponent.vue'
import { IconPlus } from '@tabler/icons-vue'

// Define columns for this view
const columns = [
  { key: 'name', label: 'Enhed' },
  { key: 'location', label: 'Lokation' }
]

// Sample data - you would typically fetch this from an API
const enhederData = ref([
  {
    id: 1,
    name: 'Branddør',
    location: 'Bygning A',
    description: 'Tjek at alle branddøre i Bygning A er op til standard og fungere som de skal',
    qrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=branddoer-bygningA',
    files: [
      { id: 1, name: 'Faktura fra Kasper Bohr', type: 'pdf' }
    ]
  },
  { id: 2, name: 'Flugtvejs skilte', location: 'Bygning A' },
  { id: 3, name: 'Slangevinder', location: 'Bygning A' },
  { id: 4, name: 'Brandslukker', location: 'Bygning A' },
  { id: 5, name: 'Flugtvejs plan', location: 'Bygning A' },
  { id: 6, name: 'Sprinkler', location: 'Bygning A' },
  { id: 7, name: 'Brandalarm', location: 'Bygning A' },
  { id: 8, name: 'Branddør', location: 'Bygning B' },
  { id: 9, name: 'Flugtvejs skilte', location: 'Bygning B' },
  { id: 10, name: 'Slangevinder', location: 'Bygning B' },
  { id: 11, name: 'Brandslukker', location: 'Bygning B' },
  { id: 12, name: 'Flugtvejs plan', location: 'Bygning B' },
  { id: 13, name: 'Sprinkler', location: 'Bygning B' }
])

// Sample history data
const historyItems = ref([
  {
    id: 1,
    type: 'NextInspection',
    title: 'Næste egenkontrol om 336 dage',
    date: 'Egenkontrol title',
    user: 'Christian Hansen'
  },
  {
    id: 2,
    type: 'dokumenter',
    title: 'Faktura fra Kasper Bohr',
    date: '1/3/2025',
    user: 'Christian Hansen'
  },
  {
    id: 3,
    type: 'opgave',
    title: 'Udført brændørs lukkemekaniske - Bygning A',
    date: '24/2/2025',
    user: 'Kasper Bohr'
  },
  {
    id: 4,
    type: 'kommentar',
    title: 'Mekaniker er tilkaldt til at fikse døren',
    date: '22/2/2025',
    user: 'Christian Hansen'
  },
  {
    id: 5,
    type: 'udført',
    title: 'Egenkontrol udført',
    date: '18/2/2025',
    user: 'Christian Hansen'
  }
])

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
