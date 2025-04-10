/**
 * Simple performance monitoring utility
 */

/**
 * Measures the performance of a function
 * @param {string} label - Label for the measurement
 * @param {Function} fn - Async function to measure
 * @returns {Promise<{duration: number, result: any}>} - Duration in ms and function result
 */
export const measurePerformance = async (label, fn) => {
  const start = performance.now();
  try {
    const result = await fn();
    const end = performance.now();
    const duration = end - start;
    console.log(`Performance [${label}]: ${duration.toFixed(2)}ms`);
    return { duration, result };
  } catch (error) {
    const end = performance.now();
    const duration = end - start;
    console.error(`Performance [${label}] Error: ${duration.toFixed(2)}ms`, error);
    throw error;
  }
};

/**
 * Tracks an error
 * @param {Error} error - The error to track
 * @param {Object} context - Additional context
 */
export const trackError = (error, context = {}) => {
  console.error('Error tracked:', error, context);
  // In a real app, this would send to a monitoring service like Sentry
};

/**
 * Logs a user action
 * @param {string} action - The action performed
 * @param {Object} data - Additional data
 */
export const logUserAction = (action, data = {}) => {
  console.log(`User Action: ${action}`, data);
  // In a real app, this would send to an analytics service
};
