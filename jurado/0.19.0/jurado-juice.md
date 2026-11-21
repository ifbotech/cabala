```json
{
  "jurado": "jurado-juice",
  "version": "0.19.0",
  "puntajes": { "claridad": 7.8, "diversion": 8.0, "estetica": 8.2, "veredicto": 7.9 },
  "defectos": [
    {
      "prioridad": "P1",
      "pantalla": "mesa · el golpe que abate con canto (¡ESCOBA!) y la caída del Rey",
      "ventana": "1280x800 (y 390x844)",
      "archivo": "src/client/pantallas/mesa.ts:913-917 (carrilDano: borde derecho del número al 4 % del naipe, a media altura) contra :516-531 (el canto-grande nace en centro(carta()), a la misma altura) y src/client/estilos/mesa.css:1045-1051 (.canto-grande a --fs-xl ×2,2, más ancho que el naipe)",
      "que": "El número del daño cambió de carril: ahora nace a media altura, pegado al canto izquierdo del naipe y a escala 2. Pero el «¡ESCOBA!» grande cruza la mesa centrado en el naipe, a la misma altura y en el mismo instante. En 1280-golpe-09 se lee «700¡E COBA!»: la última cifra del 700 se come la «S» y las dos capas se tapan entre sí. Ese mismo carril pone el 243 encima del sello INMUNE A ESPADAS (rey-cae-04 y 05). En el teléfono el 243 se pega al borde izquierdo y cae sobre el naipe, bajo los rayos (390-rey-cae-05).",
      "por_que": "Es el remate del golpe más común del Mazo de arranque (abatir cantando) y el número más grande del turno. Se arregló el choque del número con la cara del Rey y se abrió otro con el canto. Es la misma familia de siempre: dos capas que no saben una de la otra.",
      "propuesta": "Encolar en vez de superponer: el canto-grande sale arriba del naipe (carril 0,15) o espera a que el número llegue a su punto alto (unos 250 ms). En el golpe que abate, el número va al centro del naipe ya vacío (el Rey se está rajando) y el carril lateral queda para los golpes que no matan. En el teléfono, el número va arriba del naipe y no al costado: no hay costado."
    },
    {
      "prioridad": "P1",
      "pantalla": "mesa · el Crítico (Punta y hacha) dentro del MULTI",
      "ventana": "todas (visto quieto en visual-qa/1280x800 y 390x844/mesa-conteo; en movimiento, no)",
      "archivo": "src/client/pantallas/mesa.ts:1269-1283 (el estallido: brinco del término, destello de 22 y frenar 120) · src/client/estilos/mesa.css:3377-3424 (critico-estalla a scale 1,14) · scripts/secuencias.ts:145 (la ráfaga rey-tajo falla y solo lo loguea)",
      "que": "La mentira se arregló: ya no hay un «×2» estampado sobre un total que ya lo incluía. Pero el crítico quedó como un término de 14 px al final del segundo renglón del desglose («Punta y hacha ¡CRÍTICO! ×2», mesa-conteo). Su momento es un brillo de medio segundo a 1,14× y unas chispas encima de ese renglón. La cifra grande del MULTI apenas se enciende. Y esta vez no hay secuencia rey-tajo en artifacts: el script no encontró el Par, lo dijo por consola y siguió. Nadie vio el crítico en movimiento. Leído en código, no visto.",
      "por_que": "El crítico es el golpe raro, el que un jugador de Balatro espera ver explotar. Pasó de estar mal dicho a estar bien dicho y chico. Con la vista en la cifra grande, el ×2 en letra de desglose no se ve.",
      "propuesta": "El estallido va en la cifra grande del MULTI, no en el desglose. Que salte de 6 a 12 contando hacia arriba en dos o tres cuadros, con un sello «×2» a escala 1,5 pegado a su derecha (adentro de la fórmula, nunca sobre el total), sacudida de la cuenta y los 120 ms de freno. El término del desglose queda como registro. Y que la ráfaga rey-tajo sea obligatoria: si no se arma, que falle la puerta."
    },
    {
      "prioridad": "P2",
      "pantalla": "Botín del Rey → ELEGÍ UN AMULETO",
      "ventana": "1280x800",
      "archivo": "src/client/pantallas/camino.ts:538 y :548 (modalOferta tras pausa(170) o pausa(420), con velo propio) · src/client/estilos/pantallas.css:1697-1703 (.velo)",
      "que": "Entre el panel del Botín y la elección hay 3 o 4 cuadros casi negros, con solo el título y SALTAR (rey-cae-12). Después aparecen las tres cartas (rey-cae-13). El panel no se transforma en la elección: se apaga y se prende otra cosa.",
      "por_que": "Lo señalé como menor en la 0.17 y en la 0.18 y sigue igual. Cae justo en el pico de recompensa del tramo, y el negro corta el ritmo que la caída del Rey venía armando muy bien.",
      "propuesta": "La pieza AMULETO que se elige se abre en su lugar: crece y se despliega en las tres cartas, con el resto del botín atenuado detrás y sin velo nuevo. Si hace falta velo, que entre con opacidad 0,6 en dos pasos, con las cartas ya montadas desde el primer cuadro."
    }
  ],
  "aciertos": [
    "El Botín de cinco piezas ya no se traga al Bufón: en 1280 entra en una fila con el Bufón y su bocadillo a la izquierda, y el grito «BARRIDO Y A LA BOLSA.» queda arriba del retrato, con cola (rey-cae-11). En el teléfono, columna limpia con las dos elecciones en oro (390-rey-cae-12). La Vida máxima tiene corazón propio, engastado y con flecha.",
    "El cartel de la segunda cara se pliega antes de que el Rey embista: en rey-segunda-10 está, en 11 ya no, y el −17 y el −4 caen con el Rey limpio. Arreglado mi P2.",
    "La última frase del Rey ahora se lee en su bocadillo, fuera de los rayos («Buen tajo… paisano», rey-cae-05).",
    "Un solo TE PEGA: placa y chip dicen lo mismo, y el chip da la causa («HITS YOU FOR 3 (23 − 20 SHIELD)», mirar/1280-conteo). La primera cara del Rey ya lleva su regla en un renglón («Medio golpe suyo cruza tu Escudo»).",
    "La mesa no salta al elegir en la Deck (mando-00 contra 03: el Rey no se mueve), y el foco celeste con flecha se distingue del oro de la elegida sin dudar.",
    "Un toque apura el conteo, y cada palo suma su timbre al golpe: acero agudo, madera hueca, tintineo, salpicón con ruido de banda (audio.ts:77-85, leído en código, no oído). Es la capa de identidad que faltaba.",
    "Rendimiento: 164 fps en las cuatro ventanas, 0 % de cuadros de más de 25 ms y un peor cuadro de 24 ms en 1080p bajo golpes."
  ],
  "capturas_vistas": [
    "jurado/secuencias/1280-golpe-00, 03, 04, 05, 06, 07, 08, 09; 390-golpe-05, 07, 08, 09",
    "jurado/secuencias/1280-rey-segunda-01, 04, 05, 07, 09, 10, 11, 12; 390-rey-segunda-10, 11, 12",
    "jurado/secuencias/1280-rey-cae-04, 05, 08, 10, 11, 12, 13; 390-rey-cae-05, 10, 11, 12",
    "jurado/secuencias/1280-mando-00, 03, 12; 1280-mando-elige-03; 1280-rey-irrumpe-04; 1280-botin-brota-03; 1280-mapa-paso-03",
    "mirar/1280-mesa-grito, 1280-conteo, 390-mesa-grito, 390-conteo",
    "visual-qa/1280x800/mesa-conteo, mesa-segunda; visual-qa/390x844/mesa-conteo",
    "jurado/fps.txt"
  ]
}
```

