<script setup>
import { ref, onMounted } from 'vue'
import { mdiPlus, mdiTableBorder, mdiRefresh, mdiDownload } from '@mdi/js'
import SectionMain from '@/components/SectionMain.vue'
import NotificationBar from '@/components/NotificationBar.vue'
import DataTable from '@/components/DataTable.vue'
import ProductForm from '@/components/ProductForm.vue'
import TypeBadge from '@/components/TypeBadge.vue'
import CardBox from '@/components/CardBox.vue'
import CardBoxModal from '@/components/CardBoxModal.vue'
import LayoutAuthenticated from '@/layouts/LayoutAuthenticated.vue'
import SectionTitleLineWithButton from '@/components/SectionTitleLineWithButton.vue'
import BaseButton from '@/components/BaseButton.vue'
import ProductActions from '@/components/ProductActions.vue'

// Use relative URLs for API calls (nginx will proxy them)
const API_BASE_URL = ''

const products = ref([])
const loading = ref(false)
const showForm = ref(false)
const editingProduct = ref(null)
const isEditMode = ref(false)
const notification = ref({ show: false, message: '', type: 'info' })
const selectedItems = ref([])
const isCrawlAllModalActive = ref(false)

// Search and filter state
const searchQuery = ref('')
const filterBy = ref('')
const filterValue = ref('')
const filterOptions = [
  { value: '', label: 'All Fields' },
  { value: 'goat_id', label: 'Goat ID' },
  { value: 'type', label: 'Type' }
]

// Pagination state
const currentPage = ref(1)
const perPage = ref(100)
const totalItems = ref(0)
const totalPages = ref(0)
const pageSizeOptions = [10, 20, 50, 100]

// Table columns configuration - matching current database schema
const columns = [
  { key: '#', label: '#', sortable: false },
  { key: 'goat_url', label: 'Goat URL', sortable: true },
  { key: 'goat_id', label: 'Goat ID', sortable: true },
  { key: 'snkrdunk_api', label: 'Snkrdunk API', sortable: false },
  { 
    key: 'type', 
    label: 'Type', 
    sortable: true,
    component: TypeBadge
  },
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
const fetchProducts = async () => {
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
    
    const response = await fetch(`${API_BASE_URL}/products?${params.toString()}`)
    const data = await response.json()
    
    products.value = data.data || []
    totalItems.value = data.total || 0
    totalPages.value = data.totalPages || 0
  } catch (error) {
    console.error('Error fetching products:', error)
    showNotification('Failed to fetch product mappings', 'danger')
  } finally {
    loading.value = false
  }
}

const createProduct = async (productData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(productData),
    })
    
    if (!response.ok) {
      throw new Error('Failed to create product')
    }
    
    await fetchProducts()
    showNotification('Product mapping created successfully', 'success')
  } catch (error) {
    console.error('Error creating product:', error)
    showNotification('Failed to create product mapping', 'danger')
  }
}

const updateProduct = async (productData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${productData.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(productData),
    })
    
    if (!response.ok) {
      throw new Error('Failed to update product')
    }
    
    await fetchProducts()
    showNotification('Product mapping updated successfully', 'success')
  } catch (error) {
    console.error('Error updating product:', error)
    showNotification('Failed to update product mapping', 'danger')
  }
}

const deleteProduct = async (product) => {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${product.id}`, {
      method: 'DELETE',
    })
    
    if (!response.ok) {
      throw new Error('Failed to delete product')
    }
    
    await fetchProducts()
    showNotification('Product mapping deleted successfully', 'success')
  } catch (error) {
    console.error('Error deleting product:', error)
    showNotification('Failed to delete product mapping', 'danger')
  }
}

// Event handlers
const handleAddProduct = () => {
  editingProduct.value = null
  isEditMode.value = false
  showForm.value = true
}

const handleEditProduct = (product) => {
  editingProduct.value = { ...product }
  isEditMode.value = true
  showForm.value = true
}

const handleDeleteProduct = async (product) => {
  await deleteProduct(product)
}

const handleSaveProduct = async (productData) => {
  if (isEditMode.value) {
    // Ensure we have the correct ID for update
    const updateData = { ...productData }
    if (editingProduct.value && editingProduct.value.id) {
      updateData.id = editingProduct.value.id
    }
    await updateProduct(updateData)
  } else {
    await createProduct(productData)
  }
}

// Handle search
const handleSearch = () => {
  currentPage.value = 1
  fetchProducts()
}

// Handle filter
const handleFilter = () => {
  currentPage.value = 1
  fetchProducts()
}

// Clear search and filter
const clearSearchAndFilter = () => {
  searchQuery.value = ''
  filterBy.value = ''
  filterValue.value = ''
  currentPage.value = 1
  fetchProducts()
}

// Handle page change
const handlePageChange = (page) => {
  currentPage.value = page
  fetchProducts()
}

// Handle per page change
const handlePerPageChange = (newPerPage) => {
  perPage.value = newPerPage
  currentPage.value = 1 // Reset to first page
  fetchProducts()
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

// Handle selection change
const handleSelectionChange = (selectedItemsList) => {
  selectedItems.value = selectedItemsList
}

const handleRefresh = () => {
  fetchProducts()
}

const handleCrawlData = async (product) => {
  // Set loading state for this specific product
  product.crawling = true
  
  try {
    const response = await fetch(`${API_BASE_URL}/crawl-data`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: product.id,
        goat_url: product.goat_url,
        goat_id: product.goat_id,
        snkrdunk_api: product.snkrdunk_api,
        type: product.type
      }),
    })
    
    if (!response.ok) {
      throw new Error('Failed to crawl data')
    }
    
    const result = await response.json()
    showNotification(
      `Crawl completed: ${result.savedRecords} records saved, ${result.skippedRecords || 0} skipped`, 
      'success'
    )
  } catch (error) {
    console.error('Error crawling data:', error)
    showNotification('Failed to crawl data', 'danger')
  } finally {
    // Clear loading state
    product.crawling = false
  }
}

const handleCrawlAll = () => {
  if (!products.value.length) {
    showNotification('No products to crawl', 'warning')
    return
  }
  
  isCrawlAllModalActive.value = true
}

const executeCrawlAll = async () => {
  let successCount = 0
  let errorCount = 0
  
  for (const product of products.value) {
    try {
      product.crawling = true
      const response = await fetch(`${API_BASE_URL}/crawl-data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: product.id,
          goat_url: product.goat_url,
          goat_id: product.goat_id,
          snkrdunk_api: product.snkrdunk_api,
          type: product.type
        }),
      })
      
      if (response.ok) {
        const result = await response.json()
        successCount++
        console.log(`✅ Crawled ${product.goat_url}: ${result.savedRecords} records saved`)
      } else {
        errorCount++
        console.error(`❌ Failed to crawl ${product.goat_url}`)
      }
    } catch (error) {
      errorCount++
      console.error(`❌ Error crawling ${product.goat_url}:`, error)
    } finally {
      product.crawling = false
    }
  }
  
  showNotification(
    `Crawl All completed: ${successCount} successful, ${errorCount} failed`, 
    errorCount === 0 ? 'success' : 'warning'
  )
  
  isCrawlAllModalActive.value = false
}

