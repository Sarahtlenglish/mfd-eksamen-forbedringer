<template>
	<div class="component-view">
		<header class="main-header">
			<h1>Component Library</h1>
			<nav class="component-nav">
					<button
					v-for="tab in tabs"
					:key="tab.value"
						@click="activeTab = tab.value"
					:class="['nav-btn', { active: activeTab === tab.value }]">
						{{ tab.label }}
					</button>
		</nav>
		</header>

		<!-- Component Container -->
		<div class="component-container">
			<!-- Component Info Section -->
			<div class="component-info">
				<h2>{{ getComponentTitle() }}</h2>
				<p v-if="getComponentDescription()">{{ getComponentDescription() }}</p>
			</div>

			<!-- If the component tab has content -->
			<div v-if="hasComponentContent()" class="component-playground">
				<!-- Preview Section -->
					<div class="component-preview">
					<div class="preview-container">
						<h3 class="preview-heading">Preview</h3>

						<!-- Button Component Preview -->
						<div v-if="activeTab === 'buttons'" class="button-preview-container">
						<ButtonComponent
							:variant="selectedVariant"
							:size="selectedSize"
								:fullWidth="isFullWidth"
							:disabled="isDisabled"
								:noPadding="noPadding"
								:isDelete="isDelete">
							<template v-if="hasIcon" #icon>
									<component
										:is="selectedIcon.component"
										class="button-icon-svg"/>
							</template>
							{{ buttonText }}
						</ButtonComponent>
							<p class="preview-hint">Interact with the button to see hover, focus, and pressed states</p>
						</div>

						<!-- Form Component Preview -->
						<div v-else-if="activeTab === 'forms'">
							<div v-if="selectedFormType === 'input'" class="component-input-preview">
								<InputComponent
									v-model="formValue"
									:label="formLabelText"
									:placeholder="formPlaceholder"
									:description="formShowDescription ? 'Beskrivelse' : ''"
									:hasError="formHasError"
									:disabled="formDisabled"
									:required="formRequired"
									:errorMessage="formHasError ? 'Error message' : ''"
									:type="selectedInputType"
								>
								</InputComponent>

								<div class="icon-explanations">
									<div class="icon-explanation" v-if="selectedInputType === 'search'">
										<p>👆 Søge-input har automatisk et søge-ikon til venstre</p>
									</div>
									<div class="icon-explanation" v-if="selectedInputType === 'password'">
										<p>👆 Password-input har automatisk et øje-ikon til højre for at vise/skjule password</p>
									</div>
								</div>
							</div>

							<div v-else-if="selectedFormType === 'dropdown'">
								<DropdownComponent
									v-model="selectedDropdownValue"
									:label="formLabelText"
									:placeholder="formPlaceholder"
									:description="formShowDescription ? 'Beskrivelse' : ''"
									:hasError="formHasError"
									:disabled="formDisabled"
									:required="formRequired"
									:options="dropdownOptions"
									:errorMessage="formHasError ? 'Error message' : ''"
								/>
							</div>
						</div>

						<!-- Dropdown Component Preview -->
						<div v-if="activeTab === 'dropdown'" class="dropdown-preview-container">
							<DropdownComponent
								v-model="selectedDropdownValue"
								:options="dropdownOptions"
								:label="formLabelText"
								:placeholder="formPlaceholder"
								:description="formShowDescription ? 'Beskrivelse' : ''"
								:hasError="formHasError"
								:errorMessage="formHasError ? 'Error message' : ''"
								:disabled="formDisabled"
								:required="formRequired"
							/>
						</div>
					</div>
					</div>

				<!-- Controls Section -->
					<div class="component-controls">
					<!-- Button Controls -->
					<template v-if="activeTab === 'buttons'">
						<div class="control-grid">
							<div class="control-group">
								<label class="control-label">Text</label>
								<input
									type="text"
									v-model="buttonText"
									class="control-input"
									placeholder="Button text">
							</div>

								<div class="control-group">
								<label class="control-label">Variant</label>
								<div class="button-group">
										<button
											v-for="variant in variants"
											:key="variant.value"
											@click="selectedVariant = variant.value"
										:class="['control-btn', { active: selectedVariant === variant.value }]">
											{{ variant.label }}
										</button>
									</div>
								</div>

							<div class="control-group" v-if="selectedVariant === 'primary'">
								<label class="control-label">Size</label>
								<div class="button-group">
										<button
											v-for="size in sizes"
											:key="size.value"
											@click="selectedSize = size.value"
										:class="['control-btn', { active: selectedSize === size.value }]">
											{{ size.label }}
										</button>
								</div>
							</div>

								<div class="control-group">
								<label class="control-label">Options</label>
								<div class="option-group">
									<label class="option">
										<input type="checkbox" v-model="isFullWidth">
										<span>Full width</span>
									</label>

									<label class="option">
										<input type="checkbox" v-model="hasIcon">
										<span>Include icon</span>
									</label>

									<label class="option">
											<input type="checkbox" v-model="isDisabled">
										<span>Disabled</span>
										</label>

									<label class="option" v-if="selectedVariant === 'tertiary'">
										<input type="checkbox" v-model="noPadding">
										<span>No padding</span>
										</label>

									<label class="option" v-if="selectedVariant === 'tertiary'">
										<input type="checkbox" v-model="isDelete">
										<span>Delete style (red)</span>
										</label>
								</div>
							</div>

							<div class="control-group" v-if="hasIcon">
								<label class="control-label">Icon</label>
								<div class="icon-selector">
									<button
										v-for="icon in icons"
										:key="icon.name"
										@click="selectedIcon = icon"
										:class="['icon-btn', { active: selectedIcon.name === icon.name }]"
										:title="icon.name.replace('Icon', '')">
										<component
											:is="icon.component"
											class="icon-selector-svg"/>
									</button>
								</div>
							</div>
						</div>
					</template>

					<!-- Form Controls -->
					<template v-else-if="activeTab === 'forms'">
						<!-- Form Type Section -->
						<div class="control-grid">
						<div class="control-group">
								<label class="control-label">Component Type</label>
								<div class="button-group">
									<button
										v-for="type in formTypes"
										:key="type.value"
										@click="selectedFormType = type.value"
										:class="['control-btn', { active: selectedFormType === type.value }]">
										{{ type.label }}
									</button>
					</div>
				</div>

							<div class="control-group">
								<label class="control-label">Label Text</label>
								<input
									type="text"
									v-model="formLabelText"
									class="control-input"
									placeholder="Label text">
				</div>

							<div class="control-group">
								<label class="control-label">Placeholder</label>
								<input
									type="text"
									v-model="formPlaceholder"
									class="control-input"
									placeholder="Placeholder text">
						</div>

							<div class="control-group" v-if="selectedFormType === 'input'">
								<label class="control-label">Input Type</label>
								<div class="button-group">
									<button
										v-for="type in inputTypes"
										:key="type.value"
										@click="selectedInputType = type.value"
										:class="['control-btn', { active: selectedInputType === type.value }]">
										{{ type.label }}
									</button>
						</div>
					</div>

							<div class="control-group">
								<label class="control-label">States</label>
								<div class="option-group">
									<label class="option">
										<input type="checkbox" v-model="formShowDescription">
										<span>Show description</span>
									</label>

									<label class="option">
										<input type="checkbox" v-model="formRequired">
										<span>Required</span>
									</label>

									<label class="option">
										<input type="checkbox" v-model="formHasError">
										<span>Error state</span>
									</label>

									<label class="option">
										<input type="checkbox" v-model="formDisabled">
										<span>Disabled</span>
									</label>
						</div>
					</div>

							<div class="control-group" v-if="selectedFormType === 'dropdown'">
								<label class="control-label">Options</label>
								<div class="option-list">
									<div v-for="(option, index) in dropdownOptions" :key="index" class="option-item">
										<input
											type="text"
											v-model="dropdownOptions[index]"
											class="control-input"
											placeholder="Option text">
										<button
											v-if="dropdownOptions.length > 1"
											@click="removeDropdownOption(index)"
											class="remove-option-btn"
											title="Remove option">
											<IconX />
										</button>
						</div>
									<button
										@click="addDropdownOption"
										class="add-option-btn">
										<IconPlus /> Add Option
									</button>
								</div>
							</div>
						</div>
					</template>
				</div>

				<!-- Code Example -->
				<div class="component-code">
					<div class="code-header">
						<h3>Code Example</h3>
						<button class="copy-btn" @click="copyCodeToClipboard" title="Copy to clipboard">
							<component :is="hasCopied ? IconCheck : IconDownload" class="copy-icon" />
							<span>{{ hasCopied ? 'Copied!' : 'Copy' }}</span>
						</button>
					</div>
					<pre ref="codeBlock"><code>{{ getCodeExample() }}</code></pre>
				</div>
			</div>

			<!-- Empty state for tabs without content -->
			<div v-else class="empty-state">
				<h2>Coming Soon</h2>
				<p>The {{ activeTab }} component is currently in development. Check back later!</p>
			</div>
			</div>
	</div>
