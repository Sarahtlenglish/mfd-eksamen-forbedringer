<script setup>
const weekDays = ['Man', 'Tirs', 'Ons', 'Tors', 'Fre', 'Lør', 'Søn']
</script>

<template>
  <div class="weekdays-header">
    <div
      v-for="day in weekDays"
      :key="day"
      class="weekday"
    >
      {{ day }}
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '@/assets/variables' as *;

.weekdays-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  padding: 6px 0;
  background: $neutral-200;
  border-bottom: 1px solid $neutral-300;
}

.weekday {
  text-align: left;
  padding: 4px 0px 4px 8px;
  font-size: 13px;
  font-weight: 500;
  color: $neutral-700;
}
</style>
