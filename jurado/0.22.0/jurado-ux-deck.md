```json
{
  "jurado": "jurado-ux-deck",
  "version": "0.22.0",
  "puntajes": { "claridad": 7.5, "diversion": 8.3, "estetica": 8.3, "veredicto": 7.6 },
  "defectos": [
    { "prioridad": "P0", "pantalla": "Evoluciones: el jackpot (evolucion-jackpot), la ficha del HUD (hud-evolucion) y «Lo que llevás» (RT, piezas)", "ventana": "1280x800 (solo mando)", "archivo": "src/client/pantallas/camino.ts:77 (modalPiezas arma la fila con AMULETO[id].nombre y .desc, nunca con EVOLUCION); src/client/hud.ts:53-56 (la ficha evolucionada es un <span> sin tabindex: su ayuda solo sale con el puntero); src/client/evolucion.ts:16 y :61-66 (1,2 s, y el primer botón la corta)", "que": "Cuando el Poncho despierta como GARROTE DEL CACIQUE, la regla nueva («Tu Escudo entero se suma al Daño») se ve una sola vez, en 20 px, durante 1,2 s, y desaparece con el primer botón que toques. Con el mando, después ya no hay dónde leerla. La ficha del HUD no recibe foco. RT abre «Lo que llevás», que sigue mostrando el nombre y el texto viejos del Amuleto (lo leí en el código: no hay captura de RT con una Evolución despierta). En el HUD, lo único que distingue al Amuleto despierto es un filo prismático de 2 px sobre un ícono de 42 px, con el mismo dibujo de siempre (en el jackpot también es el poncho, no un garrote).", "por_que": "Es lo más grande del Salto 2, y en la Deck queda a ciegas. Encima, la única pantalla de consulta que tiene el mando miente: te enseña la regla vieja de un Amuleto que ya juega con otra. En un juego de cálculo, eso te hace armar mal la mano.", "propuesta": "Que modalPiezas use EVOLUCION[id] cuando evoluciono(p,id) sea cierto: nombre maldito, texto nuevo, sello «★ EVOLUCIONÓ · antes Poncho del Cacique» y su ícono con marco prisma. Que la ficha .evolucion lleve tabindex=0 y entre en la cruceta con su ayuda. Que el jackpot, si el botón llega antes de 600 ms, no se corte del todo: que quede como aviso pegado al HUD hasta el próximo golpe. Y un estado de QA nuevo, piezas-evolucion." },
    { "prioridad": "P1", "pantalla": "El Fogón después de templar o de la Forja Brava (forja-brava, mirar/1280-fogon-despues)", "ventana": "1280x800", "archivo": "src/client/pantallas/camino.ts:916-918 (repintar después de arrimar); src/client/ui.ts:64-68 (solo devuelve el foco si existe el mismo data-foco); src/client/nav.ts:55-56 (sin data-inicio cae en lista[0] = MENÚ); camino.ts:847 (SEGUIR no lleva data-inicio aunque fogonHecho) y :826 (el chip de la mutación es un <span> que no se puede enfocar)", "que": "Después de la tercera pasada, el botón ARRIMAR desaparece en el repintado y el foco se pierde. Lo primero que hagas con el mando lo manda a ≡ MENÚ (las medidas de forja-brava dan foco «≡ MENÚ»), no a SEGUIR, que brilla en oro. En fogon-despues no hay foco en ningún lado. Además, «DOBLE FILO» explica qué hace solo con el puntero: con el mando no hay forma de leer la mutación que acabás de ganar.", "por_que": "Es el momento cumbre del Fogón y lo cerrás abriendo el menú por error. Y la mutación, que es el premio de jugarte el 50 %, en la Deck no se puede leer hasta que el naipe vuelve a tu mano en la mesa.", "propuesta": "Si fogonHecho, SEGUIR lleva data-inicio y repintar() cae en el principal cuando el foco viejo ya no existe. El chip de mutación pasa a <button tabindex> con su ayuda, o su descripción queda escrita bajo «DOBLE FILO» en 18 px en lugar del rótulo «FORJA BRAVA: SU NÚMERO VALE DOBLE», que repite el título en cuatro renglones." },
    { "prioridad": "P1", "pantalla": "La Cábala Negra, bandeja de naipes (cabala-negra)", "ventana": "1280x800", "archivo": "src/client/estilos/mesa.css:4146-4172 (el canal del foco celeste con ▼ no incluye .p-cabala); src/client/estilos/pantallas.css:495-499 (en su lugar queda un contorno carmesí de 2 px), :3526-3530 (la elegida lleva contorno púrpura de 2 px), :3571-3576 (naipes a 0,7×), :3493 (a .negra-bandeja le falta position: relative) y :3553 (VOLVER de 45 px); camino.ts:1027", "que": "En una grilla de 36 naipes de unos 70×95 px, la carta enfocada lleva un filo carmesí de 2 px y la elegida un filo púrpura de 2 px. A 40 cm son dos rayitas casi iguales. Es la única pantalla del juego que no usa el foco celeste que late con su ▼. La flecha de «hay más» queda suelta abajo de todo, bajo el retrato del HUD, en vez de al pie de la bandeja. VOLVER mide 45 px de alto.", "por_que": "Coser o trasplantar destruye naipes del Mazo y no se puede deshacer. En la Deck tenés que adivinar si la cruceta está sobre el 1 de Bastos o si ya lo elegiste. La ▼ suelta, encima, parece marcar el retrato.", "propuesta": "Agregar .p-cabala al canal de foco de mesa.css:4146: celeste que late y ▼ arriba del naipe. La elegida, con su número de orden grande y un velo, no con otro contorno. Naipes a 0,85× con dos filas a la vista y rollo por cruceta. position: relative en .negra-bandeja y min-height 48 en .negra-pie .btn." }
  ],
  "aciertos": [
    "El paño en su fila propia resolvió mi P1 principal: con 3 naipes jugados, los 5 de la mano enseñan número y pinta enteros (mesa-escalon, mesa-chispa, también a 1366 y en inglés). Se acabaron las pestañitas de 20 px.",
    "Los Chiches ya enseñan el mando: «Pulsá A para usarlo. No gasta el turno.» (secuencias postas-golpe y chiche-usa). El foco ya no salta después de usarlos, y JUGADAS tiene su entrada.",
    "LB y RB quedan a la vista con el paño cargado, en la columna de reglas. La ▼ ya no tapa la etiqueta de la Posta y el chip de racha dejó de pisar el 10 del Rey.",
    "TURBO bien resuelto: la entrada que corta el jackpot no hace nada más (nav.ts:213-226), así que machacar A no te elige algo sin querer.",
    "El candado del Tesoro se lee desde el sillón: 27 en cifra grande, «Te faltan 20 de oro» en carmesí y el foco ya puesto en DEJAR EL COFRE si no te alcanza."
  ],
  "capturas_vistas": [
    "visual-qa/1280x800/mesa.png", "visual-qa/1280x800/mesa-mando.png", "visual-qa/1280x800/mesa-escalon.png", "visual-qa/1280x800/mesa-chispa.png",
    "visual-qa/1280x800/mesa-mentiroso.png", "visual-qa/1280x800/mesa-rey.png", "visual-qa/1280x800/mesa-chiches.png", "visual-qa/1280x800/hud-evolucion.png",
    "visual-qa/1280x800/evolucion-jackpot.png", "visual-qa/1280x800/oferta-evoluciona.png", "visual-qa/1280x800/forja-brava.png", "visual-qa/1280x800/fogon.png",
    "visual-qa/1280x800/cabala.png", "visual-qa/1280x800/cabala-negra.png", "visual-qa/1280x800/botin-tesoro.png", "visual-qa/1280x800/mapa-tesoro.png", "visual-qa/1280x800/piezas.png",
    "visual-qa/1366x768/mesa-escalon.png", "visual-qa-en/1280x800/mesa-escalon.png",
    "jurado/secuencias/1280-postas-golpe-02/06/10.png", "jurado/secuencias/1280-mando-03/10.png", "jurado/secuencias/1280-mando-elige-03.png",
    "jurado/secuencias/1280-chiche-usa-04.png", "jurado/secuencias/1280-botin-brota-08.png", "jurado/secuencias/1280-rey-irrumpe-05.png", "jurado/secuencias/1280-portada-05.png",
    "mirar/1280-comodin-espectral-racha.png", "mirar/1280-fogon-despues.png",
    "recortes ampliados (forja-brava, cabala-negra, hud-evolucion, mesa, mapa-tesoro, paño de mesa-escalon)",
    "medidas.json de todas las pantallas de 1280x800 y 1366x768 (node)"
  ]
}
```

