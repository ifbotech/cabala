```json
{
  "jurado": "jurado-arte",
  "version": "0.21.0",
  "puntajes": { "claridad": 7.5, "diversion": 7.5, "estetica": 7.8, "veredicto": 7.6 },
  "defectos": [
    {
      "prioridad": "P0",
      "pantalla": "mesa: la mano y el paño de las Postas ocupan el mismo lugar",
      "ventana": "las cuatro (peor en 1280x800 y 390x844)",
      "archivo": "src/client/mano.ts:206-216 (lugaresPosta: el paño queda a solo --asoma px sobre la fila de la mano) y :279-311 (la mano en los claros); src/client/estilos/mesa.css:448 (--asoma 46 px) y :4093-4097 (36 px en el portátil)",
      "que": "Con una mano corta, los naipes que no elegiste descansan justo adentro de los marcos de las Postas, bajo los rótulos. En mesa 1920, 1366 y 390, el 2 de Oros quieto aparece en la Posta «Medio: pega doble» como si ya estuviera jugado. En 1280-postas-golpe-10 y 390-postas-golpe-09, después del golpe, el 3 de Copas que sobró queda debajo de «Medio». Al revés pasa en 1280 mesa-escalon, chiche-usa-03 y rey-irrumpe-04: el naipe de la mano que tiene el foco del mando pasa por encima de las Postas. Tapa el índice del 2 de Oros jugado y corta el rótulo («en orden: E…»). Con 7 naipes (mesa-chispa, 1366 y 1920), la mano asoma entre los rótulos del Escalón y se apilan tres capas en la misma franja.",
      "por_que": "La 0.21 arregló lo peor: ahora lo elegido va adelante y entero. Pero la pregunta de la mecánica nueva, qué está en el Medio, todavía se responde mal en reposo y con el mando. Jugado y no jugado tienen que ser dos lugares distintos, no dos alturas del mismo.",
      "propuesta": "Separar las filas. El paño, como fila propia arriba de la mano, con un claro de al menos 16·k px. La mano nunca entra en el rectángulo del paño, ni con el foco: el naipe con foco sube dentro de su fila. Sin cartas elegidas, los marcos de las Postas se apagan y no llevan rótulos, así nada de la mano queda «adentro». Sumar a la QA: ningún naipe que no está en una Posta dentro del rectángulo de una Posta."
    },
    {
      "prioridad": "P1",
      "pantalla": "todos los naipes de la mano: el índice de arriba sale doble",
      "ventana": "1280x800 y 1366x768 (la Deck)",
      "archivo": "src/client/estilos/mesa.css:1292-1312 y :1497-1500 (.c-indice de la 0.11, pensado para naipes a 1×); src/client/mano.ts:783 (el span c-indice)",
      "que": "Desde que la mano va a 2× en el portátil y la Deck (mesa.css:3543), la placa HTML del índice (25×27 px en 5,5) ya no tapa el índice dibujado a 2×. Se ve un «2» punteado y, abajo y a la derecha, la pata del 2 pixelado y una raya suelta: «2ꓶ», «3ꓨ», «4⌐», «5ꓨ» (1280-postas-golpe-00, rey-irrumpe-04, 1366 mesa y mesa-chispa). A 1920 no pasa.",
      "por_que": "El índice es la identidad del naipe, y en la ventana objetivo todos parecen mal impresos. Un error de imprenta en la pieza que más se mira tira abajo la buena forja.",
      "propuesta": "Sacar .c-indice cuando --k-naipe ≥ 2: el índice del sprite a 2× ya mide 20×28 y alcanza. Si se quiere más peso, dibujar la cifra a 3× en la forja (cifras.ts), nunca con texto encima. Sumar a la regla de QA «indice-tapado»: ningún texto encima del índice del sprite."
    },
    {
      "prioridad": "P1",
      "pantalla": "el paño de las Postas como material",
      "ventana": "las cuatro; muy visible en 1280-rey-cae-08",
      "archivo": "src/client/estilos/mesa.css:455-486 (repeating-linear-gradient + #123a2a + outline dashed; opacity 0,85 en reposo); src/client/mano.ts:367 (activo)",
      "que": "El paño es lo único de la mesa que no está forjado. Es un degradé CSS de rayas verticales sobre un verde plano, con marcos de outline: dashed del navegador. No tiene tramado Bayer, ni luz de vela, ni canto. En reposo queda a opacidad 0,85, no «apenas»: en rey-cae-08, con el enemigo caído y sin mano, queda un bloque verde muerto de 640×290 en el centro, mientras las brasas caen alrededor.",
      "por_que": "Ocupa el centro de la composición todo el combate. Al lado de la madera tramada, los naipes y el Bufón, parece una maqueta de wireframe olvidada. Era un defecto menor en la previa y no se tocó.",
      "propuesta": "Un fieltro de 9 trozos en marcos.ts: rampa verde con sombra al índigo, tramado de 2 tonos, canto oscuro abajo a la derecha, cada Posta un hundido con puntadas a celda entera y la del Medio con un ribete de oro forjado. En reposo, opacidad 0 (o un 0,25 que apenas se vea). Sin mano en la mesa, display none."
    }
  ],
  "aciertos": [
    "La máscara del Rey es por fin una pieza de la forja: corona, cuencas vacías y cara de cartón sobre la cara del Bufón. Se lee a 1920, a 1280 y a 390, donde antes había un agujero negro. Mi P1 de la previa queda resuelto, salvo la banda negra plana.",
    "Lo elegido va adelante y entero, con su ×2 y la Chispa en la costura (mesa-chispa y mesa-escalon a 1920, 390-postas-golpe-02). En la Deck la mano ya no se hunde bajo el HUD: los no elegidos enseñan su índice al pie en una placa limpia (1280 mesa-escalon).",
    "Los Chiches tienen gracia visual: el fósforo vuela y tacha «INMUNE A ESPADAS», el dado cae con su destello tramado y el chip «MULTI +3» va a la cuenta (chiche-usa a 1920 y 1280). En la Pulpería del teléfono van primero y a buen tamaño."
  ],
  "capturas_vistas": [
    "visual-qa/1920x1080/mesa.png", "visual-qa/1920x1080/mesa-seleccion.png", "visual-qa/1920x1080/mesa-chispa.png", "visual-qa/1920x1080/mesa-escalon.png",
    "visual-qa/1920x1080/mesa-postas-arrastre.png", "visual-qa/1920x1080/mesa-chiche-usa.png", "visual-qa/1920x1080/mesa-prenda.png", "visual-qa/1920x1080/rey-mascara.png",
    "visual-qa/1920x1080/pulperia-chiches.png", "visual-qa/1920x1080/altar.png", "visual-qa/1920x1080/coleccion.png", "visual-qa/1920x1080/mapa.png",
    "visual-qa/1920x1080/botin-rey.png", "visual-qa/1920x1080/fogon.png",
    "visual-qa/1366x768/mesa.png", "visual-qa/1366x768/mesa-seleccion.png", "visual-qa/1366x768/mesa-chispa.png",
    "visual-qa/1280x800/mesa-seleccion.png", "visual-qa/1280x800/mesa-escalon.png", "visual-qa/1280x800/rey-mascara.png",
    "visual-qa/390x844/mesa.png", "visual-qa/390x844/mesa-chispa.png", "visual-qa/390x844/mesa-escalon.png", "visual-qa/390x844/mesa-chiches.png",
    "visual-qa/390x844/rey-mascara.png", "visual-qa/390x844/pulperia-chiches.png",
    "jurado/secuencias/1280-postas-golpe-00.png", "jurado/secuencias/1280-postas-golpe-04.png", "jurado/secuencias/1280-postas-golpe-10.png",
    "jurado/secuencias/1280-chiche-usa-03.png", "jurado/secuencias/1280-rey-irrumpe-04.png", "jurado/secuencias/1280-rey-cae-08.png", "jurado/secuencias/1280-golpe-05.png",
    "jurado/secuencias/390-postas-golpe-02.png", "jurado/secuencias/390-postas-golpe-09.png", "jurado/secuencias/390-chiche-usa-04.png"
  ]
}
```

