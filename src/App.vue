<script setup>
import SideNavigation from '@/components/navigation/SideNavigationComponent.vue'
import Header from '@/components/navigation/HeaderComponent.vue'
import { useRoute } from 'vue-router'

const route = useRoute()

// Tjekker om den aktuelle rute er /components eller /styleguide
const shouldHideNavigation = () => {
  return route.path === '/components' || route.path === '/styleguide'
}
</script>

<template>
  <div class="app-container" :class="{ 'no-nav': shouldHideNavigation() }">
    <SideNavigation v-if="!shouldHideNavigation()" />
    <div class="main-content" :class="{ 'full-width': shouldHideNavigation() }">
      <Header v-if="!shouldHideNavigation()" />
      <main class="content-area" :class="{ 'no-margin': shouldHideNavigation() }">
        <router-view />
      </main>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '@/assets/variables' as *;

body, html {
  margin: 0;
  padding: 0;
  font-family: $font-family-base;
  color: $neutral-700;
}

.app-container {
  display: flex;
}

.app-container.no-nav {
  display: block;
}

.main-content {
  flex: 1;
  margin-left: 250px; /* Match the width of side navigation */
}

.main-content.full-width {
  margin-left: 0;
}

.content-area {
  padding: $main-padding;
  margin-top: 70px; /* Match the height of the header */
  height: 100vh;
}

.content-area.no-margin {
  margin-top: 0;
}
</style>
