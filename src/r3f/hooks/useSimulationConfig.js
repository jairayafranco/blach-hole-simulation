import { useState, useCallback } from 'react';

/**
 * Hook for managing simulation configuration in R3F implementation
 * Provides configuration state and update methods
 */
export function useSimulationConfig(initialConfig = {}) {
  const [config, setConfig] = useState({
    particleCount: 1000,
    diskRotationSpeed: 1.0,
    lensingIntensity: 1.0,
    cameraSensitivity: 1.0,
    bloomStrength: 1.5,
    ...initialConfig
  });

  const [isPaused, setIsPaused] = useState(false);

  // Bounds for configuration values
  const bounds = {
    particleCount: { min: 100, max: 5000 },
    diskRotationSpeed: { min: 0.1, max: 5.0 },
    lensingIntensity: { min: 0.0, max: 2.0 },
    cameraSensitivity: { min: 0.1, max: 2.0 },
    bloomStrength: { min: 0.0, max: 3.0 }
  };

  // Clamp value to bounds
  const clampValue = useCallback((value, key) => {
    const bound = bounds[key];
    if (!bound) return value;
    return Math.max(bound.min, Math.min(bound.max, value));
  }, []);

  // Update configuration
  const updateConfig = useCallback((updates) => {
    setConfig(prev => {
      const newConfig = { ...prev };
      Object.keys(updates).forEach(key => {
        newConfig[key] = clampValue(updates[key], key);
      });
      return newConfig;
    });
  }, [clampValue]);

  // Toggle pause state
  const togglePause = useCallback(() => {
    setIsPaused(prev => !prev);
  }, []);

  // Get bounds for a parameter
  const getBounds = useCallback((key) => {
    return bounds[key] || null;
  }, []);

  return {
    config,
    updateConfig,
    isPaused,
    togglePause,
    getBounds
  };
}
