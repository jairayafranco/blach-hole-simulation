import * as THREE from 'three';
import { createShaderMaterial } from '../utils/ShaderUtils.js';

/**
 * AccretionDisk renders the rotating disk with differential rotation and heat gradients.
 * Implements Requirements 1.2, 5.1, 5.2, 5.3, 5.4, 5.5
 */
export class AccretionDisk {
  constructor() {
    this.mesh = null;
    this.innerRadius = 1.5;
    this.outerRadius = 4.0;
    this.rotationSpeed = 1.0;
    this.material = null;
  }

  /**
   * Initialize the accretion disk with specified radii
   * @param {number} innerRadius - The inner radius of the disk
   * @param {number} outerRadius - The outer radius of the disk
   */
  initialize(innerRadius = 1.5, outerRadius = 4.0) {
    this.innerRadius = innerRadius;
    this.outerRadius = outerRadius;

    // Create ring geometry with sufficient segments (≥128 radial)
    // Using 128 radial segments and 64 tubular segments for smooth appearance
    const geometry = new THREE.RingGeometry(
      this.innerRadius,
      this.outerRadius,
      128, // radial segments (≥128 as per requirement 5.5)
      64   // tubular segments for smooth circular appearance
    );

    // Create custom shader material (defined in separate method)
    this.material = this.createShaderMaterial();

    // Create the mesh
    this.mesh = new THREE.Mesh(geometry, this.material);
    this.mesh.name = 'AccretionDisk';
    
    // Rotate disk to be horizontal (perpendicular to Y axis)
    this.mesh.rotation.x = -Math.PI / 2;
  }

  /**
   * Create the custom shader material for the accretion disk
   * @returns {THREE.ShaderMaterial} The shader material
   */
  createShaderMaterial() {
    // Shader uniforms
    const uniforms = {
      time: { value: 0.0 },
      innerRadius: { value: this.innerRadius },
      outerRadius: { value: this.outerRadius },
      rotationSpeed: { value: this.rotationSpeed },
      // Temperature gradient colors (hot inner to cool outer)
      hotColor: { value: new THREE.Color(0xffaa00) },  // Orange-yellow (hot)
      coolColor: { value: new THREE.Color(0xff3300) }, // Red (cool)
      emissiveStrength: { value: 2.0 }
    };

    // Vertex shader with differential rotation based on radius
    const vertexShader = `
      uniform float time;
      uniform float innerRadius;
      uniform float outerRadius;
      uniform float rotationSpeed;
      
      varying vec2 vUv;
      varying vec3 vPosition;
      varying float vRadius;
      
      void main() {
        vUv = uv;
        
        // Calculate radius from center for this vertex
        vec3 pos = position;
        float radius = length(pos.xy);
        vRadius = radius;
        
        // Differential rotation: inner regions rotate faster than outer
        // Using Keplerian rotation profile: angular velocity ∝ 1/sqrt(r^3)
        float normalizedRadius = (radius - innerRadius) / (outerRadius - innerRadius);
        float angularVelocity = rotationSpeed / pow(radius, 1.5);
        float rotationAngle = angularVelocity * time;
        
        // Apply rotation around Z axis
        float cosAngle = cos(rotationAngle);
        float sinAngle = sin(rotationAngle);
        
        vec2 rotatedPos;
        rotatedPos.x = pos.x * cosAngle - pos.y * sinAngle;
        rotatedPos.y = pos.x * sinAngle + pos.y * cosAngle;
        
        pos.xy = rotatedPos;
        vPosition = pos;
        
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `;

    // Fragment shader with temperature gradient and effects
    const fragmentShader = `
      uniform float innerRadius;
      uniform float outerRadius;
      uniform vec3 hotColor;
      uniform vec3 coolColor;
      uniform float emissiveStrength;
      
      varying vec2 vUv;
      varying vec3 vPosition;
      varying float vRadius;
      
      void main() {
        // Calculate normalized radius (0 at inner, 1 at outer)
        float normalizedRadius = (vRadius - innerRadius) / (outerRadius - innerRadius);
        
        // Temperature gradient: hot inner to cool outer
        vec3 color = mix(hotColor, coolColor, normalizedRadius);
        
        // Emissive lighting for heat radiation
        vec3 emissive = color * emissiveStrength;
        
        // Fresnel effect for edge transparency
        vec3 viewDir = normalize(cameraPosition - vPosition);
        vec3 normal = vec3(0.0, 0.0, 1.0); // Disk normal points up
        float fresnel = abs(dot(viewDir, normal));
        
        // Transparency increases toward disk edges (outer radius)
        float baseAlpha = 0.9 - normalizedRadius * 0.6;
        
        // Apply Fresnel for additional edge transparency
        float alpha = baseAlpha * (0.3 + 0.7 * fresnel);
        
        // Combine color with emissive
        vec3 finalColor = color + emissive;
        
        gl_FragColor = vec4(finalColor, alpha);
      }
    `;

    // Use shader utility with error handling and fallback
    return createShaderMaterial({
      uniforms: uniforms,
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      side: THREE.DoubleSide,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    }, 'AccretionDisk');
  }

  /**
   * Update the accretion disk animation
   * @param {number} deltaTime - Time elapsed since last frame in seconds
   */
  update(deltaTime) {
    if (this.material && this.material.uniforms) {
      // Update time uniform for differential rotation animation
      this.material.uniforms.time.value += deltaTime;
    }
  }

  /**
   * Set the rotation speed of the disk
   * @param {number} speed - The rotation speed multiplier
   */
  setRotationSpeed(speed) {
    this.rotationSpeed = speed;
    if (this.material && this.material.uniforms) {
      this.material.uniforms.rotationSpeed.value = speed;
    }
  }

  /**
   * Get the shader material
   * @returns {THREE.ShaderMaterial} The material
   */
  getMaterial() {
    return this.material;
  }

  /**
   * Dispose of all resources
   */
  dispose() {
    if (this.mesh) {
      if (this.mesh.geometry) {
        this.mesh.geometry.dispose();
      }
      if (this.material) {
        this.material.dispose();
      }
      this.mesh = null;
      this.material = null;
    }
  }
}
