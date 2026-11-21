```json
{
  "jurado": "jurado-arte",
  "version": "0.18.0",
  "puntajes": { "claridad": 7.3, "diversion": 7.2, "estetica": 7.8, "veredicto": 7.5 },
  "defectos": [
    {
      "prioridad": "P1",
      "pantalla": "mesa, el golpe crítico (secuencias rey-tajo, golpe)",
      "ventana": "390x844 (grave), 1280x800 y 1366x768",
      "archivo": "src/client/pantallas/mesa.ts:452-457 (el «x2» del crítico se estampa en tt.top-8 del [data-total], a tamaño 2) y :482-484 (el número del daño en carril(0.2) del naipe del Rey)",
      "que": "El «×2» dorado del crítico cae a propósito encima del total de la cuenta. En 390-rey-tajo-08 un «×2» de unos 130 px tapa MULTI 12, el «=» y el 312: no se ve ninguna cifra de la fórmula. En 1280-rey-tajo-08 tapa el «=» y medio «312». En el mismo cuadro, el «312» del daño queda estampado sobre la cara y el índice del Rey a busto, y el «×2» de Punta y hacha se sale del HUD por abajo (rey-tajo-06 y -08).",
      "por_que": "El crítico es el momento en que el jugador se pregunta cuánto pegó. Si el sello más grande de la pantalla tapa el resultado, la recompensa pasa a ser ruido amarillo. En Balatro el multiplicador se anima al lado de la cifra que multiplica, nunca encima.",
      "propuesta": "Que el «×2» salga a la derecha del total, en su propio hueco, y que el total haga el remate (crece y cambia de color). En el teléfono, a tamaño 1. El número del daño, encima del naipe del Rey y fuera de su cara (carril(-0.05)). Sumar 390-rey-tajo-08 a la puerta de solapes: ningún número en vuelo sobre [data-total]."
    },
    {
      "prioridad": "P1",
      "pantalla": "Botín del Rey (la pieza nueva «+N DE VIDA MÁXIMA»)",
      "ventana": "1280x800 y 390x844",
      "archivo": "src/client/estilos/pantallas.css:2158-2180 (rejilla 1fr auto 1fr: con 5 piezas la columna del panel se come la del Bufón) y :2486 (cada pieza mide fr×9,5); :2571-2579 (en el teléfono la fila va en row y .bp-pie queda al costado del nombre); src/client/pantallas/camino.ts:497 (el mismo pxHud('vida') para Vida y Vida máxima)",
      "que": "A 1280 (rey-cae-11) las cinco piezas ocupan todo el ancho: «+20 DE ORO» tapa al Bufón y corta su bocadillo («Ag… tuy… ya»), mientras abajo grita el Personaje con otro bocadillo. A 390 (390-rey-cae-11), «+12 DE / VIDA / MÁXIMA» parte en tres renglones, «El Rey vencido te curte» flota en medio de la fila encima de las chispas, y entre la última pieza y SEGUIR quedan unos 200 px de madera vacía. Vida y Vida máxima tienen el mismo corazón y solo las distingue un «+» de 20 px.",
      "por_que": "Es la recompensa nueva de la versión y la más importante del Reinado. Llega rota en las dos ventanas en que más se juega, y el icono no explica la diferencia que la regla nueva quiere enseñar.",
      "propuesta": "Con cinco piezas o más, dos filas (oro, Vida y Vida máxima arriba; Amuleto y Cábala, que se eligen, abajo y más grandes), con el Bufón fuera de la rejilla. Darle a la Vida máxima su propio dibujo: corazón dentro de un marco de hierro que se agranda, o corazón con corona. En el teléfono, .bp-pie debajo del nombre (columna dentro del texto) y el panel pegado a SEGUIR."
    },
    {
      "prioridad": "P2",
      "pantalla": "mesa en el escalón portátil/Deck (mano a 2×)",
      "ventana": "1280x800 y 1366x768",
      "archivo": "src/client/estilos/mesa.css:3255-3262 (.mano con margin-bottom negativo y el HUD a z-index 40) y :3281-3286 (.e-centro recortado; el Rey sube hasta el borde)",
      "que": "La mano manda, pero no entra. Los naipes se hunden 40 px bajo el HUD aunque estén elegidos (1280 mesa: el 1 de Copas elegido tiene el pie tapado, aunque el comentario dice «elegidas, suben enteras»). El naipe del Rey a busto se pega al borde de arriba sin margen. La vela queda partida por el marco de la cuenta y asoma solo la llama (1366 mesa-segunda, 1280 golpe-04). Con la cuenta abierta, «LA CORTE» se mete bajo el botón JUGADAS (1280 golpe-04).",
      "por_que": "Hay cuatro planos (Rey, cuenta, mano y HUD) apilados sin aire. Los recortes accidentales (la vela partida, un rótulo bajo un botón, naipes guillotinados) se leen como error de maqueta y no como encuadre.",
      "propuesta": "Elegida = translateY hasta que el naipe se vea entero sobre el HUD. Un margen fijo de 8 px entre el busto del Rey y la cabecera. La vela con z-index sobre la cuenta, o que se corra a la izquierda cuando la cuenta crece. La Corte anclada debajo de TE PEGA y no del borde superior. Una regla de QA: ningún sprite de escena cortado a medias por un panel."
    }
  ],
  "aciertos": [
    "La jerarquía en la Deck se dio vuelta como pedí: la mano a 2× (200×280) es lo más grande del centro y el Rey a busto sobre su barra; los bastos del 7 y los cálices ya tienen dibujo y no manchas (1280 mesa-segunda).",
    "La derrota ya es un cuadro: más luz, el retrato rajado con marco dorado partido en zigzag y el Rey que te ganó enmarcado en rojo (1920 y 1280 fin-derrota).",
    "La previa dice el veredicto en grande («NO LO ABATÍS») y TE PEGA tiene su fórmula «42 (21 ×2)» en un solo lugar; el estado mesa-segunda-cambia se lee limpio.",
    "Elegí tu Mazo sigue siendo la pantalla más cohesiva: cinco dorsos con tramado propio, el personaje en chapa y un panel de lectura."
  ],
  "capturas_vistas": [
    "visual-qa/1280x800/mesa.png", "visual-qa/1280x800/mesa-segunda.png", "visual-qa/1280x800/mesa-segunda-cambia.png",
    "visual-qa/1280x800/fin-derrota.png", "visual-qa/1366x768/mesa-segunda.png",
    "visual-qa/1920x1080/mesa.png", "visual-qa/1920x1080/mesa-segunda.png", "visual-qa/1920x1080/fin-derrota.png",
    "visual-qa/1920x1080/cronica.png", "visual-qa/1920x1080/ajustes.png", "visual-qa/1920x1080/mapa.png",
    "visual-qa/1920x1080/botin.png", "visual-qa/1920x1080/pulperia.png", "visual-qa/1920x1080/portada.png",
    "visual-qa/1920x1080/elegir-mazo.png",
    "visual-qa/390x844/mesa-segunda.png", "visual-qa/390x844/fin-derrota.png", "visual-qa/390x844/botin.png",
    "jurado/secuencias/1280-rey-tajo-06.png", "jurado/secuencias/1280-rey-tajo-08.png", "jurado/secuencias/1280-rey-tajo-09.png",
    "jurado/secuencias/1280-rey-tajo-10.png", "jurado/secuencias/1280-rey-tajo-12.png",
    "jurado/secuencias/1280-golpe-04.png", "jurado/secuencias/1280-golpe-07.png",
    "jurado/secuencias/1280-rey-cae-05.png", "jurado/secuencias/1280-rey-cae-09.png", "jurado/secuencias/1280-rey-cae-11.png",
    "jurado/secuencias/1280-rey-cae-13.png", "jurado/secuencias/1280-botin-brota-08.png",
    "jurado/secuencias/1280-rey-irrumpe-05.png", "jurado/secuencias/1280-mapa-paso-03.png",
    "jurado/secuencias/390-rey-tajo-08.png", "jurado/secuencias/390-rey-cae-11.png"
  ]
}
```

