<template>
  <div v-if="show" class="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
    <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
      <h3 class="text-xl font-bold text-gray-800 mb-4">Edit Metric</h3>
      <form @submit.prevent="handleSubmit">
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Name * ({{ formData.name.length }}/{{ appConfig.validation.MAX_METRIC_NAME_LENGTH }})
            </label>
            <input
              v-model="formData.name"
              type="text"
              required
              :maxlength="appConfig.validation.MAX_METRIC_NAME_LENGTH"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Color</label>
            <select v-model="formData.color" required class="w-full px-4 py-2 border border-gray-300 rounded-lg">
              <option value="blue">Blue</option>
              <option value="green">Green</option>
              <option value="purple">Purple</option>
              <option value="yellow">Yellow</option>
              <option value="orange">Orange</option>
              <option value="pink">Pink</option>
              <option value="red">Red</option>
              <option value="indigo">Indigo</option>
              <option value="teal">Teal</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Select Icon</label>
            <div class="grid grid-cols-6 gap-2">
              <button
                v-for="icon in availableIcons"
                :key="icon.id"
                type="button"
                @click="formData.icon = icon.id"
                :class="`p-3 rounded-lg border-2 transition-all ${formData.icon === icon.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`"
                :title="icon.name"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="icon.path" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        <div class="flex gap-3 mt-6">
          <button
            type="button"
            @click="$emit('cancel')"
            class="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { availableIcons } from '../constants/icons'
import { appConfig } from '../config/app.config'
import type { Metric, MetricColor, IconId } from '../types'

const props = defineProps<{
  show: boolean
  metric: Metric | null
}>()

const emit = defineEmits<{
  (e: 'submit', data: { name: string; color: MetricColor; icon: IconId }): void
  (e: 'cancel'): void
}>()

const formData = ref({
  name: '',
  color: 'blue' as MetricColor,
  icon: 'plus' as IconId
})

watch(() => props.metric, (metric) => {
  if (metric) {
    formData.value = {
      name: metric.name,
      color: metric.color as MetricColor,
      icon: (metric.icon || 'plus') as IconId
    }
  }
}, { immediate: true })

const handleSubmit = (): void => {
  emit('submit', { ...formData.value })
}
</script>
