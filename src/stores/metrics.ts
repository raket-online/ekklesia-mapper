import { defineStore } from 'pinia'
import { ref } from 'vue'
import { appConfig } from '../config/app.config'
import { sanitizeAndTruncate, isSafeInput } from '../utils/sanitize'
import type { Metric, MetricData } from '../types'

export const useMetricsStore = defineStore('metrics', () => {
  // State
  const metrics = ref<Metric[]>([])

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

  // Default metrics configuration
  const defaultMetrics: Metric[] = [
    {
      id: 'participants',
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
      id: 'christians',
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
      id: 'baptized',
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
      id: 'reaching_out',
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

  // Load from localStorage
  const loadFromStorage = (): void => {
    try {
      const saved = localStorage.getItem(appConfig.storage.METRICS)
      if (saved) {
        metrics.value = JSON.parse(saved) as Metric[]

        // Migrate: add order property if missing
        let needsSave = false
        metrics.value.forEach((metric, index) => {
          if (metric.order === undefined) {
            metric.order = index
            needsSave = true
          }
        })

        if (needsSave) {
          saveToStorage()
        }

        // Sort by order to ensure correct display
        metrics.value.sort((a, b) => (a.order || 0) - (b.order || 0))
      } else {
        metrics.value = [...defaultMetrics]
        saveToStorage()
      }
    } catch (error) {
      console.error('Failed to load metrics from localStorage:', error)
      // Initialize with default metrics on error
      metrics.value = [...defaultMetrics]
    }
  }

  // Save to localStorage
  const saveToStorage = (): void => {
    try {
      localStorage.setItem(appConfig.storage.METRICS, JSON.stringify(metrics.value))
    } catch (error) {
      console.error('Failed to save metrics to localStorage:', error)
      // Show user notification
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        alert('Storage quota exceeded. Unable to save changes.')
      }
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
  const addMetric = (metricData: MetricData): Metric => {
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
    const maxOrder = metrics.value.reduce((max, m) => Math.max(max, m.order || 0), 0)

    const newMetric: Metric = {
      id: 'metric-' + Date.now(),
      name: sanitizedName,
      key: newKey,
      color: metricData.color,
      gradientFrom: `${metricData.color}-50`,
      gradientTo: `${metricData.color}-100`,
      borderColor: `${metricData.color}-200`,
      icon: metricData.icon || 'circle',
      order: maxOrder + 1,
      isPrimary: false
    }
    metrics.value.push(newMetric)
    saveToStorage()
    return newMetric
  }

  // Update metric
  const updateMetric = (id: string, data: MetricData): void => {
    // Validate and sanitize name
    const sanitizedName = sanitizeMetricName(data.name)
    if (!sanitizedName) {
      throw new Error('Metric name is required')
    }

    const index = metrics.value.findIndex(m => m.id === id)
    if (index !== -1) {
      // Check for duplicate key (excluding current metric)
      const newKey = sanitizedName.toLowerCase().replace(/\s+/g, '_')
      const existingMetric = metrics.value.find(m => m.key === newKey && m.id !== id)
      if (existingMetric) {
        throw new Error('A metric with this name already exists')
      }

      metrics.value[index] = {
        ...metrics.value[index],
        name: sanitizedName,
        key: newKey,
        color: data.color,
        gradientFrom: `${data.color}-50`,
        gradientTo: `${data.color}-100`,
        borderColor: `${data.color}-200`,
        icon: data.icon
      }
      saveToStorage()
    }
  }

  // Delete metric
  const deleteMetric = (id: string): void => {
    const metric = metrics.value.find(m => m.id === id)
    if (metric && metric.isPrimary) {
      throw new Error('Cannot delete the primary metric')
    }
    metrics.value = metrics.value.filter(m => m.id !== id)
    saveToStorage()
  }

  // Reorder metrics
  const reorderMetrics = (newOrder: Metric[]): void => {
    // Update order property for each metric
    newOrder.forEach((metric, index) => {
      const existingMetric = metrics.value.find(m => m.id === metric.id)
      if (existingMetric) {
        existingMetric.order = index
      }
    })
    // Sort metrics by order
    metrics.value.sort((a, b) => (a.order || 0) - (b.order || 0))
    saveToStorage()
  }

  // Reset to defaults
  const resetToDefaults = (): void => {
    metrics.value = [...defaultMetrics]
    saveToStorage()
  }

  // Initialize
  loadFromStorage()

  return {
    metrics,
    getMetric,
    getPrimaryMetric,
    addMetric,
    updateMetric,
    deleteMetric,
    reorderMetrics,
    resetToDefaults
  }
})
