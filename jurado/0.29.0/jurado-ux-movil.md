```json
{
  "jurado": "jurado-ux-movil",
  "version": "0.29.0",
  "puntajes": { "claridad": 9.1, "diversion": 8.8, "estetica": 8.8, "veredicto": 9.0 },
  "defectos": [
    {
      "prioridad": "P2",
      "pantalla": "Renglón de la cuenta con CORTÁS del Chinchón (mesa-chinchon en las tres ventanas; secuencia 390-chinchon-corta-05)",
      "ventana": "390x844, 390x664 y 360x740",
      "archivo": "src/client/pantallas/mesa.ts:404-408 (pierde «holgada» y cae a plegada-3, que saca .c-queda) + src/client/estilos/mesa.css:5966 y 6955-6964 (.c-corta entra al segundo piso)",
      "que": "El autor lo avisa solo para 390×664, pero pasa también en el teléfono principal: a 390×844 el renglón dice «PIERNA 47 × 5 = 235 +4 +4 / TE PEGA 3 · CORTÁS +24» y «LE QUEDAN 240» no está. Además ahí el renglón deja de ir holgado: cifras a la mitad que en mesa-seleccion, justo en la jugada insignia del Mazo. La segunda casilla del piso de abajo pasa a ser otra cosa (Escudo propio en vez de Vida del rival).",
      "por_que": "Era mi P2 del renglón «fijo» y quedó cerrado en todo salvo acá: orden estable y TE PEGA ya no cede, pero con el Chinchón la casilla de LE QUEDAN se va. No frena (la hoja lo dice a un toque, y lo vi: «LE QUEDAN 240»), pero el renglón que se lee de memoria falla en la jugada que más se mira.",
      "propuesta": "CORTÁS sube al piso de la fórmula como un efecto más («🛡+4 ♥+4 ✂+24», sin verbo, o sumado al escudo: «🛡+28») y el piso de abajo queda siempre «TE PEGA N · LE QUEDAN N». Regla de QA: si hay jugada válida y no abate, .c-queda está visible en las tres ventanas."
    },
    {
      "prioridad": "P2",
      "pantalla": "Hoja de la cuenta abierta (390x844 mesa-seleccion.hoja, mesa-escudo.hoja, mesa-garrote.hoja, mesa-chinchon.hoja)",
      "ventana": "390x844",
      "archivo": "src/client/pantallas/mesa.ts:484-493 (el piso es el techo de la mano; entre barra y mano hay ~160 px y ninguna hoja real entra) + estilos de .cuenta-hoja.tapa-barra en src/client/estilos/mesa.css:~5973",
      "que": "«Nace bajo la barra cuando entra» no ocurre en ninguna de las cuatro hojas que abrí a 844, ni en la más corta (Carta sola con cuatro términos, mesa-escudo.hoja): siempre sube, tapa la barra de Vida y deja la placa TE PEGA decapitada asomando por arriba («TE PEGA» y medio número cortado). No es solo el Garrote, como avisa el autor. En 360 además muerde por la mitad los botones «?» y «≡».",
      "por_que": "El reemplazo funciona (la hoja repite «SOTA DE OROS · 475/475» y TE PEGA explicado), así que no se pierde dato; pero el caso «bueno» que describe el código es rama muerta en el teléfono principal y lo que se ve es un recorte sucio de la placa.",
      "propuesta": "Asumirlo: a 844 la hoja se ancla al tope de la placa TE PEGA (la tapa entera o la oculta mientras está abierta) y nunca corta dianas de cabecera. Para que de verdad entre bajo la barra en los casos cortos: DAÑO y MULTI en dos columnas y «TOCÁ PARA CERRAR» fuera del flujo (sobre el borde)."
    },
    {
      "prioridad": "P2",
      "pantalla": "Placa TE PEGA de un renglón sobre el cuerpo del enemigo (360x740 mesa-chinchon, mesa-chinchon.elige-5, mesa-escudo, mesa-garrote, mesa-seleccion)",
      "ventana": "360x740 (nadie la miró a ojo, lo dice el autor)",
      "archivo": "src/client/estilos/mesa.css:~7156 (bloque @media max-width: 379px) y el bloque de la placa de un renglón; marcado en src/client/pantallas/mesa.ts:245",
      "que": "A 360 el número va pintado directo sobre el torso, sin caja: con la Sota de Oros el «3» y el «31» rojos caen sobre la casaca roja y se pegan al escudo del palo y a la moneda; con la de Bastos el «18» pisa el garrote. En 390×664 la misma placa lleva fondo oscuro y se lee bien. No lleva rótulo «TE PEGA» y al HUD se le va el corazón de la Vida («35/35» pelado).",
      "por_que": "Es el número que decide si jugás o descartás y a 360 es el de peor contraste de la pantalla. El renglón lo repite, por eso P2 y no más.",
      "propuesta": "La misma caja oscura que en 390×664 (fondo #120a18 al 90 %, 2 px de margen) alineada a la derecha de la escena, fuera de la figura, y el corazón del HUD a 12 px en vez de quitarlo."
    }
  ],
  "aciertos": [
    "Una sola cuenta: a 390×844 el renglón holgado «PAR 68 × 6 = 408 ♥+8 / TE PEGA 19 · LE QUEDAN 67» se lee a un brazo de distancia y el «▾» de 44 × 44 abre la hoja con nombres (Filo, Primera sangre, Taba cargada, Cascabel sin canto −1). Mi P2 principal de la 0.28, cerrado.",
    "Orden de casillas estable: con maldición y con Garrote el piso de abajo sigue siendo TE PEGA · LE QUEDAN y el efecto va como icono al final (mesa-garrote y mesa-maldicion en las tres ventanas).",
    "Huecos de contorno punteado: la mancha gris de siluetas del Chinchón desapareció (mesa-chinchon.elige-5 a 844 y 360).",
    "«NO TE PEGA ✕0» en vez del cero suelto; Reyes con corona y cara en el resumen; baúl del mapa fuera de la calavera.",
    "Contragolpe: «−19» y «🛡−4» bajo la caja de Vida, retrato libre (390-contragolpe-09). «¡CHINCHÓN!» entre renglón y mano sin tapar nada (390-chinchon-corta-05).",
    "Medidas de las 92 capturas móviles: diana mínima 44 × 44, separación mínima 8, 0 solapes, letra mínima 14 px, 0 recortes; franja tocable mínima 70 / 55 / 60 px (844 / 664 / 360), asoma mínima 46 px. «DESCARTAR (4)» entero a 360."
  ],
  "capturas_vistas": [
    "visual-qa/390x844: mesa-seleccion, mesa-seleccion.hoja, mesa-garrote, mesa-garrote.hoja, mesa-chinchon, mesa-chinchon.hoja, mesa-chinchon.elige-3, mesa-chinchon.elige-5, mesa-rey, mesa-escalon, mesa-escudo.hoja, mesa-maldicion, mesa-conteo, mesa-mentiroso.elige-5, resumen-derrota-movil, mapa-tesoro",
    "visual-qa/390x664: mesa-chinchon, mesa-garrote, mesa-garrote.hoja, mesa-rey",
    "visual-qa/360x740: mesa-chinchon, mesa-chinchon.elige-5, mesa-chinchon.hoja, mesa-garrote, mesa-escudo, mesa-seleccion, mesa-rey, mesa-segunda-cambia",
    "jurado/secuencias: 390-golpe-04, 390-golpe-06, 390-contragolpe-09, 390-chinchon-corta-05, 390-rey-planta-10, 390-chancho-canta-08",
    "todas las .medidas.json de 390x844, 390x664 y 360x740 (agregadas con node) e informe-resumen.json"
  ]
}
```

