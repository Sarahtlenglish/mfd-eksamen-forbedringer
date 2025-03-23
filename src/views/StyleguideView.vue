<script setup>
import { ref } from 'vue'
import {
	IconAlertCircle,
	IconAlertTriangle,
	IconArrowBack,
	IconBell,
	IconCalendarEvent,
	IconCheck,
	IconChevronDown,
	IconChevronLeft,
	IconChevronLeftPipe,
	IconChevronRight,
	IconChevronRightPipe,
	IconChevronUp,
	IconClipboardCheck,
	IconClipboardList,
	IconClipboardText,
	IconDownload,
	IconFileText,
	IconFireExtinguisher,
	IconListDetails,
	IconLogout,
	IconMessage,
	IconPencil,
	IconPlus,
	IconPrinter,
	IconQuestionMark,
	IconSubtask,
	IconTool,
	IconTrash,
	IconUser,
	IconUsers,
	IconX
} from '@tabler/icons-vue'

const activeTab = ref('layout')
const showToast = ref(false)
const toastMessage = ref('')
const toastPosition = ref({ x: 0, y: 0 })

const tabs = [
	{ id: 'layout', label: 'Layout' },
	{ id: 'typography', label: 'Typography' },
	{ id: 'colors', label: 'Colors' },
	{ id: 'iconography', label: 'Iconography' },
	{ id: 'effects', label: 'Effects' }
]

const icons = [
	{ component: IconAlertCircle, name: 'AlertCircle' },
	{ component: IconAlertTriangle, name: 'AlertTriangle' },
	{ component: IconArrowBack, name: 'ArrowBack' },
	{ component: IconBell, name: 'Bell' },
	{ component: IconCalendarEvent, name: 'CalendarEvent' },
	{ component: IconCheck, name: 'Check' },
	{ component: IconChevronDown, name: 'ChevronDown' },
	{ component: IconChevronLeft, name: 'ChevronLeft' },
	{ component: IconChevronLeftPipe, name: 'ChevronLeftPipe' },
	{ component: IconChevronRight, name: 'ChevronRight' },
	{ component: IconChevronRightPipe, name: 'ChevronRightPipe' },
	{ component: IconChevronUp, name: 'ChevronUp' },
	{ component: IconClipboardCheck, name: 'ClipboardCheck' },
	{ component: IconClipboardList, name: 'ClipboardList' },
	{ component: IconClipboardText, name: 'ClipboardText' },
	{ component: IconDownload, name: 'Download' },
	{ component: IconFileText, name: 'FileText' },
	{ component: IconFireExtinguisher, name: 'FireExtinguisher' },
	{ component: IconListDetails, name: 'ListDetails' },
	{ component: IconLogout, name: 'Logout' },
	{ component: IconMessage, name: 'Message' },
	{ component: IconPencil, name: 'Pencil' },
	{ component: IconPlus, name: 'Plus' },
	{ component: IconPrinter, name: 'Printer' },
	{ component: IconQuestionMark, name: 'QuestionMark' },
	{ component: IconSubtask, name: 'Subtask' },
	{ component: IconTool, name: 'Tool' },
	{ component: IconTrash, name: 'Trash' },
	{ component: IconUser, name: 'User' },
	{ component: IconUsers, name: 'Users' },
	{ component: IconX, name: 'X' }
]

const copyVariable = async (variableName, event) => {
	try {
		await navigator.clipboard.writeText(variableName)
		toastMessage.value = `Kopieret: ${variableName}`
		toastPosition.value = { x: event.clientX, y: event.clientY }
		showToast.value = true
		setTimeout(() => {
			showToast.value = false
		}, 2000)
	} catch (err) {
		console.error('Failed to copy text: ', err)
		toastMessage.value = 'Kunne ikke kopiere variabel'
		toastPosition.value = { x: event.clientX, y: event.clientY }
		showToast.value = true
		setTimeout(() => {
			showToast.value = false
		}, 2000)
	}
}
</script>

