import * as THREE from 'three';
import { SceneManager } from './engine/SceneManager.js';
import { RendererManager } from './engine/RendererManager.js';
import { CameraController } from './engine/CameraController.js';
import { ConfigurationManager } from './engine/ConfigurationManager.js';
import { BlackHoleCore } from './components/BlackHoleCore.js';
import { AccretionDisk } from './components/AccretionDisk.js';
import { ParticleSystem } from './components/ParticleSystem.js';
import { GravitationalLensing } from './components/GravitationalLensing.js';
import { Starfield } from './components/Starfield.js';
import { LightingSystem } from './components/LightingSystem.js';
import { PerformanceMonitor } from './utils/PerformanceMonitor.js';

/**
 * BlackHoleSimulation is the main class that integrates all components
 * and manages the complete black hole visualization system.
 * 
 * Implements Requirements:
 * - 1.1: Render spherical event horizon
 * - 1.2: Display rotating accretion disk
 * - 1.5: Initialize Three.js renderer
 * - 8.1, 8.2: Responsive resize handling
 * - 8.4: Performance optimizations for small viewports
 * - 9.1-9.5: Configuration system integration
 */
export class BlackHoleSimulation {
  constructor() {
    // Core engine components
    this.sceneManager = null;
    this.rendererManager = null;
    this.cameraController = null;
    this.configManager = null;

    // Simulation components
    this.blackHoleCore = null;
    this.accretionDisk = null;
    this.particleSystem = null;
    this.gravitationalLensing = null;
    this.starfield = null;
    this.lightingSystem = null;

    // Performance monitoring
    this.performanceMonitor = null;
    this.performanceNotificationCallback = null;

    // Animation state
    this.animationFrameId = null;
    this.isRunning = false;

    // Black hole parameters
    this.blackHolePosition = new THREE.Vector3(0, 0, 0);
    this.eventHorizonRadius = 1.0;

    // Resize handler binding
    this.handleResize = this.handleResize.bind(this);
  }

  /**
   * Initialize the complete simulation system
   * @param {HTMLCanvasElement} canvas - The canvas element to render to
   * @param {Object} config - Initial configuration options
   * @returns {Promise<void>}
   */
  async initialize(canvas, config = {}) {
    if (!canvas) {
      throw new Error('Canvas element is required for simulation initialization');
    }

    try {
      // Initialize in proper order to ensure dependencies are met

      // 1. Initialize configuration manager first
      this.configManager = new ConfigurationManager();
      this.configManager.initialize(config);

      // 2. Initialize core engine components
      this.sceneManager = new SceneManager();
      this.sceneManager.initialize();

      this.rendererManager = new RendererManager();
      this.rendererManager.initialize(canvas);

      this.cameraController = new CameraController();
      this.cameraController.initialize(canvas, {
        fov: 75,
        aspect: canvas.clientWidth / canvas.clientHeight,
        near: 0.1,
        far: 1000
      });

      // Set camera constraints to prevent clipping through event horizon
      this.cameraController.setConstraints(5, 100);

      // 3. Initialize simulation components
      this.blackHoleCore = new BlackHoleCore();
      this.blackHoleCore.initialize(this.eventHorizonRadius);
      this.sceneManager.addObject(this.blackHoleCore.mesh);

      this.accretionDisk = new AccretionDisk();
      this.accretionDisk.initialize(1.5, 4.0);
      this.sceneManager.addObject(this.accretionDisk.mesh);

      const currentConfig = this.configManager.getConfig();
      this.particleSystem = new ParticleSystem();
      this.particleSystem.initialize(
        currentConfig.particleCount,
        8.0,
        this.eventHorizonRadius
      );
      this.sceneManager.addObject(this.particleSystem.particles);

      // 4. Initialize visual effects
      this.starfield = new Starfield();
      this.starfield.initialize(2000, 100);
      this.sceneManager.addObject(this.starfield.points);

      this.lightingSystem = new LightingSystem();
      this.lightingSystem.initialize({
        ambientIntensity: 0.2,
        ambientColor: 0x404040,
        diskLightIntensity: 2.0,
        diskLightColor: 0xff6600,
        diskLightPosition: this.blackHolePosition
      });

      // Add lights to scene
      const lights = this.lightingSystem.getLights();
      lights.forEach(light => this.sceneManager.addObject(light));

      // 5. Initialize gravitational lensing
      this.gravitationalLensing = new GravitationalLensing();
      this.gravitationalLensing.initialize(
        this.sceneManager.scene,
        this.eventHorizonRadius
      );

      // 6. Set up post-processing pipeline
      this.rendererManager.enablePostProcessing(
        this.sceneManager.scene,
        this.cameraController.camera
      );

      // Enable bloom effect
      this.rendererManager.enableBloom(
        currentConfig.bloomStrength,
        0.4,
        0.85
      );

      // 7. Set up WebGL context loss handling
      this.setupContextLossHandling();

      // 8. Set up performance monitoring
      this.setupPerformanceMonitoring();

      // 9. Wire up configuration system
      this.wireConfigurationSystem();

      // 10. Set up resize handling
      window.addEventListener('resize', this.handleResize);

      // Apply initial performance optimizations based on viewport
      this.configManager.applyPerformanceOptimizations(canvas.clientWidth);

      console.log('Black Hole Simulation initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Black Hole Simulation:', error);
      throw error;
    }
  }

