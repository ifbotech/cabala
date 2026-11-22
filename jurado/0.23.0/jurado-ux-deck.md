```json
{
  "jurado": "jurado-ux-deck",
  "version": "0.23.0",
  "puntajes": { "claridad": 8.0, "diversion": 8.4, "estetica": 8.4, "veredicto": 8.0 },
  "defectos": [
    { "prioridad": "P1", "pantalla": "La Cábala Negra, bandeja de naipes (cabala-negra)", "ventana": "1280x800 y 1366x768", "archivo": "src/client/estilos/pantallas.css:496-499 (button.visor-carta:focus-visible pone un contorno carmesí y, por especificidad 0,2,1, le gana a .negra-naipe:focus-visible de :3590, que es 0,2,0); :3594-3605 (la ▼ va a top -6px con translate -100%); src/client/estilos/base.css:1375-1396 (la flecha de «hay más» va al pie del panel)", "que": "La 0.23 quiso darle el aro celeste, pero no se ve: la regla vieja gana por especificidad. El naipe enfocado sigue con un filo carmesí de 2 px (el 1 de Bastos a 1280; a 1366, el 1 de Espadas, enfocado y elegido, carmesí sobre oro). En la fila de arriba, la ▼ celeste queda recortada por el visor. En las de abajo, se mete sobre el naipe de la fila anterior y pisa el «1» de orden del elegido. La flecha dorada de «hay más» cae justo bajo VOLVER y parece el marcador de foco del resto del juego.", "por_que": "Coser y trasplantar destruyen naipes y no tienen vuelta atrás. En la Deck sigo adivinando dónde está la cruceta, y la ▼ de VOLVER me dice que estoy en VOLVER cuando no es así. Lo bueno de la 0.23 (el número de orden, el velo sobre lo que no se puede elegir) se pierde porque el foco no se ve.", "propuesta": "Subir la especificidad (.negra-bandeja button.negra-naipe:focus-visible) o meter .p-cabala en el canal celeste de mesa.css:4055 con su latido. Poner la ▼ dentro del naipe (top 4px, sin translate) o dejar padding-top en .visor-fila. Sacar la flecha de «hay más» de .panel y pasarla al pie de .visor-cartas, por encima de .negra-pie." },
    { "prioridad": "P1", "pantalla": "Mesa, chip del dial EXACTO ↔ MÁXIMO (mesa-exacto)", "ventana": "1280x800", "archivo": "src/client/pantallas/mesa.ts:362-367 (dialDe arma el chip con el rótulo seco t('chipExacto') y explica en la ayuda, que solo sale con el puntero); src/client/textos.ts:308-310; src/client/pantallas/mesa.ts:408 (SOBRAN N al lado)", "que": "La fila de la cuenta dice «LO ABATÍS · [R3 EXACTO] · SOBRAN 24». Es un chip naranja con una sola palabra y suena a estado, no a acción. Leído de corrido, se contradice: si es exacto, ¿cómo sobran 24? El glifo R3, gris sobre gris adentro de un chip naranja, apenas se distingue a 40 cm. Lo que cambia («otra manera de apoyar estas cartas lo deja justo en 0») vive en una ayuda que el mando nunca abre. La barra de controles de la mesa no menciona R3, y JUGADAS explica el Golpe exacto pero no el dial. La diana mide 44 px de alto. No hay captura del estado MÁXIMO: lo leí en el código, no lo vi.", "por_que": "Es la herramienta nueva de cálculo del Salto 3, y con mando el jugador no sabe si ya está en exacto, qué le cuesta pasarse ni que R3 existe. Un dial que no anuncia su efecto no se usa, o se usa sin querer.", "propuesta": "Poner un verbo y el efecto en el chip: «R3 · DEJALO EN 0 (+3 ORO)», y en el otro sentido «R3 · PEGÁ TODO (+24)». Mientras el chip esté ofrecido, que SOBRAN N quede tachado o en gris. Sumar «R3 dial» a la barra de controles de la mesa cuando aparezca, y una línea en el glosario de JUGADAS. Glifo R3 en hueso sobre fondo oscuro (7:1) y min-height 48. Y un estado de QA mesa-maximo." },
    { "prioridad": "P2", "pantalla": "Resumen del final en dos capas (resumen-victoria, resumen-derrota)", "ventana": "1280x800", "archivo": "src/client/pantallas/camino.ts:1203-1208 (fichas de la build con tip(): un <span> que no toma foco); :1273 (ALTAR sin glifo, con su hueco vacío); src/client/estilos/mesa.css:4055 (.fin no entra en el canal de foco celeste); src/client/textos.ts:293 («BUILD ESTRELLA»)", "que": "La BUILD ESTRELLA son cuatro íconos de unos 30 px. Para saber qué hacen hay que pasar el puntero: con mando no se pueden enfocar. La regla de la Evolución, que es lo que la capa quiere celebrar, no se lee. El botón ALTAR guarda a la izquierda un hueco vacío del ancho de un glifo, como si faltara el dibujo. El foco usa el contorno hueso con halo, no el celeste con ▼. Si movés la cruceta a ALTAR, OTRA MANO YA sigue siendo el botón lleno de oro, y a 40 cm no queda claro qué dispara A. «TU JUGADA» va pegado a «Carta sola» sin espacio.", "por_que": "Es la pantalla donde se decide si jugás otra mano, y lo que muestra de tu build hay que creérselo a ciegas. Además, A puede tirarte a una partida nueva cuando querías ir al Altar.", "propuesta": "Íconos de la build a 44 px. El nombre de la Evolución con su regla en 18 px debajo, en lugar de dejarla en la ayuda. Y en ALTAR, el glifo Y en su hueco." }
  ],
  "aciertos": [
    "Mi P0 de la 0.22 quedó resuelto: «Lo que llevás» (RT) muestra SOL DE LA TIMBA y BRINDIS DE SANGRE con su nombre nuevo, «Evolución de Cofre del Caudal», la regla nueva y el marco prisma. El mando ya no te miente.",
    "La bandeja del HUD toma foco y su ayuda abre con «★ EVOLUCIÓN» y la regla de cada forma despierta. El Garrote tiene dibujo propio (en el jackpot se lee «poncho ▶ garrote»). El jackpot dura 1,6 s y no se corta antes de 400 ms (evolucion.ts:20-22).",
    "El Fogón ya no pierde el foco: después de la Forja Brava queda en SEGUIR, con el aro celeste y su ▼ (forja-brava.medidas: foco «B SEGUIR»). La tercera pasada ofrece las dos mutaciones como botones de 48 px, con lo que hacen escrito en 18 px y el 50 % a la vista.",
    "Altar con DEVOLVER y glifo Y. Se ve cuánto vuelve (+70) y el foco cae en el botón (altar-devolver).",
    "El cofre del Mapa pasó a un baúl de hierro de unos 44 px, por encima de la regla de 40 px. Y todo el juego a 1280 sigue con 0 recortes y letra mínima de 18 px fuera de la mesa."
  ],
  "capturas_vistas": [
    "visual-qa/1280x800/hud-evolucion-foco.png", "visual-qa/1280x800/hud-evolucion.png", "visual-qa/1280x800/piezas.png", "visual-qa/1280x800/evolucion-jackpot.png",
    "visual-qa/1280x800/forja-brava.png", "visual-qa/1280x800/fogon-mutaciones.png", "visual-qa/1280x800/fogon.png", "visual-qa/1280x800/altar-devolver.png", "visual-qa/1280x800/altar.png",
    "visual-qa/1280x800/mesa-exacto.png", "visual-qa/1280x800/mesa-mando.png", "visual-qa/1280x800/resumen-victoria.png", "visual-qa/1280x800/resumen-derrota.png", "visual-qa/1280x800/fin-derrota.png",
    "visual-qa/1280x800/cabala-negra.png", "visual-qa/1280x800/mapa-tesoro.png", "visual-qa/1280x800/botin-tesoro.png", "visual-qa/1280x800/oferta-evoluciona.png", "visual-qa/1280x800/jugadas.png",
    "visual-qa/1366x768/cabala-negra.png", "visual-qa/1366x768/hud-evolucion-foco.png", "visual-qa-en/1280x800/resumen-victoria.png",
    "jurado/secuencias/1280-rey-tajo-05.png", "jurado/secuencias/1280-rey-tajo-09.png", "jurado/secuencias/1280-rey-segunda-06.png", "jurado/secuencias/1280-mando-03.png",
    "jurado/secuencias/1280-golpe-04.png", "jurado/secuencias/1280-botin-brota-08.png", "jurado/secuencias/1280-chiche-usa-03.png", "jurado/secuencias/1280-mando-elige-03.png",
    "recortes ampliados (cabala-negra, resumen-victoria, altar-devolver, chip EXACTO, cofre del mapa)",
    "medidas.json de todas las pantallas de 1280x800 y 1366x768 (node)"
  ]
}
```