<template>
  <div class="styleguide">
    <!-- Toast Notification -->
    <div v-if="showToast" class="toast" :style="{ left: `${toastPosition.x}px`, top: `${toastPosition.y}px` }">
      {{ toastMessage }}
    </div>

    <header class="main-header">
      <h1>Styleguide</h1>
      <nav class="component-nav">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          :class="['nav-btn', { active: activeTab === tab.id }]">
          {{ tab.label }}
        </button>
      </nav>
    </header>

    <div class="component-container">
      <!-- Global Copy Hint -->
      <div v-if="activeTab === 'colors'" class="global-copy-hint">
        <p>Klik på variabelnavnet for at kopiere det til udklipsholderet</p>
      </div>

      <!-- Layout -->
      <div v-if="activeTab === 'layout'" class="tab-content">
        <section>
          <h2>Layout Grid</h2>
          <p class="description">Columns defined for breakpoints</p>

          <div class="grid-section">
            <div class="grid-type">
              <h3>COMPUTER</h3>
              <p>12 columns – 32px spacing (gutter) between columns</p>
              <div class="grid-container computer">
                <div v-for="n in 12" :key="n" class="grid-item styled">{{ n }}</div>
              </div>
            </div>

            <div class="grid-type">
              <h3>TABLET</h3>
              <p>Not relevant as users primarily use computers for administration and mobile for executing self-control at the units</p>
            </div>

            <div class="grid-type">
              <h3>RESPONSIVE</h3>
              <p>6 columns – 12px spacing (gutter) between columns</p>
              <div class="grid-container responsive">
                <div v-for="n in 6" :key="n" class="grid-item styled">{{ n }}</div>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2>Sizes & Spacing</h2>
          <p class="description">Use values divisible by 4 or 8. Apply to typography, buttons, spacing, etc. Some examples below.</p>
          <div class="spacing-values">
            <div class="px-labels">
              <span>Px:</span>
              <span>4</span>
              <span>8</span>
              <span>16</span>
              <span>24</span>
              <span>32</span>
              <span>40</span>
              <span>48</span>
              <span>56</span>
              <span>64</span>
              <span>80</span>
              <span>100</span>
            </div>

            <div class="size-bars">
              <div class="size-bar" style="width: 4px;"></div>
              <div class="size-bar" style="width: 8px;"></div>
              <div class="size-bar" style="width: 16px;"></div>
              <div class="size-bar" style="width: 24px;"></div>
              <div class="size-bar" style="width: 32px;"></div>
              <div class="size-bar" style="width: 40px;"></div>
              <div class="size-bar" style="width: 48px;"></div>
              <div class="size-bar" style="width: 56px;"></div>
              <div class="size-bar" style="width: 64px;"></div>
              <div class="size-bar" style="width: 80px;"></div>
              <div class="size-bar" style="width: 100px;"></div>
            </div>
          </div>
        </section>
      </div>

      <!-- Typography -->
      <div v-if="activeTab === 'typography'" class="tab-content">
        <section>
          <h2>Typography</h2>
          <div class="font-showcase">
            <div class="font-preview">
              <div class="font-sample">Aa</div>
              <div class="font-info">
                <h3>Source Sans Pro</h3>
                <a href="https://www.fontsquirrel.com/fonts/source-sans-pro" target="_blank" class="download-link">DOWNLOAD LINK</a>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2>BASE REM SIZE</h2>
          <p class="description">Helps with accessibility and responsiveness</p>
          <div class="rem-showcase">
            <div class="rem-display">
              <p>1 rem = 16px</p>
            </div>
          </div>
        </section>

        <section>
          <h2>DESKTOP</h2>
          <p class="description">Using the correct headings ensures the interface is easy to navigate for users</p>
          <div class="typography-showcase">
            <div class="type-item">
              <h1 class="heading-1">Heading 1</h1>
              <p class="type-specs">Source Sans Pro Bold, 60px, Line height 72, Letter spacing 0.75%</p>
              <p class="type-usage">Used only for headings on the landing page (level 1) under each menu item</p>
            </div>

            <div class="type-item">
              <h2 class="heading-2">Heading 2</h2>
              <p class="type-specs">Source Sans Pro Bold, 48px, Line height 64</p>
              <p class="type-usage">Used only for headings on create and edit pages (level 2)</p>
            </div>

            <div class="type-item">
              <h3 class="heading-3">Heading 3</h3>
              <p class="type-specs">Source Sans Pro Semibold, 40px, Line height 48</p>
              <p class="type-usage">Used only for headings in forms on create and edit pages</p>
            </div>

            <div class="type-item">
              <h4 class="subtitle-1">Subtitle 1</h4>
              <p class="type-specs">Source Sans Pro Regular, 28px, Line height 40</p>
              <p class="type-usage">Used only for headings in the sidebar, both for level 1 and 2 in the sidebar and menu items</p>
            </div>

            <div class="type-item">
              <h5 class="subtitle-2">SUBTITLE 2</h5>
              <p class="type-specs">Source Sans Pro Bold, 18px, Line height 28, Letter spacing 0.4%</p>
              <p class="type-usage">Used for subheadings in the sidebar e.g., Preview, Files, History, QR Codes and month in calendar</p>
            </div>
          </div>
        </section>

        <section>
          <h2>BODY TYPOGRAPHY</h2>
          <p class="description">Variations of these are used for the rest of the text in the system</p>

          <div class="typography-showcase">
            <div class="type-item">
              <p class="body-1-semibold">Body 1 (SemiBold)</p>
              <p class="type-specs">Source Sans Pro Semibold, 18px, Line height 28</p>
              <p class="body-1-semibold">This is an example of Body 1 SemiBold text styling.</p>
            </div>

            <div class="type-item">
              <p class="body-1-regular">Body 1 (Regular)</p>
              <p class="type-specs">Source Sans Pro Regular, 18px, Line height 28</p>
              <p class="body-1-regular">This is an example of Body 1 Regular text styling.</p>
            </div>

            <div class="type-item">
              <p class="body-2-semibold">Body 2 (SemiBold)</p>
              <p class="type-specs">Source Sans Pro Semibold, 16px, Line height 24</p>
              <p class="body-2-semibold">This is an example of Body 2 SemiBold text styling.</p>
            </div>

            <div class="type-item">
              <p class="body-2-regular">Body 2 (Regular)</p>
              <p class="type-specs">Source Sans Pro Regular, 16px, Line height 24</p>
              <p class="body-2-regular">This is an example of Body 2 Regular text styling.</p>
            </div>

            <div class="type-item">
              <p class="body-3-regular">Body 3 (Regular)</p>
              <p class="type-specs">Source Sans Pro Regular, 14px, Line height 20</p>
              <p class="body-3-regular">This is an example of Body 3 Regular text styling.</p>
            </div>
          </div>
        </section>
      </div>

      <!-- Colors -->
      <div v-if="activeTab === 'colors'" class="tab-content">
        <section>
          <h2>Primary Colors (Green)</h2>
          <p class="description">This color is only used for buttons - Primary, secondary and tertiary</p>
          <div class="color-grid">
            <div class="color-item" v-for="n in [900, 800, 700, 600, 500, 400, 300, 200, 100]" :key="n">
              <div class="color-preview" :class="`primary-${n}`"></div>
              <p>Primary {{ n }}</p>
              <code @click="copyVariable(`$primary-${n}`, $event)" class="clickable-code">$primary-{{ n }}</code>
            </div>
          </div>
        </section>

        <section>
          <h2>Secondary Colors (Blue)</h2>
          <p class="description">Used to highlight elements and only appears on interactive elements</p>
          <div class="color-grid">
            <div class="color-item" v-for="n in [900, 800, 700, 600, 500, 400, 300, 200, 100, 50, 25]" :key="n">
              <div class="color-preview" :class="`secondary-${n}`"></div>
              <p>Secondary {{ n }}</p>
              <code @click="copyVariable(`$secondary-${n}`, $event)" class="clickable-code">$secondary-{{ n }}</code>
            </div>
          </div>
        </section>

        <section>
          <h2>Neutral Colors</h2>
          <p class="description">Used for boxes and backgrounds</p>
          <div class="color-grid">
            <div class="color-item" v-for="n in [900, 800, 700, 600, 500, 400, 300, 200, 100]" :key="n">
              <div class="color-preview" :class="`neutral-${n}`"></div>
              <p>Neutral {{ n }}</p>
              <code @click="copyVariable(`$neutral-${n}`, $event)" class="clickable-code">$neutral-{{ n }}</code>
            </div>
          </div>
        </section>

        <section>
          <h2>System Colors</h2>
          <div class="color-grid system-colors">
            <!-- Error Colors -->
            <p class="description full-width">Used only for error messages, delete button, and deviation boxes</p>
            <div class="color-item" v-for="variant in ['warning', 'success', '600', '500', 'base', '400', '300', '200', '100']" :key="'error-'+variant">
              <div class="color-preview" :class="`error-${variant}`"></div>
              <p>Error {{ variant }}</p>
              <code @click="copyVariable(`$error-${variant}`, $event)" class="clickable-code">$error-{{ variant }}</code>
            </div>

            <!-- Warning Colors -->
            <p class="description full-width">Used only for warning messages, e.g., in checklist creation and when exceeding deadlines</p>
            <div class="color-item" v-for="variant in ['base', '400', '300', '200', '100']" :key="'warning-'+variant">
              <div class="color-preview" :class="`warning-${variant}`"></div>
              <p>Warning {{ variant }}</p>
              <code @click="copyVariable(`$warning-${variant}`, $event)" class="clickable-code">$warning-{{ variant }}</code>
            </div>

            <!-- Success Colors -->
            <p class="description full-width">Used for success messages</p>
            <div class="color-item" v-for="variant in ['base', '400', '300', '200', '100']" :key="'success-'+variant">
              <div class="color-preview" :class="`success-${variant}`"></div>
              <p>Success {{ variant }}</p>
              <code @click="copyVariable(`$success-${variant}`, $event)" class="clickable-code">$success-{{ variant }}</code>
            </div>
          </div>
        </section>

        <section>
          <h2>Transparency</h2>
          <p class="description">This rule can be applied to every color seen on these palettes. For example, you can apply this scale to the color Neutral 900. The same rule should also be applied to components such as buttons, icons, etc.</p>
          <div class="color-grid transparency">
            <div class="color-item" v-for="opacity in [100, 80, 64, 56, 40, 24, 16, 8, 4]" :key="opacity">
              <div class="color-preview" :style="{ backgroundColor: '#000000', opacity: opacity/100 }"></div>
              <p>{{ opacity }}%</p>
              <code @click="copyVariable(`$opacity-${opacity}`, $event)" class="clickable-code">$opacity-{{ opacity }}</code>
            </div>
          </div>
        </section>
      </div>

      <!-- Iconography -->
      <div v-if="activeTab === 'iconography'" class="tab-content">
        <section>
          <h2>Icons</h2>
          <p class="description">Available in 4 sizes – Small, Medium, Large and Extra Large. Icons are from <a href="https://tabler.io/icons" target="_blank" class="link">Tabler Icons</a> (open-source icon library)</p>
          <!-- X-Small -->
          <div class="icon-section">
            <h3>X-SMALL</h3>
            <p class="specs">12px - Padding: 12px - Corners: 4px</p>
            <div class="icon-preview">
              <span class="icon x-small">
                <component :is="icons[0].component" />
              </span>
            </div>
          </div>

          <!-- Small -->
          <div class="icon-section">
            <h3>SMALL</h3>
            <p class="specs">20px - Padding: 16px - Corners: 4px</p>
            <div class="icon-preview">
              <span class="icon small">
                <component :is="icons[0].component" />
              </span>
            </div>
          </div>

          <!-- Medium -->
          <div class="icon-section">
            <h3>MEDIUM</h3>
            <p class="specs">32px - Padding: 12px - Corners: 6px</p>
            <div class="icon-grid">
              <div v-for="icon in icons" :key="icon.name" class="icon-item">
                <span class="icon medium">
                  <component :is="icon.component" />
                </span>
                <p>{{ icon.name }}</p>
              </div>
            </div>
          </div>

          <!-- Large -->
          <div class="icon-section">
            <h3>LARGE</h3>
            <p class="specs">40px - Padding: 12px - Corners: 8px</p>
            <div class="icon-preview">
              <span class="icon large">
                <component :is="icons[0].component" />
              </span>
            </div>
          </div>

          <!-- Extra Large -->
          <div class="icon-section">
            <h3>EXTRA LARGE</h3>
            <p class="specs">56px - Padding: 12px - Corners: 8px</p>
            <div class="icon-preview">
              <span class="icon x-large">
                <component :is="icons[0].component" />
              </span>
            </div>
          </div>

          <!-- Icon States -->
          <div class="icon-section">
            <h3>ICON STATES</h3>
            <div class="icon-states">
              <div class="state-item">
                <span class="icon medium">
                  <component :is="icons[0].component" />
                </span>
                <p>No padding</p>
              </div>
              <div class="state-item">
                <span class="icon medium clear">
                  <component :is="icons[0].component" />
                </span>
                <p>Clear</p>
              </div>
              <div class="state-item">
                <span class="icon medium filled">
                  <component :is="icons[0].component" />
                </span>
                <p>Filled</p>
              </div>
              <div class="state-item">
                <span class="icon medium hover">
                  <component :is="icons[0].component" />
                </span>
                <p>Hover/Focus</p>
              </div>
              <div class="state-item">
                <span class="icon medium pressed">
                  <component :is="icons[0].component" />
                </span>
                <p>Press</p>
              </div>
              <div class="state-item">
                <span class="icon medium disabled">
                  <component :is="icons[0].component" />
                </span>
                <p>Disabled</p>
              </div>
            </div>
          </div>

          <!-- Icon Buttons -->
          <div class="icon-section">
            <h3>ICON BUTTONS</h3>
            <p class="specs">Interactive icon buttons for UI use. Hover over the buttons to see hover state.</p>

            <div class="interactive-demo">
              <div class="demo-row">
                <h4>Standard Icon Buttons</h4>
                <div class="button-group">
                  <button class="icon-button small" title="Small Icon Button">
                    <component :is="icons[22].component" /> <!-- Plus ikon -->
                  </button>
                  <button class="icon-button medium" title="Medium Icon Button">
                    <component :is="icons[22].component" /> <!-- Plus ikon -->
                  </button>
                  <button class="icon-button large" title="Large Icon Button">
                    <component :is="icons[22].component" /> <!-- Plus ikon -->
                  </button>
                </div>
              </div>

              <div class="demo-row">
                <h4>Disabled Icon Buttons</h4>
                <div class="button-group">
                  <button class="icon-button small disabled" title="Small Disabled Icon Button" disabled>
                    <component :is="icons[22].component" /> <!-- Plus ikon -->
                  </button>
                  <button class="icon-button medium disabled" title="Medium Disabled Icon Button" disabled>
                    <component :is="icons[22].component" /> <!-- Plus ikon -->
                  </button>
                  <button class="icon-button large disabled" title="Large Disabled Icon Button" disabled>
                    <component :is="icons[22].component" /> <!-- Plus ikon -->
                  </button>
                </div>
              </div>

              <div class="demo-row">
                <h4>Different Icons</h4>
                <div class="button-group">
                  <button class="icon-button medium" title="Plus">
                    <component :is="icons[22].component" /> <!-- Plus ikon -->
                  </button>
                  <button class="icon-button medium" title="Pencil">
                    <component :is="icons[21].component" /> <!-- Pencil ikon -->
                  </button>
                  <button class="icon-button medium" title="Trash">
                    <component :is="icons[27].component" /> <!-- Trash ikon -->
                  </button>
                  <button class="icon-button medium" title="Check">
                    <component :is="icons[5].component" /> <!-- Check ikon -->
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <!-- Effects -->
      <div v-if="activeTab === 'effects'" class="tab-content">
        <section>
          <h2>Round Corners</h2>
          <div class="corners-grid">
            <div class="corner-item">
              <div class="corner-preview radius-2xl"></div>
              <p>12px for section boxes</p>
            </div>
            <div class="corner-item">
              <div class="corner-preview radius-lg"></div>
              <p>8px for inputs and system notifications</p>
            </div>
            <div class="corner-item">
              <div class="corner-preview radius-sm"></div>
              <p>4px for icons and buttons</p>
            </div>
          </div>
        </section>

        <section>
          <h2>Borders</h2>
          <div class="borders-grid">
            <div class="border-item">
              <div class="border-preview neutral"></div>
              <p>Neutral/300</p>
            </div>
            <div class="border-item">
              <div class="border-preview error"></div>
              <p>Error/200</p>
            </div>
            <div class="border-item">
              <div class="border-preview warning"></div>
              <p>Warning/200</p>
            </div>
            <div class="border-item">
              <div class="border-preview success"></div>
              <p>Success/200</p>
            </div>
            <div class="border-item">
              <div class="border-preview blue"></div>
              <p>Blue/300</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '@/assets/variables' as *;
