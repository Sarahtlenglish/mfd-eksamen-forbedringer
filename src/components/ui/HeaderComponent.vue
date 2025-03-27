<script setup>
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

// Compute the page title based on the current route
const pageTitle = computed(() => {
  const routeNames = {
    '/home': 'Kalender',
    '/egenkontrol': 'Egenkontrol',
    '/checklister': 'Checklister',
    '/enheder': 'Enheder',
    '/brugere': 'Brugere'
  };
  
  return routeNames[route.path] || 'Dashboard';
});
</script>

<template>
  <header class="app-header">
    <div class="header-content">
      <h1 class="page-title">{{ pageTitle }}</h1>
      
      <div class="header-actions">
        <!-- Action buttons as before -->
        <button class="header-button">
            <img src="./images/notifikation-icon.svg" alt="">
        </button>
        
        <button class="header-button">
            <img src="./images/notifikation-icon.svg" alt="">
        </button>
        
        <button class="header-button">
            <img :src="printerIcon" alt="Printer">
        </button>
        
        <button class="header-button">
            <img :src="sporgsmaalIcon" alt="Hjælp">
        </button>
        
        <button class="header-button">
            <img :src="logoutIcon" alt="Log ud">
        </button>
      </div>
    </div>
  </header>
</template>

<style scoped>
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
  justify-content: space-between;
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
  gap: 16px;
}

.header-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
}

.header-button:hover {
  background-color: #F0F0F0;
}

.icon-placeholder {
  width: 24px;
  height: 24px;
  /* Remove this when you add your actual icons */
  background-color: #DDD;
  border-radius: 4px;
  display: block;
}
</style>