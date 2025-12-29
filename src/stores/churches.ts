import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useMetricsStore } from './metrics'
import { appConfig } from '../config/app.config'
import { sanitizeAndTruncate, isSafeInput } from '../utils/sanitize'
import type { Church, ChurchData, Stats } from '../types'

export const useChurchesStore = defineStore('churches', () => {
  // State
  const churches = ref<Church[]>([])
  const metricsStore = useMetricsStore()

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

  // Load from localStorage on init
  const loadFromStorage = (): void => {
    try {
      const saved = localStorage.getItem(appConfig.storage.CHURCHES)
      if (saved) {
        churches.value = JSON.parse(saved) as Church[]
      } else {
        // Initialize with a root church
        churches.value = [
          {
            id: appConfig.defaults.ROOT_CHURCH_ID,
            name: appConfig.defaults.ROOT_CHURCH_NAME,
            parentId: null,
            metrics: {
              participants: 10,
              christians: 8,
              baptized: 6,
              reaching_out: 0
            }
          }
        ]
        saveToStorage()
      }
    } catch (error) {
      console.error('Failed to load churches from localStorage:', error)
      // Initialize with default data on error
      churches.value = [
        {
          id: appConfig.defaults.ROOT_CHURCH_ID,
          name: appConfig.defaults.ROOT_CHURCH_NAME,
          parentId: null,
          metrics: {
            participants: 10,
            christians: 8,
            baptized: 6,
            reaching_out: 0
          }
        }
      ]
    }
  }

  // Save to localStorage
  const saveToStorage = (): void => {
    try {
      localStorage.setItem(appConfig.storage.CHURCHES, JSON.stringify(churches.value))
    } catch (error) {
      console.error('Failed to save churches to localStorage:', error)
      // Optionally show user notification
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        alert('Storage quota exceeded. Unable to save changes.')
      }
    }
  }

  // Ensure all churches have all metrics (add new metrics with value 0)
  const ensureMetrics = (): void => {
    const metrics = metricsStore.metrics
    churches.value.forEach(church => {
      metrics.forEach(metric => {
        if (metric.isPrimary) {
          // Ensure primary metric (members) exists
          if (church.metrics[metric.key] === undefined) {
            church.metrics[metric.key] = appConfig.defaults.DEFAULT_PRIMARY_METRIC_VALUE
          }
        } else {
          // Add non-primary metrics with 0 if they don't exist
          if (church.metrics[metric.key] === undefined) {
            church.metrics[metric.key] = appConfig.defaults.DEFAULT_METRIC_VALUE
          }
        }
      })
    })
    saveToStorage()
  }

  // Get children of a church
  const getChildren = (parentId: string | null): Church[] => {
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
  const addChurch = (parentId: string | null, data: ChurchData): Church => {
    // Validate metrics dynamically
    validateMetrics(data.metrics)

    // Validate and sanitize name
    const sanitizedName = sanitizeChurchName(data.name)
    if (!sanitizedName) {
      throw new Error('Church name is required')
    }

    const newChurch: Church = {
      id: 'church-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
      parentId,
      name: sanitizedName,
      metrics: { ...data.metrics }
    }
    churches.value.push(newChurch)
    saveToStorage()
    return newChurch
  }

  // Update a church
  const updateChurch = (id: string, data: ChurchData): void => {
    // Validate metrics dynamically
    validateMetrics(data.metrics)

    // Validate and sanitize name
    const sanitizedName = sanitizeChurchName(data.name)
    if (!sanitizedName) {
      throw new Error('Church name is required')
    }

    const index = churches.value.findIndex(c => c.id === id)
    if (index !== -1) {
      churches.value[index] = {
        ...churches.value[index],
        name: sanitizedName,
        metrics: { ...data.metrics }
      }
      saveToStorage()
    }
  }

  // Delete a church (and all its children)
  const deleteChurch = (id: string): void => {
    if (id === appConfig.defaults.ROOT_CHURCH_ID) {
      throw new Error('Cannot delete the root church')
    }

    // Collect all descendants
    const toDelete = new Set<string>()
    const collectDescendants = (parentId: string): void => {
      toDelete.add(parentId)
      const children = getChildren(parentId)
      children.forEach(child => collectDescendants(child.id))
    }
    collectDescendants(id)

    // Remove all descendants
    churches.value = churches.value.filter(c => !toDelete.has(c.id))
    saveToStorage()
  }

  // Get church by id
  const getChurch = (id: string): Church | undefined => {
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

  // Initialize
  loadFromStorage()

  // Ensure all churches have current metrics
  ensureMetrics()

  return {
    churches,
    getChildren,
    addChurch,
    updateChurch,
    deleteChurch,
    getChurch,
    totalStats,
    ensureMetrics
  }
})
