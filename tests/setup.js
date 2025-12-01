// Test setup file for Vitest
// This file runs before all tests

// Mock WebGL context for Three.js tests
global.WebGLRenderingContext = class WebGLRenderingContext {};
global.WebGL2RenderingContext = class WebGL2RenderingContext {};

// Mock HTMLCanvasElement.getContext for Three.js
HTMLCanvasElement.prototype.getContext = function(contextType) {
  if (contextType === 'webgl' || contextType === 'webgl2') {
    return {
      canvas: this,
      drawingBufferWidth: 800,
      drawingBufferHeight: 600,
      getExtension: () => null,
      getParameter: () => null,
      getShaderPrecisionFormat: () => ({ precision: 1 }),
    };
  }
  return null;
};
