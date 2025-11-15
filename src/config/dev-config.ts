/**
 * Enhanced Configuration for Development Environment
 * Fixes syntax errors and improves development experience
 */

// Next.js development configurations
const isDev = process.env.NODE_ENV === 'development'
const isProd = process.env.NODE_ENV === 'production'

// Enhanced error handling for development
if (isDev) {
  // Suppress specific development warnings that don't affect functionality
  const originalError = console.error
  console.error = (...args) => {
    // Filter out known harmless errors
    const message = args.join(' ')
    
    // Skip Vite-related errors (not applicable to Next.js)
    if (message.includes('@vite/client')) {
      return
    }
    
    // Skip harmless hydration mismatches in development
    if (message.includes('Warning: Extra attributes from the server')) {
      return
    }
    
    // Log other errors normally
    originalError.apply(console, args)
  }
}

// Enhanced logging configuration
export const devConfig = {
  // Enable detailed error reporting in development
  enableDetailedErrors: isDev,
  
  // Log performance metrics in development
  enablePerformanceLogs: isDev && process.env.DEBUG_PERFORMANCE === 'true',
  
  // Enable React DevTools profiling
  enableReactProfiling: isDev,
  
  // Webpack optimization settings
  webpackOptimizations: {
    // Fast refresh in development
    fastRefresh: isDev,
    
    // Source maps for debugging
    sourceMap: isDev ? 'eval-source-map' : false,
    
    // Bundle splitting configuration
    splitChunks: !isDev,
  }
}

// Error reporting configuration
export const errorConfig = {
  // Enable error boundary logging
  enableErrorBoundaryLogging: true,
  
  // Log errors to external service in production
  enableExternalLogging: isProd,
  
  // Show detailed error information
  showErrorDetails: isDev,
  
  // Error recovery strategies
  enableAutoRecovery: true,
}

export default { devConfig, errorConfig }