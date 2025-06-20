<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import TablesComponent from '@/components/ui/TablesComponent.vue'
import DetailPanel from '@/components/panels/DetailPanelComponent.vue'
import ButtonComponent from '@/components/ui/ButtonComponent.vue'
import { IconPlus } from '@tabler/icons-vue'
import { useTjeklisteStore } from '@/stores/tjeklisteStore'
import { useDeleteHandler } from '@/composables/useDeleteHandler'
import { useEditHandler } from '@/composables/useEditHandler'
import { useCloseDetailPanelHandler } from '@/composables/useCloseDetailPanelHandler'
import { processTjeklister } from '@/utils/labelHelpers'
import { useBreakpoint } from '@/composables/useBreakpoint'

const tjeklisteStore = useTjeklisteStore()
const router = useRouter()
const { isTablet } = useBreakpoint()

// Local computed property for processed data
const processedTjeklister = computed(() => processTjeklister(tjeklisteStore.tjeklister))

const columns = [
  { key: 'type', label: 'Type' },
  { key: 'tjeklisteNavn', label: 'Tjeklistenavn' },
  { key: 'frekvens', label: 'Frekvens' }
]

const selectedItem = ref(null)
const loading = ref(true)

const { handleDelete } = useDeleteHandler({
  store: { delete: tjeklisteStore.deleteTjekliste },
  entityType: 'tjekliste',
  onDeleted: () => selectedItem.value = null
})

const handleRowClick = (item) => {
  selectedItem.value = item
}

const createTjekliste = () => {
  router.push('/tjeklister/opret')
}

const { closeDetailPanel } = useCloseDetailPanelHandler({ selectedItem })

const { handleEdit } = useEditHandler()

let unsubscribe
onMounted(async () => {
  loading.value = true
  try {
    await tjeklisteStore.fetchTjeklister()
    unsubscribe = tjeklisteStore.setupTjeklisterListener()
  } catch (error) {
    console.error('Error setting up tjeklister:', error)
  } finally {
    loading.value = false
  }
})

onUnmounted(() => {
  if (unsubscribe) {
    unsubscribe()
  }
})
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
      <div v-if="loading" class="loading-state">
        Henter tjeklister...
      </div>
      <div v-else-if="tjeklisteStore.error" class="error-state">
        Der opstod en fejl: {{ tjeklisteStore.error.message }}
      </div>
      <TablesComponent
        v-else
        :items="processedTjeklister"
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
    <div
      v-if="selectedItem && isTablet"
      class="detail-panel-overlay"
      @click="closeDetailPanel"
    ></div>
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

.loading-state,
.error-state {
  padding: $spacing-large;
  text-align: center;
  color: $neutral-600;
}

.error-state {
  color: $error-500;
}
</style>
