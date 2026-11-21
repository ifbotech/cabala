```json
{
  "jurado": "jurado-arte",
  "version": "0.16.0",
  "puntajes": { "claridad": 7.2, "diversion": 7.0, "estetica": 7.4, "veredicto": 7.1 },
  "defectos": [
    {
      "prioridad": "P0",
      "pantalla": "mesa contra un Rey en segunda cara, con cartas elegidas (mesa-segunda)",
      "ventana": "1920x1080 y 1366x768 (a 1280x800 entra bien)",
      "archivo": "src/client/estilos/mesa.css:2176-2201 (cuenta en rejilla de dos columnas que se hace de tres renglones), :573-598 (mesa a 1920, sin hueco reservado para el rasgo) y :1719-1723 (e-barras con margin-top -16px a 1366); src/client/pantallas/mesa.ts:122-127 (el chip e-segunda debajo de la barra)",
      "que": "A 1920 la barra «EL CAUDILLO 179/390» se monta encima del primer renglón de la cuenta y tapa «MULTI 5 = 140»: queda «J - 14U». El chip «TAJO DE REVÉS» de abajo de la barra pisa el «Mente fría +8» del desglose, y el cetro del Bufón atraviesa «DAÑO 28». A 1366 pasa lo mismo: el rótulo «TAJO DE REVÉS» tapa el total «=140» y el chip «TAJO DE REVÉS ×2» de la cuenta. Con la segunda cara la cuenta suma dos renglones (ORO +1, TAJO ×2, LE QUEDAN), pero la escena sigue midiendo lo mismo.",
      "por_que": "Es el momento más tenso del juego (el Rey cambió de reglas y te pega ×2) y en la ventana principal de escritorio no se ve el número que decide si golpeás. Con dos capas de la misma tinta oscura una encima de otra, el ojo no sabe cuál leer.",
      "propuesta": "Reservar en la rejilla de la escena el alto del rasgo o de la segunda cara (fila propia entre barras y cuenta, nada de margen negativo) y sumar a la QA una comprobación de solapes entre .e-barras, .e-rasgo y .cuenta en los cuatro tamaños de ventana con mesa-segunda. Sacar el chip «TAJO ×2» repetido de la cuenta si ya late el rótulo del Rey."
    },
    {
      "prioridad": "P1",
      "pantalla": "la segunda cara del Rey (volteo y después)",
      "ventana": "todas (secuencia rey-segunda, 1280 y 390)",
      "archivo": "src/client/pantallas/mesa.ts:138 (pxNaipe({palo, n: rango}) igual antes y después) y :768-773 (el volteo vuelve a pintar el mismo naipe); src/client/estilos/mesa.css:2014-2022 (latido con box-shadow desenfocado y ease-in-out) y :2405-2411",
      "que": "El acto está bien montado (frenazo, grietas, cartel carmesí que cae), pero cuando el naipe termina de darse vuelta muestra el mismo Rey, con el mismo dibujo y la misma rampa. Lo único que cambia es que el filete pasa de celeste a rojo (rey-segunda-02 contra -12). El chip de la segunda cara todavía brilla con un halo CSS borroso, fuera de la rejilla de píxeles.",
      "por_que": "Si un volteo revela la misma cara, la promesa queda rota: el ojo ve que no cambió nada y la amenaza nueva queda solo en el texto. En Inscryption cada cambio de fase cambia el dibujo. Acá es el único lugar del juego donde el pixel-art podía contar una regla, y no la cuenta.",
      "propuesta": "Una variante `segunda` en el dibujo del naipe de Rey: rampa corrida al carmesí o al violeta, ceño y boca nuevos, corona torcida, una grieta tramada a celda entera sobre el manto y el arma en alto. El volteo revela ese dibujo. El latido del chip, con pasos (steps) y un borde de 2 px que alterna dos tintas, sin blur."
    },
    {
      "prioridad": "P1",
      "pantalla": "cobro y botín, final (victoria y derrota), Ajustes y Crónica",
      "ventana": "1920x1080 y 1280x800",
      "archivo": "src/client/estilos/pantallas.css:317-353 y :2170-2200 (botín), :588-640 (final), Ajustes y Crónica en el mismo archivo; src/client/pantallas/mesa.ts:793-835 (cobrar despeja la mesa antes de que brote el botín)",
      "que": "Cuarta versión con el mismo reclamo. El cobro ahora despeja la mesa, y lo que queda es aún más vacío: durante casi un segundo hay solo madera y el Bufón (botin-brota-08, rey-cae-09/12). Después brota un panel de lista chico (BOTÍN, tres renglones y SEGUIR) en medio de 1920 px de nada. «La Corte cayó» y «Te llevó la Corte» siguen siendo un título, cuatro retratos, un Bufón de 70 px y una tabla sobre un degradé. Ajustes deja 230 px muertos y Crónica, media pantalla.",
      "por_que": "Con la mesa, el mapa, La Pulpería y el Fogón hechos lugares, el premio y el final son las pantallas más pobres del juego. Son justo las que el jugador recuerda y las que muestra en una captura.",
      "propuesta": "Que el botín sean piezas grandes sobre la mesa despejada, con el molde de «Elegí un Amuleto» (la moneda, el corazón y la corona del Rey dibujados a escala de naipe). Dos finales con escena propia: amanecer sobre el arrabal y candil que se apaga, con el Bufón a escala de mesa. Ajustes y Crónica al alto de su contenido."
    }
  ],
  "aciertos": [
    "La letra de cuerpo proporcional (Bitcount Prop Single) cerró la deuda más vieja: «sueldo», «Caudillo» y «Vida llena» se leen parejo, y al lado del tramado ya no parece un fallo de espaciado.",
    "Ya no hay cartel flotante en el conteo: la pieza que dispara se enciende dentro del propio desglose (golpe-03, golpe-06) y la cuenta tiene marco de hierro tramado. Se lee la causa en su lugar.",
    "La segunda cara es un acto con poses claras: frenazo con grietas eléctricas, cartel carmesí que cae y se asienta (rey-segunda-06, -07, -10).",
    "El Rey tiene voz al caer («Buen tajo... paisano.», rey-cae-06) y se raja en dos con el dibujo partido (rey-cae-07, botin-brota-06): el mejor cuadro del juego.",
    "En el móvil la cuenta en pisos con la segunda cara (390 mesa-segunda) entra entera y se lee mejor que en escritorio."
  ],
  "capturas_vistas": [
    "visual-qa/1920x1080/mesa.png", "visual-qa/1920x1080/mesa-segunda.png", "visual-qa/1920x1080/mesa-seleccion.png",
    "visual-qa/1920x1080/mesa-rey.png", "visual-qa/1920x1080/botin.png", "visual-qa/1920x1080/fin-victoria.png",
    "visual-qa/1920x1080/fin-derrota.png", "visual-qa/1920x1080/ajustes.png", "visual-qa/1920x1080/cronica.png",
    "visual-qa/1920x1080/portada.png", "visual-qa/1920x1080/mapa.png", "visual-qa/1920x1080/pulperia.png",
    "visual-qa/1920x1080/fogon.png", "visual-qa/1920x1080/elegi-amuleto.png",
    "visual-qa/1366x768/mesa-segunda.png", "visual-qa/1280x800/mesa-segunda.png",
    "visual-qa/390x844/mesa-segunda.png", "visual-qa/390x844/mesa-seleccion.png", "visual-qa/390x844/botin.png", "visual-qa/390x844/mapa.png",
    "jurado/secuencias/1280-golpe-02.png", "jurado/secuencias/1280-golpe-03.png", "jurado/secuencias/1280-golpe-05.png",
    "jurado/secuencias/1280-golpe-06.png", "jurado/secuencias/1280-golpe-08.png", "jurado/secuencias/1280-golpe-09.png",
    "jurado/secuencias/1280-rey-segunda-02.png", "jurado/secuencias/1280-rey-segunda-05.png", "jurado/secuencias/1280-rey-segunda-06.png",
    "jurado/secuencias/1280-rey-segunda-07.png", "jurado/secuencias/1280-rey-segunda-08.png", "jurado/secuencias/1280-rey-segunda-10.png",
    "jurado/secuencias/1280-rey-segunda-12.png", "jurado/secuencias/1280-rey-tajo-03.png", "jurado/secuencias/1280-rey-irrumpe-04.png",
    "jurado/secuencias/1280-rey-cae-06.png", "jurado/secuencias/1280-rey-cae-07.png", "jurado/secuencias/1280-rey-cae-08.png",
    "jurado/secuencias/1280-rey-cae-09.png", "jurado/secuencias/1280-rey-cae-12.png", "jurado/secuencias/1280-rey-cae-17.png",
    "jurado/secuencias/1280-botin-brota-04.png", "jurado/secuencias/1280-botin-brota-06.png", "jurado/secuencias/1280-botin-brota-08.png",
    "jurado/secuencias/1280-botin-brota-12.png", "jurado/secuencias/390-golpe-05.png", "jurado/secuencias/390-rey-segunda-08.png"
  ]
}
```

