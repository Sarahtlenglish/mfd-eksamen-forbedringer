<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

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
    <h1>{{ pageTitle }}</h1>
  </div>
</template>