@use '@/assets/icons' as *;
@use '@/assets/layout' as *;
@import url('https://fonts.googleapis.com/css2?family=Source+Sans+Pro:ital,wght@0,200;0,300;0,400;0,600;0,700;0,900;1,200;1,300;1,400;1,600;1,700;1,900&display=swap');

.styleguide {
  min-height: 100vh;
  background-color: #f5f5f5;
  font-family: $font-family-base;
  color: $neutral-700;
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
  max-width: 1600px;
  margin: 2rem auto;
  padding: 0 1.5rem;
}

h1, h2, h3, h4, h5, p {
  font-family: $font-family-base;
}

h2 {
  font-size: $h2-font-size;
  font-weight: $h2-font-weight;
  color: $neutral-800;
  margin-top: $spacing-large;
  margin-bottom: $spacing-xs;
}

h3 {
  font-size: $body-1-font-size;
  font-weight: $body-1-font-weight-semibold;
  color: $neutral-800;
  margin-top: $spacing-large;
  margin-bottom: $spacing-2xs;
}

p {
  margin-bottom: $spacing-small;
}

.description {
  color: $neutral-600;
  margin-bottom: $spacing-medium;
}

section {
  background: white;
  border-radius: $border-radius-2xl;
  padding: $spacing-large;
  margin-bottom: $spacing-large;
  box-shadow: $shadow-md;
}

