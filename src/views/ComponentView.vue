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
		<div class="component-container" :class="{ 'full-width-container': isFullWidthContainer }">
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

						<!-- Filter Button Component Preview -->
						<div v-if="activeTab === 'filter'" class="filter-button-preview-container">
							<FilterButtonComponent
								:text="filterButtonText"
								:active="isFilterActive"
								:disabled="isFilterDisabled"
								:full-width="isFilterFullWidth"
								:show-icon="showFilterIcon"
								@click="toggleFilterActive"
							/>
							<p class="preview-hint">Interact with the filter button to see hover, focus, and pressed states</p>
						</div>

						<!-- Banner Component Preview -->
						<div v-if="activeTab === 'banners'" class="banner-preview-container">
							<BannerComponent
								:variant="bannerVariant"
								:text="bannerText"
								:link="bannerShowLink ? bannerLink : ''"
								:linkText="bannerLinkText"
								:linkBreak="bannerLinkBreak"
							/>
							<p class="preview-hint">Forskellige varianter bruges til at vise forskellige meddelelses-niveauer: warning, error, success</p>
						</div>

						<!-- Calendar Component Preview -->
						<div v-if="activeTab === 'calendar'" class="calendar-preview-container">
							<div class="calendar-subtabs">
								<button
									v-for="subtab in calendarSubtabs"
									:key="subtab.value"
									@click="activeCalendarSubtab = subtab.value"
									:class="['control-btn', { active: activeCalendarSubtab === subtab.value }]"
								>
									{{ subtab.label }}
								</button>
							</div>

							<!-- Full Calendar Subtab -->
							<div v-if="activeCalendarSubtab === 'fullCalendar'" class="full-calendar-container">
								<div class="calendar-interactive-controls">
									<div class="control-group">
										<label class="control-label">Tilføj task til kalenderen</label>
										<div class="calendar-add-task-controls">
											<div class="task-input-group">
												<input
													type="text"
													v-model="calendarTaskTitle"
													class="control-input"
													placeholder="Task titel"
												>
											</div>
											<div class="task-input-group">
												<div class="button-group">
													<button
														v-for="variant in taskVariants"
														:key="variant.value"
														@click="selectedCalendarTaskVariant = variant.value"
														:class="['control-btn', { active: selectedCalendarTaskVariant === variant.value }]"
													>
														{{ variant.label }}
													</button>
												</div>
											</div>
										</div>
										<p class="calendar-instructions">Klik på en dato i kalenderen for at tilføje tasken. Herunder kan du se hvordan kalenderen vil blive vist i din applikation.</p>
									</div>
								</div>
								<CalendarComponent
									@date-click="addTaskToCalendar"
									:customTasks="calendarTasks"
								/>
							</div>

							<!-- Task Examples Subtab -->
							<div v-else-if="activeCalendarSubtab === 'calendarTasks'" class="task-examples">
								<h4>Task Eksempel</h4>
								<p class="task-instruction">Interager med task komponenten for at se hover og active states</p>
								<!-- Status variant showcase -->
								<div class="variants-showcase">
									<div class="variant-section">
										<h5>{{ getStatusLabel(selectedTaskVariant) }}</h5>
										<div class="single-task-preview">
											<CalendarDayTask
												:title="taskTitle"
												:details="showTaskDetails ? taskDetails : ''"
												:status="selectedTaskVariant"
											/>
										</div>
									</div>
								</div>
							</div>

							<p class="info-text">
								{{ activeCalendarSubtab === 'fullCalendar'
									? 'Interaktiv kalender til visning og navigation mellem måneder.'
									: 'Calendar task komponenter til visning af opgaver med forskellige status.'
								}}
							</p>
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

					<!-- Filter Button Controls -->
					<template v-if="activeTab === 'filter'">
						<div class="control-grid">
							<div class="control-group">
								<label class="control-label">Text</label>
								<input
									type="text"
									v-model="filterButtonText"
									class="control-input"
									placeholder="Button text">
							</div>

							<div class="control-group">
								<label class="control-label">Options</label>
								<div class="option-group">
									<label class="option">
										<input type="checkbox" v-model="isFilterActive">
										<span>Active</span>
									</label>

									<label class="option">
										<input type="checkbox" v-model="isFilterFullWidth">
										<span>Full width</span>
									</label>

									<label class="option">
										<input type="checkbox" v-model="isFilterDisabled">
										<span>Disabled</span>
									</label>
									<label class="option">
										<input type="checkbox" v-model="showFilterIcon">
										<span>Show icon</span>
									</label>
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

					<!-- Banner Controls -->
					<template v-if="activeTab === 'banners'">
						<div class="control-grid">
							<div class="control-group">
								<label class="control-label">Variant</label>
								<div class="button-group">
									<button
										v-for="variant in bannerVariants"
										:key="variant.value"
										@click="bannerVariant = variant.value"
										:class="['control-btn', { active: bannerVariant === variant.value }]">
										{{ variant.label }}
									</button>
								</div>
							</div>

							<div class="control-group">
								<label class="control-label">Text</label>
								<input
									type="text"
									v-model="bannerText"
									class="control-input"
									placeholder="Banner message">
							</div>

							<div class="control-group">
								<label class="control-label">Options</label>
								<div class="option-group">
									<label class="option">
										<input type="checkbox" v-model="bannerShowLink">
										<span>Show link</span>
									</label>
									<label class="option" v-if="bannerShowLink">
										<input type="checkbox" v-model="bannerLinkBreak">
										<span>Link on new line</span>
									</label>
								</div>
							</div>

							<div class="control-group" v-if="bannerShowLink">
								<label class="control-label">Link Text</label>
								<input
									type="text"
									v-model="bannerLinkText"
									class="control-input"
									placeholder="Link text">
							</div>
						</div>
					</template>

          <!-- Navigation tab -->
					<template v-if="activeTab === 'navigation'">
            <div class="control-group">
              <label class="control-label">View</label>
              <div class="calendar-subtabs">
                <button
                  v-for="subtab in navigationSubtabs"
                  :key="subtab.value"
                  @click="activeNavigationSubtab = subtab.value"
                  :class="['control-btn', { active: activeNavigationSubtab === subtab.value }]"
                >
                  {{ subtab.label }}
                </button>
              </div>
            </div>
            <div class="">
              <!-- Side Navigation Display -->
              <template v-if="activeNavigationSubtab === 'sideNavigation'">
                <div class="control-group">
                  <label class="control-label">Component Preview</label>
                  <div class="preview-container navigation-preview-wrapper">
                    <div class="side-navigation-container">
                      <SideNavigationComponent class="static-nav" />
                    </div>
                  </div>
                </div>
              </template>

              <!-- Header Display -->
              <template v-else-if="activeNavigationSubtab === 'header'">
                <div class="control-group">
                  <label class="control-label">Component Preview</label>
                  <div class="preview-container">
                    <div class="header-container">
                      <HeaderComponent class="static-header" />
                    </div>
                  </div>
                </div>
              </template>

              <!-- Styling Display -->
              <template v-else-if="activeNavigationSubtab === 'styling'">
                <div class="control-group">
                  <label class="control-label">Navigation States</label>
                  <div class="style-samples">
                    <div class="menu-item">Normal State</div>
                    <div class="menu-item">Hover State</div>
                    <div class="menu-item active">Active State</div>
                  </div>
                </div>
              </template>
            </div>
          </template>

					<!-- Calendar Controls -->
					<template v-if="activeTab === 'calendar'">
						<div class="control-grid">
							<div class="control-group">
								<p class="info-text">
									{{ activeCalendarSubtab === 'fullCalendar'
										? 'Interaktiv kalender til visning og navigation mellem måneder.'
										: 'Calendar task komponenter til visning af opgaver med forskellige status.'
									}}
								</p>
							</div>

							<!-- Show controls only for calendar tasks -->
							<template v-if="activeCalendarSubtab === 'calendarTasks'">
								<div class="control-group">
									<label class="control-label">Task Variant</label>
									<div class="button-group">
										<button
											v-for="variant in taskVariants"
											:key="variant.value"
											@click="selectedTaskVariant = variant.value"
											:class="['control-btn', { active: selectedTaskVariant === variant.value }]"
										>
											{{ variant.label }}
										</button>
									</div>
								</div>

								<div class="control-group">
									<label class="control-label">Task Title</label>
									<input
										type="text"
										v-model="taskTitle"
										class="control-input"
										placeholder="Task title"
									>
								</div>

								<div class="control-group">
									<label class="control-label">Options</label>
									<div class="option-group">
										<label class="option">
											<input type="checkbox" v-model="showTaskDetails">
											<span>Show details</span>
										</label>
									</div>
								</div>

								<div class="control-group" v-if="showTaskDetails">
									<label class="control-label">Task Details</label>
									<input
										type="text"
										v-model="taskDetails"
										class="control-input"
										placeholder="Location or details"
									>
								</div>
							</template>
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
import FilterButtonComponent from '../components/ui/FilterButtonComponent.vue'
import BannerComponent from '../components/ui/BannerComponent.vue'
import HeaderComponent from '../components/navigation/HeaderComponent.vue'
import SideNavigationComponent from '../components/navigation/SideNavigationComponent.vue'
import CalendarComponent from '../components/calendar/CalendarComponent.vue'
import CalendarDayTask from '../components/calendar/CalendarDayTask.vue'
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
  { label: 'Logo', value: 'logo' },
  { label: 'Buttons', value: 'buttons' },
  { label: 'Filter Button', value: 'filter' },
  { label: 'Navigation', value: 'navigation' },
  { label: 'Forms', value: 'forms' },
  { label: 'Tables', value: 'tables' },
  { label: 'Modals & Pop-Ups', value: 'modals' },
  { label: 'Banners & Messaging', value: 'banners' },
  { label: 'Illustrations', value: 'illustrations' },
  { label: 'Calendar', value: 'calendar' }
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

