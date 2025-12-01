import { Canvas } from '@react-three/fiber';
import { BlackHoleSimulationR3F } from './BlackHoleSimulationR3F';

/**
 * BlackHoleScene is the main R3F component that wraps the Canvas
 * and provides the entry point for the React Three Fiber implementation.
 * 
 * Implements Requirement 7.1: React Three Fiber component architecture
 */
export function BlackHoleScene({ config = {} }) {
  return (
    <Canvas
      camera={{
        position: [0, 5, 15],
        fov: 75,
        near: 0.1,
        far: 1000
      }}
      gl={{
        antialias: true,
        alpha: false,
        powerPreference: 'high-performance'
      }}
      style={{
        width: '100%',
        height: '100%',
        display: 'block',
        background: '#000000'
      }}
    >
      <BlackHoleSimulationR3F config={config} />
    </Canvas>
  );
}
