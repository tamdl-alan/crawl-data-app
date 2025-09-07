<script setup>
import { ref, onMounted } from 'vue'
import { mdiRefresh, mdiRestore, mdiDeleteForever } from '@mdi/js'
import SectionMain from '@/components/SectionMain.vue'
import NotificationBar from '@/components/NotificationBar.vue'
import DataTable from '@/components/DataTable.vue'
import CardBox from '@/components/CardBox.vue'
import LayoutAuthenticated from '@/layouts/LayoutAuthenticated.vue'
import CardBoxModal from '@/components/CardBoxModal.vue'
import dayjs from "dayjs";
import BaseButton from '@/components/BaseButton.vue'
import BaseButtons from '@/components/BaseButtons.vue'

// Use relative URLs for API calls (nginx will proxy them)
const API_BASE_URL = ''

const deletedData = ref([])
const loading = ref(false)
const notification = ref({ show: false, message: '', type: 'info' })
const isBulkRestoreModalActive = ref(false)
const isBulkDeleteModalActive = ref(false)
const isSingleHardDeleteModalActive = ref(false)
const selectedItemsForBulkRestore = ref([])
const selectedItemsForBulkDelete = ref([])
const selectedItemForHardDelete = ref(null)

// Search and filter state
const searchQuery = ref('')
const filterBy = ref('')
const filterValue = ref('')
const filterOptions = [
  { value: '', label: 'All Fields' },
  { value: 'size_goat', label: 'Size GOAT' },
  { value: 'size_snkrdunk', label: 'Size SNKRDUNK' },
  { value: 'price_goat', label: 'Price GOAT' },
  { value: 'price_snkrdunk', label: 'Price SNKRDUNK' },
  { value: 'profit_amount', label: 'Profit Amount' },
  { value: 'selling_price', label: 'Selling Price' }
]

// Pagination state
const currentPage = ref(1)
const perPage = ref(20)
const totalItems = ref(0)
const totalPages = ref(0)
const pageSizeOptions = [10, 20, 50, 100]

// Table columns configuration - matching crawled_data table schema
const columns = [
  { key: '#', label: '#', sortable: false, width: '60px', minWidth: '50px' },
  { 
    key: 'product_name', 
    label: 'Product Name', 
    width: '300px',
    minWidth: '200px',
    maxWidth: '400px',
    sortable: true,
    render: (value, row) => {
      if (row.product_url) {
        return `<a href="https://www.goat.com/${row.product_url}" target="_blank" class="text-blue-600 hover:text-blue-800 underline">${value}</a>`
      }
      return value
    }
  },
  { 
    key: 'size_goat', 
    label: 'Size GOAT', 
    sortable: true,
    width: '100px',
    minWidth: '80px'
  },
  { 
    key: 'price_goat', 
    label: 'Price GOAT (¥)', 
    sortable: true,
    width: '120px',
    minWidth: '100px',
    render: (value) => value ? `¥${Number(value).toLocaleString()}` : '-'
  },
  { 
    key: 'size_snkrdunk', 
    label: 'Size SNKRDUNK', 
    sortable: true,
    width: '120px',
    minWidth: '100px'
  },
  { 
    key: 'price_snkrdunk', 
    label: 'Price SNKRDUNK (¥)', 
    sortable: true,
    width: '140px',
    minWidth: '120px',
    render: (value) => value ? `¥${Number(value).toLocaleString()}` : '-'
  },
  { 
    key: 'profit_amount', 
    label: 'Profit (¥)', 
    sortable: true,
    width: '120px',
    minWidth: '100px',
    render: (value) => {
      if (!value) return '-'
      const profit = Number(value)
      const colorClass = profit > 0 ? 'text-green-600' : profit < 0 ? 'text-red-600' : 'text-gray-600'
      return `<span class="${colorClass} font-semibold">¥${profit.toLocaleString()}</span>`
    }
  },
  { 
    key: 'selling_price', 
    label: 'Selling Price (¥)', 
    sortable: true,
    width: '130px',
    minWidth: '110px',
    render: (value) => value ? `¥${Number(value).toLocaleString()}` : '-'
  },
  { 
    key: 'image_url', 
    label: 'Image', 
    sortable: false,
    width: '80px',
    minWidth: '60px',
    render: (value) => {
      if (value) {
        return `<img src="${value}" alt="Product" class="w-12 h-12 object-cover rounded border" onerror="this.style.display='none'">`
      }
      return '-'
    }
  },
  { 
    key: 'note', 
    label: 'Note', 
    sortable: false,
    width: '150px',
    minWidth: '100px',
    render: (value) => value || '-'
  },
  { 
    key: 'updated_at', 
    label: 'Deleted At', 
    sortable: true,
    width: '150px',
    minWidth: '120px',
    render: (value) => value ? dayjs(value).format('YYYY-MM-DD HH:mm') : '-'
  },
  { 
    key: 'actions', 
    label: 'Actions', 
    sortable: false,
    width: '120px',
    minWidth: '100px'
  }
]