</template>

<script setup>
import { ref, computed } from 'vue'
import ButtonComponent from '../components/ui/ButtonComponent.vue'
import InputComponent from '../components/ui/InputComponent.vue'
import DropdownComponent from '../components/ui/DropdownComponent.vue'
import {
	IconPlus,
	IconTrash,
	IconPencil,
	IconDownload,
	IconCheck,
	IconX
} from '@tabler/icons-vue'

// Tabs
const activeTab = ref('buttons')
const tabs = [
	{ label: 'Buttons', value: 'buttons' },
	{ label: 'Cards', value: 'cards' },
	{ label: 'Forms', value: 'forms' },
	{ label: 'Navigation', value: 'navigation' },
	{ label: 'Modals', value: 'modals' }
]

// Button component state
const buttonText = ref('microcopy')
const selectedVariant = ref('secondary')
const selectedSize = ref('medium')
const isFullWidth = ref(false)
const hasIcon = ref(true)
const isDisabled = ref(false)
const noPadding = ref(false)
const isDelete = ref(false)

const variants = [
	{ label: 'Primary', value: 'primary' },
	{ label: 'Secondary', value: 'secondary' },
	{ label: 'Tertiary', value: 'tertiary' }
]

const sizes = [
	{ label: 'Small', value: 'small' },
	{ label: 'Medium', value: 'medium' }
]

