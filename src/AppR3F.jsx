import { BlackHoleScene } from './r3f';
import { UIControlsR3F } from './components/UIControlsR3F.jsx';
import { useSimulationConfig } from './r3f/hooks/useSimulationConfig.js';
import './App.css';

/**
 * AppR3F demonstrates the React Three Fiber implementation
 * of the black hole simulation with UI controls.
 * 
 * Implements Requirement 7.1: React Three Fiber component architecture
 */
function AppR3F() {
  const { config, updateConfig, isPaused, togglePause, getBounds } = useSimulationConfig({
    particleCount: 1000,
    diskRotationSpeed: 1.0,
    lensingIntensity: 1.0,
    cameraSensitivity: 1.0,
    bloomStrength: 1.5
  });

  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh', 
      margin: 0, 
      padding: 0, 
      overflow: 'hidden' 
    }}>
      <BlackHoleScene config={config} isPaused={isPaused} />
      <UIControlsR3F
        config={config}
        updateConfig={updateConfig}
        isPaused={isPaused}
        togglePause={togglePause}
        getBounds={getBounds}
      />
    </div>
  );
}

export default AppR3F;
