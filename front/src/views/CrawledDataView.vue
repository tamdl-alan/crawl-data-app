<script setup>
import { ref, onMounted } from 'vue'
import { mdiRefresh } from '@mdi/js'
import SectionMain from '@/components/SectionMain.vue'
import NotificationBar from '@/components/NotificationBar.vue'
import DataTable from '@/components/DataTable.vue'
import CrawledDataForm from '@/components/CrawledDataForm.vue'
import CardBox from '@/components/CardBox.vue'
import LayoutAuthenticated from '@/layouts/LayoutAuthenticated.vue'
// import SectionTitleLineWithButton from '@/components/SectionTitleLineWithButton.vue'
import BaseButton from '@/components/BaseButton.vue'

const API_BASE_URL = 'http://localhost:3000'

const crawledData = ref([])
const loading = ref(false)
const showForm = ref(false)
const editingData = ref(null)
const isEditMode = ref(false)
const notification = ref({ show: false, message: '', type: 'info' })

// Pagination state
const currentPage = ref(1)
const perPage = ref(20)
const totalItems = ref(0)
const totalPages = ref(0)
const pageSizeOptions = [10, 20, 50, 100]

// Table columns configuration - matching crawled_data table schema
const columns = [
  { key: '#', label: '#', sortable: false },
  { 
    key: 'product_name', 
    label: 'Product Name', 
    width: '200px',
    sortable: true,
    render: (value, row) => {
      if (row.product_url) {
        return `<a href="${row.product_url}" target="_blank" class="text-blue-600 hover:text-blue-800 underline">${value}</a>`
      }
      return value
    }
  },
  { key: 'size_goat', label: 'Size Goat', sortable: true },
  { key: 'price_goat', label: 'Price Goat', sortable: true, render: (value) => `¥${Math.round(value || 0).toLocaleString()}` },
  { key: 'size_snkrdunk', label: 'Size Snkrdunk', sortable: true },
  { key: 'price_snkrdunk', label: 'Price Snkrdunk', sortable: true, render: (value) => `¥${Math.round(value || 0).toLocaleString()}` },
  { key: 'profit_amount', label: 'Profit Amount', sortable: true, render: (value) => `¥${Math.round(value || 0).toLocaleString()}` },
  { key: 'selling_price', label: 'Selling Price', sortable: true, render: (value) => `¥${Math.round(value || 0).toLocaleString()}` },
  { 
    key: 'image_url', 
    label: 'Image', 
    sortable: false, 
    render: (value) => {
      if (value) {
        return `<img src="${value}" alt="Product Image" class="w-12 h-12 object-cover rounded border" onerror="this.style.display='none'">`
      }
      return ''
    }
  },
  { key: 'note', label: 'Note', sortable: false, width: '200px' },
  { 
    key: 'created_at', 
    label: 'Created', 
    sortable: true,
    render: (value) => new Date(value).toLocaleDateString()
  },
  { 
    key: 'updated_at', 
    label: 'Updated', 
    sortable: true,
    render: (value) => new Date(value).toLocaleDateString()
  }
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
    
    const response = await fetch(`${API_BASE_URL}/crawled-data?${params}`)
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

      <CardBox class="mb-6 overflow-hidden" has-table>
        <div v-if="loading" class="p-6 text-center">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p class="mt-2">Loading crawled data...</p>
        </div>
        
        <div v-else>
          <div class="sticky top-0 z-10 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-600 pb-4 mb-4">
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <h3 class="text-lg font-semibold">Crawled Data List</h3>
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
              <div class="flex items-center gap-2">
                <span class="text-sm text-gray-600 dark:text-gray-400">
                  {{ totalItems }} total items
                </span>
                <BaseButton
                  :icon="mdiRefresh"
                  label="Refresh"
                  color="success"
                  small
                  class="mr-3"
                  @click="handleRefresh"
                />
              </div>
            </div>
          </div>
          <div class="overflow-x-auto">
            <div class="min-w-full" style="min-width: 1200px;">
              <DataTable
                :data="crawledData"
                :columns="columns"
                :checkable="true"
                :sortable="true"
                :per-page="perPage"
                @edit="handleEditData"
                @delete="handleDeleteData"
              />
            </div>
          </div>
          
          <!-- Custom Pagination -->
          <div v-if="totalPages > 1" class="p-4 border-t border-gray-200 dark:border-slate-600">
            <div class="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div class="text-sm text-gray-600 dark:text-gray-400">
                Showing {{ ((currentPage - 1) * perPage) + 1 }} to {{ Math.min(currentPage * perPage, totalItems) }} of {{ totalItems }} items
              </div>
              <div class="flex items-center gap-2">
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
  </LayoutAuthenticated>
</template>
