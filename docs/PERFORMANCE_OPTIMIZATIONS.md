# Performance Optimizations

This document outlines the performance optimizations implemented in the Black Hole Simulation to ensure smooth rendering and efficient resource usage.

## Implemented Optimizations

### 1. Shader Optimizations

#### Particle System Shader
- **Squared Distance Calculations**: Replaced `length()` with `dot()` for distance calculations in fragment shader to avoid expensive square root operations
- **Optimized Alpha Blending**: Use squared distance thresholds (0.09 and 0.25 instead of 0.3 and 0.5) to avoid sqrt calculations

#### Gravitational Lensing Shader
- **Reduced Ray Marching Steps**: Decreased from 32 to 16 steps for better performance
- **Increased Step Size**: Changed from 0.5 to 1.0 to reduce iteration count while maintaining visual quality
- **Conditional Execution**: Only apply lensing near the black hole (screen distance < 0.5) to save performance

### 2. Geometry Optimizations

#### Buffer Geometry Usage Hints
- **Dynamic Draw Usage**: Set position and color attributes to `THREE.DynamicDrawUsage` for frequently updated particle data
- **Static Draw Usage**: Set size attribute to `THREE.StaticDrawUsage` since particle sizes don't change
- **Bounding Sphere Computation**: Compute and update bounding spheres for efficient frustum culling

#### Frustum Culling
- **Enabled on All Meshes**: Explicitly enabled frustum culling on:
  - Particle System
  - Accretion Disk
  - Black Hole Core
- **Automatic Culling**: Objects outside the camera frustum are not rendered, reducing draw calls

### 3. Renderer Optimizations

#### WebGL Context Configuration
- **Disabled Stencil Buffer**: Set `stencil: false` since stencil operations aren't needed
- **Optimized Depth Buffer**: Kept depth buffer enabled but disabled logarithmic depth buffer for better performance
- **High Performance Mode**: Set `powerPreference: 'high-performance'` to request dedicated GPU

#### Pixel Ratio Management
- **Capped Pixel Ratio**: Limited to `Math.min(window.devicePixelRatio, 2)` to prevent excessive rendering on high-DPI displays
- **Dynamic Adjustment**: Can be reduced to 1.0 in performance mode

#### Render Settings
- **Object Sorting**: Enabled for better transparency handling
- **Auto-reset Info**: Automatically reset render info each frame for accurate metrics

### 4. Performance Monitoring

#### PerformanceMonitor
- **Frame Time Tracking**: Monitors frame times over a rolling 60-frame window
- **Automatic Degradation Detection**: Detects when average frame time exceeds 50ms
- **Auto-adjustment**: Automatically reduces particle count by 25% when performance degrades
- **Recovery Detection**: Notifies when performance recovers

#### PerformanceProfiler
- **Detailed Metrics**: Tracks FPS, frame time, draw calls, triangles, points, geometries, textures, and shader programs
- **Averaged Statistics**: Provides averaged metrics over recent samples
- **Performance Recommendations**: Generates actionable recommendations based on current metrics
- **Renderer Integration**: Directly queries Three.js renderer info for accurate statistics

### 5. Viewport-Based Optimization

#### Automatic Performance Scaling
- **Small Viewports** (< 768px): Reduces particle count to 30% of configured value
- **Medium Viewports** (< 1366px): Reduces particle count to 60% of configured value
- **Large Viewports** (≥ 1366px): Uses 100% of configured particle count

#### Responsive Adjustments
- **Resize Handling**: Automatically applies performance optimizations when viewport changes
- **Configuration Preservation**: Stores base particle count to allow proper scaling

### 6. Memory Management

#### Proper Disposal
- **Component Disposal**: All components implement proper `dispose()` methods
- **Geometry Disposal**: All geometries are disposed when components are destroyed
- **Material Disposal**: All materials (including shader materials) are disposed
- **Texture Disposal**: Render targets and textures are properly disposed

#### Event Listener Cleanup
- **Window Resize**: Removed when simulation is disposed
- **WebGL Context Loss**: Context loss/restore listeners removed on disposal
- **Performance Monitoring**: Stopped and cleaned up on disposal

#### Reference Nullification
- **Component References**: All component references set to null after disposal
- **Engine References**: Scene manager, renderer, camera controller nullified
- **Callback References**: Performance notification callbacks cleared

### 7. Draw Call Optimization

#### Geometry Instancing Preparation
- **Buffer Geometry**: All geometries use `BufferGeometry` for efficient GPU memory usage
- **Attribute Optimization**: Minimized attribute updates by using appropriate usage hints
- **Shared Materials**: Materials can be shared where appropriate to reduce shader program count

## Performance Targets

- **Minimum FPS**: 30 FPS under normal conditions
- **Target FPS**: 60 FPS on modern hardware
- **Particle Count Range**: 100-5000 particles (configurable)
- **Draw Calls**: Optimized to minimize draw calls through geometry batching

## Monitoring Performance

### Enable Profiling
```javascript
const simulation = new BlackHoleSimulation();
await simulation.initialize(canvas, { enableProfiling: true });
```

### Get Performance Metrics
```javascript
// Get current performance stats
const stats = simulation.getPerformanceStats();

// Get detailed performance profile
const profile = simulation.getPerformanceProfile();

// Log performance report to console
simulation.logPerformanceReport();

// Get performance recommendations
const recommendations = simulation.getPerformanceRecommendations();
```

### Performance Report Example
```
Performance Report:
------------------
FPS: 58.42 (avg over 60 frames)
Frame Time: 17.12ms
Draw Calls: 8
Triangles: 16384
Points: 1000
Geometries: 5
Textures: 2
Shader Programs: 5
```

## Future Optimization Opportunities

1. **Geometry Instancing**: Convert particle system to use `InstancedMesh` for even better performance
2. **Level of Detail (LOD)**: Implement LOD system for accretion disk and black hole core
3. **Texture Compression**: Use compressed texture formats where supported
4. **Web Workers**: Offload particle physics calculations to web workers
5. **GPU Compute**: Use compute shaders for particle physics (WebGPU)
6. **Occlusion Culling**: Implement occlusion culling for objects behind the black hole

## Browser Compatibility

Optimizations are compatible with:
- Chrome 56+
- Firefox 51+
- Safari 15+
- Edge 79+

WebGL 2.0 is recommended for best performance, with fallback to WebGL 1.0 supported.