const icons = [
	{ component: IconPlus, name: 'IconPlus' },
	{ component: IconTrash, name: 'IconTrash' },
	{ component: IconPencil, name: 'IconPencil' },
	{ component: IconDownload, name: 'IconDownload' },
	{ component: IconCheck, name: 'IconCheck' }
]

const selectedIcon = ref(icons[2]) // Default to pencil icon

// Code example functionality
const codeBlock = ref(null)
const hasCopied = ref(false)

const copyCodeToClipboard = () => {
	if (codeBlock.value) {
		const text = codeBlock.value.textContent
		if (text) {
			navigator.clipboard.writeText(text)
			hasCopied.value = true
			// Reset copied state after 2 seconds
			setTimeout(() => {
				hasCopied.value = false
			}, 2000)
		}
	}
}

// Helper functions for dynamic content
const hasComponentContent = () => {
	return ['buttons', 'forms'].includes(activeTab.value)
}

const getComponentTitle = () => {
	const titles = {
		buttons: 'Button Component',
		cards: 'Card Component',
		forms: 'Form Components',
		navigation: 'Navigation Components',
		modals: 'Modal Components'
	}
	return titles[activeTab.value] || 'Component'
}

const getComponentDescription = () => {
	const descriptions = {
		buttons: 'Buttons allow users to take actions with a single tap. Use them throughout your interface for actions like submitting forms, opening dialogs, canceling actions, or performing new operations.',
		forms: 'Form components help users input, edit, and select data.',
		cards: 'Cards contain content and actions about a single subject.',
		navigation: 'Navigation components help users move between pages and sections.',
		modals: 'Modals display content that temporarily blocks interactions with the main view.'
	}
	return descriptions[activeTab.value] || ''
}

