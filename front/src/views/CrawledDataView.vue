<script setup>
import { ref, onMounted } from 'vue'
import { mdiPlus, mdiTableBorder, mdiRefresh } from '@mdi/js'
import SectionMain from '@/components/SectionMain.vue'
import NotificationBar from '@/components/NotificationBar.vue'
import DataTable from '@/components/DataTable.vue'
import CrawledDataForm from '@/components/CrawledDataForm.vue'
import CardBox from '@/components/CardBox.vue'
import LayoutAuthenticated from '@/layouts/LayoutAuthenticated.vue'
import SectionTitleLineWithButton from '@/components/SectionTitleLineWithButton.vue'
import BaseButton from '@/components/BaseButton.vue'

const API_BASE_URL = 'http://localhost:3000'

const crawledData = ref([])
const loading = ref(false)
const showForm = ref(false)
const editingData = ref(null)
const isEditMode = ref(false)
const notification = ref({ show: false, message: '', type: 'info' })

// Table columns configuration - matching crawled_data table schema
const columns = [
  { key: '#', label: '#', sortable: false },
  { 
    key: 'product_name', 
    label: 'Product Name', 
    sortable: true,
    render: (value, row) => {
      if (row.product_url) {
        return `<a href="${row.product_url}" target="_blank" class="text-blue-600 hover:text-blue-800 underline">${value}</a>`
      }
      return value
    }
  },
  { key: 'size_goat', label: 'Size Goat', sortable: true },
  { key: 'price_goat', label: 'Price Goat', sortable: true, render: (value) => `$${value || 0}` },
  { key: 'size_snkrdunk', label: 'Size Snkrdunk', sortable: true },
  { key: 'price_snkrdunk', label: 'Price Snkrdunk', sortable: true, render: (value) => `$${value || 0}` },
  { key: 'profit_amount', label: 'Profit Amount', sortable: true, render: (value) => `$${value || 0}` },
  { key: 'selling_price', label: 'Selling Price', sortable: true, render: (value) => `$${value || 0}` },
  { key: 'image_url', label: 'Image', sortable: false, render: (value) => value ? 'Yes' : 'No' },
  { key: 'note', label: 'Note', sortable: false },
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
    const response = await fetch(`${API_BASE_URL}/crawled-data`)
    const data = await response.json()
    crawledData.value = data.data || []
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

// Event handlers
const handleAddData = () => {
  editingData.value = null
  isEditMode.value = false
  showForm.value = true
}

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
      <SectionTitleLineWithButton :icon="mdiTableBorder" title="Crawled Data Management" main>
        <BaseButton
          :icon="mdiPlus"
          label="Add Data"
          color="success"
          @click="handleAddData"
        />
      </SectionTitleLineWithButton>

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
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <h3 class="text-lg font-semibold">Crawled Data List</h3>
              <BaseButton
                :icon="mdiRefresh"
                label="Refresh"
                color="success"
                small
                rounded-full
                @click="handleRefresh"
              />
            </div>
          </div>
          <div class="overflow-x-auto">
            <DataTable
              :data="crawledData"
              :columns="columns"
              :checkable="true"
              :sortable="true"
              :per-page="10"
              @edit="handleEditData"
              @delete="handleDeleteData"
            />
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
