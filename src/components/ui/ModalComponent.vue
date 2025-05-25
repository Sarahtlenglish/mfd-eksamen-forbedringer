<script setup>
import ButtonComponent from '@/components/ui/ButtonComponent.vue'

defineProps({
  show: Boolean,
  title: String,
  message: String,
  primaryButtonText: String,
  secondaryButtonText: String,
  onPrimary: Function,
  onSecondary: Function
})
</script>

<template>
  <dialog v-if="show" class="modal-dialog" open>
    <div class="modal-card">
      <div class="modal-header">
        <span class="modal-title">{{ title }}</span>
    </div>
      <p class="modal-message">{{ message }}</p>
      <div class="modal-actions">
        <ButtonComponent
          variant="tertiary"
          @click="onSecondary"
        >
          {{ secondaryButtonText }}
        </ButtonComponent>
        <ButtonComponent
          variant="primary"
          @click="onPrimary"
        >
          <template #icon>
            <slot name="primaryIcon">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24"><path stroke="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 6h18M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14z"/></svg>
            </slot>
          </template>
          {{ primaryButtonText }}
        </ButtonComponent>
      </div>
    </div>
  </dialog>
</template>

<style lang="scss" scoped>
@use '@/assets/variables' as *;

.modal-dialog {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(28, 28, 28, 0);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  border: none;
  padding: 0;
}

.modal-card {
  background: $neutral-200;
  border-radius: $border-radius-xl;
  padding: 32px;
  border: 1px solid $neutral-300;
  display: flex;
  flex-direction: column;
  align-items: stretch;
}

.modal-title {
  font-family: $font-family-base;
  font-size: $body-1-font-size;
  font-weight: $body-1-font-weight-semibold;
  line-height: $body-1-line-height;
  color: $neutral-900;
  display: block;
  margin-bottom: 16px;
}

.modal-message {
  font-size: $body-2-font-size;
  color: $neutral-900;
  margin-bottom: 34px;
  white-space: pre-line;
}

.modal-actions {
  display: flex;
  gap: 1.5rem;
  width: 100%;
  justify-content: flex-end;
  margin-top: 0.5rem;
}

:deep(.button.variant-primary) {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: $body-1-font-weight-semibold;
}

:deep(.button.variant-tertiary) {
  font-weight: $body-1-font-weight-semibold;
}
</style>
