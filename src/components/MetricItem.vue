<template>
  <div
    class="bg-white border-2 rounded-xl p-4 transition-all hover:shadow-md cursor-move"
    :class="`${metric.borderColor}`"
    draggable="true"
    @dragstart="onDragStart"
    @dragend="onDragEnd"
    @dragover="onDragOver"
    @drop="onDrop"
  >
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-4">
        <!-- Drag handle -->
        <div class="text-gray-400 cursor-move">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8h16M4 16h16" />
          </svg>
        </div>

        <!-- Color indicator with icon -->
        <div
          class="w-12 h-12 rounded-xl flex items-center justify-center"
          :class="`bg-gradient-to-br from-${metric.color}-400 to-${metric.color}-600`"
        >
          <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="getIconPath(metric.icon)" />
          </svg>
        </div>

        <!-- Metric info -->
        <div>
          <div class="flex items-center gap-2">
            <h4 class="text-lg font-bold text-gray-800">{{ metric.name }}</h4>
            <span v-if="metric.isPrimary" class="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
              Primary
            </span>
          </div>
          <p class="text-sm text-gray-500">Key: {{ metric.key }}</p>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex gap-2">
        <button
          @click="$emit('edit', metric)"
          class="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
          title="Edit"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
        <button
          v-if="!metric.isPrimary"
          @click="$emit('delete', metric.id)"
          class="p-2 hover:bg-red-100 rounded-lg transition-colors text-red-600"
          title="Delete"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getIconPath } from '../constants/icons'
import type { Metric } from '../types'

defineProps<{
  metric: Metric
}>()

defineEmits<{
  (e: 'edit', metric: Metric): void
  (e: 'delete', id: string): void
  (e: 'dragstart', metric: Metric): void
  (e: 'dragend'): void
  (e: 'drop', metric: Metric): void
}>()

const onDragStart = (event: DragEvent): void => {
  event.preventDefault()
  const target = event.target as HTMLElement
  if (target) {
    target.classList.add('opacity-50')
  }
  // Emit to parent for drag handling
}

const onDragEnd = (event: DragEvent): void => {
  const target = event.target as HTMLElement
  if (target) {
    target.classList.remove('opacity-50')
  }
}

const onDragOver = (event: DragEvent): void => {
  event.preventDefault()
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move'
  }
}

const onDrop = (event: DragEvent): void => {
  event.preventDefault()
}
</script>
