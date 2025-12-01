import * as THREE from 'three';

/**
 * GravitationalLensing applies shader-based distortion effects to simulate light bending.
 * Implements Requirements 2.1, 2.2, 2.3, 2.4
 */
export class GravitationalLensing {
  constructor() {
    this.renderTarget = null;
    this.lensingMaterial = null;
    this.intensity = 1.0;
    this.blackHolePosition = new THREE.Vector3(0, 0, 0);
    this.eventHorizonRadius = 1.0;
    this.scene = null;
    this.quad = null;
  }

  /**
   * Initialize the gravitational lensing effect
   * @param {THREE.Scene} scene - The scene to apply lensing to
   * @param {number} eventHorizonRadius - The radius of the black hole's event horizon
   */
  initialize(scene, eventHorizonRadius = 1.0) {
    this.scene = scene;
    this.eventHorizonRadius = eventHorizonRadius;

    // Set up render target for lensing effect
    // This will store the scene before lensing is applied
    this.renderTarget = new THREE.WebGLRenderTarget(
      window.innerWidth,
      window.innerHeight,
      {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat,
        type: THREE.FloatType
      }
    );

    // Create shader material for distortion
    this.lensingMaterial = this.createLensingShader();

    // Create a full-screen quad to apply the lensing effect
    const quadGeometry = new THREE.PlaneGeometry(2, 2);
    this.quad = new THREE.Mesh(quadGeometry, this.lensingMaterial);
  }

