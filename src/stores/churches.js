import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useChurchesStore = defineStore('churches', () => {
  // State
  const churches = ref([])

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

  // Computed: Total stats (counts all churches including mother church)
  const totalStats = computed(() => {
    const totals = {
      members: 0,
      baptized: 0,
      calling: 0,
      community: 0,
      commission: 0,
      reaching: 0
    }

    // Count all churches - each church contributes its own members
    churches.value.forEach(church => {
      totals.members += church.metrics.members || 0
      totals.baptized += church.metrics.baptized || 0
      totals.calling += church.metrics.calling || 0
      totals.community += church.metrics.community || 0
      totals.commission += church.metrics.commission || 0
      totals.reaching += church.metrics.reaching || 0
    })

    const percentages = {
      baptized: totals.members > 0 ? Math.round((totals.baptized / totals.members) * 100) : 0,
      calling: totals.members > 0 ? Math.round((totals.calling / totals.members) * 100) : 0,
      community: totals.members > 0 ? Math.round((totals.community / totals.members) * 100) : 0,
      commission: totals.members > 0 ? Math.round((totals.commission / totals.members) * 100) : 0,
      reaching: totals.members > 0 ? Math.round((totals.reaching / totals.members) * 100) : 0
    }

    return { totals, percentages }
  })

  // Initialize
  loadFromStorage()

  return {
    churches,
    getChildren,
    addChurch,
    updateChurch,
    deleteChurch,
    getChurch,
    totalStats
  }
})
