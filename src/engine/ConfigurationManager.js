/**
 * ConfigurationManager handles simulation parameters and runtime configuration.
 * Manages configuration validation, clamping, and performance optimizations.
 * 
 * Requirements addressed:
 * - 9.1: Particle count configuration (100-5000 range)
 * - 9.2: Accretion disk rotation speed configuration
 * - 9.3: Gravitational lensing intensity configuration
 * - 9.4: Camera movement sensitivity configuration
 * - 9.5: Configuration updates without reload
 * - 8.4: Performance-based particle scaling for small viewports
 */
export class ConfigurationManager {
  constructor() {
    this.config = null;
    this.listeners = new Set();
    
    // Define valid ranges for configuration parameters
    this.bounds = {
      particleCount: { min: 100, max: 5000 },
      diskRotationSpeed: { min: 0.1, max: 5.0 },
      lensingIntensity: { min: 0.0, max: 2.0 },
      cameraSensitivity: { min: 0.1, max: 2.0 },
      bloomStrength: { min: 0.0, max: 3.0 }
    };

    // Performance thresholds for viewport-based optimization
    this.performanceThresholds = {
      small: 768,   // Below this width, use low performance mode
      medium: 1366  // Below this width, use medium performance mode
    };
  }

  /**
   * Initialize the configuration manager with default or provided config
   * @param {Partial<SimulationConfig>} initialConfig - Initial configuration values
   */
  initialize(initialConfig = {}) {
    // Set default configuration
    const defaultConfig = {
      particleCount: 1000,
      diskRotationSpeed: 1.0,
      lensingIntensity: 1.0,
      cameraSensitivity: 1.0,
      bloomStrength: 1.5,
      performanceMode: 'high'
    };

    // Merge with provided config and validate
    this.config = this._validateAndClamp({
      ...defaultConfig,
      ...initialConfig
    });
  }

  /**
   * Update configuration with new values
   * Validates, clamps, and applies changes without requiring scene reload
   * @param {Partial<SimulationConfig>} updates - Configuration updates to apply
   * @returns {SimulationConfig} The updated configuration
   */
  updateConfig(updates) {
    if (!this.config) {
      throw new Error('ConfigurationManager not initialized. Call initialize() first.');
    }

    // Merge updates with current config
    const newConfig = {
      ...this.config,
      ...updates
    };

    // Validate and clamp the new configuration
    this.config = this._validateAndClamp(newConfig);

    // Notify all listeners of the configuration change
    this._notifyListeners(updates);

    return this.config;
  }

  /**
   * Get the current configuration
   * @returns {SimulationConfig} The current configuration
   */
  getConfig() {
    if (!this.config) {
      throw new Error('ConfigurationManager not initialized. Call initialize() first.');
    }
    return { ...this.config };
  }

  /**
   * Apply performance optimizations based on viewport width
   * Automatically adjusts particle count and performance mode
   * @param {number} viewportWidth - Current viewport width in pixels
   * @returns {SimulationConfig} The updated configuration
   */
  applyPerformanceOptimizations(viewportWidth) {
    if (!this.config) {
      throw new Error('ConfigurationManager not initialized. Call initialize() first.');
    }

    let performanceMode;
    let particleCountMultiplier;

    // Determine performance mode and particle count multiplier based on viewport
    if (viewportWidth < this.performanceThresholds.small) {
      performanceMode = 'low';
      particleCountMultiplier = 0.3; // 30% of configured particle count
    } else if (viewportWidth < this.performanceThresholds.medium) {
      performanceMode = 'medium';
      particleCountMultiplier = 0.6; // 60% of configured particle count
    } else {
      performanceMode = 'high';
      particleCountMultiplier = 1.0; // 100% of configured particle count
    }

    // Store the base particle count if not already stored
    if (!this._baseParticleCount) {
      this._baseParticleCount = this.config.particleCount;
    }

    // Calculate optimized particle count
    const optimizedParticleCount = Math.floor(
      this._baseParticleCount * particleCountMultiplier
    );

    // Update configuration with performance optimizations
    return this.updateConfig({
      performanceMode,
      particleCount: this._clampValue(
        optimizedParticleCount,
        this.bounds.particleCount.min,
        this.bounds.particleCount.max
      )
    });
  }

