import { ref } from 'vue'

export function usePanZoom() {
  const scale = ref(1)
  const translateX = ref(0)
  const translateY = ref(0)
  const isDragging = ref(false)
  const startX = ref(0)
  const startY = ref(0)

  const handleMouseDown = (e) => {
    isDragging.value = true
    startX.value = e.clientX - translateX.value
    startY.value = e.clientY - translateY.value
  }

  const handleMouseMove = (e) => {
    if (!isDragging.value) return
    translateX.value = e.clientX - startX.value
    translateY.value = e.clientY - startY.value
  }

  const handleMouseUp = () => {
    isDragging.value = false
  }

  const handleWheel = (e) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? 0.9 : 1.1
    const newScale = scale.value * delta

    // Limit zoom
    if (newScale >= 0.2 && newScale <= 3) {
      scale.value = newScale
    }
  }

  const reset = () => {
    scale.value = 1
    translateX.value = 0
    translateY.value = 0
  }

  return {
    scale,
    translateX,
    translateY,
    isDragging,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleWheel,
    reset
  }
}
