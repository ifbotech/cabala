```json
{
  "jurado": "jurado-arte",
  "version": "0.20.0",
  "puntajes": { "claridad": 7.6, "diversion": 7.4, "estetica": 8.0, "veredicto": 7.7 },
  "defectos": [
    {
      "prioridad": "P1",
      "pantalla": "del Botín a «ELEGÍ UN AMULETO» (y toda oferta que se abre sobre el Botín)",
      "ventana": "1920x1080, 1280x800 y 390x844",
      "archivo": "src/client/estilos/pantallas.css:2850-2861 (.velo.sobre-botin a 0.3 y .botin.eligiendo .botin-panel visible con brightness 0.38) y :2211-2212; src/client/pantallas/camino.ts:413 y :440",
      "que": "Sacar el velo negro dejó dos escenas encimadas. En 1920 elegi-amuleto el Bufón queda detrás de las ofertas: se ven las puntas del gorro, un brazo y el bastón, y el título «ELEGÍ UN AMULETO» le cruza la cara. Entre la segunda y la tercera carta asoma un naipe atenuado del Botín. En 1280 rey-cae-17 las cinco piezas del Botín sobresalen por los dos lados de las tres ofertas, con letras sueltas («LA», «N», «R») y la vela le atraviesa la túnica al Bufón. A 390 (rey-cae-18), debajo de la última oferta asoma la fila «Cábala del Bufón» con su ELEGIR al lado de SALTAR: dos llamados a la acción, uno de ellos fantasma.",
      "por_que": "Es la decisión más importante del run (qué Amuleto llevás) y hoy se ve como un error de capas. El anfitrión, que es la firma del juego, aparece mutilado. Inscryption o Balatro nunca dejan que la elección compita con lo que hay detrás.",
      "propuesta": "Mientras se elige, el Botín se pliega en una pila de naipes boca abajo detrás del título, o se oculta salvo la pieza que se despliega. Velo a 0.65 sobre las tablas y nada del Botín por fuera de las tres cartas. El Bufón se corre a la izquierda de las ofertas, entero, y el título se alinea al bloque de cartas y no al centro de la pantalla. A 390, display:none para .botin-panel mientras dura .eligiendo. Sumar elegi-amuleto a la puerta de solapes: ninguna .opcion encima de .anfitrion ni de .botin-panel."
    },
    {
      "prioridad": "P1",
      "pantalla": "Altar y Colección (las escenas nuevas)",
      "ventana": "1920x1080, 1280x800 y 390x844",
      "archivo": "src/client/fx/escenas.ts:538-551 (albedo de las paredes ×0.7 a la derecha y ×0.55 en el rincón), :552-578 (milagritos de lata de 9 px), :536 (yMesa = 0.86H), :683 (farol en 0.025W); src/client/pantallas/menu.ts:194 (al-velas sin icono propio); src/client/estilos/pantallas.css:2894-2937",
      "que": "El Altar promete un rincón de adobe con milagritos y una mesa de paño, pero en la captura casi no se ve. Las paredes quedan negras, la arista del rincón no aparece y los milagritos parecen manchas grises sueltas (corazones y una «L» flotando). La mesa del altar es una franja en el 14 % de abajo, con los cirios en las puntas. El panel y el Bufón flotan en el medio y arriba quedan 250 px de nada. Las siete ofrendas son la misma fila de velas: nada distingue Vida Inicial de Oro de Arranque, ni a 1920 ni a 390 (y a 390 no hay Bufón). En la Colección el farol queda contra el borde izquierdo, con el gancho cortado, y entre el panel y el zócalo hay 240 px de pared vacía.",
      "por_que": "Era mi P1 de la 0.19 y quedó a medio camino. Portada y Ajustes sí son lugares ahora, sobre la mesa de tablas con su vela, pero el Altar sigue siendo un panel con un friso de velas abajo. Un escenario que no se ve no es un escenario.",
      "propuesta": "Subir la mesa del altar a 0.62H y apoyar las ofrendas sobre el paño como objetos, no en un panel. Cada ofrenda, un exvoto propio a 2× (corazón para Vida, moneda para Oro, balanza para Descuento, herradura para Suerte, corona para Reyes, hueco de chinche para el Amuleto, tijera para Purga), con sus velas debajo. Que los cirios iluminen el revoque: albedo de la pared a 0.9, luz con g 0.8 y milagritos al doble y prendidos por la vela más cercana. En la Colección, farol en 0.06W con su gancho entero y zócalo a 0.74H, para que el panel apoye en él."
    },
    {
      "prioridad": "P2",
      "pantalla": "mesa, el conteo (las cifras que suelta la bandeja de Amuletos)",
      "ventana": "1280x800 y 1366x768",
      "archivo": "src/client/fx/director.ts:24 (ZONAS_PROHIBIDAS sin .acciones ni la bandeja) y src/client/pantallas/mesa.ts:1366-1368 y :1405-1406 (soltarCifra)",
      "que": "El director de escena ordenó bien lo de arriba (golpe-09: el «301» sale limpio a la derecha del naipe, sin pisar sellos ni canto), pero los «+N» de la bandeja buscan renglón libre hacia arriba y caen sobre los botones. En 1280-golpe-04 hay un «+1» de 60 px encima de la bandeja y un «+20» suelto en el aire. En golpe-07 se lee «+1OLPEAR» y en golpe-09 un «+1» tapa DESCARTAR.",
      "por_que": "Justo en el instante en que el jugador mira GOLPEAR para la próxima jugada, el botón queda sucio de cifras. Además, la cifra no dice de qué Amuleto viene, porque se aleja de su ficha.",
      "propuesta": "Sumar '#app .acciones button' y la fila de fichas a ZONAS_PROHIBIDAS, y que los «+N» de la bandeja suban solo dentro de la columna de su ficha, a escala 1 y en tamaño fijo (el de 60 px es de otra capa). Si no hay lugar, la ficha brilla y no suelta cifra: el desglose ya la muestra encendida."
    }
  ],
  "aciertos": [
    "El remate con canto ya no se apila: en 1280-golpe-09 el «301» sale al costado, lejos de INMUNE A ESPADAS, y el grito del Personaje se corre. Era mi P1 de la 0.19.",
    "La Portada y los Ajustes son un lugar: mesa de tablas con su vela, el abanico de Dorsos y el Bufón sentado en la escena. El Altar pasó de planilla a una vela por nivel y un solo MEJORAR, mucho más legible.",
    "La vela de la mesa ya no queda tapada bajo la cuenta en la Deck (1280 y 1366 mesa-seleccion).",
    "La victoria con amanecer y los Reyes tachados sigue siendo el mejor cuadro del juego. El retrato del Rey que irrumpe (El Bacanal, rey-irrumpe-05) está a la altura."
  ],
  "capturas_vistas": [
    "visual-qa/1920x1080/altar.png", "visual-qa/1920x1080/coleccion.png", "visual-qa/1920x1080/portada.png",
    "visual-qa/1920x1080/elegir-mazo.png", "visual-qa/1920x1080/ajustes.png", "visual-qa/1920x1080/mesa.png",
    "visual-qa/1920x1080/mesa-grito.png", "visual-qa/1920x1080/mapa.png", "visual-qa/1920x1080/botin-rey.png",
    "visual-qa/1920x1080/pulperia.png", "visual-qa/1920x1080/fin-victoria.png", "visual-qa/1920x1080/elegi-amuleto.png",
    "visual-qa/1280x800/mesa.png", "visual-qa/1280x800/mesa-seleccion.png", "visual-qa/1280x800/altar.png",
    "visual-qa/1366x768/mesa-seleccion.png",
    "visual-qa/390x844/mesa.png", "visual-qa/390x844/altar.png", "visual-qa/390x844/coleccion.png", "visual-qa/390x844/portada.png",
    "jurado/secuencias/1280-golpe-04.png", "jurado/secuencias/1280-golpe-07.png", "jurado/secuencias/1280-golpe-08.png", "jurado/secuencias/1280-golpe-09.png",
    "jurado/secuencias/1280-botin-brota-05.png", "jurado/secuencias/1280-botin-brota-08.png", "jurado/secuencias/1280-botin-brota-11.png",
    "jurado/secuencias/1280-rey-irrumpe-05.png", "jurado/secuencias/1280-rey-segunda-06.png", "jurado/secuencias/1280-rey-segunda-10.png",
    "jurado/secuencias/1280-rey-cae-08.png", "jurado/secuencias/1280-rey-cae-12.png", "jurado/secuencias/1280-rey-cae-17.png",
    "jurado/secuencias/390-golpe-07.png", "jurado/secuencias/390-golpe-09.png",
    "jurado/secuencias/390-rey-cae-12.png", "jurado/secuencias/390-rey-cae-14.png", "jurado/secuencias/390-rey-cae-18.png",
    "mirar/1280-conteo.png", "mirar/1280-comodin-espectral-racha.png", "mirar/1280-fogon-suspenso.png"
  ]
}
```

