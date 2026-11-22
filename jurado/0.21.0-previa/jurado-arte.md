```json
{
  "jurado": "jurado-arte",
  "version": "0.21.0",
  "puntajes": { "claridad": 7.2, "diversion": 7.4, "estetica": 7.7, "veredicto": 7.5 },
  "defectos": [
    {
      "prioridad": "P0",
      "pantalla": "mesa: las Postas del paño (Medio, Escalón, Chispa)",
      "ventana": "1366x768 y 1280x800 (peor), 390x844 y 1920x1080",
      "archivo": "src/client/mano.ts:198-247 (lugaresPosta y destinos: el paño queda detrás y la fila de la mano se centra encima), src/client/mano.ts:221 (peldaño del Escalón de 2·k px); src/client/estilos/mesa.css:444-469 (--asoma 46 px, paño con z-index 0) y :3485-3499",
      "que": "Las cartas que apoyás en las Postas quedan detrás de la mano y solo asoma una franja de unos 46 px. En 1366 mesa-seleccion el 2 de Bastos que está en el Medio (justo el que lleva el ×2) queda tapado entero por el 3 de Copas: se ven el «2», dos puntas verdes y el ×2. En 1280-postas-golpe-00 a 09 pasa lo mismo, y el 3 de Copas cuelga por debajo del borde del HUD. En 1920 mesa-chispa y mesa-escalon, los 6 y el 7 de Oros elegidos asoman como tiras amarillas detrás de seis naipes de la mano. A 390 (mesa-chispa) se apilan tres capas (paño, fila de atrás y fila de adelante) y el ojo no encuentra qué jugaste. La escalera del Escalón sube 2 px por peldaño: a simple vista no se nota.",
      "por_que": "Las Postas son lo nuevo de la versión, y su decisión (qué naipe pongo en el Medio) se juega a ciegas. La jugada armada tiene que ser lo más visible de la mesa. Balatro sube la mano elegida por encima del resto, no la esconde detrás.",
      "propuesta": "Mientras hay cartas en el paño, que el paño pase adelante: z por encima de la mano, el naipe apoyado entero y la mano corrida 0,6× hacia abajo, detrás del HUD, mostrando solo los índices. La otra opción es poner el paño arriba de la mano, como fila propia, y achicar la cuenta. Que el Escalón suba 12·k px por peldaño. Sumar a la puerta de solapes: ningún naipe en Posta tapado más de un 30 % por una .carta de la mano."
    },
    {
      "prioridad": "P1",
      "pantalla": "la máscara del Rey (micro-escena antes del jefe)",
      "ventana": "390x844 (rota), 1280x800 y 1920x1080",
      "archivo": "src/client/estilos/mesa.css:4241-4264 (.mz-mascara: octógono con clip-path, fondo abismo y el Rey a k2 con top −14 %); src/client/pantallas/mesa.ts:86-88 (mascaraHtml)",
      "que": "A 390 la máscara es un agujero negro octogonal con un corchete rojo y una rayita: no hay cara del Rey, y el Bufón queda decapitado. A 1280 y 1920 el sprite del Rey no entra en el octógono: se ve media cara blanca, la copa a la derecha y un pedazo de corchete rojo, porque el clip-path se come las esquinas del inset 4px. Leído en el cuadro quieto parece un sprite roto, no un disfraz. Además la escena se monta sobre una franja negra plana entre dos líneas rojas, sin la mesa ni la luz que tiene el resto del juego.",
      "por_que": "Es el chiste del anfitrión justo antes del momento más grande del run, y la foto quieta que deja es un error gráfico. Sin la máscara, el Bufón deja de ser la firma.",
      "propuesta": "Dibujar la máscara como pieza propia en src/client/pixel/ (busto del Rey a 1× recortado a mano, con su ojal y un cordel) en vez de meter el sprite entero del Rey en un recorte CSS. Ancho fijo en px de rejilla por ventana y el corchete pintado en el dibujo, no con box-shadow. La banda, sobre la mesa tramada con la vela, igual que la cortina del Rey."
    },
    {
      "prioridad": "P1",
      "pantalla": "mesa en la Deck y el portátil: la mano hundida bajo el HUD",
      "ventana": "1280x800 y 1366x768",
      "archivo": "src/client/estilos/mesa.css:3495-3499 (margin-bottom −22·k = −44 px) y :4029-4033 (−56 px a 1366); src/client/mano.ts:228 (base = alto − h)",
      "que": "Para hacerle lugar al paño, la mano se hundió más todavía. En 1280-chiche-usa-02 y 05 a los tres naipes les falta el índice de abajo y el foco celeste del 2 de Bastos pisa el rótulo VIDA. En 1280-postas-golpe-10 el naipe nuevo que entra (9 de Oros) asoma por DEBAJO del HUD, en el borde de la pantalla. En rey-irrumpe-02, el Inmune del naipe queda cortado por el marco.",
      "por_que": "La Deck es la ventana objetivo y el naipe es la pieza de juego. Lo dije en la 0.20 y el paño lo empeoró: ahora el paño, la mano y el HUD se disputan los mismos 300 px.",
      "propuesta": "En la Deck, los naipes del paño a 2× y la mano a 1,5× (150×210) asomando entera sobre el HUD. El Rey a busto como ya está. El HUD con overflow:clip para que nada asome por debajo. Sumar 1280 mesa-postas a la QA con la comprobación «índice de abajo visible en las cartas no elegidas»."
    }
  ],
  "aciertos": [
    "La oferta de Amuletos sobre el Botín quedó limpia: el Bufón entero a la izquierda, sin cartas del Botín asomando entre las ofertas, y a 390 sin la fila fantasma (elegi-amuleto, 1280-rey-cae-17 y 390-rey-cae-18). Era mi P1 de la 0.20.",
    "Las cifras de la bandeja ya no ensucian GOLPEAR. Los «+2» nacen sobre su naipe (1280-golpe-04 y 08) y el ×2 dorado del Medio con la Chispa en la costura es una marca de juego clara cuando se ve.",
    "Los Chiches: tres huecos tallados en la madera, el dado que vuela al enemigo y «¡PRENDA!» estampado en el naipe leen bien a 1920. En el Altar, cada ofrenda tiene por fin su exvoto (corazón, moneda, taba, carta tachada) y el panel se apoya sobre una mesa."
  ],
  "capturas_vistas": [
    "visual-qa/1920x1080/mesa.png", "visual-qa/1920x1080/mesa-chiches.png", "visual-qa/1920x1080/mesa-chispa.png", "visual-qa/1920x1080/mesa-escalon.png",
    "visual-qa/1920x1080/mesa-postas-arrastre.png", "visual-qa/1920x1080/mesa-prenda.png", "visual-qa/1920x1080/rey-mascara.png", "visual-qa/1920x1080/elegi-amuleto.png",
    "visual-qa/1920x1080/altar.png", "visual-qa/1920x1080/coleccion.png", "visual-qa/1920x1080/botin-rey.png", "visual-qa/1920x1080/pulperia-chiches.png", "visual-qa/1920x1080/mapa.png",
    "visual-qa/1280x800/rey-mascara.png", "visual-qa/1366x768/mesa-seleccion.png",
    "visual-qa/390x844/rey-mascara.png", "visual-qa/390x844/mesa-chispa.png", "visual-qa/390x844/altar.png",
    "jurado/secuencias/1280-postas-golpe-00.png", "jurado/secuencias/1280-postas-golpe-03.png", "jurado/secuencias/1280-postas-golpe-06.png", "jurado/secuencias/1280-postas-golpe-09.png", "jurado/secuencias/1280-postas-golpe-10.png",
    "jurado/secuencias/390-postas-golpe-00.png", "jurado/secuencias/390-postas-golpe-08.png",
    "jurado/secuencias/1280-chiche-usa-02.png", "jurado/secuencias/1280-chiche-usa-05.png",
    "jurado/secuencias/1280-golpe-04.png", "jurado/secuencias/1280-golpe-08.png", "jurado/secuencias/390-golpe-09.png",
    "jurado/secuencias/1280-rey-irrumpe-02.png", "jurado/secuencias/1280-rey-irrumpe-05.png", "jurado/secuencias/1280-rey-irrumpe-07.png",
    "jurado/secuencias/1280-rey-cae-08.png", "jurado/secuencias/1280-rey-cae-17.png", "jurado/secuencias/390-rey-cae-18.png",
    "mirar/1280-rey-cae.png"
  ]
}
```

