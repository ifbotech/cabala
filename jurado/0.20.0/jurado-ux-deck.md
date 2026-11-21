```json
{
  "jurado": "jurado-ux-deck",
  "version": "0.20.0",
  "puntajes": { "claridad": 8.2, "diversion": 7.9, "estetica": 8.5, "veredicto": 8.1 },
  "defectos": [
    { "prioridad": "P1", "pantalla": "Mesa con mano de 8 naipes montados (mesa-escudo, mesa-mentiroso, ES y EN)", "ventana": "1280x800 (y 1366x768)", "archivo": "src/client/estilos/mesa.css:3561-3611 (.carta:focus-visible no sube de z-index y la ▼ va a left:50% del naipe entero)", "que": "Con 8 naipes, cada uno asoma una franja de 104 px (99 px a 1366; dato de medidas.json). El 1 de Oros tiene el foco, pero queda debajo del 3 de Espadas. Del marco celeste se ven unos 15 px a la izquierda y un pedazo que asoma bajo el HUD. La ▼ se dibuja a la mitad del naipe entero (x≈130), justo sobre la costura con el 3 (que empieza en x≈140). A 40 cm la flecha apunta al 3 tanto como al 1. La elegida (4 de Espadas) sí sube y se ve entera; la enfocada no.", "por_que": "Es la mano del Mentiroso y la de cualquier Mazo con Dar de abajo: el caso donde más se usa la cruceta. Ahí la pregunta «¿dónde estoy?» no tiene respuesta. Elegís a ciegas y te enterás por la previa.", "propuesta": "En la mano montada, que la enfocada pase al frente (z-index por encima de sus vecinas, sin moverse de su lugar) y que la ▼ se centre en la franja visible (left: franja/2), no en el naipe entero. Regla de QA a 1280: elementFromPoint bajo la punta de la ▼ tiene que devolver la carta enfocada, con un estado mesa-escudo-mando (foco en la 2.ª, la 5.ª y la 8.ª carta)." },
    { "prioridad": "P2", "pantalla": "Lo que vuela y la cabecera pisan controles e índices (golpe-05/07, rey-tajo-06, mirar/1280-comodin-espectral-racha y 1280-conteo)", "ventana": "1280x800", "archivo": "src/client/fx/director.ts:24 (ZONAS_PROHIBIDAS no incluye .botones ni el índice del Rey); src/client/pantallas/mesa.ts:1380 (el «+N» del naipe) y :532 (chip de racha en la cabecera)", "que": "Un «+1» azul se clava sobre el glifo X de GOLPEAR y se lee «+1OLPEAR» durante tres cuadros. Otro «+2» se pega al borde de GOLPEAR en el Tajo. En la cabecera, «STREAK ×2» (RACHA ×2) tapa el «1» del índice «10» del naipe del Rey. Eso ya lo había marcado en la 0.19 y sigue igual.", "por_que": "El director de escena cuida el total, la Vida y el Escudo, pero no los botones ni los índices. En la Deck, el glifo es lo que te dice qué apretar, y el índice del Rey es su cifra de identidad.", "propuesta": "Sumar '#app .mesa .botones .btn' y '.e-carta .c-indice' a ZONAS_PROHIBIDAS. Pasar el chip de racha a la línea de turno, a la izquierda de «Turno N», con max-width que corte antes del naipe del Rey, o ponerlo debajo del título. Que la QA en movimiento mida también estas zonas." },
    { "prioridad": "P2", "pantalla": "Elegí una Bendición (elegi-bendicion, 1280-mando-14 y 1280-mando-18)", "ventana": "1280x800", "archivo": "src/client/estilos/pantallas.css:359-385 (.oferta y .opciones: el retrato del Rey alarga la tarjeta y empuja SALTAR)", "que": "Las tarjetas con retrato llegan hasta y≈655. SALTAR (+4 DE ORO) cae sobre el HUD (y 655-715): tapa el rótulo ORO, medio retrato y el rótulo MAZO. En la Cábala y el Amuleto, SALTAR queda arriba del HUD; en la Bendición, no.", "por_que": "Justo ahí se elige Filo Dorado («+1 de Daño por cada 5 de oro que tengas») o Interés Compuesto, que dependen del Oro. Lo que tenés que mirar para decidir queda debajo de un botón. Además, un botón encima del HUD rompe la lectura de qué es modal y qué es fondo.", "propuesta": "En el escalón 1100–1699, retrato del Rey a k 1 en .o-bendicion (o el retrato al costado del nombre) para que SALTAR entre arriba del HUD. Regla de QA: ningún botón del velo cruza [data-hud-oro] ni [data-hud-vida]." }
  ],
  "aciertos": [
    "Una gramática de mando de punta a punta: A en ELEGIR, COMPRAR y DESCANSAR (y en la esquina de la opción enfocada), B en SEGUIR, SALTAR, SALIR y CERRAR, y ≡ Start en MENÚ. Visto en botin-rey, elegi-*, pulperia, fogon, jugadas, piezas y mapa-mando, y la QA lo vigila (glifo-mando).",
    "La cuenta con Escudo propio ya no se parte. «TE PEGA 3 (23 − 20 ESCUDO) · LE QUEDAN 322» entra en un renglón en ES y en EN (mesa-escudo), y la mesa queda quieta entre mesa, mesa-mando y mesa-seleccion.",
    "El foco celeste con su ▼ es ahora uno solo en Botín, ofertas, Mapa, Pulpería y Fogón: se encuentra al primer vistazo a 40 cm.",
    "Mapa legible: la ayuda del nodo va al lado del nodo, con escudos de Inmunidad de unos 60 px, y «ESTÁS ACÁ» queda clavado en su nodo con flecha y filo de oro (mando-elige-03, mapa-mando).",
    "minPx 18 en las 70 pantallas de 1280 y 1366, dianas de 48 px o más, 0 solapes y 0 recortes; FPS 164,8 bajo golpes a 1280x800, con peor cuadro de 6 ms."
  ],
  "capturas_vistas": [
    "visual-qa/1280x800/mesa.png", "visual-qa/1280x800/mesa-mando.png", "visual-qa/1280x800/mesa-seleccion.png", "visual-qa/1280x800/mesa-escudo.png",
    "visual-qa/1280x800/mesa-mentiroso.png", "visual-qa/1280x800/mesa-conteo.png", "visual-qa/1280x800/mesa-rey.png", "visual-qa/1280x800/mesa-segunda-cambia.png",
    "visual-qa/1280x800/mesa-grito.png", "visual-qa/1280x800/botin-rey.png", "visual-qa/1280x800/elegi-una.png", "visual-qa/1280x800/elegi-amuleto.png",
    "visual-qa/1280x800/elegi-bendicion.png", "visual-qa/1280x800/mapa-mando.png", "visual-qa/1280x800/pulperia.png", "visual-qa/1280x800/fogon.png",
    "visual-qa/1280x800/jugadas.png", "visual-qa/1280x800/piezas.png", "visual-qa-en/1280x800/mesa-escudo.png",
    "jurado/secuencias/1280-mando-03/10/14/18.png", "jurado/secuencias/1280-mando-elige-03.png",
    "jurado/secuencias/1280-golpe-05/07.png", "jurado/secuencias/1280-rey-segunda-04/11.png", "jurado/secuencias/1280-rey-tajo-06/09.png",
    "jurado/secuencias/1280-rey-irrumpe-05.png", "jurado/secuencias/1280-rey-cae-11.png", "jurado/secuencias/1280-botin-brota-10.png", "jurado/secuencias/1280-mapa-paso-03.png",
    "mirar/1280-comodin-espectral-racha.png", "mirar/1280-conteo.png",
    "medidas.json de las 70 pantallas de 1280x800 y 1366x768 (node)", "jurado/fps.txt"
  ]
}
```

