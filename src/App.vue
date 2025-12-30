<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
    <!-- Header -->
    <header class="fixed top-0 left-0 right-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-200 shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <div>
              <h1 class="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Ekklesia Mapper</h1>
              <p class="text-sm text-gray-500">Map and measure all groups within your movement</p>
            </div>
          </div>

          <!-- Controls -->
          <div class="flex items-center gap-3">
            <!-- Auth Buttons -->
            <button
              v-if="!isAuthenticated"
              @click="showLogin = true"
              class="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-4 py-2 rounded-lg font-medium text-sm shadow-lg transition-all"
            >
              Sign In
            </button>
            <div v-else class="flex items-center gap-3">
              <span class="text-sm text-gray-600">
                {{ user?.email }}
              </span>
              <button
                @click="handleSignOut"
                class="bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg font-medium text-sm shadow-lg border border-gray-200 transition-colors"
              >
                Sign Out
              </button>
            </div>

            <div class="bg-white rounded-xl shadow-lg border border-gray-200 p-1 flex items-center gap-1">
              <button
                @click="zoomOut"
                class="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors text-gray-600 hover:text-gray-800"
                title="Zoom out"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
                </svg>
              </button>
              <span class="text-sm font-semibold text-gray-700 min-w-[60px] text-center">{{ Math.round(scale * 100) }}%</span>
              <button
                @click="zoomIn"
                class="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors text-gray-600 hover:text-gray-800"
                title="Zoom in"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
            <button
              @click="resetView"
              class="bg-white rounded-xl shadow-lg border border-gray-200 px-4 py-2 hover:bg-gray-50 transition-colors text-gray-700 font-medium text-sm flex items-center gap-2"
              title="Reset view"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Reset
            </button>
            <button
              @click="showAdmin = true"
              class="w-10 h-10 bg-white rounded-xl shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors text-gray-600 hover:text-gray-800 flex items-center justify-center"
              title="Settings"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31 2.37 2.37.996.608 2.296.07 2.572-1.065a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-1.066-2.573c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31-2.37-2.37-.996-.608-2.296-.07-2.572 1.065a1.724 1.724 0 002.573-1.066z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Canvas -->
    <div
      ref="canvasRef"
      class="fixed inset-0 pt-24 pb-4 overflow-hidden cursor-grab active:cursor-grabbing"
      :class="{ 'cursor-grabbing': isDragging }"
      @mousedown="handleMouseDown"
      @mousemove="handleMouseMove"
      @mouseup="handleMouseUp"
      @mouseleave="handleMouseUp"
      @wheel.prevent="handleWheel"
    >
      <div
        class="flex items-start justify-center min-w-full min-h-full origin-top transition-transform duration-100 ease-out"
        :style="canvasStyle"
      >
        <div class="p-8">
          <TreeNode
            v-if="rootChurch"
            :church="rootChurch"
            :children="getChildren(rootChurch.id)"
            :get-children="getChildren"
            @select="handleSelect"
            @add-child="handleAddChild"
            @edit="handleEdit"
            @delete="handleDelete"
          />
        </div>
      </div>
    </div>

    <!-- Stats Panel -->
    <StatsPanel :stats="totalStats" />

    <!-- Church Form Modal -->
    <ChurchForm
      :show="showForm"
      :church="editingChurch"
      @close="closeForm"
      @submit="handleSubmit"
    />

    <!-- Admin Panel Modal -->
    <AdminPanel
      :show="showAdmin"
      @close="showAdmin = false"
    />

    <!-- Login Modal -->
    <LoginModal
      :show="showLogin"
      @close="showLogin = false"
      @switch-to-register="showLogin = false; showRegister = true"
    />

    <!-- Register Modal -->
    <RegisterModal
      :show="showRegister"
      @close="showRegister = false"
      @switch-to-login="showRegister = false; showLogin = true"
    />

    <!-- Toast Notification -->
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="transform translate-y-4 opacity-0"
      enter-to-class="transform translate-y-0 opacity-100"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="transform translate-y-0 opacity-100"
      leave-to-class="transform translate-y-4 opacity-0"
    >
      <div
        v-if="toast.show"
        class="fixed bottom-4 left-4 z-50 bg-white rounded-xl shadow-2xl border-l-4 px-6 py-4 flex items-center gap-3"
        :class="{
          'border-green-500': toast.type === 'success',
          'border-red-500': toast.type === 'error',
          'border-blue-500': toast.type === 'info'
        }"
      >
        <div v-if="toast.type === 'success'" class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
          <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div v-else-if="toast.type === 'error'" class="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
          <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <div v-else class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
          <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <p class="font-medium text-gray-800">{{ toast.message }}</p>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useChurchesStore } from './stores/churches'
