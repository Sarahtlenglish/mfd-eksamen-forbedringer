<script setup>
import { ref, onMounted } from 'vue'
import TablesComponent from '@/components/ui/TablesComponent.vue'
import ButtonComponent from '@/components/ui/ButtonComponent.vue'
import GruppePanelComponent from '@/components/ui/panels/GruppePanelComponent.vue'
import { IconPlus } from '@tabler/icons-vue'
import DetailPanelComponent from '@/components/ui/panels/DetailPanelComponent.vue'

// Define columns for this view
const columns = [
  { key: 'name', label: 'Navn' },
  { key: 'role', label: 'Rolle' }
]

// Data state
const brugerData = ref([
  { id: 1, name: 'Anders Jensen', role: 'Service Bruger', email: 'a@b.dk', telefon: '12345678', gruppe: 'Gruppe 1', adresse: 'Adresselinje 1', postnummer: '1234', by: 'Bynavn', leder: 'Christian Hansen', ansvarlig_for_egenkontrol: 'Egenkontrol 1' },
  { id: 2, name: 'Tanja Lund', role: 'Facility Manager', email: 'a@b.dk', telefon: '12345678', gruppe: 'Gruppe 2', adresse: 'Adresselinje 1', postnummer: '1234', by: 'Bynavn', leder: 'Christian Hansen', ansvarlig_for_egenkontrol: 'Egenkontrol 2' }
  // More items...
])
const selectedItem = ref(null)

/* onMounted(async () => {
  // Fetch data from API or store
  // For demo, using static data
  brugerData.value = [
    { id: 1, name: 'Anders Jensen', role: 'Service Bruger' },
    { id: 2, name: 'Tanja Lund', role: 'Facility Manager' }
    // More items...
  ]
}) */

// Handle row click
const handleRowClick = (item) => {
  selectedItem.value = item
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
  selectedItem.value = null
}
const createBruger = () => {
  console.log('Opret item:')
  // Here you would typically open an edit form or dialog
  alert('Oprettelse af bruger - denne funktionalitet er ikke implementeret endnu')
}
</script>

<template>
  <div class="page-header">
    <h1 class="heading-1">{{ $route.meta.title }}</h1>
    <ButtonComponent
      variant="primary"
      @click="createBruger"
    >
      <template #icon>
        <IconPlus />
      </template>
      Opret Bruger
    </ButtonComponent>
  </div>
  <div class="content-layout">
    <div class="gruppe-panel-section">
      <GruppePanelComponent />
    </div>
    <div class="table-section">
      <TablesComponent
        :items="brugerData"
        :columns="columns"
        :columnWidths="['50%', '50%']"
        :selectedItemId="selectedItem?.id"
        @row-click="handleRowClick"
      />
    </div>
    <div class="detail-panel-section">
      <DetailPanelComponent
        context="brugere"
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
    width: 100%;

    .table-section {
      min-width: 50%;
    }

    .gruppe-panel-section {
      width: 25%;
    }

    .detail-panel-section {
      width: 25%;
    }
  }
</style>
