import * as THREE from 'three';

/**
 * Starfield creates a background of stars with subtle twinkling effect.
 * Implements Requirement 6.3
 */
export class Starfield {
  constructor() {
    this.points = null;
    this.geometry = null;
    this.material = null;
    this.starCount = 2000;
  }

  /**
   * Initialize the starfield with random star positions
   * @param {number} starCount - Number of stars to generate (default: 2000)
   * @param {number} radius - Radius of the spherical distribution (default: 100)
   */
  initialize(starCount = 2000, radius = 100) {
    this.starCount = starCount;

    // Create buffer geometry for stars
    this.geometry = new THREE.BufferGeometry();

    // Generate random star positions in spherical distribution
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);
    const sizes = new Float32Array(starCount);
    const twinklePhases = new Float32Array(starCount);

    for (let i = 0; i < starCount; i++) {
      // Generate random position on sphere surface using spherical coordinates
      const theta = Math.random() * Math.PI * 2; // Azimuthal angle
      const phi = Math.acos(2 * Math.random() - 1); // Polar angle (uniform distribution)
      
      // Convert spherical to Cartesian coordinates
      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      // Vary star colors slightly (white to blue-white)
      const colorVariation = 0.8 + Math.random() * 0.2;
      colors[i * 3] = colorVariation; // R
      colors[i * 3 + 1] = colorVariation; // G
      colors[i * 3 + 2] = 1.0; // B (slightly blue-tinted)

      // Vary star sizes
      sizes[i] = 0.5 + Math.random() * 1.5;

      // Random phase for twinkling effect
      twinklePhases[i] = Math.random() * Math.PI * 2;
    }

    this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    this.geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    this.geometry.setAttribute('twinklePhase', new THREE.BufferAttribute(twinklePhases, 1));

    // Create shader material for stars with twinkling
    this.material = this.createStarMaterial();

    // Create Points object
    this.points = new THREE.Points(this.geometry, this.material);
    this.points.name = 'Starfield';
  }

  /**
   * Create custom shader material for stars with twinkling effect
   * @returns {THREE.ShaderMaterial} The shader material
   */
  createStarMaterial() {
    const uniforms = {
      time: { value: 0.0 },
      twinkleSpeed: { value: 0.5 },
      twinkleIntensity: { value: 0.3 }
    };

    const vertexShader = `
      attribute float size;
      attribute float twinklePhase;
      
      uniform float time;
      uniform float twinkleSpeed;
      uniform float twinkleIntensity;
      
      varying vec3 vColor;
      varying float vTwinkle;
      
      void main() {
        vColor = color;
        
        // Calculate twinkling effect
        float twinkle = sin(time * twinkleSpeed + twinklePhase);
        vTwinkle = 1.0 - twinkleIntensity + twinkleIntensity * (twinkle * 0.5 + 0.5);
        
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = size * (300.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
      }
    `;

    const fragmentShader = `
      varying vec3 vColor;
      varying float vTwinkle;
      
      void main() {
        // Create circular star shape
        vec2 center = gl_PointCoord - vec2(0.5);
        float dist = length(center);
        
        if (dist > 0.5) {
          discard;
        }
        
        // Soft falloff from center
        float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
        
        // Apply twinkling
        vec3 finalColor = vColor * vTwinkle;
        
        gl_FragColor = vec4(finalColor, alpha);
      }
    `;

    return new THREE.ShaderMaterial({
      uniforms: uniforms,
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      transparent: true,
      vertexColors: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
  }

  /**
   * Update the starfield animation (twinkling effect)
   * @param {number} deltaTime - Time elapsed since last frame in seconds
   */
  update(deltaTime) {
    if (this.material && this.material.uniforms) {
      this.material.uniforms.time.value += deltaTime;
    }
  }

  /**
   * Set the twinkling speed
   * @param {number} speed - Twinkling speed multiplier
   */
  setTwinkleSpeed(speed) {
    if (this.material && this.material.uniforms) {
      this.material.uniforms.twinkleSpeed.value = speed;
    }
  }

  /**
   * Set the twinkling intensity
   * @param {number} intensity - Twinkling intensity (0-1)
   */
  setTwinkleIntensity(intensity) {
    if (this.material && this.material.uniforms) {
      this.material.uniforms.twinkleIntensity.value = Math.max(0, Math.min(1, intensity));
    }
  }

  /**
   * Dispose of all resources
   */
  dispose() {
    if (this.geometry) {
      this.geometry.dispose();
      this.geometry = null;
    }
    if (this.material) {
      this.material.dispose();
      this.material = null;
    }
    this.points = null;
  }
}
