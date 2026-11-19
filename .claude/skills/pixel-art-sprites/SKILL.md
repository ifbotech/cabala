---
name: pixel-art-sprites
description: Reglas de dibujo y validación del pixel-art «Dark Dithered Lithography» de CÁBALA (naipes de la baraja española, la Corte, el Bufón, los 4 Reyes, los 5 Personajes, Amuletos, Aumentos, Bendiciones, marcos de 9 trozos, cifras y logotipo). Tramado Bayer a celda entera, paleta híper-saturada con sombras al índigo, luz de arriba a la izquierda, sin contorno negro ni almohada, escalas enteras, cuadros de tamaño constante y el linter scripts/pixel-lint.ts. Úsala antes de dibujar o retocar cualquier pieza de src/client/pixel/ y al revisar una captura.
---

# Pixel-art de CÁBALA

**La vara es la de los 5 Dorsos** (`src/client/pixel/dorsos.ts`). Toda pieza nueva se compara con ellos en la misma
lámina (`npm run forja` → `artifacts/forja/`).

## Cómo se dibuja aquí

No hay imágenes en el repo: cada pieza es una función que pinta un `Lienzo` de celdas (`pincel.ts`) con primitivas
(rectángulo, elipse, polígono, trazo, línea) y la sombrea con el motor de tramado (`dither.ts`). De ahí sale un mapa de
caracteres; cada carácter es una tinta de la paleta (`paleta.ts`) y cada celda acaba siendo un píxel entero
(`raster.ts`).

1. Pintá la masa con la letra provisional `¤` y sombreala con `sombrear(l, '¤', rampa, {...})`: la rampa va de la sombra
   abismal `9` a la luz, con corrimiento de matiz (la sombra al índigo, la luz al cálido).
2. Los huecos (cuencas, bocas) con `hueco()`; el grabado con `rayado()`; nunca degradados ni transparencias.
3. Registrá la pieza en `catalogo.ts` (la forja, el linter y las pruebas lo recorren).
4. `npm run forja <grupo>`, abrí la lámina y mirala. Corregí lo peor y repetí: tres pasadas como mínimo.

## Reglas

| Regla | Qué significa |
|---|---|
| Rejilla entera | Cada dibujo es una rejilla; los naipes miden 100 × 140 celdas (cara de 96), los retratos 64 × 64, los iconos 28 × 28, los marcos 24 × 24 (cantos de 8). |
| Escala entera | En pantalla, cada celda mide 1, 2, 3 o 4 píxeles: nunca 1,5. Las escalas viven en variables CSS (`--k`, `--k-naipe`, `--k-enemigo`…). |
| Sin suavizado | `image-rendering: pixelated` en todo sprite; en Canvas, `imageSmoothingEnabled = false`. Nada de JPEG. |
| Luz de un lado | De arriba a la izquierda. Si el brillo sube hacia el centro por todos lados es sombreado de almohada: está mal (salvo lo que emite luz: una llama). |
| Sin contorno negro | La forma la dan sus tonos. Excepción declarada: los objetos de interfaz (naipe, dorso, marcos, cifras) llevan su canto de tinta para leerse sobre cualquier fondo. |
| Tramado declarado | Bayer 2 × 2 o 4 × 4 a celda entera. Las celdas de trama se marcan (`l.marcar`) **después** de pintarlas, para que el linter no las tome por ruido. |
| Paleta | Solo letras de `paleta.ts`. Tope de colores por grupo en el linter; dos colores casi iguales es un fallo. |
| Silueta | A 1× tiene que saberse qué es. Si no se lee, menos detalle y formas más grandes. |
| Naipes | En las esquinas va **solo el número**, en la tinta de su palo. Sin mini-palo. El recuadro lleva los cortes del palo: Oros 0, Copas 1, Espadas 2, Bastos 3. |

## Animación

- Todos los cuadros de una pieza miden lo mismo (el retrato de un Personaje: 64 × 64 en sus 19 cuadros).
- Pocos cuadros y con intención: reposo, parpadeo, gesto. Los tiempos son explícitos (duración y `steps()` en CSS, o
  milisegundos en el código) y cada animación dice si repite.
- El movimiento va en píxeles enteros (`steps()`, `Math.round`). Las rotaciones solo en tránsito, nunca en reposo.
- Con «Reducir movimiento» nada se mueve solo (`src/client/ritmo.ts`).

## Validación

```bash
npm run pixel-lint          # huérfanos, dientes de sierra, almohada, bandas, contorno, paleta, rejilla, silueta
npm run forja               # láminas PNG por grupo para mirarlas
npm test -- tests/forja.test.ts
```

Las guías de validación de sprites (render sin suavizado, escala entera, cuadros de tamaño constante, tiempos y
repetición explícitos, PNG y no JPEG) están adaptadas de `omer-metin/skills-for-antigravity` (`pixel-art-sprites`,
Apache-2.0); el método del pincel y del linter, de `uilianks/pxl` (MIT). Ver `TERCEROS.md`. Motivos genéricos, sí;
calcar personajes, sprites o logotipos de otro juego, nunca.