## Veredicto

La 0.21.0 dio vuelta lo que le reclamé en la previa: lo que jugás va adelante, entero y con su marca, y la máscara del Rey dejó de parecer un sprite roto. En la Deck la mano ya respira sobre el HUD. Pero el paño y la mano siguen compartiendo la misma franja. En reposo, los naipes quietos caen adentro de las Postas, bajo «Medio: pega doble», y con el mando el naipe con foco pisa lo jugado. Encima, el paño sigue siendo un degradé CSS con bordes punteados del navegador en medio de una mesa forjada a mano. Y en la Deck y el portátil, todos los índices salen dobles: es un error de imprenta que no estaba en mi radar y se ve en cada naipe. Claridad sube a 7,5 y diversión a 7,5, porque los Chiches tienen buen golpe visual. Estética sube a 7,8 por la máscara y las Postas adelante, y no pasa de ahí por el índice doble y el paño de maqueta.

**Respecto de la previa:** resueltos el P1 de la máscara (falta la banda) y el P1 de la mano hundida en la Deck. El P0 de las Postas tapadas quedó a medias: lo elegido ya se ve, pero la mano y el paño siguen encimados. Siguen sin cambios los menores del paño vacío tras abatir, los Chiches diminutos de la Pulpería, el Bufón con dos bocadillos en el Botín, el candado del Amuleto y el mapa.

