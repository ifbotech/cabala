```json
{
  "jurado": "jurado-diseno",
  "version": "0.17.0",
  "puntajes": { "claridad": 7.4, "diversion": 7.0, "estetica": 8.0, "veredicto": 7.2 },
  "defectos": [
    {
      "prioridad": "P0",
      "pantalla": "mesa-seleccion · mesa-segunda · secuencia golpe (00 → 09)",
      "ventana": "todas",
      "archivo": "src/client/pantallas/mesa.ts:207-270 (cuentaHtml: c-total :265, leQuedan :240, desglose :236) · src/rules/balance-config.json:149 y :158 (mano 3 de Escoba y Truco)",
      "que": "La previa sigue escribiendo el resultado entero antes de soltar: «CARTA SOLA · DAÑO 37 × MULTI 7 = 259 · LE QUEDAN 81», con todas las piezas ya encendidas (golpe-00, mesa-seleccion). Después el conteo (golpe-02 → 06) arranca en 25 y sube hasta un 259 que el jugador ya leyó. Y con mano de 3 la jugada suele ser una sola: en golpe-00 la mano es 1 de Espadas (inmune), 4 de Copas y 9 de Oros; la única decisión es «el 9».",
      "por_que": "Es la tercera versión con el mismo agujero en el centro del bucle. Unos 60 golpes por partida y ninguno tiene revelación: el conteo de Balatro funciona porque el número final se descubre, no se confirma. Hoy el turno es leer una cifra y apretar GOLPEAR; el conteo, por lindo que esté, es una animación de algo sabido.",
      "propuesta": "Antes de soltar, mostrar solo la jugada y su base (cartas + jugada: «DAÑO 9 × MULTI 1 +?») y los chips de destino que hacen falta para decidir (CAE, ¡EXACTO!, ¡AL PELO!, TE PEGA n, TAJO ×2): el Golpe exacto se sigue apuntando con el chip. El total, las piezas y LE QUEDAN se descubren en el conteo. Y mano de 4 jugando hasta 3 en Escoba y Truco, recertificada."
    },
    {
      "prioridad": "P1",
      "pantalla": "toda la partida (curva de tramos, meta-report)",
      "ventana": "todas",
      "archivo": "src/rules/balance-config.json:90-105 (actos: ataque 1 / 12 / 28) y :146-196 (Vida de los Mazos)",
      "que": "Bajaron la Vida de Truco (96→88) y Chancho (90→80) y el primer tramo sigue sin miedo: caen 22 de 3.000 Truco (0,7 %) y 28 de 3.000 Chancho (0,9 %) contra 344 de Escoba (11,5 %), 16 veces más. El 86 % de las muertes de Truco (1.842 de 2.150) y el 75 % de las de Chancho siguen en el tramo 3. Los ataques por tramo no se tocaron.",
      "por_que": "Sin riesgo en el tramo 1, una Copa, un Basto o la Bota de vino no valen nada al principio y todas las builds arrancan igual: maximizar Daño. La partida se decide entera cuando la build ya no se corrige, y dos de los cinco Mazos juegan 10 minutos de trámite.",
      "propuesta": "Que lo que TE PEGA La Corte escale con la Vida máxima del Mazo (base × vidaMax / 70) en vez de tocar Vidas a mano, subir el ataque del tramo 1 hasta que muera entre el 3 y el 6 % de cada Mazo y llevar el tramo 3 de ×28 a ~×24. Agregar al meta-report el porcentaje de caídas por tramo como objetivo con su banda."
    },
    {
      "prioridad": "P1",
      "pantalla": "cabala · elegi-una",
      "ventana": "todas",
      "archivo": "src/rules/balance-config.json:262-265 (moneda: apuesta 10, paga 15) · src/rules/bufon.ts:113-123 · src/client/voces.ts:46",
      "que": "Cara o cruz sigue con esperanza positiva: 20 contra +30 al 60 % es +10 de oro por apuesta, y además aceptar sube el humor del Bufón y rechazar lo baja. En elegi-una el Bufón dice «Las tres tienen trampa» sobre Corte de mazo, Vuelto de más y Dar de abajo: tres Platas sin costo alguno.",
      "por_que": "El juego se llama CÁBALA y su anfitrión no plantea dilemas: la moneda es un trámite y la elección de Cábala es una tienda gratis. El Bufón promete riesgo y entrega regalos; el jugador aprende rápido a no leerlo.",
      "propuesta": "Paga 15 → 10 (esperanza +2 al 60 %, el humor compensa) y que la suerte se vea moverse con la afinidad. Darle a cada Cábala de Plata una contra chica y real (Corte de mazo: +1 descarte, pero el turno 1 robás una menos; Vuelto de más: +4 de oro, pero la Pulpería cobra +1), o cambiar la frase hasta que la trampa exista."
    }
  ],
  "aciertos": [
    "El Tajo de revés ya no es un impuesto: la Carta sola no lo arma, la regla lo dice entera en la voz del Bufón (rey-segunda-08) y la secuencia lo muestra con un Par repetido, TE PEGA 48 · TAJO ×2 antes de soltar (rey-tajo-00). Castigo justo y evitable.",
    "Los cuatro Comunes tienen segunda mitad propia y arman builds que se sienten distintas: Rebenque alimenta al Poncho (Escudo por Basto ×tramo hasta los 6), Cuchillo ×2 a media Vida le pone remate a la Lanza, Mate cura más justo para sostener el Cáliz al 80 %.",
    "La Pulpería nunca ofrece dos Comunes juntos (pulperia: Moneda falsa, Facón, Boleadoras): la tienda volvió a ser una decisión.",
    "Los finales como escena: amanecer con los Reyes partidos y tachados (fin-victoria) es un cierre que da ganas de otra vuelta.",
    "Escoba con 42.768 y Chancho con 37.080 de mejor golpe: hay techo para el grito, y la Escoba ×3 es el combo roto que el género necesita."
  ],
  "capturas_vistas": [
    "visual-qa/1280x800/mesa.png",
    "visual-qa/1280x800/mesa-seleccion.png",
    "visual-qa/1280x800/mesa-segunda.png",
    "visual-qa/1280x800/pulperia.png",
    "visual-qa/1280x800/piezas.png",
    "visual-qa/1280x800/elegi-amuleto.png",
    "visual-qa/1280x800/elegi-una.png",
    "visual-qa/1280x800/cabala.png",
    "visual-qa/1280x800/jugadas.png",
    "visual-qa/1280x800/mapa.png",
    "visual-qa/1280x800/botin.png",
    "visual-qa/1280x800/fin-victoria.png",
    "jurado/secuencias/1280-golpe-00.png",
    "jurado/secuencias/1280-golpe-02.png",
    "jurado/secuencias/1280-golpe-06.png",
    "jurado/secuencias/1280-golpe-09.png",
    "jurado/secuencias/1280-rey-segunda-08.png",
    "jurado/secuencias/1280-rey-segunda-12.png",
    "jurado/secuencias/1280-rey-tajo-00.png",
    "jurado/secuencias/1280-rey-tajo-06.png",
    "jurado/secuencias/1280-rey-tajo-12.png",
    "jurado/secuencias/1280-rey-cae-12.png",
    "jurado/secuencias/1280-botin-brota-06.png",
    "jurado/secuencias/1280-botin-brota-09.png",
    "jurado/secuencias/1280-botin-brota-12.png",
    "jurado/secuencias/390-botin-brota-12.png"
  ]
}
```