import { usePanZoom } from './composables/usePanZoom'
import { useAuth } from './composables/useAuth'
import TreeNode from './components/TreeNode.vue'
import ChurchForm from './components/ChurchForm.vue'
import StatsPanel from './components/StatsPanel.vue'
import AdminPanel from './components/AdminPanel.vue'
import LoginModal from './components/LoginModal.vue'
import RegisterModal from './components/RegisterModal.vue'
import type { Church, ChurchData, Stats, Toast } from './types'

const store = useChurchesStore()
const { scale, translateX, translateY, isDragging, handleMouseDown, handleMouseMove, handleMouseUp, handleWheel, reset, fitToScreen } = usePanZoom()
const { user, isAuthenticated, signOut } = useAuth()

const showForm = ref<boolean>(false)
const showAdmin = ref<boolean>(false)
const showLogin = ref<boolean>(false)
const showRegister = ref<boolean>(false)
const editingChurch = ref<Church | null>(null)
const parentId = ref<string | null>(null)
const toast = ref<Toast>({ show: false, message: '', type: 'info' })

const canvasStyle = computed(() => ({
  transform: `translate(${translateX.value}px, ${translateY.value}px) scale(${scale.value})`
}))

// Find root church (the one with no parent)
const rootChurch = computed<Church | null>(() => {
  return store.churches.find(c => c.parentId === null) || null
})

const totalStats = computed<Stats>(() => store.totalStats)

const getChildren = (parentId: string | null): Church[] => store.getChildren(parentId)

// Calculate tree statistics for smart zoom
const calculateTreeStats = (): { totalChurches: number; maxDepth: number } => {
  if (!rootChurch.value) {
    return { totalChurches: 0, maxDepth: 0 }
  }

  let totalChurches = 0
  let maxDepth = 0

  const traverse = (parentId: string | null, depth: number): void => {
    const children = getChildren(parentId)
    totalChurches += children.length
    maxDepth = Math.max(maxDepth, depth)

    children.forEach(child => {
      traverse(child.id, depth + 1)
    })
  }

  traverse(rootChurch.value.id, 1)

  return { totalChurches, maxDepth }
}

const handleSelect = (church: Church): void => {
  // Future: Show church details
}

const handleAddChild = (id: string): void => {
  parentId.value = id
  editingChurch.value = null
  showForm.value = true
}

const handleEdit = (church: Church): void => {
  editingChurch.value = church
  parentId.value = null
  showForm.value = true
}

const handleDelete = (id: string): void => {
  // Prevent deleting root church (the one without parent)
  const churchToDelete = store.getChurch(id)
  if (churchToDelete && churchToDelete.parentId === null) {
    showToast('Cannot delete the root church', 'error')
    return
  }

  if (confirm('Are you sure you want to delete this church and all sub-churches?')) {
    try {
      store.deleteChurch(id)
      showToast('Church successfully deleted', 'success')
      // Adjust zoom after deletion
      const { totalChurches, maxDepth } = calculateTreeStats()
      fitToScreen(totalChurches, maxDepth)
    } catch (error) {
      showToast((error as Error).message, 'error')
    }
  }
}

const closeForm = (): void => {
  showForm.value = false
  editingChurch.value = null
  parentId.value = null
}

const handleSubmit = async (data: ChurchData): Promise<void> => {
  try {
    if (editingChurch.value) {
      await store.updateChurch(editingChurch.value.id, data)
      showToast('Church successfully updated', 'success')
    } else {
      await store.addChurch(parentId.value, data)
      showToast('New church successfully added', 'success')
      // Adjust zoom to fit new church
      const { totalChurches, maxDepth } = calculateTreeStats()
      fitToScreen(totalChurches, maxDepth)
    }
    closeForm()
  } catch (error) {
    showToast((error as Error).message, 'error')
  }
}

const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info'): void => {
  toast.value = { show: true, message, type }
  setTimeout(() => {
    toast.value.show = false
  }, 3000)
}

const zoomIn = (): void => {
  if (scale.value < 3) {
    scale.value = Math.min(scale.value * 1.1, 3)
  }
}

const zoomOut = (): void => {
  if (scale.value > 0.2) {
    scale.value = Math.max(scale.value / 1.1, 0.2)
  }
}

const resetView = (): void => {
  const { totalChurches, maxDepth } = calculateTreeStats()
  fitToScreen(totalChurches, maxDepth)
}

const handleSignOut = async (): Promise<void> => {
  try {
    await signOut()
    showToast('Successfully signed out', 'success')
  } catch (error) {
    showToast((error as Error).message, 'error')
  }
}

// Keyboard shortcuts
const handleKeydown = (e: KeyboardEvent): void => {
  if (e.key === 'Escape') {
    closeForm()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
  // Initialize smart zoom on mount to fit all churches on screen
  const { totalChurches, maxDepth } = calculateTreeStats()
  fitToScreen(totalChurches, maxDepth)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>
