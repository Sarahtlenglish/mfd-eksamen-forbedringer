<script setup>
import SideNavigation from '@/components/ui/SideNavigationComponent.vue'
import Header from '@/components/ui/HeaderComponent.vue'
</script>

<template>
  <div class="app-container">
    <SideNavigation />
    <div class="main-content">
      <Header />
      <main class="content-area">
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

.main-content {
  flex: 1;
  margin-left: 250px; /* Match the width of side navigation */
}

.content-area {
  padding: 24px;
  margin-top: 70px; /* Match the height of the header */
}
</style>
