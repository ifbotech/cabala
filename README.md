# CÁBALA

**Roguelike de baraja española en pixel-art oscuro.** · *A Spanish-Deck Roguelike.*

Jugalo gratis en el navegador: **https://ifbotech.github.io/cabala/**

Elegís un Mazo, el Bufón —un chanta de ley— te lleva por tres tramos de caminos y al fondo de cada uno te espera un Rey.
Tu mano contra la Corte: cada golpe es `DAÑO × MULTI = TOTAL`.

- **Baraja española pura**: tu Mazo va del 1 al 9 con Comodines; la Corte (Sota, Caballo y Rey) son los enemigos.
- **5 Mazos con su Personaje**: Escoba, Truco, Chinchón, El Mentiroso y Chancho Va.
- **4 Reyes vivos** que te cortejan con Bendiciones que se acumulan y después te enfrentan.
- **El Bufón**, único anfitrión: te ofrece Cábalas (Aumentos pasivos) y su humor cambia cómo te trata.
- **15 Amuletos**, ni uno más, cada uno con su sello S / A / B medido con victorias reales.
- **Arrastrá las cartas sobre el enemigo** para golpear. También con clic, teclado o mando.
- Español e inglés. Se guarda solo en tu navegador.

## Cómo se juega (30 segundos)

1. Elegí cartas que formen una jugada (par, escalera, flor…) y arrastralas al enemigo.
2. Cada palo hace lo suyo: **Bastos** cubren, **Copas** curan, **Oros** pagan, **Espadas** atraviesan.
3. Cada enemigo es **Inmune a su propio palo**.

El reglamento completo, con todas las cifras, está en [REGLAS.md](REGLAS.md) (se genera desde el motor). Lo que el juego
es y cómo se trabaja en el repo, en [CONSTITUCION.md](CONSTITUCION.md).

## Desarrollo

```bash
npm install
npm run dev          # http://localhost:5183
```

| Orden | Qué hace |
|---|---|
| `npm run typecheck` | Tipos |
| `npm test` | Pruebas (la constitución incluida) |
| `npm run forja` | Láminas PNG de todo el pixel-art en `artifacts/forja/` |
| `npm run pixel-lint` | Linter de pixel-art sobre el catálogo |
| `npm run analyze:meta` | Laboratorio de balance: sellos S / A / B y victorias por Mazo (`-- --fast` para iterar) |
| `npm run docs` | Regenera `REGLAS.md` |
| `npm run qa:visual` | Capturas y auditoría del DOM en 4 ventanas (`-- --lang=en` para el inglés) |
| `npm run qa:smoke` | Una partida entera por la interfaz, con arrastrar y soltar |
| `npm run qa:fps` | 60 FPS en la mesa viva |
| `npm run build:web` | Sitio estático en `dist/web` (base `/cabala/`) |
| `npm run puertas` | Todas las puertas, una tras otra |

Todo el arte es original y se forja por código (`src/client/pixel/`): no hay ni una imagen en el repo. Los efectos son
Canvas procedural (`src/client/fx/`). Cada push a `main` pasa por CI y se publica en GitHub Pages.

## Estructura

```
src/rules/     el motor puro y determinista: cartas, combate, Mazos, Reyes, Amuletos, Aumentos, Mapa, partida, bot
src/client/    la interfaz: pantallas, HUD, mano con arrastre, efectos, forja de pixel-art
scripts/       laboratorio, forja, QA visual, de humo y de FPS, reglamento
tests/         la constitución y las reglas como pruebas
```

Licencia MIT. Referencias de terceros en [TERCEROS.md](TERCEROS.md).