// Fetch deleted crawled data
const fetchDeletedData = async () => {
  loading.value = true
  try {
    const params = new URLSearchParams({
      page: currentPage.value.toString(),
      limit: perPage.value.toString(),
      sortBy: 'updated_at',
      sortOrder: 'desc'
    })
    
    if (searchQuery.value.trim()) {
      params.append('search', searchQuery.value.trim())
    }
    
    if (filterBy.value && filterValue.value.trim()) {
      params.append('filterBy', filterBy.value)
      params.append('filterValue', filterValue.value.trim())
    }
    
    const response = await fetch(`${API_BASE_URL}/crawled-data/deleted?${params.toString()}`)
    const result = await response.json()
    
    if (response.ok) {
      deletedData.value = result.data || []
      totalItems.value = result.total || 0
      totalPages.value = result.totalPages || 0
    } else {
      showNotification('Error fetching deleted data: ' + result.error, 'danger')
    }
  } catch (error) {
    console.error('Error fetching deleted data:', error)
    showNotification('Error fetching deleted data', 'danger')
  } finally {
    loading.value = false
  }
}

// Restore a single item
const restoreItem = async (item) => {
  const id = typeof item === 'object' ? item.id : item
  try {
    const response = await fetch(`${API_BASE_URL}/crawled-data/${id}/restore`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    const result = await response.json()
    
    if (response.ok) {
      showNotification('Item restored successfully', 'success')
      selectedItemsForBulkRestore.value = []
      selectedItemsForBulkDelete.value = []
      await fetchDeletedData()
    } else {
      showNotification('Error restoring item: ' + result.error, 'danger')
    }
  } catch (error) {
    console.error('Error restoring item:', error)
    showNotification('Error restoring item', 'danger')
  }
}

// Hard delete a single item (xóa cứng khỏi DB)
const hardDeleteItem = async (item) => {
  const id = typeof item === 'object' ? item.id : item
  console.log('🚀 ~ id:', id);
  selectedItemForHardDelete.value = { id, name: item.product_name || `Item #${id}` }
  isSingleHardDeleteModalActive.value = true
}

// Execute hard delete after modal confirmation
const executeHardDelete = async () => {
  if (!selectedItemForHardDelete.value) return
  
  try {
    const response = await fetch(`${API_BASE_URL}/crawled-data/${selectedItemForHardDelete.value.id}/permanent`, {
      method: 'DELETE'
    })
    
    const result = await response.json()
    
    if (response.ok) {
      showNotification('Item permanently deleted from database', 'success')
      selectedItemsForBulkRestore.value = []
      selectedItemsForBulkDelete.value = []
      await fetchDeletedData()
    } else {
      showNotification('Error deleting item: ' + result.error, 'danger')
    }
  } catch (error) {
    console.error('Error deleting item:', error)
    showNotification('Error deleting item', 'danger')
  } finally {
    selectedItemForHardDelete.value = null
    isSingleHardDeleteModalActive.value = false
  }
}

// Bulk restore selected items
const bulkRestore = async () => {
  if (selectedItemsForBulkRestore.value.length === 0) {
    showNotification('Please select items to restore', 'warning')
    return
  }
  
  try {
    const promises = selectedItemsForBulkRestore.value.map(item => {
      const id = typeof item === 'object' ? item.id : item
      console.log('🚀 ~ selectedItemsForBulkRestore:', selectedItemsForBulkRestore);
      console.log('🚀 ~ id:', id);
      return fetch(`${API_BASE_URL}/crawled-data/${id}/restore`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        }
      })
    })
    
    const responses = await Promise.all(promises)
    const failed = responses.filter(r => !r.ok)
    
    if (failed.length === 0) {
      showNotification(`${selectedItemsForBulkRestore.value.length} items restored successfully`, 'success')
      selectedItemsForBulkRestore.value = []
      selectedItemsForBulkDelete.value = []
      isBulkRestoreModalActive.value = false
      await fetchDeletedData()
    } else {
      showNotification(`Failed to restore ${failed.length} items`, 'danger')
    }
  } catch (error) {
    console.error('Error bulk restoring items:', error)
    showNotification('Error bulk restoring items', 'danger')
  }
}

