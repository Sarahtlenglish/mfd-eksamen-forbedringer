<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { routes } from '@/router'
import { IconChevronLeftPipe, IconChevronRightPipe } from '@tabler/icons-vue'

const router = useRouter()
const isCollapsed = ref(window.innerWidth <= 1024)
let userToggled = false

const menuItems = computed(() => {
  return routes.filter(route => route.meta?.showInNav)
})

const isActive = (route) => {
  return router.currentRoute.value.path === route
}

const setBodyClass = () => {
  document.body.classList.toggle('sidebar-collapsed', isCollapsed.value)
}

onMounted(() => {
  isCollapsed.value = window.innerWidth <= 1024
  setBodyClass()
  window.addEventListener('resize', () => {
    if (!userToggled) {
      isCollapsed.value = window.innerWidth <= 1024
      setBodyClass()
    }
  })
})

onUnmounted(() => {
  window.removeEventListener('resize', () => {
    if (!userToggled) {
      isCollapsed.value = window.innerWidth <= 1024
      setBodyClass()
    }
  })
})

const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value
  userToggled = true
  setBodyClass()
}
</script>

<template>
  <aside class="side-navigation" :class="{ collapsed: isCollapsed }">
    <div class="sidebar-header">
      <router-link to="/" class="logo">
        <img v-if="!isCollapsed" src='@/assets/logo.svg?url' alt="DBI logo" class="logo-img" />
        <img v-else src="/favicon.ico" alt="DBI favicon" class="favicon-img" />
      </router-link>
    </div>
    <nav class="menu">
      <ul>
        <li v-for="item in menuItems" :key="item.name">
          <router-link :to="item.path" class="menu-item" :class="{ active: isActive(item.path) }">
            <div class="menu-item-container">
              <span v-if="item.meta.icon" class="icon medium clear">
                <component :is="item.meta.icon" class="menu-color" />
              </span>
              <span class="subtitle-1" v-if="!isCollapsed">{{ item.meta.navName }}</span>
            </div>
          </router-link>
        </li>
      </ul>
    </nav>
    <button class="toggle-btn-bottom icon-button medium" @click="toggleSidebar">
      <component :is="isCollapsed ? IconChevronRightPipe : IconChevronLeftPipe" class="menu-color" />
    </button>
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
  display: flex;
  flex-direction: column;
  transition: width 0.3s;

  &.collapsed {
    width: 72px;
    .logo-img {
      display: none;
    }
    .favicon-img {
      display: block;
      width: 36px;
      height: 36px;
      margin: 0 auto;
      margin-top: 8px;
      margin-bottom: 8px;
    }
    .subtitle-1 {
      display: none !important;
    }
    .menu-item-container {
      justify-content: center;
    }
  }
}

.sidebar-header {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 16px 0;
}

.logo {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  .logo-img {
    width: 120px;
    height: auto;
    display: block;
  }
  .favicon-img {
    display: none;
  }
}

.menu {
  padding: 16px 0;
  flex: 1 1 auto;
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
  justify-content: flex-start;
  transition: justify-content 0.3s;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 16px 24px;
  color: $secondary-900;
  text-decoration: none;
  transition: background-color 0.3s;
  border-bottom: 1px solid $neutral-300;
  white-space: nowrap;
  overflow: hidden;
}

.menu-item:hover {
  background-color: $nav-hover;
}

.menu-item.active {
  background-color: $nav-active;
  font-weight: 500;
}

.toggle-btn-bottom {
  position: sticky;
  bottom: 0;
  width: 100%;
  background: #F7F7F7;
  border: none;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 10%;
  cursor: pointer;
  z-index: 10;
  border-top: 1px solid #D1D3D4;
  transition: background 0.2s;
  &:hover {
    background-color: $neutral-300;
  }
}

@media (max-width: $tablet) {
  .side-navigation {
    width: 200px;
    &.collapsed {
      width: 56px;
      max-height:100%;
      .favicon-img {
        width: 28px;
        height: 28px;
      }
    }
  }
  .logo-img {
    width: 90px !important;
  }
  .menu-item {
    padding: 12px 12px;
  }
}
</style>
