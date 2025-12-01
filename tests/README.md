# Black Hole Simulation Tests

This directory contains the test suite for the black hole simulation project.

## Test Structure

- **unit/** - Unit tests for individual components and modules
- **properties/** - Property-based tests using fast-check
- **integration/** - Integration tests for the rendering pipeline

## Running Tests

```bash
# Run all tests once
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

## Testing Approach

### Unit Tests
Unit tests verify specific examples, component initialization, and integration points:
- Initialization tests for scene, renderer, and camera
- Component creation tests
- Configuration validation tests
- Event handler tests
- Disposal tests

### Property-Based Tests
Property-based tests verify universal properties using fast-check with a minimum of 100 iterations per test:
- Frame rate consistency
- Physics simulation properties
- Camera behavior properties
- Shader calculation properties
- Configuration boundary properties

Each property test is tagged with a comment referencing the design document:
```javascript
// Feature: black-hole-simulation, Property 1: Frame rate consistency
```

### Integration Tests
Integration tests verify the complete rendering pipeline and component interactions.

## WebGL Mocking

The test setup includes WebGL context mocking to allow Three.js tests to run in a Node.js environment without a real GPU.
