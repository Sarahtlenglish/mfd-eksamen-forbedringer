<script setup>
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import TablesComponent from '@/components/ui/TablesComponent.vue'
import DetailPanel from '@/components/panels/DetailPanelComponent.vue'
import ButtonComponent from '@/components/ui/ButtonComponent.vue'
import { IconPlus } from '@tabler/icons-vue'
import { useEnhedStore } from '@/stores/enhedStore'
import { processEnheder } from '@/utils/labelHelpers'
import { useDeleteHandler } from '@/composables/useDeleteHandler'
import { useEditHandler } from '@/composables/useEditHandler'
import { useCloseDetailPanelHandler } from '@/composables/useCloseDetailPanelHandler'
import ModalComponent from '@/components/ui/ModalComponent.vue'

const router = useRouter()
const enhedStore = useEnhedStore()

const processedEnheder = computed(() => processEnheder(enhedStore.enheder))

const columns = [
  { key: 'name', label: 'Enhed' },
  { key: 'location', label: 'Lokation' }
]

const enhederData = ref([])
const historyItems = ref([])
const selectedItem = ref(null)
const detailPanelRef = ref(null)

const handleRowClick = (item) => {
  selectedItem.value = item
  if (item) {
    historyItems.value = enhedStore.getHistoryForEnhed(item.id)
  }
  if (detailPanelRef.value?.resetHistoryMode) {
    detailPanelRef.value.resetHistoryMode()
  }
}

const createEnhed = () => {
  router.push('/enheder/opret')
}

const { closeDetailPanel } = useCloseDetailPanelHandler({
  selectedItem,
  historyItems
})

const showModal = ref(false)
const modalTitle = ref('')
const modalMessage = ref('')
const modalPrimaryText = ref('OK')
const modalSecondaryText = ref('Luk')
const modalPrimaryAction = ref(() => {
  showModal.value = false
})
const modalSecondaryAction = ref(() => {
  showModal.value = false
})

function openModal({ title, message, primaryText = 'OK', secondaryText = 'Luk', onPrimary, onSecondary }) {
  modalTitle.value = title
  modalMessage.value = message
  modalPrimaryText.value = primaryText
  modalSecondaryText.value = secondaryText
  modalPrimaryAction.value = onPrimary || (() => {
    showModal.value = false
  })
  modalSecondaryAction.value = onSecondary || (() => {
    showModal.value = false
  })
  showModal.value = true
}

const { handleEdit } = useEditHandler(openModal)

const { handleDelete } = useDeleteHandler({
  store: { delete: enhedStore.deleteEnhed },
  entityType: 'enhed',
  onDeleted: () => selectedItem.value = null
})

watch(() => enhedStore.enheder, (newEnheder) => {
  console.log('EnhederView: Store enheder updated:', newEnheder)
  enhederData.value = [...newEnheder]
}, { deep: true, immediate: true })

let unsubscribe
onMounted(async () => {
  console.log('EnhederView: Setting up Firestore listener')
  unsubscribe = enhedStore.setupEnhederListener()
  // Fetch initial data
  await enhedStore.fetchEnheder()
})

onUnmounted(() => {
  console.log('EnhederView: Cleaning up Firestore listener')
  if (unsubscribe) {
    unsubscribe()
  }
})

</script>

<template>
<div class="enheder-view">
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
      :items="processedEnheder"
      :columns="columns"
      :columnWidths="['50%', '50%']"
      :selectedItemId="selectedItem?.id"
      @row-click="handleRowClick"
    />
    </div>
    <DetailPanel
      v-if="selectedItem"
      ref="detailPanelRef"
      context="enheder"
      :item="selectedItem"
      :historyItems="historyItems"
      :showBackButton="false"
      @close="closeDetailPanel"
      @edit="handleEdit"
      @delete="handleDelete"
    />
  </div>
  <ModalComponent
    :show="showModal"
    :title="modalTitle"
    :message="modalMessage"
    :primaryButtonText="modalPrimaryText"
    :secondaryButtonText="modalSecondaryText"
    :onPrimary="modalPrimaryAction"
    :onSecondary="modalSecondaryAction"
  />
</div>
</template>

<style lang="scss" scoped>
  @use '@/assets/variables' as *;

.enheder-view {
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
    min-width: 66%;
  }
}
</style>
