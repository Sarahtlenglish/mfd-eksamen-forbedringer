<!-- EnhederDetailContent.vue -->
<script setup>
import { IconPrinter, IconUpload, IconFileText } from '@tabler/icons-vue'
import ButtonComponent from '@/components/ui/ButtonComponent.vue'

const props = defineProps({
  item: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['toggle-history'])
</script>

<template>
    <div class="detail-section">
      <div class="location body-1-semibold">{{ item.location }}</div>

      <p v-if="item.description" class="description">
        {{ item.description }}
      </p>

      <div class="action-buttons">
        <ButtonComponent
          size="small"
          variant="secondary"
          @click="emit('toggle-history')"
        >
          Se historik
        </ButtonComponent>
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
</style>
