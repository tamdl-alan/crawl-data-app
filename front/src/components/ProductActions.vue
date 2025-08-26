<script setup>
import { mdiEye, mdiTrashCan, mdiPencil, mdiDownload } from '@mdi/js'
import BaseButtons from '@/components/BaseButtons.vue'
import BaseButton from '@/components/BaseButton.vue'

const props = defineProps({
  item: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['view', 'edit', 'delete', 'crawl'])

const handleView = () => {
  emit('view', props.item)
}

const handleEdit = () => {
  emit('edit', props.item)
}

const handleDelete = () => {
  emit('delete', props.item)
}

const handleCrawl = () => {
  emit('crawl', props.item)
}
</script>

<template>
  <BaseButtons type="justify-start lg:justify-end" no-wrap>
    <BaseButton 
      color="info" 
      :icon="mdiEye" 
      small 
      @click="handleView" 
    />
    <BaseButton 
      color="warning" 
      :icon="mdiPencil" 
      small 
      @click="handleEdit" 
    />
    <BaseButton
      color="danger"
      :icon="mdiTrashCan"
      small
      @click="handleDelete"
    />
    <BaseButton
      color="success"
      :icon="mdiDownload"
      small
      :loading="item.crawling"
      :label="item.crawling ? 'Crawling...' : 'Crawl'"
      @click="handleCrawl"
    />
  </BaseButtons>
</template>
