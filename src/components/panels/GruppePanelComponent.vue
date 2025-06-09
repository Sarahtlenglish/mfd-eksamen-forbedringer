<script setup>
import BasePanel from '@/components/panels/BasePanelComponent.vue'
import ButtonComponent from '@/components/ui/ButtonComponent.vue'
import FilterButtonComponent from '@/components/ui/FilterButtonComponent.vue'
import { IconPlus } from '@tabler/icons-vue'

const filterClicked = () => {
  alert('Filtreringsfunktionalitet er ikke implementeret endnu.')
}

const createGroup = () => {
  alert('Oprettelse af gruppe funktionalitet er ikke implementeret endnu.')
}
</script>

<template>
  <BasePanel>
    <template #header>
      <div class="detail-panel-header">
        <div class="detail-title-container no-back-button">
          <h2 class="detail-title">Grupper</h2>
        </div>
        <div class="detail-actions">
          <ButtonComponent
            size="small"
            variant="tertiary"
            @click="createGroup"
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
          @click="filterClicked"
        />
        <FilterButtonComponent
          text="Facility"
          :full-width="true"
          @click="filterClicked"
        />
        <FilterButtonComponent
          text="Admin"
          :full-width="true"
          @click="filterClicked"
        />
        <FilterButtonComponent
          text="Eksterne"
          :full-width="true"
          @click="filterClicked"
        />
      </div>

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
          @click="filterClicked"
        />
        <FilterButtonComponent
          text="Facility Manager"
          :full-width="true"
          :show-icon="false"
          @click="filterClicked"
        />
        <FilterButtonComponent
          text="Service Bruger"
          :full-width="true"
          :show-icon="false"
          @click="filterClicked"
        />
        <FilterButtonComponent
          text="Visnings Bruger"
          :full-width="true"
          :show-icon="false"
          @click="filterClicked"
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
