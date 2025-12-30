import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { useAuth } from '../composables/useAuth'
import { api, APIError } from '../lib/api'

export interface AppSettings {
  theme?: string
  language?: string
  [key: string]: any
}

export const useSettingsStore = defineStore('settings', () => {
  // State
  const settings = ref<AppSettings>({})
  const isLoading = ref<boolean>(false)
  const error = ref<string | null>(null)
  const auth = useAuth()

  // Load settings from API
  const loadFromAPI = async (): Promise<void> => {
    try {
      isLoading.value = true
      error.value = null

      settings.value = await api.settings.get()
    } catch (err) {
      console.error('Failed to load settings from API:', err)

      if (err instanceof APIError) {
        if (err.status === 401) {
          error.value = 'Please sign in to view your settings'
        } else {
          error.value = err.message
        }
      } else {
        error.value = err instanceof Error ? err.message : 'Failed to load settings'
      }

      settings.value = {}
    } finally {
      isLoading.value = false
    }
  }

  // Update settings
  const updateSettings = async (newSettings: AppSettings): Promise<void> => {
    try {
      isLoading.value = true
      error.value = null

      settings.value = await api.settings.update(newSettings)
    } catch (err) {
      if (err instanceof APIError) {
        error.value = err.message
      } else {
        error.value = err instanceof Error ? err.message : 'Failed to update settings'
      }
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Get a specific setting value
  const getSetting = <T = any>(key: string, defaultValue?: T): T => {
    return settings.value[key] !== undefined ? settings.value[key] as T : (defaultValue as T)
  }

  // Set a specific setting value
  const setSetting = async <T = any>(key: string, value: T): Promise<void> => {
    const newSettings = {
      ...settings.value,
      [key]: value
    }
    await updateSettings(newSettings)
  }

  // Initialize - load data and watch for auth changes
  const initializeStore = async (): Promise<void> => {
    if (auth.isAuthenticated.value) {
      await loadFromAPI()
    }
  }

  // Watch for authentication changes and reload data
  watch(() => auth.isAuthenticated.value, async (newValue, oldValue) => {
    // Reload when user logs in (changes from false to true)
    if (newValue && !oldValue) {
      await initializeStore()
    }
  })

  // Initial load
  initializeStore()

  return {
    settings,
    isLoading,
    error,
    loadFromAPI,
    updateSettings,
    getSetting,
    setSetting
  }
})
