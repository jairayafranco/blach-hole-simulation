import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { GravitationalLensing } from '../../src/components/GravitationalLensing.js';
import * as THREE from 'three';

describe('GravitationalLensing', () => {
  let lensing;
  let scene;

  beforeEach(() => {
    lensing = new GravitationalLensing();
    scene = new THREE.Scene();
  });

  afterEach(() => {
    if (lensing) {
      lensing.dispose();
    }
    if (scene) {
      scene.clear();
    }
  });

  describe('Initialization', () => {
    it('should initialize with default event horizon radius', () => {
      lensing.initialize(scene);
      
      expect(lensing.scene).toBe(scene);
      expect(lensing.eventHorizonRadius).toBe(1.0);
      expect(lensing.renderTarget).toBeDefined();
      expect(lensing.lensingMaterial).toBeDefined();
    });

    it('should initialize with custom event horizon radius', () => {
      const customRadius = 2.5;
      lensing.initialize(scene, customRadius);
      
      expect(lensing.eventHorizonRadius).toBe(customRadius);
    });

    it('should create render target', () => {
      lensing.initialize(scene);
      
      expect(lensing.renderTarget).toBeInstanceOf(THREE.WebGLRenderTarget);
    });

    it('should create shader material', () => {
      lensing.initialize(scene);
      
      expect(lensing.lensingMaterial).toBeInstanceOf(THREE.ShaderMaterial);
    });

    it('should have required shader uniforms', () => {
      lensing.initialize(scene);
      
      const uniforms = lensing.lensingMaterial.uniforms;
      expect(uniforms.tDiffuse).toBeDefined();
      expect(uniforms.cameraPosition).toBeDefined();
      expect(uniforms.blackHolePosition).toBeDefined();
      expect(uniforms.eventHorizonRadius).toBeDefined();
      expect(uniforms.intensity).toBeDefined();
      expect(uniforms.resolution).toBeDefined();
    });

    it('should create full-screen quad', () => {
      lensing.initialize(scene);
      
      expect(lensing.quad).toBeDefined();
      expect(lensing.quad).toBeInstanceOf(THREE.Mesh);
    });
  });

  describe('Update', () => {
    it('should update camera position uniform', () => {
      lensing.initialize(scene);
      
      const cameraPos = new THREE.Vector3(5, 3, 10);
      lensing.update(cameraPos);
      
      expect(lensing.lensingMaterial.uniforms.cameraPosition.value.x).toBe(5);
      expect(lensing.lensingMaterial.uniforms.cameraPosition.value.y).toBe(3);
      expect(lensing.lensingMaterial.uniforms.cameraPosition.value.z).toBe(10);
    });

    it('should update black hole position when provided', () => {
      lensing.initialize(scene);
      
      const cameraPos = new THREE.Vector3(5, 3, 10);
      const bhPos = new THREE.Vector3(1, 2, 3);
      lensing.update(cameraPos, bhPos);
      
      expect(lensing.blackHolePosition.x).toBe(1);
      expect(lensing.blackHolePosition.y).toBe(2);
      expect(lensing.blackHolePosition.z).toBe(3);
      expect(lensing.lensingMaterial.uniforms.blackHolePosition.value.x).toBe(1);
    });

    it('should not throw when called before initialization', () => {
      const cameraPos = new THREE.Vector3(5, 3, 10);
      expect(() => lensing.update(cameraPos)).not.toThrow();
    });
  });

  describe('Intensity Control', () => {
    it('should set intensity', () => {
      lensing.initialize(scene);
      
      lensing.setIntensity(0.5);
      
      expect(lensing.intensity).toBe(0.5);
      expect(lensing.lensingMaterial.uniforms.intensity.value).toBe(0.5);
    });

    it('should clamp negative intensity to zero', () => {
      lensing.initialize(scene);
      
      lensing.setIntensity(-1.0);
      
      expect(lensing.intensity).toBe(0);
      expect(lensing.lensingMaterial.uniforms.intensity.value).toBe(0);
    });

    it('should allow intensity greater than 1', () => {
      lensing.initialize(scene);
      
      lensing.setIntensity(2.5);
      
      expect(lensing.intensity).toBe(2.5);
      expect(lensing.lensingMaterial.uniforms.intensity.value).toBe(2.5);
    });
  });

  describe('Resize', () => {
    it('should resize render target', () => {
      lensing.initialize(scene);
      
      lensing.resize(1920, 1080);
      
      expect(lensing.renderTarget.width).toBe(1920);
      expect(lensing.renderTarget.height).toBe(1080);
    });

    it('should update resolution uniform', () => {
      lensing.initialize(scene);
      
      lensing.resize(1920, 1080);
      
      expect(lensing.lensingMaterial.uniforms.resolution.value.x).toBe(1920);
      expect(lensing.lensingMaterial.uniforms.resolution.value.y).toBe(1080);
    });
  });

  describe('Material', () => {
    it('should return shader material via getMaterial', () => {
      lensing.initialize(scene);
      
      const material = lensing.getMaterial();
      expect(material).toBeInstanceOf(THREE.ShaderMaterial);
      expect(material).toBe(lensing.lensingMaterial);
    });

    it('should have vertex and fragment shaders', () => {
      lensing.initialize(scene);
      
      const material = lensing.getMaterial();
      expect(material.vertexShader).toBeDefined();
      expect(material.fragmentShader).toBeDefined();
      expect(material.vertexShader.length).toBeGreaterThan(0);
      expect(material.fragmentShader.length).toBeGreaterThan(0);
    });

    it('should have ray marching implementation in fragment shader', () => {
      lensing.initialize(scene);
      
      const material = lensing.getMaterial();
      expect(material.fragmentShader).toContain('rayMarchLensing');
      expect(material.fragmentShader).toContain('calculateDeflection');
    });

    it('should have Schwarzschild metric implementation', () => {
      lensing.initialize(scene);
      
      const material = lensing.getMaterial();
      expect(material.fragmentShader).toContain('SCHWARZSCHILD');
    });
  });

  describe('Disposal', () => {
    it('should dispose of render target and material', () => {
      lensing.initialize(scene);
      
      lensing.dispose();
      
      expect(lensing.renderTarget).toBeNull();
      expect(lensing.lensingMaterial).toBeNull();
      expect(lensing.quad).toBeNull();
      expect(lensing.scene).toBeNull();
    });

    it('should handle disposal when not initialized', () => {
      expect(() => lensing.dispose()).not.toThrow();
    });
  });
});
