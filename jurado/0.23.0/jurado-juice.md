```json
{
  "jurado": "jurado-juice",
  "version": "0.23.0",
  "puntajes": { "claridad": 7.9, "diversion": 8.2, "estetica": 8.1, "veredicto": 8.1 },
  "defectos": [
    {
      "prioridad": "P1",
      "pantalla": "mesa · la irrupción del Rey después de abatir a la Corte",
      "ventana": "1280x800 (y toda ventana ancha); en 390x844 la banda la tapa",
      "archivo": "src/client/pantallas/mesa.ts:840-855 (caso 'entra': pinta al Rey y llama a `irrupcion` sin tocar la cuenta) · mesa.ts:792 (`despejar()` solo cuando cae el último de la mesa) · mesa.ts:1011-1019 (`irrupcion`, 1500 ms)",
      "que": "Mientras El Caudillo entra con su banda, su halo y su frase tecleada, la cuenta del golpe anterior sigue encendida debajo de su barra: «CARTA SOLA 42 × 4 = 168 · LO ABATÍS · SOBRAN 167», en verde y oro, al lado de «EL CAUDILLO 410/410» (1280-rey-irrumpe-07, 09 y 11). El veredicto que le correspondía a la Sota queda pegado al Rey durante toda la cortina.",
      "por_que": "Es la entrada más importante del tramo y lo primero que se lee bajo la cara del Rey es «LO ABATÍS». Ensucia la escena y miente durante un segundo y medio. En *Hades*, cuando entra el jefe, la pantalla queda para él.",
      "propuesta": "En `entra` con `ev.jefe`, antes de `irrupcion`, vaciar o apagar `[data-cuenta]` (que se retire hacia abajo en 3 pasos, como hace `despejar` con la pelea) y volver a pintarla con `pintarCuenta()` cuando termina la cortina. Mejor todavía, que la cuenta reaparezca con un sello «NUEVO RIVAL» que haga un clic."
    },
    {
      "prioridad": "P1",
      "pantalla": "El Fogón · la tercera pasada (¡FORJA BRAVA!)",
      "ventana": "todas (visto en 1280x800 y 390x844)",
      "archivo": "src/client/pantallas/camino.ts:948-953 (el mismo `sonar('suspenso')` y la misma `pausa(820)` para las tres pasadas) · camino.ts:972-985 (`fogonazo`, `destello` y `chispas`, sin `frenar` ni `sacudir`) · audio.ts:74 (`suspenso`: siete notas fijas)",
      "que": "Ahora elegís entre Doble Filo y Chispa de Oro con su costo a la vista, y eso está muy bien (fogon-mutaciones). Pero la apuesta más brava del juego, un 50 % de que se queme el naipe, tiene el mismo suspenso que la primera pasada, que arriesga un 35 %: los mismos 820 ms y la misma escalera de siete notas. Al salir hay un destello y un rótulo, pero ni hitstop ni sacudida. Después queda un panel quieto con «+12★ ×2» y una mitad vacía (forja-brava en 1280, y en 390 todavía más vacía). En el teléfono, además, el fuego es una llamita de 20 px muy lejos del naipe que tiembla.",
      "por_que": "Es el titular de la Forja de esta versión y la única apuesta de 50/50 de la partida. Si suena igual que una pasada cualquiera, no se siente como una apuesta. El «cha-ching» tiene que crecer con el riesgo.",
      "propuesta": "Que el suspenso crezca con cada pasada: 820, 1100 y 1500 ms, con la escalera de `suspenso` subiendo una quinta y el naipe que baja hasta la llama (en 390 también). En la tercera, al salir templado, `frenar(120)`, `sacudir` y la cifra del naipe que se duplica a la vista: el «+12» rueda hasta «+24» con `numero`. Si se quema, que se rompa en el mismo hitstop."
    },
    {
      "prioridad": "P2",
      "pantalla": "Final · resumen en dos capas (PRÓXIMO RÉCORD)",
      "ventana": "1280x800 y 390x844",
      "archivo": "src/client/pantallas/camino.ts:1228-1229 (dos `cifra` grandes en columnas pegadas) · pantallas.css:3919-3925 (`gap: var(--u)`) · camino.ts:1278-1281 (`alMontar`: un sonido y, si ganás, la lluvia de monedas; nada cuenta)",
      "que": "En la derrota, «ESTA TU MEJOR» y debajo «819 1284» se leen como un solo número, 8191284 (resumen-derrota 1280). En la victoria, el «¡NUEVO RÉCORD!» es un chip de texto y el 5445 aparece ya escrito (resumen-victoria 390). El MEJOR GOLPE no sube contando, el récord no le gana visiblemente al anterior y el Bufón no lo festeja.",
      "por_que": "La pantalla final es la que te convence de apretar OTRA MANO YA, y un récord nuevo es la mejor razón para hacerlo. Hoy el gancho existe, pero no se siente.",
      "propuesta": "Separar las dos cifras con un «vs» o una raya vertical. Al montar, el MEJOR GOLPE sube contando en 600 ms con su `tic`. Si hay récord, la cifra vieja se tacha, la nueva la empuja y estampa el sello ¡NUEVO RÉCORD! con `destello`, `sonar('exacto')` y `gestoBufon('risa')`. Y que OTRA MANO YA lata recién cuando termina la cuenta."
    }
  ],
  "aciertos": [
    "Mi P0 de la 0.22 quedó resuelto: el jackpot muestra el antes y el después (Poncho ▶ Garrote, con dibujo propio), tiene 400 ms que no se cortan y después la ficha vuela a su hueco del HUD y late (evolucion.ts:42-74 y 119). En el HUD, el Garrote verde se distingue de una mirada (hud-evolucion). La línea propia del Bufón la leí en código (`VOZ.evoluciona`, evolucion.ts:84) pero no la vi: la foto de QA todavía muestra la frase genérica.",
    "Coser tiene su momento: una aguja con hilo negro va del segundo naipe al primero, el segundo se monta encima y se apaga, y cierra un fogonazo violeta con tres puntadas y un nudo de sonido (camino.ts:1003-1034, audio.ts:50; leído en código, no visto). En el teléfono, la grilla en filas por número se lee bien (cabala-negra 390).",
    "El Tesoro es un baúl de hierro a escala del nodo, que en el Mapa se ve junto a la calavera sin perderse (mapa-tesoro). Al pagar, el candado cede con dos clacs, la tapa salta y sale un destello de oro antes de la oferta (camino.ts:644-660).",
    "El Tajo de revés está más limpio: el 230 se apaga con `limpiarNumeros(true)`, el rótulo ya no tapa la cara del Rey y en el teléfono la placa TE PEGA le cede el lugar (1280 y 390-rey-tajo-11 y 12). El «−48» cae junto a VIDA con el corazón partido y el retrato en mueca.",
    "Rendimiento intachable: 133–134 fps en las cuatro ventanas y 0 % de cuadros largos. El peor cuadro es de 23 ms con golpes a 1366, todavía por debajo del tope."
  ],
  "capturas_vistas": [
    "jurado/secuencias/1280-rey-tajo-10, 11, 12; 390-rey-tajo-11, 12",
    "jurado/secuencias/1280-rey-irrumpe-02, 05, 07, 09, 11; 390-rey-irrumpe-04, 09, 11",
    "jurado/secuencias/1280-golpe-03, 06, 09; 390-golpe-06; 1280-rey-cae-06; 1280-botin-brota-08",
    "visual-qa/1280x800/evolucion-jackpot, hud-evolucion, oferta-evoluciona, fogon-mutaciones, forja-brava, cabala-negra, botin-tesoro, mapa-tesoro, mesa-exacto, altar-devolver, resumen-derrota",
    "visual-qa/390x844/evolucion-jackpot, resumen-victoria, cabala-negra, fogon-mutaciones, forja-brava, botin-tesoro",
    "mirar/1280-fogon-suspenso",
    "jurado/fps.txt"
  ]
}
```

