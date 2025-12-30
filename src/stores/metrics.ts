import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { useAuth } from '../composables/useAuth'
import { appConfig } from '../config/app.config'
import { sanitizeAndTruncate, isSafeInput } from '../utils/sanitize'
import { api, APIError } from '../lib/api'
import type { Metric, MetricData } from '../types'

export const useMetricsStore = defineStore('metrics', () => {
  // State
  const metrics = ref<Metric[]>([])
  const isLoading = ref<boolean>(false)
  const error = ref<string | null>(null)
  const auth = useAuth()

  // Sanitize metric name with XSS protection
  const sanitizeMetricName = (name: string): string => {
    if (!name || typeof name !== 'string') return ''

    const sanitized = sanitizeAndTruncate(name, appConfig.validation.MAX_METRIC_NAME_LENGTH)

    // Validate that the input contains only safe characters
    if (!isSafeInput(sanitized)) {
      throw new Error('Metric name contains invalid characters. Please use only letters, numbers, and basic punctuation.')
    }

    return sanitized
  }

  // Default metrics configuration (for new users)
  const defaultMetrics: Omit<Metric, 'id'>[] = [
    {
      name: 'Participants',
      key: 'participants',
      color: 'blue',
      gradientFrom: 'blue-50',
      gradientTo: 'blue-100',
      borderColor: 'blue-200',
      icon: 'users',
      order: 0,
      isPrimary: true
    },
    {
      name: 'Christians',
      key: 'christians',
      color: 'green',
      gradientFrom: 'green-50',
      gradientTo: 'green-100',
      borderColor: 'green-200',
      icon: 'check',
      order: 1,
      isPrimary: false
    },
    {
      name: 'Baptized',
      key: 'baptized',
      color: 'purple',
      gradientFrom: 'purple-50',
      gradientTo: 'purple-100',
      borderColor: 'purple-200',
      icon: 'star',
      order: 2,
      isPrimary: false
    },
    {
      name: 'Reaching out',
      key: 'reaching_out',
      color: 'pink',
      gradientFrom: 'pink-50',
      gradientTo: 'pink-100',
      borderColor: 'pink-200',
      icon: 'globe',
      order: 3,
      isPrimary: false
    }
  ]

  // Load metrics from API
  const loadFromAPI = async (): Promise<void> => {
    try {
      isLoading.value = true
      error.value = null

      const data = await api.metrics.list()

      if (data.length === 0) {
        // New user - create default metrics
        await createDefaultMetrics()
      } else {
        // Transform database format to Metric format
        metrics.value = data.map((m: any) => ({
          id: m.id,
          name: m.name,
          key: m.key,
          color: m.color,
          gradientFrom: `${m.color}-50`,
          gradientTo: `${m.color}-100`,
          borderColor: `${m.color}-200`,
          icon: m.icon,
          order: m.order,
          isPrimary: m.isPrimary
        }))

        // Sort by order
        metrics.value.sort((a, b) => a.order - b.order)
      }
    } catch (err) {
      console.error('Failed to load metrics from API:', err)

      if (err instanceof APIError) {
        if (err.status === 401) {
          error.value = 'Please sign in to view your metrics'
        } else {
          error.value = err.message
        }
      } else {
        error.value = err instanceof Error ? err.message : 'Failed to load metrics'
      }

      metrics.value = []
    } finally {
      isLoading.value = false
    }
  }

  // Create default metrics for new users
  const createDefaultMetrics = async (): Promise<void> => {
    try {
      for (const metric of defaultMetrics) {
        const created = await api.metrics.create({
          name: metric.name,
          key: metric.key,
          color: metric.color,
          icon: metric.icon,
          isPrimary: metric.isPrimary,
          order: metric.order
        })
        metrics.value.push({
          id: created.id,
          ...metric
        })
      }
    } catch (err) {
      console.error('Failed to create default metrics:', err)
    }
  }

  // Get metric by key
  const getMetric = (key: string): Metric | undefined => {
    return metrics.value.find(m => m.key === key)
  }

  // Get primary metric (members)
  const getPrimaryMetric = (): Metric => {
    return metrics.value.find(m => m.isPrimary) || metrics.value[0]
  }

  // Add new metric
  const addMetric = async (metricData: MetricData): Promise<Metric> => {
    // Validate and sanitize name
    const sanitizedName = sanitizeMetricName(metricData.name)
    if (!sanitizedName) {
      throw new Error('Metric name is required')
    }

    // Check for duplicate key
    const newKey = sanitizedName.toLowerCase().replace(/\s+/g, '_')
    const existingMetric = metrics.value.find(m => m.key === newKey)
    if (existingMetric) {
      throw new Error('A metric with this name already exists')
    }

    // Find the highest order value
    const maxOrder = metrics.value.reduce((max, m) => Math.max(max, m.order), 0)

    try {
      isLoading.value = true
      error.value = null

      const created = await api.metrics.create({
        name: sanitizedName,
        key: newKey,
        color: metricData.color,
        icon: metricData.icon || 'circle',
        isPrimary: false,
        order: maxOrder + 1
      })

      const newMetric: Metric = {
        id: created.id,
        name: created.name,
        key: created.key,
        color: created.color,
        gradientFrom: `${created.color}-50`,
        gradientTo: `${created.color}-100`,
        borderColor: `${created.color}-200`,
        icon: created.icon,
        order: created.order,
        isPrimary: created.isPrimary
      }

      metrics.value.push(newMetric)
      // Sort by order
      metrics.value.sort((a, b) => a.order - b.order)

      return newMetric
    } catch (err) {
      if (err instanceof APIError) {
        error.value = err.message
      } else {
        error.value = err instanceof Error ? err.message : 'Failed to create metric'
      }
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Update metric
  const updateMetric = async (id: string, data: MetricData): Promise<void> => {
    // Validate and sanitize name
    const sanitizedName = sanitizeMetricName(data.name)
    if (!sanitizedName) {
      throw new Error('Metric name is required')
    }

    const index = metrics.value.findIndex(m => m.id === id)
    if (index === -1) {
      throw new Error('Metric not found')
    }

    const currentMetric = metrics.value[index]

    // Check for duplicate key (excluding current metric)
    const newKey = sanitizedName.toLowerCase().replace(/\s+/g, '_')
    const existingMetric = metrics.value.find(m => m.key === newKey && m.id !== id)
    if (existingMetric) {
      throw new Error('A metric with this name already exists')
    }

    try {
      isLoading.value = true
      error.value = null

      const updated = await api.metrics.update(id, {
        name: sanitizedName,
        key: newKey,
        color: data.color,
        icon: data.icon,
        isPrimary: currentMetric.isPrimary,
        order: currentMetric.order
      })

      // Update local state
      metrics.value[index] = {
        ...currentMetric,
        name: updated.name,
        key: updated.key,
        color: updated.color,
        gradientFrom: `${updated.color}-50`,
        gradientTo: `${updated.color}-100`,
        borderColor: `${updated.color}-200`,
        icon: updated.icon || currentMetric.icon
      }
    } catch (err) {
      if (err instanceof APIError) {
        error.value = err.message
      } else {
        error.value = err instanceof Error ? err.message : 'Failed to update metric'
      }
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Delete metric
  const deleteMetric = async (id: string): Promise<void> => {
    const metric = metrics.value.find(m => m.id === id)
    if (metric && metric.isPrimary) {
      throw new Error('Cannot delete the primary metric')
    }

    try {
      isLoading.value = true
      error.value = null

      await api.metrics.delete(id)

      metrics.value = metrics.value.filter(m => m.id !== id)
    } catch (err) {
      if (err instanceof APIError) {
        error.value = err.message
      } else {
        error.value = err instanceof Error ? err.message : 'Failed to delete metric'
      }
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Reorder metrics
  const reorderMetrics = async (newOrder: Metric[]): Promise<void> => {
    try {
      isLoading.value = true
      error.value = null

      await api.metrics.reorder(newOrder)

      // Update local state
      newOrder.forEach((metric, index) => {
        const existingMetric = metrics.value.find(m => m.id === metric.id)
        if (existingMetric) {
          existingMetric.order = index
        }
      })

      // Sort metrics by order
      metrics.value.sort((a, b) => a.order - b.order)
    } catch (err) {
      if (err instanceof APIError) {
        error.value = err.message
      } else {
        error.value = err instanceof Error ? err.message : 'Failed to reorder metrics'
      }
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Reset to defaults
  const resetToDefaults = async (): Promise<void> => {
    try {
      isLoading.value = true
      error.value = null

      // Delete all existing metrics
      for (const metric of [...metrics.value]) {
        if (!metric.isPrimary) {
          await deleteMetric(metric.id)
        }
      }

      // Recreate defaults
      metrics.value = []
      await createDefaultMetrics()
    } catch (err) {
      if (err instanceof APIError) {
        error.value = err.message
      } else {
        error.value = err instanceof Error ? err.message : 'Failed to reset metrics'
      }
      throw err
    } finally {
      isLoading.value = false
    }
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
    metrics,
    isLoading,
    error,
    getMetric,
    getPrimaryMetric,
    addMetric,
    updateMetric,
    deleteMetric,
    reorderMetrics,
    resetToDefaults,
    loadFromAPI
  }
})
