<script setup>
import SideNavigation from '@/components/ui/SideNavigationComponent.vue'
import Header from '@/components/ui/HeaderComponent.vue'
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

<style>
body, html {
  margin: 0;
  padding: 0;
  font-family: Arial, sans-serif;
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
  padding: 24px;
  margin-top: 70px; /* Match the height of the header */
}

.content-area.no-margin {
  margin-top: 0;
}
</style>
