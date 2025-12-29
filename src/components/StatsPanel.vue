<template>
  <div class="fixed bottom-4 right-4 z-40">
    <!-- Collapsed State -->
    <div
      v-if="!isExpanded"
      @click="toggle"
      class="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-full shadow-2xl cursor-pointer hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105 flex items-center gap-3"
    >
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
      <span class="font-semibold">{{ stats.totals[allMetrics[0].key] }} {{ allMetrics[0].name }}</span>
      <svg class="w-5 h-5 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
      </svg>
    </div>

    <!-- Expanded State -->
    <div
      v-else
      class="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200 overflow-hidden transition-all duration-500 w-96"
    >
      <!-- Header -->
      <div
        @click="toggle"
        class="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4 cursor-pointer hover:opacity-90 transition-opacity flex items-center justify-between"
      >
        <div class="flex items-center gap-3">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <span class="font-bold text-lg">Total Overview</span>
        </div>
        <svg class="w-5 h-5 transition-transform duration-300 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
        </svg>
      </div>

      <!-- Content -->
      <div class="p-4 space-y-3 max-h-[50vh] overflow-y-auto">
        <!-- All Metrics with Progress Bars -->
        <div class="space-y-2">
          <div
            v-for="metric in allMetrics"
            :key="metric.id"
            :class="`${metric.classes.bgLight} rounded-lg p-3 border ${metric.classes.border}`"
          >
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center gap-2">
                <div :class="`w-6 h-6 ${metric.classes.bg} rounded flex items-center justify-center`">
                  <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="getIconPath(metric.icon)" />
                  </svg>
                </div>
                <span :class="`text-sm font-semibold ${metric.classes.text900}`">{{ metric.name }}</span>
              </div>
              <span :class="`text-lg font-bold ${metric.classes.text}`">{{ stats.totals[metric.key] }} ({{ stats.percentages[metric.key] }}%)</span>
            </div>
            <div class="bg-white rounded-full h-2 overflow-hidden">
              <div
                :class="`bg-gradient-to-r ${metric.classes.gradientFrom400} ${metric.classes.gradientTo600} h-full rounded-full transition-all duration-1000 ease-out`"
                :style="{ width: stats.percentages[metric.key] + '%' }"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useMetricsStore } from '../stores/metrics'
import { availableIcons, getIconPath } from '../constants/icons'
import { getMetricClasses } from '../utils/metricColors'
import type { Stats, Metric } from '../types'
import type { PropType } from 'vue'

const props = defineProps({
  stats: {
    type: Object as PropType<Stats>,
    required: true
  }
})

const metricsStore = useMetricsStore()

const isExpanded = ref<boolean>(true)

// Get all metrics (primary + others) for unified display with color classes
const allMetrics = computed(() => {
  const primary = metricsStore.getPrimaryMetric()
  const others = metricsStore.metrics.filter(m => !m.isPrimary)
  return [primary, ...others].map(metric => {
    const classes = getMetricClasses(metric.color as any)
    return {
      ...metric,
      classes: classes || getMetricClasses('blue') // Fallback to blue if color not found
    }
  })
})

const toggle = (): void => {
  isExpanded.value = !isExpanded.value
}
</script>
