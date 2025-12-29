/**
 * Metric color mappings for Tailwind CSS
 * Returns pre-defined Tailwind classes based on metric color
 */

export type MetricColor = 'blue' | 'green' | 'purple' | 'yellow' | 'orange' | 'pink'

export const metricColorClasses: Record<MetricColor, {
  bg: string
  bgLight: string
  bgDark: string
  text: string
  textDark: string
  text900: string
  border: string
  gradientFrom: string
  gradientTo: string
  gradientFrom400: string
  gradientTo600: string
}> = {
  blue: {
    bg: 'bg-blue-500',
    bgLight: 'bg-blue-50',
    bgDark: 'bg-blue-600',
    text: 'text-blue-600',
    textDark: 'text-blue-700',
    text900: 'text-blue-900',
    border: 'border-blue-200',
    gradientFrom: 'from-blue-50',
    gradientTo: 'to-blue-100',
    gradientFrom400: 'from-blue-400',
    gradientTo600: 'to-blue-600',
  },
  green: {
    bg: 'bg-green-500',
    bgLight: 'bg-green-50',
    bgDark: 'bg-green-600',
    text: 'text-green-600',
    textDark: 'text-green-700',
    text900: 'text-green-900',
    border: 'border-green-200',
    gradientFrom: 'from-green-50',
    gradientTo: 'to-green-100',
    gradientFrom400: 'from-green-400',
    gradientTo600: 'to-green-600',
  },
  purple: {
    bg: 'bg-purple-500',
    bgLight: 'bg-purple-50',
    bgDark: 'bg-purple-600',
    text: 'text-purple-600',
    textDark: 'text-purple-700',
    text900: 'text-purple-900',
    border: 'border-purple-200',
    gradientFrom: 'from-purple-50',
    gradientTo: 'to-purple-100',
    gradientFrom400: 'from-purple-400',
    gradientTo600: 'to-purple-600',
  },
  yellow: {
    bg: 'bg-yellow-500',
    bgLight: 'bg-yellow-50',
    bgDark: 'bg-yellow-600',
    text: 'text-yellow-600',
    textDark: 'text-yellow-700',
    text900: 'text-yellow-900',
    border: 'border-yellow-200',
    gradientFrom: 'from-yellow-50',
    gradientTo: 'to-yellow-100',
    gradientFrom400: 'from-yellow-400',
    gradientTo600: 'to-yellow-600',
  },
  orange: {
    bg: 'bg-orange-500',
    bgLight: 'bg-orange-50',
    bgDark: 'bg-orange-600',
    text: 'text-orange-600',
    textDark: 'text-orange-700',
    text900: 'text-orange-900',
    border: 'border-orange-200',
    gradientFrom: 'from-orange-50',
    gradientTo: 'to-orange-100',
    gradientFrom400: 'from-orange-400',
    gradientTo600: 'to-orange-600',
  },
  pink: {
    bg: 'bg-pink-500',
    bgLight: 'bg-pink-50',
    bgDark: 'bg-pink-600',
    text: 'text-pink-600',
    textDark: 'text-pink-700',
    text900: 'text-pink-900',
    border: 'border-pink-200',
    gradientFrom: 'from-pink-50',
    gradientTo: 'to-pink-100',
    gradientFrom400: 'from-pink-400',
    gradientTo600: 'to-pink-600',
  },
}

/**
 * Get color classes for a metric
 */
export function getMetricClasses(color: MetricColor) {
  return metricColorClasses[color]
}
