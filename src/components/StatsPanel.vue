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
      <span class="font-semibold">{{ stats.totals.members }} Members</span>
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
        <!-- Total Members -->
        <div class="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
          <div class="flex items-center justify-between">
            <span class="text-blue-900 font-semibold">Total Members</span>
            <span class="text-3xl font-bold text-blue-600">{{ stats.totals.members }}</span>
          </div>
        </div>

        <!-- Metrics Grid -->
        <div class="grid grid-cols-2 gap-3">
          <!-- Baptized -->
          <div class="bg-white rounded-lg p-3 border-2 border-green-200 hover:border-green-400 hover:shadow-md transition-all duration-300 group">
            <div class="flex items-center gap-2 mb-2">
              <div class="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span class="text-xs font-medium text-green-700">Baptized</span>
            </div>
            <div class="text-2xl font-bold text-green-600">{{ stats.totals.baptized }}</div>
            <div class="text-sm text-green-500 font-medium">{{ stats.percentages.baptized }}%</div>
          </div>

          <!-- Calling -->
          <div class="bg-white rounded-lg p-3 border-2 border-purple-200 hover:border-purple-400 hover:shadow-md transition-all duration-300 group">
            <div class="flex items-center gap-2 mb-2">
              <div class="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <span class="text-xs font-medium text-purple-700">Calling</span>
            </div>
            <div class="text-2xl font-bold text-purple-600">{{ stats.totals.calling }}</div>
            <div class="text-sm text-purple-500 font-medium">{{ stats.percentages.calling }}%</div>
          </div>

          <!-- Community -->
          <div class="bg-white rounded-lg p-3 border-2 border-yellow-200 hover:border-yellow-400 hover:shadow-md transition-all duration-300 group">
            <div class="flex items-center gap-2 mb-2">
              <div class="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <span class="text-xs font-medium text-yellow-700">Community</span>
            </div>
            <div class="text-2xl font-bold text-yellow-600">{{ stats.totals.community }}</div>
            <div class="text-sm text-yellow-500 font-medium">{{ stats.percentages.community }}%</div>
          </div>

          <!-- Commission -->
          <div class="bg-white rounded-lg p-3 border-2 border-orange-200 hover:border-orange-400 hover:shadow-md transition-all duration-300 group">
            <div class="flex items-center gap-2 mb-2">
              <div class="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <span class="text-xs font-medium text-orange-700">Commission</span>
            </div>
            <div class="text-2xl font-bold text-orange-600">{{ stats.totals.commission }}</div>
            <div class="text-sm text-orange-500 font-medium">{{ stats.percentages.commission }}%</div>
          </div>

          <!-- Reaching -->
          <div class="bg-white rounded-lg p-3 border-2 border-pink-200 hover:border-pink-400 hover:shadow-md transition-all duration-300 group col-span-2">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <div class="w-8 h-8 bg-pink-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span class="text-xs font-medium text-pink-700">Reaching</span>
              </div>
              <div class="flex items-center gap-3">
                <div class="text-right">
                  <div class="text-2xl font-bold text-pink-600">{{ stats.totals.reaching }}</div>
                  <div class="text-sm text-pink-500 font-medium">{{ stats.percentages.reaching }}%</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Progress Bars -->
        <div class="space-y-2 pt-2">
          <div class="flex items-center gap-2">
            <span class="text-xs font-medium text-gray-600 w-20">Baptized</span>
            <div class="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                class="bg-gradient-to-r from-green-400 to-green-600 h-full rounded-full transition-all duration-1000 ease-out"
                :style="{ width: stats.percentages.baptized + '%' }"
              ></div>
            </div>
            <span class="text-xs font-medium text-gray-600 w-10 text-right">{{ stats.percentages.baptized }}%</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-xs font-medium text-gray-600 w-20">Calling</span>
            <div class="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                class="bg-gradient-to-r from-purple-400 to-purple-600 h-full rounded-full transition-all duration-1000 ease-out"
                :style="{ width: stats.percentages.calling + '%' }"
              ></div>
            </div>
            <span class="text-xs font-medium text-gray-600 w-10 text-right">{{ stats.percentages.calling }}%</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-xs font-medium text-gray-600 w-20">Community</span>
            <div class="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                class="bg-gradient-to-r from-yellow-400 to-yellow-600 h-full rounded-full transition-all duration-1000 ease-out"
                :style="{ width: stats.percentages.community + '%' }"
              ></div>
            </div>
            <span class="text-xs font-medium text-gray-600 w-10 text-right">{{ stats.percentages.community }}%</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-xs font-medium text-gray-600 w-20">Commission</span>
            <div class="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                class="bg-gradient-to-r from-orange-400 to-orange-600 h-full rounded-full transition-all duration-1000 ease-out"
                :style="{ width: stats.percentages.commission + '%' }"
              ></div>
            </div>
            <span class="text-xs font-medium text-gray-600 w-10 text-right">{{ stats.percentages.commission }}%</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-xs font-medium text-gray-600 w-20">Reaching</span>
            <div class="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                class="bg-gradient-to-r from-pink-400 to-pink-600 h-full rounded-full transition-all duration-1000 ease-out"
                :style="{ width: stats.percentages.reaching + '%' }"
              ></div>
            </div>
            <span class="text-xs font-medium text-gray-600 w-10 text-right">{{ stats.percentages.reaching }}%</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  stats: {
    type: Object,
    required: true
  }
})

const isExpanded = ref(true)

const toggle = () => {
  isExpanded.value = !isExpanded.value
}
</script>
