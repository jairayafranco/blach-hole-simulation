import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as THREE from 'three';
import { SceneManager } from '../../src/engine/SceneManager.js';
import { RendererManager } from '../../src/engine/RendererManager.js';
import { CameraController } from '../../src/engine/CameraController.js';
import { ConfigurationManager } from '../../src/engine/ConfigurationManager.js';

describe('SceneManager', () => {
  let sceneManager;

  beforeEach(() => {
    sceneManager = new SceneManager();
  });

  afterEach(() => {
    if (sceneManager) {
      sceneManager.dispose();
    }
  });

  it('should initialize scene and clock', () => {
    sceneManager.initialize();
    expect(sceneManager.scene).toBeInstanceOf(THREE.Scene);
    expect(sceneManager.clock).toBeInstanceOf(THREE.Clock);
  });

  it('should add and remove objects', () => {
    sceneManager.initialize();
    const mesh = new THREE.Mesh();
    
    sceneManager.addObject(mesh);
    expect(sceneManager.scene.children).toContain(mesh);
    expect(sceneManager.objects.has(mesh)).toBe(true);
    
    sceneManager.removeObject(mesh);
    expect(sceneManager.scene.children).not.toContain(mesh);
    expect(sceneManager.objects.has(mesh)).toBe(false);
  });

  it('should call update on objects that have update method', () => {
    sceneManager.initialize();
    const mockObject = new THREE.Object3D();
    mockObject.update = vi.fn();
    
    sceneManager.addObject(mockObject);
    sceneManager.update(0.016);
    
    expect(mockObject.update).toHaveBeenCalledWith(0.016);
  });

  it('should dispose all resources', () => {
    sceneManager.initialize();
    const mesh = new THREE.Mesh();
    mesh.dispose = vi.fn();
    
    sceneManager.addObject(mesh);
    sceneManager.dispose();
    
    expect(mesh.dispose).toHaveBeenCalled();
    expect(sceneManager.scene).toBeNull();
    expect(sceneManager.objects.size).toBe(0);
  });
});

describe('RendererManager', () => {
  let rendererManager;

  beforeEach(() => {
    rendererManager = new RendererManager();
  });

  afterEach(() => {
    if (rendererManager) {
      rendererManager.dispose();
    }
  });

  it('should create instance with null properties', () => {
    expect(rendererManager.renderer).toBeNull();
    expect(rendererManager.composer).toBeNull();
    expect(rendererManager.canvas).toBeNull();
  });

  it('should throw error when initializing without canvas', () => {
    expect(() => rendererManager.initialize(null)).toThrow('Canvas element is required');
  });

  it('should throw error when setting size before initialization', () => {
    expect(() => rendererManager.setSize(800, 600)).toThrow('RendererManager not initialized');
  });

  it('should throw error when rendering before initialization', () => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera();
    expect(() => rendererManager.render(scene, camera)).toThrow('RendererManager not initialized');
  });

  // Note: Actual WebGL rendering tests require a real browser environment
  // These tests verify the API contract and error handling
  // Integration tests in a real browser will verify rendering functionality
});

describe('CameraController', () => {
  let cameraController;
  let domElement;

  beforeEach(() => {
    cameraController = new CameraController();
    domElement = document.createElement('div');
  });

  afterEach(() => {
    if (cameraController) {
      cameraController.dispose();
    }
  });

  it('should initialize camera and controls', () => {
    cameraController.initialize(domElement);
    expect(cameraController.camera).toBeInstanceOf(THREE.PerspectiveCamera);
    expect(cameraController.controls).toBeDefined();
  });

  it('should set camera position', () => {
    cameraController.initialize(domElement);
    cameraController.setPosition(10, 20, 30);
    
    expect(cameraController.camera.position.x).toBe(10);
    expect(cameraController.camera.position.y).toBe(20);
    expect(cameraController.camera.position.z).toBe(30);
  });

  it('should set camera target', () => {
    cameraController.initialize(domElement);
    const target = new THREE.Vector3(5, 5, 5);
    cameraController.setTarget(target);
    
    expect(cameraController.controls.target.x).toBe(5);
    expect(cameraController.controls.target.y).toBe(5);
    expect(cameraController.controls.target.z).toBe(5);
  });

  it('should set distance constraints', () => {
    cameraController.initialize(domElement);
    cameraController.setConstraints(10, 50);
    
    expect(cameraController.controls.minDistance).toBe(10);
    expect(cameraController.controls.maxDistance).toBe(50);
  });

  it('should update aspect ratio', () => {
    cameraController.initialize(domElement);
    cameraController.setAspect(16 / 9);
    
    expect(cameraController.camera.aspect).toBeCloseTo(16 / 9);
  });

  it('should update controls', () => {
    cameraController.initialize(domElement);
    // Just verify update doesn't throw
    expect(() => cameraController.update(0.016)).not.toThrow();
  });

  it('should dispose all resources', () => {
    cameraController.initialize(domElement);
    cameraController.dispose();
    
    expect(cameraController.camera).toBeNull();
    expect(cameraController.controls).toBeNull();
  });
});