// Form component state
const selectedFormType = ref('input')
const formTypes = [
	{ label: 'Input', value: 'input' },
	{ label: 'Dropdown', value: 'dropdown' }
]

const formLabelText = ref('Label')
const formPlaceholder = ref('Placeholder')
const formShowDescription = ref(false)
const formRequired = ref(true)
const formHasError = ref(false)
const formDisabled = ref(false)
const formValue = computed(() => {
	// Automatisk sæt en værdi når password er valgt for at vise ikoner
	if (selectedInputType.value === 'password') {
		return 'password123'
	}
	return ''
})
const selectedDropdownValue = ref('')

// Input specific props
const selectedInputType = ref('text')
const inputTypes = [
	{ label: 'Text', value: 'text' },
	{ label: 'Email', value: 'email' },
	{ label: 'Password', value: 'password' },
	{ label: 'Search', value: 'search' }
]

// Dropdown props
const dropdownOptions = ref(['Body 2 (Regular)', 'Body 2 (Regular)', 'Body 2 (Regular)'])

const addDropdownOption = () => {
	dropdownOptions.value.push('New Option')
}

const removeDropdownOption = (index) => {
	dropdownOptions.value.splice(index, 1)
}

// Dynamic code example generation based on active component
const getCodeExample = () => {
	if (activeTab.value === 'buttons') {
		return `<ButtonComponent
  variant="${selectedVariant.value}"${selectedVariant.value === 'primary'
		? `
  size="${selectedSize.value}"`
		: ''}${isFullWidth.value
		? `
  :fullWidth="true"`
		: ''}${isDisabled.value
		? `
  disabled`
		: ''}${noPadding.value && selectedVariant.value === 'tertiary'
		? `
  :noPadding="true"`
		: ''}${isDelete.value && selectedVariant.value === 'tertiary'
		? `
  :isDelete="true"`
		: ''}>${hasIcon.value
		? `
  <template #icon>
    <${selectedIcon.value.name} class="button-icon-svg" />
  </template>`
		: ''}
  ${buttonText.value}
</ButtonComponent>`
	} else if (activeTab.value === 'forms') {
		if (selectedFormType.value === 'input') {
			// Besked om automatiske ikoner
			let automaticIconNote = ''
			if (selectedInputType.value === 'search') {
				automaticIconNote = '<!-- Search input har automatisk søge-ikon til venstre -->\n  '
			} else if (selectedInputType.value === 'password') {
				automaticIconNote = '<!-- Password input har automatisk øje-ikon til højre -->\n  '
			}

			return `${automaticIconNote}<InputComponent
  v-model="yourValue"
  ${formLabelText.value ? `label="${formLabelText.value}"` : ''}${formPlaceholder.value && formPlaceholder.value !== 'Placeholder'
		? `
  placeholder="${formPlaceholder.value}"`
		: ''}${formShowDescription.value
		? `
  description="Beskrivelse"`
		: ''}${formRequired.value
		? `
  required`
		: ''}${formDisabled.value
		? `
  disabled`
		: ''}${formHasError.value
		? `
  :hasError="true"
  errorMessage="Error message"`
		: ''}${selectedInputType.value !== 'text'
		? `
  type="${selectedInputType.value}"`
		: ''}
</InputComponent>`
		} else if (selectedFormType.value === 'dropdown') {
			return `<DropdownComponent
  v-model="selectedValue"
  ${formLabelText.value ? `label="${formLabelText.value}"` : ''}${formPlaceholder.value && formPlaceholder.value !== 'Default'
		? `
  placeholder="${formPlaceholder.value}"`
		: ''}${formShowDescription.value
		? `
  description="Beskrivelse"`
		: ''}${formRequired.value
		? `
  required`
		: ''}${formDisabled.value
		? `
  disabled`
		: ''}${formHasError.value
		? `
  :hasError="true"
  errorMessage="Error message"`
		: ''}
  :options="${JSON.stringify(dropdownOptions.value).replace(/"/g, '\'')}"
/>`
		}
	}

	return 'Code example will be shown here'
}
</script>

