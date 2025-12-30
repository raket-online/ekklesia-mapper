<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
  >
    <div class="bg-white rounded-lg shadow-xl max-w-md w-full">
      <div class="p-6">
        <h2 class="text-2xl font-bold text-gray-800 mb-2">
          Create Account
        </h2>
        <p class="text-gray-600 text-sm mb-6">
          Sign up to start tracking your churches.
        </p>

        <form @submit.prevent="handleSubmit">
          <!-- Name -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Name *
            </label>
            <input
              v-model="formData.name"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Your name"
            />
          </div>

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
          <div class="mb-4">
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
            <p class="text-xs text-gray-500 mt-1">
              Must be at least 8 characters
            </p>
          </div>

          <!-- Confirm Password -->
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password *
            </label>
            <input
              v-model="formData.confirmPassword"
              type="password"
              required
              minlength="8"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="••••••••"
            />
            <p
              v-if="formData.confirmPassword && formData.password !== formData.confirmPassword"
              class="text-red-500 text-sm mt-1"
            >
              Passwords do not match
            </p>
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
              :disabled="isLoading || !isFormValid"
              class="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <span v-if="isLoading">Creating account...</span>
              <span v-else>Sign Up</span>
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

          <!-- Switch to Login -->
          <p class="text-center text-sm text-gray-600">
            Already have an account?
            <button
              type="button"
              :disabled="isLoading"
              @click="$emit('switch-to-login')"
              class="text-blue-600 hover:text-blue-700 font-medium disabled:text-gray-400"
            >
              Sign in
            </button>
          </p>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useAuth } from '../composables/useAuth'

interface Props {
  show: boolean
}

interface Emits {
  (e: 'close'): void
  (e: 'switch-to-login'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { signUp, isLoading, error, clearError } = useAuth()

const formData = ref({
  name: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const errorMessage = ref<string | null>(null)

const isFormValid = computed(() => {
  return (
    formData.value.name &&
    formData.value.email &&
    formData.value.password &&
    formData.value.confirmPassword &&
    formData.value.password === formData.value.confirmPassword &&
    formData.value.password.length >= 8
  )
})

// Watch for auth errors
watch(error, (newError) => {
  errorMessage.value = newError ?? null
})

// Reset form when modal opens/closes
watch(() => props.show, (isOpen) => {
  if (!isOpen) {
    formData.value = {
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    }
    errorMessage.value = null
    clearError()
  }
})

const handleSubmit = async (): Promise<void> => {
  try {
    errorMessage.value = null
    await signUp(formData.value.email, formData.value.password, formData.value.name)
    emit('close')
  } catch (err) {
    // Error is already set by useAuth
    console.error('Registration failed:', err)
  }
}
</script>
