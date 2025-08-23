<script setup>
import AsideMenuLayer from '@/components/AsideMenuLayer.vue'
import OverlayLayer from '@/components/OverlayLayer.vue'

defineProps({
  menu: {
    type: Array,
    required: true,
  },
  isAsideMobileExpanded: Boolean,
  isAsideLgActive: Boolean,
})

const emit = defineEmits(['menu-click', 'aside-lg-close-click'])

const menuClick = (event, item) => {
  emit('menu-click', event, item)
}

const asideLgCloseClick = (event) => {
  emit('aside-lg-close-click', event)
}
</script>

<template>
  <div>
    <AsideMenuLayer
      :menu="menu"
      :class="[
        { 'left-0': isAsideLgActive },
        { '-left-60': !isAsideLgActive },
      ]"
      @menu-click="menuClick"
      @aside-lg-close-click="asideLgCloseClick"
    />
    <OverlayLayer v-show="isAsideMobileExpanded" z-index="z-30" @overlay-click="asideLgCloseClick" />
  </div>
</template>
