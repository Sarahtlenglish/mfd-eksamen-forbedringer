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
			<!-- Automatisk search ikon hvis typen er search -->
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

			<!-- Vis password toggle ikon automatisk ved password type -->
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
	// Indhold
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

	// Tilstand
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

// Interni tilstand
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

// Metoder
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

// Eksponerer metoder til forældrekomponenten
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

.input-field {
	display: flex;
	flex-direction: column;
	margin-bottom: $spacing-medium;
	width: 100%;
	text-align: left;
}

.input-label {
	font-size: $body-2-font-size;
	font-weight: $body-2-font-weight-semibold;
	color: $neutral-700;
	margin-bottom: $spacing-2xs;
	text-align: left;

	.required-mark {
		color: $error-base;
	}
}

.input-description {
	font-size: $body-3-font-size;
	color: $neutral-600;
	margin-bottom: $spacing-2xs;
	text-align: left;
}

.input-wrapper {
	position: relative;
	display: flex;
	align-items: center;
}

.input-control {
	width: 100%;
	padding: $spacing-xs $spacing-small;
	height: 2.5rem;
	font-size: $body-2-font-size;
	color: $neutral-900;
	background-color: white;
	border: 1px solid $neutral-300;
	border-radius: $border-radius-md;
	transition: $transition-base;

	&::placeholder {
		color: $neutral-500;
	}

	&:focus {
		outline: none;
		border-color: $primary-500;
		box-shadow: 0 0 0 1px $primary-500;
	}

	&:focus-visible {
		/* Accessibility focus styles - tilføj blå outline */
		outline: 2px solid $secondary-500;
		outline-offset: 1px;
	}

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
		width: 1.25rem;
		height: 1.25rem;
		stroke-width: 1.5;
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
	padding-left: 2.5rem;
}

.has-icon-right .input-control {
	padding-right: 2.5rem;
}

.password-toggle {
	cursor: pointer;
}

.has-error {
	.input-label, .input-description {
		color: $error-base;
	}

	.input-control {
		border-color: $error-base;

		&:focus {
			border-color: $error-base;
			box-shadow: 0 0 0 1px $error-base;
		}
	}

	.input-icon-left, .input-icon-right, .password-toggle {
		color: $error-base;

		&:hover {
			color: $error-600;
		}
	}
}

.error-message {
	font-size: $body-3-font-size;
	color: $error-base;
	margin-top: $spacing-2xs;
}
</style>
