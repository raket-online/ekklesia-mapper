import { ref } from 'vue'
import { appConfig } from '../config/app.config'

interface UsePanZoomReturn {
  scale: ReturnType<typeof ref<number>>
  translateX: ReturnType<typeof ref<number>>
  translateY: ReturnType<typeof ref<number>>
  isDragging: ReturnType<typeof ref<boolean>>
  handleMouseDown: (e: MouseEvent) => void
  handleMouseMove: (e: MouseEvent) => void
  handleMouseUp: () => void
  handleWheel: (e: WheelEvent) => void
  reset: () => void
  fitToScreen: (totalChurches: number, maxDepth: number) => void
}

export function usePanZoom(): UsePanZoomReturn {
  const scale = ref<number>(appConfig.zoom.DEFAULT_SCALE)
  const translateX = ref<number>(appConfig.zoom.DEFAULT_TRANSLATE_X)
  const translateY = ref<number>(appConfig.zoom.DEFAULT_TRANSLATE_Y)
  const isDragging = ref<boolean>(false)
  const startX = ref<number>(0)
  const startY = ref<number>(0)

  const handleMouseDown = (e: MouseEvent): void => {
    isDragging.value = true
    startX.value = e.clientX - translateX.value
    startY.value = e.clientY - translateY.value
  }

  const handleMouseMove = (e: MouseEvent): void => {
    if (!isDragging.value) return
    translateX.value = e.clientX - startX.value
    translateY.value = e.clientY - startY.value
  }

  const handleMouseUp = (): void => {
    isDragging.value = false
  }

  const handleWheel = (e: WheelEvent): void => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? appConfig.zoom.ZOOM_OUT_FACTOR : appConfig.zoom.ZOOM_IN_FACTOR
    const newScale = scale.value * delta

    // Limit zoom
    if (newScale >= appConfig.zoom.MIN_SCALE && newScale <= appConfig.zoom.MAX_SCALE) {
      scale.value = newScale
    }
  }

  const reset = (): void => {
    scale.value = appConfig.zoom.DEFAULT_SCALE
    translateX.value = appConfig.zoom.DEFAULT_TRANSLATE_X
    translateY.value = appConfig.zoom.DEFAULT_TRANSLATE_Y
  }

  /**
   * Smart zoom: automatically calculate optimal zoom level to fit all churches on screen
   * Based on total number of churches and tree depth
   */
  const fitToScreen = (totalChurches: number, maxDepth: number): void => {
    // Base zoom on number of churches - more churches = smaller zoom
    // Each church card is approximately 480px wide with spacing
    const cardWidth = 500
    const spacing = 100
    const totalWidthNeeded = Math.max(totalChurches * cardWidth + (totalChurches - 1) * spacing, 1200)

    // Typical screen width is around 1920px (desktop), but we want some padding
    const screenWidth = window.innerWidth || 1920
    const padding = 200

    // Calculate scale based on width needed
    let calculatedScale = (screenWidth - padding) / totalWidthNeeded

    // Also consider depth - deeper trees need more vertical space
    // Each level is approximately 250px tall (card + connector)
    const levelHeight = 300
    const totalHeightNeeded = maxDepth * levelHeight
    const screenHeight = (window.innerHeight || 1080) - 200 // Account for header

    const verticalScale = screenHeight / totalHeightNeeded

    // Use the smaller of the two scales to ensure everything fits
    calculatedScale = Math.min(calculatedScale, verticalScale)

    // Clamp to reasonable limits
    calculatedScale = Math.max(0.15, Math.min(calculatedScale, 1.0))

    scale.value = calculatedScale
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
    reset,
    fitToScreen
  }
}