const showNotification = (message, type = 'info') => {
  notification.value = { show: true, message, type }
  setTimeout(() => {
    notification.value.show = false
  }, 3000)
}

// Initialize
onMounted(() => {
  fetchProducts()
})
</script>

<template>
  <LayoutAuthenticated>
    <SectionMain>
      <SectionTitleLineWithButton :icon="mdiTableBorder" title="Product Mapping Management" main>
        <BaseButton
          :icon="mdiPlus"
          label="Add"
          color="success"
          @click="handleAddProduct"
        />
      </SectionTitleLineWithButton>

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
              placeholder="Search by URL, ID, API, or type..."
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

      <CardBox class="mb-6" has-table>
        <div v-if="loading" class="p-6 text-center">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p class="mt-2">Loading products...</p>
        </div>
        
        <div v-else>
          <div class="flex justify-between items-center mb-4">
              <div>
                <h3 class="text-lg font-semibold">Product Mappings List</h3>
                <p class="text-sm text-gray-600 dark:text-gray-400">Manage product mappings for crawling data from GOAT and SNKRDUNK</p>
              </div>
              <div class="flex items-center gap-4">
                <span class="text-sm text-gray-600 dark:text-gray-400">{{ selectedItems.length }} item(s) selected</span>
                <div class="flex gap-2">
                  <BaseButton
                    :icon="mdiDownload"
                    label="Crawl All"
                    color="danger"
                    small
                    @click="handleCrawlAll"
                  />
                  <BaseButton
                    :icon="mdiRefresh"
                    label="Refresh"
                    color="info"
                    small
                    @click="handleRefresh"
                  />
                </div>
              </div>
          </div>
          <DataTable
            :data="products"
            :columns="columns"
            :checkable="true"
            :sortable="true"
            :per-page="perPage"
            :sort-storage-key="'product-sort'"
            @edit="handleEditProduct"
            @delete="handleDeleteProduct"
            @crawl="handleCrawlData"
            @selection-change="handleSelectionChange"
          >
            <template #actions="{ item, handleView, handleEdit, handleDelete }">
              <ProductActions 
                :item="item"
                @view="handleView"
                @edit="handleEdit"
                @delete="handleDelete"
                @crawl="handleCrawlData"
              />
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
              <div class="flex items-center gap-2">
                <!-- First Page Button -->
                <BaseButton
                  :disabled="currentPage === 1"
                  color="info"
                  small
                  @click="handlePageChange(1)"
                  label="First"
                  class="font-bold"
                />
                
                <BaseButton
                  :disabled="currentPage === 1"
                  color="whiteDark"
                  small
                  @click="handlePageChange(currentPage - 1)"
                  label="Previous"
                />
                
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
                  label="Next"
                />
                
                <!-- Last Page Button -->
                <BaseButton
                  :disabled="currentPage === totalPages"
                  color="info"
                  small
                  @click="handlePageChange(totalPages)"
                  label="Last"
                  class="font-bold"
                />
              </div>
            </div>
          </div>
        </div>
      </CardBox>
    </SectionMain>

    <ProductForm
      v-model="showForm"
      :product="editingProduct"
      :is-edit="isEditMode"
      @save="handleSaveProduct"
    />

    <!-- Crawl All Confirmation Modal -->
    <CardBoxModal
      v-model="isCrawlAllModalActive"
      title="Confirm Crawl All"
      button="danger"
      button-label="Yes, Crawl All"
      has-cancel
      @confirm="executeCrawlAll"
    >
      <p>
        Are you sure you want to crawl all <strong>{{ products.length }}</strong> products? 
        This may take a while and will process each product individually.
      </p>
    </CardBoxModal>
  </LayoutAuthenticated>
</template>