.grid-container {
  margin: 0 auto $spacing-medium;
  width: 100%;
  max-width: 1600px;
}

.grid-item.styled {
  height: 200px;
  background-color: $secondary-100;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0;
  font-weight: $body-1-font-weight-semibold;
  color: $neutral-800;

  &:hover {
    background-color: $secondary-200;
  }
}

.grid-section {
  display: flex;
  flex-direction: column;
  gap: $spacing-medium;
  margin-bottom: $spacing-large;
}

.grid-type {
  margin-bottom: $spacing-medium;
}

.spacing-values {
  background-color: $neutral-100;
  padding: $spacing-medium;
  border-radius: 0;
}

.px-labels {
  display: flex;
  padding: $spacing-xs 0;
  border-bottom: 1px solid $neutral-200;
  margin-bottom: $spacing-small;
}

.px-labels span {
  margin-right: $spacing-small;
}

.px-labels span:first-child {
  font-weight: $body-1-font-weight-semibold;
  color: $neutral-800;
}

.px-labels span:not(:first-child) {
  width: 32px;
  text-align: center;
}

.px-labels span:last-child {
  margin-right: 0;
}

.size-bars {
  display: flex;
  margin-top: $spacing-small;
}

.size-bar {
  height: 32px;
  background-color: $secondary-100;
  margin-right: $spacing-small;
  border-radius: 0;

  &:last-child {
    margin-right: 0;
  }
}

