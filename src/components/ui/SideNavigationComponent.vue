<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { IconCalendarEvent, IconClipboardText, IconListDetails, IconFireExtinguisher, IconUsers } from '@tabler/icons-vue'
import '@/views/StyleguideView.vue'

const router = useRouter();

// Updated menuItems to match your router configuration
const menuItems = ref([
  { name: 'Kalender', route: '/home', icon: IconCalendarEvent, isComponent: true},
  { name: 'Egenkontrol', route: '/egenkontrol', icon: IconClipboardText, isComponent: true},
  { name: 'Tjeklister', route: '/tjeklister', icon: IconListDetails, isComponent: true},
  { name: 'Enheder', route: '/enheder', icon: IconFireExtinguisher, isComponent: true},
  { name: 'Brugere', route: '/brugere', icon: IconUsers, isComponent: true},
]);


// Function to determine if route is active
const isActive = (route) => {
  return router.currentRoute.value.path === route;
};
</script>

<template>
  <aside class="side-navigation">
    <router-link to="/" class="logo">
      <img src='@/assets/logo.svg?url' alt="DBI logo">
    </router-link>
    <nav class="menu">
      <ul>
        <li v-for="item in menuItems" :key="item.name">
          <router-link :to="item.route" class="menu-item" :class="{ active: isActive(item.route) }">
            <div class="menu-item-container">
              <span v-if="item.isComponent" class="icon medium clear">
                <component :is="item.icon" class="menu-color" />
              </span>
              <span class="subtitle-1">{{ item.name }}</span>
            </div>
          </router-link>
        </li>
      </ul>
    </nav>
  </aside>
</template>

<style lang="scss" scoped>
@use '@/assets/variables' as *;

.side-navigation {
  width: 250px;
  height: 100vh;
  background-color: $neutral-200;
  border-right: 1px solid $neutral-300;
  position: fixed;
  left: 0;
  top: 0;
  overflow-y: auto;
  z-index: 100;
}

.logo {
  display: flex;
  justify-content: center;
  padding: 16px 0;
}

.menu {
  padding: 16px 0;
}

.menu ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.menu-item-container {
  display: flex;
  flex-direction: row;
  gap: 16px;
  align-items: center;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 16px 24px;
  color: $secondary-900;
  text-decoration: none;
  transition: background-color 0.3s;
  border-bottom: 1px solid $neutral-300;
}

.menu-item:hover {
  background-color: #EAF1F6;
}

.menu-item.active {
  background-color: #DCEBF4;
  font-weight: 500;
}
</style>
