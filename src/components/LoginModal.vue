<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
  >
    <div class="bg-white rounded-lg shadow-xl max-w-md w-full">
      <div class="p-6">
        <h2 class="text-2xl font-bold text-gray-800 mb-2">
          Sign In
        </h2>
        <p class="text-gray-600 text-sm mb-6">
          Welcome back! Sign in to access your churches.
        </p>

        <form @submit.prevent="handleSubmit">
          <!-- Email -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              v-model="formData.email"
              type="email"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="your@email.com"
            />
          </div>

          <!-- Password -->
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Password *
            </label>
            <input
              v-model="formData.password"
              type="password"
              required
              minlength="8"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="••••••••"
            />
          </div>

          <!-- Error Message -->
          <div
            v-if="errorMessage"
            class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg"
          >
            <p class="text-red-600 text-sm">
              {{ errorMessage }}
            </p>
          </div>

          <!-- Buttons -->
          <div class="flex gap-3 mb-4">
            <button
              type="submit"
              :disabled="isLoading"
              class="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <span v-if="isLoading">Signing in...</span>
              <span v-else>Sign In</span>
            </button>
            <button
              type="button"
              :disabled="isLoading"
              @click="$emit('close')"
              class="flex-1 bg-gray-300 hover:bg-gray-400 disabled:bg-gray-200 disabled:cursor-not-allowed text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
          </div>

          <!-- Switch to Register -->
          <p class="text-center text-sm text-gray-600">
            Don't have an account?
            <button
              type="button"
              :disabled="isLoading"
              @click="$emit('switch-to-register')"
              class="text-blue-600 hover:text-blue-700 font-medium disabled:text-gray-400"
            >
              Sign up
            </button>
          </p>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useAuth } from '../composables/useAuth'

interface Props {
  show: boolean
}

interface Emits {
  (e: 'close'): void
  (e: 'switch-to-register'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { signIn, isLoading, error, clearError } = useAuth()

const formData = ref({
  email: '',
  password: ''
})

const errorMessage = ref<string | null>(null)

// Watch for auth errors
watch(error, (newError) => {
  errorMessage.value = newError ?? null
})

// Reset form when modal opens/closes
watch(() => props.show, (isOpen) => {
  if (!isOpen) {
    formData.value = {
      email: '',
      password: ''
    }
    errorMessage.value = null
    clearError()
  }
})

const handleSubmit = async (): Promise<void> => {
  try {
    errorMessage.value = null
    await signIn(formData.value.email, formData.value.password)
    emit('close')
  } catch (err) {
    // Error is already set by useAuth
    console.error('Login failed:', err)
  }
}
</script>
