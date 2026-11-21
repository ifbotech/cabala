```json
{
  "jurado": "jurado-ux-deck",
  "version": "0.13.0",
  "puntajes": { "claridad": 5.5, "diversion": 7.0, "estetica": 8.0, "veredicto": 6.3 },
  "defectos": [
    { "prioridad": "P0", "pantalla": "todas (peor en jugadas, piezas, pulperia, elegi-*, globos del Bufón y tooltips)", "ventana": "1280x800 y 1366x768", "archivo": "src/client/estilos/base.css:35-42 (y el único salto, :47-65)", "que": "Todo el texto de lectura mide 16 px: --fs, --fs-s, --fr y --fr-l valen 16 px hasta los 1700 px de ancho, donde saltan de golpe a 22/18/24. Las medidas lo confirman: minPx = 16 en las 28 pantallas de 1280x800 y en las 28 de 1366x768; bajo14 = 0, pero el piso de la Deck es 18.", "por_que": "La versión se llama «Leer a 40 cm» y solo agrandó los iconos de la bandeja. Las descripciones de Amuletos, la tabla de JUGADAS (62 textos), «Lo que llevás» (57), el globo del Bufón y la cabecera «El Reñidero · Guardia Turno 1» quedan por debajo de los 18 px; es justo el texto que decide una compra o un golpe.", "propuesta": "Un escalón intermedio @media (min-width:1100px) and (max-width:1699px): --fs 20px, --fs-s 18px, --fr 18px, --fr-l 20px, --fs-l 24px. Las opciones de elegi-* y las ventas de la Pulpería tienen aire de sobra abajo para aguantarlo." },
    { "prioridad": "P1", "pantalla": "mesa, mesa-mando, mesa-mentiroso", "ventana": "1280x800", "archivo": "src/client/nav.ts:110-117; src/client/pantallas/mesa.ts:157 y :646-660; src/client/textos.ts:42 y :221", "que": "No hay un solo glifo de botón en pantalla y medio mando está muerto. GOLPEAR es X y DESCARTAR es Y pero nada lo dice; la pista de la mesa dice «Elegí cartas y arrastralas al enemigo» también con mando. LB/RB/LT/RT, Select y la palanca derecha no hacen nada; JUGADAS (tecla j), ENGAÑO (tecla e), «Lo que llevás» y el Mazo no tienen botón.", "por_que": "En Deck no hay puntero ni teclado: el jugador no puede descubrir X/Y, y abrir JUGADAS desde la mano son varios saltos de cruceta hasta la esquina de arriba y vuelta. La pista le pide un gesto que el mando no tiene.", "propuesta": "Con mando: glifos pixel-art (A, X, Y, B) dentro de GOLPEAR/DESCARTAR/ENGAÑO y pista «A elige · X golpea · Y descarta». Atar Select o LT a JUGADAS, RT a «Lo que llevás», LB/RB a saltar entre mano y botones, y un botón al Engaño (atajo('j') y atajo('e') ya existen en nav.ts, falta llamarlos desde el mando)." },
    { "prioridad": "P1", "pantalla": "mesa-rey, mesa (enemigo, La Corte, cuenta) y bandeja del HUD", "ventana": "1280x800", "archivo": "src/client/pantallas/mesa.ts:109-138, :169, :251-255; src/client/nav.ts:5; src/client/hud.ts:41-60 y :229-270", "que": "Con mando no se puede inspeccionar nada del enemigo: INMUNE, el Ataque (20 / 21 +3), el rasgo del Rey («FILO DEL CAUDILLO»), las cartas de La Corte, la racha y el dado son <span> con data-tip, y el foco solo visita botones. La bandeja es un único botón: sus fichas tampoco se enfocan y a 1280, ya a 60 px, muestra 4 y esconde «+5» / «+6».", "por_que": "El rasgo del Rey es la regla que cambia el combate y su explicación solo existe en un tooltip de ratón. La mayoría de lo que llevás queda detrás de un «+5» y de un modal al que se llega caminando.", "propuesta": "Dar tabindex=\"0\" a e-inmune, e-ataque, e-rasgo y corte-carta (el tooltip ya sale con focusin, ui.ts:117) o un botón de inspección que recorra enemigo y bandeja con la cruceta. En la bandeja, 6 fichas a 44-48 px en vez de 4 a 60." }
  ],
  "aciertos": [
    "El foco se ve siempre: marco hueso de 3 px más halo dorado de 8 px (6 px en nodos del mapa y Mazos), y en la mano el naipe crece a 1,1x; medido en las 28 pantallas de 1280x800.",
    "Dianas y maqueta impecables: mínimo 48 px de alto, separación mínima 8 px, 0 solapes y 0 recortes en las dos ventanas.",
    "Las cifras de juego pasan el listón de 24 px con margen: la cuenta «23 x 9 = 207», Vida/Oro/Mazo del HUD y el Ataque enemigo; «NO TE PEGA / LE QUEDAN 133» es la mejor ayuda de la mesa.",
    "La bandeja a 60 px por fin se distingue, y el contador dorado de descartes se lee.",
    "El golpe (secuencia 1280-golpe) se entiende cuadro a cuadro: +7 +7 sobre los naipes, 340 enorme y el naipe que se raja."
  ],
  "capturas_vistas": [
    "visual-qa/1280x800/mesa.png", "visual-qa/1280x800/mesa-mando.png", "visual-qa/1280x800/mesa-rey.png", "visual-qa/1280x800/mesa-mentiroso.png",
    "visual-qa/1280x800/mapa-mando.png", "visual-qa/1280x800/jugadas.png", "visual-qa/1280x800/piezas.png", "visual-qa/1280x800/pulperia.png",
    "visual-qa/1280x800/fogon.png", "visual-qa/1280x800/elegi-una.png", "visual-qa/1280x800/elegi-amuleto.png", "visual-qa/1280x800/elegir-mazo.png",
    "jurado/secuencias/1280-golpe-02.png", "jurado/secuencias/1280-golpe-05.png", "jurado/secuencias/1280-rey-irrumpe-03.png",
    "jurado/secuencias/1280-botin-brota-06.png", "jurado/secuencias/1280-mapa-paso-03.png", "mirar/1280-conteo.png",
    "medidas.json de las 28 pantallas de 1280x800 y las 28 de 1366x768 (leídas con node)"
  ]
}
```

