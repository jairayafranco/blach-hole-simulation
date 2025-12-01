/**
 * PerformanceMonitor tracks frame times and provides performance metrics
 * Implements Requirements 1.4, 3.4: Monitor performance and auto-adjust settings
 */
export class PerformanceMonitor {
  constructor(windowSize = 60) {
    this.windowSize = windowSize; // Number of frames to track
    this.frameTimes = [];
    this.lastFrameTime = performance.now();
    this.isMonitoring = false;
    
    // Performance thresholds
    this.targetFrameTime = 33.33; // 30 FPS in milliseconds
    this.degradationThreshold = 50; // Consider performance degraded above 50ms (20 FPS)
    
    // Callbacks
    this.onPerformanceDegradation = null;
    this.onPerformanceRecovery = null;
    
    // State tracking
    this.isDegraded = false;
    this.degradationFrameCount = 0;
    this.degradationFrameThreshold = 30; // Require 30 consecutive slow frames before triggering
  }

  /**
   * Start monitoring performance
   */
  start() {
    this.isMonitoring = true;
    this.lastFrameTime = performance.now();
    this.frameTimes = [];
  }

  /**
   * Stop monitoring performance
   */
  stop() {
    this.isMonitoring = false;
  }

  /**
   * Record a frame time measurement
   * Should be called once per frame
   */
  recordFrame() {
    if (!this.isMonitoring) {
      return;
    }

    const currentTime = performance.now();
    const frameTime = currentTime - this.lastFrameTime;
    this.lastFrameTime = currentTime;

    // Add to rolling window
    this.frameTimes.push(frameTime);
    
    // Keep only the most recent frames
    if (this.frameTimes.length > this.windowSize) {
      this.frameTimes.shift();
    }

    // Check for performance degradation
    this.checkPerformance(frameTime);
  }

  /**
   * Check if performance has degraded
   * @param {number} currentFrameTime - The current frame time in milliseconds
   */
  checkPerformance(currentFrameTime) {
    // Track consecutive slow frames
    if (currentFrameTime > this.degradationThreshold) {
      this.degradationFrameCount++;
    } else {
      this.degradationFrameCount = 0;
    }

    // Trigger degradation callback if threshold exceeded
    if (!this.isDegraded && this.degradationFrameCount >= this.degradationFrameThreshold) {
      this.isDegraded = true;
      console.warn(`Performance degradation detected: ${this.getAverageFrameTime().toFixed(2)}ms average frame time`);
      
      if (this.onPerformanceDegradation) {
        this.onPerformanceDegradation({
          averageFrameTime: this.getAverageFrameTime(),
          currentFPS: this.getCurrentFPS(),
          recommendation: this.getPerformanceRecommendation()
        });
      }
    }

    // Trigger recovery callback if performance improves
    if (this.isDegraded && this.degradationFrameCount === 0 && this.getAverageFrameTime() < this.targetFrameTime) {
      this.isDegraded = false;
      console.log('Performance recovered');
      
      if (this.onPerformanceRecovery) {
        this.onPerformanceRecovery({
          averageFrameTime: this.getAverageFrameTime(),
          currentFPS: this.getCurrentFPS()
        });
      }
    }
  }

  /**
   * Get the average frame time over the rolling window
   * @returns {number} Average frame time in milliseconds
   */
  getAverageFrameTime() {
    if (this.frameTimes.length === 0) {
      return 0;
    }

    const sum = this.frameTimes.reduce((acc, time) => acc + time, 0);
    return sum / this.frameTimes.length;
  }

  /**
   * Get the current FPS based on average frame time
   * @returns {number} Frames per second
   */
  getCurrentFPS() {
    const avgFrameTime = this.getAverageFrameTime();
    return avgFrameTime > 0 ? 1000 / avgFrameTime : 0;
  }

  /**
   * Get the minimum frame time in the window
   * @returns {number} Minimum frame time in milliseconds
   */
  getMinFrameTime() {
    if (this.frameTimes.length === 0) {
      return 0;
    }
    return Math.min(...this.frameTimes);
  }

  /**
   * Get the maximum frame time in the window
   * @returns {number} Maximum frame time in milliseconds
   */
  getMaxFrameTime() {
    if (this.frameTimes.length === 0) {
      return 0;
    }
    return Math.max(...this.frameTimes);
  }

  /**
   * Check if performance is currently degraded
   * @returns {boolean} True if performance is degraded
   */
  isPerformanceDegraded() {
    return this.isDegraded;
  }

  /**
   * Get performance statistics
   * @returns {Object} Performance statistics
   */
  getStats() {
    return {
      averageFrameTime: this.getAverageFrameTime(),
      minFrameTime: this.getMinFrameTime(),
      maxFrameTime: this.getMaxFrameTime(),
      currentFPS: this.getCurrentFPS(),
      isDegraded: this.isDegraded,
      sampleCount: this.frameTimes.length
    };
  }

  /**
   * Get performance recommendation based on current metrics
   * @returns {Object} Recommendation object with action and details
   */
  getPerformanceRecommendation() {
    const avgFrameTime = this.getAverageFrameTime();
    
    if (avgFrameTime > 50) {
      // Severe degradation (< 20 FPS)
      return {
        action: 'reduce_particles_aggressive',
        reduction: 0.5, // Reduce by 50%
        reason: 'Severe performance degradation detected'
      };
    } else if (avgFrameTime > 40) {
      // Moderate degradation (< 25 FPS)
      return {
        action: 'reduce_particles_moderate',
        reduction: 0.25, // Reduce by 25%
        reason: 'Moderate performance degradation detected'
      };
    } else if (avgFrameTime > 33.33) {
      // Mild degradation (< 30 FPS)
      return {
        action: 'reduce_particles_mild',
        reduction: 0.15, // Reduce by 15%
        reason: 'Mild performance degradation detected'
      };
    }
    
    return {
      action: 'none',
      reduction: 0,
      reason: 'Performance is acceptable'
    };
  }

  /**
   * Register callback for performance degradation events
   * @param {Function} callback - Function to call when performance degrades
   */
  onDegradation(callback) {
    this.onPerformanceDegradation = callback;
  }

  /**
   * Register callback for performance recovery events
   * @param {Function} callback - Function to call when performance recovers
   */
  onRecovery(callback) {
    this.onPerformanceRecovery = callback;
  }

  /**
   * Reset all performance tracking data
   */
  reset() {
    this.frameTimes = [];
    this.isDegraded = false;
    this.degradationFrameCount = 0;
    this.lastFrameTime = performance.now();
  }
}