  /**
   * Register a listener for configuration changes
   * @param {Function} listener - Callback function that receives updated config keys
   */
  addListener(listener) {
    if (typeof listener !== 'function') {
      throw new Error('Listener must be a function');
    }
    this.listeners.add(listener);
  }

  /**
   * Remove a configuration change listener
   * @param {Function} listener - The listener to remove
   */
  removeListener(listener) {
    this.listeners.delete(listener);
  }

  /**
   * Validate and clamp configuration values to valid ranges
   * @private
   * @param {Object} config - Configuration object to validate
   * @returns {SimulationConfig} Validated and clamped configuration
   */
  _validateAndClamp(config) {
    const validated = { ...config };

    // Clamp numeric values to their valid ranges
    if (validated.particleCount !== undefined) {
      validated.particleCount = this._clampValue(
        validated.particleCount,
        this.bounds.particleCount.min,
        this.bounds.particleCount.max
      );
    }

    if (validated.diskRotationSpeed !== undefined) {
      validated.diskRotationSpeed = this._clampValue(
        validated.diskRotationSpeed,
        this.bounds.diskRotationSpeed.min,
        this.bounds.diskRotationSpeed.max
      );
    }

    if (validated.lensingIntensity !== undefined) {
      validated.lensingIntensity = this._clampValue(
        validated.lensingIntensity,
        this.bounds.lensingIntensity.min,
        this.bounds.lensingIntensity.max
      );
    }

    if (validated.cameraSensitivity !== undefined) {
      validated.cameraSensitivity = this._clampValue(
        validated.cameraSensitivity,
        this.bounds.cameraSensitivity.min,
        this.bounds.cameraSensitivity.max
      );
    }

    if (validated.bloomStrength !== undefined) {
      validated.bloomStrength = this._clampValue(
        validated.bloomStrength,
        this.bounds.bloomStrength.min,
        this.bounds.bloomStrength.max
      );
    }

    // Validate performance mode
    if (validated.performanceMode !== undefined) {
      const validModes = ['high', 'medium', 'low'];
      if (!validModes.includes(validated.performanceMode)) {
        console.warn(
          `Invalid performance mode: ${validated.performanceMode}. Using 'high'.`
        );
        validated.performanceMode = 'high';
      }
    }

    return validated;
  }

  /**
   * Clamp a numeric value to a specified range
   * @private
   * @param {number} value - Value to clamp
   * @param {number} min - Minimum allowed value
   * @param {number} max - Maximum allowed value
   * @returns {number} Clamped value
   */
  _clampValue(value, min, max) {
    // Ensure value is a number
    const numValue = Number(value);
    if (isNaN(numValue)) {
      console.warn(`Invalid numeric value: ${value}. Using minimum: ${min}`);
      return min;
    }
    return Math.max(min, Math.min(max, numValue));
  }

  /**
   * Notify all registered listeners of configuration changes
   * @private
   * @param {Object} updates - The configuration keys that were updated
   */
  _notifyListeners(updates) {
    for (const listener of this.listeners) {
      try {
        listener(updates, this.config);
      } catch (error) {
        console.error('Error in configuration listener:', error);
      }
    }
  }

  /**
   * Reset configuration to default values
   */
  reset() {
    this._baseParticleCount = null;
    this.initialize();
  }

  /**
   * Get the valid bounds for a configuration parameter
   * @param {string} parameter - The parameter name
   * @returns {Object|null} Object with min and max properties, or null if parameter not found
   */
  getBounds(parameter) {
    return this.bounds[parameter] ? { ...this.bounds[parameter] } : null;
  }
}

/**
 * @typedef {Object} SimulationConfig
 * @property {number} particleCount - Number of particles (100-5000)
 * @property {number} diskRotationSpeed - Accretion disk rotation speed (0.1-5.0)
 * @property {number} lensingIntensity - Gravitational lensing intensity (0.0-2.0)
 * @property {number} cameraSensitivity - Camera movement sensitivity (0.1-2.0)
 * @property {number} bloomStrength - Bloom post-processing strength (0.0-3.0)
 * @property {'high'|'medium'|'low'} performanceMode - Current performance mode
 */