## Veredicto

La 0.23.0 es la primera versión en la que lo nuevo se pensó para el mando. Las Evoluciones ya se pueden leer entero con la cruceta: el jackpot se queda lo que tiene que quedarse, la bandeja del HUD toma foco y te dice en qué se volvió cada Amuleto, y RT muestra la regla nueva. El Fogón termina con el foco en SEGUIR, y la Forja Brava te deja elegir la mutación leyendo qué hace. **No hay P0.** Lo que queda son dos fallas de claridad con mando. El foco de la Cábala Negra no se ve: el arreglo existe en el CSS, pero una regla vieja le gana por especificidad. Y el chip EXACTO no dice qué hace. A la Deck la recomendaría con esos dos peros.

**Seguimiento de la previa:**
- **P0 de las Evoluciones:** resuelto.
- **P1 del Fogón:** resuelto el foco. El chip de mutación sigue siendo un <span>, pero ahora la mutación se elige leyendo su texto.
- **P1 de la Cábala Negra:** a medias. Se arreglaron el número de orden, el velo, VOLVER a 48 px y el `position: relative`. Sigue el foco carmesí, y la flecha de «hay más» cambió de lugar pero sigue mal puesta.
- **Cofre del Mapa:** resuelto.
- **Siguen:** el «+12» suelto sobre DESCARTAR (mando-03) y la letra de 15 px en la mesa (ahora la más chica es «CHICHES», mesa.css:4133).