## Veredicto

La 0.23.0 hace lo que le pedí a la 0.22: cada novedad del Salto tiene su momento. La Evolución se transforma delante tuyo y vuela al HUD. Coser cose, con aguja e hilo. El Tesoro se abre con candado y tapa. El Tajo de revés dejó de ser una pila de carteles. Elegir la mutación de la Forja y el chip EXACTO suman decisiones de verdad al juego, y OTRA MANO YA acorta a cero el paso de una partida a la siguiente. Lo que todavía no está a la altura son los bordes de esos momentos: la cuenta vieja que queda colgada en la entrada del Rey, una Forja Brava que suena igual que una pasada cualquiera y un récord que no se festeja. No hay nada que rompa la experiencia, así que esta vez no pongo ningún P0. Diversión 8,2 (pesa doble), veredicto 8,1.

**Contra la 0.22.0.** Resueltos: el P0 del jackpot (antes ▶ después, dibujo propio, 400 ms firmes, vuelo al HUD), el P1 de Coser y el Tesoro, y en buena parte el P1 del Tajo. También dos menores: `rey-irrumpe` ya filma al Rey y la regla del paño dejó de flotar en la caída. Siguen el suspenso plano de la Forja (ahora es P1) y el «−N» del teléfono encima de la fila de botones.

## Defectos menores

- En 390, el «−48» se apoya sobre GOLPEAR / DESCARTAR, que queda como «GOLPE…» (390-rey-tajo-12): `src/client/pantallas/mesa.ts:896`.
- En 1280, el rótulo del Tajo ahora tapa el resultado de la cuenta y el nombre «EL CA…» del Rey. Además, el 48 sigue tres veces a la vista: en la placa, en el chip y en el rótulo (1280-rey-tajo-12): `mesa.ts:1464-1468` y `rotuloRey` en `mesa.ts:1126`.
- Coser: después de la aguja se repinta la grilla sin marcar el naipe que quedó ni su número nuevo, y el Bufón no dice nada. Trasplantar sigue sonando a moneda: `camino.ts:1167-1178`.
- Jackpot: el icono despierto mide unos 50 px dentro de un marco de 600, y el título en letras queda más grande que el premio (evolucion-jackpot 1280): `pantallas.css:3411-3415` (`--kd`).
- La mudanza del dial EXACTO ↔ MÁXIMO suena 'exacto', pero no se ve qué naipe cambió de Posta (leído en código, no visto): `mesa.ts:2085-2094`, `mano.ts:887-897`.

## Qué haría en la próxima versión

Un paquete de «los bordes del momento», con secuencias propias en la QA (`evolucion`, `coser`, `cofre`, `forja-brava`, `fin-record`, a 1280 y a 390), porque hoy esos cuatro momentos los conozco por el código y no por cuadros. Primero, la entrada del Rey con la mesa limpia: la cuenta se retira y vuelve después de la cortina. Segundo, una Forja que escala: suspenso de 820, 1100 y 1500 ms; el naipe que baja a la llama; y en la tercera pasada hitstop, sacudida y la cifra que se duplica rodando. Tercero, un final que cuenta: el mejor golpe sube, el récord viejo se tacha, se estampa el sello y el Bufón se ríe antes de que lata OTRA MANO YA. Cuarto, el jackpot con el icono despierto al triple y una sacudida de la capa cuando entra. Con eso, la 0.24 pasaría el 8,4.
