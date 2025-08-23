<script setup>
import { ref, watch } from 'vue'
import CardBoxModal from '@/components/CardBoxModal.vue'
import FormField from '@/components/FormField.vue'
import FormControl from '@/components/FormControl.vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  product: {
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
  goat_url: '',
  goat_id: '',
  snkrdunk_api: '',
  type: ''
})

const errors = ref({})

const resetForm = () => {
  form.value = {
    goat_url: '',
    goat_id: '',
    snkrdunk_api: '',
    type: ''
  }
  errors.value = {}
}

const validateForm = () => {
  errors.value = {}
  
  if (!form.value.goat_url.trim()) {
    errors.value.goat_url = 'Goat URL is required'
  }
  
  if (!form.value.goat_id || form.value.goat_id === '') {
    errors.value.goat_id = 'Goat ID is required'
  }
  
  if (!form.value.snkrdunk_api.trim()) {
    errors.value.snkrdunk_api = 'Snkrdunk API is required'
  }
  
  if (!form.value.type.trim()) {
    errors.value.type = 'Type is required'
  }
  
  return Object.keys(errors.value).length === 0
}

const handleSave = () => {
  if (validateForm()) {
    // Convert goat_id to number before saving
    const productData = {
      ...form.value,
      goat_id: parseInt(form.value.goat_id)
    }
    emit('save', productData)
    closeModal()
  }
}

const closeModal = () => {
  emit('update:modelValue', false)
  resetForm()
}

// Watch for product changes to populate form
watch(() => props.product, (newProduct) => {
  if (newProduct && Object.keys(newProduct).length > 0) {
    form.value = { 
      ...newProduct,
      goat_id: newProduct.goat_id ? newProduct.goat_id.toString() : ''
    }
  } else {
    resetForm()
  }
}, { immediate: true, deep: true })
</script>

<template>
  <CardBoxModal 
    :model-value="modelValue" 
    :title="isEdit ? 'Edit Product Mapping' : 'Add New Product Mapping'"
    has-cancel
    @update:model-value="(value) => emit('update:modelValue', value)"
    @confirm="handleSave"
    @cancel="closeModal"
  >
    <div class="space-y-4">
      <FormField label="Goat URL" :error="errors.goat_url">
        <FormControl
          v-model="form.goat_url"
          :icon="null"
          placeholder="e.g., sneakers/gel-kayano-12-1-silver"
        />
      </FormField>

      <FormField label="Goat ID" :error="errors.goat_id">
        <FormControl
          v-model="form.goat_id"
          :icon="null"
          placeholder="e.g., 1627005"
          type="number"
        />
      </FormField>

      <FormField label="Snkrdunk API" :error="errors.snkrdunk_api">
        <FormControl
          v-model="form.snkrdunk_api"
          :icon="null"
          placeholder="e.g., sneakers/1203A827-100/size/list"
        />
      </FormField>

      <FormField label="Type" :error="errors.type">
        <select
          v-model="form.type"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-800 dark:border-slate-600 dark:text-white"
        >
          <option value="SHOE">Shoe</option>
          <option value="CLOTHES">Clothes</option>
        </select>
      </FormField>
    </div>
  </CardBoxModal>
</template>
