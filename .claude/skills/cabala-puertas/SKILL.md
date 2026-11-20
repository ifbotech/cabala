---
name: cabala-puertas
description: Las puertas duras de CÁBALA antes de publicar una versión y cómo correrlas en esta máquina (Windows, todo en primer plano y con tope) — tipos, pruebas de la constitución, forja y linter, laboratorio de balance con sus sellos S/A/B, QA visual ES y EN en 4 ventanas, QA de humo con arrastrar y soltar, FPS y construcción. Úsala antes de publicar, al añadir un estado de QA, al tocar números de src/rules o al investigar una puerta en rojo.
---

# Puertas de CÁBALA

La fuente de verdad es `CONSTITUCION.md` (apartado 4). Todo corre **en primer plano** y con tope:
`node scripts/con-tope.mjs <segundos> <orden…>` mata el árbol de procesos si se pasa. Nada de segundo plano ni de
esperar archivos de señal.

```bash
node scripts/con-tope.mjs 120 npm run typecheck
node scripts/con-tope.mjs 280 npm test
node scripts/con-tope.mjs 200 npm run forja            # láminas + linter
node scripts/con-tope.mjs 590 npm run analyze:meta     # ~3 min; -- --fast para iterar
node scripts/con-tope.mjs 290 npm run qa:visual
node scripts/con-tope.mjs 290 npm run qa:visual -- --lang=en
node scripts/con-tope.mjs 290 npm run qa:smoke
node scripts/con-tope.mjs 200 npm run qa:fps
node scripts/con-tope.mjs 200 npm run build:web
```

`npm run puertas` las corre todas en ese orden y corta en la primera que falle.

## Balance

- Los números viven en `src/rules/balance-config.json`. Para probar uno: `node scripts/balance-set.mjs ruta=valor`.
- Sondeo barato: `npx tsx scripts/lab.ts 300 [mazo] [vacio|lleno]`; qué pesa cada mejora del Altar:
  `npx tsx scripts/sonda-altar.ts 400 <mazo>`.
- `npm run analyze:meta` hace dos cosas: mide la **nota** de cada pieza (partidas con «ELEGÍ UNA» al azar; gana quien la eligió
  contra quien la vio y la dejó pasar) y escribe `src/rules/notas.json`; después mide las victorias por Mazo con el
  bot que ya elige por nota, y escribe `scripts/meta-report.json` con su **huella**.
- Objetivos (`scripts/objetivos.ts`): 28–33 % con el Altar vacío y 45–49 % con el lleno, los 5 Mazos.
- Si cambia cualquier archivo de `src/rules` (menos `notas.json`), `tests/forja.test.ts` falla hasta volver a
  certificar. Con 500 partidas una proporción del 30 % baila ±4 puntos: no perseguir décimas con el modo rápido.
- Ojo: el bot elige por nota, así que notas más precisas hacen al bot más fuerte. Calibrá siempre contra las notas
  del informe completo (`--sin-notas` las conserva al iterar). Las notas son internas: desde la 0.5.0 el juego no
  enseña ningún tier al jugador (solo la etiqueta ★ SINERGIA).

## QA visual

- Estados fijos en `src/client/qa.ts` (`?qa=<estado>&lang=en`): partida determinista llevada por el bot, perfil de
  muestra en memoria, modo foto. Para añadir uno: sumarlo a `ESTADOS` y a `montarQa`.
- La auditoría (`scripts/visual-qa.ts`) falla por: desborde de la página, texto de menos de 14 px, recortes, dianas
  de menos de 44 px (48 en la barra del pulgar del móvil), cajas claras de HTML, bordes lisos de HTML, texto cortado,
  restos de español en inglés y errores de consola.
- **Mirá las capturas con tus propios ojos** antes de dar nada por bueno (`artifacts/visual-qa/<ventana>/`): la
  auditoría no ve la composición ni si algo quedó feo.

## Trampas de esta máquina

- Los parches grandes, como archivo `.mjs` y con `node`: los heredocs de bash con comillas se rompen.
- `page.evaluate` con funciones de tsx necesita `ctx.addInitScript('globalThis.__name = (f) => f')`.
- `qa:fps` lanza Chromium con la GPU real (`channel: 'chromium'`, ANGLE/D3D11); sin GPU mide menos y no vale.
