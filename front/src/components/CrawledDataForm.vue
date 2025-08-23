<script setup>
import { ref, watch, computed } from 'vue'
import CardBoxModal from '@/components/CardBoxModal.vue'
import FormField from '@/components/FormField.vue'
import FormControl from '@/components/FormControl.vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  data: {
    type: Object,
    default: () => ({})
  },
  isEdit: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'save'])

const form = ref({
  product_url: '',
  product_name: '',
  size_goat: '',
  price_goat: 0,
  size_snkrdunk: '',
  price_snkrdunk: 0,
  profit_amount: 0,
  selling_price: 0,
  image_url: '',
  note: ''
})

const isEditMode = computed(() => props.isEdit)

const errors = ref({})

const resetForm = () => {
  form.value = {
    product_url: '',
    product_name: '',
    size_goat: '',
    price_goat: 0,
    size_snkrdunk: '',
    price_snkrdunk: 0,
    profit_amount: 0,
    selling_price: 0,
    image_url: '',
    note: ''
  }
  errors.value = {}
}

const validateForm = () => {
  errors.value = {}
  
  if (!isEditMode.value) {
    // Only validate required fields for new records
    if (!form.value.product_url.trim()) {
      errors.value.product_url = 'Product URL is required'
    }
    
    if (!form.value.product_name.trim()) {
      errors.value.product_name = 'Product Name is required'
    }
  }
  
  // Validate numeric fields
  if (form.value.price_goat < 0) {
    errors.value.price_goat = 'Price Goat must be non-negative'
  }
  
  if (form.value.price_snkrdunk < 0) {
    errors.value.price_snkrdunk = 'Price Snkrdunk must be non-negative'
  }
  
  if (form.value.profit_amount < 0) {
    errors.value.profit_amount = 'Profit Amount must be non-negative'
  }
  
  if (form.value.selling_price < 0) {
    errors.value.selling_price = 'Selling Price must be non-negative'
  }
  
  return Object.keys(errors.value).length === 0
}



const handleSave = () => {
  if (validateForm()) {
    // Convert numeric fields to numbers before saving
    const dataToSave = {
      ...form.value,
      price_goat: parseFloat(form.value.price_goat) || 0,
      price_snkrdunk: parseFloat(form.value.price_snkrdunk) || 0,
      profit_amount: parseFloat(form.value.profit_amount) || 0,
      selling_price: parseFloat(form.value.selling_price) || 0
    }
    emit('save', dataToSave)
    closeModal()
  }
}

const closeModal = () => {
  emit('update:modelValue', false)
  resetForm()
}

// Watch for data changes to populate form
watch(() => props.data, (newData) => {
  if (newData && Object.keys(newData).length > 0) {
    form.value = { 
      ...newData,
      price_goat: newData.price_goat || 0,
      price_snkrdunk: newData.price_snkrdunk || 0,
      profit_amount: newData.profit_amount || 0,
      selling_price: newData.selling_price || 0
    }
  } else {
    resetForm()
  }
}, { immediate: true, deep: true })
</script>

<template>
  <CardBoxModal 
    :model-value="modelValue" 
    :title="isEdit ? 'Edit Crawled Data' : 'Add New Crawled Data'"
    has-cancel
    @update:model-value="(value) => emit('update:modelValue', value)"
    @confirm="handleSave"
    @cancel="closeModal"
  >
    <div class="space-y-4">
      <!-- Show all fields for new records -->
      <template v-if="!isEditMode">
        <FormField label="Product URL" :error="errors.product_url">
          <FormControl
            v-model="form.product_url"
            :icon="null"
            placeholder="e.g., https://www.goat.com/sneakers/..."
          />
        </FormField>

        <FormField label="Product Name" :error="errors.product_name">
          <FormControl
            v-model="form.product_name"
            :icon="null"
            placeholder="e.g., Air Jordan 1 Retro High OG Chicago 2022"
          />
        </FormField>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Size Goat" :error="errors.size_goat">
            <FormControl
              v-model="form.size_goat"
              :icon="null"
              placeholder="e.g., US 9"
            />
          </FormField>

          <FormField label="Price Goat ($)" :error="errors.price_goat">
            <FormControl
              v-model="form.price_goat"
              :icon="null"
              placeholder="0.00"
              type="number"
              step="0.01"
              min="0"
            />
          </FormField>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Size Snkrdunk" :error="errors.size_snkrdunk">
            <FormControl
              v-model="form.size_snkrdunk"
              :icon="null"
              placeholder="e.g., US 9"
            />
          </FormField>

          <FormField label="Price Snkrdunk ($)" :error="errors.price_snkrdunk">
            <FormControl
              v-model="form.price_snkrdunk"
              :icon="null"
              placeholder="0.00"
              type="number"
              step="0.01"
              min="0"
            />
          </FormField>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Profit Amount ($)" :error="errors.profit_amount">
            <FormControl
              v-model="form.profit_amount"
              :icon="null"
              placeholder="0.00"
              type="number"
              step="0.01"
              min="0"
            />
          </FormField>

          <FormField label="Selling Price ($)" :error="errors.selling_price">
            <FormControl
              v-model="form.selling_price"
              :icon="null"
              placeholder="0.00"
              type="number"
              step="0.01"
              min="0"
            />
          </FormField>
        </div>

        <FormField label="Image URL" :error="errors.image_url">
          <FormControl
            v-model="form.image_url"
            :icon="null"
            placeholder="e.g., https://example.com/image.jpg"
          />
        </FormField>
      </template>

      <!-- Show only editable fields for edit mode -->
      <template v-else>
        <div class="bg-gray-50 dark:bg-slate-700 p-4 rounded-lg mb-4">
          <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Read-only Information</h4>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <span class="font-medium">Product:</span> {{ form.product_name }}
            </div>
            <div>
              <span class="font-medium">Current Selling Price:</span> ${{ form.selling_price || 0 }}
            </div>
          </div>
        </div>
      </template>

      <!-- Always show Selling Price and Note for editing -->
      <FormField label="Selling Price ($)" :error="errors.selling_price">
        <FormControl
          v-model="form.selling_price"
          :icon="null"
          placeholder="0.00"
          type="number"
          step="0.01"
          min="0"
        />
      </FormField>

      <FormField label="Note" :error="errors.note">
        <textarea
          v-model="form.note"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-800 dark:border-slate-600 dark:text-white resize-none"
          placeholder="Additional notes..."
          rows="3"
        ></textarea>
      </FormField>
    </div>
  </CardBoxModal>
</template>
