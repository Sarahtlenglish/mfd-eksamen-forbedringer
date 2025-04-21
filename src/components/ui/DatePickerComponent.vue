<script setup>
import Datepicker from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'

defineProps({
  modelValue: {
    type: [Date, String, null],
    default: null
  },
  placeholder: {
    type: String,
    default: 'Vælg dato'
  },
  label: {
    type: String,
    default: ''
  },
  required: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue'])

// Datepicker format handler
const formatDate = (date) => {
  if (!date) return ''
  const d = new Date(date)
  // Danske navne for måneder
  const months = ['januar', 'februar', 'marts', 'april', 'maj', 'juni', 'juli', 'august', 'september', 'oktober', 'november', 'december']
  // Formater til dansk format: "d. 17. marts 2025"
  return `Fra d. ${d.getDate()}. ${months[d.getMonth()]} ${d.getFullYear()}`
}
</script>

<template>
  <div>
    <label v-if="label" class="input-label">
      {{ label }} <span v-if="required" class="required-mark">*</span>
    </label>
    <div class="custom-datepicker-wrapper">
      <Datepicker
        :model-value="modelValue"
        @update:model-value="emit('update:modelValue', $event)"
        :enable-time-picker="false"
        :placeholder="placeholder"
        :auto-apply="true"
        locale="da"
        :format="formatDate"
        :text-input="false"
        position="bottom-start"
        :closeOnScroll="false"
        menuClassName="datepicker-dropdown"
      />
      <div class="datepicker-icon">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="1.5" fill="none">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
        </svg>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '@/assets/variables' as *;

.custom-datepicker-wrapper {
  position: relative;
  width: 100%;
}

.datepicker-icon {
  position: absolute;
  top: 50%;
  right: 12px;
  transform: translateY(-50%);
  z-index: 1;
  pointer-events: none;
  color: $neutral-600;
}

:deep(.dp__main) {
  width: 100%;
}

:deep(.dp__input) {
  width: 100% !important;
  height: 2.5rem !important;
  padding: $spacing-xs $spacing-small !important;
  font-size: 1rem !important;
  border: 1px solid $neutral-300 !important;
  border-radius: $border-radius-md !important;
  color: $neutral-900 !important;
}

:deep(.dp__input_icon) {
  display: none !important;
}

:deep(.dp__theme_light) {
  --dp-primary-color: #{$secondary-500};
  --dp-border-color: #{$neutral-300};
  --dp-border-radius: #{$border-radius-md};
  --dp-background-color: #fff;
}

.input-label {
  display: block;
  font-size: 1rem;
  font-weight: 600;
  color: #383838;
  margin-bottom: 2px;
}

.required-mark {
  color: $error-base;
}

:deep(.datepicker-dropdown) {
  margin-top: 2px !important;
  left: 0 !important;
  width: 100% !important;
  max-width: 320px !important;
  z-index: 100 !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
  border: 1px solid $neutral-300 !important;
  border-radius: $border-radius-md !important;
}
</style>
