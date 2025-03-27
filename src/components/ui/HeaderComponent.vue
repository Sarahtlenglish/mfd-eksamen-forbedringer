<script setup>
import { IconBell, IconPrinter, IconQuestionMark, IconUser, IconLogout } from '@tabler/icons-vue'
import '@/views/StyleguideView.vue'
</script>

<template>
  <header class="app-header">
    <div class="header-content">
      <div class="header-actions">
        <!-- Action buttons as before -->
        <span class="icon medium">
          <IconBell class="menu-color" />
        </span>

        <span class="icon medium">
          <IconUser class="menu-color" />
        </span>

        <span class="icon medium">
          <IconPrinter class="menu-color" />
        </span>

        <span class="icon medium">
          <IconQuestionMark class="menu-color" />
        </span>

        <span class="icon medium">
          <IconLogout class="menu-color" />
        </span>
      </div>
    </div>
  </header>
</template>

<style scoped>
@import '@/assets/_icons.scss';

.app-header {
  position: fixed;
  top: 0;
  left: 250px; /* Match the width of the side navigation */
  right: 0;
  height: 72px;
  background-color: #f7f7f7;
  border-bottom: 1px solid #d1d3d4;
  z-index: 10;
}

.header-content {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 0 24px;
  height: 100%;
}

.page-title {
  font-size: 24px;
  font-weight: 500;
  color: #333;
  margin: 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 24px;
}
</style>
