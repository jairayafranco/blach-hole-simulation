# Black Hole Simulation

An interactive 3D black hole simulation with gravitational lensing effects, accretion disk, and particle system, built with React, Three.js, and React Three Fiber.

## Features

- **Realistic visualization** of a black hole with physical effects
- **Gravitational lensing** that distorts light around the event horizon
- **Animated accretion disk** with dynamic particles
- **Background starfield** for spatial context
- **Interactive controls** to adjust parameters in real-time
- **Complete accessibility features** (keyboard controls, reduced motion mode)
- **Performance optimizations** for smooth experience
- **Two implementations**: Vanilla Three.js and React Three Fiber

## Demo

The simulation includes:
- Particle system with up to 5000 particles
- Lighting effects and bloom post-processing
- Interactive camera controls (mouse and keyboard)
- Configuration panel with predefined presets
- Real-time performance monitoring

## Installation

```bash
# Clone the repository
git clone <repository-url>
cd black-hole

# Install dependencies
npm install
```

## Usage

### Development Mode

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Production Build

```bash
npm run build
```

Optimized files will be generated in the `dist/` directory.

### Production Preview

```bash
npm run preview
```

### Linting

```bash
npm run lint
```

### Testing

```bash
# Run tests once
npm test

# Watch mode
npm run test:watch

# Test UI
npm run test:ui

# Code coverage
npm run test:coverage
```

## Controls

### Mouse
- **Drag**: Rotate camera around the black hole
- **Mouse wheel**: Zoom in/out

### Keyboard
- **Arrow keys**: Rotate camera view
- **+ / =**: Zoom in
- **- / _**: Zoom out
- **Space**: Pause/Resume animation
- **H**: Show/Hide help panel

### UI Controls Panel
- **Gear icon (⚙)**: Open configuration panel
- **Sliders**: Adjust parameters in real-time
  - Particle count (100-5000)
  - Disk rotation speed (0.1-5.0)
  - Gravitational lensing intensity (0.0-2.0)
  - Camera sensitivity (0.1-2.0)
  - Bloom strength (0.0-3.0)
- **Presets**: Predefined configurations (Default, Cinematic, Performance, Intense)

## Architecture

### Project Structure

```
src/
├── components/          # Three.js and React components
│   ├── AccretionDisk.js
│   ├── BlackHoleCore.js
│   ├── GravitationalLensing.js
│   ├── ParticleSystem.js
│   ├── Starfield.js
│   ├── LightingSystem.js
│   ├── UIControls.jsx
│   └── AccessibilityFeatures.jsx
├── engine/             # Engine management system
│   ├── SceneManager.js
│   ├── RendererManager.js
│   ├── CameraController.js
│   └── ConfigurationManager.js
├── r3f/               # React Three Fiber implementation
│   ├── components/
│   ├── hooks/
│   └── BlackHoleScene.jsx
├── utils/             # Utilities and helpers
├── App.jsx            # Vanilla Three.js implementation
├── AppR3F.jsx         # React Three Fiber implementation
└── main.jsx           # Entry point
```

### Two Implementations

1. **Vanilla Three.js** (`App.jsx`): Direct implementation with Three.js for maximum control
2. **React Three Fiber** (`AppR3F.jsx`): Declarative implementation using R3F

To switch between implementations, modify `src/main.jsx`:

```javascript
// Vanilla Three.js
import App from './App.jsx'

// React Three Fiber
import App from './AppR3F.jsx'
```

## Technologies

- **React 19** - UI Framework
- **Three.js** - 3D rendering engine
- **React Three Fiber** - React renderer for Three.js
- **@react-three/drei** - Useful helpers for R3F
- **Vite** - Build tool and dev server
- **Vitest** - Testing framework
- **ESLint** - Code linting

## Performance Optimizations

- Optimized shaders with squared distance calculations
- Frustum culling enabled on all meshes
- Automatic particle adjustment based on viewport
- Performance monitoring with automatic degradation
- Efficient memory management with proper disposal
- Pixel ratio capped for high-density displays

See [docs/PERFORMANCE_OPTIMIZATIONS.md](docs/PERFORMANCE_OPTIMIZATIONS.md) for more details.

## Accessibility

- Full keyboard support
- Reduced motion mode (respects `prefers-reduced-motion`)
- ARIA labels and semantic HTML
- Screen reader announcements
- Phenomena descriptions panel

See [docs/UI_CONTROLS.md](docs/UI_CONTROLS.md) for more information.

## Browser Compatibility

- Chrome 56+
- Firefox 51+
- Safari 15+
- Edge 79+

Requires WebGL 2.0 support for best performance (with fallback to WebGL 1.0).

## Documentation

- [UI Controls and Accessibility](docs/UI_CONTROLS.md)
- [Performance Optimizations](docs/PERFORMANCE_OPTIMIZATIONS.md)
- [Tests](tests/README.md)

## License

This project is open source and available under the MIT License.