.color-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
  gap: $spacing-small;
  margin-bottom: $spacing-medium;
}

.color-grid.system-colors {
  margin-top: $spacing-medium;
}

.full-width {
  grid-column: 1 / -1;
  margin-top: $spacing-large;
  margin-bottom: $spacing-small;
}

.color-item .color-preview {
  width: 80px;
  height: 80px;
  border-radius: $border-radius-xl;
  margin-bottom: $spacing-small;
  box-shadow: $shadow-md;
  transition: $transition-base;

  &:hover {
    transform: scale(1.05);
  }
}

.color-item p {
  margin: calc($spacing-small / 2) 0;
  font-size: $body-3-font-size;
}

.color-item code {
  background-color: $neutral-200;
  padding: $spacing-2xs $spacing-xs;
  border-radius: $border-radius-sm;
  font-size: $body-3-font-size;
  color: $neutral-600;
  font-family: $font-family-mono;
}

.clickable-code {
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: $neutral-300;
    color: $neutral-900;
  }
}

.icon-section {
  margin-bottom: $spacing-large;
}

.icon-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: $spacing-medium;
}

.icon-preview {
  display: inline-flex;
  align-items: center;
  justify-content: left;
  min-width: 120px;
  min-height: 120px;
}

.icon-states {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: $spacing-large;
}