## Defectos menores

- **El Escalón no se ve:** sube como mucho 5·k px por peldaño. En 1920 mesa-escalon el 2, el 3 y el 4 están a la misma altura. Que sean 14·k y, si no hay alto, que el paño baje, no los peldaños. `src/client/mano.ts:229`.
- **El Bufón sin cabeza en el portátil:** a 1366 (mesa, mesa-chispa) el bocadillo baja sobre su cara y solo asoman las piernas y el cetro. `src/client/estilos/mesa.css:3277` (el tope 100cqh − 5,2em − 18px).
- **«23 − 7 ESCUDO» se mete bajo el naipe de La Corte** a 1366 (mesa-chispa) y a 1280 (rey-irrumpe-04). `src/client/estilos/mesa.css:2177-2200` (.e-ataque en la mesa baja).
- **La banda de la máscara** sigue siendo una franja negra plana entre dos filetes amarillos, sin la mesa ni la vela detrás. `src/client/estilos/mesa.css:4324-4326` (.irr-banda.mascarada).
- **El Altar y la Colección siguen igual:** milagritos en «L» sueltos y 230 px vacíos arriba, y 370 px de pared vacía bajo los Mazos. En la Pulpería, el dado y el fósforo miden unos 16 px al lado de Amuletos de 64. `src/client/estilos/pantallas.css` (.b-chiches .op-icono, que solo tiene regla a 390).

## Qué haría en la próxima versión

**Tres pisos claros en la mitad de abajo.** El paño, como fila propia y forjada (fieltro de 9 trozos con tramado, Medio con ribete de oro, peldaños de 14 px que se vean), que existe solo mientras hay algo apoyado. Debajo, la mano en su propia fila, que nunca entra en el paño: el foco sube dentro de su fila. Y el HUD con recorte duro. Junto con eso, sacar el índice HTML a 2× y dibujar la cifra en la forja, y que una regla de QA prohíba cualquier texto encima del índice del sprite. Después, la banda de la máscara sobre la mesa tramada con la vela. Para cerrar las pantallas de meta: un Altar con revoque iluminado por los cirios y milagritos prendidos al doble, y un zócalo en la Colección. Con el paño forjado y los índices limpios, la estética vuelve a 8 y la claridad lo pasa.