## Veredicto

La 0.13.0 promete «leer a 40 cm» y cumple a medias: arregló los iconos de la bandeja y nada más. Lo que es cifra de juego ya se leía; lo que es **texto** sigue clavado en 16 px en las 56 pantallas medidas de Deck y portátil. Y el mando funciona pero es mudo: el juego nunca dice qué botón hace qué, y la información fina (rasgo del Rey, Inmune, La Corte) sigue siendo cosa de ratón. Hoy no pasaría «Verificado»; quedaría en «Jugable» por texto chico y falta de glifos.

Avisos sobre el material:

- Las fotos de `artifacts/mirar/` son de las 17:12, anteriores a la 0.13.0 (muestran la bandeja vieja de 9 fichas chicas); las usé solo como referencia.
- En las capturas de Deck la QA aprieta «abajo» antes de la foto (`scripts/visual-qa.ts:264-265`), así que el foco en SALTAR de `elegi-*` es de la captura y no el foco inicial, que va a la primera opción (`camino.ts:285`).
- Sonido y vibración: no juzgados. `artifacts/jurado/fps.txt` no existe.

## Defectos menores

- Mapa: las pintas de Inmune bajo cada nodo van a `scale(0.5)` (~16 px) y no se distinguen a 40 cm; la fila de arriba sale cortada contra el borde — `src/client/estilos/pantallas.css:257-262`.
- «Lo que llevás»: iconos de ~24 px (en la bandeja van a 60) y la lista se corta abajo sin señal de que sigue — `src/client/estilos/pantallas.css:1135`, `src/client/pantallas/camino.ts:80`.
- Foco perdido en la mesa: el respaldo es `lista[0]`, que es «? JUGADAS» arriba a la derecha (así salió en `mesa.png`); debería ser la mano. Leído en código, no visto en juego — `src/client/nav.ts:21` y `:88`.
- El naipe enfocado a 1,1x tapa la esquina del vecino elegido y su índice se ve doble («77») en `mesa-mando` — `src/client/estilos/mesa.css:454`.
- Fogón: el foco inicial cae en «DESCANSAR · Curás 0 de Vida» con la Vida llena; debería ir a TEMPLAR — `src/client/pantallas/camino.ts:567`. Y GOLPEAR/DESCARTAR apagados al 45 % casi no se leen — `src/client/estilos/base.css:283`.

## Qué haría en la próxima versión

Un paquete «Deck de verdad». Primero, el escalón tipográfico intermedio (18/20 px entre 1100 y 1699 px de ancho) con repaso de las cuatro pantallas más densas. Segundo, una capa de mando completa: detectar el mando, mostrar glifos pixel-art en los botones de acción y en una franja de pista al pie de la mesa, atar gatillos y Select a JUGADAS y «Lo que llevás», y cambiar el «arrastralas» por la pista de botones cuando no hay puntero. Tercero, un modo inspección: el enemigo, su rasgo, La Corte y cada ficha de la bandeja se recorren con la cruceta y muestran su tooltip a 18 px. Con eso la claridad sube un punto y medio sin tocar una sola regla ni la Constitución.

No me pasaron veredicto de la versión anterior (`artifacts/jurado/` solo tenía `secuencias/`), así que no hay seguimiento de defectos previos.
