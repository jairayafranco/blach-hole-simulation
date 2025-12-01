import { BlackHoleScene } from './r3f';
import './App.css';

/**
 * AppR3F demonstrates the React Three Fiber implementation
 * of the black hole simulation.
 * 
 * Implements Requirement 7.1: React Three Fiber component architecture
 */
function AppR3F() {
  const config = {
    particleCount: 1000,
    diskRotationSpeed: 1.0,
    lensingIntensity: 1.0,
    cameraSensitivity: 1.0,
    bloomStrength: 1.5
  };

  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh', 
      margin: 0, 
      padding: 0, 
      overflow: 'hidden' 
    }}>
      <BlackHoleScene config={config} />
    </div>
  );
}

export default AppR3F;
