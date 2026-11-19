---
name: pixelfx-canvas
description: Efectos y animaciones de pixel-art en Canvas para CÁBALA, sin dependencias y a 60 FPS, con doble buffer (color opaco o tramado y luz aditiva) — brasas, luz de candil, tajos por palo, destellos, lluvia de monedas, halos de los Reyes, números de daño y el naipe que se raja. Úsala al añadir o retocar cualquier efecto de src/client/fx/, al tocar el hitstop o la sacudida, y al medir FPS.
---

# Efectos en Canvas

El motor vive en `src/client/fx/motor.ts`; la librería, en `src/client/fx/efectos.ts`. El método es el de doble buffer
de `patch-gg/pixelfx` (MIT; ver `TERCEROS.md`); el código es propio.

## Los tres lienzos

| Lienzo | Qué lleva | Cómo se compone |
|---|---|---|
| `#fondo` | La penumbra tramada de la escena, el candil que respira (cuatro cuadros de la misma viñeta de Bayer) y las brasas | Debajo de la interfaz |
| `#fx-color` | Píxeles opacos: tajos, monedas, números, las dos mitades del naipe | Encima de la interfaz |
| `#fx-luz` | Resplandores tramados (`disco()`) | Encima, sumando (`mix-blend-mode: plus-lighter`) |

Los tres son de baja resolución (una celda = `S` píxeles de pantalla, entero) y se estiran sin suavizado.

## Un efecto

```ts
efecto({
  paso(dt) { t += dt; return t < DURACION; },      // false al terminar: tiene que acabar vacío
  pinta(color, luz) { /* fillRect y drawImage en celdas enteras */ },
});
```

Las coordenadas de entrada son píxeles de pantalla (`aCelda()` las pasa a celdas).

## Reglas

- **Rampas duras en el color** (4–5 tonos, del blanco del impacto a la brasa); la suavidad, solo en la luz.
- **Un cuadro blanco de impacto** de uno o dos cuadros, entrada rápida y salida lenta, y afuera: nada flota de más.
- **Hitstop** de 65 ms al golpear (`congelar`), **sacudida medida** en píxeles enteros (`sacudir`).
- **Azar con semilla** (`azar()`, `entre()` del motor): nunca `Math.random` dentro de un efecto.
- Cada palo pega a su manera (`tajo`): Espadas, media luna de acero; Bastos, onda y astillas; Oros, monedas; Copas, vino.
- Los lienzos de efectos no se tocan si no hay efectos, y el fondo se repinta un cuadro de cada dos: el reposo es barato.
- En **modo foto** (`?qa=…`) y con «Reducir movimiento» no corre ningún efecto.
- Los sprites grandes se forjan en ratos libres (`src/client/precarga.ts`) para que ninguno frene un cuadro.

## Medir

```bash
npm run qa:fps      # mesa en reposo y ráfaga de golpes, en 3 ventanas, con la GPU de verdad
```

Si un efecto se ve como una calcomanía, le falta cuerpo: que el enemigo reaccione (sacudida, destello, número) y que
el retrato del HUD haga su gesto.
