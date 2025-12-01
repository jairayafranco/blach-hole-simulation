import * as THREE from 'three';
import { createShaderMaterial } from '../utils/ShaderUtils.js';

/**
 * ParticleSystem manages particle generation, physics simulation, and rendering.
 * Implements Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 6.2
 */
export class ParticleSystem {
  constructor() {
    this.particles = null;
    this.particleCount = 1000;
    this.spawnRadius = 8.0;
    this.eventHorizonRadius = 1.0;
    this.material = null;
    
    // Buffer attributes for particle data
    this.positions = null;
    this.velocities = null;
    this.colors = null;
    this.sizes = null;
  }

  /**
   * Initialize the particle system with specified parameters
   * @param {number} count - Number of particles to generate
   * @param {number} spawnRadius - Radius at which particles spawn
   * @param {number} eventHorizonRadius - Radius of the black hole event horizon
   */
  initialize(count = 1000, spawnRadius = 8.0, eventHorizonRadius = 1.0) {
    this.particleCount = count;
    this.spawnRadius = spawnRadius;
    this.eventHorizonRadius = eventHorizonRadius;

    // Create BufferGeometry for particles
    const geometry = new THREE.BufferGeometry();

    // Initialize buffer arrays
    this.positions = new Float32Array(count * 3); // x, y, z per particle
    this.velocities = new Float32Array(count * 3); // vx, vy, vz per particle
    this.colors = new Float32Array(count * 3); // r, g, b per particle
    this.sizes = new Float32Array(count); // size per particle

    // Generate initial particle data with randomized positions
    for (let i = 0; i < count; i++) {
      this.resetParticle(i);
    }

    // Set buffer attributes
    geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(this.colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(this.sizes, 1));

    // Create custom shader material
    this.material = this.createShaderMaterial();

    // Create Points object
    this.particles = new THREE.Points(geometry, this.material);
    this.particles.name = 'ParticleSystem';
  }

  /**
   * Reset a particle to a new randomized position
   * @param {number} index - Index of the particle to reset
   */
  resetParticle(index) {
    const i3 = index * 3;

    // Generate random position in spherical coordinates
    // Spawn particles outside the spawn radius
    const theta = Math.random() * Math.PI * 2; // Azimuthal angle
    const phi = Math.acos(2 * Math.random() - 1); // Polar angle (uniform distribution)
    const radius = this.spawnRadius + Math.random() * 2.0; // Spawn radius with some variation

    // Convert to Cartesian coordinates
    this.positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
    this.positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    this.positions[i3 + 2] = radius * Math.cos(phi);

    // Initialize velocity with small random component
    this.velocities[i3] = (Math.random() - 0.5) * 0.1;
    this.velocities[i3 + 1] = (Math.random() - 0.5) * 0.1;
    this.velocities[i3 + 2] = (Math.random() - 0.5) * 0.1;

    // Set initial color (will be updated based on velocity)
    this.colors[i3] = 0.8;
    this.colors[i3 + 1] = 0.6;
    this.colors[i3 + 2] = 0.4;

    // Set particle size with some variation
    this.sizes[index] = 2.0 + Math.random() * 2.0;
  }

