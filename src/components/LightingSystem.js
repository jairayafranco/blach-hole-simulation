import * as THREE from 'three';

/**
 * LightingSystem manages scene lighting including ambient and point lights.
 * Implements Requirement 6.2
 */
export class LightingSystem {
  constructor() {
    this.ambientLight = null;
    this.diskPointLight = null;
    this.lights = [];
  }

  /**
   * Initialize the lighting system
   * @param {Object} config - Configuration object
   * @param {number} config.ambientIntensity - Ambient light intensity (default: 0.2)
   * @param {number} config.ambientColor - Ambient light color (default: 0x404040)
   * @param {number} config.diskLightIntensity - Point light intensity at disk (default: 2.0)
   * @param {number} config.diskLightColor - Point light color (default: 0xff6600)
   * @param {THREE.Vector3} config.diskLightPosition - Point light position (default: origin)
   */
  initialize(config = {}) {
    const {
      ambientIntensity = 0.2,
      ambientColor = 0x404040,
      diskLightIntensity = 2.0,
      diskLightColor = 0xff6600,
      diskLightPosition = new THREE.Vector3(0, 0, 0)
    } = config;

    // Create ambient light for base illumination
    this.ambientLight = new THREE.AmbientLight(ambientColor, ambientIntensity);
    this.ambientLight.name = 'AmbientLight';
    this.lights.push(this.ambientLight);

    // Create point light at disk center for emissive effect
    this.diskPointLight = new THREE.PointLight(diskLightColor, diskLightIntensity);
    this.diskPointLight.position.copy(diskLightPosition);
    this.diskPointLight.name = 'DiskPointLight';
    
    // Configure point light decay and distance
    this.diskPointLight.decay = 2; // Physically accurate inverse square falloff
    this.diskPointLight.distance = 50; // Light influence distance
    
    this.lights.push(this.diskPointLight);
  }

  /**
   * Get all light objects to add to the scene
   * @returns {THREE.Light[]} Array of light objects
   */
  getLights() {
    return this.lights;
  }

  /**
   * Get the ambient light
   * @returns {THREE.AmbientLight} The ambient light
   */
  getAmbientLight() {
    return this.ambientLight;
  }

  /**
   * Get the disk point light
   * @returns {THREE.PointLight} The disk point light
   */
  getDiskPointLight() {
    return this.diskPointLight;
  }

  /**
   * Set ambient light intensity
   * @param {number} intensity - Light intensity
   */
  setAmbientIntensity(intensity) {
    if (this.ambientLight) {
      this.ambientLight.intensity = intensity;
    }
  }

  /**
   * Set ambient light color
   * @param {number|string} color - Light color (hex or string)
   */
  setAmbientColor(color) {
    if (this.ambientLight) {
      this.ambientLight.color.set(color);
    }
  }

  /**
   * Set disk point light intensity
   * @param {number} intensity - Light intensity
   */
  setDiskLightIntensity(intensity) {
    if (this.diskPointLight) {
      this.diskPointLight.intensity = intensity;
    }
  }

  /**
   * Set disk point light color
   * @param {number|string} color - Light color (hex or string)
   */
  setDiskLightColor(color) {
    if (this.diskPointLight) {
      this.diskPointLight.color.set(color);
    }
  }

  /**
   * Set disk point light position
   * @param {THREE.Vector3|number} x - Position vector or x coordinate
   * @param {number} y - Y coordinate (if x is a number)
   * @param {number} z - Z coordinate (if x is a number)
   */
  setDiskLightPosition(x, y, z) {
    if (this.diskPointLight) {
      if (x instanceof THREE.Vector3) {
        this.diskPointLight.position.copy(x);
      } else {
        this.diskPointLight.position.set(x, y, z);
      }
    }
  }

  /**
   * Update lighting (for any dynamic effects)
   * @param {number} deltaTime - Time elapsed since last frame in seconds
   */
  update(deltaTime) {
    // Placeholder for any dynamic lighting effects
    // Currently lights are static, but this allows for future enhancements
    // like pulsing effects or dynamic intensity based on simulation state
  }

  /**
   * Dispose of all resources
   */
  dispose() {
    // Lights don't have dispose methods, but we clear references
    this.lights = [];
    this.ambientLight = null;
    this.diskPointLight = null;
  }
}
