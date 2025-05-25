<script setup>
import { useRouter } from 'vue-router'
import { reactive, computed, onMounted } from 'vue'
import DetailPanel from '@/components/panels/DetailPanelComponent.vue'
import { IconX } from '@tabler/icons-vue'
import { useEgenkontrolStore } from '@/stores/egenkontrolStore'
import WizardFormComponent from '@/components/forms/WizardFormComponent.vue'
import { getWizardConfig } from '@/components/forms/WizardFormConfig.js'
import { useBrugerStore } from '@/stores/brugerStore'
import { useEnhedStore } from '@/stores/enhedStore'
import { useTjeklisteStore } from '@/stores/tjeklisteStore'
import { formatDateToISO } from '@/utils/dateHelpers'

const router = useRouter()
const egenkontrolStore = useEgenkontrolStore()
const brugerStore = useBrugerStore()
const enhedStore = useEnhedStore()
const tjeklisteStore = useTjeklisteStore()

const context = 'egenkontroller'

onMounted(() => {
  brugerStore.fetchBrugere()
  enhedStore.fetchEnheder()
  tjeklisteStore.fetchTjeklister()
})

const dynamicOptions = computed(() => ({
  checklistOptions: tjeklisteStore.tjeklister.map(t => ({ value: t.id, label: t.tjeklisteNavn || t.type || t.id })),
  locationOptions: enhedStore.enheder.map(e => ({ value: e.id, label: e.name || e.location || e.id })),
  responsibleOptions: brugerStore.brugere.map(b => ({ value: b.id, label: b.fuldeNavn || b.id })),
  brugerOptions: brugerStore.brugere.map(b => ({ value: b.id, label: b.fuldeNavn || b.id }))
}))

const config = computed(() =>
  getWizardConfig(context, {
    data: { egenkontroller: formData },
    dropdownOptions: dynamicOptions.value
  })
)

const formData = reactive({
  titel: '',
  beskrivelse: '',
  tjekliste: '',
  startDato: '',
  enhed: '',
  ansvarligeBrugere: '',
  påmindelseFørFrekvens: '',
  påmindelseFørTidspunkt: '',
  påmindelseEfterFrekvens: '',
  påmindelseEfterTidspunkt: '',
  kvitteringModtager: '',
  afvigelseModtager: '',
  selectedEnheder: '',
  selectedCheckliste: '',
  selectedAnsvarlige: '',
  reminderFrekvens: '',
  reminderTidspunkt: '',
  deadlineFrekvens: '',
  deadlineTidspunkt: ''
})

const detailItem = computed(() => ({
  navn: formData.navn || 'Ny egenkontrol',
  beskrivelse: formData.beskrivelse || 'Ingen beskrivelse angivet',
  type: 'Egenkontrol',
  status: 'normal',
  lokation: formData.selectedEnheder || formData.enhed || 'Enhed ikke angivet',
  checkliste: formData.selectedCheckliste || formData.tjekliste || 'Tjekliste ikke angivet',
  ansvarligeBrugere: [
    formData.selectedAnsvarlige
    || formData.ansvarligeBrugere
    || formData.ansvarlige
    || 'Bruger ikke angivet'
  ],
  påmindelser: [
    { frekvens: formData.påmindelseFørFrekvens || formData.reminderFrekvens, tidspunkt: formData.påmindelseFørTidspunkt || formData.reminderTidspunkt },
    { frekvens: formData.påmindelseEfterFrekvens || formData.deadlineFrekvens, tidspunkt: formData.påmindelseEfterTidspunkt || formData.deadlineTidspunkt }
  ],
  modtagere: [
    formData.kvitteringModtager || '',
    formData.afvigelseModtager || ''
  ],
  startDato: formatDateToISO(formData.startDato) || formatDateToISO(new Date())
}))

const handleFormUpdate = (newFormData) => {
  Object.assign(formData, newFormData)
}

const handleComplete = async () => {
  await egenkontrolStore.addEgenkontrol(detailItem.value)
  router.push('/egenkontrol')
}

const handleCancel = () => {
  router.push('/egenkontrol')
}
</script>

<template>
  <div class="opret-egenkontrol-view">
    <div class="page-header">
      <h1 class="heading-1">Opret Egenkontrol</h1>
      <button class="close-button" @click="handleCancel">
        <IconX />
      </button>
    </div>

    <div class="content-layout">
      <div class="form-container">
        <WizardFormComponent
          :context="context"
          :config="config"
          :formData="formData"
          @update:formData="handleFormUpdate"
          @complete="handleComplete"
          @cancel="handleCancel"
        />
      </div>

      <DetailPanel
        context="egenkontroller"
        :item="detailItem"
        :showBackButton="false"
        :showDeleteButton="false"
        :showEditButton="false"
        :isCreationMode="true"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '@/assets/variables' as *;

.opret-egenkontrol-view {
  height: 100%;
  min-height: 0;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0 0 24px 0;
}

.close-button {
  background: none;
  border: none;
  cursor: pointer;
  color: $secondary-500;
  padding: $spacing-xs;
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    width: 24px;
    height: 24px;
  }

  &:hover {
    color: $neutral-900;
  }
}

.content-layout {
  display: flex;
  flex: 1;
  gap: $spacing-large;
  overflow: hidden;
  min-height: 800px;
}

.form-container {
  min-width: 66%;
  box-sizing: border-box;
  height: 100%;
}
</style>
