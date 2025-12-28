<template>
  <div class="bg-gray-50 rounded-xl p-4">
    <h3 class="text-lg font-semibold text-gray-800 mb-3">Add New Metric</h3>
    <form @submit.prevent="handleSubmit" class="space-y-3">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Metric Name * ({{ formData.name.length }}/{{ appConfig.validation.MAX_METRIC_NAME_LENGTH }})
        </label>
        <input
          v-model="formData.name"
          type="text"
          required
          :maxlength="appConfig.validation.MAX_METRIC_NAME_LENGTH"
          placeholder="Metric name"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      <div class="flex gap-3">
        <select v-model="formData.color" required class="flex-1 px-4 py-2 border border-gray-300 rounded-lg">
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
      <button
        type="submit"
        class="w-full px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg font-semibold transition-colors"
      >
        Add Metric
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { availableIcons } from '../constants/icons'
import { appConfig } from '../config/app.config'
import type { MetricColor, IconId } from '../types'

const emit = defineEmits<{
  (e: 'submit', data: { name: string; color: MetricColor; icon: IconId }): void
}>()

const formData = ref({
  name: '',
  color: 'blue' as MetricColor,
  icon: 'plus' as IconId
})

const handleSubmit = (): void => {
  emit('submit', { ...formData.value })
  formData.value = { name: '', color: 'blue', icon: 'plus' }
}
</script>
