<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { IconCalendarEvent } from '@tabler/icons-vue'
import '@/views/StyleguideView.vue'

const router = useRouter();

// Updated menuItems to match your router configuration
const menuItems = ref([
  { name: 'Kalender', route: '/home', icon: IconCalendarEvent, isComponent: true},
  { name: 'Egenkontrol', route: '/egenkontrol', icon: new URL('@/assets/images/egenkontrol-icon.svg', import.meta.url).href },
  { name: 'Checklister', route: '/checklister', icon: new URL('@/assets/images/checklister-icon.svg', import.meta.url).href },
  { name: 'Enheder', route: '/enheder', icon: new URL('@/assets/images/enheder-icon.svg', import.meta.url).href },
  { name: 'Brugere', route: '/brugere', icon: new URL('@/assets/images/brugere-icon.svg', import.meta.url).href },
]);

// Function to determine if route is active
const isActive = (route) => {
  return router.currentRoute.value.path === route;
};
</script>

<template>
  <aside class="side-navigation">
      <div class="logo">
        <img src="@/images/DBI-Logo.png" alt="DBI logo">
      </div>
    <nav class="menu">
      <ul>
        <li v-for="item in menuItems" :key="item.name">
          <router-link :to="item.route" class="menu-item" :class="{ active: isActive(item.route) }">
            <div class="menu-item-container">
              <component v-if="item.isComponent" :is="item.icon" class="menu-icons icon medium" />
              <span class="menu-text">{{ item.name }}</span>
            </div>
          </router-link>
        </li>
      </ul>
    </nav>
  </aside>
</template>

<style scoped>
@import '@/assets/_icons.scss';

.side-navigation {
  width: 250px;
  height: 100vh;
  background-color: #F7F7F7;
  border-right: 1px solid #D1D3D4;
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

.menu-icons {
  color: #4B97C0;
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
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 16px 24px;
  color: #0d1c24;
  text-decoration: none;
  transition: background-color 0.3s;
  border-bottom: 1px solid #D1D3D4;
}

.menu-item:hover {
  background-color: #EAF1F6;
}

.menu-item.active,
.router-link-active {
  background-color: #DCEBF4;
  font-weight: 500;
}


.menu-text {
  font-size: 28px;
}
</style>
