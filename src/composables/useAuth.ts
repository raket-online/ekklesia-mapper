import { storeToRefs } from 'pinia'
import { useAuthStore } from '../stores/auth'

/**
 * Auth composable - Wrapper around Global Auth Store
 * This ensures all components share the same auth state via Pinia
 */
export function useAuth() {
  const authStore = useAuthStore()
  
  // Use storeToRefs to keep reactivity for state properties
  const { 
    user, 
    isAuthenticated, 
    isLoading, 
    error,
    isInitialized
  } = storeToRefs(authStore)

  return {
    // State (Reactive Refs)
    user,
    isAuthenticated,
    isLoading,
    isInitialized,
    error,

    // Actions (Directly from store)
    signIn: authStore.signIn,
    signUp: authStore.signUp,
    signOut: authStore.signOut,
    getSession: authStore.fetchSession,
    
    // Helper to clear errors manually if needed
    clearError: () => { authStore.error = null }
  }
}