<style lang="scss" scoped>
@use '@/assets/variables' as *;
@use '@/assets/icons' as *;

.component-view {
	min-height: 100vh;
	background-color: #f5f5f5;
}

.main-header {
	background-color: white;
	padding: 1rem 2rem;
	box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);

	h1 {
		margin: 0;
		font-size: 1.25rem;
		font-weight: 600;
		color: $neutral-900;
		margin-bottom: 1rem;
	}
}

.component-nav {
	display: flex;
	gap: 0.25rem;

	.nav-btn {
					background: none;
					border: none;
		padding: 0.5rem 1rem;
		font-size: 0.875rem;
		border-radius: 4px;
		cursor: pointer;
					color: $neutral-700;
		transition: all 0.2s ease;

					&:hover {
			background-color: $neutral-100;
					}

					&.active {
			background-color: $primary-500;
			color: white;
		}
	}
}

.component-container {
	max-width: 1000px;
	margin: 2rem auto;
	padding: 0 1.5rem;
}

.component-info {
	margin-bottom: 1.5rem;

	h2 {
		font-size: 1.5rem;
		font-weight: 600;
		margin: 0 0 0.5rem 0;
		color: $neutral-900;
	}

	p {
		margin: 0;
		color: $neutral-600;
		line-height: 1.5;
	}
}

.component-playground {
	background-color: white;
	border-radius: 8px;
	box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
	overflow: hidden;
	display: grid;
	grid-template-rows: auto auto auto;
}

	.component-preview {
    padding: 1.5rem;
		display: flex;
		justify-content: center;
		align-items: center;
	background-color: $neutral-100;
	border-bottom: 1px solid $neutral-200;
}

.preview-container {
	width: 100%;
	text-align: left;
}

.preview-heading {
	font-size: 1.5rem;
	font-weight: 600;
	margin-bottom: 1rem;
	color: $neutral-900;
	text-align: center;
}

.preview-hint {
	font-size: 0.875rem;
	color: $neutral-600;
	margin-top: 0.5rem;
	}

	.component-controls {
	padding: 1.5rem;
	border-bottom: 1px solid $neutral-200;
}

.control-grid {
	display: grid;
	grid-template-columns: repeat(2, 1fr);
	column-gap: 2rem;
	row-gap: 1.5rem;
}

.control-group {
	margin-bottom: 0;
}

.control-label {
		display: block;
	font-size: 0.75rem;
		font-weight: 500;
	margin-bottom: 0.5rem;
	color: $neutral-700;
	text-transform: uppercase;
	letter-spacing: 0.5px;
}

.control-input {
	width: 100%;
	padding: 0.5rem;
	border: 1px solid $neutral-300;
	border-radius: 4px;
	font-size: 0.875rem;

	&:focus {
		outline: none;
		border-color: $primary-400;
	}
}

.button-group {
	display: flex;
	width: 100%;
	border: 1px solid $neutral-300;
	border-radius: 4px;
	overflow: hidden;
}

.control-btn {
		flex: 1;
	padding: 0.5rem;
	background: white;
		border: none;
	font-size: 0.875rem;
		cursor: pointer;
	transition: background 0.2s;

		&:not(:last-child) {
			border-right: 1px solid $neutral-300;
		}

		&:hover {
			background-color: $neutral-100;
		}

		&.active {
			background-color: $primary-500;
			color: white;
	}
}

.option-group {
	display: flex;
	flex-wrap: wrap;
	gap: 1rem;
}

.option {
	display: flex;
	align-items: center;
	cursor: pointer;

	input {
		margin-right: 0.5rem;
		accent-color: $primary-500;
	}

	span {
		font-size: 0.875rem;
		color: $neutral-800;
	}
}