  /**
   * Set up WebGL context loss handling
   * Implements Requirement 1.5: Handle WebGL context loss gracefully
   */
  setupContextLossHandling() {
    if (!this.rendererManager) {
      return;
    }

    // Register context lost callback
    this.rendererManager.onContextLost(() => {
      console.warn('Black Hole Simulation: WebGL context lost, pausing animation');
      this.stop();
      
      // Stop performance monitoring during context loss
      if (this.performanceMonitor) {
        this.performanceMonitor.stop();
      }
    });

    // Register context restored callback
    this.rendererManager.onContextRestored(() => {
      console.log('Black Hole Simulation: WebGL context restored, attempting to restart');
      
      try {
        // Restart animation
        this.start();
        
        // Resume performance monitoring
        if (this.performanceMonitor) {
          this.performanceMonitor.start();
        }
        
        console.log('Black Hole Simulation: Successfully recovered from context loss');
      } catch (error) {
        console.error('Black Hole Simulation: Failed to recover from context loss', error);
      }
    });
  }

  /**
   * Set up performance monitoring and auto-adjustment
   * Implements Requirements 1.4, 3.4: Monitor performance and auto-adjust particle count
   */
  setupPerformanceMonitoring() {
    this.performanceMonitor = new PerformanceMonitor(60);

    // Register degradation callback
    this.performanceMonitor.onDegradation((stats) => {
      console.warn('Performance degradation detected:', stats);
      
      const recommendation = stats.recommendation;
      
      if (recommendation.action !== 'none' && this.particleSystem && this.configManager) {
        const currentConfig = this.configManager.getConfig();
        const currentParticleCount = currentConfig.particleCount;
        const newParticleCount = Math.max(
          100, // Minimum particle count
          Math.floor(currentParticleCount * (1 - recommendation.reduction))
        );
        
        console.log(`Auto-reducing particle count from ${currentParticleCount} to ${newParticleCount}`);
        
        // Update configuration
        this.configManager.updateConfig({
          particleCount: newParticleCount
        });
        
        // Notify user if callback is registered
        if (this.performanceNotificationCallback) {
          this.performanceNotificationCallback({
            type: 'degradation',
            message: `Performance mode adjusted: Reduced particle count to ${newParticleCount}`,
            stats: stats
          });
        }
      }
    });

    // Register recovery callback
    this.performanceMonitor.onRecovery((stats) => {
      console.log('Performance recovered:', stats);
      
      // Optionally notify user of recovery
      if (this.performanceNotificationCallback) {
        this.performanceNotificationCallback({
          type: 'recovery',
          message: 'Performance has recovered',
          stats: stats
        });
      }
    });
  }

