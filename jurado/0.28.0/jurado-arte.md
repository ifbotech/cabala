```json
{
  "jurado": "jurado-arte",
  "version": "0.28.0",
  "puntajes": { "claridad": 8.6, "diversion": 8.4, "estetica": 8.6, "veredicto": 8.6 },
  "defectos": [
    {
      "prioridad": "P1",
      "pantalla": "La mesa a 1080p, en reposo y con algo apoyado (mesa, mesa-chinchon, mesa-garrote, mesa-rey, mesa-conteo, mesa-postas-arrastre, mesa-chancho)",
      "ventana": "1920x1080",
      "archivo": "src/client/estilos/mesa.css:5711 (el bocadillo: bottom = min(96px·k-bufon, 100cqh − …), con la escena más baja cae sobre la cara); :5558-5567 (--k-pano-fijo: 1 a 1080p); :5065-5076 (.d-n con max-width 11em y puntos suspensivos); src/client/mano.ts:239-240",
      "que": "Regresión: en todas las capturas de mesa a 1920 el bocadillo tapa la cara y el cuerpo del Bufón; del anfitrión solo se ven el gorro y el cetro (en la 0.27 el globo iba sobre su cabeza y la cara se veía). Además el paño sigue a 1×: lo jugado mide 100 px de ancho contra 200 de la mano, en una caja verde de 320 px. El desglose va en letra de 16 px en una columna de 490 con los nombres cortados («Cantos h…», «Primera s…», «GARROT…», «SOL DE L…») mientras a su derecha hay 850 px de tablas vacías.",
      "por_que": "Es la pantalla del 90 % del juego en la resolución de escritorio más común. El personaje único del juego aparece sin cara desde el primer segundo, lo jugado es lo más chico de la mesa y lo que explica el número se lee cortado con media pantalla libre. A 1280 y 1366 la mesa cerró; a 1920 quedó peor compuesta que la Deck.",
      "propuesta": "El bocadillo a 1080p cuelga a la izquierda de la cabeza del Bufón, como ya hace en la Deck (mesa.css:5866), nunca encima. Paño a 1,5× (naipes de 150 px) centrado sobre la mano, pagando el alto con la pista «Elegí cartas…», que con cuenta en pantalla ya no hace falta. Desglose a 1080p con letra a 1,5× y sin tope de 11em: ancho hasta el borde del paño."
    },
    {
      "prioridad": "P2",
      "pantalla": "La mesa del teléfono con la cuenta desplegada, y el resumen de derrota (mesa-chinchon, mesa-seleccion, 390-contragolpe-09, resumen-derrota-movil)",
      "ventana": "390x844 y 390x664",
      "archivo": "src/client/estilos/mesa.css:904 y :2072 (el naipe del enemigo asoma lo que haya); src/client/mano.ts:379 (dos filas); src/client/estilos/pantallas.css:620 (.fin-reyes); src/client/pantallas/mesa.ts (nacerEnDueno)",
      "que": "Con la cuenta abierta el enemigo sigue siendo un sombrero, media cara y un «10» gigante (mesa-chinchon: 95 px; en mesa-seleccion entra hasta el pecho, pero con la placa «19» sobre el brazo). No es un busto encuadrado: es el naipe cortado donde caiga. En dos filas, el 2 de Espadas sigue tapado al 60 % y su sello «+6» partido por el 5. En el resumen de derrota con el panel corrido, los tres Reyes quedan en una tira de pies y «12» al revés, sin cabeza. En contragolpe-09 las placas «−4» y «−19» no se pisan entre sí pero tapan el retrato y empujan el «26».",
      "por_que": "El antagonista desaparece justo cuando decidís el golpe, y el resumen muestra a los Reyes por los pies. Se entiende todo; no frena, afea.",
      "propuesta": "Recorte de busto fijo: el índice a escala de naipe (no gigante) y el encuadre anclado a cabeza y pecho, con la placa TE PEGA siempre al costado. Mano de 4 sellada en una sola fila con paso parejo. En el resumen corrido, la tira de Reyes recorta por arriba (cabeza y corona), no por abajo. Las placas del HUD nacen sobre Vida y Escudo, no sobre el retrato."
    },
    {
      "prioridad": "P2",
      "pantalla": "Pantallas de premio y de ruta con media escena vacía: Botín, resultado de la Forja Brava, Mapa",
      "ventana": "1920x1080",
      "archivo": "src/client/estilos/pantallas.css:317-360 (.botin .cuerpo, .botin-fila) y :3992-4047 (.fuego, .fuego-estado); src/client/pantallas/camino.ts:1008-1019 (resultado de la Forja)",
      "que": "El Botín son dos tarjetas de 220 px en una pared de 1920: el tercio derecho no tiene más que la vela. El resultado de la Forja Brava sigue en una columna de 340 px, con «NAIPE ENTERO ×2» en letra de cuerpo y la regla repetida debajo en tres renglones; la fogata queda chica al pie y el ×2 grande del momento vivo (mirar/1280-forja-brava-x2) no sobrevive al panel. En el Mapa el tercio derecho está vacío y los nudos sin visitar casi no se despegan del fondo.",
      "por_que": "Son los momentos de cobro. Al lado de Elegí tu Mazo, fin-victoria o el Altar, que tienen escena, estas parecen maquetas.",
      "propuesta": "Botín: tarjetas a 1,5× sobre una mesa dibujada (paño, monedas volcadas) y el Bufón del otro lado. Forja: el naipe forjado a 2× junto a la fogata con el sello ×2 fijo en la esquina, y un solo renglón de regla. Mapa: subir un escalón el brillo de los nudos por visitar y llevar la silueta del Rey del tramo al tercio derecho."
    }
  ],
  "aciertos": [
    "La mesa de la Deck y del portátil cerró: a 1280 y 1366 la mano va entera sobre el HUD, no se mueve al elegir ni al golpear, el desglose queda a la vista durante el contragolpe (1280-contragolpe-09) y el paño lleva naipes enteros junto a la cuenta. Las siluetas angostas ya no le roban lugar a los naipes vivos.",
    "Las secuencias nuevas tienen poses claras: el Rey que se planta (sello cian fijo, «230 SE PIERDEN»), la Segunda Cara con rayos, ¡CHINCHÓN! con los sellos de Escudo en cada naipe y el «235» sobre el enemigo, y el ¡CHANCHO! con el enemigo que se deshace en trama cian.",
    "La Colección con piezas al doble sobre estante, el Botín del teléfono con el Bufón grande arriba, la tarjeta EVOLUCIONA en dos columnas y la llama de la Forja sin losa. fin-victoria con el sol tramado y los Reyes rasgados es la mejor pantalla del juego."
  ],
  "capturas_vistas": [
    "visual-qa/1280x800/mesa.png", "visual-qa/1280x800/mesa-chinchon.png", "visual-qa/1280x800/mesa-seleccion.png", "visual-qa/1280x800/mesa-rey.png", "visual-qa/1280x800/mesa-pega-todo.png",
    "visual-qa/1366x768/mesa-chinchon.png", "visual-qa-en/1280x800/mesa-chinchon.png",
    "visual-qa/1920x1080/mesa.png", "visual-qa/1920x1080/mesa-chinchon.png", "visual-qa/1920x1080/mesa-rey.png", "visual-qa/1920x1080/mesa-garrote.png", "visual-qa/1920x1080/mesa-postas-arrastre.png", "visual-qa/1920x1080/mesa-conteo.png", "visual-qa/1920x1080/mesa-chancho.png",
    "visual-qa/1920x1080/portada.png", "visual-qa/1920x1080/mapa.png", "visual-qa/1920x1080/pulperia-evoluciona.png", "visual-qa/1920x1080/botin.png", "visual-qa/1920x1080/forja-brava.png", "visual-qa/1920x1080/fogon-mutaciones.png", "visual-qa/1920x1080/coleccion-amuletos.png", "visual-qa/1920x1080/fin-victoria.png", "visual-qa/1920x1080/altar.png", "visual-qa/1920x1080/cronica.png", "visual-qa/1920x1080/cabala-negra.png", "visual-qa/1920x1080/elegir-mazo.png",
    "visual-qa/390x844/mesa-chinchon.png", "visual-qa/390x844/mesa-seleccion.png", "visual-qa/390x844/mesa-rey.png", "visual-qa/390x844/botin.png", "visual-qa/390x844/fin-derrota.png", "visual-qa/390x844/resumen-derrota-movil.png", "visual-qa/390x844/pulperia-evoluciona.png", "visual-qa/390x664/mesa-chinchon.png",
    "mirar/1280-forja-brava-quema-llama.png", "mirar/1280-forja-brava-x2.png",
    "jurado/secuencias/1280-golpe-04.png", "jurado/secuencias/1280-contragolpe-09.png", "jurado/secuencias/1280-rey-planta-08.png", "jurado/secuencias/1280-rey-planta-10.png", "jurado/secuencias/1280-rey-planta-14.png", "jurado/secuencias/1280-chinchon-corta-05.png", "jurado/secuencias/1280-chancho-canta-07.png",
    "jurado/secuencias/390-rey-planta-10.png", "jurado/secuencias/390-chinchon-corta-05.png", "jurado/secuencias/390-chancho-canta-08.png", "jurado/secuencias/390-contragolpe-09.png"
  ]
}
```

