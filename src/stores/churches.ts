import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { useMetricsStore } from './metrics'
import { useAuth } from '../composables/useAuth'
import { appConfig } from '../config/app.config'
import { sanitizeAndTruncate, isSafeInput } from '../utils/sanitize'
import { api, APIError } from '../lib/api'
import type { ChurchData, Stats } from '../types'

export const useChurchesStore = defineStore('churches', () => {
  // State
  const churches = ref<any[]>([])
  const isLoading = ref<boolean>(false)
  const error = ref<string | null>(null)
  const metricsStore = useMetricsStore()
  const auth = useAuth()

  // Sanitize church name with XSS protection
  const sanitizeChurchName = (name: unknown): string => {
    if (!name || typeof name !== 'string') return ''

    const sanitized = sanitizeAndTruncate(name, appConfig.validation.MAX_CHURCH_NAME_LENGTH)

    // Validate that the input contains only safe characters
    if (!isSafeInput(sanitized)) {
      throw new Error('Church name contains invalid characters. Please use only letters, numbers, and basic punctuation.')
    }

    return sanitized
  }

  // Load churches from API
  const loadFromAPI = async (): Promise<void> => {
    try {
      isLoading.value = true
      error.value = null

      churches.value = await api.churches.list()

      // If no churches exist, create root church
      if (churches.value.length === 0) {
        await createRootChurch()
      }
    } catch (err) {
      console.error('Failed to load churches from API:', err)

      if (err instanceof APIError) {
        if (err.status === 401) {
          error.value = 'Please sign in to view your churches'
        } else {
          error.value = err.message
        }
      } else {
        error.value = err instanceof Error ? err.message : 'Failed to load churches'
      }

      // On error, initialize with empty state
      churches.value = []
    } finally {
      isLoading.value = false
    }
  }

  // Create root church
  const createRootChurch = async (): Promise<void> => {
    try {
      const newChurch = await api.churches.create(null, {
        name: appConfig.defaults.ROOT_CHURCH_NAME,
        parentId: null,
        metrics: {
          participants: 10,
          christians: 8,
          baptized: 6,
          reaching_out: 0
        } as Record<string, number>
      })

      churches.value = [newChurch]
    } catch (err) {
      console.error('Failed to create root church:', err)
    }
  }

  // Ensure all churches have all metrics (add new metrics with value 0)
  const ensureMetrics = async (): Promise<void> => {
    const metrics = metricsStore.metrics
    let needsUpdate = false

    churches.value.forEach(church => {
      metrics.forEach(metric => {
        if (metric.isPrimary) {
          // Ensure primary metric (members) exists
          if (church.metrics[metric.key] === undefined) {
            church.metrics[metric.key] = appConfig.defaults.DEFAULT_PRIMARY_METRIC_VALUE
            needsUpdate = true
          }
        } else {
          // Add non-primary metrics with 0 if they don't exist
          if (church.metrics[metric.key] === undefined) {
            church.metrics[metric.key] = appConfig.defaults.DEFAULT_METRIC_VALUE
            needsUpdate = true
          }
        }
      })
    })

    // Update churches on server if needed
    if (needsUpdate) {
      for (const church of churches.value) {
        await updateChurch(church.id, { 
          name: church.name, 
          parentId: church.parentId,
          metrics: church.metrics 
        })
      }
    }
  }

  // Get children of a church
  const getChildren = (parentId: string | null): any[] => {
    return churches.value.filter(c => c.parentId === parentId)
  }

  // Validate metrics against primary metric
  const validateMetrics = (metrics: Record<string, number>): void => {
    const primaryMetric = metricsStore.getPrimaryMetric()
    const primaryValue = metrics[primaryMetric.key]

    if (primaryValue === undefined || primaryValue < 0) {
      throw new Error(`${primaryMetric.name} must be a valid number`)
    }

    // Check all non-primary metrics against primary
    const nonPrimaryMetrics = metricsStore.metrics.filter(m => !m.isPrimary)
    for (const metric of nonPrimaryMetrics) {
      const value = metrics[metric.key] || 0
      if (value > primaryValue) {
        throw new Error(`${metric.name} cannot exceed ${primaryMetric.name}`)
      }
    }
  }

  // Add a new church
  const addChurch = async (parentId: string | null, data: ChurchData): Promise<any> => {
    // Validate metrics dynamically
    validateMetrics(data.metrics)

    // Validate and sanitize name
    const sanitizedName = sanitizeChurchName(data.name)
    if (!sanitizedName) {
      throw new Error('Church name is required')
    }

    // Validate parent exists (if parentId is provided)
    if (parentId !== null) {
      const parentExists = churches.value.some(c => c.id === parentId)
      if (!parentExists) {
        throw new Error('Parent church not found. Please refresh the page and try again.')
      }
    }

    try {
      isLoading.value = true
      error.value = null

      const newChurch = await api.churches.create(parentId, {
        name: sanitizedName,
        parentId,
        metrics: data.metrics
      })

      // Add to local state directly to avoid UI flicker
      churches.value.push(newChurch)

      return newChurch
    } catch (err) {
      if (err instanceof APIError) {
        error.value = err.message
      } else {
        error.value = err instanceof Error ? err.message : 'Failed to create church'
      }
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Update a church
  const updateChurch = async (id: string, data: ChurchData): Promise<void> => {
    // Validate metrics dynamically
    validateMetrics(data.metrics)

    // Validate and sanitize name
    const sanitizedName = sanitizeChurchName(data.name)
    if (!sanitizedName) {
      throw new Error('Church name is required')
    }

    try {
      isLoading.value = true
      error.value = null

      const updated = await api.churches.update(id, {
        name: sanitizedName,
        parentId: data.parentId || null,
        metrics: data.metrics
      })

      // Update local state directly to avoid UI flicker
      const index = churches.value.findIndex(c => c.id === id)
      if (index !== -1) {
        churches.value[index] = updated
      }
    } catch (err) {
      if (err instanceof APIError) {
        error.value = err.message
      } else {
        error.value = err instanceof Error ? err.message : 'Failed to update church'
      }
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Delete a church (and all its children)
  const deleteChurch = async (id: string): Promise<void> => {
    // Prevent deleting root church (the one without parent)
    const churchToDelete = churches.value.find(c => c.id === id)
    if (churchToDelete && churchToDelete.parentId === null) {
      throw new Error('Cannot delete the root church')
    }

    try {
      isLoading.value = true
      error.value = null

      await api.churches.delete(id)

      // Remove from local state (API handles cascade delete)
      const toDelete = new Set<string>()
      const collectDescendants = (parentId: string): void => {
        toDelete.add(parentId)
        const children = getChildren(parentId)
        children.forEach(child => collectDescendants(child.id))
      }
      collectDescendants(id)

      churches.value = churches.value.filter(c => !toDelete.has(c.id))
    } catch (err) {
      if (err instanceof APIError) {
        error.value = err.message
      } else {
        error.value = err instanceof Error ? err.message : 'Failed to delete church'
      }
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Get church by id
  const getChurch = (id: string): any | undefined => {
    return churches.value.find(c => c.id === id)
  }

  // Computed: Total stats (dynamically calculated from all metrics)
  const totalStats = computed((): Stats => {
    const metrics = metricsStore.metrics
    const primaryMetric = metrics.find(m => m.isPrimary) || metrics[0]

    const totals: Record<string, number> = {}
    const percentages: Record<string, number> = {}

    // Initialize totals for all metrics
    metrics.forEach(metric => {
      totals[metric.key] = 0
    })

    // Count all churches
    churches.value.forEach(church => {
      metrics.forEach(metric => {
        totals[metric.key] += church.metrics[metric.key] || 0
      })
    })

    // Calculate percentages (relative to primary metric)
    metrics.forEach(metric => {
      if (!metric.isPrimary && totals[primaryMetric.key] > 0) {
        percentages[metric.key] = Math.round((totals[metric.key] / totals[primaryMetric.key]) * 100)
      } else {
        percentages[metric.key] = 0
      }
    })

    return { totals, percentages }
  })

  // Initialize - load data and watch for auth changes
  const initializeStore = async (): Promise<void> => {
    if (auth.isAuthenticated.value) {
      await loadFromAPI()
      // After loading churches, ensure metrics are properly set
      if (churches.value.length > 0) {
        await ensureMetrics()
      }
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
    churches,
    isLoading,
    error,
    getChildren,
    addChurch,
    updateChurch,
    deleteChurch,
    getChurch,
    totalStats,
    ensureMetrics,
    loadFromAPI
  }
})
