<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import TablesComponent from '@/components/ui/TablesComponent.vue'
import ButtonComponent from '@/components/ui/ButtonComponent.vue'
import GruppePanelComponent from '@/components/ui/panels/GruppePanelComponent.vue'
import { IconPlus } from '@tabler/icons-vue'
import DetailPanelComponent from '@/components/ui/panels/DetailPanelComponent.vue'
import { brugerStore } from '@/stores/brugerStore'

const router = useRouter()
const brugerStoreInstance = brugerStore()

// Define columns for this view
const columns = [
  { key: 'name', label: 'Navn' },
  { key: 'role', label: 'Rolle' }
]

// Data state from store
const brugerData = computed(() => {
  return brugerStoreInstance.brugere
})

const selectedItem = ref(null)

onMounted(() => {
  console.log('Brugere from store:', brugerData.value)
})

// Handle row click
const handleRowClick = (item) => {
  selectedItem.value = item
}

// Handle panel actions
const closeDetailPanel = () => {
  selectedItem.value = null
}

const handleEdit = (item) => {
  console.log('Edit item:', item)
  // Implement edit functionality
}

const handleDelete = (item) => {
  console.log('Delete item:', item)
  brugerStoreInstance.deleteBruger(item.id)
  selectedItem.value = null
}

const createBruger = () => {
  router.push('/brugere/opret')
}
</script>

<template>
  <div class="brugere-view">
    <div class="page-header">
      <h1 class="heading-1">{{ $route.meta.title || 'Brugere' }}</h1>
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
          v-if="selectedItem"
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
  </div>
</template>

<style lang="scss" scoped>
@use '@/assets/variables' as *;

.brugere-view {
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
  width: 100%;
  min-height: 800px;

  .table-section {
    min-width: 50%;
  }

  .gruppe-panel-section {
    width: 25%;
    height: 100%;
  }

  .detail-panel-section {
    width: 25%;
    height: 100%;
  }
}
</style>
