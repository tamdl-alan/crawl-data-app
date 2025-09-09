<script setup>
import { ref, onMounted } from 'vue'
import { mdiRefresh } from '@mdi/js'
import SectionMain from '@/components/SectionMain.vue'
import NotificationBar from '@/components/NotificationBar.vue'
import DataTable from '@/components/DataTable.vue'
import CrawledDataForm from '@/components/CrawledDataForm.vue'
import CardBox from '@/components/CardBox.vue'
import LayoutAuthenticated from '@/layouts/LayoutAuthenticated.vue'
import CardBoxModal from '@/components/CardBoxModal.vue'
import dayjs from "dayjs";

// import SectionTitleLineWithButton from '@/components/SectionTitleLineWithButton.vue'
import BaseButton from '@/components/BaseButton.vue'

// Use relative URLs for API calls (nginx will proxy them)
const API_BASE_URL = ''

const crawledData = ref([])
const loading = ref(false)
const showForm = ref(false)
const editingData = ref(null)
const isEditMode = ref(false)
const notification = ref({ show: false, message: '', type: 'info' })
const isBulkDeleteModalActive = ref(false)
const selectedItemsForBulkDelete = ref([])

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
const perPage = ref(100)
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
  { key: 'size_goat', label: 'Size', sortable: true, width: '120px', minWidth: '100px', align: 'center' },
  { key: 'price_goat', label: 'Price Goat', sortable: true, width: '120px', minWidth: '100px', align: 'right', sortType: 'number', render: (value) => `¥${Math.round(value || 0).toLocaleString()}` },
  // { key: 'size_snkrdunk', label: 'Size Snkrdunk', sortable: true, width: '140px', minWidth: '120px' },
  { key: 'price_snkrdunk', label: 'Price Snkrdunk', sortable: true, width: '140px', minWidth: '120px', align: 'right', sortType: 'number', render: (value) => `¥${Math.round(value || 0).toLocaleString()}` },
  { key: 'profit_amount', label: 'Profit Amount', sortable: true, width: '130px', minWidth: '110px', align: 'right', sortType: 'number', render: (value) => {
    const amount = Math.round(value || 0);
    const color = amount <= 0 ? 'text-red-500' : 'text-green-500';
    return `<span class="${color}">¥${amount.toLocaleString()}</span>`;
  }},
  { key: 'selling_price', label: 'Selling Price', sortable: true, width: '130px', minWidth: '110px', align: 'right', sortType: 'number', render: (value) => `¥${Math.round(value || 0).toLocaleString()}` },
  { 
    key: 'image_url', 
    label: 'Image', 
    align: 'center',
    sortable: false, 
    width: '80px',
    minWidth: '80px',
    maxWidth: '80px',
    render: (value) => {
      if (value) {
        return `<img src="${value}" alt="Product Image" class="object-cover rounded border" onerror="this.style.display='none'">`
      }
      return ''
    }
  },
  { 
    key: 'created_at', 
    label: 'Created', 
    sortable: true,
    width: '200px',
    minWidth: '200px',
    align: 'center',
    sortType: 'date',
    render: (value) => dayjs(value).format("YYYY/MM/DD HH:mm:ss")
  },
  { 
    key: 'updated_at', 
    label: 'Updated', 
    sortable: true,
    width: '200px',
    minWidth: '200px',
    align: 'center',
    sortType: 'date',
    render: (value) => dayjs(value).format("YYYY/MM/DD HH:mm:ss")
  },
  { key: 'note', label: 'Note', sortable: false, flexGrow: 1, minWidth: '200px', maxWidth: '400px' },
]