  /**
   * Register a callback for performance notifications
   * @param {Function} callback - Function to call when performance changes
   */
  onPerformanceNotification(callback) {
    this.performanceNotificationCallback = callback;
  }

  /**
   * Get current performance statistics
   * @returns {Object} Performance statistics
   */
  getPerformanceStats() {
    if (!this.performanceMonitor) {
      return null;
    }
    return this.performanceMonitor.getStats();
  }

  /**
   * Wire up the configuration system to all components
   * Connects ConfigurationManager to components and sets up change handlers
   */
  wireConfigurationSystem() {
    // Register configuration change listener
    this.configManager.addListener((updates) => {
      // Handle particle count changes
      if (updates.particleCount !== undefined && this.particleSystem) {
        this.particleSystem.setParticleCount(updates.particleCount);
      }

      // Handle disk rotation speed changes
      if (updates.diskRotationSpeed !== undefined && this.accretionDisk) {
        this.accretionDisk.setRotationSpeed(updates.diskRotationSpeed);
      }

      // Handle lensing intensity changes
      if (updates.lensingIntensity !== undefined && this.gravitationalLensing) {
        this.gravitationalLensing.setIntensity(updates.lensingIntensity);
      }

      // Handle camera sensitivity changes
      if (updates.cameraSensitivity !== undefined && this.cameraController) {
        const controls = this.cameraController.getControls();
        if (controls) {
          // Adjust rotation and zoom speed based on sensitivity
          controls.rotateSpeed = updates.cameraSensitivity;
          controls.zoomSpeed = updates.cameraSensitivity;
        }
      }

      // Handle bloom strength changes
      if (updates.bloomStrength !== undefined && this.rendererManager) {
        this.rendererManager.setBloomStrength(updates.bloomStrength);
      }
    });
  }

  /**
   * Handle window resize events
   * Updates renderer, camera, and applies performance optimizations
   */
  handleResize() {
    if (!this.rendererManager || !this.cameraController) {
      return;
    }

    const canvas = this.rendererManager.renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    // Update renderer dimensions
    this.rendererManager.setSize(width, height);

    // Update camera aspect ratio
    this.cameraController.setAspect(width / height);

    // Update gravitational lensing render target
    if (this.gravitationalLensing) {
      this.gravitationalLensing.resize(width, height);
    }

    // Apply performance optimizations for small viewports
    if (this.configManager) {
      this.configManager.applyPerformanceOptimizations(width);
    }
  }

  /**
   * Start the animation loop
   */
  start() {
    if (this.isRunning) {
      return;
    }

    this.isRunning = true;
    
    // Start performance monitoring
    if (this.performanceMonitor) {
      this.performanceMonitor.start();
    }
    
    this.animate();
  }

  /**
   * Stop the animation loop
   */
  stop() {
    this.isRunning = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    
    // Stop performance monitoring
    if (this.performanceMonitor) {
      this.performanceMonitor.stop();
    }
  }

  /**
   * Main animation loop with delta time calculation
   * Updates all components and renders the scene
   */
  animate() {
    if (!this.isRunning) {
      return;
    }

    // Request next frame
    this.animationFrameId = requestAnimationFrame(() => this.animate());

    // Get delta time from scene manager's clock
    const deltaTime = this.sceneManager.getDeltaTime();

    // Update all components
    this.update(deltaTime);

    // Render the scene
    this.render();

    // Record frame for performance monitoring
    if (this.performanceMonitor) {
      this.performanceMonitor.recordFrame();
    }
  }

