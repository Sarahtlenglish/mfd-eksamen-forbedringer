<template>
	<div
		class="input-field"
		:class="{
			'has-error': hasError,
			'has-icon-left': type === 'search',
			'has-icon-right': type === 'password',
			'disabled': disabled === true
		}"
	>
		<label v-if="label" :for="inputId" class="input-label">
			{{ label }} <span v-if="required" class="required-mark">*</span>
		</label>
		<div v-if="description" class="input-description">{{ description }}</div>

		<div class="input-wrapper">
			<!-- Automatic search icon if type is search -->
			<div v-if="type === 'search'" class="input-icon-left">
				<IconSearch />
			</div>

			<input
				:id="inputId"
				:type="inputType"
				:value="modelValue"
				:placeholder="placeholder"
				:disabled="disabled === true"
				:required="required"
				:autocomplete="autocomplete"
				class="input-control"
				@input="updateValue"
				@focus="focused = true"
				@blur="handleBlur"
				ref="inputRef"
			/>

			<!-- Show password toggle icon automatically for password type -->
			<div v-if="type === 'password' && disabled !== true" class="input-icon-right password-toggle" @click="togglePasswordVisibility">
				<component :is="passwordVisible ? IconEye : IconEyeOff" />
			</div>
		</div>

		<div v-if="hasError && errorMessage" class="error-message">
			{{ errorMessage }}
		</div>
	</div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { IconEye, IconEyeOff, IconSearch } from '@tabler/icons-vue'

const props = defineProps({
  // Content
  modelValue: {
    type: [String, Number],
    default: ''
  },
  label: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: 'Placeholder'
  },
  description: {
    type: String,
    default: ''
  },
  errorMessage: {
    type: String,
    default: 'Error message'
  },

  // State
  hasError: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  required: {
    type: Boolean,
    default: false
  },

  // Type
  type: {
    type: String,
    default: 'text',
    validator: value => ['text', 'email', 'password', 'number', 'tel', 'search'].includes(value)
  },
  autocomplete: {
    type: String,
    default: 'off'
  },

  // ID (for label association)
  inputId: {
    type: String,
    default: () => `input-${Math.random().toString(36).substr(2, 9)}`
  }
})

const emit = defineEmits(['update:modelValue', 'focus', 'blur', 'input'])

// Internal state
const focused = ref(false)
const inputRef = ref(null)
const passwordVisible = ref(false)
const typing = ref(false) // Track typing state

// Computed property for input type (for password visibility)
const inputType = computed(() => {
  if (props.type === 'password') {
    return passwordVisible.value ? 'text' : 'password'
  }
  return props.type
})

// Methods
const updateValue = (event) => {
  emit('update:modelValue', event.target.value)
  emit('input', event)
  typing.value = event.target.value.length > 0
}

const handleBlur = (event) => {
  focused.value = false
  emit('blur', event)
}

const togglePasswordVisibility = () => {
  passwordVisible.value = !passwordVisible.value
}

onMounted(() => {
  if (inputRef.value && props.autofocus) {
    inputRef.value.focus()
  }
})

// Expose methods to parent component
defineExpose({
  focus: () => {
    inputRef.value?.focus()
    focused.value = true
  },
  blur: () => {
    inputRef.value?.blur()
    focused.value = false
  }
})
</script>

<style lang="scss" scoped>
@use '@/assets/variables' as *;
@use '@/assets/form-components' as *;
@use '@/assets/icons' as *;

.input-field {
	@extend .form-field;

	&.disabled {
		@extend .form-disabled;
	}

	&.has-error {
		@extend .form-error;
	}
}

.input-label {
	@extend .form-label;
}

.input-description {
	@extend .form-description;
}

.input-wrapper {
	position: relative;
	display: flex;
	align-items: center;
}

.input-control {
	@extend .form-control;
	padding: $spacing-xs $spacing-small;
	height: 2.5rem;
	border-radius: $border-radius-md;

	&:disabled {
		background-color: $neutral-100;
		color: $neutral-500;
		cursor: not-allowed;
	}
}

.input-icon-left, .input-icon-right, .password-toggle {
	position: absolute;
	display: flex;
	align-items: center;
	justify-content: center;
	color: $neutral-600;
	cursor: pointer;
	z-index: 2;

	svg {
		width: $icon-small;
		height: $icon-small;
		stroke-width: $icon-stroke-width;
	}

	&:hover {
		color: $neutral-900;
	}
}

.input-icon-left {
	left: $spacing-small;
}

.input-icon-right, .password-toggle {
	right: $spacing-small;
}

.has-icon-left .input-control {
	padding-left: calc($spacing-medium + $icon-small);
}

.has-icon-right .input-control {
	padding-right: calc($spacing-medium + $icon-small);
}

.password-toggle {
	cursor: pointer;
}

// Specific styling for error state on icons
.has-error {
	.input-icon-left, .input-icon-right, .password-toggle {
		color: $error-base;

		&:hover {
			color: $error-600;
		}
	}
}
</style>
