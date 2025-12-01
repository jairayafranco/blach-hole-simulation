import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * BlackHoleCoreR3F renders the event horizon sphere using R3F.
 * Implements Requirements 1.1, 1.3, 6.1
 */
export function BlackHoleCoreR3F({ radius = 1.0 }) {
  const meshRef = useRef();
  const materialRef = useRef();

  // Shader uniforms
  const uniforms = useRef({
    time: { value: 0.0 },
    radius: { value: radius },
    glowColor: { value: new THREE.Color(0x4444ff) },
    glowIntensity: { value: 0.8 }
  });

  // Vertex shader
  const vertexShader = `
    varying vec3 vNormal;
    varying vec3 vPosition;
    
    void main() {
      vNormal = normalize(normalMatrix * normal);
      vPosition = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  // Fragment shader
  const fragmentShader = `
    uniform float time;
    uniform float radius;
    uniform vec3 glowColor;
    uniform float glowIntensity;
    
    varying vec3 vNormal;
    varying vec3 vPosition;
    
    void main() {
      vec3 viewDir = normalize(cameraPosition - vPosition);
      float fresnel = pow(1.0 - abs(dot(viewDir, vNormal)), 3.0);
      float centerDarkness = 0.05 + 0.02 * sin(time * 0.5);
      vec3 darkColor = vec3(centerDarkness);
      vec3 glow = glowColor * fresnel * glowIntensity;
      vec3 finalColor = darkColor + glow;
      float pulse = 0.8 + 0.2 * sin(time * 2.0);
      finalColor += glow * pulse * 0.3;
      gl_FragColor = vec4(finalColor, 1.0);
    }
  `;

  // Update animation
  useFrame((state, delta) => {
    if (uniforms.current.time) {
      uniforms.current.time.value += delta;
    }
  });

  return (
    <mesh ref={meshRef} name="BlackHoleCore">
      <sphereGeometry args={[radius, 64, 64]} />
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms.current}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        side={THREE.FrontSide}
      />
    </mesh>
  );
}
