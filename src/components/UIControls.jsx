import { useState, useEffect } from 'react';
import './UIControls.css';

/**
 * UIControls provides a configuration panel for the black hole simulation
 * 
 * Implements Requirements:
 * - 9.1: Particle count configuration slider
 * - 9.2: Disk rotation speed configuration slider
 * - 9.3: Gravitational lensing intensity configuration slider
 * - 9.4: Camera sensitivity configuration slider
 */
export function UIControls({ simulation, onPresetChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [config, setConfig] = useState({
    particleCount: 1000,
    diskRotationSpeed: 1.0,
    lensingIntensity: 1.0,
    cameraSensitivity: 1.0,
    bloomStrength: 1.5
  });

  // Load initial config from simulation
  useEffect(() => {
    if (simulation) {
      try {
        const currentConfig = simulation.getConfig();
        setConfig(currentConfig);
      } catch (error) {
        console.error('Failed to load initial config:', error);
      }
    }
  }, [simulation]);

  // Handle configuration changes
  const handleConfigChange = (key, value) => {
    const numValue = parseFloat(value);
    const newConfig = { ...config, [key]: numValue };
    setConfig(newConfig);

    if (simulation) {
      try {
        simulation.updateConfig({ [key]: numValue });
      } catch (error) {
        console.error('Failed to update config:', error);
      }
    }
  };

  // Handle pause/play toggle
  const handlePauseToggle = () => {
    if (!simulation) return;

    if (isPaused) {
      simulation.start();
      setIsPaused(false);
    } else {
      simulation.stop();
      setIsPaused(true);
    }
  };

  // Preset configurations
  const presets = {
    default: {
      name: 'Default',
      config: {
        particleCount: 1000,
        diskRotationSpeed: 1.0,
        lensingIntensity: 1.0,
        cameraSensitivity: 1.0,
        bloomStrength: 1.5
      }
    },
    cinematic: {
      name: 'Cinematic',
      config: {
        particleCount: 2000,
        diskRotationSpeed: 0.5,
        lensingIntensity: 1.5,
        cameraSensitivity: 0.5,
        bloomStrength: 2.5
      }
    },
    performance: {
      name: 'Performance',
      config: {
        particleCount: 500,
        diskRotationSpeed: 1.5,
        lensingIntensity: 0.8,
        cameraSensitivity: 1.2,
        bloomStrength: 1.0
      }
    },
    intense: {
      name: 'Intense',
      config: {
        particleCount: 3000,
        diskRotationSpeed: 2.0,
        lensingIntensity: 1.8,
        cameraSensitivity: 0.8,
        bloomStrength: 2.0
      }
    }
  };

  // Apply preset
  const applyPreset = (presetKey) => {
    const preset = presets[presetKey];
    if (!preset || !simulation) return;

    setConfig(preset.config);
    simulation.updateConfig(preset.config);
    
    if (onPresetChange) {
      onPresetChange(presetKey);
    }
  };

  // Get bounds for sliders
  const getBounds = (key) => {
    const bounds = {
      particleCount: { min: 100, max: 5000, step: 100 },
      diskRotationSpeed: { min: 0.1, max: 5.0, step: 0.1 },
      lensingIntensity: { min: 0.0, max: 2.0, step: 0.1 },
      cameraSensitivity: { min: 0.1, max: 2.0, step: 0.1 },
      bloomStrength: { min: 0.0, max: 3.0, step: 0.1 }
    };
    return bounds[key] || { min: 0, max: 1, step: 0.1 };
  };

  return (
    <div className="ui-controls">
      {/* Toggle button */}
      <button 
        className="ui-controls-toggle"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Close controls' : 'Open controls'}
        aria-expanded={isOpen}
      >
        {isOpen ? '✕' : '⚙'}
      </button>

      {/* Control panel */}
      {isOpen && (
        <div className="ui-controls-panel" role="region" aria-label="Simulation controls">
          <h2>Black Hole Controls</h2>

          {/* Pause/Play button */}
          <div className="control-group">
            <button 
              className="pause-play-button"
              onClick={handlePauseToggle}
              aria-label={isPaused ? 'Play simulation' : 'Pause simulation'}
            >
              {isPaused ? '▶ Play' : '⏸ Pause'}
            </button>
          </div>

          {/* Presets */}
          <div className="control-group">
            <label>Presets</label>
            <div className="preset-buttons">
              {Object.entries(presets).map(([key, preset]) => (
                <button
                  key={key}
                  className="preset-button"
                  onClick={() => applyPreset(key)}
                  aria-label={`Apply ${preset.name} preset`}
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          {/* Particle Count Slider */}
          <div className="control-group">
            <label htmlFor="particle-count">
              Particle Count: {config.particleCount}
            </label>
            <input
              id="particle-count"
              type="range"
              min={getBounds('particleCount').min}
              max={getBounds('particleCount').max}
              step={getBounds('particleCount').step}
              value={config.particleCount}
              onChange={(e) => handleConfigChange('particleCount', e.target.value)}
              aria-valuemin={getBounds('particleCount').min}
              aria-valuemax={getBounds('particleCount').max}
              aria-valuenow={config.particleCount}
            />
          </div>

          {/* Disk Rotation Speed Slider */}
          <div className="control-group">
            <label htmlFor="disk-rotation">
              Disk Rotation Speed: {config.diskRotationSpeed.toFixed(1)}
            </label>
            <input
              id="disk-rotation"
              type="range"
              min={getBounds('diskRotationSpeed').min}
              max={getBounds('diskRotationSpeed').max}
              step={getBounds('diskRotationSpeed').step}
              value={config.diskRotationSpeed}
              onChange={(e) => handleConfigChange('diskRotationSpeed', e.target.value)}
              aria-valuemin={getBounds('diskRotationSpeed').min}
              aria-valuemax={getBounds('diskRotationSpeed').max}
              aria-valuenow={config.diskRotationSpeed}
            />
          </div>

          {/* Lensing Intensity Slider */}
          <div className="control-group">
            <label htmlFor="lensing-intensity">
              Lensing Intensity: {config.lensingIntensity.toFixed(1)}
            </label>
            <input
              id="lensing-intensity"
              type="range"
              min={getBounds('lensingIntensity').min}
              max={getBounds('lensingIntensity').max}
              step={getBounds('lensingIntensity').step}
              value={config.lensingIntensity}
              onChange={(e) => handleConfigChange('lensingIntensity', e.target.value)}
              aria-valuemin={getBounds('lensingIntensity').min}
              aria-valuemax={getBounds('lensingIntensity').max}
              aria-valuenow={config.lensingIntensity}
            />
          </div>

          {/* Camera Sensitivity Slider */}
          <div className="control-group">
            <label htmlFor="camera-sensitivity">
              Camera Sensitivity: {config.cameraSensitivity.toFixed(1)}
            </label>
            <input
              id="camera-sensitivity"
              type="range"
              min={getBounds('cameraSensitivity').min}
              max={getBounds('cameraSensitivity').max}
              step={getBounds('cameraSensitivity').step}
              value={config.cameraSensitivity}
              onChange={(e) => handleConfigChange('cameraSensitivity', e.target.value)}
              aria-valuemin={getBounds('cameraSensitivity').min}
              aria-valuemax={getBounds('cameraSensitivity').max}
              aria-valuenow={config.cameraSensitivity}
            />
          </div>

          {/* Bloom Strength Slider */}
          <div className="control-group">
            <label htmlFor="bloom-strength">
              Bloom Strength: {config.bloomStrength.toFixed(1)}
            </label>
            <input
              id="bloom-strength"
              type="range"
              min={getBounds('bloomStrength').min}
              max={getBounds('bloomStrength').max}
              step={getBounds('bloomStrength').step}
              value={config.bloomStrength}
              onChange={(e) => handleConfigChange('bloomStrength', e.target.value)}
              aria-valuemin={getBounds('bloomStrength').min}
              aria-valuemax={getBounds('bloomStrength').max}
              aria-valuenow={config.bloomStrength}
            />
          </div>
        </div>
      )}
    </div>
  );
}
