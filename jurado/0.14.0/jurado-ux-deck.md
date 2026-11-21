```json
{
  "jurado": "jurado-ux-deck",
  "version": "0.14.0",
  "puntajes": { "claridad": 5.5, "diversion": 7.4, "estetica": 8.3, "veredicto": 6.4 },
  "defectos": [
    { "prioridad": "P0", "pantalla": "todas (peor en jugadas, piezas, pulperia, elegi-*, globo del Bufón, tooltips y las etiquetas nuevas del conteo)", "ventana": "1280x800 y 1366x768", "archivo": "src/client/estilos/base.css:35-42 (único salto en :47-65); src/client/estilos/mesa.css:1316-1340", "que": "El texto de lectura sigue clavado en 16 px: --fs, --fs-s, --fr y --fr-l no cambiaron (base.css no se tocó en la 0.14.0). Medido hoy: minPx = 16 en las 28 pantallas de 1280x800 y en las 28 de 1366x768. Y lo nuevo nace igual de chico: las etiquetas del conteo pieza por pieza (.c-vuela) van a var(--fs-s) = 16 px, viven 0,9 s y se apilan unas sobre otras.", "por_que": "El piso de la Deck es 18 px. Descripciones de Amuletos, la tabla de JUGADAS (62 textos), «Lo que llevás» (55) y la cabecera «El Reñidero · Guardia Turno 1» deciden compras y golpes y no se leen a 40 cm. En 1280-golpe-03/04 «Loaded Die +8» queda tapada por «Reveler's Chalice +2», las etiquetas tapan el nombre del enemigo en la barra de Vida y el chip de la jugada: la explicación del golpe, que es la novedad de la versión, en Deck es un borrón de 16 px.", "propuesta": "Escalón @media (min-width:1100px) and (max-width:1699px): --fs 20px, --fs-s 18px, --fr 18px, --fr-l 20px, --fs-l 24px. Para .c-vuela: 20 px, una columna a cada lado de la cuenta (Daño a la izquierda, Multi a la derecha) sin pisarse ni pisar la barra de Vida, y como mucho tres a la vez." },
    { "prioridad": "P1", "pantalla": "mesa, mesa-mando, mesa-rey, mesa-mentiroso", "ventana": "1280x800", "archivo": "src/client/nav.ts:110-117; src/client/pantallas/mesa.ts:157 y :776-778; src/client/textos.ts:42", "que": "El mando sigue mudo y a medias: nav.ts no cambió. Ni un glifo en pantalla (GOLPEAR es X, DESCARTAR es Y y nada lo dice); la pista sigue siendo «Elegí cartas y arrastralas al enemigo» también con mando (mesa.ts:157 no consulta porTeclado()). LB/RB/LT/RT, Select y la palanca derecha no hacen nada; JUGADAS (data-tecla j) y ENGAÑO (data-tecla e) no tienen botón de mando.", "por_que": "En Deck no hay puntero: el jugador no puede descubrir X/Y, la pista le pide un gesto imposible y el Mentiroso tiene que caminar con la cruceta hasta ENGAÑO en cada combate. Es motivo directo de «Jugable» en vez de «Verificado».", "propuesta": "Si porTeclado(): glifos pixel-art dentro de GOLPEAR (X), DESCARTAR (Y), ENGAÑO y JUGADAS, y pista «A elige · X golpea · Y descarta». En nav.ts:117 sumar recien(8)→atajo('j'), recien(6)→atajo('e'), recien(7)→abrir «Lo que llevás», LB/RB para saltar entre mano y botones." },
    { "prioridad": "P1", "pantalla": "mesa-rey, mesa (enemigo, La Corte) y bandeja del HUD", "ventana": "1280x800", "archivo": "src/client/pantallas/mesa.ts:109, :111, :120, :138; src/client/nav.ts:5; src/client/hud.ts:257-290", "que": "Con mando sigue sin poder inspeccionarse el enemigo: INMUNE, el Ataque con su Furia (21 +3), el rasgo del Rey («FILO DEL CAUDILLO») y las cartas de La Corte son <span> con tip() y sin tabindex; el foco solo visita botones. La bandeja muestra 4 fichas y esconde «+5» / «+6» (mesa.png, mesa-rey.png).", "por_que": "El rasgo del Rey cambia las reglas del combate y su explicación solo sale con ratón. Peor ahora: el conteo nuevo hace brincar la ficha que dispara (dispararFicha, hud.ts:217), pero si la pieza está detrás del «+5» devuelve null y el jugador no ve de dónde salió el +8.", "propuesta": "tabindex=\"0\" en e-inmune, e-ataque, e-rasgo y corte-carta (el tooltip ya sale con focusin). En la bandeja a 1280, 6 fichas a 44-48 px en vez de 4 a 60, o que la ficha oculta que dispara asome sobre el «+N»." }
  ],
  "aciertos": [
    "El conteo sobre la bandeja: «+2» y «+1» celestes de más de 24 px encima de la ficha que los aporta (1280-golpe-04/06) enseñan por fin qué pieza hizo qué, sin leer nada.",
    "Foco visible y maqueta firme: marco de 3 px con halo (6 px en nodos y Mazos), naipe enfocado a 1,1x, dianas mínimas de 48 px, separación mínima 8 px, 0 solapes y 0 recortes medidos en las 56 pantallas.",
    "Las cifras de juego pasan los 24 px con margen: «23 x 9 = 207», Vida/Oro/Mazo, el Ataque 20, el 207 gigante sobre el enemigo y «NO TE PEGA / LE QUEDAN 133».",
    "Fogón corregido: con la Vida llena DESCANSAR se apaga, dice «Vida llena» y el foco inicial ya no cae ahí.",
    "Los escenarios por parada (Reñidero, Arrabal con lluvia, Pulpería con estantes, Fogón bajo estrellas) dan lugar sin robarle contraste al naipe ni al HUD."
  ],
  "capturas_vistas": [
    "visual-qa/1280x800/mesa.png", "visual-qa/1280x800/mesa-mando.png", "visual-qa/1280x800/mesa-rey.png", "visual-qa/1280x800/mesa-mentiroso.png",
    "visual-qa/1280x800/mapa-mando.png", "visual-qa/1280x800/jugadas.png", "visual-qa/1280x800/piezas.png", "visual-qa/1280x800/pulperia.png",
    "visual-qa/1280x800/fogon.png", "visual-qa/1280x800/elegi-amuleto.png", "visual-qa/1280x800/elegi-bendicion.png", "visual-qa/1280x800/elegir-mazo.png",
    "jurado/secuencias/1280-golpe-03.png", "jurado/secuencias/1280-golpe-04.png", "jurado/secuencias/1280-golpe-06.png",
    "jurado/secuencias/1280-rey-irrumpe-03.png", "jurado/secuencias/1280-botin-brota-05.png", "jurado/secuencias/1280-mapa-paso-03.png",
    "mirar/1280-conteo.png", "mirar/1280-rey-cae.png",
    "medidas.json de las 28 pantallas de 1280x800 y las 28 de 1366x768 (leídas con node)"
  ]
}
```

