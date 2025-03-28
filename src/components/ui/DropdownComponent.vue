<template>
	<div
		class="dropdown"
		:class="{
			'has-error': hasError,
			'disabled': disabled === true,
			'opened': isOpen
		}"
	>
		<label v-if="label" :for="dropdownId" class="dropdown-label">
			{{ label }} <span v-if="required" class="required-mark">*</span>
		</label>
		<div v-if="description" class="dropdown-description">{{ description }}</div>

		<div class="dropdown-wrapper">
			<button
				:id="dropdownId"
				type="button"
				class="dropdown-toggle"
				:disabled="disabled === true"
				@click="toggleDropdown"
				@blur="handleBlur"
				@keydown.esc="closeDropdown"
				@keydown.down.prevent="openDropdown"
				@keydown.up.prevent="openDropdown"
				ref="toggleButton"
			>
				<span class="dropdown-selected-text" :class="{ 'placeholder': !modelValue }">
					{{ displayValue }}
				</span>
				<component :is="isOpen ? IconChevronUp : IconChevronDown" class="dropdown-icon" />
			</button>

			<div v-if="isOpen" class="dropdown-menu">
				<button
					v-for="(option, index) in options"
					:key="index"
					type="button"
					class="dropdown-option"
					@click="selectOption(option)"
					@keydown.enter.prevent="selectOption(option)"
					@keydown.down.prevent="navigateOptions('down')"
					@keydown.up.prevent="navigateOptions('up')"
					ref="optionElements"
				>
					{{ option }}
				</button>
			</div>
		</div>

		<div v-if="hasError && errorMessage" class="error-message">
			{{ errorMessage }}
		</div>
	</div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { IconChevronDown, IconChevronUp } from '@tabler/icons-vue'

const props = defineProps({
  // Input Value
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
    default: 'Default'
  },
  description: {
    type: String,
    default: ''
  },
  errorMessage: {
    type: String,
    default: 'Error message'
  },
  options: {
    type: Array,
    default: () => []
  },

  // States
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

  // ID
  dropdownId: {
    type: String,
    default: () => `dropdown-${Math.random().toString(36).substr(2, 9)}`
  }
})

const emit = defineEmits(['update:modelValue', 'change', 'focus', 'blur'])

// Internal state
const isOpen = ref(false)
const toggleButton = ref(null)
const optionElements = ref([])
const activeOptionIndex = ref(-1)

// Handle display value (selected option or placeholder)
const displayValue = computed(() => {
  return props.modelValue || props.placeholder
})

// Toggle dropdown visibility
const toggleDropdown = () => {
  if (props.disabled) return
  isOpen.value = !isOpen.value

  if (isOpen.value) {
    emit('focus')

    // Find and activate the currently selected option
    const selectedIndex = props.options.findIndex(option => option === props.modelValue)
    activeOptionIndex.value = selectedIndex >= 0 ? selectedIndex : 0

    // Focus on the active option when dropdown opens
    nextTick(() => {
      if (optionElements.value[activeOptionIndex.value]) {
        optionElements.value[activeOptionIndex.value].focus()
      }
    })
  } else {
    // When dropdown is closed via toggle, explicitly remove focus
    nextTick(() => {
      document.activeElement.blur()
    })
  }
}

// Handle option selection
const selectOption = (option) => {
  if (props.disabled) return
  emit('update:modelValue', option)
  emit('change', option)
  closeDropdown()
}

// Close the dropdown
const closeDropdown = () => {
  isOpen.value = false
  activeOptionIndex.value = -1
  // Reset UI state
  nextTick(() => {
    document.activeElement.blur()
  })
}

// Open the dropdown
const openDropdown = () => {
  if (props.disabled || isOpen.value) return
  isOpen.value = true
  emit('focus')

  // Focus on first option when opening with keyboard
  nextTick(() => {
    if (optionElements.value[0]) {
      activeOptionIndex.value = 0
      optionElements.value[0].focus()
    }
  })
}

