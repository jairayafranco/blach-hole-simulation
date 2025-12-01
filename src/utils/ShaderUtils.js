import * as THREE from 'three';

/**
 * Utility functions for shader compilation with error handling
 * Implements Requirements 1.1, 1.2: Provide fallback materials for shader failures
 */

/**
 * Compile and validate a shader material with error handling
 * @param {Object} shaderConfig - Configuration object with uniforms, vertexShader, fragmentShader, and other material properties
 * @param {string} shaderName - Name of the shader for logging purposes
 * @returns {THREE.ShaderMaterial|THREE.MeshBasicMaterial} The compiled shader or fallback material
 */
export function createShaderMaterial(shaderConfig, shaderName = 'Unknown') {
  try {
    const material = new THREE.ShaderMaterial(shaderConfig);
    
    // Skip WebGL compilation test in non-browser environments (like test environments)
    if (typeof document === 'undefined' || typeof HTMLCanvasElement === 'undefined') {
      // In test environment, just return the material without validation
      return material;
    }
    
    // Test compilation by forcing a render check
    // This will trigger shader compilation and catch errors early
    const testGeometry = new THREE.PlaneGeometry(1, 1);
    const testMesh = new THREE.Mesh(testGeometry, material);
    const testScene = new THREE.Scene();
    testScene.add(testMesh);
    
    // Create a minimal renderer to test compilation
    const testCanvas = document.createElement('canvas');
    let testRenderer;
    
    try {
      testRenderer = new THREE.WebGLRenderer({ canvas: testCanvas });
      const testCamera = new THREE.PerspectiveCamera();
      
      testRenderer.render(testScene, testCamera);
      
      // Check for WebGL errors
      const gl = testRenderer.getContext();
      const error = gl.getError();
      
      if (error !== gl.NO_ERROR) {
        throw new Error(`WebGL error during shader compilation: ${error}`);
      }
      
      // Cleanup test objects
      testGeometry.dispose();
      testRenderer.dispose();
      
      console.log(`Shader "${shaderName}" compiled successfully`);
      return material;
      
    } catch (renderError) {
      // Cleanup test objects
      testGeometry.dispose();
      if (testRenderer) {
        testRenderer.dispose();
      }
      throw renderError;
    }
    
  } catch (error) {
    console.error(`Shader compilation failed for "${shaderName}":`, error);
    console.error('Vertex Shader:', shaderConfig.vertexShader);
    console.error('Fragment Shader:', shaderConfig.fragmentShader);
    
    // Return fallback material
    return createFallbackMaterial(shaderName, shaderConfig);
  }
}

/**
 * Create a fallback material when shader compilation fails
 * @param {string} shaderName - Name of the failed shader
 * @param {Object} shaderConfig - Original shader configuration
 * @returns {THREE.MeshBasicMaterial|THREE.MeshStandardMaterial} Fallback material
 */
function createFallbackMaterial(shaderName, shaderConfig) {
  console.warn(`Using fallback material for "${shaderName}"`);
  
  // Determine appropriate fallback based on shader name
  if (shaderName.toLowerCase().includes('blackhole') || shaderName.toLowerCase().includes('core')) {
    // Dark material with slight glow for black hole
    return new THREE.MeshBasicMaterial({
      color: 0x000033,
      side: shaderConfig.side || THREE.FrontSide
    });
  } else if (shaderName.toLowerCase().includes('disk') || shaderName.toLowerCase().includes('accretion')) {
    // Orange emissive material for accretion disk
    return new THREE.MeshBasicMaterial({
      color: 0xff6600,
      transparent: shaderConfig.transparent || false,
      opacity: 0.7,
      side: shaderConfig.side || THREE.DoubleSide,
      blending: shaderConfig.blending || THREE.NormalBlending
    });
  } else if (shaderName.toLowerCase().includes('particle')) {
    // Simple point material for particles
    return new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.1,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });
  } else if (shaderName.toLowerCase().includes('lensing')) {
    // Transparent material for lensing (essentially disabled)
    return new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide
    });
  } else {
    // Generic fallback
    return new THREE.MeshStandardMaterial({
      color: 0x888888,
      side: shaderConfig.side || THREE.FrontSide
    });
  }
}

/**
 * Validate shader source code for common errors
 * @param {string} vertexShader - Vertex shader source
 * @param {string} fragmentShader - Fragment shader source
 * @param {string} shaderName - Name of the shader for logging
 * @returns {Object} Validation result with isValid flag and errors array
 */
export function validateShaderSource(vertexShader, fragmentShader, shaderName = 'Unknown') {
  const errors = [];
  
  // Check for empty shaders
  if (!vertexShader || vertexShader.trim().length === 0) {
    errors.push('Vertex shader is empty');
  }
  
  if (!fragmentShader || fragmentShader.trim().length === 0) {
    errors.push('Fragment shader is empty');
  }
  
  // Check for main function
  if (vertexShader && !vertexShader.includes('void main()')) {
    errors.push('Vertex shader missing main() function');
  }
  
  if (fragmentShader && !fragmentShader.includes('void main()')) {
    errors.push('Fragment shader missing main() function');
  }
  
  // Check for gl_Position in vertex shader
  if (vertexShader && !vertexShader.includes('gl_Position')) {
    errors.push('Vertex shader missing gl_Position assignment');
  }
  
  // Check for gl_FragColor or gl_FragData in fragment shader
  if (fragmentShader && !fragmentShader.includes('gl_FragColor') && !fragmentShader.includes('gl_FragData')) {
    errors.push('Fragment shader missing gl_FragColor or gl_FragData assignment');
  }
  
  if (errors.length > 0) {
    console.warn(`Shader validation warnings for "${shaderName}":`, errors);
  }
  
  return {
    isValid: errors.length === 0,
    errors: errors
  };
}

/**
 * Log detailed shader compilation info
 * @param {THREE.WebGLRenderer} renderer - The WebGL renderer
 * @param {THREE.ShaderMaterial} material - The shader material to check
 * @param {string} shaderName - Name of the shader for logging
 */
export function logShaderInfo(renderer, material, shaderName = 'Unknown') {
  if (!renderer || !material) {
    return;
  }
  
  try {
    const gl = renderer.getContext();
    const program = renderer.properties.get(material).program;
    
    if (!program) {
      console.warn(`No WebGL program found for shader "${shaderName}"`);
      return;
    }
    
    // Check if program linked successfully
    if (!gl.getProgramParameter(program.program, gl.LINK_STATUS)) {
      const info = gl.getProgramInfoLog(program.program);
      console.error(`Shader program link failed for "${shaderName}":`, info);
    } else {
      console.log(`Shader "${shaderName}" linked successfully`);
    }
    
  } catch (error) {
    console.error(`Error checking shader info for "${shaderName}":`, error);
  }
}
