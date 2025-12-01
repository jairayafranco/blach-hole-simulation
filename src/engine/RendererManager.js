import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

/**
 * RendererManager handles WebGL renderer configuration and post-processing.
 * Manages renderer initialization, resize handling, and the post-processing pipeline.
 */
export class RendererManager {
  constructor() {
    this.renderer = null;
    this.composer = null;
    this.renderPass = null;
    this.bloomPass = null;
    this.canvas = null;
  }

  /**
   * Initialize the WebGL renderer with proper settings
   * @param {HTMLCanvasElement} canvas - The canvas element to render to
   */
  initialize(canvas) {
    if (!canvas) {
      throw new Error('Canvas element is required for renderer initialization');
    }

    this.canvas = canvas;

    // Initialize WebGL renderer with optimized settings
    this.renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });

    // Set pixel ratio for sharp rendering on high-DPI displays
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    // Set initial size
    this.setSize(canvas.clientWidth, canvas.clientHeight);

    // Configure renderer properties
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    // Initialize post-processing composer foundation
    this.composer = new EffectComposer(this.renderer);
    
    // Note: RenderPass will be added when we have a scene and camera
    // This is done via enablePostProcessing or directly by the application
  }

  /**
   * Set the renderer and composer size
   * @param {number} width - Width in pixels
   * @param {number} height - Height in pixels
   */
  setSize(width, height) {
    if (!this.renderer) {
      throw new Error('RendererManager not initialized. Call initialize() first.');
    }

    this.renderer.setSize(width, height);
    
    if (this.composer) {
      this.composer.setSize(width, height);
    }
  }

  /**
   * Render the scene
   * @param {THREE.Scene} scene - The scene to render
   * @param {THREE.Camera} camera - The camera to render from
   */
  render(scene, camera) {
    if (!this.renderer) {
      throw new Error('RendererManager not initialized. Call initialize() first.');
    }

    // If composer has passes, use it; otherwise use direct rendering
    if (this.composer && this.composer.passes.length > 0) {
      this.composer.render();
    } else {
      this.renderer.render(scene, camera);
    }
  }

  /**
   * Enable post-processing with the given scene and camera
   * Sets up the base RenderPass for the post-processing pipeline
   * @param {THREE.Scene} scene - The scene to render
   * @param {THREE.Camera} camera - The camera to render from
   */
  enablePostProcessing(scene, camera) {
    if (!this.composer) {
      throw new Error('Composer not initialized. Call initialize() first.');
    }

    // Clear existing passes
    this.composer.passes = [];

    // Add base render pass
    this.renderPass = new RenderPass(scene, camera);
    this.composer.addPass(this.renderPass);
  }

  /**
   * Add a post-processing pass to the composer
   * @param {Pass} pass - The post-processing pass to add
   */
  addPass(pass) {
    if (!this.composer) {
      throw new Error('Composer not initialized. Call initialize() first.');
    }
    this.composer.addPass(pass);
  }

  /**
   * Enable bloom post-processing effect
   * @param {number} strength - Bloom strength (0.0-3.0, default 1.5)
   * @param {number} radius - Bloom radius (default 0.4)
   * @param {number} threshold - Bloom threshold (default 0.85)
   */
  enableBloom(strength = 1.5, radius = 0.4, threshold = 0.85) {
    if (!this.composer) {
      throw new Error('Composer not initialized. Call initialize() first.');
    }

    // Remove existing bloom pass if present
    if (this.bloomPass) {
      this.composer.removePass(this.bloomPass);
    }

    // Create bloom pass with specified parameters
    const resolution = new THREE.Vector2(
      this.canvas.clientWidth,
      this.canvas.clientHeight
    );
    
    this.bloomPass = new UnrealBloomPass(resolution, strength, radius, threshold);
    this.composer.addPass(this.bloomPass);
  }

  /**
   * Update bloom strength
   * @param {number} strength - New bloom strength (0.0-3.0)
   */
  setBloomStrength(strength) {
    if (this.bloomPass) {
      this.bloomPass.strength = strength;
    }
  }

  /**
   * Get the current bloom strength
   * @returns {number|null} Current bloom strength or null if bloom not enabled
   */
  getBloomStrength() {
    return this.bloomPass ? this.bloomPass.strength : null;
  }

  /**
   * Set tone mapping exposure level
   * @param {number} exposure - Exposure level (typically 0.5-2.0, default 1.0)
   */
  setExposure(exposure) {
    if (!this.renderer) {
      throw new Error('RendererManager not initialized. Call initialize() first.');
    }
    this.renderer.toneMappingExposure = exposure;
  }

  /**
   * Get the current tone mapping exposure
   * @returns {number} Current exposure level
   */
  getExposure() {
    return this.renderer ? this.renderer.toneMappingExposure : 1.0;
  }

  /**
   * Set tone mapping type
   * @param {number} toneMapping - Three.js tone mapping constant (e.g., THREE.ACESFilmicToneMapping)
   */
  setToneMapping(toneMapping) {
    if (!this.renderer) {
      throw new Error('RendererManager not initialized. Call initialize() first.');
    }
    this.renderer.toneMapping = toneMapping;
  }

  /**
   * Get the renderer instance
   * @returns {THREE.WebGLRenderer} The renderer
   */
  getRenderer() {
    return this.renderer;
  }

  /**
   * Get the composer instance
   * @returns {EffectComposer} The composer
   */
  getComposer() {
    return this.composer;
  }

  /**
   * Dispose of all resources
   */
  dispose() {
    if (this.composer) {
      this.composer.dispose();
      this.composer = null;
    }

    if (this.renderer) {
      this.renderer.dispose();
      this.renderer = null;
    }

    this.renderPass = null;
    this.bloomPass = null;
    this.canvas = null;
  }
}