## Veredicto

La 0.20.0 cobra el más viejo de mis reclamos sobre el combate: el golpe festejado ya no es una pila de letras. El «301» sale al costado, el canto no lo pisa y los sellos del enemigo quedan limpios. Lo del metajuego salió a medias. La Portada y los Ajustes ya están sobre la mesa de tablas y se sienten del mismo juego que el combate. El Altar ganó legibilidad (velas por nivel, un solo MEJORAR), pero su escena casi no se ve, y la Colección sigue siendo un panel con mucho vacío debajo. Estética llega a 8,0 justo. No sube más por una regresión nueva: sacar el velo negro del Botín encimó dos escenas y dejó al Bufón asomando detrás de la oferta de Amuletos. Claridad sube a 7,6. Diversión, a 7,4: el remate ahora se festeja limpio, pero los botones se ensucian con cifras.

**Respecto de la 0.19.0:** resuelto el P1 del choque número/canto (golpe-09). El P1 del metajuego como lugar está a medias: resuelto en Portada, Ajustes y Elegí tu Mazo; no en Altar ni Colección. El P2 de la Deck, a medias: la vela ya no se tapa, pero la mano sigue hundida y el naipe del enemigo, pegado al borde de arriba. De los menores siguen la mesa vacía tras abatir, «TAJO DE REVÉS» dos veces y el mapa montado sobre el horizonte. El grito sobre GOLPEAR a 390 no lo volví a ver.

