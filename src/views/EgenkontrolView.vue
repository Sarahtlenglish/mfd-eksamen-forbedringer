<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import TableComponent from '@/components/ui/TableComponent.vue'

const route = useRoute()

const pageTitle = computed(() => {
  const routeNames = {
    '/home': 'Kalender',
    '/egenkontrol': 'Egenkontrol',
    '/tjeklister': 'Tjeklister',
    '/enheder': 'Enheder',
    '/brugere': 'Brugere'
  }
  return routeNames[route.path] || 'Dashboard'
})
</script>

<template>
  <div>
    <h1 class="heading-1">{{ pageTitle }}</h1>
  </div>
  <TableComponent />
</template>
