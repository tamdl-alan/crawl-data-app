<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.js'
import { mdiAccount, mdiAsterisk } from '@mdi/js'
import SectionFullScreen from '@/components/SectionFullScreen.vue'
import CardBox from '@/components/CardBox.vue'
import FormCheckRadio from '@/components/FormCheckRadio.vue'
import FormField from '@/components/FormField.vue'
import FormControl from '@/components/FormControl.vue'
import BaseButton from '@/components/BaseButton.vue'
import BaseButtons from '@/components/BaseButtons.vue'
import LayoutGuest from '@/layouts/LayoutGuest.vue'

const form = reactive({
  login: '',
  pass: '',
  remember: true,
})

const router = useRouter()
const authStore = useAuthStore()
const loading = ref(false)
const errorMessage = ref('')

const submit = async () => {
  loading.value = true
  errorMessage.value = ''
  
  try {
    const result = authStore.login(form.login, form.pass)
    
    if (result.success) {
      // Redirect to dashboard on successful login
      router.push('/dashboard')
    } else {
      errorMessage.value = result.message
    }
  } catch (error) {
    errorMessage.value = 'An error occurred during login'
    console.error(error)
  } finally {
    loading.value = false
  }
}

// Pre-fill with demo credentials for convenience
const fillDemoCredentials = () => {
  form.login = 'admin'
  form.pass = 'admin123'
}
</script>

<template>
  <LayoutGuest>
    <SectionFullScreen v-slot="{ cardClass }" bg="purplePink">
      <CardBox :class="cardClass" is-form @submit.prevent="submit">
        <div class="text-center mb-6">
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Crawl Data App</h1>
          <p class="text-gray-600 dark:text-gray-400 mt-2">Please sign in to continue</p>
        </div>

        <FormField label="Username" help="Please enter your username">
          <FormControl
            v-model="form.login"
            :icon="mdiAccount"
            name="login"
            autocomplete="username"
            placeholder="Enter username"
            required
          />
        </FormField>

        <FormField label="Password" help="Please enter your password">
          <FormControl
            v-model="form.pass"
            :icon="mdiAsterisk"
            type="password"
            name="password"
            autocomplete="current-password"
            placeholder="Enter password"
            required
          />
        </FormField>

        <FormCheckRadio
          v-model="form.remember"
          name="remember"
          label="Remember me"
          :input-value="true"
        />

        <!-- Error message -->
        <div v-if="errorMessage" class="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {{ errorMessage }}
        </div>

        <!-- Demo credentials info -->
        <div class="mb-4 p-3 bg-blue-100 border border-blue-400 text-blue-700 rounded text-sm">
          <p class="font-medium">Demo Credentials:</p>
          <!-- <p>Username: <code>admin</code></p>
          <p>Password: <code>admin123</code></p> -->
          <button 
            type="button" 
            @click="fillDemoCredentials"
            class="mt-2 text-blue-600 hover:text-blue-800 underline"
          >
            Fill demo credentials
          </button>
        </div>

        <template #footer>
          <BaseButtons>
            <BaseButton 
              type="submit" 
              color="info" 
              label="Login" 
              :loading="loading"
              :disabled="loading"
            />
          </BaseButtons>
        </template>
      </CardBox>
    </SectionFullScreen>
  </LayoutGuest>
</template>