  /**
   * Update all simulation components
   * @param {number} deltaTime - Time elapsed since last frame in seconds
   */
  update(deltaTime) {
    // Update camera controls (applies damping)
    if (this.cameraController) {
      this.cameraController.update(deltaTime);
    }

    // Update black hole core animation
    if (this.blackHoleCore) {
      this.blackHoleCore.update(deltaTime);
    }

    // Update accretion disk rotation
    if (this.accretionDisk) {
      this.accretionDisk.update(deltaTime);
    }

    // Update particle system physics
    if (this.particleSystem) {
      this.particleSystem.update(deltaTime, this.blackHolePosition);
    }

    // Update starfield twinkling
    if (this.starfield) {
      this.starfield.update(deltaTime);
    }

    // Update lighting system (for any dynamic effects)
    if (this.lightingSystem) {
      this.lightingSystem.update(deltaTime);
    }

    // Update gravitational lensing with current camera position
    if (this.gravitationalLensing && this.cameraController) {
      this.gravitationalLensing.update(
        this.cameraController.camera.position,
        this.blackHolePosition
      );
    }

    // Update scene manager (calls update on any managed objects)
    if (this.sceneManager) {
      this.sceneManager.update(deltaTime);
    }
  }

  /**
   * Render the scene
   */
  render() {
    if (!this.rendererManager || !this.sceneManager || !this.cameraController) {
      return;
    }

    // Render using the renderer manager (handles post-processing)
    this.rendererManager.render(
      this.sceneManager.scene,
      this.cameraController.camera
    );
  }

  /**
   * Update configuration parameters
   * @param {Object} updates - Configuration updates to apply
   * @returns {Object} The updated configuration
   */
  updateConfig(updates) {
    if (!this.configManager) {
      throw new Error('Configuration manager not initialized');
    }
    return this.configManager.updateConfig(updates);
  }

  /**
   * Get the current configuration
   * @returns {Object} The current configuration
   */
  getConfig() {
    if (!this.configManager) {
      throw new Error('Configuration manager not initialized');
    }
    return this.configManager.getConfig();
  }

  /**
   * Get the scene manager
   * @returns {SceneManager} The scene manager
   */
  getSceneManager() {
    return this.sceneManager;
  }

  /**
   * Get the renderer manager
   * @returns {RendererManager} The renderer manager
   */
  getRendererManager() {
    return this.rendererManager;
  }

  /**
   * Get the camera controller
   * @returns {CameraController} The camera controller
   */
  getCameraController() {
    return this.cameraController;
  }

  /**
   * Dispose of all resources and clean up
   */
  dispose() {
    // Stop animation loop
    this.stop();

    // Remove event listeners
    window.removeEventListener('resize', this.handleResize);

    // Dispose of all components in reverse order of initialization
    if (this.gravitationalLensing) {
      this.gravitationalLensing.dispose();
      this.gravitationalLensing = null;
    }

    if (this.lightingSystem) {
      this.lightingSystem.dispose();
      this.lightingSystem = null;
    }

    if (this.starfield) {
      this.starfield.dispose();
      this.starfield = null;
    }

    if (this.particleSystem) {
      this.particleSystem.dispose();
      this.particleSystem = null;
    }

    if (this.accretionDisk) {
      this.accretionDisk.dispose();
      this.accretionDisk = null;
    }

    if (this.blackHoleCore) {
      this.blackHoleCore.dispose();
      this.blackHoleCore = null;
    }

    if (this.cameraController) {
      this.cameraController.dispose();
      this.cameraController = null;
    }

    if (this.rendererManager) {
      this.rendererManager.dispose();
      this.rendererManager = null;
    }

    if (this.sceneManager) {
      this.sceneManager.dispose();
      this.sceneManager = null;
    }

    if (this.configManager) {
      this.configManager.reset();
      this.configManager = null;
    }

    if (this.performanceMonitor) {
      this.performanceMonitor.stop();
      this.performanceMonitor = null;
    }

    this.performanceNotificationCallback = null;

    console.log('Black Hole Simulation disposed');
  }
}