## Veredicto

La 0.28 cerró lo que pedí para la Deck y el portátil: a 1280 y 1366 nada vivo se monta, nada tapa la cuenta y la mano no baila. Es la mesa mejor compuesta que tuvo el escritorio chico. Claridad y estética suben a 8,6.

No suben más porque a 1080p la misma pantalla quedó a medias, como avisó el autor, y además rompió algo: el bocadillo ahora tapa la cara del Bufón en todas las capturas de mesa a 1920. Comparé con la captura de la 0.27 y ahí la cara se veía. Por eso el P1 sigue abierto, mudado de ventana.

Diversión 8,4: las secuencias nuevas tienen poses legibles. El sonido, la música y el temblor no los juzgo; no los vi. No abrí Ajustes, Jugadas, Mazo, Colección de Reyes, las pantallas de elegir ni fin-derrota a 1920, ni las ventanas de 360: de esas no opino.

**Respecto de la 0.27:**
- **P1 del escritorio: resuelto a 1280 y 1366; sigue a 1920** (paño a media escala, desglose chico y cortado) y suma la regresión del bocadillo sobre el Bufón.
- **P2 del teléfono (enemigo aplastado): sigue, atenuado.** El rótulo COMODÍN de canto está resuelto. Siguen el busto sin encuadrar, el 2 tapado en dos filas y, nuevo a la vista, los Reyes sin cabeza en el resumen.
- **P2 de pantallas pobres: resuelto en Colección, Botín a 390 y «HAY MÁS ↓»** de fin-derrota. Siguen el resultado de la Forja y el Botín a 1920.
- **Menores:** resuelta la losa de la llama, y FURIA ya no pisa la causa a 1920. Sigue el tercio derecho del Mapa.

