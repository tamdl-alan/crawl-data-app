<script setup>
import { ref, onMounted } from 'vue'
import { mdiPlus, mdiTableBorder, mdiRefresh } from '@mdi/js'
import SectionMain from '@/components/SectionMain.vue'
import NotificationBar from '@/components/NotificationBar.vue'
import DataTable from '@/components/DataTable.vue'
import ProductForm from '@/components/ProductForm.vue'
import TypeBadge from '@/components/TypeBadge.vue'
import CardBox from '@/components/CardBox.vue'
import LayoutAuthenticated from '@/layouts/LayoutAuthenticated.vue'
import SectionTitleLineWithButton from '@/components/SectionTitleLineWithButton.vue'
import BaseButton from '@/components/BaseButton.vue'

const API_BASE_URL = 'http://localhost:3000'

const products = ref([])
const loading = ref(false)
const showForm = ref(false)
const editingProduct = ref(null)
const isEditMode = ref(false)
const notification = ref({ show: false, message: '', type: 'info' })

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
    const response = await fetch(`${API_BASE_URL}/products`)
    const data = await response.json()
    products.value = data || []
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

const handleRefresh = () => {
  fetchProducts()
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
          label="Add Mapping"
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

      <CardBox class="mb-6" has-table>
        <div v-if="loading" class="p-6 text-center">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p class="mt-2">Loading products...</p>
        </div>
        
        <div v-else>
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-semibold">Product Mappings List</h3>
            <BaseButton
              :icon="mdiRefresh"
              label="Refresh"
              color="info"
              small
              @click="handleRefresh"
            />
          </div>
          <DataTable
            :data="products"
            :columns="columns"
            :checkable="true"
            :sortable="true"
            :per-page="10"
            @edit="handleEditProduct"
            @delete="handleDeleteProduct"
          />
        </div>
      </CardBox>
    </SectionMain>

    <ProductForm
      v-model="showForm"
      :product="editingProduct"
      :is-edit="isEditMode"
      @save="handleSaveProduct"
    />
  </LayoutAuthenticated>
</template>