  /**
   * Create the custom shader material for particles
   * @returns {THREE.ShaderMaterial} The shader material
   */
  createShaderMaterial() {
    // Shader uniforms
    const uniforms = {
      time: { value: 0.0 },
      diskPosition: { value: new THREE.Vector3(0, 0, 0) },
      diskInnerRadius: { value: 1.5 },
      diskOuterRadius: { value: 4.0 }
    };

    // Vertex shader with point size attenuation
    const vertexShader = `
      attribute float size;
      attribute vec3 color;
      
      varying vec3 vColor;
      varying float vDistance;
      
      void main() {
        vColor = color;
        
        // Calculate distance from camera for size attenuation
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        vDistance = -mvPosition.z;
        
        // Point size with distance attenuation
        gl_PointSize = size * (300.0 / vDistance);
        
        gl_Position = projectionMatrix * mvPosition;
      }
    `;

    // Fragment shader with alpha blending
    const fragmentShader = `
      varying vec3 vColor;
      varying float vDistance;
      
      void main() {
        // Create circular point sprite
        vec2 center = gl_PointCoord - vec2(0.5);
        float dist = length(center);
        
        // Discard pixels outside circle
        if (dist > 0.5) {
          discard;
        }
        
        // Smooth edge with alpha blending
        float alpha = 1.0 - smoothstep(0.3, 0.5, dist);
        
        // Apply color with alpha
        gl_FragColor = vec4(vColor, alpha * 0.8);
      }
    `;

    // Use shader utility with error handling and fallback
    return createShaderMaterial({
      uniforms: uniforms,
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      vertexColors: true
    }, 'ParticleSystem');
  }

  /**
   * Update particle physics simulation
   * @param {number} deltaTime - Time elapsed since last frame in seconds
   * @param {THREE.Vector3} blackHolePosition - Position of the black hole center
   */
  update(deltaTime, blackHolePosition = new THREE.Vector3(0, 0, 0)) {
    if (!this.particles) return;

    const geometry = this.particles.geometry;
    const positions = geometry.attributes.position.array;
    const colors = geometry.attributes.color.array;

    // Gravitational constant (scaled for visual effect)
    const G = 5.0;
    const blackHoleMass = 10.0;

    for (let i = 0; i < this.particleCount; i++) {
      const i3 = i * 3;

      // Get particle position
      const px = positions[i3];
      const py = positions[i3 + 1];
      const pz = positions[i3 + 2];

      // Calculate vector from particle to black hole
      const dx = blackHolePosition.x - px;
      const dy = blackHolePosition.y - py;
      const dz = blackHolePosition.z - pz;
      const distanceSquared = dx * dx + dy * dy + dz * dz;
      const distance = Math.sqrt(distanceSquared);

      // Check if particle crossed event horizon
      if (distance < this.eventHorizonRadius) {
        this.resetParticle(i);
        continue;
      }

      // Calculate gravitational acceleration: a = GM/r²
      const acceleration = (G * blackHoleMass) / distanceSquared;

      // Direction toward black hole (normalized)
      const dirX = dx / distance;
      const dirY = dy / distance;
      const dirZ = dz / distance;

      // Update velocity with gravitational acceleration
      this.velocities[i3] += dirX * acceleration * deltaTime;
      this.velocities[i3 + 1] += dirY * acceleration * deltaTime;
      this.velocities[i3 + 2] += dirZ * acceleration * deltaTime;

      // Add spiral trajectory component (tangential velocity)
      // Cross product of position and direction to black hole gives tangential direction
      const tangentX = py * dirZ - pz * dirY;
      const tangentY = pz * dirX - px * dirZ;
      const tangentZ = px * dirY - py * dirX;
      const tangentLength = Math.sqrt(tangentX * tangentX + tangentY * tangentY + tangentZ * tangentZ);
      
      if (tangentLength > 0.001) {
        const spiralStrength = 0.5 / distance; // Stronger spiral closer to black hole
        this.velocities[i3] += (tangentX / tangentLength) * spiralStrength * deltaTime;
        this.velocities[i3 + 1] += (tangentY / tangentLength) * spiralStrength * deltaTime;
        this.velocities[i3 + 2] += (tangentZ / tangentLength) * spiralStrength * deltaTime;
      }

      // Update position with velocity
      positions[i3] += this.velocities[i3] * deltaTime;
      positions[i3 + 1] += this.velocities[i3 + 1] * deltaTime;
      positions[i3 + 2] += this.velocities[i3 + 2] * deltaTime;

      // Update color based on velocity (Doppler shift approximation)
      const speed = Math.sqrt(
        this.velocities[i3] * this.velocities[i3] +
        this.velocities[i3 + 1] * this.velocities[i3 + 1] +
        this.velocities[i3 + 2] * this.velocities[i3 + 2]
      );
      const normalizedSpeed = Math.min(speed / 10.0, 1.0);

      // Color shifts from orange to blue-white as speed increases
      colors[i3] = 0.8 + normalizedSpeed * 0.2; // Red
      colors[i3 + 1] = 0.6 + normalizedSpeed * 0.4; // Green
      colors[i3 + 2] = 0.4 + normalizedSpeed * 0.6; // Blue

      // Add illumination from nearby emissive surfaces (accretion disk)
      // Calculate distance to disk plane (y = 0)
      const distanceToDisk = Math.abs(py);
      const radialDistance = Math.sqrt(px * px + pz * pz);
      
      // Check if particle is near the accretion disk
      const diskInnerRadius = 1.5;
      const diskOuterRadius = 4.0;
      if (radialDistance > diskInnerRadius && radialDistance < diskOuterRadius && distanceToDisk < 1.0) {
        const diskProximity = 1.0 - (distanceToDisk / 1.0);
        const illumination = diskProximity * 0.5;
        colors[i3] += illumination * 0.8; // Add orange glow
        colors[i3 + 1] += illumination * 0.4;
        colors[i3 + 2] += illumination * 0.1;
      }
    }

    // Mark attributes as needing update
    geometry.attributes.position.needsUpdate = true;
    geometry.attributes.color.needsUpdate = true;

    // Update time uniform
    if (this.material && this.material.uniforms) {
      this.material.uniforms.time.value += deltaTime;
    }
  }

