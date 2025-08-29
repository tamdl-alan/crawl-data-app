<script setup>
import { ref } from 'vue'
import DataTable from '@/components/DataTable.vue'
import CardBox from '@/components/CardBox.vue'
import SectionTitleLineWithButton from '@/components/SectionTitleLineWithButton.vue'
import { mdiTableBorder } from '@mdi/js'

// Sample data
const data = ref([
  { 
    id: 1, 
    name: 'John Doe', 
    email: 'john@example.com', 
    phone: '+1-555-0123',
    address: '123 Main St, New York, NY 10001',
    company: 'Tech Corp',
    position: 'Senior Developer',
    salary: 85000,
    status: 'active',
    description: 'This is a very long description that demonstrates how text wrapping works in columns with different width settings.'
  },
  { 
    id: 2, 
    name: 'Jane Smith', 
    email: 'jane@example.com', 
    phone: '+1-555-0124',
    address: '456 Oak Ave, Los Angeles, CA 90210',
    company: 'Design Studio',
    position: 'UI/UX Designer',
    salary: 75000,
    status: 'active',
    description: 'Another long description to show how flexible columns handle content overflow and text wrapping.'
  },
  { 
    id: 3, 
    name: 'Bob Johnson', 
    email: 'bob@example.com', 
    phone: '+1-555-0125',
    address: '789 Pine Rd, Chicago, IL 60601',
    company: 'Marketing Plus',
    position: 'Marketing Manager',
    salary: 65000,
    status: 'inactive',
    description: 'Short description.'
  }
])

// Different column width configurations
const fixedWidthColumns = [
  { key: 'name', label: 'Fixed Width (150px)', sortable: true, width: '150px' },
  { key: 'email', label: 'Fixed Width (200px)', sortable: true, width: '200px' },
  { key: 'phone', label: 'Fixed Width (140px)', sortable: true, width: '140px', align: 'center' },
  { key: 'company', label: 'Fixed Width (120px)', sortable: true, width: '120px' },
  { key: 'status', label: 'Fixed Width (100px)', sortable: true, width: '100px', align: 'center' }
]

const flexibleColumns = [
  { key: 'name', label: 'Min Width (120px)', sortable: true, minWidth: '120px' },
  { key: 'email', label: 'Min Width (180px)', sortable: true, minWidth: '180px' },
  { key: 'phone', label: 'Min Width (140px)', sortable: true, minWidth: '140px' },
  { key: 'company', label: 'Min Width (150px)', sortable: true, minWidth: '150px' },
  { key: 'status', label: 'Min Width (100px)', sortable: true, minWidth: '100px' }
]

const mixedColumns = [
  { key: 'name', label: 'Fixed (150px)', sortable: true, width: '150px' },
  { key: 'email', label: 'Min-Max (180-250px)', sortable: true, minWidth: '180px', maxWidth: '250px' },
  { key: 'phone', label: 'Fixed (140px)', sortable: true, width: '140px', align: 'center' },
  { key: 'company', label: 'Flex Grow', sortable: true, flexGrow: 1, minWidth: '120px' },
  { key: 'status', label: 'Fixed (100px)', sortable: true, width: '100px', align: 'center' }
]

const responsiveColumns = [
  { key: 'name', label: 'Responsive Name', sortable: true, width: '20%', minWidth: '120px' },
  { key: 'email', label: 'Responsive Email', sortable: true, width: '25%', minWidth: '180px' },
  { key: 'phone', label: 'Responsive Phone', sortable: true, width: '15%', minWidth: '140px' },
  { key: 'company', label: 'Responsive Company', sortable: true, width: '20%', minWidth: '150px' },
  { key: 'status', label: 'Responsive Status', sortable: true, width: '10%', minWidth: '100px' },
  { key: 'description', label: 'Responsive Description', sortable: true, width: '10%', minWidth: '200px' }
]

const advancedColumns = [
  { key: 'name', label: 'Fixed Width', sortable: true, width: '150px', minWidth: '120px' },
  { key: 'email', label: 'Flexible Email', sortable: true, flexGrow: 2, minWidth: '180px' },
  { key: 'phone', label: 'Fixed Phone', sortable: true, width: '140px', minWidth: '120px', align: 'center' },
  { key: 'company', label: 'Flexible Company', sortable: true, flexGrow: 1, minWidth: '150px' },
  { key: 'position', label: 'Flexible Position', sortable: true, flexGrow: 1, minWidth: '160px' },
  { key: 'salary', label: 'Fixed Salary', sortable: true, width: '120px', minWidth: '100px', align: 'right' },
  { key: 'status', label: 'Fixed Status', sortable: true, width: '100px', minWidth: '80px', align: 'center' },
  { key: 'description', label: 'Flexible Description', sortable: true, flexGrow: 3, minWidth: '200px', maxWidth: '400px' }
]

// Event handlers
const handleEdit = (item) => {
  console.log('Edit item:', item)
}

const handleDelete = (item) => {
  console.log('Delete item:', item)
}
</script>

<template>
  <div class="space-y-8">
    <!-- Fixed Width Columns -->
    <CardBox has-table>
      <SectionTitleLineWithButton :icon="mdiTableBorder" title="Fixed Width Columns" />
      <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Columns với chiều rộng cố định (width). Khi table quá rộng, sẽ có scroll ngang.
      </p>
      <DataTable
        :data="data"
        :columns="fixedWidthColumns"
        :checkable="true"
        :sortable="true"
        :per-page="5"
        @edit="handleEdit"
        @delete="handleDelete"
      />
    </CardBox>

    <!-- Flexible Width Columns -->
    <CardBox has-table>
      <SectionTitleLineWithButton :icon="mdiTableBorder" title="Flexible Width Columns (Min Width)" />
      <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Columns với chiều rộng tối thiểu (minWidth). Columns sẽ mở rộng để lấp đầy không gian có sẵn.
      </p>
      <DataTable
        :data="data"
        :columns="flexibleColumns"
        :checkable="true"
        :sortable="true"
        :per-page="5"
        @edit="handleEdit"
        @delete="handleDelete"
      />
    </CardBox>

    <!-- Mixed Width Columns -->
    <CardBox has-table>
      <SectionTitleLineWithButton :icon="mdiTableBorder" title="Mixed Width Columns" />
      <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Kết hợp fixed width, min-width, max-width và flex-grow để tạo layout linh hoạt.
      </p>
      <DataTable
        :data="data"
        :columns="mixedColumns"
        :checkable="true"
        :sortable="true"
        :per-page="5"
        @edit="handleEdit"
        @delete="handleDelete"
      />
    </CardBox>

    <!-- Responsive Width Columns -->
    <CardBox has-table>
      <SectionTitleLineWithButton :icon="mdiTableBorder" title="Responsive Width Columns (%)" />
      <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Columns sử dụng phần trăm (%) để responsive theo chiều rộng container.
      </p>
      <DataTable
        :data="data"
        :columns="responsiveColumns"
        :checkable="true"
        :sortable="true"
        :per-page="5"
        @edit="handleEdit"
        @delete="handleDelete"
      />
    </CardBox>

    <!-- Advanced Width Columns -->
    <CardBox has-table>
      <SectionTitleLineWithButton :icon="mdiTableBorder" title="Advanced Width Configuration" />
      <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Demo với nhiều cột và các cấu hình width khác nhau. Sử dụng flex-grow để phân bổ không gian.
      </p>
      <DataTable
        :data="data"
        :columns="advancedColumns"
        :checkable="true"
        :sortable="true"
        :per-page="5"
        @edit="handleEdit"
        @delete="handleDelete"
      />
    </CardBox>
  </div>
</template>