.icon-item, .state-item {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
}

.icon-item .icon, .state-item .icon {
  margin-bottom: $spacing-small;
}

.icon-item p, .state-item p {
  font-size: $body-3-font-size;
  color: $neutral-600;
  margin: 0;
}

.specs {
  font-size: $body-2-font-size;
  color: $neutral-600;
  margin-bottom: $spacing-medium;
}

.typography-showcase .type-item {
  margin-bottom: $spacing-medium;
  padding: $spacing-medium;
  border-radius: $border-radius-lg;
  background: $neutral-100;
}

.type-specs {
  color: $neutral-600;
  font-size: $body-3-font-size;
  margin-top: $spacing-small;
}

.type-usage {
  color: $neutral-500;
  font-size: $body-3-font-size;
  margin-top: calc($spacing-small / 2);
  font-style: italic;
}

.font-showcase .font-preview {
  display: flex;
  align-items: center;
  background: $secondary-50;
  padding: $spacing-large;
  border-radius: $border-radius-2xl;
}

.font-sample {
  background: $secondary-200;
  width: 120px;
  height: 120px;
  border-radius: $border-radius-2xl;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: $h2-font-size;
  color: white;
  margin-right: $spacing-large;
}

.font-info h3 {
  font-size: $h2-font-size;
  margin-bottom: $spacing-small;
  color: $neutral-900;
}