## Veredicto

La 0.29 hizo el paquete que pedí: se fue la cuenta desplegada de iconos mudos y el teléfono entero tiene un renglón de dos pisos con la hoja a un toque. A 390×844 el renglón holgado es lo mejor que tuvo esta pantalla: jugada, fórmula grande, palos, TE PEGA y LE QUEDAN en el mismo lugar turno tras turno. Claridad sube a 9,1 y el veredicto a 9,0. No hay nada que rompa ni frene: tres P2.

No paso de ahí porque el renglón «fijo» todavía falla en un caso, y es el del Chinchón, en las tres ventanas y no solo en 664 como dice el aviso. La hoja, que iba a nacer bajo la barra, en la práctica nunca lo hace a 844 y deja la placa cortada. Y a 360, que nadie miró, el TE PEGA va sin caja sobre la casaca. Estética y diversión suben una décima: la mano del Chinchón ya no es una mancha y el resumen tiene Reyes enteros, pero quedan restos (abajo).

Sobre el aviso del autor de que ya no se ven encenderse los términos durante el conteo: lo comprobé en 390-golpe-04 y -06 (la fórmula sube de 58 × 1 a 68 × 6 y los «+9» saltan de los naipes y el Amuleto late en el HUD). Me alcanza; no lo cuento como defecto.

