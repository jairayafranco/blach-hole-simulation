import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as THREE from 'three';
import { AccretionDisk } from '../../src/components/AccretionDisk.js';

describe('AccretionDisk', () => {
  let disk;

  beforeEach(() => {
    disk = new AccretionDisk();
  });

  afterEach(() => {
    if (disk) {
      disk.dispose();
    }
  });

  describe('initialization', () => {
    it('should initialize with default radii', () => {
      disk.initialize();
      
      expect(disk.mesh).toBeDefined();
      expect(disk.mesh.name).toBe('AccretionDisk');
      expect(disk.innerRadius).toBe(1.5);
      expect(disk.outerRadius).toBe(4.0);
      expect(disk.material).toBeDefined();
    });

    it('should initialize with custom radii', () => {
      disk.initialize(2.0, 5.0);
      
      expect(disk.innerRadius).toBe(2.0);
      expect(disk.outerRadius).toBe(5.0);
    });

    it('should create ring geometry with at least 128 radial segments', () => {
      disk.initialize();
      
      const geometry = disk.mesh.geometry;
      expect(geometry).toBeInstanceOf(THREE.RingGeometry);
      
      // RingGeometry parameters are stored in the geometry
      const params = geometry.parameters;
      expect(params.thetaSegments).toBeGreaterThanOrEqual(128);
    });

    it('should rotate disk to horizontal orientation', () => {
      disk.initialize();
      
      // Disk should be rotated -90 degrees around X axis
      expect(disk.mesh.rotation.x).toBeCloseTo(-Math.PI / 2);
    });

    it('should create shader material with proper uniforms', () => {
      disk.initialize();
      
      const material = disk.material;
      expect(material).toBeInstanceOf(THREE.ShaderMaterial);
      expect(material.uniforms.time).toBeDefined();
      expect(material.uniforms.innerRadius).toBeDefined();
      expect(material.uniforms.outerRadius).toBeDefined();
      expect(material.uniforms.rotationSpeed).toBeDefined();
    });
  });

  describe('update', () => {
    it('should update time uniform', () => {
      disk.initialize();
      
      const initialTime = disk.material.uniforms.time.value;
      disk.update(0.016); // ~60 FPS frame time
      
      expect(disk.material.uniforms.time.value).toBeGreaterThan(initialTime);
    });

    it('should accumulate time over multiple updates', () => {
      disk.initialize();
      
      disk.update(0.1);
      disk.update(0.1);
      disk.update(0.1);
      
      expect(disk.material.uniforms.time.value).toBeCloseTo(0.3, 5);
    });
  });

  describe('setRotationSpeed', () => {
    it('should update rotation speed', () => {
      disk.initialize();
      
      disk.setRotationSpeed(2.5);
      
      expect(disk.rotationSpeed).toBe(2.5);
      expect(disk.material.uniforms.rotationSpeed.value).toBe(2.5);
    });

    it('should allow changing rotation speed multiple times', () => {
      disk.initialize();
      
      disk.setRotationSpeed(1.0);
      expect(disk.material.uniforms.rotationSpeed.value).toBe(1.0);
      
      disk.setRotationSpeed(3.0);
      expect(disk.material.uniforms.rotationSpeed.value).toBe(3.0);
    });
  });

  describe('getMaterial', () => {
    it('should return the shader material', () => {
      disk.initialize();
      
      const material = disk.getMaterial();
      
      expect(material).toBe(disk.material);
      expect(material).toBeInstanceOf(THREE.ShaderMaterial);
    });
  });

  describe('dispose', () => {
    it('should dispose geometry and material', () => {
      disk.initialize();
      
      const geometry = disk.mesh.geometry;
      const material = disk.material;
      
      disk.dispose();
      
      expect(disk.mesh).toBeNull();
      expect(disk.material).toBeNull();
    });

    it('should handle multiple dispose calls', () => {
      disk.initialize();
      
      disk.dispose();
      disk.dispose(); // Should not throw
      
      expect(disk.mesh).toBeNull();
    });
  });

  describe('shader properties', () => {
    it('should have transparent material with additive blending', () => {
      disk.initialize();
      
      const material = disk.material;
      expect(material.transparent).toBe(true);
      expect(material.blending).toBe(THREE.AdditiveBlending);
      expect(material.depthWrite).toBe(false);
    });

    it('should have double-sided rendering', () => {
      disk.initialize();
      
      expect(disk.material.side).toBe(THREE.DoubleSide);
    });

    it('should have temperature gradient colors defined', () => {
      disk.initialize();
      
      const uniforms = disk.material.uniforms;
      expect(uniforms.hotColor).toBeDefined();
      expect(uniforms.coolColor).toBeDefined();
      expect(uniforms.hotColor.value).toBeInstanceOf(THREE.Color);
      expect(uniforms.coolColor.value).toBeInstanceOf(THREE.Color);
    });
  });
});
