<template>
  <div class="flex flex-col items-center">
    <!-- Church Card -->
    <div
      class="group relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl hover:shadow-2xl p-5 min-w-[480px] border border-gray-200 hover:border-blue-400 transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
      @click="$emit('select', church)"
    >
      <!-- Glow Effect on Hover -->
      <div class="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

      <div class="relative">
        <!-- Header -->
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent flex-1 text-center">{{ church.name }}</h3>
          <div class="flex gap-1">
            <button
              @click.stop="$emit('edit', church)"
              class="p-2 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
              title="Edit"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              v-if="church.id !== appConfig.defaults.ROOT_CHURCH_ID"
              @click.stop="$emit('delete', church.id)"
              class="p-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
              title="Delete"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Metrics Grid -->
        <div class="grid grid-cols-3 gap-2 mb-4">
          <div
            v-for="metric in displayMetrics"
            :key="metric.id"
            :class="`bg-gradient-to-br from-${metric.gradientFrom} to-${metric.gradientTo} p-3 rounded-xl border ${metric.borderColor} hover:shadow-md transition-all`"
          >
            <div class="flex items-center gap-2">
              <div :class="`w-6 h-6 bg-${metric.color}-500 rounded-lg flex items-center justify-center`">
                <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="getIconPath(metric.icon)" />
                </svg>
              </div>
              <div>
                <div :class="`text-xs text-${metric.color}-600 font-medium`">{{ metric.name }}</div>
                <div :class="`text-lg font-bold text-${metric.color}-700`">{{ church.metrics[metric.key] }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex justify-center pt-2">
          <button
            @click.stop="$emit('add-child', church.id)"
            class="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-2 rounded-xl text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 group/btn"
          >
            <svg class="w-4 h-4 transition-transform group-hover/btn:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Add Child
          </button>
        </div>
      </div>
    </div>

    <!-- Children -->
    <div v-if="children.length > 0" class="flex flex-col items-center">
      <!-- Vertical Line from Parent -->
      <div class="w-0.5 h-12 bg-gradient-to-b from-blue-400 to-purple-400"></div>

      <!-- Children Container -->
      <div class="flex items-start justify-center gap-12 relative pt-0">
        <!-- Horizontal connector bar (spans entire width) -->
        <div v-if="children.length > 1" class="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-400 via-purple-400 to-purple-400 pointer-events-none"></div>

        <!-- Each Child -->
        <div v-for="(child, index) in children" :key="child.id" class="relative flex flex-col items-center">
          <!-- Vertical connector for this child -->
          <div class="w-0.5 h-12 bg-gradient-to-b from-purple-400 to-blue-400 absolute -top-0 left-1/2 -translate-x-1/2"></div>
          <!-- The child tree node -->
          <div class="pt-12">
            <TreeNode
              :church="child"
              :children="getChildren(child.id)"
              :get-children="getChildren"
              @select="$emit('select', $event)"
              @add-child="$emit('add-child', $event)"
              @edit="$emit('edit', $event)"
              @delete="$emit('delete', $event)"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useMetricsStore } from '../stores/metrics'
import { availableIcons, getIconPath } from '../constants/icons'
import { appConfig } from '../config/app.config'
import type { Church, Icon } from '../types'
import type { PropType } from 'vue'

const metricsStore = useMetricsStore()

defineProps({
  church: {
    type: Object as PropType<Church>,
    required: true
  },
  children: {
    type: Array as PropType<Church[]>,
    default: () => []
  },
  getChildren: {
    type: Function as PropType<(parentId: string | null) => Church[]>,
    required: true
  }
})

defineEmits(['select', 'add-child', 'edit', 'delete'])

// Display all metrics
const displayMetrics = computed<Metric[]>(() => {
  return metricsStore.metrics
})
</script>
