import { describe, it, expect, beforeEach } from 'vitest';
import * as THREE from 'three';
import { ParticleSystem } from '../../src/components/ParticleSystem.js';

describe('ParticleSystem', () => {
  let particleSystem;

  beforeEach(() => {
    particleSystem = new ParticleSystem();
  });

  describe('initialization', () => {
    it('should initialize with default parameters', () => {
      particleSystem.initialize();

      expect(particleSystem.particles).toBeInstanceOf(THREE.Points);
      expect(particleSystem.particleCount).toBe(1000);
      expect(particleSystem.spawnRadius).toBe(8.0);
      expect(particleSystem.eventHorizonRadius).toBe(1.0);
    });

    it('should initialize with custom parameters', () => {
      particleSystem.initialize(500, 10.0, 1.5);

      expect(particleSystem.particleCount).toBe(500);
      expect(particleSystem.spawnRadius).toBe(10.0);
      expect(particleSystem.eventHorizonRadius).toBe(1.5);
    });

    it('should create buffer attributes for position, color, and size', () => {
      particleSystem.initialize(100);

      const geometry = particleSystem.particles.geometry;
      expect(geometry.attributes.position).toBeDefined();
      expect(geometry.attributes.color).toBeDefined();
      expect(geometry.attributes.size).toBeDefined();
    });

    it('should initialize all particles with randomized positions', () => {
      particleSystem.initialize(100);

      const positions = particleSystem.particles.geometry.attributes.position.array;
      
      // Check that particles have been positioned
      let allZero = true;
      for (let i = 0; i < positions.length; i++) {
        if (positions[i] !== 0) {
          allZero = false;
          break;
        }
      }
      expect(allZero).toBe(false);
    });
  });

  describe('resetParticle', () => {
    beforeEach(() => {
      particleSystem.initialize(10);
    });

    it('should reset particle position outside spawn radius', () => {
      particleSystem.resetParticle(0);

      const x = particleSystem.positions[0];
      const y = particleSystem.positions[1];
      const z = particleSystem.positions[2];
      const distance = Math.sqrt(x * x + y * y + z * z);

      expect(distance).toBeGreaterThanOrEqual(particleSystem.spawnRadius);
    });

    it('should initialize particle velocity', () => {
      particleSystem.resetParticle(0);

      const vx = particleSystem.velocities[0];
      const vy = particleSystem.velocities[1];
      const vz = particleSystem.velocities[2];

      expect(vx).toBeDefined();
      expect(vy).toBeDefined();
      expect(vz).toBeDefined();
    });

    it('should set particle color', () => {
      particleSystem.resetParticle(0);

      const r = particleSystem.colors[0];
      const g = particleSystem.colors[1];
      const b = particleSystem.colors[2];

      expect(r).toBeGreaterThan(0);
      expect(g).toBeGreaterThan(0);
      expect(b).toBeGreaterThan(0);
    });

    it('should set particle size', () => {
      particleSystem.resetParticle(0);

      const size = particleSystem.sizes[0];
      expect(size).toBeGreaterThan(0);
    });
  });

  describe('update', () => {
    beforeEach(() => {
      particleSystem.initialize(10, 8.0, 1.0);
    });

    it('should update particle positions based on physics', () => {
      const blackHolePosition = new THREE.Vector3(0, 0, 0);
      const initialPositions = [...particleSystem.particles.geometry.attributes.position.array];

      particleSystem.update(0.016, blackHolePosition);

      const updatedPositions = particleSystem.particles.geometry.attributes.position.array;
      
      // At least some positions should have changed
      let hasChanged = false;
      for (let i = 0; i < initialPositions.length; i++) {
        if (Math.abs(initialPositions[i] - updatedPositions[i]) > 0.0001) {
          hasChanged = true;
          break;
        }
      }
      expect(hasChanged).toBe(true);
    });

    it('should reset particles that cross event horizon', () => {
      const blackHolePosition = new THREE.Vector3(0, 0, 0);
      
      // Place a particle inside event horizon
      particleSystem.positions[0] = 0.5;
      particleSystem.positions[1] = 0.0;
      particleSystem.positions[2] = 0.0;

      particleSystem.update(0.016, blackHolePosition);

      // Particle should be reset outside spawn radius
      const x = particleSystem.positions[0];
      const y = particleSystem.positions[1];
      const z = particleSystem.positions[2];
      const distance = Math.sqrt(x * x + y * y + z * z);

      expect(distance).toBeGreaterThanOrEqual(particleSystem.spawnRadius);
    });

    it('should update particle colors based on velocity', () => {
      const blackHolePosition = new THREE.Vector3(0, 0, 0);
      
      particleSystem.update(0.016, blackHolePosition);

      const colors = particleSystem.particles.geometry.attributes.color.array;
      
      // Colors should be set
      expect(colors[0]).toBeGreaterThan(0);
      expect(colors[1]).toBeGreaterThan(0);
      expect(colors[2]).toBeGreaterThan(0);
    });

    it('should update time uniform', () => {
      const blackHolePosition = new THREE.Vector3(0, 0, 0);
      const initialTime = particleSystem.material.uniforms.time.value;

      particleSystem.update(0.016, blackHolePosition);

      expect(particleSystem.material.uniforms.time.value).toBeGreaterThan(initialTime);
    });
  });

  describe('setParticleCount', () => {
    beforeEach(() => {
      particleSystem.initialize(100);
    });

    it('should increase particle count', () => {
      particleSystem.setParticleCount(200);

      expect(particleSystem.particleCount).toBe(200);
      expect(particleSystem.positions.length).toBe(200 * 3);
    });

    it('should decrease particle count', () => {
      particleSystem.setParticleCount(50);

      expect(particleSystem.particleCount).toBe(50);
      expect(particleSystem.positions.length).toBe(50 * 3);
    });

    it('should preserve existing particle data when increasing count', () => {
      const originalFirstParticle = [
        particleSystem.positions[0],
        particleSystem.positions[1],
        particleSystem.positions[2]
      ];

      particleSystem.setParticleCount(200);

      expect(particleSystem.positions[0]).toBe(originalFirstParticle[0]);
      expect(particleSystem.positions[1]).toBe(originalFirstParticle[1]);
      expect(particleSystem.positions[2]).toBe(originalFirstParticle[2]);
    });

    it('should do nothing if count is the same', () => {
      const originalPositions = particleSystem.positions;
      particleSystem.setParticleCount(100);

      expect(particleSystem.positions).toBe(originalPositions);
    });

    it('should update geometry attributes', () => {
      particleSystem.setParticleCount(150);

      const geometry = particleSystem.particles.geometry;
      expect(geometry.attributes.position.count).toBe(150);
      expect(geometry.attributes.color.count).toBe(150);
      expect(geometry.attributes.size.count).toBe(150);
    });
  });

  describe('material', () => {
    beforeEach(() => {
      particleSystem.initialize();
    });

    it('should create shader material', () => {
      expect(particleSystem.material).toBeInstanceOf(THREE.ShaderMaterial);
    });

    it('should have required uniforms', () => {
      const uniforms = particleSystem.material.uniforms;
      
      expect(uniforms.time).toBeDefined();
      expect(uniforms.diskPosition).toBeDefined();
      expect(uniforms.diskInnerRadius).toBeDefined();
      expect(uniforms.diskOuterRadius).toBeDefined();
    });

    it('should be transparent with additive blending', () => {
      expect(particleSystem.material.transparent).toBe(true);
      expect(particleSystem.material.blending).toBe(THREE.AdditiveBlending);
      expect(particleSystem.material.depthWrite).toBe(false);
    });
  });

  describe('disposal', () => {
    beforeEach(() => {
      particleSystem.initialize();
    });

    it('should dispose of geometry and material', () => {
      const geometry = particleSystem.particles.geometry;
      

      particleSystem.dispose();

      expect(particleSystem.particles).toBeNull();
      expect(particleSystem.material).toBeNull();
    });

    it('should clear buffer arrays', () => {
      particleSystem.dispose();

      expect(particleSystem.positions).toBeNull();
      expect(particleSystem.velocities).toBeNull();
      expect(particleSystem.colors).toBeNull();
      expect(particleSystem.sizes).toBeNull();
    });
  });
});