.font-info p {
  font-size: $body-1-font-size;
  color: $neutral-600;
  margin-bottom: $spacing-small;
}

.download-link {
  color: $secondary-400;
  text-decoration: none;
  font-weight: $body-1-font-weight-semibold;
  &:hover {
    text-decoration: underline;
  }
}

.rem-showcase .rem-display {
  background: $neutral-900;
  color: white;
  padding: $spacing-large;
  border-radius: $border-radius-2xl;
}

.rem-display p {
  font-size: $h3-font-size;
  font-weight: $body-1-font-weight-semibold;
}

.corners-grid, .borders-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: $spacing-large;
  margin-bottom: $spacing-large;
  align-items: start;
}

.corner-item, .border-item {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-top: $spacing-medium;
}

.corner-preview {
  width: 100px;
  height: 100px;
  background: $neutral-900;
  border-radius: $border-radius-lg;
  margin-bottom: $spacing-medium;

  &.radius-2xl {
    border-radius: $border-radius-2xl;
  }

  &.radius-lg {
    border-radius: $border-radius-lg;
  }

  &.radius-sm {
    border-radius: $border-radius-sm;
  }
}

.border-preview {
  width: 100px;
  height: 100px;
  background: $neutral-100;
  border-radius: $border-radius-lg;
  margin-bottom: $spacing-medium;
}

.border-preview.neutral { border: 1px solid $neutral-300; }
.border-preview.error { border: 1px solid $error-200; }
.border-preview.warning { border: 1px solid $warning-200; }
.border-preview.success { border: 1px solid $success-200; }
.border-preview.blue { border: 1px solid $secondary-300; }

.color-preview.primary-900 { background-color: $primary-900; }
.color-preview.primary-800 { background-color: $primary-800; }
.color-preview.primary-700 { background-color: $primary-700; }
.color-preview.primary-600 { background-color: $primary-600; }
.color-preview.primary-500 { background-color: $primary-500; }
.color-preview.primary-400 { background-color: $primary-400; }
.color-preview.primary-300 { background-color: $primary-300; }
.color-preview.primary-200 { background-color: $primary-200; }
.color-preview.primary-100 { background-color: $primary-100; }