## Veredicto

**Respecto de la 0.16.0:** el P0 del Tajo contra la mano de 3 quedó resuelto por la vía chica (la Carta sola no cuenta), y bien resuelto. El P1 de los Comunes clones quedó resuelto a medias: cada uno tiene su segunda mitad y la tienda no los repite, pero la primera mitad sigue siendo el mismo texto en los cuatro y la Moneda falsa nace muerta en dos Mazos. El P1 de la curva sigue igual (Truco 16 → 22, Chancho 18 → 28 caídas en el tramo 1: nada). De los menores: siguen la moneda con +10, «las tres tienen trampa» y el fin de partida sin «al pelo».

La 0.17 mejora las piezas y deja quieto el bucle. Simulé tres builds con las piezas reales:

- **Muro de Bastos (Chinchón + Rebenque + Poncho + Boleadoras):** el Rebenque suma Escudo por Basto y ×tramo, y con dos Bastos el Poncho se enciende solo. Es la primera sinergia de Común con Épico que se siente armada y no sumada. Muy bien (y por eso el Rebenque ya es la pieza más fuerte del laboratorio).
- **Remate de Espadas (Truco + Cuchillo + Lanza + Facón):** el Cuchillo ×2 a media Vida y la sobra ×2 de la Lanza arman un plan de dos golpes: ablandar y rematar. Distinta de verdad.
- **Banca (Escoba + Moneda falsa + Cofre + Taba):** la Moneda pide 3 Oros en un golpe y la Escoba tiene mano de 3: solo una Flor de Oros la enciende. Queda el Daño por carta, igual que antes.

Dos de tres se sienten distintas también fuera de los Reyes. Falta que el golpe se descubra.

**Sonido y transiciones** entre cuadros: leído en código, no oído.

## Defectos menores

- El rótulo del Caudillo dice «Si repetís jugada, TE PEGA ×2» sin «salvo Carta sola»: `src/client/textos.ts:472`.
- La Moneda falsa pide 3 Oros en un golpe: con mano de 3 es una Flor de Oros (Escoba y Truco). Bajarla a 2: `src/rules/balance-config.json:295`.
- El fin de partida sigue sin «al pelo» aunque se cuenta: `src/client/pantallas/camino.ts:873`.
- El 240 del golpe que abre la segunda cara se pinta encima de «TAJO DE REVÉS» (rey-segunda-08): `src/client/pantallas/mesa.ts:423` (bajar el número mientras está el cartel, `mesa.css:2428`).
- La secuencia rey-tajo arranca con el Caudillo en segunda cara a 351/390, un estado que el juego no puede dar: `scripts/secuencias.ts:105-112`.

## Qué haría en la próxima versión

«El golpe se descubre». La previa muestra jugada, base y destino (CAE, ¡EXACTO!, TE PEGA, TAJO); el total y las piezas se ganan en el conteo, con el número final que sube a la vista y se escucha. Mano de 4 jugando hasta 3 en Escoba y Truco, recertificada. TE PEGA proporcional a la Vida máxima del Mazo y el tramo 1 entre el 3 y el 6 % de caídas en los cinco. La primera mitad de los Comunes reemplazada por una mecánica propia (sin tocar los 15). Y un Bufón que cobre: moneda con esperanza cerca de cero y Platas con una contra que se lea en la carta.