## Veredicto

La 0.19.0 cumplió casi todo lo que pedí. El crítico ya no miente. El Botín de cinco piezas respira y deja al Bufón en su lugar. El cartel de la segunda cara se va antes de que el Rey te pegue. La última frase del Rey se lee. La cuenta se puede apurar con un toque y cada palo suena distinto. Son arreglos de oficio y se notan cuadro por cuadro.

No llega al 8 por lo mismo de siempre, que esta vez aparece en otro lado. El número del daño se mudó para no pisar la cara del Rey y fue a chocar con el «¡ESCOBA!» grande en el golpe que abate (golpe-09). Además, el crítico, bien dicho ahora, quedó chico: un brillo en el renglón del desglose donde antes había un estallido falso. Y nadie lo vio moverse, porque la secuencia que lo filma no se generó. Diversión 8,0 (pesa doble). Veredicto 7,9.

**Contra el veredicto de la 0.18.0.** Resueltos: el «×2» del crítico sobre el total (P1), el Botín de cinco piezas sobre el Bufón (P1) y el cartel de la segunda cara encima del Rey que te pega (P2). De los menores se resolvieron la última frase del Rey y la falta de un toque para apurar. Siguen: los «+N» sobre la bandeja, el velo negro antes de ELEGÍ UN AMULETO (ahora P2) y los bocadillos sin coordinarse.