## Veredicto

La 0.20.0 hizo lo que pedí en el paquete anterior: la Deck ya habla mando en todas las pantallas. Cada botón dice qué botón es, B siempre es volver o saltar, y el foco celeste es el mismo en la mesa, el Botín, las ofertas, el Mapa, la Pulpería y el Fogón. La cuenta con Escudo entra en un renglón y la mesa no se mueve. Con cruceta, una partida entera se juega sin preguntarte dónde estás… salvo cuando la mano se llena. Con 8 naipes, el foco queda escondido debajo de la carta vecina y la flecha cae sobre la costura entre las dos. Lo demás son roces de capas: números que se posan sobre GOLPEAR, la racha sobre el índice del Rey y SALTAR sobre el Oro en la Bendición. Paso de «casi verificado» a recomendable con un solo pero.

**Seguimiento de la 0.19.0:** resueltos mis tres defectos: la cuenta con Escudo (mesa-escudo, ES y EN), los glifos B y Start en toda la interfaz y los Inmunes del Mapa, con ayuda grande al lado del nodo. También quedaron resueltos «ESTÁS ACÁ», los «+N» que caían sobre las fichas de la bandeja (ahora nacen arriba de la fila) y las secuencias grabadas en modo puntero (ahora salen con glifos de mando). Sigue: el chip de racha sobre el índice del Rey. La ▼ escondida bajo la cuenta pasó a otro caso: ahora se pierde en la mano montada.

Aviso sobre el material: la portada de 1280 y 1366 sigue diciendo «v0.19.0»; las capturas son anteriores al commit de versión. Los sonidos los leí en el código, no los oí.

## Defectos menores

- En «Lo que llevás», el foco es un marco hueso, no celeste: `.pieza-fila` no entra en el selector del foco común (`src/client/estilos/mesa.css:3811`).
- En JUGADAS y en «Lo que llevás», lo que queda bajo el pliegue (Glosario, Bendiciones) solo se alcanza con la palanca derecha, y la ▼ del pie no lleva glifo que lo diga (`src/client/nav.ts:205-207`, `src/client/pantallas/camino.ts:179`).
- Falta un espacio en «TE PEGA 3(23 − 20 ESCUDO)» y en «HITS YOU FOR 1(23 − 22 SHIELD)», en la cuenta (`src/client/pantallas/mesa.ts:338-339`, frenaEscudo).
- «DEGÜELLO» reemplaza a «LE QUEDAN» sin decir que el enemigo cae. Quien no leyó la Bendición no lo entiende (`src/client/pantallas/mesa.ts:353-354`); conviene «DEGÜELLO · CAE».
- En el Botín, el glifo A queda montado a medias sobre el marco de ELEGIR y parece pegado encima (botin-rey; `src/client/estilos/mesa.css:3800`).

## Qué haría en la próxima versión

**«La mano llena, a la vista».** Uno: en la mano montada, la enfocada pasa al frente, la ▼ se centra en su franja y su ayuda dice el número y el palo en grande. Con eso, la cruceta con 8 naipes rinde igual que con 3. QA: un estado mesa-escudo-mando con el foco en tres posiciones, y que bajo la flecha esté la carta enfocada. Dos: ampliar las zonas prohibidas del director de escena a los botones, los glifos, los índices del Rey y el HUD de Oro, y medirlas en todas las secuencias de 1280. Tres: la Bendición en la Deck con retrato compacto y SALTAR fuera del HUD. Cuatro: el foco celeste también en «Lo que llevás» y en la Colección, y un glifo de palanca derecha (RS) en todo rollo que no entra. Cinco: el chip de racha fuera de la órbita del naipe del Rey. Nada de esto toca reglas ni la Constitución.
