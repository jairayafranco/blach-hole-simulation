/**
 * PerformanceProfiler provides detailed performance metrics and profiling capabilities
 * for the Black Hole Simulation. This utility helps identify performance bottlenecks
 * and optimize rendering performance.
 * 
 * Implements Requirements 1.4, 3.4: Performance monitoring and optimization
 */
export class PerformanceProfiler {
  constructor() {
    this.metrics = {
      fps: 0,
      frameTime: 0,
      drawCalls: 0,
      triangles: 0,
      points: 0,
      geometries: 0,
      textures: 0,
      programs: 0,
      memory: {
        geometries: 0,
        textures: 0
      }
    };
    
    this.samples = [];
    this.maxSamples = 60;
    this.lastTime = performance.now();
    this.enabled = false;
  }

  /**
   * Start profiling
   */
  start() {
    this.enabled = true;
    this.lastTime = performance.now();
    this.samples = [];
  }

  /**
   * Stop profiling
   */
  stop() {
    this.enabled = false;
  }

  /**
   * Record a frame and update metrics
   * @param {THREE.WebGLRenderer} renderer - The Three.js renderer
   */
  recordFrame(renderer) {
    if (!this.enabled || !renderer) {
      return;
    }

    const currentTime = performance.now();
    const frameTime = currentTime - this.lastTime;
    this.lastTime = currentTime;

    // Calculate FPS
    const fps = 1000 / frameTime;

    // Get renderer info
    const info = renderer.info;
    
    // Update metrics
    this.metrics.fps = fps;
    this.metrics.frameTime = frameTime;
    this.metrics.drawCalls = info.render.calls;
    this.metrics.triangles = info.render.triangles;
    this.metrics.points = info.render.points;
    this.metrics.geometries = info.memory.geometries;
    this.metrics.textures = info.memory.textures;
    this.metrics.programs = info.programs?.length || 0;

    // Store sample for averaging
    this.samples.push({
      fps: fps,
      frameTime: frameTime,
      drawCalls: info.render.calls,
      timestamp: currentTime
    });

    // Keep only recent samples
    if (this.samples.length > this.maxSamples) {
      this.samples.shift();
    }
  }

  /**
   * Get current metrics
   * @returns {Object} Current performance metrics
   */
  getMetrics() {
    return { ...this.metrics };
  }

  /**
   * Get averaged metrics over recent samples
   * @returns {Object} Averaged performance metrics
   */
  getAveragedMetrics() {
    if (this.samples.length === 0) {
      return this.getMetrics();
    }

    const sum = this.samples.reduce((acc, sample) => {
      acc.fps += sample.fps;
      acc.frameTime += sample.frameTime;
      acc.drawCalls += sample.drawCalls;
      return acc;
    }, { fps: 0, frameTime: 0, drawCalls: 0 });

    const count = this.samples.length;

    return {
      fps: sum.fps / count,
      frameTime: sum.frameTime / count,
      drawCalls: sum.drawCalls / count,
      triangles: this.metrics.triangles,
      points: this.metrics.points,
      geometries: this.metrics.geometries,
      textures: this.metrics.textures,
      programs: this.metrics.programs,
      sampleCount: count
    };
  }

  /**
   * Get performance report as formatted string
   * @returns {string} Formatted performance report
   */
  getReport() {
    const avg = this.getAveragedMetrics();
    
    return `
Performance Report:
------------------
FPS: ${avg.fps.toFixed(2)} (avg over ${avg.sampleCount} frames)
Frame Time: ${avg.frameTime.toFixed(2)}ms
Draw Calls: ${avg.drawCalls.toFixed(0)}
Triangles: ${this.metrics.triangles}
Points: ${this.metrics.points}
Geometries: ${this.metrics.geometries}
Textures: ${this.metrics.textures}
Shader Programs: ${this.metrics.programs}
    `.trim();
  }

  /**
   * Log performance report to console
   */
  logReport() {
    console.log(this.getReport());
  }

  /**
   * Check if performance is below target
   * @param {number} targetFPS - Target FPS (default 30)
   * @returns {boolean} True if performance is below target
   */
  isBelowTarget(targetFPS = 30) {
    const avg = this.getAveragedMetrics();
    return avg.fps < targetFPS;
  }

  /**
   * Get performance recommendations based on current metrics
   * @returns {Array<string>} Array of recommendation strings
   */
  getRecommendations() {
    const recommendations = [];
    const avg = this.getAveragedMetrics();

    if (avg.fps < 30) {
      recommendations.push('FPS is below 30. Consider reducing particle count or visual quality.');
    }

    if (avg.drawCalls > 100) {
      recommendations.push(`High draw call count (${avg.drawCalls.toFixed(0)}). Consider using geometry instancing or merging geometries.`);
    }

    if (this.metrics.points > 5000) {
      recommendations.push(`High particle count (${this.metrics.points}). Consider reducing particle count for better performance.`);
    }

    if (this.metrics.programs > 10) {
      recommendations.push(`Many shader programs (${this.metrics.programs}). Consider sharing materials where possible.`);
    }

    if (recommendations.length === 0) {
      recommendations.push('Performance is good. No optimizations needed.');
    }

    return recommendations;
  }

  /**
   * Reset all metrics and samples
   */
  reset() {
    this.samples = [];
    this.metrics = {
      fps: 0,
      frameTime: 0,
      drawCalls: 0,
      triangles: 0,
      points: 0,
      geometries: 0,
      textures: 0,
      programs: 0,
      memory: {
        geometries: 0,
        textures: 0
      }
    };
  }
}
