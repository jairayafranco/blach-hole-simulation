import { useEffect, useRef, useState } from 'react'
import { BlackHoleSimulation } from './BlackHoleSimulation.js'
import { UIControls } from './components/UIControls.jsx'
import { AccessibilityFeatures } from './components/AccessibilityFeatures.jsx'
import './App.css'

function App() {
  const canvasRef = useRef(null)
  const simulationRef = useRef(null)
  const [simulationReady, setSimulationReady] = useState(false)

  useEffect(() => {
    if (!canvasRef.current) return

    // Initialize the black hole simulation
    const simulation = new BlackHoleSimulation()
    simulationRef.current = simulation

    simulation.initialize(canvasRef.current, {
      particleCount: 1000,
      diskRotationSpeed: 1.0,
      lensingIntensity: 1.0,
      cameraSensitivity: 1.0,
      bloomStrength: 1.5
    }).then(() => {
      simulation.start()
      setSimulationReady(true)
    }).catch(error => {
      console.error('Failed to initialize simulation:', error)
    })

    // Cleanup on unmount
    return () => {
      if (simulationRef.current) {
        simulationRef.current.dispose()
        simulationRef.current = null
      }
    }
  }, [])

  return (
    <div style={{ width: '100vw', height: '100vh', margin: 0, padding: 0, overflow: 'hidden' }}>
      <canvas 
        ref={canvasRef}
        style={{ 
          width: '100%', 
          height: '100%', 
          display: 'block',
          background: '#000000'
        }}
        aria-label="Black hole simulation visualization"
      />
      {simulationReady && (
        <>
          <UIControls 
            simulation={simulationRef.current}
            onPresetChange={(preset) => console.log('Preset changed to:', preset)}
          />
          <AccessibilityFeatures
            simulation={simulationRef.current}
            cameraController={simulationRef.current.getCameraController()}
          />
        </>
      )}
    </div>
  )
}

export default App