.icon-selector {
	display: flex;
	flex-wrap: wrap;
    gap: 0.5rem;
    background-color: #FFFFFF;
    padding: 0.75rem 0;
    border-radius: 4px;
}

.icon-btn {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 36px;
	height: 36px;
	background: white;
	border: 1px solid $neutral-300;
	border-radius: 4px;
	cursor: pointer;

	&:hover {
		background-color: $neutral-100;
	}

	&.active {
		background-color: $primary-500;
		color: white;
		border-color: $primary-500;
	}
}

.component-code {
	padding: 1.5rem;
	background-color: $neutral-900;

	.code-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
	}

	h3 {
		margin: 0;
		font-size: 0.875rem;
		font-weight: 500;
		color: white;
	}

	.copy-btn {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 0.75rem;
		background-color: $neutral-800;
		border: none;
		border-radius: $border-radius-sm;
		color: $neutral-200;
		font-size: 0.75rem;
		cursor: pointer;
		transition: $transition-base;

		&:hover {
			background-color: $neutral-700;
		}

		.copy-icon {
			width: 16px;
			height: 16px;
			stroke-width: 1.5;
			fill: none;
		}
	}

	pre {
		margin: 0;
		padding: 1rem;
		background-color: $neutral-800;
		border-radius: $border-radius-sm;
		color: $neutral-200;
		font-family: monospace;
		font-size: 0.875rem;
		line-height: 1.5;
		overflow-x: auto;
	}
}

.button-icon-svg {
	display: inline-block !important;
	vertical-align: middle;
	color: currentColor;
}

.icon-selector-svg {
	display: inline-block !important;
	vertical-align: middle;
	color: currentColor;
	stroke-width: 1.5;
	fill: none;
	width: 20px;
	height: 20px;
}

.empty-state {
	text-align: center;
	padding: 4rem 2rem;
	background: white;
	border-radius: 8px;
	box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);

	h2 {
		margin: 0 0 0.5rem 0;
		font-size: 1.25rem;
		color: $neutral-800;
	}

	p {
		margin: 0;
		color: $neutral-600;
	}
}

@media (max-width: 768px) {
	.control-grid {
		grid-template-columns: 1fr;
	}
}

.option-list {
	display: flex;
	flex-direction: column;
	gap: $spacing-xs;
	margin-top: $spacing-xs;
}

.option-item {
	display: flex;
	align-items: center;
	gap: $spacing-xs;
}

.remove-option-btn {
	display: flex;
	align-items: center;
	justify-content: center;
	background: none;
	border: none;
	color: $neutral-500;
	width: 24px;
	height: 24px;
	padding: 0;
	cursor: pointer;
	transition: $transition-base;

	&:hover {
		color: $error-base;
	}

	svg {
		width: 16px;
		height: 16px;
	}
}

.add-option-btn {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: $spacing-xs;
	background: none;
	border: 1px dashed $neutral-300;
	color: $primary-500;
	border-radius: $border-radius-sm;
	padding: $spacing-xs $spacing-small;
	margin-top: $spacing-xs;
	cursor: pointer;
	transition: $transition-base;
	font-size: $body-3-font-size;

	&:hover {
		background-color: $neutral-100;
		color: $primary-700;
	}

	svg {
		width: 16px;
		height: 16px;
	}
}

.component-input-preview {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	width: 100%;
}

.icon-explanations {
	display: flex;
	flex-direction: column;
	gap: $spacing-xs;
	width: 100%;
	max-width: 400px;
}

.icon-explanation {
	margin-top: $spacing-xs;
	text-align: left;
	background-color: $neutral-200;
	padding: $spacing-small;
	border-radius: $border-radius-sm;
	width: 100%;
	border-left: 4px solid $primary-500;

	p {
		margin: 0;
		font-size: $body-3-font-size;
		color: $neutral-700;
	}
}

.button-preview-container {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	width: 100%;
}

.dropdown-preview-container {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	width: 100%;
}

.input-preview-container {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	width: 100%;
}
</style>
