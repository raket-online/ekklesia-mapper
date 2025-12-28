<template>
  <div v-if="show" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
      <!-- Header -->
      <div class="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4 flex items-center justify-between">
        <div>
          <h2 class="text-2xl font-bold">Manage Metrics</h2>
          <p class="text-sm opacity-90">Add, edit, or remove metrics from all churches</p>
        </div>
        <button @click="$emit('close')" class="p-2 hover:bg-white/20 rounded-lg transition-colors">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Content -->
      <div class="p-6 overflow-y-auto flex-1">
        <!-- Metrics List -->
        <MetricList
          :metrics="metrics"
          @edit="startEditing"
          @delete="handleDeleteMetric"
          @reorder="handleReorder"
        />

        <!-- Add New Metric -->
        <MetricForm @submit="handleAddMetric" />
      </div>

      <!-- Footer -->
      <div class="bg-gray-50 px-6 py-4 border-t flex justify-between items-center">
        <button
          @click="handleReset"
          class="text-gray-600 hover:text-gray-800 text-sm font-medium transition-colors"
        >
          Reset to Defaults
        </button>
        <button
          @click="$emit('close')"
          class="px-6 py-2 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white rounded-lg font-semibold transition-colors"
        >
          Done
        </button>
      </div>
    </div>

    <!-- Edit Modal -->
    <MetricEditModal
      :show="!!editingMetric"
      :metric="editingMetric"
      @submit="handleUpdateMetric"
      @cancel="cancelEdit"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useMetricsStore } from '../stores/metrics'
import MetricList from './MetricList.vue'
import MetricForm from './MetricForm.vue'
import MetricEditModal from './MetricEditModal.vue'
import type { Metric, MetricColor, IconId } from '../types'

defineProps<{
  show: boolean
}>()

defineEmits(['close'])

const metricsStore = useMetricsStore()
const metrics = computed<Metric[]>(() => metricsStore.metrics)

const editingMetric = ref<Metric | null>(null)

const handleAddMetric = (data: { name: string; color: MetricColor; icon: IconId }): void => {
  try {
    metricsStore.addMetric({
      name: data.name,
      key: data.name,
      color: data.color,
      icon: data.icon
    })
  } catch (error) {
    alert((error as Error).message)
  }
}

const startEditing = (metric: Metric): void => {
  editingMetric.value = metric
}

const handleUpdateMetric = (data: { name: string; color: MetricColor; icon: IconId }): void => {
  try {
    metricsStore.updateMetric(editingMetric.value!.id, {
      name: data.name,
      key: data.name,
      color: data.color,
      icon: data.icon
    })
    cancelEdit()
  } catch (error) {
    alert((error as Error).message)
  }
}

const cancelEdit = (): void => {
  editingMetric.value = null
}

const handleDeleteMetric = (id: string): void => {
  if (confirm('Are you sure you want to delete this metric? This will remove it from all churches.')) {
    try {
      metricsStore.deleteMetric(id)
    } catch (error) {
      alert((error as Error).message)
    }
  }
}

const handleReorder = (newOrder: Metric[]): void => {
  metricsStore.reorderMetrics(newOrder)
}

const handleReset = (): void => {
  if (confirm('Reset all metrics to default? This cannot be undone.')) {
    metricsStore.resetToDefaults()
  }
}
</script>