## Veredicto

La 0.14.0 es una versión de jugo y de móvil, no de Deck. Lo que pedí en la 0.13.0 no se tocó: `base.css` y `nav.ts` están idénticos, el texto sigue en 16 px en las 56 pantallas medidas y el mando sigue sin glifos, sin gatillos y sin forma de inspeccionar al enemigo. Lo que mejoró para mi silla llegó de rebote: el conteo pieza por pieza pone cifras grandes sobre la bandeja, y eso sí se lee a 40 cm. Pero la mitad de ese mismo conteo (los nombres que suben) nació a 16 px y apilada, así que la claridad queda donde estaba. Sigue en «Jugable», no «Verificado». Subo apenas la nota global por el golpe y los escenarios, no por mi especialidad.

**Seguimiento de la 0.13.0:** resuelto solo un menor (foco inicial del Fogón con Vida llena, `camino.ts:602`). Siguen los tres principales (P0 texto a 16 px; P1 mando mudo; P1 enemigo y bandeja sin inspección) y los menores del Mapa, «Lo que llevás», el «77» doble y los botones apagados.

Avisos sobre el material:

- Las secuencias y `artifacts/mirar/` están en inglés; el castellano lo juzgué en `visual-qa/`.
- `artifacts/jurado/fps.txt` mide 1366x768, 1920x1080 y 390x844, pero **no 1280x800** (`scripts/fps.ts:26-30`): no hay dato de FPS de la ventana Deck.
- En `mesa.png`, `mesa-rey.png` y `mesa-mentiroso.png` el foco sale en «? JUGADAS». `mesa.ts:811` lo manda a la mano si se viene con teclado; leído en código, no visto en juego.
- Sonido, vibración y lo que pasa entre cuadros: no juzgados. `CHANGELOG.md` no tiene entrada de la 0.14.0.

## Defectos menores

- Mesa: «AL DESCARTE» sale cortado («AL DESCART») contra el borde de la zona punteada en castellano; en inglés entra — `src/client/estilos/mesa.css:471`, `src/client/textos.ts:66`.
- Mapa: las pintas de Inmune bajo cada nodo siguen a `scale(0.5)` (~16 px), y el tooltip del nodo enfocado tapa el nodo de arriba, que es el próximo paso — `src/client/estilos/pantallas.css:257-262`.
- «Lo que llevás»: iconos de ~24 px (60 en la bandeja) y la lista se corta abajo sin señal de que sigue — `src/client/estilos/pantallas.css:1105-1114`.
- El naipe enfocado a 1,1x sigue pisando la esquina del vecino elegido: índice doble «77» en `mesa-mando.png` — `src/client/estilos/mesa.css:454-455`.
- GOLPEAR/DESCARTAR apagados casi no se leen sobre el escenario nuevo, y «ENGAÑO» es el botón más chico de la mesa — `src/client/estilos/base.css:283`, `src/client/pantallas/mesa.ts:778`.

## Qué haría en la próxima versión

El mismo paquete «Deck de verdad», que sigue entero sin hacer, con una pata nueva. Primero, el escalón tipográfico de 18/20 px entre 1100 y 1699 px de ancho, repasando JUGADAS, «Lo que llevás», Pulpería y `elegi-*`. Segundo, la capa de mando: glifos pixel-art en los botones de acción, pista de botones en lugar de «arrastralas», y Select, gatillos y LB/RB atados a JUGADAS, Engaño y «Lo que llevás». Tercero, modo inspección: enemigo, rasgo del Rey, La Corte y cada ficha de la bandeja enfocables con la cruceta. Cuarto, ordenar el conteo: etiquetas a 20 px en dos columnas que no se pisan ni tapan la barra de Vida, y que toda pieza que dispara tenga ficha a la vista. Y sumar 1280x800 a la puerta de FPS. Nada de esto toca reglas ni la Constitución.
