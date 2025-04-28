<script setup>
const props = defineProps({
  // Form data binding
  formData: {
    type: Object,
    required: true
  },
  // Context for the form (used by parent component to determine behavior)
  context: {
    type: String,
    required: true
  },
  // Whether the form is loading
  loading: {
    type: Boolean,
    default: false
  }
})

// Events that can be emitted by all forms
const emit = defineEmits(['update:formData', 'complete', 'cancel'])

// Helper function to update form data (for two-way binding)
const updateFormValue = (key, value) => {
  emit('update:formData', { ...props.formData, [key]: value })
}

// Expose the updateFormValue method to the parent component
defineExpose({
  updateFormValue
})
</script>

<template>
  <div class="form-container" :class="[`form-${context}`]">
    <!-- Header slot -->
    <div class="form-header">
      <slot name="header"></slot>
    </div>

    <!-- Content slot -->
    <div class="form-content">
      <slot :updateFormValue="updateFormValue"></slot>
    </div>

    <!-- Footer slot -->
    <div class="form-footer">
      <slot name="footer" :updateFormValue="updateFormValue"></slot>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '@/assets/variables' as *;

.form-container {
  background-color: #F7F7F7;
  border-radius: 8px;
  border: 1px solid #D1D3D4;
  display: flex;
  flex-direction: column;
  width: 100%;
  box-sizing: border-box;
  height: 100%;
  min-height: 823px;

  .form-header {
    padding: $spacing-medium $spacing-medium-plus;
  }

  .form-content {
    flex: 1;
    padding: $spacing-medium $spacing-medium-plus;
    overflow-y: auto;
    min-height: 0;
  }

  .form-footer {
    padding: $spacing-medium $spacing-medium-plus;
    border-top: 1px solid $neutral-300;
    margin-top: auto;
  }
}
</style>
