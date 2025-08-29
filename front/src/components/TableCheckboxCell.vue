<script setup>
import { ref, watch, nextTick } from 'vue'

const props = defineProps({
  type: {
    type: String,
    default: 'td',
  },
  checked: {
    type: [Boolean, String],
    default: false,
  },
})

const emit = defineEmits(['checked'])

const isChecked = ref(false)
const isIndeterminate = ref(false)
const checkboxRef = ref(null)

// Watch for external changes to checked prop
watch(() => props.checked, async (newVal) => {
  if (newVal === 'indeterminate') {
    isIndeterminate.value = true
    isChecked.value = false
  } else {
    isIndeterminate.value = false
    isChecked.value = Boolean(newVal)
  }
  
  // Use nextTick to ensure DOM is updated before setting indeterminate
  await nextTick()
  if (checkboxRef.value) {
    checkboxRef.value.indeterminate = isIndeterminate.value
  }
}, { immediate: true })

// Watch for internal changes
watch(isChecked, (newVal) => {
  if (!isIndeterminate.value) {
    emit('checked', newVal)
  }
})

const handleClick = () => {
  if (isIndeterminate.value) {
    // If indeterminate, clicking should check all (will trigger modal in parent)
    emit('checked', true)
  } else {
    // Normal toggle behavior
    isChecked.value = !isChecked.value
    emit('checked', isChecked.value)
  }
}
</script>

<template>
  <component :is="type" class="lg:w-1 text-center">
    <label class="checkbox">
      <input 
        ref="checkboxRef"
        :checked="isChecked" 
        type="checkbox" 
        @click="handleClick"
      />
      <span class="check" />
    </label>
  </component>
</template>