describe('ConfigurationManager', () => {
  let configManager;

  beforeEach(() => {
    configManager = new ConfigurationManager();
  });

  describe('initialization', () => {
    it('should initialize with default configuration', () => {
      configManager.initialize();
      const config = configManager.getConfig();
      
      expect(config.particleCount).toBe(1000);
      expect(config.diskRotationSpeed).toBe(1.0);
      expect(config.lensingIntensity).toBe(1.0);
      expect(config.cameraSensitivity).toBe(1.0);
      expect(config.bloomStrength).toBe(1.5);
      expect(config.performanceMode).toBe('high');
    });

    it('should initialize with custom configuration', () => {
      configManager.initialize({
        particleCount: 2000,
        diskRotationSpeed: 2.0,
        lensingIntensity: 0.5
      });
      const config = configManager.getConfig();
      
      expect(config.particleCount).toBe(2000);
      expect(config.diskRotationSpeed).toBe(2.0);
      expect(config.lensingIntensity).toBe(0.5);
    });

    it('should throw error when getting config before initialization', () => {
      expect(() => configManager.getConfig()).toThrow('ConfigurationManager not initialized');
    });
  });

  describe('configuration validation and clamping', () => {
    beforeEach(() => {
      configManager.initialize();
    });

    it('should clamp particle count to minimum bound (100)', () => {
      configManager.updateConfig({ particleCount: 50 });
      expect(configManager.getConfig().particleCount).toBe(100);
    });

    it('should clamp particle count to maximum bound (5000)', () => {
      configManager.updateConfig({ particleCount: 10000 });
      expect(configManager.getConfig().particleCount).toBe(5000);
    });

    it('should accept valid particle count within bounds', () => {
      configManager.updateConfig({ particleCount: 2500 });
      expect(configManager.getConfig().particleCount).toBe(2500);
    });

    it('should clamp disk rotation speed to valid range', () => {
      configManager.updateConfig({ diskRotationSpeed: 0.05 });
      expect(configManager.getConfig().diskRotationSpeed).toBe(0.1);
      
      configManager.updateConfig({ diskRotationSpeed: 10.0 });
      expect(configManager.getConfig().diskRotationSpeed).toBe(5.0);
    });

    it('should clamp lensing intensity to valid range', () => {
      configManager.updateConfig({ lensingIntensity: -1.0 });
      expect(configManager.getConfig().lensingIntensity).toBe(0.0);
      
      configManager.updateConfig({ lensingIntensity: 5.0 });
      expect(configManager.getConfig().lensingIntensity).toBe(2.0);
    });

    it('should clamp camera sensitivity to valid range', () => {
      configManager.updateConfig({ cameraSensitivity: 0.05 });
      expect(configManager.getConfig().cameraSensitivity).toBe(0.1);
      
      configManager.updateConfig({ cameraSensitivity: 3.0 });
      expect(configManager.getConfig().cameraSensitivity).toBe(2.0);
    });

    it('should clamp bloom strength to valid range', () => {
      configManager.updateConfig({ bloomStrength: -0.5 });
      expect(configManager.getConfig().bloomStrength).toBe(0.0);
      
      configManager.updateConfig({ bloomStrength: 5.0 });
      expect(configManager.getConfig().bloomStrength).toBe(3.0);
    });

    it('should validate performance mode', () => {
      configManager.updateConfig({ performanceMode: 'invalid' });
      expect(configManager.getConfig().performanceMode).toBe('high');
    });

    it('should handle invalid numeric values', () => {
      configManager.updateConfig({ particleCount: 'not a number' });
      expect(configManager.getConfig().particleCount).toBe(100); // Falls back to minimum
    });
  });

  describe('configuration updates', () => {
    beforeEach(() => {
      configManager.initialize();
    });

    it('should update configuration without reload', () => {
      const initialConfig = configManager.getConfig();
      configManager.updateConfig({ particleCount: 3000 });
      const updatedConfig = configManager.getConfig();
      
      expect(updatedConfig.particleCount).toBe(3000);
      expect(updatedConfig.diskRotationSpeed).toBe(initialConfig.diskRotationSpeed);
    });

    it('should update multiple parameters at once', () => {
      configManager.updateConfig({
        particleCount: 1500,
        diskRotationSpeed: 2.5,
        lensingIntensity: 1.5
      });
      const config = configManager.getConfig();
      
      expect(config.particleCount).toBe(1500);
      expect(config.diskRotationSpeed).toBe(2.5);
      expect(config.lensingIntensity).toBe(1.5);
    });

    it('should notify listeners on configuration change', () => {
      const listener = vi.fn();
      configManager.addListener(listener);
      
      configManager.updateConfig({ particleCount: 2000 });
      
      expect(listener).toHaveBeenCalledWith(
        { particleCount: 2000 },
        expect.objectContaining({ particleCount: 2000 })
      );
    });

    it('should handle multiple listeners', () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();
      
      configManager.addListener(listener1);
      configManager.addListener(listener2);
      
      configManager.updateConfig({ diskRotationSpeed: 1.5 });
      
      expect(listener1).toHaveBeenCalled();
      expect(listener2).toHaveBeenCalled();
    });

    it('should remove listeners', () => {
      const listener = vi.fn();
      configManager.addListener(listener);
      configManager.removeListener(listener);
      
      configManager.updateConfig({ particleCount: 2000 });
      
      expect(listener).not.toHaveBeenCalled();
    });

    it('should handle listener errors gracefully', () => {
      const errorListener = vi.fn(() => {
        throw new Error('Listener error');
      });
      const goodListener = vi.fn();
      
      configManager.addListener(errorListener);
      configManager.addListener(goodListener);
      
      // Should not throw, and good listener should still be called
      expect(() => configManager.updateConfig({ particleCount: 2000 })).not.toThrow();
      expect(goodListener).toHaveBeenCalled();
    });
  });

  describe('performance optimizations', () => {
    beforeEach(() => {
      configManager.initialize({ particleCount: 3000 });
    });

    it('should apply low performance mode for small viewports', () => {
      configManager.applyPerformanceOptimizations(500);
      const config = configManager.getConfig();
      
      expect(config.performanceMode).toBe('low');
      expect(config.particleCount).toBe(900); // 30% of 3000
    });

    it('should apply medium performance mode for medium viewports', () => {
      configManager.applyPerformanceOptimizations(1000);
      const config = configManager.getConfig();
      
      expect(config.performanceMode).toBe('medium');
      expect(config.particleCount).toBe(1800); // 60% of 3000
    });

    it('should apply high performance mode for large viewports', () => {
      configManager.applyPerformanceOptimizations(1920);
      const config = configManager.getConfig();
      
      expect(config.performanceMode).toBe('high');
      expect(config.particleCount).toBe(3000); // 100% of 3000
    });

    it('should respect minimum particle count bound when scaling', () => {
      configManager.initialize({ particleCount: 200 });
      configManager.applyPerformanceOptimizations(500); // Would be 60 particles (30%)
      
      expect(configManager.getConfig().particleCount).toBe(100); // Clamped to minimum
    });

    it('should preserve base particle count across multiple optimizations', () => {
      configManager.applyPerformanceOptimizations(500);
      expect(configManager.getConfig().particleCount).toBe(900);
      
      configManager.applyPerformanceOptimizations(1920);
      expect(configManager.getConfig().particleCount).toBe(3000); // Back to original
    });
  });

  describe('utility methods', () => {
    beforeEach(() => {
      configManager.initialize();
    });

    it('should reset configuration to defaults', () => {
      configManager.updateConfig({ particleCount: 4000, diskRotationSpeed: 3.0 });
      configManager.reset();
      const config = configManager.getConfig();
      
      expect(config.particleCount).toBe(1000);
      expect(config.diskRotationSpeed).toBe(1.0);
    });

    it('should get bounds for configuration parameters', () => {
      const particleBounds = configManager.getBounds('particleCount');
      expect(particleBounds).toEqual({ min: 100, max: 5000 });
      
      const diskBounds = configManager.getBounds('diskRotationSpeed');
      expect(diskBounds).toEqual({ min: 0.1, max: 5.0 });
    });

    it('should return null for invalid parameter bounds', () => {
      const bounds = configManager.getBounds('invalidParameter');
      expect(bounds).toBeNull();
    });

    it('should throw error when adding non-function listener', () => {
      expect(() => configManager.addListener('not a function')).toThrow('Listener must be a function');
    });
  });
});