Aviso: el estado MÁXIMO del dial, el R3 en vivo y el vuelo de la ficha despierta al HUD los leí en el código, no los vi.

## Defectos menores

- La ayuda de la bandeja del HUD dice «Tocá para leerlas enteras» también con mando. Con mando debería decir «A para leerlas» (textos.ts:232, hud.ts:128). Además son 13 renglones de corrido que tapan GOLPEAR y la mano.
- En altar-devolver, la ayuda de DEVOLVER tapa entero el botón MEJORAR y su precio. DEVOLVER mide 45 px de alto (pantallas.css, bloque del Altar).
- En el Tajo de revés, el 48 se dice dos veces: arriba («TE PEGA 48 / 24 ×2») y en la cuenta («TE PEGA 48 (24 ×2)»), con la placa al lado (rey-tajo-05/09, mesa.ts:408).
- La ayuda del nodo del Mapa tapa el globo del Bufón (mando-elige-03). La del Tesoro tapa el título del Botín (botin-tesoro).
- El chip «3 MÁS» del HUD se monta sobre el marco de FORTUNA cuando cambia de tamaño (mando-03, golpe-04; ver ajustarBandeja en hud.ts:145).

## Qué haría en la próxima versión

**«Un solo foco».**
1. Una puerta de QA que falle si un elemento enfocado no tiene el contorno #7df3ff calculado (getComputedStyle en cada estado): eso habría atrapado la Cábala Negra.
2. La ▼ siempre dentro de la caja enfocada, nunca recortada por un rollo, y la flecha de «hay más» pegada al rollo, nunca al panel.
3. El dial con verbo y efecto («R3 · DEJALO EN 0 +3 ORO»), anunciado en la barra de controles y con su estado de QA mesa-maximo.
4. El resumen legible con mando: build a 44 px, la regla de la Evolución escrita, glifo Y en ALTAR y foco celeste.
5. Que las ayudas sepan con qué jugás («A», no «Tocá») y no tapen al botón hermano.
6. La mesa con 18 px de mínimo como puerta dura.

Nada de esto toca la Constitución.
