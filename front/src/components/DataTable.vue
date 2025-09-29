<script setup>
import { computed, ref, watch } from 'vue'
import { mdiEye, mdiTrashCan, mdiPencil, mdiSortAscending, mdiSortDescending } from '@mdi/js'
import CardBoxModal from '@/components/CardBoxModal.vue'
import TableCheckboxCell from '@/components/TableCheckboxCell.vue'
import BaseLevel from '@/components/BaseLevel.vue'
import BaseButtons from '@/components/BaseButtons.vue'
import BaseButton from '@/components/BaseButton.vue'
import BaseIcon from '@/components/BaseIcon.vue'

const props = defineProps({
  data: {
    type: Array,
    default: () => []
  },
  columns: {
    type: Array,
    default: () => []
  },
  checkable: {
    type: Boolean,
    default: false
  },
  sortable: {
    type: Boolean,
    default: true
  },
  perPage: {
    type: Number,
    default: 10
  },
  tableHeight: {
    type: String,
    default: 'auto'
  },
  hideDeleteButton: {
    type: Boolean,
    default: false
  },
  sortStorageKey: {
    type: String,
    default: 'default-sort'
  }
})

const emit = defineEmits(['edit', 'delete', 'view', 'crawl', 'selection-change', 'bulk-delete'])

const isModalActive = ref(false)
const isModalDangerActive = ref(false)
const isCheckAllModalActive = ref(false)


const currentPage = ref(0)
const checkedRows = ref([])
const isAllChecked = ref(false)
const sortField = ref('')
const sortDirection = ref('asc')
const selectedItem = ref(null)

// Load sort state from localStorage on component mount
const loadSortState = () => {
  try {
    const savedSort = localStorage.getItem(props.sortStorageKey)
    if (savedSort) {
      const { field, direction } = JSON.parse(savedSort)
      sortField.value = field
      sortDirection.value = direction
    }
  } catch (error) {
    console.warn('Failed to load sort state:', error)
  }
}

// Save sort state to localStorage
const saveSortState = () => {
  try {
    const sortState = {
      field: sortField.value,
      direction: sortDirection.value
    }
    localStorage.setItem(props.sortStorageKey, JSON.stringify(sortState))
  } catch (error) {
    console.warn('Failed to save sort state:', error)
  }
}

// Load sort state when component mounts
loadSortState()

// Computed properties
const itemsPaginated = computed(() => {
  let sortedData = [...props.data]
  
  if (sortField.value && props.sortable) {
    sortedData.sort((a, b) => {
      const aVal = a[sortField.value]
      const bVal = b[sortField.value]
      
      // Get column configuration for sorting
      const column = props.columns.find(col => col.key === sortField.value)
      
      // Handle number sorting for price columns
      if (column && column.sortType === 'number') {
        const aNum = parseFloat(aVal) || 0
        const bNum = parseFloat(bVal) || 0
        
        if (sortDirection.value === 'asc') {
          return aNum - bNum
        } else {
          return bNum - aNum
        }
      }
      
      // Handle date sorting
      if (column && column.sortType === 'date') {
        const aDate = new Date(aVal || 0)
        const bDate = new Date(bVal || 0)
        
        if (sortDirection.value === 'asc') {
          return aDate - bDate
        } else {
          return bDate - aDate
        }
      }
      
      // Default string sorting
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection.value === 'asc' 
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal)
      }
      
      // Fallback for mixed types
      if (sortDirection.value === 'asc') {
        return aVal > bVal ? 1 : -1
      } else {
        return aVal < bVal ? 1 : -1
      }
    })
  }
  
  const start = props.perPage * currentPage.value
  const end = start + props.perPage
  return sortedData.slice(start, end)
})

const numPages = computed(() => Math.ceil(props.data.length / props.perPage))

const currentPageHuman = computed(() => currentPage.value + 1)

const pagesList = computed(() => {
  const pagesList = []
  for (let i = 0; i < numPages.value; i++) {
    pagesList.push(i)
  }
  return pagesList
})

// Methods
const remove = (arr, cb) => {
  const newArr = []
  arr.forEach((item) => {
    if (!cb(item)) {
      newArr.push(item)
    }
  })
  return newArr
}

const checked = (isChecked, item) => {
  if (isChecked) {
    // Add item if not already in checked rows
    if (!checkedRows.value.some(checkedItem => checkedItem.id === item.id)) {
      checkedRows.value.push(item)
    }
  } else {
    // Remove item from checked rows
    checkedRows.value = remove(checkedRows.value, (row) => row.id === item.id)
  }
  updateAllCheckedState()
  emit('selection-change', checkedRows.value)
}

const checkAll = (isChecked) => {
  if (isChecked) {
    // Add all current page items to checked rows
    const currentPageItems = itemsPaginated.value.filter(item => 
      !checkedRows.value.some(checkedItem => checkedItem.id === item.id)
    )
    checkedRows.value = [...checkedRows.value, ...currentPageItems]
  } else {
    // Remove all current page items from checked rows
    checkedRows.value = checkedRows.value.filter(item => 
      !itemsPaginated.value.some(pageItem => pageItem.id === item.id)
    )
  }
  updateAllCheckedState()
  emit('selection-change', checkedRows.value)
}

