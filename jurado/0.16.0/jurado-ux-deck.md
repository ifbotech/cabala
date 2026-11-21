```json
{
  "jurado": "jurado-ux-deck",
  "version": "0.16.0",
  "puntajes": { "claridad": 7.3, "diversion": 7.6, "estetica": 8.3, "veredicto": 7.4 },
  "defectos": [
    { "prioridad": "P1", "pantalla": "Mapa, tramo 2, con mando (foco en un nodo)", "ventana": "1280x800", "archivo": "src/client/pantallas/camino.ts:262-270 (corrimiento dy ±0,12 de piso) y :280 (nodo-aca); src/client/estilos/pantallas.css:210 (piso = 1,55 n) y :291-293 (.nodo-aca); src/client/ui.ts:137-143 (mostrarTip)", "que": "En 1280-mando-elige-01..04 el chip «ESTÁS ACÁ» queda tapado por los sellos de Inmune del nodo de arriba (se lee «ESTÁ  ACÁ» a medias), el tooltip «CÁBALA DEL BUFÓN» se apoya encima del propio nodo enfocado y del de su derecha, y la fila de abajo se corta bajo el HUD. Con el corrimiento vertical al azar, dos pisos quedan a ~1,2 n y no entran nodo + sellos + chip.", "por_que": "En la Deck el Mapa se juega solo con la cruceta: el jugador necesita ver dónde está y a qué nodo salta. Hoy el foco y la posición se tapan entre sí justo en el tramo 2, donde los caminos se cruzan y se decide la ruta al Rey.", "propuesta": "Bajar el corrimiento vertical a ±0,06 de piso o subir el piso a 1,8 n entre 1100 y 1699 px; poner «ESTÁS ACÁ» debajo del nodo (no encima, donde vive el piso siguiente) y con z-index sobre los sellos; con mando, el tooltip del nodo enfocado al costado (izquierda o derecha según la columna), nunca arriba." },
    { "prioridad": "P1", "pantalla": "mesa-segunda (Rey con segunda cara y carta elegida)", "ventana": "1366x768", "archivo": "src/client/estilos/mesa.css:1719-1723 (.e-barras margin-top -16px) y :2176-2192 (rejilla de la cuenta); src/client/pantallas/mesa.ts:226 (destino: chip «TAJO DE REVÉS ×2» + «TE PEGA 42» + ORO + LE QUEDAN)", "que": "El rótulo del Rey «TAJO DE REVÉS» (e-rasgo, bajo la barra de Vida) se monta sobre la cuenta y tapa el total «140» (se ve «14…») y el chip «TAJO DE REVÉS ×2» de la cuenta; el cetro del Bufón pisa «CARTA SOLA». La cuenta crece a tres renglones de cabecera (fórmula, ORO +1, LE QUEDAN 39) y el arreglo de la 0.15 (subir la barra 16 px) ya no alcanza. Las medidas dicen 0 recortes y 0 solapes: la puerta no lo ve.", "por_que": "Es la pelea más importante del tramo y el número que se tapa es el resultado del golpe. A 1280x800 entra por 4 px; en el portátil, no. El mismo nombre aparece dos veces en pantalla (rasgo y chip de la cuenta) robando el alto que falta.", "propuesta": "Con tajoAhora, fundir el chip de Tajo en «TE PEGA 42 ×2» (un solo chip) y poner el efecto de palo (ORO +1) en la fila de la fórmula; fijar la cabecera de la cuenta a dos renglones como máximo; y entre 1100 y 1699 px llevar el e-rasgo al costado de la barra de Vida. Sumar a la QA un chequeo de intersección entre .e-rasgo y .cuenta." },
    { "prioridad": "P2", "pantalla": "TE PEGA del Caudillo con el Tajo de revés armado", "ventana": "1280x800", "archivo": "src/client/pantallas/mesa.ts:144 (cifra x2 sin 'grande') y src/client/estilos/mesa.css:2494-2503 (.e-ataque.tajo .e-tajo)", "que": "Cuando la selección repite la jugada, el número grande sigue diciendo «21» (o «24») y el ×2 va en un chip con cifra de ~11 px reales debajo (mesa-segunda, 1280-rey-tajo-03). El golpe real, 42/48, solo aparece en el chip de la cuenta a 18 px.", "por_que": "Mi piso para cifras de juego a 40 cm es 24 px. La cifra que duplica lo que te pegan es la más chica de la columna del enemigo, y la grande miente: un jugador de Deck lee 21 y se come 42.", "propuesta": "Con tajoAhora, que la cifra grande pase a 42 (con el 21 tachado chico al lado o encima) y el ×2 a tamaño 'grande'; el temblor ya está, solo falta que el número diga la verdad." }
  ],
  "aciertos": [
    "El conteo ahora enciende cada sumando dentro del desglose fijo: se acabó el cartel flotante que tapaba la explicación (1280-golpe-04/06, 1280-mando-03); los términos apagados quedan en gris y el que dispara se ilumina en su lugar.",
    "Mesa de mando limpia: sin zona AL DESCARTE con data-entrada='mando', la mano de 8 del Mentiroso entra entera a 100 px con su Comodín y LT ENGAÑO a la vista (mesa-mentiroso.png).",
    "La bandeja del HUD va en dos filas de 42 px entre 1100 y 1699 px: se ve la build completa (mesa-mando, mesa-segunda); el «+9» y el «×2» brotan sobre la ficha que dispara.",
    "Secuencia 1280-mando de verdad: cruceta, A, X, cobro y Bendición con foco visible en cada paso (marco doble en ELEGIR y en la carta del medio); el foco inicial de la oferta cae en la primera opción.",
    "La segunda cara se anuncia como acto (cartel grande «SEGUNDA CARA · TAJO DE REVÉS» y el Bufón la explica a 18 px), y el daño recibido «-48» ya no cae sobre la cifra de VIDA. minPx 18 en las 28 pantallas de 1280 y las 28 de 1366; FPS 133,9 bajo golpes en 1280x800, peor cuadro 8 ms."
  ],
  "capturas_vistas": [
    "visual-qa/1280x800/mesa-mando.png", "visual-qa/1280x800/mesa-mentiroso.png", "visual-qa/1280x800/mesa-segunda.png", "visual-qa/1280x800/mesa-rey.png",
    "visual-qa/1280x800/mapa-mando.png", "visual-qa/1280x800/jugadas.png", "visual-qa/1280x800/piezas.png", "visual-qa/1280x800/fogon.png", "visual-qa/1280x800/elegi-una.png",
    "visual-qa/1366x768/mesa-segunda.png", "visual-qa/1366x768/mesa-seleccion.png", "visual-qa/1366x768/mesa-mando.png",
    "jurado/secuencias/1280-golpe-02/04/06/08.png", "jurado/secuencias/1280-mando-01/03/05/10/12/15/18.png", "jurado/secuencias/1280-mando-elige-01/02/04.png",
    "jurado/secuencias/1280-mapa-paso-03.png", "jurado/secuencias/1280-rey-segunda-04/09.png", "jurado/secuencias/1280-rey-tajo-03/09.png",
    "jurado/secuencias/1280-rey-irrumpe-04.png", "jurado/secuencias/1280-botin-brota-06/11.png", "jurado/secuencias/1280-rey-cae-08.png",
    "medidas.json de las 28 pantallas de 1280x800 y las 28 de 1366x768 (leídas con node)", "jurado/fps.txt"
  ]
}
```

