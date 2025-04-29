<!-- EnhederDetailContent.vue -->
<script setup>
import { ref, computed } from 'vue'
import { IconPrinter, IconUpload, IconFileText } from '@tabler/icons-vue'
import ButtonComponent from '@/components/ui/ButtonComponent.vue'

const props = defineProps({
  item: {
    type: Object,
    required: true
  },
  showHistoryButton: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['toggle-history'])

// Check if the item is a group
const isGruppe = computed(() => {
  return props.item.type === 'Gruppe'
})

// Check if there are underenheder
const hasUnderenheder = computed(() => {
  return props.item.underenheder && props.item.underenheder.length > 0
})

// Get count of underenheder
const underenhederCount = computed(() => {
  if (!props.item.underenheder) return 0
  return props.item.underenheder.length
})
</script>

<template>
    <div class="detail-section">
      <div class="location body-1-semibold">{{ item.location }}</div>

      <p v-if="item.description" class="description">
        {{ item.description }}
      </p>

      <div v-if="showHistoryButton" class="action-buttons">
        <ButtonComponent
          size="small"
          variant="secondary"
          @click="emit('toggle-history')"
        >
          Se historik
        </ButtonComponent>
      </div>
    </div>

    <div v-if="isGruppe && hasUnderenheder" class="underenheder-section">
      <div class="underenheder-count">{{ underenhederCount }} underenheder</div>

      <div class="underenheder-table">
        <div class="table-header">
          <div class="header-cell">Underenhed</div>
          <div class="header-cell">Lokation</div>
        </div>
        <div class="table-body">
          <div v-for="(enhed, index) in item.underenheder" :key="index" class="table-row">
            <div class="cell">{{ enhed.navn || `Branddør ${index + 1}` }}</div>
            <div class="cell">{{ enhed.lokation || 'Ikke valgt' }}</div>
          </div>
        </div>
      </div>
    </div>

    <div class="detail-section" v-if="item.qrCode">
      <div class="detail-section-header">
        <h4>QR KODE</h4>
        <span class="detail-section-header-and-button">
          <IconPrinter class="icon-small"/>
          Tilføj til printkø
        </span>
      </div>
      <div class="qr-code-container">
        <img src='@/assets/qrcode.png?url' alt="QR Code" class="qr-code" />
      </div>
    </div>

    <div class="detail-section" v-if="item.files && item.files.length > 0">
      <div class="detail-section-header">
        <h4>FILER</h4>
        <span class="detail-section-header-and-button">
          <IconUpload class="icon-small"/>
          Upload fil
        </span>
      </div>
      <div class="files-list">
        <div v-for="(file, index) in item.files" :key="index" class="file-item">
          <span class="file-icon">
            <IconFileText/>
          </span>
          <span class="file-name">{{ file.name }}</span>
        </div>
      </div>
    </div>
</template>

<style lang="scss" scoped>
@use '@/assets/variables' as *;
@use '@/assets/icons' as *;

.detail-section {
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;

  .detail-section-header {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;

    .detail-section-header-and-button {
      padding: 8px 16px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      font-size: $body-2-font-size;
      font-weight: $body-2-font-weight-semibold;
      line-height: 24px;
    }
  }

  .location {
    margin-bottom: 24px;
  }

  :last-child {
    margin-bottom: 0;
  }
}

.description {
  margin-bottom: 20px;
  line-height: 1.5;
}

.qr-code-container {
  background-color: transparent;
  padding: 16px;
  display: flex;
  justify-content: center;
  border: 1px solid $secondary-300;
  margin-bottom: 16px;
  border-radius: 4px;

  .qr-code {
    max-width: 250px;
    height: auto;
  }
}

.files-list {
  margin-bottom: 16px;

  .file-item {
    display: flex;
    align-items: center;
    padding: 12px 0;

    .file-icon {
      color: #6B7280;
      margin-right: $spacing-small;
      display: flex;
    }

    .file-name {
      font-size: $body-2-font-size;
      font-weight: $body-2-font-weight-semibold;
    }
  }
}

.underenheder-section {
  margin-top: $spacing-large;
}

.underenheder-count {
  font-weight: $body-1-font-weight-semibold;
  font-size: 0.9375rem;
  margin-bottom: $spacing-small;
  color: $neutral-700;
}

.underenheder-table {
  border: 1px solid $neutral-200;
  border-radius: $border-radius-md;
  overflow: hidden;
  background-color: white;
}

.table-header {
  display: flex;
  background-color: #EDF2F7;
  font-weight: 500;
  border-bottom: 1px solid $neutral-200;
}

.header-cell {
  flex: 1;
  padding: $spacing-small $spacing-medium;
  color: $neutral-700;
}

.table-body {
  max-height: 300px;
  overflow-y: auto;
}

.table-row {
  display: flex;
  align-items: center;
  border-bottom: 1px solid $neutral-200;
  
  &:last-child {
    border-bottom: none;
  }
  
  &:nth-child(even) {
    background-color: #F9FAFB;
  }
}

.cell {
  flex: 1;
  padding: $spacing-small $spacing-medium;
  color: $neutral-700;
}

.section-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: $neutral-700;
  margin: 0 0 $spacing-small 0;
  text-transform: uppercase;
}
</style>
