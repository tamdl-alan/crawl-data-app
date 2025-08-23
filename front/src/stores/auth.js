import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', () => {
  // Hardcoded credentials
  const HARDCODED_CREDENTIALS = {
    username: 'admin',
    password: 'admin123'
  }

  const isAuthenticated = ref(false)
  const user = ref(null)

  // Computed properties
  const isLoggedIn = computed(() => isAuthenticated.value)

  // Actions
  const login = (username, password) => {
    if (username === HARDCODED_CREDENTIALS.username && 
        password === HARDCODED_CREDENTIALS.password) {
      isAuthenticated.value = true
      user.value = {
        username: username,
        name: 'Administrator',
        role: 'admin'
      }
      
      // Store in localStorage for persistence
      localStorage.setItem('auth', JSON.stringify({
        isAuthenticated: true,
        user: user.value
      }))
      
      return { success: true, message: 'Login successful' }
    } else {
      return { success: false, message: 'Invalid username or password' }
    }
  }

  const logout = () => {
    isAuthenticated.value = false
    user.value = null
    
    // Clear from localStorage
    localStorage.removeItem('auth')
  }

  const checkAuth = () => {
    // Check if user is authenticated from localStorage
    const authData = localStorage.getItem('auth')
    if (authData) {
      try {
        const parsed = JSON.parse(authData)
        if (parsed.isAuthenticated && parsed.user) {
          isAuthenticated.value = true
          user.value = parsed.user
          return true
        }
      } catch (error) {
        console.error('Error parsing auth data:', error)
      }
    }
    return false
  }

  const initAuth = () => {
    checkAuth()
  }

  return {
    isAuthenticated,
    user,
    isLoggedIn,
    login,
    logout,
    checkAuth,
    initAuth
  }
})
