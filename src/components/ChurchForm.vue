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
              Name *
            </label>
            <input
              v-model="formData.name"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Church name"
            />
          </div>

          <!-- Members -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Number of Members *
            </label>
            <input
              v-model.number="formData.metrics.members"
              type="number"
              min="0"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="0"
            />
          </div>

          <!-- Baptized -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Baptized
            </label>
            <input
              v-model.number="formData.metrics.baptized"
              type="number"
              min="0"
              :max="formData.metrics.members"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="0"
            />
            <p v-if="formData.metrics.baptized > formData.metrics.members" class="text-red-500 text-sm mt-1">
              Cannot exceed members
            </p>
          </div>

          <!-- Calling -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Calling (Connection with God)
            </label>
            <input
              v-model.number="formData.metrics.calling"
              type="number"
              min="0"
              :max="formData.metrics.members"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="0"
            />
            <p v-if="formData.metrics.calling > formData.metrics.members" class="text-red-500 text-sm mt-1">
              Cannot exceed members
            </p>
          </div>

          <!-- Community -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Community (Connection with family)
            </label>
            <input
              v-model.number="formData.metrics.community"
              type="number"
              min="0"
              :max="formData.metrics.members"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="0"
            />
            <p v-if="formData.metrics.community > formData.metrics.members" class="text-red-500 text-sm mt-1">
              Cannot exceed members
            </p>
          </div>

          <!-- Commission -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Commission (Serving others)
            </label>
            <input
              v-model.number="formData.metrics.commission"
              type="number"
              min="0"
              :max="formData.metrics.members"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="0"
            />
            <p v-if="formData.metrics.commission > formData.metrics.members" class="text-red-500 text-sm mt-1">
              Cannot exceed members
            </p>
          </div>

          <!-- Reaching -->
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Reaching others
            </label>
            <input
              v-model.number="formData.metrics.reaching"
              type="number"
              min="0"
              :max="formData.metrics.members"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="0"
            />
            <p v-if="formData.metrics.reaching > formData.metrics.members" class="text-red-500 text-sm mt-1">
              Cannot exceed members
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

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  church: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'submit'])

const formData = ref({
  name: '',
  metrics: {
    members: 0,
    baptized: 0,
    calling: 0,
    community: 0,
    commission: 0,
    reaching: 0
  }
})

const isEditing = computed(() => props.church !== null)

const isValid = computed(() => {
  const m = formData.value.metrics
  return (
    formData.value.name.trim() !== '' &&
    m.baptized <= m.members &&
    m.calling <= m.members &&
    m.community <= m.members &&
    m.commission <= m.members &&
    m.reaching <= m.members
  )
})

watch(() => props.show, (newVal) => {
  if (newVal && props.church) {
    formData.value = {
      name: props.church.name,
      metrics: { ...props.church.metrics }
    }
  } else if (newVal) {
    formData.value = {
      name: '',
      metrics: {
        members: 0,
        baptized: 0,
        calling: 0,
        community: 0,
        commission: 0,
        reaching: 0
      }
    }
  }
})

const handleSubmit = () => {
  if (isValid.value) {
    emit('submit', { ...formData.value })
  }
}
</script>