  /**
   * Create the gravitational lensing shader
   * @returns {THREE.ShaderMaterial} The lensing shader material
   */
  createLensingShader() {
    const uniforms = {
      tDiffuse: { value: null }, // The scene texture to distort
      cameraPosition: { value: new THREE.Vector3() },
      blackHolePosition: { value: this.blackHolePosition },
      eventHorizonRadius: { value: this.eventHorizonRadius },
      intensity: { value: this.intensity },
      resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) }
    };

    // Vertex shader - simple pass-through for full-screen quad
    const vertexShader = `
      varying vec2 vUv;
      
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;

    // Fragment shader with ray marching and Schwarzschild metric
    const fragmentShader = `
      uniform sampler2D tDiffuse;
      uniform vec3 cameraPosition;
      uniform vec3 blackHolePosition;
      uniform float eventHorizonRadius;
      uniform float intensity;
      uniform vec2 resolution;
      
      varying vec2 vUv;
      
      // Schwarzschild radius (simplified)
      const float SCHWARZSCHILD_MULTIPLIER = 2.0;
      
      // Ray marching parameters
      const int MAX_STEPS = 32;
      const float MAX_DISTANCE = 50.0;
      const float STEP_SIZE = 0.5;
      
      /**
       * Calculate gravitational deflection using simplified Schwarzschild metric
       * @param rayPos Current position along the ray
       * @param rayDir Current ray direction
       * @param bhPos Black hole position
       * @param rs Schwarzschild radius
       * @return Deflection vector to apply to ray direction
       */
      vec3 calculateDeflection(vec3 rayPos, vec3 rayDir, vec3 bhPos, float rs) {
        vec3 toBH = bhPos - rayPos;
        float distance = length(toBH);
        
        // Avoid singularity at event horizon
        if (distance < rs * 1.1) {
          return vec3(0.0);
        }
        
        // Simplified Schwarzschild metric deflection
        // Deflection is proportional to rs/distance^2 and perpendicular to ray
        float deflectionMagnitude = (rs * rs) / (distance * distance * distance);
        
        // Calculate impact parameter (closest approach distance)
        vec3 towardBH = normalize(toBH);
        float impactParam = distance * length(cross(rayDir, towardBH));
        
        // Deflection increases as impact parameter decreases (closer approach)
        deflectionMagnitude *= rs / max(impactParam, rs * 0.5);
        
        // Apply deflection toward black hole
        vec3 deflection = towardBH * deflectionMagnitude;
        
        return deflection;
      }
      
      /**
       * Ray march through gravitational field to find distorted UV coordinates
       * @param rayOrigin Starting position of the ray
       * @param rayDir Initial ray direction
       * @return Distorted UV coordinates
       */
      vec2 rayMarchLensing(vec3 rayOrigin, vec3 rayDir) {
        vec3 currentPos = rayOrigin;
        vec3 currentDir = normalize(rayDir);
        
        // Ray march through the gravitational field
        for (int i = 0; i < MAX_STEPS; i++) {
          float t = float(i) * STEP_SIZE;
          
          if (t > MAX_DISTANCE) break;
          
          // Calculate deflection at current position
          float rs = eventHorizonRadius * SCHWARZSCHILD_MULTIPLIER;
          vec3 deflection = calculateDeflection(currentPos, currentDir, blackHolePosition, rs);
          
          // Apply deflection to ray direction (scaled by intensity)
          currentDir = normalize(currentDir + deflection * intensity * STEP_SIZE);
          
          // Move along deflected ray
          currentPos += currentDir * STEP_SIZE;
        }
        
        // Project final ray direction back to screen space
        // This is a simplified projection - in reality would need proper camera projection
        vec2 distortedUV = vUv + (currentDir.xy - rayDir.xy) * 0.1;
        
        return distortedUV;
      }
      
      void main() {
        // Calculate ray direction from camera through this pixel
        vec2 screenPos = (vUv - 0.5) * 2.0;
        screenPos.x *= resolution.x / resolution.y; // Aspect ratio correction
        
        // Simple ray direction (assumes camera looking down -Z axis)
        vec3 rayDir = normalize(vec3(screenPos, -1.0));
        
        // Calculate distance from camera to black hole
        float distanceToBH = length(cameraPosition - blackHolePosition);
        
        // Calculate screen-space distance from pixel to black hole center
        vec3 bhScreenPos = blackHolePosition - cameraPosition;
        vec2 bhScreenUV = vec2(
          bhScreenPos.x / bhScreenPos.z,
          bhScreenPos.y / bhScreenPos.z
        ) * 0.5 + 0.5;
        
        float screenDistToBH = length(vUv - bhScreenUV);
        
        // Calculate distortion strength based on proximity
        // Distortion is stronger when closer to black hole in screen space
        float proximityFactor = 1.0 / (1.0 + screenDistToBH * 10.0);
        float distortionStrength = proximityFactor * intensity;
        
        // Only apply lensing near the black hole to save performance
        vec2 finalUV = vUv;
        
        if (screenDistToBH < 0.5 && distortionStrength > 0.01) {
          // Perform ray marching for lensing effect
          finalUV = rayMarchLensing(cameraPosition, rayDir);
          
          // Blend between original and distorted based on strength
          finalUV = mix(vUv, finalUV, distortionStrength);
        }
        
        // Clamp UV coordinates to valid range
        finalUV = clamp(finalUV, 0.0, 1.0);
        
        // Sample background with distorted UV coordinates
        vec4 color = texture2D(tDiffuse, finalUV);
        
        // Add slight darkening near event horizon (light absorption)
        if (screenDistToBH < 0.2) {
          float darken = 1.0 - (0.2 - screenDistToBH) * 2.0;
          color.rgb *= darken;
        }
        
        gl_FragColor = color;
      }
    `;

    return new THREE.ShaderMaterial({
      uniforms: uniforms,
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      depthTest: false,
      depthWrite: false
    });
  }

  /**
   * Update method to sync with camera position
   * @param {THREE.Vector3} cameraPosition - Current camera position
   * @param {THREE.Vector3} blackHolePosition - Black hole position (optional, defaults to stored position)
   */
  update(cameraPosition, blackHolePosition = null) {
    if (!this.lensingMaterial || !this.lensingMaterial.uniforms) {
      return;
    }

    // Update camera position uniform
    this.lensingMaterial.uniforms.cameraPosition.value.copy(cameraPosition);

    // Update black hole position if provided
    if (blackHolePosition) {
      this.blackHolePosition.copy(blackHolePosition);
      this.lensingMaterial.uniforms.blackHolePosition.value.copy(blackHolePosition);
    }
  }

  /**
   * Set the intensity of the lensing effect
   * @param {number} intensity - Lensing intensity (0 = no lensing, 1 = normal, >1 = exaggerated)
   */
  setIntensity(intensity) {
    this.intensity = Math.max(0, intensity);
    if (this.lensingMaterial && this.lensingMaterial.uniforms) {
      this.lensingMaterial.uniforms.intensity.value = this.intensity;
    }
  }

  /**
   * Apply the lensing effect to the renderer
   * This should be called as part of the post-processing pipeline
   * @param {THREE.WebGLRenderer} renderer - The WebGL renderer
   * @param {THREE.Scene} scene - The scene to render
   * @param {THREE.Camera} camera - The camera
   */
  apply(renderer, scene, camera) {
    if (!this.renderTarget || !this.lensingMaterial) {
      return;
    }

    // Render scene to render target
    renderer.setRenderTarget(this.renderTarget);
    renderer.render(scene, camera);
    renderer.setRenderTarget(null);

    // Set the rendered scene as the texture to distort
    this.lensingMaterial.uniforms.tDiffuse.value = this.renderTarget.texture;

    // Update camera position
    this.update(camera.position);
  }

  /**
   * Resize the render target when viewport changes
   * @param {number} width - New width
   * @param {number} height - New height
   */
  resize(width, height) {
    if (this.renderTarget) {
      this.renderTarget.setSize(width, height);
    }
    
    if (this.lensingMaterial && this.lensingMaterial.uniforms) {
      this.lensingMaterial.uniforms.resolution.value.set(width, height);
    }
  }

  /**
   * Get the lensing material
   * @returns {THREE.ShaderMaterial} The lensing material
   */
  getMaterial() {
    return this.lensingMaterial;
  }

  /**
   * Dispose of all resources
   */
  dispose() {
    if (this.renderTarget) {
      this.renderTarget.dispose();
      this.renderTarget = null;
    }

    if (this.lensingMaterial) {
      this.lensingMaterial.dispose();
      this.lensingMaterial = null;
    }

    if (this.quad) {
      if (this.quad.geometry) {
        this.quad.geometry.dispose();
      }
      this.quad = null;
    }

    this.scene = null;
  }
}
