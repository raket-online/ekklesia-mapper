/**
 * Type definitions for Ekklesia Mapper
 */

// Metric types
export interface Metric {
  id: string
  name: string
  key: string
  color: MetricColor
  gradientFrom: string
  gradientTo: string
  borderColor: string
  icon: IconId
  order: number
  isPrimary: boolean
}

export interface MetricData {
  name: string
  color: MetricColor
  icon: IconId
}

// Church types
export interface Church {
  id: ChurchId
  name: string
  parentId: ChurchId | null
  metrics: Record<string, number>
}

export interface ChurchData {
  name: string
  parentId?: string | null
  metrics: Record<string, number>
}

// Stats types
export interface Stats {
  totals: Record<string, number>
  percentages: Record<string, number>
}

// Icon types
export interface Icon {
  id: IconId
  name: string
  path: string
}

// Toast types
export type ToastType = 'success' | 'error' | 'info'

export interface Toast {
  show: boolean
  message: string
  type: ToastType
}

// Custom type aliases for better type safety
export type ChurchId = string // Could be branded type: `church-${string}`
export type MetricId = string // Could be branded type: `metric-${string}`
export type IconId =
  | 'users'
  | 'plus'
  | 'heart'
  | 'globe'
  | 'fire'
  | 'star'
  | 'lightning'
  | 'chart'
  | 'book'
  | 'gift'
  | 'hand'
  | 'home'
  | 'check'
  | 'circle'
  | 'water'
  | 'bread'
  | 'seed'
  | 'money'
  | 'sparkles'
  | 'prayer'
  | 'shepherd'
  | 'worship'
  | 'fellowship'
  | 'tag'
  | (string & {}) // Allow custom icons but prefer known ones

export type MetricColor =
  | 'blue'
  | 'green'
  | 'purple'
  | 'yellow'
  | 'orange'
  | 'pink'
  | 'red'
  | 'indigo'
  | 'teal'
  | (string & {}) // Allow custom colors but prefer known ones

// Auth types (Beter Auth)
export interface User {
  id: string
  email: string
  name: string
  emailVerified: boolean
  image?: string | null
  createdAt: Date
  updatedAt: Date
}

// Validation types
export interface ValidationResult {
  isValid: boolean
  error?: string
}

// Pan/Zoom types
export interface PanZoomState {
  scale: number
  translateX: number
  translateY: number
  isDragging: boolean
}

// Component prop types (for better inference)
export interface ChurchProps {
  church: Church
}

export interface MetricProps {
  metric: Metric
}
