<template>
	<button
		class="filter-button"
		:class="{
			'active': active,
			'disabled': disabled,
			'full-width': fullWidth
		}"
		:disabled="disabled"
		@click="$emit('click')"
	>
		<span class="filter-button-text">{{ text }}</span>
		<span class="filter-button-edit-icon">
			<IconPencil v-if="!disabled" />
			<IconPencil v-else class="disabled-icon" />
		</span>
	</button>
</template>

<script setup>
import { IconPencil } from '@tabler/icons-vue'

defineProps({
	// Button text
	text: {
		type: String,
		default: 'Default'
	},
	// Button state
	active: {
		type: Boolean,
		default: false
	},
	disabled: {
		type: Boolean,
		default: false
	},
	// Full width button
	fullWidth: {
		type: Boolean,
		default: false
	}
})

defineEmits(['click'])
</script>

<style lang="scss" scoped>
@use '@/assets/variables' as *;

.filter-button {
	display: flex;
	align-items: center;
	justify-content: space-between;
	min-width: 50%;
	height: 48px;
	padding: 12px 16px;
	background-color: $neutral-100; /* #FFFFFF */
	border: 1px solid $secondary-300; /* #A4CBE0 */
	border-radius: 8px;
	cursor: pointer;
	transition: $transition-base;
	text-align: left;
	flex-shrink: 0;

	&:hover:not(.disabled) {
		background-color: $secondary-100;
		border-color: $secondary-200;
		box-shadow: $shadow-2;
	}

	&:active:not(.disabled) {
		background-color: $secondary-200; /* #C0DBEA */
		border-color: $secondary-300; /* #A4CBE0 */
		box-shadow: $shadow-2;
	}

	&.active {
		background-color: $secondary-200; /* #C0DBEA */
		border-color: $secondary-300; /* #A4CBE0 */
		box-shadow: $shadow-2;
	}

	&.disabled {
		background-color: $neutral-100;
		color: $neutral-500;
		opacity: $opacity-40;
		cursor: not-allowed;
	}

	&.full-width {
		width: 100%;
	}
}

.filter-button-text {
	font-size: $body-2-font-size;
	font-weight: $body-2-font-weight-regular;
	color: inherit;
}

.filter-button-edit-icon {
	display: flex;
	align-items: center;
	justify-content: center;

	svg {
		width: 1.25rem;
		height: 1.25rem;
		stroke-width: 1.5;
		color: $neutral-900;
	}

	.disabled-icon {
		color: $neutral-500;
	}
}
</style>