// API functions
const fetchCrawledData = async () => {
  loading.value = true
  try {
    const params = new URLSearchParams({
      page: currentPage.value.toString(),
      limit: perPage.value.toString(),
      sortBy: 'created_at',
      sortOrder: 'desc'
    })
    
    if (searchQuery.value.trim()) {
      params.append('search', searchQuery.value.trim())
    }
    
    if (filterBy.value && filterValue.value.trim()) {
      params.append('filterBy', filterBy.value)
      params.append('filterValue', filterValue.value.trim())
    }
    
    const response = await fetch(`${API_BASE_URL}/crawled-data?${params.toString()}`)
    const data = await response.json()
    
    crawledData.value = data.data || []
    totalItems.value = data.total || 0
    totalPages.value = data.totalPages || 0
  } catch (error) {
    console.error('Error fetching crawled data:', error)
    showNotification('Failed to fetch crawled data', 'danger')
  } finally {
    loading.value = false
  }
}

const createCrawledData = async (data) => {
  try {
    const response = await fetch(`${API_BASE_URL}/crawled-data`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    
    if (!response.ok) {
      throw new Error('Failed to create crawled data')
    }
    
    await fetchCrawledData()
    showNotification('Crawled data created successfully', 'success')
  } catch (error) {
    console.error('Error creating crawled data:', error)
    showNotification('Failed to create crawled data', 'danger')
  }
}

const updateCrawledData = async (data) => {
  try {
    const response = await fetch(`${API_BASE_URL}/crawled-data/${data.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    
    if (!response.ok) {
      throw new Error('Failed to update crawled data')
    }
    
    await fetchCrawledData()
    showNotification('Crawled data updated successfully', 'success')
  } catch (error) {
    console.error('Error updating crawled data:', error)
    showNotification('Failed to update crawled data', 'danger')
  }
}

const deleteCrawledData = async (data) => {
  try {
    const response = await fetch(`${API_BASE_URL}/crawled-data/${data.id}`, {
      method: 'DELETE',
    })
    
    if (!response.ok) {
      throw new Error('Failed to delete crawled data')
    }
    
    await fetchCrawledData()
    showNotification('Crawled data deleted successfully', 'success')
  } catch (error) {
    console.error('Error deleting crawled data:', error)
    showNotification('Failed to delete crawled data', 'danger')
  }
}

// // Event handlers
// const handleAddData = () => {
//   editingData.value = null
//   isEditMode.value = false
//   showForm.value = true
// }

const handleEditData = (data) => {
  editingData.value = { ...data }
  isEditMode.value = true
  showForm.value = true
}

const handleDeleteData = async (data) => {
  await deleteCrawledData(data)
}

const handleBulkDelete = (selectedItems) => {
  selectedItemsForBulkDelete.value = selectedItems
  isBulkDeleteModalActive.value = true
  console.log(selectedItems)
}

const confirmBulkDelete = async () => {
  try {
    loading.value = true
    
    // Delete all selected items in parallel
    const deletePromises = selectedItemsForBulkDelete.value.map(item => deleteCrawledData(item))
    await Promise.all(deletePromises)
    
    showNotification(`Successfully deleted ${selectedItemsForBulkDelete.value.length} item(s)`, 'success')
    isBulkDeleteModalActive.value = false
    selectedItemsForBulkDelete.value = []
  } catch (error) {
    console.error('Error bulk deleting items:', error)
    showNotification('Failed to delete some items', 'danger')
  } finally {
    loading.value = false
  }
}

const handleSaveData = async (data) => {
  if (isEditMode.value) {
    // Ensure we have the correct ID for update
    const updateData = { ...data }
    if (editingData.value && editingData.value.id) {
      updateData.id = editingData.value.id
    }
    await updateCrawledData(updateData)
  } else {
    await createCrawledData(data)
  }
}

// Handle search
const handleSearch = () => {
  currentPage.value = 1
  fetchCrawledData()
}

// Handle filter
const handleFilter = () => {
  currentPage.value = 1
  fetchCrawledData()
}

// Clear search and filter
const clearSearchAndFilter = () => {
  searchQuery.value = ''
  filterBy.value = ''
  filterValue.value = ''
  currentPage.value = 1
  fetchCrawledData()
}

// Handle selection change
const handleSelectionChange = (selectedItemsList) => {
  selectedItemsForBulkDelete.value = selectedItemsList
}

const handleRefresh = () => {
  fetchCrawledData()
}

const handlePageChange = (page) => {
  currentPage.value = page
  fetchCrawledData()
}

const handlePerPageChange = (newPerPage) => {
  perPage.value = newPerPage
  currentPage.value = 1 // Reset to first page
  fetchCrawledData()
}

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

const showNotification = (message, type = 'info') => {
  notification.value = { show: true, message, type }
  setTimeout(() => {
    notification.value.show = false
  }, 3000)
}

// Initialize
onMounted(() => {
  fetchCrawledData()
})
</script>

<template>
  <LayoutAuthenticated>
    <SectionMain>
      <!-- <SectionTitleLineWithButton :icon="mdiTableBorder" title="Crawled Data Management" main>
        <BaseButton
          :icon="mdiPlus"
          label="Add Data"
          color="success"
          disabled
          @click="handleAddData"
        />
      </SectionTitleLineWithButton> -->

      <NotificationBar 
        v-if="notification.show"
        :color="notification.type" 
        :icon="mdiRefresh"
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

      <CardBox class="mb-6 overflow-hidden" has-table>
        <div v-if="loading" class="p-6 text-center">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p class="mt-2">Loading crawled data...</p>
        </div>
        
        <div v-else>
          <div class="sticky top-0 z-10 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-600 pb-4 mb-4">
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div class="flex flex-col gap-2">
                <h3 class="text-lg font-semibold">Crawled Data List</h3>
                <p class="text-sm text-red-600 dark:text-gray-400">Profit Amount = (Price Goat - 24% - 1500) - (Price snkrdunk + 10%)</p>
              </div>
               <div class="flex items-center gap-4">
                 <span class="text-sm text-gray-600 dark:text-gray-400">{{ selectedItemsForBulkDelete.length }} item(s) selected</span>
                 <div class="flex gap-2">
                   <BaseButton
                     :icon="mdiRefresh"
                     label="Refresh"
                     color="success"
                     small
                     @click="handleRefresh"
                   />
                 </div>
               </div>
            </div>
          </div>
          <DataTable
            :data="crawledData"
            :columns="columns"
            :checkable="true"
            :sortable="true"
            :per-page="perPage"
            :table-height="'430px'"
            @edit="handleEditData"
            @delete="handleDeleteData"
            @selection-change="handleSelectionChange"
            @bulk-delete="handleBulkDelete"
          />
          
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
    </SectionMain>

    <CrawledDataForm
      v-model="showForm"
      :data="editingData"
      :is-edit="isEditMode"
      @save="handleSaveData"
      />

      <!-- Bulk Delete Confirmation Modal -->
      <CardBoxModal 
        v-model="isBulkDeleteModalActive" 
        title="Confirm Bulk Delete" 
        button="danger" 
        has-cancel
        @confirm="confirmBulkDelete"
      >
        <p>Are you sure you want to delete <strong>{{ selectedItemsForBulkDelete.length }}</strong> selected item(s)?</p>
        <p class="text-sm text-gray-600 dark:text-gray-400 mt-2">
          This action cannot be undone.
        </p>
        <div v-if="selectedItemsForBulkDelete.length > 0" class="mt-4 max-h-40 overflow-y-auto">
          <p class="text-sm font-semibold mb-2">Selected items:</p>
          <ul class="text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <li v-for="item in selectedItemsForBulkDelete.slice(0, 5)" :key="item.id" class="truncate">
              {{ item.product_name + " [Size:" + item.size_goat + "]" }}
            </li>
            <li v-if="selectedItemsForBulkDelete.length > 5" class="text-gray-500">
              ... and {{ selectedItemsForBulkDelete.length - 5 }} more
            </li>
          </ul>
        </div>
      </CardBoxModal>
    </LayoutAuthenticated>
  </template>