## Veredicto

La 0.16.0 paga dos deudas mías: la letra de cuerpo y el cartel del conteo. Por eso estética sube de 7,1 a 7,4. No sube más porque lo nuevo, la segunda cara, trae el peor solape del juego en la ventana principal de escritorio, y porque el acto termina revelando el mismo dibujo. Claridad baja un poco (7,3 a 7,2): el golpe se lee mejor, pero la pelea contra el Rey a 1920 y a 1366 esconde el total. Diversión sube a 7,0 por la segunda cara como acto y la caída del Rey con voz.

**Respecto de la 0.15.0:** resuelto el defecto 1 (cartel flotante del conteo: ahora la pieza se enciende dentro del desglose, y la cuenta tiene marco tramado) y el 3 (letra de cuerpo proporcional). Sigue el 2 (botín, finales, Ajustes y Crónica sin escena: cuarta vez). De los menores: resuelta la segunda cara sin captura (ya hay estado y secuencia); siguen el latido con blur, el bocadillo pegado al borde y la primera fila del mapa sobre el horizonte.

## Defectos menores

- **El bocadillo de la segunda cara** queda pegado a x≈5 y tapa «EL ARRABAL · REY» a 1280. A 390 cae detrás de la mano y corta «Cambiá de jugada cada golpe» (rey-segunda-08). `src/client/estilos/mesa.css:35-41` y `:2342-2352`; `src/client/pantallas/mesa.ts:784`.
- **La banda «CARA DE PÓKER»** cae justo en el impacto del golpe y apaga el «318» sobre el naipe (golpe-08/09). Es una franja negra plana sin tramado. `src/client/pantallas/mesa.ts:628-632`; esperar al fin del número.
- **El grito «Barrido y a la bolsa»** se dispara ya con «Elegí un Amuleto» abierto y queda fantasma debajo de SALTAR (rey-cae-17). `src/client/pantallas/mesa.ts:835`.
- **La cuenta «del ancho de lo que dice»** sigue de lado a lado cuando suma chips (1270 px a 1280 en mesa-segunda): la regla general pierde ante la de 1180 px. `src/client/estilos/mesa.css:1708-1710` contra `:2037-2041`.
- **Mesa en el golpe:** cuando la mano vuela, los «+2» y «+3» quedan flotando en el hueco vacío, y el «+27» del Mate se monta sobre las fichas del HUD (golpe-05/06). `src/client/fx/efectos.ts` (anclaje de `numero`).

## Qué haría en la próxima versión

Un paquete «**la cara del Rey**». Primero, una rejilla de escena que reserve su fila al rasgo o a la segunda cara y una puerta de QA que falle ante cualquier solape entre barra, rasgo y cuenta en las cuatro ventanas. Segundo, cuatro naipes de Rey en segunda cara dibujados de verdad (rampa nueva, gesto, grieta, arma en alto) que el volteo revele, y el halo pasado a píxel. Tercero, terminar la casa: botín como piezas sobre la mesa despejada, sin el segundo muerto de madera vacía, y dos finales con escena propia y el Bufón a escala. Con eso la estética pasa el 8.
