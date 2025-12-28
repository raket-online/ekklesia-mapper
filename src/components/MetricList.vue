<template>
  <div class="space-y-3 mb-6">
    <h3 class="text-lg font-semibold text-gray-800">Current Metrics</h3>

    <MetricItem
      v-for="metric in metrics"
      :key="metric.id"
      :metric="metric"
      draggable="true"
      @dragstart="onDragStart($event, metric)"
      @dragend="onDragEnd"
      @dragover="onDragOver"
      @drop="onDrop($event, metric)"
      @edit="$emit('edit', $event)"
      @delete="$emit('delete', $event)"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import MetricItem from './MetricItem.vue'
import type { Metric } from '../types'

const props = defineProps<{
  metrics: Metric[]
}>()

const emit = defineEmits<{
  (e: 'edit', metric: Metric): void
  (e: 'delete', id: string): void
  (e: 'reorder', newOrder: Metric[]): void
}>()

// Drag and drop state
const draggedItem = ref<Metric | null>(null)

const onDragStart = (event: DragEvent, metric: Metric): void => {
  draggedItem.value = metric
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
  }
  const target = event.target as HTMLElement
  if (target) {
    target.classList.add('opacity-50')
  }
}

const onDragEnd = (event: DragEvent): void => {
  const target = event.target as HTMLElement
  if (target) {
    target.classList.remove('opacity-50')
  }
  draggedItem.value = null
}

const onDragOver = (event: DragEvent): void => {
  event.preventDefault()
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move'
  }
}

const onDrop = (event: DragEvent, targetMetric: Metric): void => {
  event.preventDefault()

  if (!draggedItem.value || draggedItem.value.id === targetMetric.id) {
    return
  }

  // Get current metrics array
  const currentMetrics = [...props.metrics]
  const draggedIndex = currentMetrics.findIndex(m => m.id === draggedItem.value!.id)
  const targetIndex = currentMetrics.findIndex(m => m.id === targetMetric.id)

  // Remove dragged item and insert at new position
  const [draggedItemData] = currentMetrics.splice(draggedIndex, 1)
  currentMetrics.splice(targetIndex, 0, draggedItemData)

  // Emit reorder event
  emit('reorder', currentMetrics)
}
</script>
