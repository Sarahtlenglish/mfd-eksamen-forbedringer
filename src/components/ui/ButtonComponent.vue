<script setup>
import { computed, useSlots } from 'vue'

defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: value => ['primary', 'secondary', 'tertiary'].includes(value)
  },
  size: {
    type: String,
    default: 'medium',
    validator: value => ['small', 'medium'].includes(value)
  },
  type: {
    type: String,
    default: 'button',
    validator: value => ['button', 'submit', 'reset'].includes(value)
  },
  disabled: {
    type: Boolean,
    default: false
  },
  iconAfter: {
    type: Boolean,
    default: false
  },
  fullWidth: {
    type: Boolean,
    default: false
  },
  noPadding: {
    type: Boolean,
    default: false
  },
  isDelete: {
    type: Boolean,
    default: false
  }
})

const slots = useSlots()

const hasIcon = computed(() => {
  return !!slots.icon
})

defineEmits(['click'])
</script>

<template>
	<button
		class="button"
		:class="[
			`variant-${variant}`,
			(variant === 'primary' || variant === 'secondary' || variant === 'tertiary') ? `size-${size}` : 'size-medium',
			{
				'has-icon': hasIcon,
				'icon-after': iconAfter,
				'disabled': disabled === true,
				'full-width': fullWidth,
				'no-padding': noPadding && variant === 'tertiary',
				'is-delete': isDelete && variant === 'tertiary'
			}
		]"
		:disabled="disabled === true"
		:type="type"
		@click="$emit('click')"
	>
		<span v-if="hasIcon && !iconAfter" class="button-icon">
			<slot name="icon"></slot>
		</span>
		<span class="button-text"><slot></slot></span>
		<span v-if="hasIcon && iconAfter" class="button-icon">
			<slot name="icon"></slot>
		</span>
	</button>
</template>

<<<<<<< Updated upstream
=======
<script setup>
import { computed, useSlots } from 'vue'

defineProps({
  // Variant type
  variant: {
    type: String,
    default: 'primary',
    validator: value => ['primary', 'secondary', 'tertiary'].includes(value)
  },

  size: {
    type: String,
    default: 'medium',
    validator: value => ['small', 'medium'].includes(value)
  },
  // Button type
  type: {
    type: String,
    default: 'button',
    validator: value => ['button', 'submit', 'reset'].includes(value)
  },
  // Disabled state
  disabled: {
    type: Boolean,
    default: false
  },
  // Icon placement
  iconAfter: {
    type: Boolean,
    default: false
  },
  // Full width button
  fullWidth: {
    type: Boolean,
    default: false
  },
  // No padding (only for tertiary variant)
  noPadding: {
    type: Boolean,
    default: false
  },
  // Delete style (only for tertiary variant)
  isDelete: {
    type: Boolean,
    default: false
  }
})

// Access slots to check if icon exists
const slots = useSlots()

// Computed property to check if icon slot is provided
const hasIcon = computed(() => {
  return !!slots.icon
})

defineEmits(['click'])
</script>

>>>>>>> Stashed changes
<style lang="scss" scoped>
@use '@/assets/variables' as *;
@use '@/assets/icons' as *;

.button {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	gap: $spacing-small;
	border-radius: $border-radius-sm;
	font-family: $font-family-base;
	font-weight: $body-2-font-weight-semibold;
	cursor: pointer;
	transition: $transition-base;
	border: 1px solid transparent;

	&:focus {
		outline: none;
	}

	&.size-small {
		padding: $spacing-small $spacing-medium;
		font-size: $body-2-font-size;
		line-height: $body-2-line-height;
	}

	&.size-medium {
		padding: $spacing-small $spacing-medium;
		font-size: $body-1-font-size;
		line-height: $body-1-line-height;
	}

	&.full-width {
		width: 100%;
	}

	&.no-padding {
		padding: 0;
	}

	&.disabled {
		cursor: not-allowed;
	}

	.button-icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: $icon-small;
		height: $icon-small;
	}

	&.size-small .button-icon {
		width: $icon-x-small;
		height: $icon-x-small;
	}

	&.variant-primary {
		background-color: $primary-500;
		color: $neutral-100;

		&:hover:not(.disabled),
		&:focus:not(.disabled) {
			background-color: $primary-700;
		}

		&:active:not(.disabled) {
			background-color: $primary-800;
		}

		&.disabled {
			background-color: $primary-300;
			color: $neutral-100;
			opacity: $opacity-40;
		}
	}

	&.variant-secondary {
		background-color: transparent;
		color: $neutral-900;
		border-color: $primary-500;

		&:hover:not(.disabled),
		&:focus:not(.disabled) {
			background-color: $primary-300;
		}

		&:active:not(.disabled) {
			background-color: $primary-500;
			border-color: $primary-500;
		}

		&.disabled {
			color: $primary-300;
			border-color: $primary-300;
			opacity: $opacity-40;
		}
	}

	&.variant-tertiary {
		background-color: transparent;
		color: $primary-800;
		border: none;
		&:hover:not(.disabled),
		&:focus:not(.disabled) {
			color: $primary-600;
		}

		&:active:not(.disabled) {
			color: $primary-900;
		}

		&.disabled {
			color: $primary-300;
			opacity: $opacity-40;
		}

		&.is-delete {
			color: $error-base;

			&:hover:not(.disabled),
			&:focus:not(.disabled) {
				color: $error-600;
			}

			&:active:not(.disabled) {
				color: $error-success;
			}

			&.disabled {
				color: $error-300;
				opacity: $opacity-40;
			}
		}
	}
}
</style>
