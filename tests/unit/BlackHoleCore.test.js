import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { BlackHoleCore } from '../../src/components/BlackHoleCore.js';
import * as THREE from 'three';

describe('BlackHoleCore', () => {
  let blackHoleCore;

  beforeEach(() => {
    blackHoleCore = new BlackHoleCore();
  });

  afterEach(() => {
    if (blackHoleCore) {
      blackHoleCore.dispose();
    }
  });

  describe('Initialization', () => {
    it('should initialize with default radius', () => {
      blackHoleCore.initialize();
      
      expect(blackHoleCore.mesh).toBeDefined();
      expect(blackHoleCore.mesh.name).toBe('BlackHoleCore');
      expect(blackHoleCore.radius).toBe(1.0);
    });

    it('should initialize with custom radius', () => {
      const customRadius = 2.5;
      blackHoleCore.initialize(customRadius);
      
      expect(blackHoleCore.radius).toBe(customRadius);
      expect(blackHoleCore.mesh).toBeDefined();
    });

    it('should create spherical geometry', () => {
      blackHoleCore.initialize();
      
      expect(blackHoleCore.mesh.geometry).toBeInstanceOf(THREE.SphereGeometry);
    });

    it('should create shader material', () => {
      blackHoleCore.initialize();
      
      expect(blackHoleCore.mesh.material).toBeInstanceOf(THREE.ShaderMaterial);
      expect(blackHoleCore.material).toBeDefined();
    });

    it('should have required shader uniforms', () => {
      blackHoleCore.initialize();
      
      const uniforms = blackHoleCore.material.uniforms;
      expect(uniforms.time).toBeDefined();
      expect(uniforms.radius).toBeDefined();
      expect(uniforms.glowColor).toBeDefined();
      expect(uniforms.glowIntensity).toBeDefined();
    });
  });

  describe('Update', () => {
    it('should update time uniform', () => {
      blackHoleCore.initialize();
      
      const initialTime = blackHoleCore.material.uniforms.time.value;
      const deltaTime = 0.016; // ~60fps
      
      blackHoleCore.update(deltaTime);
      
      expect(blackHoleCore.material.uniforms.time.value).toBeGreaterThan(initialTime);
    });

    it('should accumulate time over multiple updates', () => {
      blackHoleCore.initialize();
      
      const deltaTime = 0.016;
      blackHoleCore.update(deltaTime);
      blackHoleCore.update(deltaTime);
      blackHoleCore.update(deltaTime);
      
      expect(blackHoleCore.material.uniforms.time.value).toBeCloseTo(deltaTime * 3, 5);
    });
  });

  describe('Material', () => {
    it('should return shader material via getMaterial', () => {
      blackHoleCore.initialize();
      
      const material = blackHoleCore.getMaterial();
      expect(material).toBeInstanceOf(THREE.ShaderMaterial);
      expect(material).toBe(blackHoleCore.material);
    });

    it('should have vertex and fragment shaders', () => {
      blackHoleCore.initialize();
      
      const material = blackHoleCore.getMaterial();
      expect(material.vertexShader).toBeDefined();
      expect(material.fragmentShader).toBeDefined();
      expect(material.vertexShader.length).toBeGreaterThan(0);
      expect(material.fragmentShader.length).toBeGreaterThan(0);
    });
  });

  describe('Disposal', () => {
    it('should dispose of geometry and material', () => {
      blackHoleCore.initialize();
      
      const geometry = blackHoleCore.mesh.geometry;
      const material = blackHoleCore.material;
      
      blackHoleCore.dispose();
      
      expect(blackHoleCore.mesh).toBeNull();
      expect(blackHoleCore.material).toBeNull();
    });

    it('should handle disposal when not initialized', () => {
      expect(() => blackHoleCore.dispose()).not.toThrow();
    });
  });
});
