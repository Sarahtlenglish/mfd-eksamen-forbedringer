<script setup>
import { ref, computed } from 'vue'

// Props for the component
const props = defineProps({
  items: {
    type: Array,
    required: true
  },
  columns: {
    type: Array,
    required: true
  },
  itemsPerPage: {
    type: Number,
    default: 13
  },
  columnWidths: {
    type: Array,
    default: () => []
  },
  selectedItemId: {
    type: [Number, String, null],
    default: null
  }
})

// Emits
const emit = defineEmits(['page-change', 'row-click'])

// Pagination state
const currentPage = ref(1)

// Computed properties
const totalItems = computed(() => props.items.length)
const totalPages = computed(() => Math.ceil(totalItems.value / props.itemsPerPage))

const paginatedItems = computed(() => {
  const startIndex = (currentPage.value - 1) * props.itemsPerPage
  const endIndex = startIndex + props.itemsPerPage
  return props.items.slice(startIndex, endIndex)
})

// Methods
const onPageChange = (page) => {
  currentPage.value = page
  emit('page-change', page)
}

const handleRowClick = (item) => {
  emit('row-click', item)
}
</script>

<template>
  <div class="table-container">
    <table class="data-table">
      <thead>
        <tr>
          <th v-for="(column, index) in columns"
          :key="column.key"
          :style="columnWidths[index] ? { width: columnWidths[index] } : {}">
          {{ column.label }}</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="item in paginatedItems"
          :key="item.id"
          class="table-row"
          @click="handleRowClick(item)"
          :class="{ 'selected-row': selectedItemId === item.id }"
        >
          <td v-for="column in columns" :key="column.key">
            <slot :name="`cell-${column.key}`" :item="item" :column="column">
              {{ item[column.key] }}
            </slot>
          </td>
        </tr>
      </tbody>
    </table>
    <div class="pagination">
      <span class="page-number-info">
        <span>{{ (currentPage - 1) * itemsPerPage + 1 }} - {{ Math.min(currentPage * itemsPerPage, totalItems) }}</span>
        <span>af</span>
        <span>{{ totalItems }}</span>
      </span>
      <div class="pagination-buttons">
        <button v-if="currentPage > 1" class="prev-page" @click="onPageChange(currentPage - 1)">
          &lt;
        </button>
        <button class="next-page" @click="onPageChange(currentPage + 1)" :disabled="currentPage >= totalPages">
          &gt;
        </button>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '@/assets/variables' as *;

.table-container {
  border-radius: 8px;
  overflow: hidden;
  background-color: white;
  border: 1px solid $neutral-300;
  width: 100%;
}

.data-table {
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

  tr:nth-child(even) {
    background-color: $table-2nd-row;
  }

  tr:nth-child(odd) {
    background-color: white;
  }

  .table-row {
    transition: background-color 0.15s ease;

    &:hover {
      background-color: $nav-hover;
      cursor: pointer;
    }

    &.selected-row {
      background-color: $nav-active;
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

    &:disabled {
      color: #c1c7d0;
      cursor: not-allowed;
    }
  }

  .prev-page {
    margin-right: 4px;
  }
}
</style>