// Bulk hard delete selected items (xóa cứng khỏi DB)
const bulkHardDelete = async () => {
  if (selectedItemsForBulkDelete.value.length === 0) {
    showNotification('Please select items to delete', 'warning')
    return
  }
  
  try {
    const promises = selectedItemsForBulkDelete.value.map(item => {
      const id = typeof item === 'object' ? item.id : item
      return fetch(`${API_BASE_URL}/crawled-data/${id}/permanent`, {
        method: 'DELETE'
      })
    })
    
    const responses = await Promise.all(promises)
    const failed = responses.filter(r => !r.ok)
    
    if (failed.length === 0) {
      showNotification(`${selectedItemsForBulkDelete.value.length} items permanently deleted from database`, 'success')
      selectedItemsForBulkRestore.value = []
      selectedItemsForBulkDelete.value = []
      isBulkDeleteModalActive.value = false
      await fetchDeletedData()
    } else {
      showNotification(`Failed to delete ${failed.length} items`, 'danger')
    }
  } catch (error) {
    console.error('Error bulk deleting items:', error)
    showNotification('Error bulk deleting items', 'danger')
  }
}

// Handle page change
const handlePageChange = (page) => {
  currentPage.value = page
  fetchDeletedData()
}

// Handle per page change
const handlePerPageChange = (perPageValue) => {
  perPage.value = perPageValue
  currentPage.value = 1
  fetchDeletedData()
}

// Handle selection change
const handleSelectionChange = (selectedItems) => {
  selectedItemsForBulkRestore.value = selectedItems
  selectedItemsForBulkDelete.value = selectedItems
}


// Show notification
const showNotification = (message, type = 'info') => {
  notification.value = { show: true, message, type }
  setTimeout(() => {
    notification.value.show = false
  }, 5000)
}

// Handle search
const handleSearch = () => {
  currentPage.value = 1
  fetchDeletedData()
}

// Handle filter
const handleFilter = () => {
  currentPage.value = 1
  fetchDeletedData()
}

// Clear search and filter
const clearSearchAndFilter = () => {
  searchQuery.value = ''
  filterBy.value = ''
  filterValue.value = ''
  currentPage.value = 1
  fetchDeletedData()
}

// Get visible pages for pagination
const getVisiblePages = () => {
  const pages = []
  const maxVisible = 5
  let start = Math.max(1, currentPage.value - Math.floor(maxVisible / 2))
  let end = Math.min(totalPages.value, start + maxVisible - 1)
  
  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1)
  }
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  
  return pages
}

// Handle edit data (placeholder)
const handleEditData = () => {
  // Not used in deleted products view
  console.log('Edit not available for deleted products')
}

// Handle delete data (placeholder)
const handleDeleteData = () => {
  // Not used in deleted products view
  console.log('Delete not available for deleted products')
}

