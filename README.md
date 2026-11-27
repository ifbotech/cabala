# CÁBALA 2.0

**Roguelike de baraja española en pixel-art 2D diegético.**

Jugalo gratis en el navegador: **https://ifbotech.github.io/cabala/**

Elegís uno de los **5 Mazos** (todos abiertos desde el minuto 0) y enfrentás una corrida lineal de **3 Tramos** contra la Corte de la baraja española en combate horizontal 2D estilo *Slay the Spire*. Cada golpe se calcula como `DAÑO × MULTI = TOTAL`.

## Qué incluye CÁBALA 2.0 (MVP)

- **Baraja española pura**: tu Mazo va del `1` al `9` con Comodines; la Corte (`10` Sota, `11` Caballo y `12` Rey) son tus rivales.
- **5 Mazos con Héroe propio (abiertos desde el inicio)**: *Escoba* (*La Barrendera*), *Truco* (*El Paisano Bravo*), *Chinchón* (*La Timbera del Club*), *El Mentiroso* (*El Chamuyero*) y *Chancho Va* (*El Manotazo*).
- **Combate horizontal 2D con sprites animados**: cero 3D y cero cartas-enemigo; Héroes, Sotas, Caballos, Reyes y el Bufón tienen sprites de cuerpo entero en `src/client/pixel/combatientes.ts` y efectos 2D en doble buffer (`#fx-color` + `#fx-luz`).
- **Loop lineal de 3 Tramos**: `Sota (10)` → `Pulpería rápida` → `Caballo (11)` → `Duelo del Bufón` (mano rápida del juego argentino del Mazo) → `Rey Jefe (12)`.
- **15 Cábalas y 12 Bendiciones directas**: 6 huecos de Cábalas con etiqueta `★ SINERGIA` y 12 Bendiciones de 1 nivel otorgadas por los **4 Reyes** (*El Caudillo*, *El Cacique*, *El Caudal* y *El Bacanal*).
- **Menú directo**: `JUGAR`, `COLECCIÓN` y `AJUSTES`.
- **Audio procedural**: música y voces sintetizadas en tiempo real desde WebAudio.

## Cómo se juega (30 segundos)

1. Elegí cartas que formen una jugada (*Par*, *Pierna*, *Escalera*, *Flor*, o el canto de tu Mazo como *Escoba del 15* / *Envido*) y arrastralas sobre el enemigo o pulsá **GOLPEAR**.
2. Cada palo tiene un poder natural: **Bastos** dan Escudo, **Copas** curan Vida, **Oros** pagan oro y **Espadas** perforan Escudo.
3. Cada enemigo es **Inmune a su propio palo** (esas cartas no hacen Daño directo, pero igual activan su poder).

## Desarrollo

```bash
npm install
npm run dev          # http://localhost:5183
```

| Orden | Qué hace |
|---|---|
| `npm run typecheck` | Verificación estricta de TypeScript |
| `npm test` | Suite de pruebas (`constitucion`, `reglas`, `musica`, `forja`) |
| `npm run build:web` | Compila el sitio estático en `dist/web` (base `/cabala/`) |
| `npm run qa:smoke` | Corrida end-to-end en PC (`1366×768`) y Móvil (`390×844`) |
| `npm run qa:fps` | Benchmark de FPS en 4 resoluciones (`1366×768`, `1280×800`, `1920×1080`, `390×844`) |
| `npm run forja` | Exporta láminas PNG de pixel-art en `artifacts/forja/` |
| `npm run pixel-lint` | Linter de pixel-art sobre el catálogo |
| `npm run puertas` | Ejecuta todas las compuertas de calidad en secuencia |

## Estructura

```text
src/rules/     motor puro y determinista (cartas, combate, mazos, amuletos, reyes, partida, bot)
src/client/    interfaz 2D, pantallas, mano con arrastre, audio, FX en canvas y pixel-art procedural
docs/          especificación del MVP (MVP_2D.md) y arquitectura (ARQUITECTURA.md)
tests/         pruebas constitucionales, reglas de juego, música y forja
scripts/       QA automatizada (smoke, fps, visual-qa, pixel-lint, puertas)
```

Documentación técnica en [CONSTITUCION.md](CONSTITUCION.md), [docs/MVP_2D.md](docs/MVP_2D.md) y [docs/ARQUITECTURA.md](docs/ARQUITECTURA.md). Licencia MIT ([TERCEROS.md](TERCEROS.md)).