const confirmCheckAll = () => {
  // Add all current page items to checked rows
  const currentPageItems = itemsPaginated.value.filter(item => 
    !checkedRows.value.some(checkedItem => checkedItem.id === item.id)
  )
  checkedRows.value = [...checkedRows.value, ...currentPageItems]
  updateAllCheckedState()
  emit('selection-change', checkedRows.value)
  isCheckAllModalActive.value = false
}

const updateAllCheckedState = () => {
  if (itemsPaginated.value.length === 0) {
    isAllChecked.value = false
    return
  }
  
  const checkedCount = itemsPaginated.value.filter(item => 
    checkedRows.value.some(checkedItem => checkedItem.id === item.id)
  ).length
  
  // All items checked
  if (checkedCount === itemsPaginated.value.length) {
    isAllChecked.value = true
  }
  // No items checked
  else if (checkedCount === 0) {
    isAllChecked.value = false
  }
  // Some items checked - set to indeterminate state
  else {
    isAllChecked.value = 'indeterminate'
  }
}

const handleBulkDelete = () => {
  if (checkedRows.value.length > 0) {
    emit('bulk-delete', checkedRows.value)
  }
}

const handleSort = (field) => {
  if (!props.sortable) return
  
  if (sortField.value === field) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortField.value = field
    sortDirection.value = 'asc'
  }
  
  // Save sort state to localStorage
  saveSortState()
}

const getSortIcon = (field) => {
  if (sortField.value !== field) return null
  return sortDirection.value === 'asc' ? mdiSortAscending : mdiSortDescending
}

const handleEdit = (item) => {
  emit('edit', item)
}

const handleDelete = (item) => {
  selectedItem.value = item
  isModalDangerActive.value = true
}

const handleView = (item) => {
  selectedItem.value = item
  isModalActive.value = true
}

const confirmDelete = () => {
  if (selectedItem.value) {
    emit('delete', selectedItem.value)
  }
  isModalDangerActive.value = false
  selectedItem.value = null
}

const renderCell = (item, column, index) => {
  // Handle special column types
  if (column.key === '#') {
    return (currentPage.value * props.perPage) + index + 1
  }
  
  if (column.render) {
    return column.render(item[column.key], item)
  }
  return item[column.key]
}

// Helper function to get column styles
const getColumnStyles = (column) => {
  const styles = {}
  
  // Handle width
  if (column.width) {
    if (typeof column.width === 'string') {
      styles.width = column.width
    } else if (typeof column.width === 'number') {
      styles.width = `${column.width}px`
    }
  }
  
  // Handle min-width
  if (column.minWidth) {
    if (typeof column.minWidth === 'string') {
      styles.minWidth = column.minWidth
    } else if (typeof column.minWidth === 'number') {
      styles.minWidth = `${column.minWidth}px`
    }
  }
  
  // Handle max-width
  if (column.maxWidth) {
    if (typeof column.maxWidth === 'string') {
      styles.maxWidth = column.maxWidth
    } else if (typeof column.maxWidth === 'number') {
      styles.maxWidth = `${column.maxWidth}px`
    }
  }
  
  // Handle flex properties
  if (column.flex) {
    styles.flex = column.flex
  }
  
  if (column.flexGrow) {
    styles.flexGrow = column.flexGrow
  }
  
  if (column.flexShrink) {
    styles.flexShrink = column.flexShrink
  }
  
  return styles
}

// Helper function to get column alignment classes
const getColumnAlignment = (column) => {
  const align = column.align || 'left'
  
  switch (align) {
    case 'center':
      return 'text-center'
    case 'right':
      return 'text-right'
    case 'left':
    default:
      return 'text-left'
  }
}

// Watch for data changes to reset pagination
watch(() => props.data, () => {
  currentPage.value = 0
  updateAllCheckedState()
}, { deep: true })

// Watch for pagination changes to update checked state
watch(() => currentPage.value, () => {
  updateAllCheckedState()
})
</script>

