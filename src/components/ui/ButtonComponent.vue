<template>
	<button
		class="button"
		:class="[
			`variant-${variant}`,
			variant === 'primary' ? `size-${size}` : 'size-medium',
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

<script setup>
import { computed, useSlots } from 'vue'

defineProps({
	// Variant type
	variant: {
		type: String,
		default: 'primary',
		validator: value => ['primary', 'secondary', 'tertiary'].includes(value)
	},
	// Button size (only affects primary variant)
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

<style lang="scss" scoped>
@use '@/assets/variables' as *;
@use '@/assets/icons' as *;

// Base button styles
.button {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	gap: 0.5rem;
	border-radius: $border-radius-sm;
	font-family: $font-family-base;
	font-weight: $body-2-font-weight-semibold;
	cursor: pointer;
	transition: $transition-base;
	border: 1px solid transparent;

	// Focus state
	&:focus {
		outline: none;
	}

	// Size variants
	&.size-small {
		padding: 0.5rem 1rem;
		font-size: $body-2-font-size;
		line-height: 1.5rem;
	}

	&.size-medium {
		padding: 0.5rem 1rem;
		font-size: $body-1-font-size;
		line-height: 1.75rem;
	}

	// Full width modifier
	&.full-width {
		width: 100%;
	}

	// No padding modifier (only for tertiary)
	&.no-padding {
		padding: 0;
	}

	// Disabled state common styling
	&.disabled {
		cursor: not-allowed;
	}

	// Icon styling
	.button-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		line-height: 0;
	}

	.button-icon svg,
	.button-icon .button-icon-svg {
		fill: none;
		stroke-width: 1.5;
		color: currentColor;
		width: 1.25rem;
		height: 1.25rem;
		min-width: 1.25rem;
		min-height: 1.25rem;
	}

	&.size-small .button-icon svg,
	&.size-small .button-icon .button-icon-svg {
		width: 1rem;
		height: 1rem;
		min-width: 1rem;
		min-height: 1rem;
	}

	// PRIMARY VARIANT
	&.variant-primary {
		background-color: $primary-500;
		color: $neutral-100;

		// Hover and Focus states
		&:hover:not(.disabled),
		&:focus:not(.disabled) {
			background-color: $primary-700;
		}

		// Active/Pressed state
		&:active:not(.disabled) {
			background-color: $primary-800;
		}

		// Disabled state
		&.disabled {
			background-color: $primary-300;
			color: $neutral-100;
			opacity: $opacity-40;
		}
	}

	// SECONDARY VARIANT
	&.variant-secondary {
		background-color: transparent;
		color: $neutral-900;
		border-color: $primary-500;

		// Hover and Focus states
		&:hover:not(.disabled),
		&:focus:not(.disabled) {
			background-color: $primary-300;
		}

		// Active/Pressed state
		&:active:not(.disabled) {
			background-color: $primary-500;
			border-color: $primary-500;
		}

		// Disabled state
		&.disabled {
			color: $primary-300;
			border-color: $primary-300;
			opacity: $opacity-40;
		}
	}

	// TERTIARY VARIANT
	&.variant-tertiary {
		background-color: transparent;
		color: $primary-800;
		border: none;
		// Hover and Focus states
		&:hover:not(.disabled),
		&:focus:not(.disabled) {
			color: $primary-600;
		}

		// Active/Pressed state
		&:active:not(.disabled) {
			color: $primary-900;
		}

		// Disabled state
		&.disabled {
			color: $primary-300;
			opacity: $opacity-40;
		}

		// DELETE STYLE MODIFIER
		&.is-delete {
			color: $error-base;

			// Hover and Focus states
			&:hover:not(.disabled),
			&:focus:not(.disabled) {
				color: $error-600;
			}

			// Active/Pressed state
			&:active:not(.disabled) {
				color: $error-success;
			}

			// Disabled state
			&.disabled {
				color: $error-300;
				opacity: $opacity-40;
			}
		}
	}
}
</style>
