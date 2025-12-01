import { useEffect, useRef, useState } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, EffectComposer, Bloom } from '@react-three/drei';
import * as THREE from 'three';
import { BlackHoleCoreR3F } from './components/BlackHoleCoreR3F';
import { AccretionDiskR3F } from './components/AccretionDiskR3F';
import { ParticleSystemR3F } from './components/ParticleSystemR3F';
import { StarfieldR3F } from './components/StarfieldR3F';
import { GravitationalLensingR3F } from './components/GravitationalLensingR3F';

/**
 * BlackHoleSimulationR3F is the main simulation component using React Three Fiber.
 * Integrates all visual components and manages the simulation state.
 * 
 * Implements Requirements:
 * - 7.1: React component architecture
 * - 1.1, 1.2, 1.5: Core rendering
 * - 9.1-9.5: Configuration system
 */
export function BlackHoleSimulationR3F({ config: initialConfig = {} }) {
  const { camera, gl } = useThree();
  
  // Configuration state with defaults
  const [config, setConfig] = useState({
    particleCount: 1000,
    diskRotationSpeed: 1.0,
    lensingIntensity: 1.0,
    cameraSensitivity: 1.0,
    bloomStrength: 1.5,
    ...initialConfig
  });

  // Black hole parameters
  const blackHolePosition = useRef(new THREE.Vector3(0, 0, 0));
  const eventHorizonRadius = 1.0;

  // Handle window resize for performance optimization
  useEffect(() => {
    const handleResize = () => {
      const width = gl.domElement.clientWidth;
      
      // Apply performance optimizations for small viewports
      let particleCountMultiplier = 1.0;
      if (width < 768) {
        particleCountMultiplier = 0.3;
      } else if (width < 1366) {
        particleCountMultiplier = 0.6;
      }
      
      const optimizedCount = Math.floor(
        (initialConfig.particleCount || 1000) * particleCountMultiplier
      );
      
      setConfig(prev => ({
        ...prev,
        particleCount: Math.max(100, Math.min(5000, optimizedCount))
      }));
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial call

    return () => window.removeEventListener('resize', handleResize);
  }, [gl, initialConfig.particleCount]);

  return (
    <>
      {/* Camera Controls */}
      <OrbitControls
        enableDamping
        dampingFactor={0.05}
        minDistance={5}
        maxDistance={100}
        target={[0, 0, 0]}
        rotateSpeed={config.cameraSensitivity}
        zoomSpeed={config.cameraSensitivity}
      />

      {/* Lighting */}
      <ambientLight intensity={0.2} color={0x404040} />
      <pointLight
        position={[0, 0, 0]}
        intensity={2.0}
        color={0xff6600}
      />

      {/* Black Hole Core */}
      <BlackHoleCoreR3F radius={eventHorizonRadius} />

      {/* Accretion Disk */}
      <AccretionDiskR3F
        innerRadius={1.5}
        outerRadius={4.0}
        rotationSpeed={config.diskRotationSpeed}
      />

      {/* Particle System */}
      <ParticleSystemR3F
        count={config.particleCount}
        spawnRadius={8.0}
        eventHorizonRadius={eventHorizonRadius}
        blackHolePosition={blackHolePosition.current}
      />

      {/* Starfield Background */}
      <StarfieldR3F starCount={2000} radius={100} />

      {/* Gravitational Lensing Effect */}
      <GravitationalLensingR3F
        eventHorizonRadius={eventHorizonRadius}
        blackHolePosition={blackHolePosition.current}
        intensity={config.lensingIntensity}
      />

      {/* Post-processing Effects */}
      <EffectComposer>
        <Bloom
          intensity={config.bloomStrength}
          luminanceThreshold={0.4}
          luminanceSmoothing={0.85}
        />
      </EffectComposer>
    </>
  );
}
