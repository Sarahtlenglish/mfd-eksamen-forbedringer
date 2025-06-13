<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import TablesComponent from '@/components/ui/TablesComponent.vue'
import ButtonComponent from '@/components/ui/ButtonComponent.vue'
import DetailPanel from '@/components/panels/DetailPanelComponent.vue'
import { IconPlus } from '@tabler/icons-vue'
import { useEgenkontrolStore } from '@/stores/egenkontrolStore'
import { useDeleteHandler } from '@/composables/useDeleteHandler'
import { useEditHandler } from '@/composables/useEditHandler'
import { useCloseDetailPanelHandler } from '@/composables/useCloseDetailPanelHandler'

const egenkontrolStore = useEgenkontrolStore()
const router = useRouter()

const columns = [
  { key: 'navn', label: 'Egenkontroller' },
  { key: 'type', label: 'Type' }
]

const selectedItem = ref(null)
const unsubscribe = ref(null)

onMounted(async () => {
  await egenkontrolStore.fetchEgenkontroller()
  unsubscribe.value = egenkontrolStore.setupEgenkontrollerListener()
})

onUnmounted(() => {
  if (unsubscribe.value) {
    unsubscribe.value()
  }
})

const handleRowClick = async (item) => {
  selectedItem.value = await egenkontrolStore.resolveReferences(item)
}

const createEgenkontrol = () => {
  router.push('/egenkontrol/opret')
}

const { closeDetailPanel } = useCloseDetailPanelHandler({ selectedItem })

const { handleEdit } = useEditHandler()

const { handleDelete } = useDeleteHandler({
  store: { delete: egenkontrolStore.deleteEgenkontrol },
  entityType: 'egenkontrol',
  onDeleted: () => selectedItem.value = null
})

// Global function to update selectedItem when temp IDs are replaced
function updateSelectedEgenkontrolId(oldId, newId) {
  console.log(`🔄 Attempting to update selectedItem in EgenkontrolView: ${oldId} → ${newId}`)

  if (selectedItem.value && selectedItem.value.id === oldId) {
    selectedItem.value = { ...selectedItem.value, id: newId, tempId: oldId }
    console.log(`✅ Updated selectedItem ID in EgenkontrolView: ${oldId} → ${newId}`)
  }
}

// Make function available globally for offline store
if (typeof window !== 'undefined') {
  window.updateSelectedEgenkontrolId = updateSelectedEgenkontrolId
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
        :loading="egenkontrolStore.loading"
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
