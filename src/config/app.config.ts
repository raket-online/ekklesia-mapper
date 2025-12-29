/**
 * Application Configuration
 *
 * Centralized configuration for all app settings.
 * Modify these values to adjust application behavior.
 */

export const appConfig = {
  /**
   * LocalStorage Keys
   * Keys used for storing data in browser's localStorage
   */
  storage: {
    CHURCHES: 'ekklesia-churches',
    METRICS: 'ekklesia-metrics'
  },

  /**
   * Validation Rules
   * Limits and constraints for user input
   */
  validation: {
    MAX_CHURCH_NAME_LENGTH: 255,
    MAX_METRIC_NAME_LENGTH: 100,
    MIN_PRIMARY_METRIC_VALUE: 0
  },

  /**
   * Zoom Configuration
   * Settings for pan and zoom functionality
   */
  zoom: {
    MIN_SCALE: 0.2,
    MAX_SCALE: 3,
    DEFAULT_SCALE: 1,
    ZOOM_OUT_FACTOR: 0.9,
    ZOOM_IN_FACTOR: 1.1,
    DEFAULT_TRANSLATE_X: 0,
    DEFAULT_TRANSLATE_Y: 0
  },

  /**
   * Default Values
   * Default values for new entities
   */
  defaults: {
    DEFAULT_CHURCH_NAME: 'New Church',
    DEFAULT_PRIMARY_METRIC_VALUE: 10,
    DEFAULT_METRIC_VALUE: 0,
    ROOT_CHURCH_ID: 'root',
    ROOT_CHURCH_NAME: 'First group'
  },

  /**
   * UI Configuration
   * User interface settings
   */
  ui: {
    TOAST_DURATION: 3000,
    TOAST_SUCCESS: 'success',
    TOAST_ERROR: 'error',
    TOAST_INFO: 'info'
  }
} as const

/**
 * Type definitions for config values
 */
export type AppConfig = typeof appConfig
export type StorageKey = keyof typeof appConfig.storage
export type ToastType = typeof appConfig.ui.TOAST_SUCCESS | typeof appConfig.ui.TOAST_ERROR | typeof appConfig.ui.TOAST_INFO