const selectedIcon = ref(icons[0])

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
  return ['buttons', 'forms', 'filter', 'banners', 'navigation', 'calendar'].includes(activeTab.value)
}

const getComponentTitle = () => {
  switch (activeTab.value) {
    case 'buttons':
      return 'Button Component'
    case 'filter':
      return 'Filter Button Component'
    case 'forms':
      return selectedFormType.value === 'input'
        ? 'Input Component'
        : 'Dropdown Component'
    case 'banners':
      return 'Banner Component'
    case 'calendar':
      return 'Calendar Component'
    case 'navigation':
      if (activeNavigationSubtab.value === 'sideNavigation') {
        return 'Side Navigation Component'
      } else if (activeNavigationSubtab.value === 'header') {
        return 'Header Component'
      } else {
        return 'Navigation Styling'
      }
    default:
      return activeTab.value.charAt(0).toUpperCase() + activeTab.value.slice(1)
  }
}

const getComponentDescription = () => {
  switch (activeTab.value) {
    case 'buttons':
      return 'Buttons are used for actions, like submitting a form or clicking on a link. Buttons should communicate actions users can take.'
    case 'filter':
      return 'Filter Buttons are used for selecting options within predefined categories, often used in search interfaces or content filtering.'
    case 'forms':
      if (selectedFormType.value === 'input') {
        return 'Input components are used for collecting user data, with various types for different data formats.'
      } else {
        return 'Dropdown components are used for selecting from a predefined list of options.'
      }
    case 'banners':
      return 'Banners are used to display important messages, alerts or notifications to users. They can include links for additional actions.'
    case 'calendar':
      return 'Calendar component used for displaying and managing tasks, inspections, and other scheduled items with different status indicators.'
    case 'navigation':
      if (activeNavigationSubtab.value === 'sideNavigation') {
        return 'Side navigation component provides the main application navigation menu. It allows users to navigate between different sections of the application.'
      } else if (activeNavigationSubtab.value === 'header') {
        return 'Header component displays action buttons and user controls in the top bar of the application.'
      } else {
        return 'Styling options and states for navigation elements including hover and active states.'
      }
    default:
      return ''
  }
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

// Filter button props
const filterButtonText = ref('Filter Button')
const isFilterActive = ref(false)
const isFilterDisabled = ref(false)
const isFilterFullWidth = ref(false)
const showFilterIcon = ref(true)

// Banner component props
const bannerText = ref('Dette skema vil blive oprettet uden en checkliste.')
const bannerVariant = ref('warning')
const bannerLink = ref('#')
const bannerLinkText = ref('Opsæt Checkliste')
const bannerShowLink = ref(true)
const bannerLinkBreak = ref(false)

// Banner variants
const bannerVariants = [
  { label: 'Warning', value: 'warning' },
  { label: 'Error', value: 'error' },
  { label: 'Success', value: 'success' }
]

// Toggle filter active state
const toggleFilterActive = () => {
  if (!isFilterDisabled.value) {
    isFilterActive.value = !isFilterActive.value
  }
}

const addDropdownOption = () => {
  dropdownOptions.value.push('New Option')
}

const removeDropdownOption = (index) => {
  dropdownOptions.value.splice(index, 1)
}

// navigation & header
const navigationSubtabs = [
  { label: 'Side Navigation', value: 'sideNavigation' },
  { label: 'Header', value: 'header' },
  { label: 'Styling', value: 'styling' }
]
const activeNavigationSubtab = ref('sideNavigation')

// Calendar component state
// Add state for calendar task demo
const taskVariants = [
  { label: 'Normal', value: 'normal' },
  { label: 'Warning', value: 'warning' },
  { label: 'Error', value: 'error' }
]

const selectedTaskVariant = ref('normal')
const taskTitle = ref('Egenkontrol')
const taskDetails = ref('Details/lokation')
const showTaskDetails = ref(false)

// Add calendar subtabs
const calendarSubtabs = [
  { label: 'Full Calendar', value: 'fullCalendar' },
  { label: 'Calendar Task', value: 'calendarTasks' }
]
const activeCalendarSubtab = ref('fullCalendar')

// Interactive calendar vars
const calendarTaskTitle = ref('Egenkontrol')
const calendarTaskDetails = ref('Bygning A, 1. sal')
const calendarShowTaskDetails = ref(true)
const selectedCalendarTaskVariant = ref('normal')
const calendarTasks = ref({}) // Object with date strings as keys and arrays of tasks as values

// Function to add a task to the calendar when a date is clicked
const addTaskToCalendar = (date) => {
  if (!calendarTaskTitle.value.trim()) {
    return // Don't add empty tasks
  }
  const dateStr = date.toISOString().split('T')[0]
  const newTask = {
    id: Date.now(), // Generate a unique ID based on timestamp
    title: calendarTaskTitle.value,
    details: '', // No details needed
    status: selectedCalendarTaskVariant.value
  }
  if (!calendarTasks.value[dateStr]) {
    calendarTasks.value[dateStr] = []
  }
  calendarTasks.value[dateStr].push(newTask)
  // Use spread operator to trigger reactivity
  calendarTasks.value = { ...calendarTasks.value }
}

// Dynamic code example generation based on active component
const getCodeExample = () => {
  if (activeTab.value === 'buttons') {
    const props = []

    if (selectedVariant.value !== 'primary') {
      props.push(`variant="${selectedVariant.value}"`)
    }

    if (selectedSize.value !== 'medium') {
      props.push(`size="${selectedSize.value}"`)
    }

    if (isFullWidth.value) {
      props.push(':full-width="true"')
    }

    if (isDisabled.value) {
      props.push(':disabled="true"')
    }

    if (noPadding.value) {
      props.push(':no-padding="true"')
    }

    if (isDelete.value) {
      props.push(':is-delete="true"')
    }

    const propsStr = props.length ? props.join('\n  ') : ''

    if (hasIcon.value) {
      return `<ButtonComponent
  ${propsStr}
>
  <template #icon>
    <${selectedIcon.value.name} />
  </template>
  ${buttonText.value}
</ButtonComponent>`
    } else {
      return `<ButtonComponent
  ${propsStr}
>
  ${buttonText.value}
</ButtonComponent>`
    }
  } else if (activeTab.value === 'filter') {
    const props = []

    if (filterButtonText.value) {
      props.push(`text="${filterButtonText.value}"`)
    }

    if (isFilterActive.value) {
      props.push(':active="true"')
    }

    if (isFilterDisabled.value) {
      props.push(':disabled="true"')
    }

    if (isFilterFullWidth.value) {
      props.push(':full-width="true"')
    }
    
    if (!showFilterIcon.value) {
      props.push(':show-icon="false"')
    }

    const propsStr = props.length ? props.join('\n  ') : ''

    return `<FilterButtonComponent
  ${propsStr}
  @click="handleFilterClick"
/>`
  } else if (activeTab.value === 'forms' && selectedFormType.value === 'input') {
    // Input component code example generation
    const props = []

    props.push(`label="${formLabelText.value}"`)

    if (formShowDescription.value) {
      props.push('description="This is a helper text for the input field"')
    }

    props.push(`placeholder="${formPlaceholder.value}"`)

    if (formRequired.value) {
      props.push(':required="true"')
    }

    if (selectedInputType.value !== 'text') {
      props.push(`type="${selectedInputType.value}"`)
    }

    if (formDisabled.value) {
      props.push(':disabled="true"')
    }

    if (formHasError.value) {
      props.push(':has-error="true"')
      props.push('error-message="Error message"')
    }

    const propsStr = props.join('\n  ')

    return `<InputComponent
  ${propsStr}
  v-model="value"
/>`
  } else if (activeTab.value === 'forms' && selectedFormType.value === 'dropdown') {
    // Dropdown component code example generation
    const props = []

    props.push(`label="${formLabelText.value}"`)

    if (formShowDescription.value) {
      props.push('description="This is a helper text for the dropdown field"')
    }

    props.push(`placeholder="${formPlaceholder.value}"`)

    if (formRequired.value) {
      props.push(':required="true"')
    }

    if (formDisabled.value) {
      props.push(':disabled="true"')
    }

    if (formHasError.value) {
      props.push(':has-error="true"')
      props.push('error-message="Error message"')
    }

    props.push(':options="[\'Option 1\', \'Option 2\', \'Option 3\', \'Option 4\']"')

    const propsStr = props.join('\n  ')

    return `<DropdownComponent
  ${propsStr}
  v-model="value"
/>`
  } else if (activeTab.value === 'banners') {
    const props = []
    props.push(`variant="${bannerVariant.value}"`)
    if (bannerText.value !== 'Dette skema vil blive oprettet uden en checkliste.') {
      props.push(`text="${bannerText.value}"`)
    }
    if (bannerShowLink.value) {
      props.push('link="#"')
      if (bannerLinkText.value !== 'Opsæt Checkliste') {
        props.push(`link-text="${bannerLinkText.value}"`)
      }
      if (bannerLinkBreak.value) {
        props.push(':link-break="true"')
      }
    }
    const propsStr = props.join('\n  ')
    return `<BannerComponent
  ${propsStr}
/>`
  } else if (activeTab.value === 'calendar') {
    // Calendar component code example generation
    if (activeCalendarSubtab.value === 'fullCalendar') {
      return '<CalendarComponent />'
    } else {
      const props = []
      props.push(`title="${taskTitle.value}"`)
      if (showTaskDetails.value) {
        props.push(`details="${taskDetails.value}"`)
      }
      if (selectedTaskVariant.value !== 'normal') {
        props.push(`status="${selectedTaskVariant.value}"`)
      }
      const propsStr = props.length ? props.join('\n  ') : ''
      return `<CalendarDayTask
  ${propsStr}
/>`
    }
  }

  return '// Code example will appear here'
}

// Tilføj en computed property der bestemmer om container skal have fuld bredde
const isFullWidthContainer = computed(() => {
  return false // No component should have full width now
})

// Add function to get status label in Danish
const getStatusLabel = (status) => {
  switch (status) {
    case 'normal': return 'Normal'
    case 'warning': return 'Advarsel'
    case 'error': return 'Fejl'
    default: return status
  }
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
			background-color: $secondary-500;
			color: white;
		}
	}
}