## Defectos menores

- Los «+N» de la bandeja se siguen montando. El apilado mide a escala 1, pero `numero` entra a escala 2 durante 70 ms: el «+1» azul tapa el «+12» (golpe-04, botin-brota-03) y el «+12» cae sobre los iconos (mando-03). `src/client/pantallas/mesa.ts:1223-1237` y `src/client/fx/efectos.ts:301`.
- En el Botín del teléfono, el grito del Personaje cae pegado al Bufón, a 600 px del retrato y con la cola hacia el título. Parece que habla el Bufón (390-rey-cae-11 y 12). El respaldo de pantalla entera no avisa: `src/client/hud.ts:362-365`.
- En el teléfono, la frase del Bufón «Limpito. Pasá a cobrar.» flota en medio de la mesa vacía, a 400 px de él (390-rey-cae-10). `src/client/pantallas/mesa.ts` (bocadillo en `despejar`, ~1034).
- Durante el conteo, el chip «¡ESCOBA!» brinca encima de LO ABATÍS y de SOBRAN (golpe-05). `src/client/estilos/mesa.css:404-408` (canto-salta sin `transform-origin` ni tope).
- La placa TE PEGA cambia de 21 a 17 en medio del golpe, sin ningún evento (rey-segunda-05 → 07). En juego real, con selección, no pasa, pero la secuencia deja ver que la placa sin selección y con selección dicen cosas distintas. `src/client/pantallas/mesa.ts:389` y `:462`.

## Qué haría en la próxima versión

Sigo defendiendo el **director de escena** en `src/client/fx/escena.ts`. Esta versión prueba que los carriles sueltos solo corren el choque de lugar. Cada capa (número, canto, cartel, bocadillo, grito, «+N») pide zona y ventana de tiempo. Lo que choca se encola unos 150 ms o cambia de carril, y el número siempre gana sobre el texto. Encima de eso:

- El crítico estalla en la cifra grande del MULTI, con su sello «×2» al lado y la cuenta sacudida.
- La elección de Amuleto se despliega desde su propia pieza del Botín, sin velo negro.
- Una **QA de colisiones en movimiento** sobre las ráfagas, que mida cuadro por cuadro el solape entre capas de texto.
- Las ráfagas obligatorias (rey-tajo con crítico) dejan la puerta en rojo si no se arman.

Con eso, el golpe que abate cantando sería el mejor momento del juego, y ahí sí pondría el 8.
