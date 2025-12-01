import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Starfield } from '../../src/components/Starfield.js';
import * as THREE from 'three';

describe('Starfield', () => {
  let starfield;

  beforeEach(() => {
    starfield = new Starfield();
  });

  afterEach(() => {
    if (starfield) {
      starfield.dispose();
    }
  });

  describe('initialization', () => {
    it('should initialize with default parameters', () => {
      starfield.initialize();

      expect(starfield.points).toBeInstanceOf(THREE.Points);
      expect(starfield.geometry).toBeInstanceOf(THREE.BufferGeometry);
      expect(starfield.material).toBeInstanceOf(THREE.ShaderMaterial);
      expect(starfield.starCount).toBe(2000);
    });

    it('should initialize with custom star count', () => {
      const customCount = 1000;
      starfield.initialize(customCount);

      expect(starfield.starCount).toBe(customCount);
      const positions = starfield.geometry.getAttribute('position');
      expect(positions.count).toBe(customCount);
    });

    it('should create stars in spherical distribution', () => {
      const radius = 100;
      starfield.initialize(500, radius);

      const positions = starfield.geometry.getAttribute('position');
      
      // Check that stars are approximately at the specified radius
      for (let i = 0; i < positions.count; i++) {
        const x = positions.getX(i);
        const y = positions.getY(i);
        const z = positions.getZ(i);
        const distance = Math.sqrt(x * x + y * y + z * z);
        
        // Should be very close to the radius (within floating point precision)
        expect(distance).toBeCloseTo(radius, 1);
      }
    });

    it('should create buffer attributes for positions, colors, sizes, and twinkle phases', () => {
      starfield.initialize();

      expect(starfield.geometry.getAttribute('position')).toBeDefined();
      expect(starfield.geometry.getAttribute('color')).toBeDefined();
      expect(starfield.geometry.getAttribute('size')).toBeDefined();
      expect(starfield.geometry.getAttribute('twinklePhase')).toBeDefined();
    });

    it('should assign random twinkle phases to stars', () => {
      starfield.initialize(100);

      const twinklePhases = starfield.geometry.getAttribute('twinklePhase');
      const phases = [];
      
      for (let i = 0; i < twinklePhases.count; i++) {
        phases.push(twinklePhases.getX(i));
      }

      // Check that phases are within valid range [0, 2π]
      phases.forEach(phase => {
        expect(phase).toBeGreaterThanOrEqual(0);
        expect(phase).toBeLessThanOrEqual(Math.PI * 2);
      });

      // Check that not all phases are the same (randomness)
      const uniquePhases = new Set(phases);
      expect(uniquePhases.size).toBeGreaterThan(1);
    });
  });

  describe('update', () => {
    it('should update time uniform', () => {
      starfield.initialize();
      const initialTime = starfield.material.uniforms.time.value;

      starfield.update(0.016);

      expect(starfield.material.uniforms.time.value).toBeGreaterThan(initialTime);
    });

    it('should accumulate time over multiple updates', () => {
      starfield.initialize();
      
      starfield.update(0.1);
      starfield.update(0.1);
      starfield.update(0.1);

      expect(starfield.material.uniforms.time.value).toBeCloseTo(0.3, 5);
    });
  });

  describe('configuration', () => {
    it('should set twinkle speed', () => {
      starfield.initialize();
      const newSpeed = 2.0;

      starfield.setTwinkleSpeed(newSpeed);

      expect(starfield.material.uniforms.twinkleSpeed.value).toBe(newSpeed);
    });

    it('should set twinkle intensity', () => {
      starfield.initialize();
      const newIntensity = 0.7;

      starfield.setTwinkleIntensity(newIntensity);

      expect(starfield.material.uniforms.twinkleIntensity.value).toBe(newIntensity);
    });

    it('should clamp twinkle intensity to valid range', () => {
      starfield.initialize();

      starfield.setTwinkleIntensity(1.5);
      expect(starfield.material.uniforms.twinkleIntensity.value).toBe(1.0);

      starfield.setTwinkleIntensity(-0.5);
      expect(starfield.material.uniforms.twinkleIntensity.value).toBe(0.0);
    });
  });

  describe('material properties', () => {
    it('should create material with correct properties', () => {
      starfield.initialize();

      expect(starfield.material.transparent).toBe(true);
      expect(starfield.material.vertexColors).toBe(true);
      expect(starfield.material.depthWrite).toBe(false);
      expect(starfield.material.blending).toBe(THREE.AdditiveBlending);
    });

    it('should have required uniforms', () => {
      starfield.initialize();

      expect(starfield.material.uniforms.time).toBeDefined();
      expect(starfield.material.uniforms.twinkleSpeed).toBeDefined();
      expect(starfield.material.uniforms.twinkleIntensity).toBeDefined();
    });
  });

  describe('disposal', () => {
    it('should dispose of geometry and material', () => {
      starfield.initialize();
      const geometry = starfield.geometry;
      const material = starfield.material;

      starfield.dispose();

      expect(starfield.geometry).toBeNull();
      expect(starfield.material).toBeNull();
      expect(starfield.points).toBeNull();
    });

    it('should handle disposal when not initialized', () => {
      expect(() => starfield.dispose()).not.toThrow();
    });
  });
});
