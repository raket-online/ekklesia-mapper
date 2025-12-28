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
      <span class="font-semibold">{{ stats.totals[primaryMetric.key] }} {{ primaryMetric.name }}</span>
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
      <div class="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
        <!-- Total Primary Metric -->
        <div
          class="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100"
        >
          <div class="flex items-center justify-between">
            <span class="text-blue-900 font-semibold">Total {{ primaryMetric.name }}</span>
            <span class="text-3xl font-bold text-blue-600">{{ stats.totals[primaryMetric.key] }}</span>
          </div>
        </div>

        <!-- Metrics Grid -->
        <div class="grid grid-cols-2 gap-3">
          <div
            v-for="metric in displayMetrics"
            :key="metric.id"
            :class="`bg-white rounded-lg p-3 border-2 ${metric.borderColor} hover:border-${metric.color}-400 hover:shadow-md transition-all duration-300 group`"
          >
            <div class="flex items-center gap-2 mb-2">
              <div
                :class="`w-8 h-8 bg-${metric.color}-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform`"
              >
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="getIconPath(metric.icon)" />
                </svg>
              </div>
              <span :class="`text-xs font-medium text-${metric.color}-700`">{{ metric.name }}</span>
            </div>
            <div :class="`text-2xl font-bold text-${metric.color}-600`">{{ stats.totals[metric.key] }}</div>
            <div :class="`text-sm text-${metric.color}-500 font-medium`">{{ stats.percentages[metric.key] }}%</div>
          </div>
        </div>

        <!-- Progress Bars -->
        <div class="space-y-2 pt-2">
          <div
            v-for="metric in displayMetrics"
            :key="metric.id"
            class="flex items-center gap-2"
          >
            <span class="text-xs font-medium text-gray-600 w-20">{{ metric.name }}</span>
            <div class="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                :class="`bg-gradient-to-r from-${metric.color}-400 to-${metric.color}-600 h-full rounded-full transition-all duration-1000 ease-out`"
                :style="{ width: stats.percentages[metric.key] + '%' }"
              ></div>
            </div>
            <span class="text-xs font-medium text-gray-600 w-10 text-right">{{ stats.percentages[metric.key] }}%</span>
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

// Get primary metric
const primaryMetric = computed<Metric>(() => metricsStore.getPrimaryMetric())

// Get display metrics (all except primary)
const displayMetrics = computed<Metric[]>(() => metricsStore.metrics.filter(m => !m.isPrimary))

const toggle = (): void => {
  isExpanded.value = !isExpanded.value
}
</script>