.color-preview.secondary-900 { background-color: $secondary-900; }
.color-preview.secondary-800 { background-color: $secondary-800; }
.color-preview.secondary-700 { background-color: $secondary-700; }
.color-preview.secondary-600 { background-color: $secondary-600; }
.color-preview.secondary-500 { background-color: $secondary-500; }
.color-preview.secondary-400 { background-color: $secondary-400; }
.color-preview.secondary-300 { background-color: $secondary-300; }
.color-preview.secondary-200 { background-color: $secondary-200; }
.color-preview.secondary-100 { background-color: $secondary-100; }
.color-preview.secondary-50 { background-color: $secondary-50; }
.color-preview.secondary-25 { background-color: $secondary-25; }

.color-preview.neutral-900 { background-color: $neutral-900; }
.color-preview.neutral-800 { background-color: $neutral-800; }
.color-preview.neutral-700 { background-color: $neutral-700; }
.color-preview.neutral-600 { background-color: $neutral-600; }
.color-preview.neutral-500 { background-color: $neutral-500; }
.color-preview.neutral-400 { background-color: $neutral-400; }
.color-preview.neutral-300 { background-color: $neutral-300; }
.color-preview.neutral-200 { background-color: $neutral-200; }
.color-preview.neutral-100 { background-color: $neutral-100; }

.color-preview.error-warning { background-color: $error-warning; }
.color-preview.error-success { background-color: $error-success; }
.color-preview.error-600 { background-color: $error-600; }
.color-preview.error-500 { background-color: $error-500; }
.color-preview.error-base { background-color: $error-base; }
.color-preview.error-400 { background-color: $error-400; }
.color-preview.error-300 { background-color: $error-300; }
.color-preview.error-200 { background-color: $error-200; }
.color-preview.error-100 { background-color: $error-100; }

.color-preview.warning-base { background-color: $warning-base; }
.color-preview.warning-400 { background-color: $warning-400; }
.color-preview.warning-300 { background-color: $warning-300; }
.color-preview.warning-200 { background-color: $warning-200; }
.color-preview.warning-100 { background-color: $warning-100; }

.color-preview.success-base { background-color: $success-base; }
.color-preview.success-400 { background-color: $success-400; }
.color-preview.success-300 { background-color: $success-300; }
.color-preview.success-200 { background-color: $success-200; }
.color-preview.success-100 { background-color: $success-100; }

.link {
  color: $secondary-400;
  text-decoration: none;
  &:hover {
    text-decoration: underline;
  }
}

/* Stilarter til ikonknap-demo */
.interactive-demo {
  background: $neutral-100;
  border-radius: $border-radius-lg;
  padding: $spacing-medium;
}

.demo-row {
  margin-bottom: $spacing-large;

  &:last-child {
    margin-bottom: 0;
  }

  h4 {
    font-size: $body-2-font-size;
    font-weight: $body-1-font-weight-semibold;
    margin-bottom: $spacing-medium;
    color: $neutral-800;
  }
}

.button-group {
  display: flex;
  align-items: center;
  gap: $spacing-medium;
  flex-wrap: wrap;

  button {
    border: none;
    cursor: pointer;
    transition: transform 0.2s ease;

    &:hover:not(:disabled) {
      transform: scale(1.05);
    }

    &:active:not(:disabled) {
      transform: scale(0.95);
    }
  }
}

.global-copy-hint {
  background-color: $secondary-50;
  padding: $spacing-small $spacing-medium;
  border-radius: $border-radius-sm;
  margin-bottom: $spacing-medium;
  text-align: center;

  p {
    margin: 0;
    font-size: $body-3-font-size;
    color: $neutral-700;
  }
}

.toast {
  position: fixed;
  background-color: rgba($neutral-900, 0.9);
  color: white;
  padding: $spacing-2xs $spacing-small;
  border-radius: $border-radius-sm;
  font-size: $body-3-font-size;
  z-index: 1000;
  animation: fadeIn 0.2s ease-out;
  transform: translate(10px, -100%);
  margin-top: -8px;
  pointer-events: none;
  backdrop-filter: blur(4px);
  box-shadow: $shadow-md;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translate(10px, -100%) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translate(10px, -100%) scale(1);
  }
}
</style>
