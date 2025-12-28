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
