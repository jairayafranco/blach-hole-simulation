import { useState } from 'react';
import './UIControls.css';

/**
 * UIControlsR3F provides a configuration panel for the R3F black hole simulation
 * Similar to UIControls but adapted for R3F implementation
 */
export function UIControlsR3F({ config, updateConfig, isPaused, togglePause, getBounds }) {
  const [isOpen, setIsOpen] = useState(false);

  // Handle configuration changes
  const handleConfigChange = (key, value) => {
    const numValue = parseFloat(value);
    updateConfig({ [key]: numValue });
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
    if (!preset) return;
    updateConfig(preset.config);
  };

  // Get bounds with defaults
  const getSliderBounds = (key) => {
    const bounds = getBounds ? getBounds(key) : null;
    if (bounds) {
      return { ...bounds, step: 0.1 };
    }
    
    const defaults = {
      particleCount: { min: 100, max: 5000, step: 100 },
      diskRotationSpeed: { min: 0.1, max: 5.0, step: 0.1 },
      lensingIntensity: { min: 0.0, max: 2.0, step: 0.1 },
      cameraSensitivity: { min: 0.1, max: 2.0, step: 0.1 },
      bloomStrength: { min: 0.0, max: 3.0, step: 0.1 }
    };
    return defaults[key] || { min: 0, max: 1, step: 0.1 };
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
              onClick={togglePause}
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
            <label htmlFor="particle-count-r3f">
              Particle Count: {config.particleCount}
            </label>
            <input
              id="particle-count-r3f"
              type="range"
              min={getSliderBounds('particleCount').min}
              max={getSliderBounds('particleCount').max}
              step={getSliderBounds('particleCount').step}
              value={config.particleCount}
              onChange={(e) => handleConfigChange('particleCount', e.target.value)}
            />
          </div>

          {/* Disk Rotation Speed Slider */}
          <div className="control-group">
            <label htmlFor="disk-rotation-r3f">
              Disk Rotation Speed: {config.diskRotationSpeed.toFixed(1)}
            </label>
            <input
              id="disk-rotation-r3f"
              type="range"
              min={getSliderBounds('diskRotationSpeed').min}
              max={getSliderBounds('diskRotationSpeed').max}
              step={getSliderBounds('diskRotationSpeed').step}
              value={config.diskRotationSpeed}
              onChange={(e) => handleConfigChange('diskRotationSpeed', e.target.value)}
            />
          </div>

          {/* Lensing Intensity Slider */}
          <div className="control-group">
            <label htmlFor="lensing-intensity-r3f">
              Lensing Intensity: {config.lensingIntensity.toFixed(1)}
            </label>
            <input
              id="lensing-intensity-r3f"
              type="range"
              min={getSliderBounds('lensingIntensity').min}
              max={getSliderBounds('lensingIntensity').max}
              step={getSliderBounds('lensingIntensity').step}
              value={config.lensingIntensity}
              onChange={(e) => handleConfigChange('lensingIntensity', e.target.value)}
            />
          </div>

          {/* Camera Sensitivity Slider */}
          <div className="control-group">
            <label htmlFor="camera-sensitivity-r3f">
              Camera Sensitivity: {config.cameraSensitivity.toFixed(1)}
            </label>
            <input
              id="camera-sensitivity-r3f"
              type="range"
              min={getSliderBounds('cameraSensitivity').min}
              max={getSliderBounds('cameraSensitivity').max}
              step={getSliderBounds('cameraSensitivity').step}
              value={config.cameraSensitivity}
              onChange={(e) => handleConfigChange('cameraSensitivity', e.target.value)}
            />
          </div>

          {/* Bloom Strength Slider */}
          <div className="control-group">
            <label htmlFor="bloom-strength-r3f">
              Bloom Strength: {config.bloomStrength.toFixed(1)}
            </label>
            <input
              id="bloom-strength-r3f"
              type="range"
              min={getSliderBounds('bloomStrength').min}
              max={getSliderBounds('bloomStrength').max}
              step={getSliderBounds('bloomStrength').step}
              value={config.bloomStrength}
              onChange={(e) => handleConfigChange('bloomStrength', e.target.value)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