// Keyboard navigation between options
const navigateOptions = (direction) => {
  if (!isOpen.value || props.options.length === 0) return

  let newIndex
  if (direction === 'down') {
    newIndex = activeOptionIndex.value < props.options.length - 1 ? activeOptionIndex.value + 1 : 0
  } else {
    newIndex = activeOptionIndex.value > 0 ? activeOptionIndex.value - 1 : props.options.length - 1
  }

  activeOptionIndex.value = newIndex

  nextTick(() => {
    if (optionElements.value[newIndex]) {
      optionElements.value[newIndex].focus()
    }
  })
}

// Close dropdown when clicking outside
const handleOutsideClick = (event) => {
  if (isOpen.value) {
    const dropdownElement = toggleButton.value?.closest('.dropdown')
    if (!dropdownElement || !dropdownElement.contains(event.target)) {
      closeDropdown()
    }
  }
}

// Handle blur events
const handleBlur = (event) => {
  // Only emit blur if focus is moving outside the dropdown
  const dropdownElement = toggleButton.value?.closest('.dropdown')
  if (dropdownElement && !dropdownElement.contains(event.relatedTarget)) {
    emit('blur')
  }
}

// Add click outside listener
onMounted(() => {
  document.addEventListener('click', handleOutsideClick)
})

// Clean up event listener
onBeforeUnmount(() => {
  document.removeEventListener('click', handleOutsideClick)
})
</script>

<style lang="scss" scoped>
@use '@/assets/variables' as *;
@use '@/assets/form-components' as *;

.dropdown {
	@extend .form-field;

	&.disabled {
		@extend .form-disabled;
	}

	&.has-error {
		@extend .form-error;
	}
}

.dropdown-label {
	@extend .form-label;
}

.dropdown-description {
	@extend .form-description;
}

.dropdown-wrapper {
	position: relative;
}

.dropdown-toggle {
	display: flex;
	align-items: center;
	justify-content: space-between;
	width: 100%;
	height: 2.5rem;
	padding: 0.75rem 1rem;
	font-size: $body-2-font-size;
	color: $neutral-900;
	background-color: white;
	border: 1px solid $secondary-300;
	border-radius: $border-radius-lg;
	cursor: pointer;
	transition: $transition-base;
	text-align: left;
	box-shadow: 0 0.125rem 0.125rem 0 rgba(33, 37, 41, 0.06);

	// Hover/Focus State
	&:hover:not(:disabled),
	&:focus:not(:disabled) {
		outline: none;
		background-color: $secondary-50;
	}

	// Press State
	&:active:not(:disabled) {
		border-color: $secondary-500;
		background-color: $secondary-100;
	}

	// Disabled State
	&:disabled {
		background-color: $neutral-100;
		color: $neutral-500;
		border-color: $neutral-300;
		opacity: $opacity-40;
		cursor: not-allowed;
	}
}

.dropdown-selected-text {
	flex: 1;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.placeholder {
	color: $neutral-500;
}

.dropdown-icon {
	width: 1.25rem;
	height: 1.25rem;
	stroke-width: 1.5;
	margin-left: $spacing-xs;
	color: $neutral-600;
	transition: transform 0.2s ease;
}

// Removed active styling, keep only dropdown.opened styling for the icon
.dropdown.opened .dropdown-icon {
	color: $secondary-500;
}

.dropdown-menu {
	position: absolute;
	top: calc(100% + 0.25rem);
	left: 0;
	width: 100%;
	max-height: 12.5rem;
	overflow-y: auto;
	background-color: white;
	border: 1px solid $secondary-300;
	border-radius: $border-radius-lg;
	box-shadow: 0 0.125rem 0.125rem 0 rgba(33, 37, 41, 0.06);
	z-index: 10;
}

.dropdown-option {
	display: block;
	width: 100%;
	padding: 0.75rem 1rem;
	text-align: left;
	border: none;
	background: none;
	font-size: $body-2-font-size;
	color: $neutral-900;
	cursor: pointer;
	transition: $transition-base;

	&:hover {
		background-color: $secondary-50;
	}

	&:focus {
		outline: none;
		background-color: $secondary-100;
	}
}
</style>
