import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { LightingSystem } from '../../src/components/LightingSystem.js';
import * as THREE from 'three';

describe('LightingSystem', () => {
  let lightingSystem;

  beforeEach(() => {
    lightingSystem = new LightingSystem();
  });

  afterEach(() => {
    if (lightingSystem) {
      lightingSystem.dispose();
    }
  });

  describe('initialization', () => {
    it('should initialize with default parameters', () => {
      lightingSystem.initialize();

      expect(lightingSystem.ambientLight).toBeInstanceOf(THREE.AmbientLight);
      expect(lightingSystem.diskPointLight).toBeInstanceOf(THREE.PointLight);
      expect(lightingSystem.lights).toHaveLength(2);
    });

    it('should create ambient light with default intensity and color', () => {
      lightingSystem.initialize();

      expect(lightingSystem.ambientLight.intensity).toBe(0.2);
      expect(lightingSystem.ambientLight.color.getHex()).toBe(0x404040);
    });

    it('should create disk point light with default intensity and color', () => {
      lightingSystem.initialize();

      expect(lightingSystem.diskPointLight.intensity).toBe(2.0);
      expect(lightingSystem.diskPointLight.color.getHex()).toBe(0xff6600);
    });

    it('should initialize with custom configuration', () => {
      const config = {
        ambientIntensity: 0.5,
        ambientColor: 0xffffff,
        diskLightIntensity: 3.0,
        diskLightColor: 0xff0000,
        diskLightPosition: new THREE.Vector3(1, 2, 3)
      };

      lightingSystem.initialize(config);

      expect(lightingSystem.ambientLight.intensity).toBe(0.5);
      expect(lightingSystem.ambientLight.color.getHex()).toBe(0xffffff);
      expect(lightingSystem.diskPointLight.intensity).toBe(3.0);
      expect(lightingSystem.diskPointLight.color.getHex()).toBe(0xff0000);
      expect(lightingSystem.diskPointLight.position.x).toBe(1);
      expect(lightingSystem.diskPointLight.position.y).toBe(2);
      expect(lightingSystem.diskPointLight.position.z).toBe(3);
    });

    it('should configure point light with decay and distance', () => {
      lightingSystem.initialize();

      expect(lightingSystem.diskPointLight.decay).toBe(2);
      expect(lightingSystem.diskPointLight.distance).toBe(50);
    });

    it('should name lights appropriately', () => {
      lightingSystem.initialize();

      expect(lightingSystem.ambientLight.name).toBe('AmbientLight');
      expect(lightingSystem.diskPointLight.name).toBe('DiskPointLight');
    });
  });

  describe('getters', () => {
    beforeEach(() => {
      lightingSystem.initialize();
    });

    it('should return all lights', () => {
      const lights = lightingSystem.getLights();

      expect(lights).toHaveLength(2);
      expect(lights[0]).toBe(lightingSystem.ambientLight);
      expect(lights[1]).toBe(lightingSystem.diskPointLight);
    });

    it('should return ambient light', () => {
      const light = lightingSystem.getAmbientLight();

      expect(light).toBe(lightingSystem.ambientLight);
      expect(light).toBeInstanceOf(THREE.AmbientLight);
    });

    it('should return disk point light', () => {
      const light = lightingSystem.getDiskPointLight();

      expect(light).toBe(lightingSystem.diskPointLight);
      expect(light).toBeInstanceOf(THREE.PointLight);
    });
  });

  describe('ambient light configuration', () => {
    beforeEach(() => {
      lightingSystem.initialize();
    });

    it('should set ambient light intensity', () => {
      lightingSystem.setAmbientIntensity(0.8);

      expect(lightingSystem.ambientLight.intensity).toBe(0.8);
    });

    it('should set ambient light color with hex', () => {
      lightingSystem.setAmbientColor(0xff0000);

      expect(lightingSystem.ambientLight.color.getHex()).toBe(0xff0000);
    });

    it('should set ambient light color with string', () => {
      lightingSystem.setAmbientColor('blue');

      expect(lightingSystem.ambientLight.color.getHex()).toBe(0x0000ff);
    });
  });

  describe('disk point light configuration', () => {
    beforeEach(() => {
      lightingSystem.initialize();
    });

    it('should set disk light intensity', () => {
      lightingSystem.setDiskLightIntensity(5.0);

      expect(lightingSystem.diskPointLight.intensity).toBe(5.0);
    });

    it('should set disk light color with hex', () => {
      lightingSystem.setDiskLightColor(0x00ff00);

      expect(lightingSystem.diskPointLight.color.getHex()).toBe(0x00ff00);
    });

    it('should set disk light color with string', () => {
      lightingSystem.setDiskLightColor('red');

      expect(lightingSystem.diskPointLight.color.getHex()).toBe(0xff0000);
    });

    it('should set disk light position with Vector3', () => {
      const position = new THREE.Vector3(5, 10, 15);
      lightingSystem.setDiskLightPosition(position);

      expect(lightingSystem.diskPointLight.position.x).toBe(5);
      expect(lightingSystem.diskPointLight.position.y).toBe(10);
      expect(lightingSystem.diskPointLight.position.z).toBe(15);
    });

    it('should set disk light position with coordinates', () => {
      lightingSystem.setDiskLightPosition(3, 6, 9);

      expect(lightingSystem.diskPointLight.position.x).toBe(3);
      expect(lightingSystem.diskPointLight.position.y).toBe(6);
      expect(lightingSystem.diskPointLight.position.z).toBe(9);
    });
  });

  describe('update', () => {
    it('should handle update without errors', () => {
      lightingSystem.initialize();

      expect(() => lightingSystem.update(0.016)).not.toThrow();
    });
  });

  describe('disposal', () => {
    it('should clear all references', () => {
      lightingSystem.initialize();

      lightingSystem.dispose();

      expect(lightingSystem.lights).toEqual([]);
      expect(lightingSystem.ambientLight).toBeNull();
      expect(lightingSystem.diskPointLight).toBeNull();
    });

    it('should handle disposal when not initialized', () => {
      expect(() => lightingSystem.dispose()).not.toThrow();
    });
  });

  describe('integration', () => {
    it('should create lights that can be added to a scene', () => {
      lightingSystem.initialize();
      const scene = new THREE.Scene();

      const lights = lightingSystem.getLights();
      lights.forEach(light => scene.add(light));

      expect(scene.children).toHaveLength(2);
      expect(scene.children[0]).toBeInstanceOf(THREE.AmbientLight);
      expect(scene.children[1]).toBeInstanceOf(THREE.PointLight);
    });
  });
});
