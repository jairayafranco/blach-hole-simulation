import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * AccretionDiskR3F renders the rotating disk using R3F.
 * Implements Requirements 1.2, 5.1, 5.2, 5.3, 5.4, 5.5
 */
export function AccretionDiskR3F({ 
  innerRadius = 1.5, 
  outerRadius = 4.0, 
  rotationSpeed = 1.0 
}) {
  const meshRef = useRef();

  // Shader uniforms
  const uniforms = useRef({
    time: { value: 0.0 },
    innerRadius: { value: innerRadius },
    outerRadius: { value: outerRadius },
    rotationSpeed: { value: rotationSpeed },
    hotColor: { value: new THREE.Color(0xffaa00) },
    coolColor: { value: new THREE.Color(0xff3300) },
    emissiveStrength: { value: 2.0 }
  });

  // Update rotation speed when prop changes
  if (uniforms.current.rotationSpeed) {
    uniforms.current.rotationSpeed.value = rotationSpeed;
  }

  // Vertex shader with differential rotation
  const vertexShader = `
    uniform float time;
    uniform float innerRadius;
    uniform float outerRadius;
    uniform float rotationSpeed;
    
    varying vec2 vUv;
    varying vec3 vPosition;
    varying float vRadius;
    
    void main() {
      vUv = uv;
      vec3 pos = position;
      float radius = length(pos.xy);
      vRadius = radius;
      
      float normalizedRadius = (radius - innerRadius) / (outerRadius - innerRadius);
      float angularVelocity = rotationSpeed / pow(radius, 1.5);
      float rotationAngle = angularVelocity * time;
      
      float cosAngle = cos(rotationAngle);
      float sinAngle = sin(rotationAngle);
      
      vec2 rotatedPos;
      rotatedPos.x = pos.x * cosAngle - pos.y * sinAngle;
      rotatedPos.y = pos.x * sinAngle + pos.y * cosAngle;
      
      pos.xy = rotatedPos;
      vPosition = pos;
      
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `;

  // Fragment shader with temperature gradient
  const fragmentShader = `
    uniform float innerRadius;
    uniform float outerRadius;
    uniform vec3 hotColor;
    uniform vec3 coolColor;
    uniform float emissiveStrength;
    
    varying vec2 vUv;
    varying vec3 vPosition;
    varying float vRadius;
    
    void main() {
      float normalizedRadius = (vRadius - innerRadius) / (outerRadius - innerRadius);
      vec3 color = mix(hotColor, coolColor, normalizedRadius);
      vec3 emissive = color * emissiveStrength;
      
      vec3 viewDir = normalize(cameraPosition - vPosition);
      vec3 normal = vec3(0.0, 0.0, 1.0);
      float fresnel = abs(dot(viewDir, normal));
      
      float baseAlpha = 0.9 - normalizedRadius * 0.6;
      float alpha = baseAlpha * (0.3 + 0.7 * fresnel);
      
      vec3 finalColor = color + emissive;
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
    <mesh 
      ref={meshRef} 
      name="AccretionDisk"
      rotation={[-Math.PI / 2, 0, 0]}
    >
      <ringGeometry args={[innerRadius, outerRadius, 128, 64]} />
      <shaderMaterial
        uniforms={uniforms.current}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        side={THREE.DoubleSide}
        transparent
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
}
