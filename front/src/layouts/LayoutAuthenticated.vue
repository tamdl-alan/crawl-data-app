<script setup>
import { mdiForwardburger, mdiBackburger } from '@mdi/js'
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import menuAside from '@/menuAside.js'
import menuNavBar from '@/menuNavBar.js'
import { useDarkModeStore } from '@/stores/darkMode.js'
import BaseIcon from '@/components/BaseIcon.vue'
import FormControl from '@/components/FormControl.vue'
import NavBar from '@/components/NavBar.vue'
import NavBarItemPlain from '@/components/NavBarItemPlain.vue'
import AsideMenu from '@/components/AsideMenu.vue'

const darkModeStore = useDarkModeStore()

const router = useRouter()

const isAsideMobileExpanded = ref(false)
const isAsideLgActive = ref(true) // Start with sidebar visible

// Function to check screen size and update sidebar state
const updateSidebarState = () => {
  const isMediumOrLarger = window.innerWidth >= 950 // md breakpoint
  isAsideLgActive.value = isMediumOrLarger
}

// Initialize sidebar state on mount
onMounted(() => {
  updateSidebarState()
  window.addEventListener('resize', updateSidebarState)
})

// Clean up event listener
onUnmounted(() => {
  window.removeEventListener('resize', updateSidebarState)
})

router.beforeEach(() => {
  isAsideMobileExpanded.value = false
  // Keep sidebar state on navigation
})

const menuClick = (event, item) => {
  if (item.isToggleLightDark) {
    darkModeStore.set()
  }

  if (item.isLogout) {
    //
  }
}
</script>

<template>
  <div
    :class="{
      'overflow-hidden lg:overflow-visible': isAsideMobileExpanded,
    }"
  >
    <div
      :class="[
        { 'pl-60': isAsideLgActive },
      ]"
      class="pt-14 min-h-screen w-screen transition-all duration-300 bg-gray-50 dark:bg-slate-800 dark:text-slate-100"
    >
      <NavBar
        :menu="menuNavBar"
        :class="[
          { 'pl-60': isAsideLgActive },
        ]"
        @menu-click="menuClick"
      >
        <NavBarItemPlain 
          class="flex items-center justify-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
          @click.prevent="isAsideLgActive = !isAsideLgActive"
          :class="{ 'bg-gray-100 dark:bg-slate-700': isAsideLgActive }"
          :title="isAsideLgActive ? 'Hide Sidebar' : 'Show Sidebar'"
        >
          <BaseIcon :path="isAsideLgActive ? mdiBackburger : mdiForwardburger" size="24" />
        </NavBarItemPlain>
        <NavBarItemPlain use-margin>
          <FormControl placeholder="Search (ctrl+k)" ctrl-k-focus transparent borderless />
        </NavBarItemPlain>
      </NavBar>
      <AsideMenu
        :is-aside-mobile-expanded="isAsideMobileExpanded"
        :is-aside-lg-active="isAsideLgActive"
        :menu="menuAside"
        @menu-click="menuClick"
        @aside-lg-close-click="isAsideLgActive = !isAsideLgActive"
      />
      <slot />
    </div>
  </div>
</template>