// Handle bulk delete (placeholder)
const handleBulkDelete = () => {
  // Not used in deleted products view
  console.log('Bulk delete not available for deleted products')
}

// Refresh data
const refreshData = () => {
  fetchDeletedData()
}

// Initialize component
onMounted(() => {
  fetchDeletedData()
})
</script>

<template>
  <LayoutAuthenticated>
    <SectionMain>
      <!-- Header -->
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Deleted Products
        </h1>
      </div>

      <!-- Notification -->
      <NotificationBar
        v-if="notification.show"
        :color="notification.type"
        :icon="notification.type === 'success' ? 'check' : notification.type === 'danger' ? 'alert' : 'information'"
        @close="notification.show = false"
      >
        {{ notification.message }}
      </NotificationBar>

      <!-- Search and Filter Section -->
      <CardBox class="mb-4">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <!-- Search Input -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search
            </label>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search by product name, URL, or note..."
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              @keyup.enter="handleSearch"
            />
          </div>
          
          <!-- Filter By -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Filter By
            </label>
            <select
              v-model="filterBy"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              @change="handleFilter"
            >
              <option v-for="option in filterOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
          </div>
          
          <!-- Filter Value -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Filter Value
            </label>
            <input
              v-model="filterValue"
              type="text"
              placeholder="Enter filter value..."
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              @keyup.enter="handleFilter"
            />
          </div>
          
          <!-- Action Buttons -->
          <div class="flex flex-col justify-end gap-2">
            <BaseButton
              color="info"
              label="Search"
              @click="handleSearch"
              :loading="loading"
            />
            <BaseButton
              color="warning"
              label="Clear"
              @click="clearSearchAndFilter"
            />
          </div>
        </div>
      </CardBox>

      <!-- Data Table -->
      <CardBox class="mb-6 overflow-hidden" has-table>
        <div v-if="loading" class="p-6 text-center">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p class="mt-2">Loading deleted products...</p>
        </div>
        
        <div v-else>
          <div class="sticky top-0 z-10 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-600 pb-4 mb-4">
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div class="flex flex-col gap-2">
                <h3 class="text-lg font-semibold">Deleted Products List</h3>
                <p class="text-sm text-gray-600 dark:text-gray-400">Manage deleted crawled data - restore items back to active list or hard delete from database</p>
              </div>
              <div class="flex items-center gap-2">
                <BaseButton
                  :icon="mdiRefresh"
                  label="Refresh"
                  color="success"
                  small
                  class="mr-3"
                  @click="refreshData"
                />
              </div>
            </div>
          </div>
          
          <!-- Bulk Actions -->
          <div class="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600 dark:text-gray-400">
                {{ selectedItemsForBulkRestore.length + selectedItemsForBulkDelete.length }} item(s) selected
              </span>
              <div class="flex gap-2">
                <BaseButton
                  :icon="mdiRestore"
                  color="success"
                  :label="`Restore ${selectedItemsForBulkRestore.length} items`"
                  :disabled="selectedItemsForBulkRestore.length === 0"
                  small
                  @click="isBulkRestoreModalActive = true"
                />
                <BaseButton
                  :icon="mdiDeleteForever"
                  color="danger"
                  :label="`Hard Delete ${selectedItemsForBulkDelete.length} items`"
                  :disabled="selectedItemsForBulkDelete.length === 0"
                  small
                  @click="isBulkDeleteModalActive = true"
                />
              </div>
            </div>
          </div>
          
          <DataTable
            :data="deletedData"
            :columns="columns"
            :checkable="true"
            :sortable="true"
            :per-page="perPage"
            :table-height="'430px'"
            :hide-delete-button="true"
            @edit="handleEditData"
            @delete="handleDeleteData"
            @bulk-delete="handleBulkDelete"
            @selection-change="handleSelectionChange"
          >
            <template #actions="{ item }">
              <BaseButtons type="justify-start lg:justify-end" no-wrap>
                <BaseButton
                  color="success"
                  :icon="mdiRestore"
                  small
                  @click="() => restoreItem(item)"
                  title="Restore item"
                />
                <BaseButton
                  color="danger"
                  :icon="mdiDeleteForever"
                  small
                  @click="() => hardDeleteItem(item)"
                  title="Hard delete item"
                />
              </BaseButtons>
            </template>
          </DataTable>
          
          <!-- Custom Pagination -->
          <div class="p-4 border-t border-gray-200 dark:border-slate-600">
            <div class="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div class="flex items-center gap-4">
                <div class="text-sm text-gray-600 dark:text-gray-400">
                  Showing {{ ((currentPage - 1) * perPage) + 1 }} to {{ Math.min(currentPage * perPage, totalItems) }} of {{ totalItems }} items
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-sm text-gray-600 dark:text-gray-400">Show:</span>
                  <div class="relative">
                    <select 
                      v-model="perPage" 
                      @change="handlePerPageChange(perPage)"
                      class="appearance-none border border-gray-300 dark:border-gray-600 rounded px-3 py-1 pr-8 text-sm bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option v-for="option in pageSizeOptions" :key="option" :value="option">
                        {{ option }}
                      </option>
                    </select>
                  </div>
                  <span class="text-sm text-gray-600 dark:text-gray-400">items per page</span>
                </div>
              </div>
              <div v-if="totalPages > 1" class="flex items-center gap-2">
                <BaseButton
                  :disabled="currentPage === 1"
                  color="whiteDark"
                  small
                  @click="handlePageChange(currentPage - 1)"
                >
                  Previous
                </BaseButton>
                
                <div class="flex items-center gap-1">
                  <BaseButton
                    v-for="page in getVisiblePages()"
                    :key="page"
                    :active="page === currentPage"
                    :color="page === currentPage ? 'lightDark' : 'whiteDark'"
                    :label="page.toString()"
                    small
                    @click="handlePageChange(page)"
                  />
                </div>
                
                <BaseButton
                  :disabled="currentPage === totalPages"
                  color="whiteDark"
                  small
                  @click="handlePageChange(currentPage + 1)"
                >
                  Next
                </BaseButton>
              </div>
            </div>
          </div>
        </div>
      </CardBox>

      <!-- Bulk Restore Modal -->
      <CardBoxModal
        v-model="isBulkRestoreModalActive"
        title="Bulk Restore"
        button="success"
        button-label="Restore"
        @confirm="bulkRestore"
      >
        <p>Are you sure you want to restore <strong>{{ selectedItemsForBulkRestore.length }}</strong> selected items?</p>
        <p class="text-sm text-gray-600 dark:text-gray-400 mt-2">
          This will move the items back to the active crawled data list.
        </p>
      </CardBoxModal>

      <!-- Single Hard Delete Modal -->
      <CardBoxModal
        v-model="isSingleHardDeleteModalActive"
        title="Hard Delete Item"
        button="danger"
        button-label="Hard Delete"
        @confirm="executeHardDelete"
      >
        <p>Are you sure you want to permanently delete <strong>{{ selectedItemForHardDelete?.name }}</strong> from database?</p>
        <p class="text-sm text-red-600 dark:text-red-400 mt-2">
          <strong>Warning:</strong> This will completely remove the item from database and cannot be undone!
        </p>
      </CardBoxModal>

      <!-- Bulk Hard Delete Modal -->
      <CardBoxModal
        v-model="isBulkDeleteModalActive"
        title="Bulk Hard Delete"
        button="danger"
        button-label="Hard Delete"
        @confirm="bulkHardDelete"
      >
        <p>Are you sure you want to permanently delete <strong>{{ selectedItemsForBulkDelete.length }}</strong> selected items from database?</p>
        <p class="text-sm text-red-600 dark:text-red-400 mt-2">
          <strong>Warning:</strong> This will completely remove items from database and cannot be undone!
        </p>
      </CardBoxModal>
    </SectionMain>
  </LayoutAuthenticated>
</template>
