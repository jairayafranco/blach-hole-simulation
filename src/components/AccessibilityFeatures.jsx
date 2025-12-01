import { useEffect, useState } from 'react';
import './AccessibilityFeatures.css';

/**
 * AccessibilityFeatures provides accessibility enhancements for the simulation
 * 
 * Implements Requirements:
 * - 4.1: Keyboard controls for camera
 * - 4.2: Reduced motion mode support
 */
export function AccessibilityFeatures({ simulation, cameraController }) {
  const [reducedMotion, setReducedMotion] = useState(false);
  const [showDescriptions, setShowDescriptions] = useState(false);
  const [keyboardControlsEnabled, setKeyboardControlsEnabled] = useState(true);

  // Check for prefers-reduced-motion on mount
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);

    // Listen for changes to the media query
    const handleChange = (e) => {
      setReducedMotion(e.matches);
      applyReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    
    // Apply initial reduced motion setting
    if (mediaQuery.matches) {
      applyReducedMotion(true);
    }

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [simulation]);

  // Apply reduced motion settings to simulation
  const applyReducedMotion = (enabled) => {
    if (!simulation) return;

    try {
      if (enabled) {
        // Reduce particle count and animation speeds
        simulation.updateConfig({
          particleCount: 300,
          diskRotationSpeed: 0.3,
          cameraSensitivity: 0.5
        });
      } else {
        // Restore default settings
        simulation.updateConfig({
          particleCount: 1000,
          diskRotationSpeed: 1.0,
          cameraSensitivity: 1.0
        });
      }
    } catch (error) {
      console.error('Failed to apply reduced motion settings:', error);
    }
  };

  // Toggle reduced motion manually
  const toggleReducedMotion = () => {
    const newValue = !reducedMotion;
    setReducedMotion(newValue);
    applyReducedMotion(newValue);
  };

  // Keyboard controls for camera
  useEffect(() => {
    if (!keyboardControlsEnabled || !cameraController) return;

    const handleKeyDown = (e) => {
      // Don't interfere with input fields
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
      }

      const controls = cameraController.getControls();
      if (!controls) return;

      const rotationSpeed = 0.05;
      const zoomSpeed = 0.5;

      switch (e.key) {
        case 'ArrowLeft':
          // Rotate camera left
          controls.rotateLeft(rotationSpeed);
          e.preventDefault();
          break;
        case 'ArrowRight':
          // Rotate camera right
          controls.rotateLeft(-rotationSpeed);
          e.preventDefault();
          break;
        case 'ArrowUp':
          // Rotate camera up
          controls.rotateUp(rotationSpeed);
          e.preventDefault();
          break;
        case 'ArrowDown':
          // Rotate camera down
          controls.rotateUp(-rotationSpeed);
          e.preventDefault();
          break;
        case '+':
        case '=':
          // Zoom in
          controls.dollyIn(1 / (1 + zoomSpeed * 0.1));
          e.preventDefault();
          break;
        case '-':
        case '_':
          // Zoom out
          controls.dollyOut(1 / (1 + zoomSpeed * 0.1));
          e.preventDefault();
          break;
        case ' ':
          // Space bar to pause/play
          if (simulation) {
            if (simulation.isRunning) {
              simulation.stop();
            } else {
              simulation.start();
            }
          }
          e.preventDefault();
          break;
        case 'h':
        case 'H':
          // Toggle help descriptions
          setShowDescriptions(!showDescriptions);
          break;
        default:
          break;
      }

      // Update controls
      controls.update();
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [keyboardControlsEnabled, cameraController, simulation, showDescriptions]);

  return (
    <div className="accessibility-features">
      {/* Accessibility controls toggle */}
      <button
        className="accessibility-toggle"
        onClick={() => setShowDescriptions(!showDescriptions)}
        aria-label="Toggle accessibility information"
        title="Press H for help"
      >
        ♿
      </button>

      {/* Descriptions panel */}
      {showDescriptions && (
        <div 
          className="descriptions-panel" 
          role="complementary" 
          aria-label="Simulation descriptions and controls"
        >
          <h2>Black Hole Simulation</h2>
          
          <section>
            <h3>What You're Seeing</h3>
            <p>
              This is a scientifically-inspired visualization of a black hole. 
              The dark sphere at the center represents the event horizon - the 
              point of no return where gravity becomes so strong that nothing, 
              not even light, can escape.
            </p>
            <p>
              The glowing disk around the black hole is the accretion disk, 
              made of superheated matter spiraling inward. The colors represent 
              temperature, with hotter regions appearing brighter.
            </p>
            <p>
              The particles you see are matter being pulled toward the black hole, 
              accelerating as they approach the event horizon. The distortion 
              effects simulate gravitational lensing - how the black hole's 
              gravity bends light from background stars.
            </p>
          </section>

          <section>
            <h3>Keyboard Controls</h3>
            <ul>
              <li><kbd>Arrow Keys</kbd> - Rotate camera view</li>
              <li><kbd>+</kbd> / <kbd>-</kbd> - Zoom in/out</li>
              <li><kbd>Space</kbd> - Pause/Play animation</li>
              <li><kbd>H</kbd> - Toggle this help panel</li>
            </ul>
          </section>

          <section>
            <h3>Mouse Controls</h3>
            <ul>
              <li><strong>Left Click + Drag</strong> - Rotate camera</li>
              <li><strong>Scroll Wheel</strong> - Zoom in/out</li>
            </ul>
          </section>

          <section>
            <h3>Accessibility Options</h3>
            <div className="accessibility-options">
              <label>
                <input
                  type="checkbox"
                  checked={reducedMotion}
                  onChange={toggleReducedMotion}
                  aria-label="Enable reduced motion mode"
                />
                Reduced Motion Mode
              </label>
              <p className="option-description">
                Reduces particle count and animation speeds for users sensitive 
                to motion. Automatically enabled if your system preferences 
                indicate reduced motion.
              </p>

              <label>
                <input
                  type="checkbox"
                  checked={keyboardControlsEnabled}
                  onChange={(e) => setKeyboardControlsEnabled(e.target.checked)}
                  aria-label="Enable keyboard controls"
                />
                Keyboard Controls
              </label>
              <p className="option-description">
                Enable or disable keyboard shortcuts for camera control.
              </p>
            </div>
          </section>

          <button
            className="close-descriptions"
            onClick={() => setShowDescriptions(false)}
            aria-label="Close descriptions panel"
          >
            Close
          </button>
        </div>
      )}

      {/* Screen reader announcements */}
      <div 
        className="sr-only" 
        role="status" 
        aria-live="polite" 
        aria-atomic="true"
      >
        {reducedMotion && 'Reduced motion mode enabled'}
      </div>
    </div>
  );
}
