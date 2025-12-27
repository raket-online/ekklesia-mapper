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
              v-if="church.id !== 'root'"
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

<script setup>
import { computed } from 'vue'
import { useMetricsStore } from '../stores/metrics'

const metricsStore = useMetricsStore()

defineProps({
  church: {
    type: Object,
    required: true
  },
  children: {
    type: Array,
    default: () => []
  },
  getChildren: {
    type: Function,
    required: true
  }
})

defineEmits(['select', 'add-child', 'edit', 'delete'])

// Display all metrics
const displayMetrics = computed(() => {
  return metricsStore.metrics
})

// Available icons (same as AdminPanel)
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
</script>
