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
  }
})

const emit = defineEmits(['edit', 'delete', 'view', 'crawl', 'selection-change'])

const isModalActive = ref(false)
const isModalDangerActive = ref(false)
const currentPage = ref(0)
const checkedRows = ref([])
const sortField = ref('')
const sortDirection = ref('asc')
const selectedItem = ref(null)

// Computed properties
const itemsPaginated = computed(() => {
  let sortedData = [...props.data]
  
  if (sortField.value && props.sortable) {
    sortedData.sort((a, b) => {
      const aVal = a[sortField.value]
      const bVal = b[sortField.value]
      
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection.value === 'asc' 
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal)
      }
      
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
    checkedRows.value.push(item)
  } else {
    checkedRows.value = remove(checkedRows.value, (row) => row.id === item.id)
  }
  emit('selection-change', checkedRows.value)
}

const handleSort = (field) => {
  if (!props.sortable) return
  
  if (sortField.value === field) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortField.value = field
    sortDirection.value = 'asc'
  }
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

// Watch for data changes to reset pagination
watch(() => props.data, () => {
  currentPage.value = 0
}, { deep: true })
</script>

<template>
  <div>
    <CardBoxModal v-model="isModalActive" title="Item Details">
      <div v-if="selectedItem">
        <div v-for="column in columns" :key="column.key" class="mb-3">
          <strong>{{ column.label }}:</strong> {{ selectedItem[column.key] }}
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

    <div class="overflow-y-auto max-h-130">
      <table class="w-full text-sm min-w-full">
        <thead class="sticky top-0 bg-white dark:bg-slate-800 z-10">
          <tr class="border-b border-gray-200 dark:border-slate-600">
            <th v-if="checkable" class="px-3 py-2" />
            <th 
              v-for="column in columns" 
              :key="column.key"
              class="px-3 py-2 text-left font-medium text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700"
              :style="column.width ? { width: column.width } : {}"
              @click="handleSort(column.key)"
            >
              <div class="flex items-center justify-between">
                <span>{{ column.label }}</span>
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
              @checked="checked($event, item)" 
            />
            <td 
              v-for="column in columns" 
              :key="column.key"
              :data-label="column.label"
              class="px-3 py-2"
              :style="column.width ? { width: column.width } : {}"
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
            <td class="before:hidden lg:w-1 whitespace-nowrap px-3 py-2">
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
