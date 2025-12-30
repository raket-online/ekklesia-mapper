<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
  >
    <div class="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
      <div class="p-6">
        <h2 class="text-2xl font-bold text-gray-800 mb-4">
          {{ isEditing ? 'Edit Church' : 'Add New Church' }}
        </h2>

        <form @submit.prevent="handleSubmit">
          <!-- Name -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Name * ({{ formData.name.length }}/{{ appConfig.validation.MAX_CHURCH_NAME_LENGTH }})
            </label>
            <input
              v-model="formData.name"
              type="text"
              required
              :maxlength="appConfig.validation.MAX_CHURCH_NAME_LENGTH"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Church name"
            />
          </div>

          <!-- Primary Metric (Members) -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">
              {{ primaryMetric.name }} *
            </label>
            <input
              v-model.number="formData.metrics[primaryMetric.key]"
              type="number"
              min="0"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="0"
            />
          </div>

          <!-- Other Metrics -->
          <div
            v-for="metric in otherMetrics"
            :key="metric.id"
            class="mb-4"
          >
            <label class="block text-sm font-medium text-gray-700 mb-1">
              {{ metric.name }}
            </label>
            <input
              v-model.number="formData.metrics[metric.key]"
              type="number"
              min="0"
              :max="formData.metrics[primaryMetric.key]"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="0"
            />
            <p
              v-if="formData.metrics[metric.key] > formData.metrics[primaryMetric.key]"
              class="text-red-500 text-sm mt-1"
            >
              Cannot exceed {{ primaryMetric.name }}
            </p>
          </div>

          <!-- Buttons -->
          <div class="flex gap-3">
            <button
              type="submit"
              :disabled="!isValid"
              class="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              {{ isEditing ? 'Save' : 'Add' }}
            </button>
            <button
              type="button"
              @click="$emit('close')"
              class="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useMetricsStore } from '../stores/metrics'
import { appConfig } from '../config/app.config'
import type { Church, ChurchData, Metric } from '../types'
import type { PropType } from 'vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  church: {
    type: Object as PropType<Church>,
    default: null
  }
})

const emit = defineEmits(['close', 'submit'])

const metricsStore = useMetricsStore()

const formData = ref<ChurchData>({
  name: '',
  metrics: {}
})

// Get primary metric
const primaryMetric = computed<Metric>(() => metricsStore.getPrimaryMetric())

// Get other metrics (non-primary)
const otherMetrics = computed<Metric[]>(() => metricsStore.metrics.filter(m => !m.isPrimary))

const isEditing = computed<boolean>(() => props.church !== null)

const isValid = computed<boolean>(() => {
  if (formData.value.name.trim() === '') return false

  const primaryValue = formData.value.metrics[primaryMetric.value.key] || 0

  // Check all metrics against primary
  for (const metric of otherMetrics.value) {
    const value = formData.value.metrics[metric.key] || 0
    if (value > primaryValue) return false
  }

  return true
})

watch(() => props.show, (newVal: boolean) => {
  if (newVal && props.church) {
    formData.value = {
      name: props.church.name,
      parentId: props.church.parentId,
      metrics: { ...props.church.metrics }
    }
  } else if (newVal) {
    // Initialize metrics with default values
    const metrics: Record<string, number> = {}
    metricsStore.metrics.forEach(metric => {
      metrics[metric.key] = metric.isPrimary
        ? appConfig.defaults.DEFAULT_PRIMARY_METRIC_VALUE
        : appConfig.defaults.DEFAULT_METRIC_VALUE
    })

    formData.value = {
      name: '',
      metrics
    }
  }
})

const handleSubmit = (): void => {
  if (isValid.value) {
    emit('submit', { ...formData.value })
  }
}
</script>
