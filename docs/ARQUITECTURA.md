# ARQUITECTURA · CÁBALA 2.0

Mapa técnico del proyecto después de eliminar Three.js y el subsistema 3D.

---

## 1 · Capas del sistema

| Carpeta | Responsabilidad | Restricción clave |
| :--- | :--- | :--- |
| `src/shared/` | Marca (`brand.ts`) y constantes compartidas | Cero lógica DOM |
| `src/rules/` | Motor determinista puro (cartas, combate, mazos, reyes, cábalas, bot) | **100 % puro** (sin DOM, sin Canvas, sin Audio) |
| `src/client/pixel/` | Primitivas pixel-art 2D, paletas, dithering Bayer, naipes y spritesheets de personajes | Salida en `HTMLCanvasElement` / data URLs cacheadas |
| `src/client/fx/` | Escenarios 2D (`#fondo`) y partículas doble buffer (`#fx-color` + `#fx-luz`, método *pixelfx*) | 60 FPS sin crear canvases por frame |
| `src/client/musica/` + `audio.ts` | Síntesis procedural WebAudio y stingers | Sin assets externos pesados |
| `src/client/pantallas/` | Portada, Selección de Mazo, Colección, Ajustes, Mesa Horizontal 2D, Pulpería rápida, Duelo del Bufón, Botín y Fin | Estado derivado de `sesion.partida` |
| `src/client/estilos/` | CSS pixel-art diegético limpio (meta `< 2.000` líneas en Hito 3) | Sin `@keyframes` fuera de GPU-friendly / `steps()` |

---

## 2 · Pipeline de renderizado 2D

1. **`<canvas id="fondo">`:** Escenario pixel-art iluminado por cuadro (`escenas.ts`), con respiración de candil y clima de palo en Reyes.
2. **`<div id="app">`:** Mesa diegética horizontal estilo *Slay the Spire* (Héroe 2D ↔ Bufón 2D ↔ Enemigo 2D, paño de cartas abajo, HUD compacto).
3. **`<canvas id="fx-color">` + `<canvas id="fx-luz">`:** Capa superior *pixelfx* para tajos, chispas, monedas, números flotantes y resplandores aditivos con *hitstop* coordinado.

---

## 3 · Skills instaladas (`.agents/skills/`)

| Categoría | Skills activas | Uso en CÁBALA 2.0 |
| :--- | :--- | :--- |
| **Diseño y flujo** | `grill-me`, `grilling`, `to-spec`, `codebase-design` | Especificación iterativa y arquitectura limpia de módulos |
| **Género** | `roguelike`, `card-game` | Economía de run, zonas de cartas, triggers y balance |
| **Arte 2D y VFX** | `generate2dsprite`, `codeart2d`, `generate2dmap`, `pixelfx`, `create-game-assets` | Spritesheets 2D de cuerpo entero, escenarios y doble buffer `color`/`light` |
| **Ingeniería 2D** | `game-feel`, `game-ui-ux`, `audio-design`, `input-systems`, `performance-optimization`, `procedural-gen`, `save-systems`, `pixijs-rendering`, `phaser-core` | Hitstop, UI diegética PC/Móvil, guardado, RNG y 60 FPS |
