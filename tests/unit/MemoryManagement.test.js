import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { BlackHoleSimulation } from '../../src/BlackHoleSimulation.js';
import * as THREE from 'three';

/**
 * Memory Management Tests
 * 
 * These tests verify that all resources are properly disposed and no memory leaks occur
 * when components are unmounted or the simulation is destroyed.
 * 
 * Implements Requirement 1.5: Proper resource cleanup and disposal
 */
describe('Memory Management', () => {
  let canvas;
  let simulation;

  beforeEach(() => {
    // Create a canvas element for testing
    canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    document.body.appendChild(canvas);
  });

  afterEach(() => {
    // Clean up simulation if it exists
    if (simulation) {
      simulation.dispose();
      simulation = null;
    }

    // Remove canvas from DOM
    if (canvas && canvas.parentElement) {
      canvas.parentElement.removeChild(canvas);
    }
    canvas = null;
  });

  describe('Component Disposal', () => {
    it('should dispose all components when simulation is disposed', async () => {
      simulation = new BlackHoleSimulation();
      await simulation.initialize(canvas, { particleCount: 100 });

      // Spy on dispose methods
      const blackHoleDisposeSpy = vi.spyOn(simulation.blackHoleCore, 'dispose');
      const accretionDiskDisposeSpy = vi.spyOn(simulation.accretionDisk, 'dispose');
      const particleSystemDisposeSpy = vi.spyOn(simulation.particleSystem, 'dispose');
      const starfieldDisposeSpy = vi.spyOn(simulation.starfield, 'dispose');
      const lensingDisposeSpy = vi.spyOn(simulation.gravitationalLensing, 'dispose');
      const lightingDisposeSpy = vi.spyOn(simulation.lightingSystem, 'dispose');

      // Dispose simulation
      simulation.dispose();

      // Verify all dispose methods were called
      expect(blackHoleDisposeSpy).toHaveBeenCalled();
      expect(accretionDiskDisposeSpy).toHaveBeenCalled();
      expect(particleSystemDisposeSpy).toHaveBeenCalled();
      expect(starfieldDisposeSpy).toHaveBeenCalled();
      expect(lensingDisposeSpy).toHaveBeenCalled();
      expect(lightingDisposeSpy).toHaveBeenCalled();
    });

    it('should dispose engine components when simulation is disposed', async () => {
      simulation = new BlackHoleSimulation();
      await simulation.initialize(canvas, { particleCount: 100 });

      // Spy on engine dispose methods
      const sceneDisposeSpy = vi.spyOn(simulation.sceneManager, 'dispose');
      const rendererDisposeSpy = vi.spyOn(simulation.rendererManager, 'dispose');
      const cameraDisposeSpy = vi.spyOn(simulation.cameraController, 'dispose');

      // Dispose simulation
      simulation.dispose();

      // Verify all engine dispose methods were called
      expect(sceneDisposeSpy).toHaveBeenCalled();
      expect(rendererDisposeSpy).toHaveBeenCalled();
      expect(cameraDisposeSpy).toHaveBeenCalled();
    });

    it('should set all component references to null after disposal', async () => {
      simulation = new BlackHoleSimulation();
      await simulation.initialize(canvas, { particleCount: 100 });

      // Dispose simulation
      simulation.dispose();

      // Verify all references are null
      expect(simulation.blackHoleCore).toBeNull();
      expect(simulation.accretionDisk).toBeNull();
      expect(simulation.particleSystem).toBeNull();
      expect(simulation.starfield).toBeNull();
      expect(simulation.gravitationalLensing).toBeNull();
      expect(simulation.lightingSystem).toBeNull();
      expect(simulation.sceneManager).toBeNull();
      expect(simulation.rendererManager).toBeNull();
      expect(simulation.cameraController).toBeNull();
      expect(simulation.configManager).toBeNull();
    });

    it('should stop animation loop when disposed', async () => {
      simulation = new BlackHoleSimulation();
      await simulation.initialize(canvas, { particleCount: 100 });

      // Start animation
      simulation.start();
      expect(simulation.isRunning).toBe(true);

      // Dispose simulation
      simulation.dispose();

      // Verify animation stopped
      expect(simulation.isRunning).toBe(false);
      expect(simulation.animationFrameId).toBeNull();
    });

    it('should remove event listeners when disposed', async () => {
      simulation = new BlackHoleSimulation();
      await simulation.initialize(canvas, { particleCount: 100 });

      // Spy on removeEventListener
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

      // Dispose simulation
      simulation.dispose();

      // Verify resize listener was removed
      expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', simulation.handleResize);

      removeEventListenerSpy.mockRestore();
    });
  });

  describe('Geometry and Material Disposal', () => {
    it('should dispose geometries when components are disposed', async () => {
      simulation = new BlackHoleSimulation();
      await simulation.initialize(canvas, { particleCount: 100 });

      // Get references to geometries
      const blackHoleGeometry = simulation.blackHoleCore.mesh.geometry;
      const diskGeometry = simulation.accretionDisk.mesh.geometry;
      const particleGeometry = simulation.particleSystem.particles.geometry;

      // Spy on geometry dispose methods
      const blackHoleGeomDisposeSpy = vi.spyOn(blackHoleGeometry, 'dispose');
      const diskGeomDisposeSpy = vi.spyOn(diskGeometry, 'dispose');
      const particleGeomDisposeSpy = vi.spyOn(particleGeometry, 'dispose');

      // Dispose simulation
      simulation.dispose();

      // Verify geometries were disposed
      expect(blackHoleGeomDisposeSpy).toHaveBeenCalled();
      expect(diskGeomDisposeSpy).toHaveBeenCalled();
      expect(particleGeomDisposeSpy).toHaveBeenCalled();
    });

    it('should dispose materials when components are disposed', async () => {
      simulation = new BlackHoleSimulation();
      await simulation.initialize(canvas, { particleCount: 100 });

      // Get references to materials
      const blackHoleMaterial = simulation.blackHoleCore.material;
      const diskMaterial = simulation.accretionDisk.material;
      const particleMaterial = simulation.particleSystem.material;

      // Spy on material dispose methods
      const blackHoleMatDisposeSpy = vi.spyOn(blackHoleMaterial, 'dispose');
      const diskMatDisposeSpy = vi.spyOn(diskMaterial, 'dispose');
      const particleMatDisposeSpy = vi.spyOn(particleMaterial, 'dispose');

      // Dispose simulation
      simulation.dispose();

      // Verify materials were disposed
      expect(blackHoleMatDisposeSpy).toHaveBeenCalled();
      expect(diskMatDisposeSpy).toHaveBeenCalled();
      expect(particleMatDisposeSpy).toHaveBeenCalled();
    });
  });

  describe('Remounting', () => {
    it('should allow reinitialization after disposal', async () => {
      simulation = new BlackHoleSimulation();
      
      // Initialize, dispose, and reinitialize
      await simulation.initialize(canvas, { particleCount: 100 });
      simulation.dispose();
      
      // Create new simulation instance
      simulation = new BlackHoleSimulation();
      await simulation.initialize(canvas, { particleCount: 100 });

      // Verify simulation is functional
      expect(simulation.sceneManager).not.toBeNull();
      expect(simulation.rendererManager).not.toBeNull();
      expect(simulation.blackHoleCore).not.toBeNull();
    });

    it('should handle multiple mount/unmount cycles', async () => {
      for (let i = 0; i < 3; i++) {
        simulation = new BlackHoleSimulation();
        await simulation.initialize(canvas, { particleCount: 100 });
        
        // Start and run for a bit
        simulation.start();
        await new Promise(resolve => setTimeout(resolve, 50));
        
        // Dispose
        simulation.dispose();
        simulation = null;
      }

      // If we get here without errors, the test passes
      expect(true).toBe(true);
    });
  });

  describe('Performance Monitoring Cleanup', () => {
    it('should stop performance monitor when disposed', async () => {
      simulation = new BlackHoleSimulation();
      await simulation.initialize(canvas, { particleCount: 100 });

      // Start simulation to activate performance monitor
      simulation.start();
      expect(simulation.performanceMonitor).not.toBeNull();

      // Spy on performance monitor stop
      const stopSpy = vi.spyOn(simulation.performanceMonitor, 'stop');

      // Dispose simulation
      simulation.dispose();

      // Verify performance monitor was stopped
      expect(stopSpy).toHaveBeenCalled();
      expect(simulation.performanceMonitor).toBeNull();
    });

    it('should stop performance profiler when disposed', async () => {
      simulation = new BlackHoleSimulation();
      await simulation.initialize(canvas, { particleCount: 100, enableProfiling: true });

      expect(simulation.performanceProfiler).not.toBeNull();

      // Spy on performance profiler stop
      const stopSpy = vi.spyOn(simulation.performanceProfiler, 'stop');

      // Dispose simulation
      simulation.dispose();

      // Verify performance profiler was stopped
      expect(stopSpy).toHaveBeenCalled();
      expect(simulation.performanceProfiler).toBeNull();
    });
  });

  describe('WebGL Context Cleanup', () => {
    it('should remove WebGL context event listeners when disposed', async () => {
      simulation = new BlackHoleSimulation();
      await simulation.initialize(canvas, { particleCount: 100 });

      // Spy on canvas removeEventListener
      const removeEventListenerSpy = vi.spyOn(canvas, 'removeEventListener');

      // Dispose simulation
      simulation.dispose();

      // Verify context loss listeners were removed
      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'webglcontextlost',
        expect.any(Function),
        false
      );
      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'webglcontextrestored',
        expect.any(Function),
        false
      );

      removeEventListenerSpy.mockRestore();
    });
  });
});
