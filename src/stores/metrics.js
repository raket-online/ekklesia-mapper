import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useMetricsStore = defineStore('metrics', () => {
  // State
  const metrics = ref([])

  // Default metrics configuration
  const defaultMetrics = [
    {
      id: 'members',
      name: 'Members',
      key: 'members',
      color: 'blue',
      gradientFrom: 'blue-50',
      gradientTo: 'blue-100',
      borderColor: 'blue-200',
      icon: 'users',
      order: 0,
      isPrimary: true
    },
    {
      id: 'baptized',
      name: 'Baptized',
      key: 'baptized',
      color: 'green',
      gradientFrom: 'green-50',
      gradientTo: 'green-100',
      borderColor: 'green-200',
      icon: 'check',
      order: 1,
      isPrimary: false
    },
    {
      id: 'calling',
      name: 'Calling',
      key: 'calling',
      color: 'purple',
      gradientFrom: 'purple-50',
      gradientTo: 'purple-100',
      borderColor: 'purple-200',
      icon: 'star',
      order: 2,
      isPrimary: false
    },
    {
      id: 'community',
      name: 'Community',
      key: 'community',
      color: 'yellow',
      gradientFrom: 'yellow-50',
      gradientTo: 'yellow-100',
      borderColor: 'yellow-200',
      icon: 'heart',
      order: 3,
      isPrimary: false
    },
    {
      id: 'commission',
      name: 'Commission',
      key: 'commission',
      color: 'orange',
      gradientFrom: 'orange-50',
      gradientTo: 'orange-100',
      borderColor: 'orange-200',
      icon: 'shepherd',
      order: 4,
      isPrimary: false
    },
    {
      id: 'reaching',
      name: 'Reaching',
      key: 'reaching',
      color: 'pink',
      gradientFrom: 'pink-50',
      gradientTo: 'pink-100',
      borderColor: 'pink-200',
      icon: 'globe',
      order: 5,
      isPrimary: false
    }
  ]

  // Load from localStorage
  const loadFromStorage = () => {
    const saved = localStorage.getItem('ekklesia-metrics')
    if (saved) {
      metrics.value = JSON.parse(saved)

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
  }

  // Save to localStorage
  const saveToStorage = () => {
    localStorage.setItem('ekklesia-metrics', JSON.stringify(metrics.value))
  }

  // Get metric by key
  const getMetric = (key) => {
    return metrics.value.find(m => m.key === key)
  }

  // Get primary metric (members)
  const getPrimaryMetric = () => {
    return metrics.value.find(m => m.isPrimary) || metrics.value[0]
  }

  // Add new metric
  const addMetric = (metricData) => {
    // Find the highest order value
    const maxOrder = metrics.value.reduce((max, m) => Math.max(max, m.order || 0), 0)

    const newMetric = {
      id: 'metric-' + Date.now(),
      name: metricData.name,
      key: metricData.key.toLowerCase().replace(/\s+/g, '_'),
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
  const updateMetric = (id, data) => {
    const index = metrics.value.findIndex(m => m.id === id)
    if (index !== -1) {
      metrics.value[index] = {
        ...metrics.value[index],
        name: data.name,
        key: data.key.toLowerCase().replace(/\s+/g, '_'),
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
  const deleteMetric = (id) => {
    const metric = metrics.value.find(m => m.id === id)
    if (metric && metric.isPrimary) {
      throw new Error('Cannot delete the primary metric')
    }
    metrics.value = metrics.value.filter(m => m.id !== id)
    saveToStorage()
  }

  // Reorder metrics
  const reorderMetrics = (newOrder) => {
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
  const resetToDefaults = () => {
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
