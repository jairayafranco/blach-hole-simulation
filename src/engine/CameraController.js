import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

/**
 * CameraController manages camera positioning and user interaction.
 * Handles camera setup, orbit controls, constraints, and smooth damping.
 */
export class CameraController {
  constructor() {
    this.camera = null;
    this.controls = null;
    this.domElement = null;
  }

  /**
   * Initialize the camera and controls
   * @param {HTMLElement} domElement - The DOM element for control interaction
   * @param {Object} options - Configuration options
   * @param {number} options.fov - Field of view in degrees (default: 75)
   * @param {number} options.aspect - Aspect ratio (default: 1)
   * @param {number} options.near - Near clipping plane (default: 0.1)
   * @param {number} options.far - Far clipping plane (default: 1000)
   */
  initialize(domElement, options = {}) {
    if (!domElement) {
      throw new Error('DOM element is required for camera controller initialization');
    }

    this.domElement = domElement;

    // Create perspective camera with default or provided options
    const {
      fov = 75,
      aspect = 1,
      near = 0.1,
      far = 1000
    } = options;

    this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    
    // Set default camera position
    this.camera.position.set(0, 5, 15);

    // Initialize OrbitControls
    this.controls = new OrbitControls(this.camera, domElement);
    
    // Configure controls for smooth interaction
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.screenSpacePanning = false;
    
    // Set default constraints
    this.controls.minDistance = 5;
    this.controls.maxDistance = 100;
    
    // Set default target (looking at origin)
    this.controls.target.set(0, 0, 0);
  }

  /**
   * Set the camera position
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @param {number} z - Z coordinate
   */
  setPosition(x, y, z) {
    if (!this.camera) {
      throw new Error('CameraController not initialized. Call initialize() first.');
    }
    this.camera.position.set(x, y, z);
  }

  /**
   * Set the camera target (look-at point)
   * @param {THREE.Vector3} target - The target position
   */
  setTarget(target) {
    if (!this.controls) {
      throw new Error('CameraController not initialized. Call initialize() first.');
    }
    this.controls.target.copy(target);
  }

  /**
   * Set distance constraints for the camera
   * @param {number} minDistance - Minimum distance from target
   * @param {number} maxDistance - Maximum distance from target
   */
  setConstraints(minDistance, maxDistance) {
    if (!this.controls) {
      throw new Error('CameraController not initialized. Call initialize() first.');
    }
    this.controls.minDistance = minDistance;
    this.controls.maxDistance = maxDistance;
  }

  /**
   * Set the camera aspect ratio
   * @param {number} aspect - The new aspect ratio (width / height)
   */
  setAspect(aspect) {
    if (!this.camera) {
      throw new Error('CameraController not initialized. Call initialize() first.');
    }
    this.camera.aspect = aspect;
    this.camera.updateProjectionMatrix();
  }

  /**
   * Update the controls (should be called each frame)
   * @param {number} deltaTime - Time elapsed since last frame (unused but kept for interface consistency)
   */
  update(deltaTime) {
    if (!this.controls) {
      throw new Error('CameraController not initialized. Call initialize() first.');
    }
    // OrbitControls.update() applies damping and updates camera position
    this.controls.update();
  }

  /**
   * Get the camera instance
   * @returns {THREE.PerspectiveCamera} The camera
   */
  getCamera() {
    return this.camera;
  }

  /**
   * Get the controls instance
   * @returns {OrbitControls} The controls
   */
  getControls() {
    return this.controls;
  }

  /**
   * Dispose of all resources
   */
  dispose() {
    if (this.controls) {
      this.controls.dispose();
      this.controls = null;
    }
    
    this.camera = null;
    this.domElement = null;
  }
}
