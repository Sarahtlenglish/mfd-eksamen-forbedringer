<script setup>
import BasePanel from '@/components/ui/panels/BasePanelComponent.vue'
import ButtonComponent from '@/components/ui/ButtonComponent.vue'
import FilterButtonComponent from '@/components/ui/FilterButtonComponent.vue'
import { IconPlus } from '@tabler/icons-vue'

const handleFilterClick = () => {
  // Handle filter click
  console.log ('Filter clicked')
}

const handleCreateGruppe = () => {
  console.log('Create group')
  // Implement create functionality
}
</script>

<template>
  <BasePanel>
    <!-- Header - Match the structure of DetailPanelComponent -->
    <template #header>
      <div class="detail-panel-header">
        <div class="detail-title-container no-back-button">
          <h2 class="detail-title">Grupper</h2>
        </div>
        <div class="detail-actions">
          <ButtonComponent
            size="small"
            variant="tertiary"
            @click="handleCreateGruppe"
          >
            <template #icon>
              <IconPlus />
            </template>
            Opret Gruppe
          </ButtonComponent>
        </div>
      </div>
    </template>

    <template #default>
      <div class="filter-container">
        <FilterButtonComponent
          text="Alle"
          :full-width="true"
          :show-icon="false"
          @click="handleFilterClick"
        />
        <FilterButtonComponent
          text="Facility"
          :full-width="true"
          @click="handleFilterClick"
        />
        <FilterButtonComponent
          text="Admin"
          :full-width="true"
          @click="handleFilterClick"
        />
        <FilterButtonComponent
          text="Eksterne"
          :full-width="true"
          @click="handleFilterClick"
        />
      </div>

      <!-- Use the same header structure for the "Roller" section -->
      <div class="detail-panel-header">
        <div class="detail-title-container no-back-button">
          <h2 class="detail-title">Roller</h2>
        </div>
      </div>

      <div class="filter-container">
        <FilterButtonComponent
          text="Administrator"
          :full-width="true"
          :show-icon="false"
          @click="handleFilterClick"
        />
        <FilterButtonComponent
          text="Facility Manager"
          :full-width="true"
          :show-icon="false"
          @click="handleFilterClick"
        />
        <FilterButtonComponent
          text="Service Bruger"
          :full-width="true"
          :show-icon="false"
          @click="handleFilterClick"
        />
        <FilterButtonComponent
          text="Visnings Bruger"
          :full-width="true"
          :show-icon="false"
          @click="handleFilterClick"
        />
      </div>
    </template>
  </BasePanel>
</template>

<style lang="scss" scoped>
@use '@/assets/variables' as *;
@use '@/assets/icons' as *;

.detail-panel-header {
  display: flex;
  align-items: center;
  margin-bottom: $spacing-large;
  width: 100%;

  .detail-title-container {
    flex: 1;

    &.no-back-button {
      text-align: left;
    }

    .detail-title {
      margin: 0;
      line-height: $subtitle-1-line-height;
      font-size: $subtitle-1-font-size;
      color: $secondary-900;
      font-weight: $subtitle-1-font-weight;
    }
  }

  .detail-actions {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-left: auto;
  }
}

.filter-container {
  display: flex;
  flex-direction: column;
  gap: $spacing-medium;
  margin-bottom: $spacing-large;

  &:last-child {
    margin-bottom: 0;
  }
}
</style>
