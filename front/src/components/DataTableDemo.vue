<script setup>
import { ref } from 'vue'
import DataTable from '@/components/DataTable.vue'
import CardBox from '@/components/CardBox.vue'
import SectionTitleLineWithButton from '@/components/SectionTitleLineWithButton.vue'
import { mdiTableBorder } from '@mdi/js'

// Sample data for different use cases
const users = ref([
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'active' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User', status: 'active' },
  { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'Editor', status: 'inactive' },
  { id: 4, name: 'Alice Brown', email: 'alice@example.com', role: 'User', status: 'active' }
])

const orders = ref([
  { id: 1, customer: 'John Doe', total: 299.99, status: 'completed', date: '2024-01-15' },
  { id: 2, customer: 'Jane Smith', total: 149.50, status: 'pending', date: '2024-01-16' },
  { id: 3, customer: 'Bob Johnson', total: 599.99, status: 'shipped', date: '2024-01-17' },
  { id: 4, customer: 'Alice Brown', total: 89.99, status: 'cancelled', date: '2024-01-18' }
])

const products = ref([
  { id: 1, name: 'iPhone 15', price: 999.99, category: 'Electronics', stock: 50 },
  { id: 2, name: 'MacBook Air', price: 1199.99, category: 'Electronics', stock: 25 },
  { id: 3, name: 'Nike Shoes', price: 150.00, category: 'Sports', stock: 100 },
  { id: 4, name: 'Coffee Maker', price: 89.99, category: 'Home', stock: 30 }
])

// Column configurations
const userColumns = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'email', label: 'Email', sortable: true },
  { key: 'role', label: 'Role', sortable: true },
  { 
    key: 'status', 
    label: 'Status', 
    sortable: true,
    render: (value) => value === 'active' ? 'Active' : 'Inactive'
  }
]

const orderColumns = [
  { key: 'id', label: 'Order ID', sortable: true },
  { key: 'customer', label: 'Customer', sortable: true },
  { 
    key: 'total', 
    label: 'Total', 
    sortable: true,
    render: (value) => `$${parseFloat(value).toFixed(2)}`
  },
  { 
    key: 'status', 
    label: 'Status', 
    sortable: true,
    render: (value) => {
      const statusColors = {
        completed: 'text-green-600',
        pending: 'text-yellow-600',
        shipped: 'text-blue-600',
        cancelled: 'text-red-600'
      }
      return `<span class="${statusColors[value] || 'text-gray-600'} font-semibold">${value.charAt(0).toUpperCase() + value.slice(1)}</span>`
    }
  },
  { 
    key: 'date', 
    label: 'Date', 
    sortable: true,
    render: (value) => new Date(value).toLocaleDateString()
  }
]

const productColumns = [
  { key: 'name', label: 'Product Name', sortable: true },
  { 
    key: 'price', 
    label: 'Price', 
    sortable: true,
    render: (value) => `$${parseFloat(value).toFixed(2)}`
  },
  { key: 'category', label: 'Category', sortable: true },
  { 
    key: 'stock', 
    label: 'Stock', 
    sortable: true,
    render: (value) => value > 0 ? value : 'Out of Stock'
  }
]

// Event handlers
const handleUserEdit = (user) => {
  console.log('Edit user:', user)
}

const handleUserDelete = (user) => {
  console.log('Delete user:', user)
}

const handleOrderEdit = (order) => {
  console.log('Edit order:', order)
}

const handleOrderDelete = (order) => {
  console.log('Delete order:', order)
}

const handleProductEdit = (product) => {
  console.log('Edit product:', product)
}

const handleProductDelete = (product) => {
  console.log('Delete product:', product)
}
</script>

<template>
  <div class="space-y-6">
    <!-- Users Table -->
    <CardBox has-table>
      <SectionTitleLineWithButton :icon="mdiTableBorder" title="Users Management" />
      <DataTable
        :data="users"
        :columns="userColumns"
        :checkable="true"
        :sortable="true"
        :per-page="5"
        @edit="handleUserEdit"
        @delete="handleUserDelete"
      />
    </CardBox>

    <!-- Orders Table -->
    <CardBox has-table>
      <SectionTitleLineWithButton :icon="mdiTableBorder" title="Orders Management" />
      <DataTable
        :data="orders"
        :columns="orderColumns"
        :checkable="true"
        :sortable="true"
        :per-page="5"
        @edit="handleOrderEdit"
        @delete="handleOrderDelete"
      />
    </CardBox>

    <!-- Products Table -->
    <CardBox has-table>
      <SectionTitleLineWithButton :icon="mdiTableBorder" title="Products Management" />
      <DataTable
        :data="products"
        :columns="productColumns"
        :checkable="true"
        :sortable="true"
        :per-page="5"
        @edit="handleProductEdit"
        @delete="handleProductDelete"
      />
    </CardBox>
  </div>
</template>