## Veredicto

La 0.16.0 cumplió casi entero el paquete «el golpe se lee en Deck» que pedí: el conteo vive dentro del desglose, la mesa de mando ya no regala 152 px a un gesto imposible, la bandeja muestra la build completa y hay, por fin, una secuencia jugada con mando. En reposo y en el golpe común, la mesa a 1280x800 es de lo mejor que vi en esta silla. Lo que baja la nota es que lo nuevo (la segunda cara y el Tajo) y el Mapa del tramo 2 traen solapes que la puerta no mide: el total tapado en el portátil, «ESTÁS ACÁ» tapado en el Mapa y la cifra que duplica tu daño recibido a 11 px. Sigue en «Verificado con reparos», con menos reparos que en la 0.15.

**Seguimiento de la 0.15.0:** resueltos el P1 del cartel del conteo sobre el desglose, el P1 de la zona de descarte con mando y el P2 de la bandeja escondida. De los menores: resuelto el «-23» sobre VIDA; siguen el tooltip del Mapa (ahora peor: tapa el nodo enfocado), la falta de glifos B y Start, «Turno 1» a 18 px y los «+N» sobre las cartas (mesa.ts:926, ahora tapan pintas pero no índices).

Avisos sobre el material:

- Solo `1280-mando-*` va con `data-entrada='mando'`; golpe, rey-segunda, rey-tajo, botin-brota y rey-cae siguen en modo puntero («Elegí cartas y arrastralas al enemigo», AL DESCARTE visible). Ya están en castellano.
- Las capturas son de antes del cambio de versión: la portada dice «v0.15.0» (`src/shared/brand.ts` ya dice 0.16.0 sin confirmar).
- El volteo del naipe del Rey y el sonido del Tajo: leído en código, no visto entre cuadros ni oído.

## Defectos menores

- Sin glifo de B en CERRAR, SALTAR y ‹ VOLVER, ni de Start en MENÚ: el tipo `GlifoMando` incluye 'B' y nadie lo usa — `src/client/nav.ts:66-72`, `src/client/pantallas/camino.ts:253`.
- Al encenderse, los términos del desglose se tocan y se comen el separador («Carta sola 1▮Mano corta +4», 1280-mando-03 y 1280-rey-tajo-03) — `src/client/estilos/mesa.css` (.d-t encendido, padding sin margen).
- Con el foco a 1,1×, el naipe enfocado pisa el borde del HUD en 1366x768 (mesa-mando) y el elegido toca el borde de la cuenta en 1280 (mesa-segunda) — `src/client/estilos/mesa.css:1692-1731`.
- La ficha de la segunda fila del Mentiroso (icono en ángulo con marco en L) se lee como un «2» suelto a 40 cm — `src/client/hud.ts` (fichas de la bandeja).
- El banner de Bendición «CARA DE PÓKER» cruza la mesa en pleno golpe y tapa el «318» sobre el enemigo (1280-golpe-08) — `src/client/pantallas/mesa.ts` (aviso de pieza durante el cobro); esperar a que se cierre el conteo.

## Qué haría en la próxima versión

«Nada se tapa». Primero, un chequeo de intersección en la QA visual entre los bloques de la mesa (e-rasgo, cuenta, mano, HUD) y entre nodos, chip y tooltip del Mapa, en 1280 y 1366, con Rey en segunda cara y tramo 2 como estados fijos; hoy «0 solapes» solo mira dianas. Segundo, la cabecera de la cuenta a dos renglones como máximo, con el Tajo fundido en TE PEGA y la cifra grande diciendo 42. Tercero, el Mapa con pisos más altos o sin corrimiento vertical a esa ventana, «ESTÁS ACÁ» abajo y tooltip lateral con mando. Cuarto, glifos B y Start en todo volver y menú, y todas las secuencias de 1280 grabadas con mando. Nada toca reglas ni la Constitución.
