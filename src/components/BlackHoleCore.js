import * as THREE from 'three';

/**
 * BlackHoleCore renders the event horizon sphere with light absorption effects.
 * Implements Requirements 1.1, 1.3, 6.1
 */
export class BlackHoleCore {
  constructor() {
    this.mesh = null;
    this.radius = 1.0;
    this.material = null;
  }

  /**
   * Initialize the black hole core with specified radius
   * @param {number} radius - The radius of the event horizon
   */
  initialize(radius = 1.0) {
    this.radius = radius;

    // Create spherical geometry for event horizon
    // Using 64 segments for smooth appearance
    const geometry = new THREE.SphereGeometry(this.radius, 64, 64);

    // Create custom shader material (defined in separate method)
    this.material = this.createShaderMaterial();

    // Create the mesh
    this.mesh = new THREE.Mesh(geometry, this.material);
    this.mesh.name = 'BlackHoleCore';
  }

  /**
   * Create the custom shader material for the black hole
   * @returns {THREE.ShaderMaterial} The shader material
   */
  createShaderMaterial() {
    // Shader uniforms
    const uniforms = {
      time: { value: 0.0 },
      radius: { value: this.radius },
      glowColor: { value: new THREE.Color(0x4444ff) },
      glowIntensity: { value: 0.8 }
    };

    // Vertex shader - transforms sphere vertices
    const vertexShader = `
      varying vec3 vNormal;
      varying vec3 vPosition;
      
      void main() {
        vNormal = normalize(normalMatrix * normal);
        vPosition = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;

    // Fragment shader - creates light absorption effect with glow
    const fragmentShader = `
      uniform float time;
      uniform float radius;
      uniform vec3 glowColor;
      uniform float glowIntensity;
      
      varying vec3 vNormal;
      varying vec3 vPosition;
      
      void main() {
        // Calculate view direction
        vec3 viewDir = normalize(cameraPosition - vPosition);
        
        // Fresnel effect for edge glow
        float fresnel = pow(1.0 - abs(dot(viewDir, vNormal)), 3.0);
        
        // Dark center with slight variation
        float centerDarkness = 0.05 + 0.02 * sin(time * 0.5);
        vec3 darkColor = vec3(centerDarkness);
        
        // Glow effect around boundary
        vec3 glow = glowColor * fresnel * glowIntensity;
        
        // Combine dark center with edge glow
        vec3 finalColor = darkColor + glow;
        
        // Add subtle pulsing to the glow
        float pulse = 0.8 + 0.2 * sin(time * 2.0);
        finalColor += glow * pulse * 0.3;
        
        gl_FragColor = vec4(finalColor, 1.0);
      }
    `;

    return new THREE.ShaderMaterial({
      uniforms: uniforms,
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      side: THREE.FrontSide
    });
  }

  /**
   * Update the black hole core animation
   * @param {number} deltaTime - Time elapsed since last frame in seconds
   */
  update(deltaTime) {
    if (this.material && this.material.uniforms) {
      // Update time uniform for animation
      this.material.uniforms.time.value += deltaTime;
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
