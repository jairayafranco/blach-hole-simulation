import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as THREE from 'three';
import { AccretionDisk } from '../../src/components/AccretionDisk.js';

describe('AccretionDisk Shader', () => {
  let disk;

  beforeEach(() => {
    disk = new AccretionDisk();
    disk.initialize(1.5, 4.0);
  });

  afterEach(() => {
    if (disk) {
      disk.dispose();
    }
  });

  describe('Vertex Shader - Differential Rotation', () => {
    it('should have vertex shader with differential rotation logic', () => {
      const material = disk.getMaterial();
      const vertexShader = material.vertexShader;
      
      // Verify differential rotation implementation
      expect(vertexShader).toContain('angularVelocity');
      expect(vertexShader).toContain('rotationAngle');
      expect(vertexShader).toContain('pow(radius, 1.5)'); // Keplerian rotation
    });

    it('should pass radius to fragment shader', () => {
      const material = disk.getMaterial();
      const vertexShader = material.vertexShader;
      
      expect(vertexShader).toContain('varying float vRadius');
      expect(vertexShader).toContain('vRadius = radius');
    });

    it('should use time uniform for animation', () => {
      const material = disk.getMaterial();
      const vertexShader = material.vertexShader;
      
      expect(vertexShader).toContain('uniform float time');
      expect(vertexShader).toContain('time');
    });

    it('should apply rotation transformation', () => {
      const material = disk.getMaterial();
      const vertexShader = material.vertexShader;
      
      // Check for rotation matrix application
      expect(vertexShader).toContain('cos');
      expect(vertexShader).toContain('sin');
      expect(vertexShader).toContain('rotatedPos');
    });
  });

  describe('Fragment Shader - Temperature Gradient', () => {
    it('should have temperature gradient from hot to cool', () => {
      const material = disk.getMaterial();
      const fragmentShader = material.fragmentShader;
      
      expect(fragmentShader).toContain('hotColor');
      expect(fragmentShader).toContain('coolColor');
      expect(fragmentShader).toContain('mix(hotColor, coolColor');
    });

    it('should use normalized radius for gradient', () => {
      const material = disk.getMaterial();
      const fragmentShader = material.fragmentShader;
      
      expect(fragmentShader).toContain('normalizedRadius');
      expect(fragmentShader).toContain('innerRadius');
      expect(fragmentShader).toContain('outerRadius');
    });

    it('should have hot color defined as orange-yellow', () => {
      const material = disk.getMaterial();
      const hotColor = material.uniforms.hotColor.value;
      
      // Orange-yellow color (0xffaa00) - Three.js uses linear color space
      expect(hotColor.r).toBeGreaterThan(0.9);
      expect(hotColor.g).toBeGreaterThan(0.3);
      expect(hotColor.b).toBeLessThan(0.1);
    });

    it('should have cool color defined as red', () => {
      const material = disk.getMaterial();
      const coolColor = material.uniforms.coolColor.value;
      
      // Red color (0xff3300) - Three.js uses linear color space
      expect(coolColor.r).toBeGreaterThan(0.9);
      expect(coolColor.g).toBeLessThan(0.1);
      expect(coolColor.b).toBeLessThan(0.1);
    });
  });

  describe('Fragment Shader - Emissive Lighting', () => {
    it('should implement emissive lighting', () => {
      const material = disk.getMaterial();
      const fragmentShader = material.fragmentShader;
      
      expect(fragmentShader).toContain('emissive');
      expect(fragmentShader).toContain('emissiveStrength');
    });

    it('should have emissive strength uniform', () => {
      const material = disk.getMaterial();
      
      expect(material.uniforms.emissiveStrength).toBeDefined();
      expect(material.uniforms.emissiveStrength.value).toBeGreaterThan(0);
    });

    it('should combine color with emissive', () => {
      const material = disk.getMaterial();
      const fragmentShader = material.fragmentShader;
      
      expect(fragmentShader).toContain('finalColor');
      expect(fragmentShader).toContain('color + emissive');
    });
  });

  describe('Fragment Shader - Transparency Effects', () => {
    it('should implement transparency that increases with radius', () => {
      const material = disk.getMaterial();
      const fragmentShader = material.fragmentShader;
      
      expect(fragmentShader).toContain('alpha');
      expect(fragmentShader).toContain('normalizedRadius');
      // Alpha should decrease as normalized radius increases
      expect(fragmentShader).toContain('0.9 - normalizedRadius');
    });

    it('should have Fresnel effect for edge transparency', () => {
      const material = disk.getMaterial();
      const fragmentShader = material.fragmentShader;
      
      expect(fragmentShader).toContain('fresnel');
      expect(fragmentShader).toContain('viewDir');
      expect(fragmentShader).toContain('dot(viewDir, normal)');
    });

    it('should output alpha channel', () => {
      const material = disk.getMaterial();
      const fragmentShader = material.fragmentShader;
      
      expect(fragmentShader).toContain('gl_FragColor = vec4(finalColor, alpha)');
    });
  });

  describe('Material Properties', () => {
    it('should have transparent material for alpha blending', () => {
      const material = disk.getMaterial();
      
      expect(material.transparent).toBe(true);
    });

    it('should use additive blending for emissive effect', () => {
      const material = disk.getMaterial();
      
      expect(material.blending).toBe(THREE.AdditiveBlending);
    });

    it('should disable depth write for proper transparency', () => {
      const material = disk.getMaterial();
      
      expect(material.depthWrite).toBe(false);
    });

    it('should render both sides of the disk', () => {
      const material = disk.getMaterial();
      
      expect(material.side).toBe(THREE.DoubleSide);
    });
  });

  describe('Shader Uniforms', () => {
    it('should have all required uniforms', () => {
      const material = disk.getMaterial();
      const uniforms = material.uniforms;
      
      expect(uniforms.time).toBeDefined();
      expect(uniforms.innerRadius).toBeDefined();
      expect(uniforms.outerRadius).toBeDefined();
      expect(uniforms.rotationSpeed).toBeDefined();
      expect(uniforms.hotColor).toBeDefined();
      expect(uniforms.coolColor).toBeDefined();
      expect(uniforms.emissiveStrength).toBeDefined();
    });

    it('should initialize uniforms with correct values', () => {
      const material = disk.getMaterial();
      const uniforms = material.uniforms;
      
      expect(uniforms.innerRadius.value).toBe(1.5);
      expect(uniforms.outerRadius.value).toBe(4.0);
      expect(uniforms.rotationSpeed.value).toBe(1.0);
      expect(uniforms.time.value).toBe(0.0);
    });
  });

  describe('Shader Integration', () => {
    it('should update shader uniforms during animation', () => {
      const material = disk.getMaterial();
      const initialTime = material.uniforms.time.value;
      
      disk.update(0.016);
      
      expect(material.uniforms.time.value).toBeGreaterThan(initialTime);
    });

    it('should update rotation speed uniform when changed', () => {
      const material = disk.getMaterial();
      
      disk.setRotationSpeed(2.5);
      
      expect(material.uniforms.rotationSpeed.value).toBe(2.5);
    });
  });
});
