```json
{
  "jurado": "jurado-juice",
  "version": "0.18.0",
  "puntajes": { "claridad": 7.5, "diversion": 7.9, "estetica": 8.1, "veredicto": 7.9 },
  "defectos": [
    {
      "prioridad": "P1",
      "pantalla": "mesa · golpe con crítico (Punta y hacha)",
      "ventana": "1280x800 y 390x844 (en el teléfono es peor)",
      "archivo": "src/client/pantallas/mesa.ts:452-457 (estampa del crítico); conteo de la pieza 'x' en src/client/pantallas/mesa.ts:1116-1119",
      "que": "El «×2» del crítico se estampa en grande, en oro, sobre el total, después de que el total ya se reveló. Pero ese ×2 es el de Punta y hacha, que ya está adentro del MULTI 12 y del 312. En 1280 el cuadro clave se lee «26 × 12 = ×2» (rey-tajo-08). En 390 un «×2» de unos 130 px tapa el MULTI, el total y la CURA (390-rey-tajo-08). Al mismo tiempo, la ficha de la bandeja suelta otro «×2» a escala 2 que se sale del HUD por abajo (rey-tajo-05 y 08).",
      "por_que": "El remate miente: el jugador lee «312 ×2 = 624», pero LE QUEDAN 39 (351 − 312). Un multiplicador que se festeja dos veces le enseña una cuenta falsa justo en el golpe más grande. Lo de ponerlo «sobre el total» lo propuse yo en la 0.17 y estaba mal: el ×2 multiplica el Multi, no el total.",
      "propuesta": "Sacar la estampa que va después del golpe. El ×2 tiene su instante dentro del conteo, cuando entra la pieza 'x' (ya hay un frenar(60) ahí): un sello a escala 1,5 sobre la cifra del MULTI, que salta de 6 a 12 en ese mismo cuadro. El chip ¡CRÍTICO! queda como rótulo. El «×2» de la ficha, a escala 1 y dentro del viewport."
    },
    {
      "prioridad": "P1",
      "pantalla": "Botín después de un Rey (cobro encadenado)",
      "ventana": "1280x800 (y 390x844)",
      "archivo": "src/client/estilos/pantallas.css:2474-2486 (.botin-lista en fila sin wrap, .botin-fila.bp a 9.5fr); pieza nueva en src/client/pantallas/camino.ts:497 y 516",
      "que": "Con la Vida máxima nueva, el botín del Rey trae cinco piezas en una fila fija de unos 1215 px. Tapan al Bufón, que en el botín crece, y cortan su bocadillo: «Ag… tuy… ya» queda debajo de la pieza «+20 DE ORO» (rey-cae-10 y 11). En 390 el pie «El Rey vencido te curte» choca con «+12 DE VIDA MÁXIMA» (390-rey-cae-11). La QA no lo ve: el estado botin-grito tiene dos piezas.",
      "por_que": "Es el pago del momento más grande del tramo. El anfitrión desaparece detrás de su propio botín y la frase del cobro no se lee. Hasta la 0.17 esto era lo mejor del bucle: es una regresión.",
      "propuesta": "Las tres piezas que se cobran solas (oro, Vida, Vida máxima) van en una sola pieza «COBRADO», con tres renglones y tres iconos, y las que se eligen (Amuleto, Cábala) quedan grandes. Con más de cuatro piezas, `--kp` baja. La columna del Bufón y su bocadillo pasan a ser zona prohibida. Agregar un estado de QA `botin-rey` con cinco piezas en las cuatro ventanas."
    },
    {
      "prioridad": "P2",
      "pantalla": "mesa · segunda cara y el primer TE PEGA que la sigue",
      "ventana": "1280x800 y 390x844",
      "archivo": "src/client/pantallas/mesa.ts:939-940 (el cartel vive 1500 ms y la secuencia solo espera 950)",
      "que": "El cartel «SEGUNDA CARA · TAJO DE REVÉS» sigue encima del naipe del Rey cuando el Rey te pega: −17 en la Vida y −4 en el Escudo con el Rey tapado (rey-segunda-10 a 12). La embestida del naipe (`embiste`) pasa debajo del cartel.",
      "por_que": "La primera vez que el Rey en segunda cara te pega, el golpe no tiene origen visible. Es justo cuando el jugador tiene que entender que este Rey cambió. La anticipación (la embestida) se pierde detrás de un texto.",
      "propuesta": "El cartel se va antes del primer evento del enemigo: a los 950 ms sube al carril de arriba y se achica a rótulo, o la secuencia espera los 1500 ms enteros antes de `contra`. La embestida, siempre con el naipe del Rey limpio."
    }
  ],
  "aciertos": [
    "El conteo ahora tiene suspenso y remate: la previa dice LO ABATÍS o NO LO ABATÍS y la barra muestra la tajada sin cifra. Después la fórmula sube término a término, acelerando, y el total cae en oro con su sonido propio (`revela`, leído en código, no oído), un freno y una sacudida. Recién entonces aparece SOBRAN o LE QUEDAN (golpe-02 a 08).",
    "Los carriles funcionan: el número de tu golpe va arriba del naipe, el cartel de la segunda cara apaga los números en el aire (`limpiarNumeros`) y ya no hay «TAJO 240 REVÉS» (rey-segunda-07 contra 10). El rótulo del Tajo dice la misma fórmula que la placa: «24 ×2 = 48» (rey-tajo-10).",
    "El «−48» de TE PEGA nace sobre la VIDA y ya no sobre AL DESCARTE; el retrato se amorata (rey-tajo-12).",
    "El grito ya no tapa la Vida, el Escudo ni el Oro: en el cobro va arriba del HUD (rey-cae-11) y dura 1,2 s.",
    "La burla de la segunda cara entra en una línea y después del cartel («Y bue. A veces te toca.»).",
    "La derrota tiene vela y humo también en el teléfono (visual-qa/390x844/fin-derrota).",
    "Rendimiento intachable: 164 fps en las cuatro ventanas y peor cuadro de 12 ms bajo golpes."
  ],
  "capturas_vistas": [
    "jurado/secuencias/1280-golpe-00, 02, 04, 05, 06, 07, 08, 09; 390-golpe-03, 07, 09",
    "jurado/secuencias/1280-rey-cae-01, 03, 04, 05, 06, 08, 09, 10, 11, 12, 14, 16; 390-rey-cae-05, 11",
    "jurado/secuencias/1280-rey-tajo-00, 05, 08, 09, 10, 11, 12; 390-rey-tajo-08, 09",
    "jurado/secuencias/1280-rey-segunda-04, 07, 10, 12; 390-rey-segunda-09",
    "jurado/secuencias/1280-botin-brota-03, 07, 12; 1280-mando-06, 12; 1280-mapa-paso-02, 04; 1280-portada-03; 1280-rey-irrumpe-04",
    "mirar/1280-mesa-grito, 390-conteo",
    "visual-qa/1280x800/botin-grito, fin-derrota; visual-qa/390x844/fin-derrota",
    "jurado/fps.txt"
  ]
}
```

