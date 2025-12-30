import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authClient } from '../lib/auth-client'
import type { User } from '../lib/api'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null)
  const isLoading = ref<boolean>(true) // Start as loading until initial check completes
  const isInitialized = ref<boolean>(false)
  const error = ref<string | null>(null)

  // Getters
  const isAuthenticated = computed(() => !!user.value)

  // Actions
  const fetchSession = async () => {
    try {
      isLoading.value = true
      error.value = null
      const { data } = await authClient.getSession()
      
      if (data?.user) {
        // Cast to our User type (ensuring compatibility with API types)
        user.value = data.user as unknown as User
      } else {
        user.value = null
      }
    } catch (err) {
      console.error('Failed to fetch session:', err)
      user.value = null
      error.value = 'Failed to restore session'
    } finally {
      isLoading.value = false
      isInitialized.value = true
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      isLoading.value = true
      error.value = null
      
      const { data, error: authError } = await authClient.signIn.email({
        email,
        password
      })

      if (authError) {
        throw new Error(authError.message || 'Failed to sign in')
      }

      // After successful sign in, refresh session to get full user details
      await fetchSession()
      
      return data
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to sign in'
      error.value = message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const signUp = async (email: string, password: string, name: string) => {
    try {
      isLoading.value = true
      error.value = null

      const { data, error: authError } = await authClient.signUp.email({
        email,
        password,
        name
      })

      if (authError) {
        throw new Error(authError.message || 'Failed to sign up')
      }

      await fetchSession()
      
      return data
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to sign up'
      error.value = message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const signOut = async () => {
    try {
      isLoading.value = true
      error.value = null
      
      await authClient.signOut()
      user.value = null
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to sign out'
      error.value = message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Initialize session on store creation
  // This ensures that as soon as the app starts, we check for a session
  fetchSession()

  return {
    user,
    isLoading,
    isInitialized,
    error,
    isAuthenticated,
    fetchSession,
    signIn,
    signUp,
    signOut
  }
})