## Veredicto

La mesa de la 0.22.0 es la mejor que tuvo CÁBALA en la Deck. El paño baja a su fila, la mano asoma entera debajo y cada naipe muestra número y pinta. El ×2 del Medio y el Escalón en subida se leen desde el sillón. Los Chiches por fin hablan el idioma del mando. El problema está en lo nuevo. Las Evoluciones, la Forja Brava y la Cábala Negra se diseñaron mirando el puntero. Con mando, la regla de un Amuleto despierto se ve 1,2 s y RT después te muestra la vieja. El Fogón pierde el foco justo en su momento cumbre. Y la bandeja de la Cábala Negra marca el foco y la elección con dos rayitas de 2 px. **Hay un P0**, y es de claridad pura. No lo recomendaría en la Deck hasta que «Lo que llevás» diga la verdad.

**Seguimiento de la previa:** resueltos la mano reducida bajo el paño (P1-1), los Chiches para mando con ayuda, foco y glosario (P1-2, salvo la letra), los LB y RB invisibles con el paño cargado y la ▼ sobre la etiqueta de la Posta (P1-3), y el chip de racha sobre el Rey. Siguen la letra mínima de la mesa en 15 px («Medio: pega doble», gris sobre madera), los números sueltos («+12» rojo sobre DESCARTAR en mando-03) y la Posta del borde muda.