## Defectos menores

- **Desglose cortado en la Deck:** con ¡CHINCHÓN! (paño de 5) la columna queda en 350 px y lee «Cantos h…», «Taba car…», «Mano chi…», «SOL DE L…». En mesa-pega-todo corta igual con lugar de sobra en el renglón. `src/client/estilos/mesa.css:5065-5076`.
- **SE PLANTA dicho dos veces:** el sello fijo y el renglón de la cuenta dicen lo mismo a 80 px de distancia. A 1280 el sello tapa el chip FURIA y la placa ESTOCADA, y en rey-planta-08 entra cortado por el borde derecho. `src/client/estilos/mesa.css:5772-5785`.
- **Busto a 1366:** con 112 px la Sota es un sombrero, una barbilla y media moneda cortada por la barra de vida; el «10» pesa más que la cara. `src/client/estilos/mesa.css:5581` en adelante.
- **«HAY MÁS ↓» de la Pulpería a 1920:** va arriba, al lado de SALIR, y señala hacia abajo desde la otra punta de lo que se corta. `src/client/estilos/pantallas.css:4745-4760`.
- **Colección a 1080p:** mejoró, pero las celdas siguen siendo cajas negras con el estante en una raya, y el 22 % de abajo es zócalo liso. `src/client/estilos/pantallas.css:712`.

## Qué haría en la próxima versión

**Terminar el 1080p con la misma vara que la Deck, y darle escena al cobro.**
- Mesa a 1920: bocadillo al costado del Bufón, paño a 1,5× centrado sobre la mano, desglose con letra a 1,5× y nombres enteros.
- Busto del enemigo con encuadre fijo de cabeza y pecho en todas las ventanas, con el índice a escala de naipe.
- Botín a 1920 como mesa servida.
- Resultado de la Forja con el naipe a 2× y el sello ×2 que queda.
- Reyes con cabeza en el resumen del teléfono.

Con eso el P1 se cierra y estética pasa de 8,9. Para el 9,1 falta además que el Mapa tenga al Rey del tramo a la vista y que el desglose no corte un solo nombre en ninguna ventana.