Alcance: no corrí nada. El arrastre, el cierre de la hoja al golpear y la lógica de posición de la hoja: leídos en código, no vistos en vivo. Que la hoja nunca nace bajo la barra a 844 lo afirmo de las cuatro `.hoja` que abrí, no de todas (hay catorce). Las posiciones las leí de las capturas, no las medí.

## Contra mi veredicto de la 0.28

**Resueltos:** P2 de la hoja ausente a 844 (entero); P2 de la mano de 7–8 en lo grueso (huecos de contorno, sellos como pestaña); menores de los Reyes sin cabeza, el baúl y el «0» suelto. **A medias:** P2 del renglón (orden y TE PEGA sí; LE QUEDAN se cae con CORTÁS, hoy mi primer P2); la hoja que nacía en y 0 (ya no tapa la cabecera a 844, pero sí la barra, y a 360 muerde los botones). **Sigue:** los «+N» del conteo sobre piezas vivas (ahora el «+8» cae sobre el chip «6 MÁS» del HUD).

## Defectos menores

- **Sellos «+6» del Chinchón** tapan el palo de arriba a la derecha del 5 y del 7 de Espadas, y el 2 de Espadas queda casi entero detrás del 5: se ve su «2» y su sello (mesa-chinchon, tres ventanas; `src/client/mano.ts:~384-400`, con cuatro naipes vivos entran en una fila, como muestra 390-chinchon-corta-05).
- **Con cinco elegidos**, los dos que quedan (4 de Copas y 7 de Bastos) se montan en diagonal a la derecha junto a cinco huecos vacíos (mesa-chinchon.elige-5; `src/client/mano.ts:334-345`).
- **Resumen de derrota**: «TRAMO MÁS ALTO» sale cortado por la mitad en el pie del panel, sin «HAY MÁS ↓», y arriba hay 150 px muertos entre los Reyes y el panel (resumen-derrota-movil; `src/client/estilos/pantallas.css:~620`).
- **Texto fantasma**: un bocadillo a medio apagar («lo que no jugás, Escudo») se cruza con la barra de Vida y el renglón (390-chinchon-corta-05), y el «196» de la mitad plantada cae sobre el nombre «ESTOCADA DEL CAUDILLO» (390-rey-planta-10; `src/client/fx/director.ts:25-28`, zonas prohibidas).
- **«+8» del conteo sobre el HUD** («6 MÁS») y «+1» sobre el rótulo COMODÍN (390-golpe-04 y -06; mismo archivo).

## Qué haría en la próxima versión

Cerrar el renglón de una vez: CORTÁS pasa al piso de la fórmula como efecto y el piso de abajo es «TE PEGA · LE QUEDAN» sin excepción, con el Chinchón también holgado a 844. La hoja se rediseña para el alto real que tiene: DAÑO y MULTI en dos columnas, sin el renglón de cerrar en el flujo, para que las jugadas de hasta seis términos entren de verdad bajo la barra; cuando no entra, tapa la placa completa en vez de cortarla. A 360 la placa recupera su caja y el HUD su corazón, y alguien mira a ojo las doce capturas de esa ventana antes de cerrar. La mano del Chinchón reacomoda en una fila cuando quedan cuatro o menos naipes vivos, con el sello fuera de los palos. Dos reglas nuevas en la QA: LE QUEDAN visible siempre que la jugada no abate, y ningún texto efímero sobre el nombre del rival ni sobre el renglón. La Constitución queda intacta.