Aviso: lo de RT con una Evolución despierta y el foco después de templar en vivo lo leí en el código, no lo vi. Las medidas de forja-brava, eso sí, confirman el foco en MENÚ.

## Defectos menores

- El cofre del Tesoro en el Mapa mide unos 28 px (pantallas.css:3579-3593). A 40 cm se confunde con el adorno del nodo, y está por debajo de la regla de 40 px.
- `.pano-regla` sigue en 15 px (mesa.css:537) en las 26 mesas de 1280 y de 1366. A 1366, «Medio: pega doble» se parte en dos renglones y el Escalón en tres.
- El sello del Bufón «CARA DE PÓKER NO LLEGA» tapa el «TE PEGA» y la cabecera del Rey (postas-golpe-10). Ver mesa.ts:1019.
- Un «+6» suelto flota sobre el marco del paño y otro «+12» sobre DESCARTAR (postas-golpe-02, mando-03). Ver mesa.ts:1763.
- La portada de visual-qa todavía dice v0.21.0 (la foto es anterior al cambio de versión; en las secuencias ya dice v0.22.0), y CHANGELOG.md no tiene la entrada de la 0.22.

## Qué haría en la próxima versión

**«Todo lo nuevo, legible con mando»**. Uno: «Lo que llevás» con las Evoluciones de verdad (nombre maldito, texto nuevo, «antes: …»), fichas del HUD que se puedan enfocar con su ayuda, un dibujo propio para cada forma despierta y un estado de QA piezas-evolucion. Dos: una regla dura de QA, «foco-tras-repintar»: después de cada acción de Fogón, Cábala y Botín, el foco queda en un elemento visible, nunca en MENÚ. Arranca con SEGUIR como data-inicio y el chip de mutación enfocable. Tres: un solo idioma de foco en todo el juego, con .p-cabala dentro del canal celeste, la elegida marcada con número y velo, y la flecha de «hay más» en su panel. Cuatro: la mesa a minPx 18 como puerta dura (.pano-regla, .ch-nombre). Cinco: el cofre del Mapa a 40 px como mínimo, con su candado. Nada de esto toca la Constitución.
