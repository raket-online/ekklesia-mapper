import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useMetricsStore } from './metrics'

export const useChurchesStore = defineStore('churches', () => {
  // State
  const churches = ref([])
  const metricsStore = useMetricsStore()

  // Load from localStorage on init
  const loadFromStorage = () => {
    const saved = localStorage.getItem('ekklesia-churches')
    if (saved) {
      churches.value = JSON.parse(saved)
    } else {
      // Initialize with a root church
      churches.value = [
        {
          id: 'root',
          name: 'Mother Church',
          parentId: null,
          metrics: {
            members: 50,
            baptized: 40,
            calling: 35,
            community: 38,
            commission: 25,
            reaching: 20
          }
        }
      ]
      saveToStorage()
    }
  }

  // Save to localStorage
  const saveToStorage = () => {
    localStorage.setItem('ekklesia-churches', JSON.stringify(churches.value))
  }

  // Ensure all churches have all metrics (add new metrics with value 0)
  const ensureMetrics = () => {
    const metrics = metricsStore.metrics
    churches.value.forEach(church => {
      metrics.forEach(metric => {
        if (metric.isPrimary) {
          // Ensure primary metric (members) exists
          if (church.metrics[metric.key] === undefined) {
            church.metrics[metric.key] = 50
          }
        } else {
          // Add non-primary metrics with 0 if they don't exist
          if (church.metrics[metric.key] === undefined) {
            church.metrics[metric.key] = 0
          }
        }
      })
    })
    saveToStorage()
  }

  // Get children of a church
  const getChildren = (parentId) => {
    return churches.value.filter(c => c.parentId === parentId)
  }

  // Add a new church
  const addChurch = (parentId, data) => {
    // Validate metrics
    if (data.metrics.baptized > data.metrics.members) {
      throw new Error('Baptized cannot exceed members')
    }
    if (data.metrics.calling > data.metrics.members) {
      throw new Error('Calling cannot exceed members')
    }
    if (data.metrics.community > data.metrics.members) {
      throw new Error('Community cannot exceed members')
    }
    if (data.metrics.commission > data.metrics.members) {
      throw new Error('Commission cannot exceed members')
    }
    if (data.metrics.reaching > data.metrics.members) {
      throw new Error('Reaching cannot exceed members')
    }

    const newChurch = {
      id: 'church-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
      parentId,
      name: data.name,
      metrics: { ...data.metrics }
    }
    churches.value.push(newChurch)
    saveToStorage()
    return newChurch
  }

  // Update a church
  const updateChurch = (id, data) => {
    // Validate metrics
    if (data.metrics.baptized > data.metrics.members) {
      throw new Error('Baptized cannot exceed members')
    }
    if (data.metrics.calling > data.metrics.members) {
      throw new Error('Calling cannot exceed members')
    }
    if (data.metrics.community > data.metrics.members) {
      throw new Error('Community cannot exceed members')
    }
    if (data.metrics.commission > data.metrics.members) {
      throw new Error('Commission cannot exceed members')
    }
    if (data.metrics.reaching > data.metrics.members) {
      throw new Error('Reaching cannot exceed members')
    }

    const index = churches.value.findIndex(c => c.id === id)
    if (index !== -1) {
      churches.value[index] = {
        ...churches.value[index],
        name: data.name,
        metrics: { ...data.metrics }
      }
      saveToStorage()
    }
  }

  // Delete a church (and all its children)
  const deleteChurch = (id) => {
    if (id === 'root') {
      throw new Error('Cannot delete the mother church')
    }

    // Collect all descendants
    const toDelete = new Set()
    const collectDescendants = (parentId) => {
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
  const getChurch = (id) => {
    return churches.value.find(c => c.id === id)
  }

  // Computed: Total stats (dynamically calculated from all metrics)
  const totalStats = computed(() => {
    const metrics = metricsStore.metrics
    const primaryMetric = metrics.find(m => m.isPrimary) || metrics[0]

    const totals = {}
    const percentages = {}

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
