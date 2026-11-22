```json
{
  "jurado": "jurado-ux-movil",
  "version": "0.28.0",
  "puntajes": { "claridad": 9.0, "diversion": 8.7, "estetica": 8.7, "veredicto": 8.9 },
  "defectos": [
    {
      "prioridad": "P2",
      "pantalla": "Mesa al elegir con la cuenta SIN plegar (390x844 mesa-seleccion, mesa-escalon, mesa-segunda, mesa-arrastrando; secuencias 390-golpe-05, 390-contragolpe-09)",
      "ventana": "390x844 (el teléfono más común)",
      "archivo": "src/client/pantallas/mesa.ts:434-449 (el botón .c-abre y la hoja solo existen si la cuenta está .plegada o .plegada-2) + src/client/estilos/mesa.css:5890-5893 y 6208 (.c-abre oculto fuera de plegada)",
      "que": "La hoja con nombres quedó reservada a las ventanas apretadas. En 390×844 con mano de 3 la cuenta va desplegada y su desglose sigue siendo una fila de iconos de 16 px con cifra: «[icono]+4 [icono]+8 [icono]+10 … [icono]+3 [icono]+1 [icono]+1 [icono]−1». Ahí no hay «▾» ni toque que abra la hoja: quien juega en 390×664 puede leer «Filo +4 · Primera sangre +8 · Taba cargada +10 · Cascabel sin canto −1» y quien juega en 844 no. El nombre de la jugada tampoco va en su casilla: «Par» aparece solo como término de 14 px dentro del desglose.",
      "por_que": "Es la misma pregunta («¿de dónde sale este +10?») con respuesta en una ventana y sin respuesta en la otra, y la que queda sin respuesta es la principal. Balatro móvil responde igual en todos los tamaños: mantener apretado sobre cualquier término. No frena el golpe (fórmula, TE PEGA y LE QUEDAN se leen perfecto), por eso P2.",
      "propuesta": "Una sola regla: la cuenta es siempre una diana. Desplegada también lleva el «▾» de 44 px y el toque abre la misma hoja. Y la jugada en su casilla fija delante de la fórmula en todos los niveles («PAR 66 × 6 = 396»), como ya hace plegada. Ampliar la regla hoja-cuenta de la QA a los estados sin plegar."
    },
    {
      "prioridad": "P2",
      "pantalla": "El renglón «fijo» no es fijo: lo que trae cambia según el ancho y la jugada (360x740 mesa-escudo, mesa-garrote; 390x664 mesa-garrote; 390x844 mesa-garrote.hoja)",
      "ventana": "360x740 y 390x664",
      "archivo": "src/client/pantallas/mesa.ts:396-410 (plegada-3 saca .c-queda, plegada-4 saca .c-efectos) + src/client/estilos/mesa.css:5359-5365 (con maldición se va el chip TE PEGA) y 5965-5970",
      "que": "En 360 «CARTA SOLA 9 × 12 = 108» va con la fórmula estirada a lo ancho (huecos de 20 px entre «×» y «12») y sin lo que da el palo; con el Garrote el renglón dice «LE QUEDAN 97 · −5 DE ESCUDO» y TE PEGA 18 desaparece del renglón (queda solo en la placa). El orden de las casillas cambia: a veces TE PEGA primero, a veces LE QUEDAN. Y en 390×844, al abrir la hoja del Garrote, el chip «−5 DE ESCUDO» asoma duplicado debajo de la hoja.",
      "por_que": "Un renglón que se lee de memoria vale por su posición: si la segunda casilla a veces es daño recibido y a veces Vida del rival, hay que leerlo cada vez. El autor lo avisa y coincido en que no frena: todo está a un toque en la hoja.",
      "propuesta": "Fijar el segundo piso en «TE PEGA N · LE QUEDAN N» siempre (la maldición como icono sin texto, 20 px, al final). En 360 abreviar el nombre antes de soltar efectos («C. SOLA», «ESCAL.») y no justificar la fórmula (justify-content: start). Que la hoja tape el renglón entero (top de la hoja = top de la cuenta, alto mínimo = alto de la cuenta)."
    },
    {
      "prioridad": "P2",
      "pantalla": "Mano de 7–8 con varios elegidos y sellos de Escudo del Chinchón (390x844 mesa-chinchon.elige-5; 390x664 mesa-chinchon; 360x740 mesa-chinchon)",
      "ventana": "390x844, 390x664 y 360x740",
      "archivo": "src/client/mano.ts:125 (capa Z.hueco: siluetas llenas de dos filas encimadas) + src/client/estilos/mesa.css:~5131 (sello «+6» sobre el naipe de la mano)",
      "que": "Sin tocar desde la 0.27. Con cinco elegidos de siete, la mitad izquierda de la mano es una mancha gris de siluetas superpuestas y los dos naipes que quedan (4 de Copas y 7 de Bastos) se pisan en diagonal a la derecha. En 390×664 y 360 los sellos «+6» tapan el primer palo de cada naipe de la fila de abajo y el del 2 de Espadas queda cortado bajo el 5.",
      "por_que": "Es el momento de la jugada más grande del juego y es la pantalla más sucia del teléfono. No se pierde la decisión (los índices se leen), pero la mano deja de leerse «sin ampliar» como conjunto.",
      "propuesta": "Huecos solo de contorno punteado (1 px, sin relleno) y solo de la fila de arriba; el sello «+6» como pestaña en el canto superior del naipe, fuera de los palos, o un único «+24» en el renglón, que ya lo dice («CORTÁS +24»)."
    }
  ],
  "aciertos": [
    "Mi P1 de la cuenta plegada quedó CERRADO: en 390×664 y 360×740 el renglón dice «PAR 66 × 6 = 396 ♥+8 / TE PEGA 19 · LE QUEDAN 79», «ESCALERA 23 × 24 = 552 / LO ABATÍS», «PIERNA 47 × 5 = 235 +4 +4 / LE QUEDAN 240 · CORTÁS +24». La hoja abre con nombres completos (Filo, Primera sangre, Taba cargada, Poncho del Cacique) a 14 px o más, con «TE PEGA 19 (23 − 4 ESCUDO)» explicado, y la mano y GOLPEAR no se mueven entre la foto plegada y su .hoja (4 de Espadas en x 40, y 337; GOLPEAR en y 476 en ambas).",
    "El «▾» mide 44 × 44 en las tres ventanas (medidas: «ver la cuenta entera» 44x44, separación 8, 0 solapes) y el renglón entero también abre.",
    "La placa TE PEGA ya no pisa la cara: en 360 y 664 va en un renglón («19 🛡−4», «18 🛡−3») a la derecha del rostro, y el Rey conserva corona y cara con la placa al costado (360 y 390x664 mesa-rey).",
    "Contragolpe: «🛡−4» y «−19» nacen apilados sobre el retrato y la cifra de Vida «26» late sola y legible (390-contragolpe-09 y -11).",
    "«HAY MÁS ↓» ahora va sobre un pie esfumado y no corta texto vivo (elegi-amuleto, pulperia). Botín centrado con el Bufón grande y dianas de 358 × 44.",
    "informe.json trae ahora las seis ventanas: 68 + 12 + 12 estados móviles, 0 fallos; ninguna diana de menos de 44 px de alto, ninguna letra bajo 14 px, 0 recortes. Franja tocable mínima de la mano 55 px (390×664, mano de 7–8)."
  ],
  "capturas_vistas": [
    "visual-qa/390x844: mesa-seleccion, mesa-garrote, mesa-garrote.hoja, mesa-pega-todo, mesa-dejalo-justo.hoja, mesa-mentiroso.elige-3, mesa-chinchon.elige-5, mesa-escalon, mesa-segunda, mesa-arrastrando, elegi-amuleto, botin, pulperia, resumen-derrota-movil, mapa-tesoro",
    "visual-qa/390x664: mesa-seleccion, mesa-seleccion.hoja, mesa-rey, mesa-chinchon, mesa-chinchon.hoja, mesa-mentiroso.elige-5, mesa-garrote",
    "visual-qa/360x740: mesa-seleccion, mesa-escalon, mesa-escalon.hoja, mesa-chinchon, mesa-chinchon.hoja, mesa-escudo, mesa-rey, mesa-garrote",
    "jurado/secuencias: 390-contragolpe-09, -11; 390-maldicion-04; 390-golpe-05; 390-chinchon-corta-05; 390-chancho-canta-08; 390-botin-brota-09",
    "mirar: 390-rey-cae",
    "todas las medidas.json de 390x844, 390x664 y 360x740; visual-qa/informe.json e informe-resumen.json"
  ]
}
```