## Veredicto

La 0.21.0 cobra dos de mis tres reclamos de la 0.20: la oferta de Amuletos ya no se encima con el Botín y las cifras no ensucian los botones. Pero la novedad grande, el paño de las Postas, está dibujada al revés. Las cartas que elegís se esconden detrás de las que no elegiste, y el naipe del Medio, el que pega doble, es justo el más tapado. Encima, en la Deck, el paño empujó la mano todavía más bajo el HUD. La máscara del Rey es buena idea, pero en el cuadro quieto parece un sprite roto, y a 390 es directamente un agujero. Los Chiches están bien resueltos y son discretos. Claridad baja a 7,2 porque la jugada armada no se lee. Diversión queda en 7,4: el ×2 dorado y la Chispa tienen gracia, pero hay que adivinarlos. Estética baja a 7,7: el paño de fieltro con bordes de puntos parece un molde de maquetación y, cuando el enemigo cae, queda como un bloque verde muerto en el medio de la mesa.

**Respecto de la 0.20.0:** resuelto el P1 de la oferta sobre el Botín. Resuelto el P2 de las cifras de la bandeja. El P1 de Altar y Colección sigue a medias: el Altar ganó exvotos y mesa, pero la pared sigue negra con milagritos sueltos («L» flotando), arriba quedan 230 px vacíos y a 390 no hay Bufón; en la Colección siguen 370 px de pared vacía bajo el panel. El menor de la Deck empeoró y pasó a P1.

