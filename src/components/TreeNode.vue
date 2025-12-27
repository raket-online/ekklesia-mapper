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
          <div class="bg-gradient-to-br from-blue-50 to-blue-100 p-3 rounded-xl border border-blue-200 hover:shadow-md transition-all">
            <div class="flex items-center gap-2">
              <div class="w-6 h-6 bg-blue-500 rounded-lg flex items-center justify-center">
                <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <div class="text-xs text-blue-600 font-medium">Members</div>
                <div class="text-lg font-bold text-blue-700">{{ church.metrics.members }}</div>
              </div>
            </div>
          </div>
          <div class="bg-gradient-to-br from-green-50 to-green-100 p-3 rounded-xl border border-green-200 hover:shadow-md transition-all">
            <div class="flex items-center gap-2">
              <div class="w-6 h-6 bg-green-500 rounded-lg flex items-center justify-center">
                <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <div class="text-xs text-green-600 font-medium">Baptized</div>
                <div class="text-lg font-bold text-green-700">{{ church.metrics.baptized }}</div>
              </div>
            </div>
          </div>
          <div class="bg-gradient-to-br from-purple-50 to-purple-100 p-3 rounded-xl border border-purple-200 hover:shadow-md transition-all">
            <div class="flex items-center gap-2">
              <div class="w-6 h-6 bg-purple-500 rounded-lg flex items-center justify-center">
                <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <div>
                <div class="text-xs text-purple-600 font-medium">Calling</div>
                <div class="text-lg font-bold text-purple-700">{{ church.metrics.calling }}</div>
              </div>
            </div>
          </div>
          <div class="bg-gradient-to-br from-yellow-50 to-yellow-100 p-3 rounded-xl border border-yellow-200 hover:shadow-md transition-all">
            <div class="flex items-center gap-2">
              <div class="w-6 h-6 bg-yellow-500 rounded-lg flex items-center justify-center">
                <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <div>
                <div class="text-xs text-yellow-600 font-medium">Community</div>
                <div class="text-lg font-bold text-yellow-700">{{ church.metrics.community }}</div>
              </div>
            </div>
          </div>
          <div class="bg-gradient-to-br from-orange-50 to-orange-100 p-3 rounded-xl border border-orange-200 hover:shadow-md transition-all">
            <div class="flex items-center gap-2">
              <div class="w-6 h-6 bg-orange-500 rounded-lg flex items-center justify-center">
                <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                </svg>
              </div>
              <div>
                <div class="text-xs text-orange-600 font-medium">Commission</div>
                <div class="text-lg font-bold text-orange-700">{{ church.metrics.commission }}</div>
              </div>
            </div>
          </div>
          <div class="bg-gradient-to-br from-pink-50 to-pink-100 p-3 rounded-xl border border-pink-200 hover:shadow-md transition-all">
            <div class="flex items-center gap-2">
              <div class="w-6 h-6 bg-pink-500 rounded-lg flex items-center justify-center">
                <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <div class="text-xs text-pink-600 font-medium">Reaching</div>
                <div class="text-lg font-bold text-pink-700">{{ church.metrics.reaching }}</div>
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
</script>