## Defectos menores

- **Deck: la mano sigue hundida unos 44 px bajo el HUD** (al 4 de Oros le falta el índice de abajo) y la Sota y el Caudillo tocan el borde de arriba: en rey-segunda-10 el naipe sale de cuadro. `src/client/estilos/mesa.css:3329-3333`.
- **El cartel de la segunda cara tapa la cara del Rey** justo cuando se da vuelta, y convive con el rótulo fijo «TAJO DE REVÉS» (1280-rey-segunda-10). Que el cartel baje por debajo del naipe. `src/client/pantallas/mesa.ts:1125`.
- **Mesa vacía tras abatir:** en 1280-botin-brota-08 solo queda «210» sobre las tablas. En rey-cae-08, «+21» pisa el rótulo ORO. `src/client/pantallas/mesa.ts:1154` (despejar).
- **Tres escalas del Bufón en el mismo combate:** unos 60 px en la mesa a 1280, unos 180 en el Botín y unos 280 en el Fogón. Salta de tamaño sin transición. `src/client/estilos/mesa.css:582` y `:3329` (--k-bufon).
- **Mapa:** la primera fila de nodos sigue sobre ranchos y molinos, y 6 de los 9 nodos son espadas cruzadas. `src/client/fx/escenas.ts:1189` y `src/client/pantallas/camino.ts`.

(Portada y Ajustes dicen «v0.19.0»: las capturas son de antes del cambio de versión, no lo cuento.)

## Qué haría en la próxima versión

**Una sola regla de capas y el Altar de verdad.** Primero, toda oferta abierta sobre otra pantalla pliega lo de abajo en una pila y deja al Bufón entero a un costado, con la puerta de solapes extendida a las ofertas y a los botones de acción (y las cifras de la bandeja dentro de su columna). Segundo, rehacer la luz del Altar y la Colección para que la escena se lea. La mesa del altar sube a 0.62H, las ofrendas pasan a ser exvotos dibujados (uno por mejora, a 2×) apoyados sobre el paño, y los cirios iluminan el revoque y los milagritos. En la Colección, el zócalo sube a 0.74H, así la pared de naipes clavados no queda flotando. Tercero, el Bufón a una sola escala por ventana: en la Deck, 2× en la mesa y en el Botín. Con eso, estética pasa el 8 sin peros y claridad llega a 8.
