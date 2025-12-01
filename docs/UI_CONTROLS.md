# Black Hole Simulation UI Controls

This document describes the user interface controls and accessibility features added to the black hole simulation.

## UI Controls Panel

The UI controls panel provides an interactive way to adjust simulation parameters in real-time.

### Features

#### Configuration Sliders

- **Particle Count** (100-5000): Adjust the number of particles in the simulation
- **Disk Rotation Speed** (0.1-5.0): Control how fast the accretion disk rotates
- **Lensing Intensity** (0.0-2.0): Adjust the strength of gravitational lensing effects
- **Camera Sensitivity** (0.1-2.0): Control camera movement responsiveness
- **Bloom Strength** (0.0-3.0): Adjust the intensity of bloom post-processing

#### Pause/Play Button

Toggle the simulation animation on and off without losing your current state.

#### Presets

Quick configuration presets for different viewing experiences:

- **Default**: Balanced settings for general viewing
- **Cinematic**: Slower, more dramatic settings with enhanced visual effects
- **Performance**: Optimized for lower-end devices with reduced particle count
- **Intense**: Maximum visual intensity with high particle count and effects

### Usage

1. Click the gear icon (⚙) in the top-right corner to open the controls panel
2. Adjust sliders to change simulation parameters in real-time
3. Click preset buttons to quickly apply predefined configurations
4. Use the pause/play button to control animation
5. Click the X to close the panel

## Accessibility Features

The simulation includes comprehensive accessibility features to ensure it's usable by everyone.

### Keyboard Controls

Navigate and control the simulation using your keyboard:

- **Arrow Keys**: Rotate the camera view
  - Left/Right: Rotate horizontally
  - Up/Down: Rotate vertically
- **+ / =**: Zoom in
- **- / _**: Zoom out
- **Space**: Pause/Play animation
- **H**: Toggle help and descriptions panel

### Reduced Motion Mode

The simulation automatically detects and respects the `prefers-reduced-motion` system setting:

- Automatically reduces particle count to 300
- Slows down animation speeds
- Reduces camera sensitivity
- Can be manually toggled in the accessibility panel

### Descriptions Panel

Press **H** or click the accessibility icon (♿) in the bottom-right corner to open a panel with:

- **What You're Seeing**: Detailed explanations of the black hole phenomena
- **Keyboard Controls**: Complete list of keyboard shortcuts
- **Mouse Controls**: Instructions for mouse-based navigation
- **Accessibility Options**: Toggle reduced motion and keyboard controls

### Screen Reader Support

- All interactive elements have proper ARIA labels
- Status announcements for important state changes
- Semantic HTML structure for proper navigation

## Implementation Details

### Vanilla Three.js (App.jsx)

The UI controls integrate with the `BlackHoleSimulation` class:

```jsx
<UIControls 
  simulation={simulationRef.current}
  onPresetChange={(preset) => console.log('Preset changed to:', preset)}
/>
<AccessibilityFeatures
  simulation={simulationRef.current}
  cameraController={simulationRef.current.getCameraController()}
/>
```

### React Three Fiber (AppR3F.jsx)

The R3F implementation uses a custom hook for configuration management:

```jsx
const { config, updateConfig, isPaused, togglePause, getBounds } = useSimulationConfig({
  particleCount: 1000,
  diskRotationSpeed: 1.0,
  lensingIntensity: 1.0,
  cameraSensitivity: 1.0,
  bloomStrength: 1.5
});
```

## Responsive Design

The UI adapts to different screen sizes:

- On mobile devices (< 768px), the control panel adjusts its width
- Touch-friendly button sizes
- Scrollable panels for smaller screens

## Browser Compatibility

The UI controls work in all modern browsers that support:

- CSS Grid
- CSS Custom Properties
- ES6+ JavaScript
- WebGL 2.0

## Customization

### Styling

All styles are contained in:
- `src/components/UIControls.css`
- `src/components/AccessibilityFeatures.css`

You can customize colors, sizes, and animations by modifying these files.

### Adding New Controls

To add a new configuration parameter:

1. Add the parameter to `ConfigurationManager` bounds
2. Add a slider in `UIControls.jsx` or `UIControlsR3F.jsx`
3. Update the `handleConfigChange` function to handle the new parameter
4. Add the parameter to preset configurations if desired

## Requirements Validation

This implementation satisfies the following requirements:

### Task 14.1 - Configuration UI Panel
- ✅ Sliders for particle count (Requirement 9.1)
- ✅ Slider for disk rotation speed (Requirement 9.2)
- ✅ Slider for lensing intensity (Requirement 9.3)
- ✅ Slider for camera sensitivity (Requirement 9.4)
- ✅ Pause/play button for animation
- ✅ Presets for different visual modes

### Task 14.2 - Accessibility Features
- ✅ Reduced motion mode (Requirement 4.2)
- ✅ Keyboard controls for camera (Requirement 4.1)
- ✅ Text descriptions of phenomena
- ✅ Support for prefers-reduced-motion media query
- ✅ ARIA labels and semantic HTML
- ✅ Screen reader announcements
