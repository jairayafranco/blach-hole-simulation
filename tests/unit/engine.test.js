import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as THREE from 'three';
import { SceneManager } from '../../src/engine/SceneManager.js';
import { RendererManager } from '../../src/engine/RendererManager.js';
import { CameraController } from '../../src/engine/CameraController.js';

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
