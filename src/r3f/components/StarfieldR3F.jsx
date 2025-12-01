import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * StarfieldR3F creates a background of stars using R3F.
 * Implements Requirement 6.3
 */
export function StarfieldR3F({ starCount = 2000, radius = 100 }) {
  const pointsRef = useRef();

  // Generate star data
  const { positions, colors, sizes, twinklePhases } = useMemo(() => {
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);
    const sizes = new Float32Array(starCount);
    const twinklePhases = new Float32Array(starCount);

    for (let i = 0; i < starCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      
      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      const colorVariation = 0.8 + Math.random() * 0.2;
      colors[i * 3] = colorVariation;
      colors[i * 3 + 1] = colorVariation;
      colors[i * 3 + 2] = 1.0;

      sizes[i] = 0.5 + Math.random() * 1.5;
      twinklePhases[i] = Math.random() * Math.PI * 2;
    }

    return { positions, colors, sizes, twinklePhases };
  }, [starCount, radius]);

  // Shader uniforms
  const uniforms = useRef({
    time: { value: 0.0 },
    twinkleSpeed: { value: 0.5 },
    twinkleIntensity: { value: 0.3 }
  });

  // Vertex shader
  const vertexShader = `
    attribute float size;
    attribute float twinklePhase;
    
    uniform float time;
    uniform float twinkleSpeed;
    uniform float twinkleIntensity;
    
    varying vec3 vColor;
    varying float vTwinkle;
    
    void main() {
      vColor = color;
      float twinkle = sin(time * twinkleSpeed + twinklePhase);
      vTwinkle = 1.0 - twinkleIntensity + twinkleIntensity * (twinkle * 0.5 + 0.5);
      
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      gl_PointSize = size * (300.0 / -mvPosition.z);
      gl_Position = projectionMatrix * mvPosition;
    }
  `;

  // Fragment shader
  const fragmentShader = `
    varying vec3 vColor;
    varying float vTwinkle;
    
    void main() {
      vec2 center = gl_PointCoord - vec2(0.5);
      float dist = length(center);
      if (dist > 0.5) discard;
      float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
      vec3 finalColor = vColor * vTwinkle;
      gl_FragColor = vec4(finalColor, alpha);
    }
  `;

  // Update animation
  useFrame((state, delta) => {
    if (uniforms.current.time) {
      uniforms.current.time.value += delta;
    }
  });

  return (
    <points ref={pointsRef} name="Starfield">
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={starCount}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={starCount}
          array={colors}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          count={starCount}
          array={sizes}
          itemSize={1}
        />
        <bufferAttribute
          attach="attributes-twinklePhase"
          count={starCount}
          array={twinklePhases}
          itemSize={1}
        />
      </bufferGeometry>
      <shaderMaterial
        uniforms={uniforms.current}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent
        vertexColors
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
