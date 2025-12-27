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

<script setup>
import { ref, computed } from 'vue'
import { useMetricsStore } from '../stores/metrics'

const props = defineProps({
  stats: {
    type: Object,
    required: true
  }
})

const metricsStore = useMetricsStore()

const isExpanded = ref(true)

// Get primary metric
const primaryMetric = computed(() => metricsStore.getPrimaryMetric())

// Get display metrics (all except primary)
const displayMetrics = computed(() => metricsStore.metrics.filter(m => !m.isPrimary))

// Available icons (same as AdminPanel and TreeNode)
const availableIcons = [
  { id: 'users', path: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
  { id: 'plus', path: 'M12 4v16m8-8H4' },
  { id: 'heart', path: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' },
  { id: 'globe', path: 'M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9' },
  { id: 'fire', path: 'M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z' },
  { id: 'star', path: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z' },
  { id: 'lightning', path: 'M13 10V3L4 14h7v7l9-11h-7z' },
  { id: 'chart', path: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
  { id: 'book', path: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
  { id: 'gift', path: 'M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7' },
  { id: 'hand', path: 'M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11' },
  { id: 'home', path: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { id: 'check', path: 'M5 13l4 4L19 7' },
  { id: 'circle', path: 'M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z' },
  { id: 'water', path: 'M12 2.69l5.66 5.66a8 8 0 11-11.31 0z' },
  { id: 'bread', path: 'M13.188 4.683c-.723-.723-.815-1.012.594-1.528c3.933-1.44 8.42 2.84 7.39 6.9c-.598 2.357-2.214 4.812-4.208 6.889c-2.077 1.994-4.532 3.61-6.89 4.209c-4.06 1.03-8.34-3.458-6.899-7.39c.516-1.41.805-1.318 1.527-.595c-2.278-2.278 1.624-6.862 3.776-4.71c-2.152-2.152 2.431-6.054 4.71-3.775m0 0l3.068 3.069m-3.068-3.07c-.723-.722-.815-1.01.593-1.527c3.934-1.44 8.422 2.84 7.391 6.9c-.598 2.357-2.214 4.812-4.209 6.889c-2.076 1.994-4.531 3.61-6.889 4.209c-4.06 1.03-8.34-3.458-6.899-7.391c.516-1.408.804-1.317 1.527-.594m8.486-8.485c-2.28-2.279-6.862 1.623-4.71 3.776m0 0l3.536 3.535M8.478 8.46c-2.152-2.153-6.054 2.43-3.776 4.709m0 0l3.07 3.069' },
  { id: 'seed', path: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253M12 3v1' },
  { id: 'money', path: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
  { id: 'sparkles', path: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z' },
  { id: 'prayer', path: 'M16.8 4.8c0-1.3-1.1-2.4-2.4-2.4s-2.4 1.1-2.4 2.4s1.1 2.4 2.4 2.4s2.4-1.1 2.4-2.4M12.3 12.3l.9 1.2c.2.3.6.5 1 .6s.8-.1 1.1-.3l3.3-2.7c.6-.5.7-1.5.2-2.1s-1.5-.7-2.1-.2l-2.1 1.7l-1-1.4c-.6-.8-1.5-1.3-2.5-1.3c-1.2 0-2.2.6-2.8 1.7l-1.8 3.5c-.8 1.4-.4 3.2 1 4.2l2 1.5H6.3c-.8 0-1.5.7-1.5 1.5s.7 1.5 1.5 1.5h7.8c.6 0 1.2-.4 1.4-1s-.1-1.3-.5-1.7l-3.3-2.4z' },
  { id: 'shepherd', path: 'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z' },
  { id: 'worship', path: 'M10 2a2 2 0 1 1-3.999.001A2 2 0 0 1 10 2M6 16h1.5v-5h1v5H10V7l-.001-.052c0-.521.194-.997.513-1.36L13.79 2.27a.73.73 0 1 0-.998-1.003L10.43 3.65c-.212.216-.508.35-.835.35H6.404c-.327 0-.622-.134-.834-.35L3.25 1.26a.73.73 0 1 0-1.003.998L5.49 5.59c.317.361.511.836.511 1.358L6 7.003z' },
  { id: 'fellowship', path: 'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-5.5 2c-3.03 0-5.5 2.47-5.5 5.5V22h11v-2.5c0-3.03-2.47-5.5-5.5-5.5zm11 0c-3.03 0-5.5 2.47-5.5 5.5V22h11v-2.5c0-3.03-2.47-5.5-5.5-5.5z' },
  { id: 'tag', path: 'M10 14L21 3m0 0l-6.5 18a.55.55 0 0 1-1 0L10 14l-7-3.5a.55.55 0 0 1 0-1z' }
]

const getIconPath = (iconId) => {
  const icon = availableIcons.find(i => i.id === iconId)
  return icon ? icon.path : availableIcons[1].path // Default to plus icon
}

const toggle = () => {
  isExpanded.value = !isExpanded.value
}
</script>