## Veredicto

La 0.18.0 cobra la deuda grande de la 0.17: en la Steam Deck la mano por fin es la protagonista. Los naipes a 2× tienen dibujo legible y la jerarquía de la mesa es la misma a 1280 y a 1920. La derrota pasó de franja negra a cuadro con marco y luz. Por eso estética sube a 7,8. No sube más porque los cambios trajeron solapes nuevos en el lugar de siempre, el momento vivo. El crítico estampa su «×2» encima del total que festeja, y la recompensa nueva del Rey (la Vida máxima) llega con la maqueta rota a 1280 y a 390. Claridad baja a 7,3: la foto quieta se lee mejor que nunca, pero el cuadro del crítico se lee peor que en la 0.17. Diversión queda en 7,2.

**Respecto de la 0.17.0:** resuelto el defecto 2 (la mano a 2× en la Deck), aunque con naipes hundidos bajo el HUD. El 3 está resuelto en su mayor parte: la derrota tiene marco y luz, la Crónica alinea las cifras y Ajustes tiene escena; «REYES VENCIDOS» y «MEJOR GOLPE» siguen en dos renglones. El 1 está a medias: el bocadillo del Rey ya no tapa la cuenta y TE PEGA tiene una sola fórmula, pero en rey-tajo-10 «TAJO DE REVÉS» aparece dos veces en el mismo cuadro (el cartel sobre el naipe y el rótulo fijo a la derecha) y el crítico ahora tapa el total. Siguen el hueco de la mesa vacía tras la caída del Rey y la madera vacía del Botín en el teléfono.

