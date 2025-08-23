<script setup>
defineProps({
  type: {
    type: String,
    required: true
  }
})
</script>

<template>
  <span 
    :class="[
      'px-2 py-1 rounded-full text-xs font-medium',
      type === 'SHOE' 
        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
        : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    ]"
  >
    {{ type === 'SHOE' ? 'Shoe' : 'Clothes' }}
  </span>
</template>
