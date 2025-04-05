<script setup>
import { ref, computed } from 'vue'

// Define the table data
const inspections = ref([
  { id: 1, name: 'Reparer slangevinder - A1.27', type: 'Opgave' },
  { id: 2, name: 'Håndtrykskap inspektion', type: 'Egenkontrol' },
  { id: 3, name: 'Branddørs inspektion', type: 'Egenkontrol' },
  { id: 4, name: 'Flugtvejsskilt inspektion', type: 'Egenkontrol' },
  { id: 5, name: 'Brandtrappe inspektion', type: 'Egenkontrol' },
  { id: 6, name: 'Varslingssystem inspektion - Bygning B Kælderen', type: 'Egenkontrol' },
  { id: 7, name: 'Brandslukker inspektion', type: 'Egenkontrol' },
  { id: 8, name: 'Brandtrappe inspektion', type: 'Egenkontrol' },
  { id: 9, name: 'Røgdetektor inspektion', type: 'Egenkontrol' },
  { id: 10, name: 'Sprinkleranlæg inspektion - Bygning A', type: 'Egenkontrol' },
  { id: 11, name: 'Brandmandsskab inspektion', type: 'Egenkontrol' },
  { id: 12, name: 'Førstehjælpskasser inspektion', type: 'Egenkontrol' },
  { id: 13, name: 'Brandslange inspektion', type: 'Egenkontrol' }
])

// Pagination state
const currentPage = ref(1)
const itemsPerPage = ref(13)
const totalItems = ref(33)

// Computed property for paginated items
const paginatedItems = computed(() => {
  const startIndex = (currentPage.value - 1) * itemsPerPage.value
  const endIndex = startIndex + itemsPerPage.value
  return inspections.value.slice(startIndex, endIndex)
})

// Function to change page
const changePage = (page) => {
  currentPage.value = page
}
</script>

<template>
  <div class="egenkontroller-container">
    <div class="table-container">
    <table class="egenkontroller-table">
      <thead>
      <tr>
        <th>Egenkontroller</th>
        <th>Type</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="item in paginatedItems" :key="item.id" class="table-row">
        <td>{{ item.name }}</td>
        <td>{{ item.type }}</td>
      </tr>
      </tbody>
    </table>
    <div class="pagination">
      <span class="page-number-info">
        <span>{{ (currentPage - 1) * itemsPerPage + 1 }} - {{ Math.min(currentPage * itemsPerPage, totalItems) }}</span>
          <span >af</span>
          <span>{{ totalItems }}</span>
        </span>
        <div class="pagination-buttons">
          <button v-if="currentPage > 1" class="prev-page" @click="changePage(currentPage - 1)">
            &lt;
          </button>
          <button class="next-page" @click="changePage(currentPage + 1)" :disabled="currentPage * itemsPerPage >= totalItems">
            &gt;
          </button>
        </div>
    </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '@/assets/variables' as *;

.egenkontroller-container {
  font-family: Arial, sans-serif;
  max-width: 1050px;
  padding: 24px;
  
  .table-container {
    border-radius: 8px;
    overflow: hidden;
    border: 1px solid $neutral-300;
  }
  
  .egenkontroller-table {
    width: 100%;
    border-collapse: collapse;
    
    th {
      background-color: $table-header;
      text-align: left;
      padding: 8px 24px;
      width: 50%;
      font-weight: normal;
      color: $neutral-700;
    }
    
    td {
      padding: 16px 24px;
      color: $neutral-700;
    }
    
    .table-row {
      cursor: pointer;

      &:nth-child(2n) {
        background-color: $table-2nd-row;
      }

      &:hover {
        background-color: $nav-hover;
      }
    }
  }
  
  .pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 12px 16px;
    background-color: $neutral-200;
    color: $secondary-900;
    font-size: 0.85rem;

    .page-number-info {
      display: flex;
      gap: 16px
    }

    .pagination-buttons {
      display: flex;
      margin-left: 12px;
    }
    .prev-page,
    .next-page {
      background: none;
      border: none;
      color: $secondary-500;
      font-size: 1.2rem;
      margin-left: 12px;
      cursor: pointer;
      padding: 4px 8px;
    }
    &:disabled {
        color: #c1c7d0;
        cursor: not-allowed;
    }
  }
}
</style>
