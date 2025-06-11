<script setup>
import { computed } from 'vue'
import { IconAlertCircle, IconAlertTriangle, IconCircleCheck } from '@tabler/icons-vue'

const props = defineProps({
  variant: {
    type: String,
    default: 'warning',
    validator: value => ['warning', 'error', 'success'].includes(value)
  },
  text: {
    type: String,
    default: 'Dette skema vil blive oprettet uden en checkliste.'
  },
  link: {
    type: String,
    default: ''
  },
  linkText: {
    type: String,
    default: ''
  },
  linkBreak: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['click:link'])

const getIconComponent = computed(() => {
  switch (props.variant) {
    case 'warning':
      return IconAlertCircle
    case 'error':
      return IconAlertTriangle
    case 'success':
      return IconCircleCheck
    default:
      return IconAlertCircle
  }
})

const handleLinkClick = (event) => {
  event.preventDefault()
  emit('click:link')
}
</script>

<template>
	<div
		class="banner"
		:class="[
			`variant-${variant}`,
			{ 'has-link': !!link },
			{ 'link-break': linkBreak }
		]"
	>
		<div class="banner-icon">
			<component :is="getIconComponent" />
		</div>
		<div class="banner-content">
			<template v-if="!linkBreak">
				<span class="banner-text">{{ text }}</span>
				<a
					v-if="link"
					class="banner-link"
					:href="link"
					@click="handleLinkClick"
				>
					{{ linkText || 'Opsæt Checkliste' }}
				</a>
			</template>
			<template v-else>
				<div class="banner-text">{{ text }}</div>
				<a
					v-if="link"
					class="banner-link"
					:href="link"
					@click="handleLinkClick"
				>
					{{ linkText || 'Opsæt Checkliste' }}
				</a>
			</template>

			<!-- Ny slot for custom actions -->
			<slot name="actions"></slot>
		</div>
	</div>
</template>

<style lang="scss" scoped>
@use '@/assets/variables' as *;
@use '@/assets/icons' as *;

.banner {
	display: flex;
	padding: $spacing-medium-plus;
	gap: $spacing-medium;
	border-radius: $border-radius-lg;
	width: auto;
	min-width: fit-content;
	max-width: 100%;
	border-width: 1px;
	border-style: solid;
	box-sizing: border-box;

	&.variant-warning {
		background-color: $warning-100;
		border-color: $warning-300;
	}

	&.variant-error {
		background-color: $error-100;
		border-color: $error-300;
	}

	&.variant-success {
		background-color: $success-100;
		border-color: $success-300;
	}
}

.banner-icon {
	display: flex;
	align-items: flex-start;
	justify-content: center;
	flex-shrink: 0;
	margin-top: 2px;

	svg {
		width: $icon-medium;
		height: $icon-medium;
		stroke-width: $icon-stroke-width;
	}

	.variant-warning & {
		color: $warning-base;
	}

	.variant-error & {
		color: $error-base;
	}

	.variant-success & {
		color: $success-base;
	}
}

.banner-content {
	flex: 1;
}

.banner-text {
	font-family: $font-family-base;
	font-size: $body-1-font-size;
	line-height: $body-1-line-height;
	font-weight: $body-1-font-weight-regular;
	color: $neutral-900;
	margin-bottom: $spacing-xs;
}

.banner-link {
	font-family: $font-family-base;
	font-size: $body-1-font-size;
	font-weight: $body-1-font-weight-regular;
	line-height: $body-1-line-height;
	text-decoration: underline;
	text-decoration-thickness: from-font;
	text-underline-offset: auto;
	color: $neutral-600;
	cursor: pointer;
	transition: $transition-base;

	&:hover {
		color: $secondary-500;
	}

	&:active {
		color: $secondary-700;
	}
}

.banner:not(.link-break) .banner-content {
	display: flex;
	align-items: center;
	gap: $spacing-xs;
}

.banner.link-break .banner-content {
	display: flex;
	flex-direction: column;
}

/* Når der er actions, lav altid kolonne layout */
.banner-content:has(.banner-actions) {
	display: flex !important;
	flex-direction: column !important;
	align-items: flex-start !important;
}

/* Nye styles for actions slot */
.banner-content :deep(.banner-actions) {
	display: flex;
	flex-direction: row;
	gap: $spacing-xlarge;
	margin-top: $spacing-medium;
	flex-wrap: wrap;
	width: 100%;
	justify-content: flex-start;
}

.banner-content :deep(.banner-link-action) {
	background: none;
	border: none;
	color: $neutral-700;
	text-decoration: underline;
	cursor: pointer;
	padding: 0;
	font-size: $body-2-font-size;
	font-family: inherit;
	text-align: left;
	transition: $transition-base;
	flex: 0 0 auto;

	&:hover {
		color: $neutral-900;
		text-decoration: none;
	}

	&.primary {
		font-weight: $body-1-font-weight-semibold;
		color: $neutral-800;

		&:hover {
			color: $neutral-900;
		}
	}
}
</style>