## Veredicto

La 0.28 hizo lo que pedí casi al pie de la letra: la cuenta plegada dejó de ser un recorte y pasó a ser una pieza. En la ventana con barras del navegador ahora se lee «PAR», «ESCALERA», «PIERNA» antes de la fórmula, y un toque trae el desglose con nombres sin que la mano se corra. **Mi P1 está cerrado**, y con él no me queda nada que frene: los tres defectos son P2. Claridad sube de 8,6 a 9,0 y el veredicto de 8,5 a 8,9.

No llego a 9,1 por tres cosas. La hoja es mejor que la cuenta desplegada, y sin embargo en 390×844, el teléfono de casi todos, no se puede abrir: ahí siguen los iconos mudos. El renglón «fijo» todavía cambia de contenido y de orden según el ancho y la maldición. Y la mano de 7–8 con el Chinchón sigue siendo la foto más sucia del juego. Estética se queda en 8,7 por eso y por los Reyes sin cabeza del resumen, que es la última pantalla que ve quien pierde.

Alcance: no corrí nada. Que la mano no se mueve al abrir la hoja lo saco de comparar a ojo cada foto con su `.hoja` y de la regla hoja-cuenta en `scripts/visual-qa.ts:762-821` (±1 px con toques); el arrastre en vivo, el cierre de la hoja al golpear y los 0,8 s de las placas sobre el retrato: leídos en código, no vistos. No medí píxel a píxel las posiciones, las leí de las capturas.

