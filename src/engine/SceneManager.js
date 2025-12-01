import * as THREE from 'three';

/**
 * SceneManager handles the Three.js scene graph and animation loop.
 * Manages scene initialization, object lifecycle, and update coordination.
 */
export class SceneManager {
  constructor() {
    this.scene = null;
    this.clock = null;
    this.objects = new Set();
  }

  /**
   * Initialize the scene and clock
   */
  initialize() {
    this.scene = new THREE.Scene();
    this.clock = new THREE.Clock();
  }

  /**
   * Add an object to the scene and track it
   * @param {THREE.Object3D} object - The Three.js object to add
   */
  addObject(object) {
    if (!this.scene) {
      throw new Error('SceneManager not initialized. Call initialize() first.');
    }
    this.scene.add(object);
    this.objects.add(object);
  }

  /**
   * Remove an object from the scene and stop tracking it
   * @param {THREE.Object3D} object - The Three.js object to remove
   */
  removeObject(object) {
    if (!this.scene) {
      throw new Error('SceneManager not initialized. Call initialize() first.');
    }
    this.scene.remove(object);
    this.objects.delete(object);
  }

  /**
   * Update all managed objects
   * @param {number} deltaTime - Time elapsed since last frame in seconds
   */
  update(deltaTime) {
    // Objects can implement their own update logic
    // This provides a centralized update coordination point
    for (const object of this.objects) {
      if (object.update && typeof object.update === 'function') {
        object.update(deltaTime);
      }
    }
  }

  /**
   * Get the current delta time from the clock
   * @returns {number} Delta time in seconds
   */
  getDeltaTime() {
    return this.clock ? this.clock.getDelta() : 0;
  }

  /**
   * Dispose of all resources
   */
  dispose() {
    // Dispose of all tracked objects
    for (const object of this.objects) {
      if (object.dispose && typeof object.dispose === 'function') {
        object.dispose();
      }
      this.scene.remove(object);
    }
    this.objects.clear();
    
    // Clear scene
    if (this.scene) {
      this.scene.clear();
      this.scene = null;
    }
    
    this.clock = null;
  }
}