<template>
  <div>
    <!-- Check All Confirmation Modal -->
    <CardBoxModal 
      v-model="isCheckAllModalActive" 
      title="Confirm Check All" 
      button="info" 
      has-cancel
      @confirm="confirmCheckAll"
    >
      <p>Are you sure you want to select all <strong>{{ itemsPaginated.length }}</strong> items on this page?</p>
      <p class="text-sm text-gray-600 dark:text-gray-400 mt-2">
        This will add all current page items to your selection.
      </p>
      <div v-if="checkedRows.length > 0" class="mt-4 p-3 bg-blue-50 dark:bg-slate-700 rounded-lg">
        <p class="text-sm font-semibold mb-2 text-blue-700 dark:text-blue-300">Current selection:</p>
        <p class="text-sm text-blue-600 dark:text-blue-400">
          You already have <strong>{{ checkedRows.length }}</strong> item(s) selected from other pages.
        </p>
      </div>
    </CardBoxModal>

    <CardBoxModal v-model="isModalActive" title="Item Details">
      <div v-if="selectedItem">
        <div v-for="column in columns" :key="column.key" class="mb-3">
          <strong>{{ column.label }}:</strong> 
          <span v-if="column.key === 'image_url' && selectedItem[column.key]">
            <img 
              :src="selectedItem[column.key]" 
              :alt="selectedItem.product_name || 'Product Image'"
              class="mt-2 max-w-full h-auto max-h-48 rounded border object-cover"
              @error="$event.target.style.display='none'"
            />
          </span>
          <span v-else-if="column.key === 'image_url' && !selectedItem[column.key]">
            No image available
          </span>
          <span v-else>
            {{ selectedItem[column.key] }}
          </span>
        </div>
      </div>
    </CardBoxModal>

    <CardBoxModal 
      v-model="isModalDangerActive" 
      title="Confirm Delete" 
      button="danger" 
      has-cancel
      @confirm="confirmDelete"
    >
      <p>Are you sure you want to delete this item?</p>
      <p v-if="selectedItem" class="text-sm text-gray-600">
        {{ selectedItem[columns[0]?.key] || 'This item' }}
      </p>
    </CardBoxModal>

      <!-- Bulk Actions -->
      <div v-if="!hideDeleteButton" class="p-3 bg-gray-50 dark:bg-slate-700 border-b border-gray-200 dark:border-slate-600">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-2">
            <span class="text-sm text-gray-600 dark:text-gray-400">
              {{ checkedRows.length }} item(s) selected
            </span>
            <span v-if="checkedRows.length > itemsPaginated.length" class="text-xs text-gray-500 dark:text-gray-400">
              (across {{ Math.ceil(checkedRows.length / itemsPaginated.length) }} pages)
            </span>
          </div>
          <BaseButton
            color="danger"
            label="Delete Selected"
            small
            :disabled="checkedRows.length === 0"
            @click="handleBulkDelete"
          />
        </div>
      </div>

      <div class="table-container compact">
      <div class="overflow-y-auto" :style="{ maxHeight: tableHeight }">
        <table class="w-full text-sm min-w-full">
        <thead class="sticky top-0 bg-white dark:bg-slate-800 z-10">
            <tr class="border-b border-gray-200 dark:border-slate-600">
              <th v-if="checkable" class="pr-3 py-1">
                <TableCheckboxCell 
                  :checked="isAllChecked"
                  @checked="checkAll"
                />
              </th>
            <th 
              v-for="column in columns" 
              :key="column.key"
                              :class="[
                  'px-3 py-1 font-medium text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700',
                  getColumnAlignment(column)
                ]"
              :style="getColumnStyles(column)"
              @click="handleSort(column.key)"
            >
              <div class="flex items-center justify-between">
                <span class="text-center">{{ column.label }}</span>
                <BaseIcon 
                  v-if="props.sortable && getSortIcon(column.key)" 
                  :path="getSortIcon(column.key)" 
                  size="16" 
                  class="ml-1"
                />
              </div>
            </th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in itemsPaginated" :key="item.id" class="border-b border-gray-100 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700">
            <TableCheckboxCell 
              v-if="checkable" 
              :checked="checkedRows.some(checkedItem => checkedItem.id === item.id)"
              @checked="checked($event, item)" 
            />
            <td 
              v-for="column in columns" 
              :key="column.key"
              :data-label="column.label"
                              :class="[
                  'px-3 py-1',
                  getColumnAlignment(column)
                ]"
              :style="getColumnStyles(column)"
            >
              <component 
                :is="column.component" 
                v-if="column.component"
                :type="item[column.key]"
                :value="item[column.key]"
                :item="item"
              />
              <span v-else v-html="renderCell(item, column, index)"></span>
            </td>
                            <td class="before:hidden lg:w-1 whitespace-nowrap px-3 py-1">
              <slot name="actions" :item="item" :handle-view="handleView" :handle-edit="handleEdit" :handle-delete="handleDelete">
                <BaseButtons type="justify-start lg:justify-end" no-wrap>
                  <BaseButton 
                    color="info" 
                    :icon="mdiEye" 
                    small 
                    @click="handleView(item)" 
                  />
                  <BaseButton 
                    color="warning" 
                    :icon="mdiPencil" 
                    small 
                    @click="handleEdit(item)" 
                  />
                  <BaseButton
                    color="danger"
                    :icon="mdiTrashCan"
                    small
                    @click="handleDelete(item)"
                  />
                </BaseButtons>
              </slot>
            </td>
          </tr>
        </tbody>
      </table>
      </div>
    </div>
    
    <div v-if="numPages > 1" class="p-3 lg:px-6 border-t border-gray-100 dark:border-slate-800">
      <BaseLevel>
        <BaseButtons>
          <BaseButton
            v-for="page in pagesList"
            :key="page"
            :active="page === currentPage"
            :label="page + 1"
            :color="page === currentPage ? 'lightDark' : 'whiteDark'"
            small
            @click="currentPage = page"
          />
        </BaseButtons>
        <small>Page {{ currentPageHuman }} of {{ numPages }}</small>
      </BaseLevel>
    </div>
  </div>
</template>