  /**
   * Set the particle count dynamically
   * @param {number} count - New particle count
   */
  setParticleCount(count) {
    if (count === this.particleCount) return;

    // Store old data
    const oldCount = this.particleCount;
    this.particleCount = count;

    // Create new buffer arrays
    const newPositions = new Float32Array(count * 3);
    const newVelocities = new Float32Array(count * 3);
    const newColors = new Float32Array(count * 3);
    const newSizes = new Float32Array(count);

    // Copy existing particle data
    const copyCount = Math.min(oldCount, count);
    for (let i = 0; i < copyCount; i++) {
      const i3 = i * 3;
      newPositions[i3] = this.positions[i3];
      newPositions[i3 + 1] = this.positions[i3 + 1];
      newPositions[i3 + 2] = this.positions[i3 + 2];
      
      newVelocities[i3] = this.velocities[i3];
      newVelocities[i3 + 1] = this.velocities[i3 + 1];
      newVelocities[i3 + 2] = this.velocities[i3 + 2];
      
      newColors[i3] = this.colors[i3];
      newColors[i3 + 1] = this.colors[i3 + 1];
      newColors[i3 + 2] = this.colors[i3 + 2];
      
      newSizes[i] = this.sizes[i];
    }

    // Initialize new particles if count increased
    if (count > oldCount) {
      this.positions = newPositions;
      this.velocities = newVelocities;
      this.colors = newColors;
      this.sizes = newSizes;
      
      for (let i = oldCount; i < count; i++) {
        this.resetParticle(i);
      }
    } else {
      this.positions = newPositions;
      this.velocities = newVelocities;
      this.colors = newColors;
      this.sizes = newSizes;
    }

    // Update geometry attributes
    if (this.particles) {
      const geometry = this.particles.geometry;
      geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
      geometry.setAttribute('color', new THREE.BufferAttribute(this.colors, 3));
      geometry.setAttribute('size', new THREE.BufferAttribute(this.sizes, 1));
    }
  }

  /**
   * Dispose of all resources
   */
  dispose() {
    if (this.particles) {
      if (this.particles.geometry) {
        this.particles.geometry.dispose();
      }
      if (this.material) {
        this.material.dispose();
      }
      this.particles = null;
      this.material = null;
    }
    
    this.positions = null;
    this.velocities = null;
    this.colors = null;
    this.sizes = null;
  }
}