## Veredicto

La 0.18.0 hizo los deberes de coreografía. El golpe ahora tiene tres tiempos claros: la previa con suspenso, la cuenta que sube acelerando y el total que se asienta con freno y sonido. Recién después vuelan las cartas. Es lo más cerca de *Balatro* que estuvo CÁBALA. Cada cosa tiene su carril: tu número arriba, el cartel del Rey al medio y lo que te pega en tu Vida. Sube a 7,9.

No llega a 8 por dos regresiones de la misma familia de siempre. Una capa nueva se monta sobre otra, y esta vez una de ellas **dice un número falso**: el ×2 del crítico, festejado sobre un total que ya lo incluía. La otra es el botín del Rey, que creció a cinco piezas y se tragó al Bufón. Las dos pasan en los dos momentos de más pago del juego.

**Contra el veredicto de la 0.17.0.** Resueltos: el grito sobre la Vida, el Escudo y el Oro (P1), el «TAJO 240 REVÉS» y los dos ×2 en la cara del Rey (P1, aunque el arreglo del crítico abrió el P1 de arriba) y la regla de 7 renglones en el bocadillo (P2). También quedaron resueltos tres menores: el «−N» sobre AL DESCARTE, la vela del teléfono y la caída sin anticipación. Siguen: las fichas «+N» que se apilan sobre FORTUNA, la última frase del Rey bajo los rayos y el velo negro antes de ELEGÍ UN AMULETO.

**Lo que no pude juzgar.** El sonido `revela` (un sello hondo a 98 Hz con ruido filtrado y un acorde do–sol–do que lo corona) lo leí en código, no lo oí. La receta promete un golpe con cuerpo y no un pitido.

## Defectos menores

- Las fichas «+N» de la bandeja se siguen montando: «+3» cae sobre el 3 de FORTUNA y «+10» sobre su caja (golpe-07 y 09, botin-brota-03). El corrimiento de ±18 px no alcanza: `src/client/hud.ts:243-244`.
- El bocadillo del Rey («¡Así se pega, carajo!») pisa el del Bufón y tapa el escudo de INMUNE (rey-tajo-09 y 11). `reyDice` no esquiva otros bocadillos: `src/client/pantallas/mesa.ts:788-800`.
- La última frase del Rey sigue ilegible: queda debajo de los rayos y de las mitades del naipe (rey-cae-05, 390-rey-cae-05): `src/client/pantallas/mesa.ts:573-587`.
- Hay un instante de 3 a 4 cuadros con negro casi entero entre el BOTÍN y ELEGÍ UN AMULETO, con el título solo y SALTAR (rey-cae-12). El velo sigue siendo una costura: `src/client/estilos/pantallas.css:2202-2211`.
- No hay velocidad de juego ni toque para saltar la cuenta. Son hasta 1,6 s más 0,5 s de remate por golpe, y a la hora de juego cansa: `src/client/pantallas/mesa.ts:1052-1058` y `src/client/ritmo.ts`.

## Qué haría en la próxima versión

Un **director de escena** en `src/client/fx/`. No alcanza con carriles por evento: hace falta una línea de tiempo que reserve zona y momento para cada capa. Cada sello, cartel, número, bocadillo y grito pide una zona y una duración. Lo que choca se encola o se acorta, y ningún evento enemigo arranca mientras un cartel tapa al enemigo. Encima de eso:

- El crítico vive **dentro** de la cuenta, sobre el MULTI.
- El botín del Rey se compacta en COBRADO más las elecciones, y la elección de Amuleto brota del propio panel, sin velo.
- Una opción de **velocidad ×1 / ×2** y un toque para saltar la cuenta, como en *Balatro*.
- Una QA de **colisiones en movimiento**: sobre las secuencias, medir cuadro por cuadro el solape entre capas de texto, no solo en las fotos quietas.

Con eso el jugo deja de pelearse consigo mismo y llega el 8.