.component-container {
	max-width: 1000px;
	margin: 2rem auto;
	padding: 0 1.5rem;

  &.full-width-container {
    max-width: 1000px; // Same as parent
    padding: 0 1.5rem; // Same as parent
  }
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
	max-width: 100%;
	box-sizing: border-box;
}

.component-preview {
  padding: 1.5rem;
	display: flex;
	justify-content: center;
	align-items: center;
	background-color: $neutral-100;
	border-bottom: 1px solid $neutral-200;
	max-width: 100%;
	box-sizing: border-box;
	overflow: hidden;
}

.preview-container {
	width: 100%;
	text-align: left;
	max-width: 100%;
	box-sizing: border-box;
	overflow: hidden;
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
		border-color: $secondary-400;
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
		background-color: $secondary-500;
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
		accent-color: $secondary-500;
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
		background-color: $secondary-500;
		color: white;
		border-color: $secondary-500;
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

@media (max-width: $tablet) {
	.control-grid {
		grid-template-columns: 1fr;
	}
}

.option-list {
	display: flex;
	flex-direction: column;
	gap: 0.75rem;
	width: 100%;
}

.option-editor {
	display: flex;
	flex-direction: column;
	gap: 0.5rem;
	width: 100%;
	padding: 0.75rem;
	background-color: $neutral-200;
	border-radius: $border-radius-sm;
}

.option-controls {
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.remove-btn {
	display: flex;
	align-items: center;
	justify-content: center;
	border: none;
	background: none;
	color: $error-base;
	cursor: pointer;
	padding: 0.25rem;

	&:hover {
		color: $error-600;
	}

	svg {
		width: 1rem;
		height: 1rem;
	}
}

.add-option-btn {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: $spacing-xs;
	background: none;
	border: 1px dashed $neutral-300;
	color: $secondary-500;
	border-radius: $border-radius-sm;
	padding: $spacing-xs $spacing-small;
	margin-top: $spacing-xs;
	cursor: pointer;
	transition: $transition-base;
	font-size: $body-3-font-size;

	&:hover {
		background-color: $neutral-100;
		color: $secondary-700;
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

.filter-button-preview-container {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	width: 100%;
}

.banner-preview-container {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	width: 100%;
}

.calendar-preview-container {
	display: flex;
	flex-direction: column;
	align-items: center;
	width: 100%;
	overflow: hidden;
	box-sizing: border-box;
}

.calendar-subtabs {
	display: flex;
	gap: $spacing-xs;
	margin-bottom: $spacing-medium;
	width: 100%;
	border: none;
	background: transparent;

	.control-btn {
		flex-grow: 1;
		text-align: center;
		padding: $spacing-xs $spacing-small;
		background: white;
		border: 1px solid $neutral-300;
		border-radius: $border-radius-sm;
		font-size: $body-3-font-size;
		cursor: pointer;
		transition: $transition-base;

		&:hover {
			background-color: $neutral-100;
		}

		&.active {
			background-color: $secondary-500;
			color: white;
			border-color: $secondary-500;
		}
	}
}

/* navigation */
.navigation-subtabs {
  display: flex;
  margin-bottom: 1rem;
  border-bottom: 1px solid #e2e8f0;
}

.navigation-subtabs button {
  padding: 0.75rem 1.5rem;
  background-color: #60a5fa;
  color: white;
  border: none;
  border-top-left-radius: 0.25rem;
  border-top-right-radius: 0.25rem;
  cursor: pointer;
}

.navigation-subtabs button:not(.active) {
  background-color: #f0f9ff;
  color: #3b82f6;
}

.navigation-preview-wrapper {
  margin-bottom: 1rem;
  border-radius: 0.25rem;
  overflow: hidden;
  height: 100%;
}

.side-navigation-container {
  width: 250px;
  overflow: hidden;
}

.header-container {
  width: 100%;
  overflow: hidden;
}

.style-samples {
  width: 250px;
}

.preview-hint {
  font-size: 0.875rem;
  color: #6b7280;
  padding: 0.5rem;
}

.static-nav {
  position: static;
  width: 100%;
  height: auto;
}

.static-header {
  position: static;
  left: 0;
  width: 100%;
}

/* calender */

.full-calendar-container {
	width: 100%;
	max-width: 900px;
	padding: 0;
	background: transparent;
	box-shadow: none;
	margin-bottom: $spacing-medium;
	box-sizing: border-box;

	@media (max-width: $tablet) {
		max-width: 100%;
		margin-bottom: $spacing-small;
	}
}

.info-text {
	font-size: 0.875rem;
	line-height: 1.5;
	color: $neutral-600;
	margin: 0;
}

.component-preview-wrapper {
	padding: 1.5rem;
	background-color: $neutral-100;
	border-radius: 8px;
	box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
	margin-bottom: $spacing-medium;

	@media (max-width: $tablet) {
		padding: $spacing-small;
		margin-bottom: $spacing-small;
	}

	@media (max-width: $mobile) {
		padding: $spacing-xs;
		border-radius: 6px;
	}

	&.full-calendar {
		max-width: none;
		width: 100%;
	}
}

.button-group.wrap {
	flex-wrap: wrap;
	max-width: 100%;
}

.month-btn {
	padding: 0.5rem 0.75rem;
	border-radius: $border-radius-sm;
	font-size: $body-3-font-size;
	cursor: pointer;
	transition: $transition-base;
}

.task-examples {
	width: 100%;
	max-width: 900px;
	margin-top: $spacing-medium;
	margin-bottom: $spacing-medium;

	h4 {
		margin-top: $spacing-medium;
		margin-bottom: $spacing-small;
		font-size: $subtitle-2-font-size;
		font-weight: $subtitle-2-font-weight;
	}
}

.task-instruction {
	font-size: 0.875rem;
	color: $neutral-600;
	margin-bottom: $spacing-small;
}

.variants-showcase {
  width: 100%;
  display: flex;
  flex-direction: column;
  margin-bottom: $spacing-medium;
}

.variant-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: $spacing-small;

  h5 {
    font-size: $body-2-font-size;
    font-weight: $body-2-font-weight-semibold;
    margin-bottom: $spacing-small;
    color: $neutral-800;
  }
}

.single-task-preview {
  width: 100%;
  max-width: 300px;
  margin: 0 auto;
  display: flex;
  justify-content: center;
  background-color: white;
  border-radius: $border-radius-sm;
  padding: $spacing-small;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.calendar-interactive-controls {
  margin-bottom: $spacing-medium;
  padding: $spacing-medium;
  background-color: white;
  border-radius: $border-radius-md;
  box-shadow: $shadow-sm;
}

.calendar-add-task-controls {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: $spacing-small;
  margin-bottom: $spacing-small;
}

.task-input-group {
  display: flex;
  flex-direction: column;
}

.calendar-instructions {
  margin-top: $spacing-small;
  font-size: 0.875rem;
  color: $neutral-600;
}
</style>
