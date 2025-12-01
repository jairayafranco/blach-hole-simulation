import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * ParticleSystemR3F manages particle physics and rendering using R3F.
 * Implements Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 6.2
 */
export function ParticleSystemR3F({ 
  count = 1000, 
  spawnRadius = 8.0, 
  eventHorizonRadius = 1.0,
  blackHolePosition = new THREE.Vector3(0, 0, 0)
}) {
  const pointsRef = useRef();
  const velocitiesRef = useRef();

  // Initialize particle data
  const { positions, velocities, colors, sizes } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    const resetParticle = (index) => {
      const i3 = index * 3;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const radius = spawnRadius + Math.random() * 2.0;

      positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = radius * Math.cos(phi);

      velocities[i3] = (Math.random() - 0.5) * 0.1;
      velocities[i3 + 1] = (Math.random() - 0.5) * 0.1;
      velocities[i3 + 2] = (Math.random() - 0.5) * 0.1;

      colors[i3] = 0.8;
      colors[i3 + 1] = 0.6;
      colors[i3 + 2] = 0.4;

      sizes[index] = 2.0 + Math.random() * 2.0;
    };

    for (let i = 0; i < count; i++) {
      resetParticle(i);
    }

    return { positions, velocities, colors, sizes };
  }, [count, spawnRadius]);

  velocitiesRef.current = velocities;

  // Shader uniforms
  const uniforms = useRef({
    time: { value: 0.0 },
    diskPosition: { value: new THREE.Vector3(0, 0, 0) },
    diskInnerRadius: { value: 1.5 },
    diskOuterRadius: { value: 4.0 }
  });

  // Vertex shader
  const vertexShader = `
    attribute float size;
    attribute vec3 color;
    
    varying vec3 vColor;
    varying float vDistance;
    
    void main() {
      vColor = color;
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      vDistance = -mvPosition.z;
      gl_PointSize = size * (300.0 / vDistance);
      gl_Position = projectionMatrix * mvPosition;
    }
  `;

  // Fragment shader
  const fragmentShader = `
    varying vec3 vColor;
    varying float vDistance;
    
    void main() {
      vec2 center = gl_PointCoord - vec2(0.5);
      float dist = length(center);
      if (dist > 0.5) discard;
      float alpha = 1.0 - smoothstep(0.3, 0.5, dist);
      gl_FragColor = vec4(vColor, alpha * 0.8);
    }
  `;

  // Update particle physics
  useFrame((state, delta) => {
    if (!pointsRef.current) return;

    const geometry = pointsRef.current.geometry;
    const positions = geometry.attributes.position.array;
    const colors = geometry.attributes.color.array;
    const velocities = velocitiesRef.current;

    const G = 5.0;
    const blackHoleMass = 10.0;

    const resetParticle = (index) => {
      const i3 = index * 3;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const radius = spawnRadius + Math.random() * 2.0;

      positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = radius * Math.cos(phi);

      velocities[i3] = (Math.random() - 0.5) * 0.1;
      velocities[i3 + 1] = (Math.random() - 0.5) * 0.1;
      velocities[i3 + 2] = (Math.random() - 0.5) * 0.1;

      colors[i3] = 0.8;
      colors[i3 + 1] = 0.6;
      colors[i3 + 2] = 0.4;
    };

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;

      const px = positions[i3];
      const py = positions[i3 + 1];
      const pz = positions[i3 + 2];

      const dx = blackHolePosition.x - px;
      const dy = blackHolePosition.y - py;
      const dz = blackHolePosition.z - pz;
      const distanceSquared = dx * dx + dy * dy + dz * dz;
      const distance = Math.sqrt(distanceSquared);

      if (distance < eventHorizonRadius) {
        resetParticle(i);
        continue;
      }

      const acceleration = (G * blackHoleMass) / distanceSquared;
      const dirX = dx / distance;
      const dirY = dy / distance;
      const dirZ = dz / distance;

      velocities[i3] += dirX * acceleration * delta;
      velocities[i3 + 1] += dirY * acceleration * delta;
      velocities[i3 + 2] += dirZ * acceleration * delta;

      const tangentX = py * dirZ - pz * dirY;
      const tangentY = pz * dirX - px * dirZ;
      const tangentZ = px * dirY - py * dirX;
      const tangentLength = Math.sqrt(tangentX * tangentX + tangentY * tangentY + tangentZ * tangentZ);
      
      if (tangentLength > 0.001) {
        const spiralStrength = 0.5 / distance;
        velocities[i3] += (tangentX / tangentLength) * spiralStrength * delta;
        velocities[i3 + 1] += (tangentY / tangentLength) * spiralStrength * delta;
        velocities[i3 + 2] += (tangentZ / tangentLength) * spiralStrength * delta;
      }

      positions[i3] += velocities[i3] * delta;
      positions[i3 + 1] += velocities[i3 + 1] * delta;
      positions[i3 + 2] += velocities[i3 + 2] * delta;

      const speed = Math.sqrt(
        velocities[i3] * velocities[i3] +
        velocities[i3 + 1] * velocities[i3 + 1] +
        velocities[i3 + 2] * velocities[i3 + 2]
      );
      const normalizedSpeed = Math.min(speed / 10.0, 1.0);

      colors[i3] = 0.8 + normalizedSpeed * 0.2;
      colors[i3 + 1] = 0.6 + normalizedSpeed * 0.4;
      colors[i3 + 2] = 0.4 + normalizedSpeed * 0.6;

      const distanceToDisk = Math.abs(py);
      const radialDistance = Math.sqrt(px * px + pz * pz);
      
      if (radialDistance > 1.5 && radialDistance < 4.0 && distanceToDisk < 1.0) {
        const diskProximity = 1.0 - (distanceToDisk / 1.0);
        const illumination = diskProximity * 0.5;
        colors[i3] += illumination * 0.8;
        colors[i3 + 1] += illumination * 0.4;
        colors[i3 + 2] += illumination * 0.1;
      }
    }

    geometry.attributes.position.needsUpdate = true;
    geometry.attributes.color.needsUpdate = true;

    if (uniforms.current.time) {
      uniforms.current.time.value += delta;
    }
  });

  return (
    <points ref={pointsRef} name="ParticleSystem">
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={count}
          array={colors}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          count={count}
          array={sizes}
          itemSize={1}
        />
      </bufferGeometry>
      <shaderMaterial
        uniforms={uniforms.current}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        vertexColors
      />
    </points>
  );
}
