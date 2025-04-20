<script setup>
import { ref, onMounted } from 'vue'
import TablesComponent from '@/components/ui/TablesComponent.vue'
import ButtonComponent from '@/components/ui/ButtonComponent.vue'
import DetailPanel from '@/components/ui/panels/DetailPanelComponent.vue'
import { IconPlus } from '@tabler/icons-vue'

// Define columns for this view
const columns = [
  { key: 'name', label: 'Egenkontroller' },
  { key: 'type', label: 'Type' }
]

// Sample data - you would typically fetch this from an API
const egenkontrollerData = ref([
  {
    id: 1,
    name: 'Reparer slangevinder - A1.27',
    type: 'Opgave'
  },
  {
    id: 2,
    name: 'Håndtryksknap inspektion',
    type: 'Egenkontrol',
    status: 'afvigelse',
    location: 'Udendørs A5.05',
    standard: 'BR18',
    standardTitle: 'Brand Håndtrykskammer',
    description: 'Funktionaliteten testes for at sikre, at alarmen aktiveres korrekt. Brandslukningseffektivitet og slangeutvikling vurderes for at sikre, at knappen er let at identificere og anvende i en nødsituation.',
    frequency: 'Ugentlig',
    startDate: '2025-03-11',
    responsibleUsers: ['Christian Hansen'],
    reminders: [
      { description: '1 dag før, kl. 09.00' },
      { description: 'Dagligt kl. 09.00 efter overskredet deadline' }
    ]
  },
  {
    id: 3,
    name: 'Branddørs inspektion',
    type: 'Egenkontrol'
  },
  {
    id: 4,
    name: 'Flugtvejsskilt Inspektion',
    type: 'Egenkontrol',
    status: 'normal',
    location: 'Lokale A5.05',
    standard: 'BR18',
    standardTitle: 'Flugtvejs- & panikbelysning 7.5.5.1',
    description: 'Belysningen testes for at bekræfte, at skiltet forbliver synligt i nødsituationer. Eventuelle skader, misfarvninger eller manglende dele vurderes, da disse kan påvirke skiltets effektivitet.',
    frequency: 'Ugentlig',
    startDate: '2025-01-01',
    responsibleUsers: ['Christian Hansen']
  },
  {
    id: 5,
    name: 'Brandtrappe Inspektion',
    type: 'Egenkontrol'
  },
  {
    id: 6,
    name: 'Varslingssystem Inspektion',
    type: 'Egenkontrol'
  },
  {
    id: 7,
    name: 'Brandslukker Inspektion',
    type: 'Egenkontrol'
  },
  {
    id: 8,
    name: 'Brandtrappe Inspektion',
    type: 'Egenkontrol'
  },
  {
    id: 9,
    name: 'Røgdetektor Inspektion',
    type: 'Egenkontrol'
  },
  {
    id: 10,
    name: 'Sprinkleranlæg Inspektion',
    type: 'Egenkontrol'
  },
  {
    id: 11,
    name: 'Brandmandsskab Inspektion',
    type: 'Egenkontrol'
  },
  {
    id: 12,
    name: 'Førstehjælpskasser Inspektion',
    type: 'Egenkontrol'
  },
  {
    id: 13,
    name: 'Brandslange Inspektion',
    type: 'Egenkontrol'
  }
])

// State for selected item
const selectedItem = ref(null)

// Event handlers
const handleRowClick = (item) => {
  selectedItem.value = item
}

const createEgenkontrol = () => {
  console.log('Opret item:')
  // Here you would typically open an edit form or dialog
  alert('Oprettelse af egenkontrol - denne funktionalitet er ikke implementeret endnu')
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
  // Here you would typically call an API to delete the item
  egenkontrollerData.value = egenkontrollerData.value.filter(i => i.id !== item.id)
  selectedItem.value = null
}

// Fetch data on component mount - in a real application
onMounted(async () => {
  // In a real app, you would fetch data from an API
  // Example:
  // try {
  //   const response = await fetch('/api/egenkontroller');
  //   egenkontrollerData.value = await response.json();
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
        :items="egenkontrollerData"
        :columns="columns"
        :columnWidths="['50%', '50%']"
        :selectedItemId="selectedItem?.id"
        @row-click="handleRowClick"
      />
    </div>
    <div class="detail-panel-section">
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
  }
}
</style>