## Defectos menores

- **Mesa vacía unos 600 ms después de que cae el Rey** (1280-rey-cae-09: tablas, Bufón y un «+20»). Que el botín brote mientras el naipe se raja. `src/client/pantallas/mesa.ts:566`.
- **«TAJO DE REVÉS» dos veces en el mismo cuadro**, y el bocadillo del Rey («¡Así se pega, carajo!») pisa el escudo de inmunidad y la cabecera (1280-rey-tajo-10). Mientras el cartel está en vuelo, que el rótulo fijo se apague. `src/client/pantallas/mesa.ts:788` y `:830`.
- **Botín común a 1920: dos piezas de 220 px en una sala de 1920**, con la mitad derecha de madera muerta. Con dos piezas, que vayan a --kp 5 y se centren en la pantalla y no en la rejilla. `src/client/estilos/pantallas.css:2551-2555`.
- **Ajustes reusa el fondo de La Pulpería** (estantes y botellas): el jugador cree que está en la tienda. Mejor el Altar o la mesa con el abanico de Dorsos. `src/client/juego.ts` (escena de Ajustes).
- **La primera fila del Mapa sigue montada sobre el horizonte**: los nodos tapan los molinos y los ranchos a 1920. `src/client/fx/escenas.ts` (mapa) y la rejilla de `src/client/pantallas/camino.ts`.

## Qué haría en la próxima versión

Un **director de cuadros** de verdad, no carriles sueltos. Una cola única para todo lo que vuela sobre la mesa (daño, crítico, rótulo del Rey, voz del Rey, grito del Personaje), con turno de palabra de unos 250 ms y zonas prohibidas medidas en el DOM: el total, la Vida, el índice del Rey y el bocadillo del Bufón. La puerta de QA mediría los solapes sobre los cuadros de secuencia (rey-tajo-08/-10, golpe-04, rey-cae-11, a 1280 y a 390), no solo en las fotos quietas. Además, rehacer el Botín del Rey como escena: el naipe del Rey rajado al fondo, la Vida máxima como pieza protagonista con dibujo propio (corazón en marco de hierro que se agranda) y, debajo y en fila aparte, lo que se elige. Con eso la mesa viva alcanza a la foto quieta y estética pasa el 8.