## Contra mi veredicto de la 0.27

**Resueltos:** el P1 de la cuenta plegada (nombre, palos, desenlace, hoja a un toque y regla de QA), el P2 de la placa sobre la cara (360 y 664, Rey incluido), el P2 de los números del contragolpe sobre la Vida, y el menor de «HAY MÁS ↓». **Siguen:** Reyes sin cabeza en el resumen, baúl del mapa sobre la calavera, huecos de la mano de 7–8 y sellos «+6» del Chinchón (hoy mi tercer P2). **Nuevo:** la hoja no existe con la cuenta desplegada; el renglón pierde casillas en 360.

## Defectos menores

- **Reyes sin cabeza en el resumen**: tres medios naipes con el «12» patas arriba (resumen-derrota-movil; `src/client/pantallas/camino.ts:~1500`, .fin-reyes: anclar el recorte arriba).
- **El baúl del Tesoro** sigue tapando media calavera de su nodo (mapa-tesoro; `src/client/pantallas/camino.ts:~328`).
- **Un «0» rojo suelto junto al enemigo** cuando lo abatís y la escena es baja: sin rótulo no se sabe qué es (360 y 390x844 mesa-escalon, mesa-pega-todo; placa de un renglón en `src/client/estilos/mesa.css`, bloque placa-cara: ocultarla o poner «NO TE PEGA»).
- **La hoja nace en y 0** y tapa el nombre del rival, su Vida y los botones «?» y «≡» (todas las .hoja; `mesa.css:5973-5990`): anclarla a la barra de Vida hacia abajo dejaría el 475/475 a la vista junto al LE QUEDAN.
- **Los «+8» y «+10» del conteo** caen sobre el chip TE PEGA y sobre un naipe de la mano (390-golpe-05; `src/client/fx/director.ts:25-28`, sumar .c-chips a las zonas prohibidas).

## Qué haría en la próxima versión

Una sola cuenta para todo el teléfono. El renglón de dos pisos con casillas inamovibles (jugada, fórmula, palos / TE PEGA, LE QUEDAN) pasa a ser la forma por defecto también en 390×844, y la hoja con nombres es el segundo nivel en todas partes: se borra la cuenta desplegada de iconos mudos y con ella cuatro niveles de plegado y sus excepciones. El alto que se libera en 844 se lo doy al enemigo entero y a la mano de 8, que pasa a mostrar la fila de arriba con 70 px en vez de 46. La hoja nace bajo la barra de Vida, y dentro de ella cada término es tocable y resalta el Amuleto que lo da en el HUD, como el mantener apretado de Balatro. Huecos de contorno, sellos del Chinchón fuera de los palos y los Reyes del resumen con cabeza. Dos reglas nuevas en la QA: el segundo piso del renglón tiene siempre las mismas casillas en el mismo orden, y la hoja abre desde cualquier estado con jugada válida. La Constitución queda intacta.
