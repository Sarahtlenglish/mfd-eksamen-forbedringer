<script setup>
import BasePanel from '@/components/ui/panels/BasePanelComponent.vue'
import ButtonComponent from '@/components/ui/ButtonComponent.vue'
import FilterButtonComponent from '@/components/ui/FilterButtonComponent.vue'
import { IconPlus } from '@tabler/icons-vue'

const handleFilterClick = () => {
  // Handle filter click
  console.log ('Filter clicked')
}
</script>

<template>
  <BasePanel>
  <template #header>
    <div class="detail-panel-header">
      <div class="detail-title-container">
        <h2 class="detail-title">Grupper</h2>
        <ButtonComponent
          size="small"
          variant="tertiary"
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
    <div class="detail-panel-header rolle-panel-header">
      <div class="detail-title-container">
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

.detail-panel-header {
  margin-bottom: $spacing-large;

  .detail-title-container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    flex-direction: row;

    .detail-title {
      flex: 1;
      margin: 0;
      line-height: $subtitle-1-line-height;
      font-size: $subtitle-1-font-size;
      color: $secondary-900;
      font-weight: $subtitle-1-font-weight;
    }
  }
}

.rolle-panel-header {
  margin-top: $spacing-large;
}

.filter-container {
  display: flex;
  flex-direction: column;
  gap: $spacing-medium;
}
</style>