## Defectos menores

- **Paño vacío tras abatir:** en 1280-rey-cae-08 y en mirar/1280-rey-cae queda un rectángulo verde de 640×290 con «Medio: pega doble» y el «+20» de oro cae en el Medio. Que el paño se apague a opacidad 0 cuando no hay mano. `src/client/mano.ts:301` (pano.classList activo) y `src/client/estilos/mesa.css:467`.
- **Las fichas que saltan pisan las cifras** pese a lo que dice el comentario: en 1280-postas-golpe-10 los corazones tapan el «52» de VIDA y la pila de monedas se come la «O» de ORO (también en rey-cae-08). Al perder, `--dx` abre hacia la derecha, sobre el número. `src/client/hud.ts:142-145`.
- **El Bufón de la Pulpería y el Botín habla con un segundo bocadillo** («BARRIDO Y A LA BOLSA.») montado sobre el marco del HUD, con la cola metida en el retrato (botin-rey 1920). Y el Amuleto del Botín es un candado: se lee como «bloqueado». `src/client/pantallas/camino.ts` (botín) y `src/client/pixel/iconos.ts`.
- **Chiches a escala de mota:** en la Pulpería el dado y el fósforo miden unos 16 px al lado de Amuletos de 64. A 1280 «15 − 1 ESCUDO» choca con el naipe de La Corte (rey-irrumpe-02). `src/client/estilos/pantallas.css` (fila de Chiches) y `src/client/estilos/mesa.css:4048`.
- **Mapa sin cambios:** la primera fila de nodos sigue sobre los ranchos y 7 de los 10 nodos son espadas cruzadas. `src/client/fx/escenas.ts:1189`.

## Qué haría en la próxima versión

**Que la jugada sea lo más visible de la mesa.** Invertiría el paño: las Postas pasan adelante, con los naipes apoyados enteros y su marca (×2, Chispa, peldaños de verdad de 12 px), y la mano baja a una fila de índices detrás del HUD, que sube al pasar el cursor o el foco. En la Deck: paño a 2×, mano a 1,5× y el HUD con recorte duro. Cuando no hay cartas, el paño desaparece. Segundo, la máscara del Rey dibujada como pieza propia, con cordel, a 1× entero, sobre la mesa y la vela, no sobre una franja negra. Tercero, terminar el Altar: luz de cirios sobre el revoque, milagritos al doble y prendidos. Y subir el zócalo de la Colección para que el panel apoye en algo. Con eso, la claridad pasa de 8 y la estética vuelve a 8.
