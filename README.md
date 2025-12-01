# Simulación de Agujero Negro

Una simulación interactiva en 3D de un agujero negro con efectos de lente gravitacional, disco de acreción y sistema de partículas, construida con React, Three.js y React Three Fiber.

## Características

- **Visualización realista** de un agujero negro con efectos físicos
- **Lente gravitacional** que distorsiona la luz alrededor del horizonte de eventos
- **Disco de acreción** animado con partículas dinámicas
- **Campo de estrellas** de fondo para contexto espacial
- **Controles interactivos** para ajustar parámetros en tiempo real
- **Características de accesibilidad** completas (controles de teclado, modo de movimiento reducido)
- **Optimizaciones de rendimiento** para experiencia fluida
- **Dos implementaciones**: Three.js vanilla y React Three Fiber

## Demo

La simulación incluye:
- Sistema de partículas con hasta 5000 partículas
- Efectos de iluminación y bloom post-procesado
- Controles de cámara interactivos (mouse y teclado)
- Panel de configuración con presets predefinidos
- Monitoreo de rendimiento en tiempo real

## Instalación

```bash
# Clonar el repositorio
git clone <url-del-repositorio>
cd black-hole

# Instalar dependencias
npm install
```

## Uso

### Modo Desarrollo

```bash
npm run dev
```

Abre [http://localhost:5173](http://localhost:5173) en tu navegador.

### Construcción para Producción

```bash
npm run build
```

Los archivos optimizados se generarán en el directorio `dist/`.

### Vista Previa de Producción

```bash
npm run preview
```

### Linting

```bash
npm run lint
```

### Testing

```bash
# Ejecutar tests una vez
npm test

# Modo watch
npm run test:watch

# UI de tests
npm run test:ui

# Cobertura de código
npm run test:coverage
```

## Controles

### Mouse
- **Arrastrar**: Rotar la cámara alrededor del agujero negro
- **Rueda del mouse**: Zoom in/out

### Teclado
- **Flechas**: Rotar la vista de la cámara
- **+ / =**: Acercar zoom
- **- / _**: Alejar zoom
- **Espacio**: Pausar/Reanudar animación
- **H**: Mostrar/Ocultar panel de ayuda

### Panel de Controles UI
- **Icono de engranaje (⚙)**: Abrir panel de configuración
- **Sliders**: Ajustar parámetros en tiempo real
  - Cantidad de partículas (100-5000)
  - Velocidad de rotación del disco (0.1-5.0)
  - Intensidad de lente gravitacional (0.0-2.0)
  - Sensibilidad de cámara (0.1-2.0)
  - Fuerza del bloom (0.0-3.0)
- **Presets**: Configuraciones predefinidas (Default, Cinematic, Performance, Intense)

## Arquitectura

### Estructura del Proyecto

```
src/
├── components/          # Componentes de Three.js y React
│   ├── AccretionDisk.js
│   ├── BlackHoleCore.js
│   ├── GravitationalLensing.js
│   ├── ParticleSystem.js
│   ├── Starfield.js
│   ├── LightingSystem.js
│   ├── UIControls.jsx
│   └── AccessibilityFeatures.jsx
├── engine/             # Sistema de gestión del motor
│   ├── SceneManager.js
│   ├── RendererManager.js
│   ├── CameraController.js
│   └── ConfigurationManager.js
├── r3f/               # Implementación React Three Fiber
│   ├── components/
│   ├── hooks/
│   └── BlackHoleScene.jsx
├── utils/             # Utilidades y helpers
├── App.jsx            # Implementación Three.js vanilla
├── AppR3F.jsx         # Implementación React Three Fiber
└── main.jsx           # Punto de entrada
```

### Dos Implementaciones

1. **Three.js Vanilla** (`App.jsx`): Implementación directa con Three.js para máximo control
2. **React Three Fiber** (`AppR3F.jsx`): Implementación declarativa usando R3F

Para cambiar entre implementaciones, modifica `src/main.jsx`:

```javascript
// Three.js vanilla
import App from './App.jsx'

// React Three Fiber
import App from './AppR3F.jsx'
```

## Tecnologías

- **React 19** - Framework UI
- **Three.js** - Motor de renderizado 3D
- **React Three Fiber** - Renderer React para Three.js
- **@react-three/drei** - Helpers útiles para R3F
- **Vite** - Build tool y dev server
- **Vitest** - Framework de testing
- **ESLint** - Linting de código

## Optimizaciones de Rendimiento

- Shader optimizado con cálculos de distancia al cuadrado
- Frustum culling habilitado en todos los meshes
- Ajuste automático de partículas según viewport
- Monitoreo de rendimiento con degradación automática
- Gestión eficiente de memoria con disposal apropiado
- Pixel ratio limitado para displays de alta densidad

Ver [docs/PERFORMANCE_OPTIMIZATIONS.md](docs/PERFORMANCE_OPTIMIZATIONS.md) para más detalles.

## Accesibilidad

- Soporte completo de teclado
- Modo de movimiento reducido (respeta `prefers-reduced-motion`)
- Etiquetas ARIA y HTML semántico
- Anuncios para lectores de pantalla
- Panel de descripciones de fenómenos

Ver [docs/UI_CONTROLS.md](docs/UI_CONTROLS.md) para más información.

## Compatibilidad de Navegadores

- Chrome 56+
- Firefox 51+
- Safari 15+
- Edge 79+

Requiere soporte de WebGL 2.0 para mejor rendimiento (con fallback a WebGL 1.0).

## Documentación

- [Controles UI y Accesibilidad](docs/UI_CONTROLS.md)
- [Optimizaciones de Rendimiento](docs/PERFORMANCE_OPTIMIZATIONS.md)
- [Tests](tests/README.md)

## Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.
