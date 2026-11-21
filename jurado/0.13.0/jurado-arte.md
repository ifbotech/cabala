```json
{
  "jurado": "jurado-arte",
  "version": "0.13.0",
  "puntajes": { "claridad": 7, "diversion": 6.5, "estetica": 6.5, "veredicto": 6.6 },
  "defectos": [
    {
      "prioridad": "P1",
      "pantalla": "mesa, mapa, botín, fogón, pulpería, fin (todas)",
      "ventana": "1920x1080 y 1280x800",
      "archivo": "src/client/fx/motor.ts:57-63 (tabla ESCENA) y :74 (pintarFondo)",
      "que": "No hay escena en ninguna pantalla: el fondo es siempre la misma penumbra radial tramada, cambiada de tinte. La mesa no tiene mesa (el enemigo flota sobre una elipse violeta), el Fogón no tiene fogón, el mapa no tiene arrabal, la Pulpería es un tablón plano de un solo color.",
      "por_que": "Es justo lo que separa a esto de Inscryption u Obra Dinn: allá cada pantalla es un lugar. Acá los naipes y los retratos son de primera, pero están pegados sobre un degradé; paneles que flotan sin apoyo y una sola 'habitación' para todo el juego.",
      "propuesta": "Sumar a pintarFondo una capa de escenografía tramada por escena, a celda entera y pintada una sola vez: tablas de mesa con canto y sombra bajo la mano y el enemigo, estantes y botellas en la Pulpería, horizonte de ranchos en el mapa, leños y círculo de luz en el Fogón. Sin tocar reglas ni HUD."
    },
    {
      "prioridad": "P1",
      "pantalla": "botín, ajustes, crónica, colección, mesa con mano de 3",
      "ventana": "1920x1080",
      "archivo": "src/client/estilos/pantallas.css:317-335 (botín), :712 (crónica y ajustes); src/client/estilos/mesa.css:423 (mano)",
      "que": "Espacios muertos grandes. Botín: un panel de 620 px en una pantalla de 1920, con el 60 % vacío. Ajustes: el panel arranca a media pantalla con 220 px de nada arriba. Crónica: tres filas en un marco de 700 px de alto. Colección: 230 px vacíos abajo. Mesa: la mano de 3 queda corrida a la izquierda (centro en x≈812 contra el enemigo en 960) y todo el tercio derecho solo tiene dos botones.",
      "por_que": "El ojo no sabe dónde posarse y la pantalla parece una maqueta a medio llenar; el botín, que debería ser el premio, es la pantalla más pobre del juego.",
      "propuesta": "Botín: las recompensas como naipes o piezas grandes en fila (como 'Elegí un Amuleto'), no como filas de lista. Centrar la mano bajo el enemigo y agrandar el naipe enemigo un escalón entero. Ajustes y Crónica: panel anclado bajo el bocadillo y alto según contenido."
    },
    {
      "prioridad": "P1",
      "pantalla": "todo el texto corrido (bocadillos, descripciones, cabeceras)",
      "ventana": "todas",
      "archivo": "src/client/estilos/base.css:95",
      "que": "La letra de cuerpo (DotGothic16) deja huecos de ancho fijo en las letras finas: se lee 'Caudi l lo', 'Mul t i', 'Sem i l la', 'Cuchi l lo crio l lo', 'Cá l iz'. Además convive con otras dos familias (rótulos anchos y cifras condensadas) sin relación entre sí.",
      "por_que": "Es la textura más repetida del juego y se ve como un fallo de espaciado; rompe la lectura de nombres propios y le quita oficio a pantallas que por lo demás están bien forjadas.",
      "propuesta": "Cambiar la letra de cuerpo por una de punto proporcional pensada para alfabeto latino, o forjar una propia en src/client/pixel/cifras.ts con anchos por glifo; mantener las cifras actuales, que son lo mejor de la tipografía."
    }
  ],
  "aciertos": [
    "La baraja: los 36 naipes, los ases y la Corte tienen silueta limpia, palos distinguibles sin color y un tramado parejo; la vista del Mazo a 1920 es la mejor pantalla del juego.",
    "Dorsos de los 5 Mazos y retratos de Personajes y Reyes: paleta saturada con sombras al índigo, coherentes entre sí; 'Elegí tu Mazo' se recomienda sola.",
    "El golpe tiene poses claras: naipe que vuela, cuenta DAÑO × MULTI = total y el naipe enemigo rajado en dos con la cifra encima.",
    "Jerarquía de la mesa en 390x844: enemigo, cuenta, mano y barra del pulgar se leen de un vistazo.",
    "El Bufón que se deshace en píxeles al cambiar de pantalla da continuidad al anfitrión."
  ],
  "capturas_vistas": [
    "visual-qa/1920x1080/portada.png", "visual-qa/1920x1080/elegir-mazo.png", "visual-qa/1920x1080/elegi-una.png",
    "visual-qa/1920x1080/mapa.png", "visual-qa/1920x1080/mesa.png", "visual-qa/1920x1080/mesa-seleccion.png",
    "visual-qa/1920x1080/mesa-rey.png", "visual-qa/1920x1080/botin.png", "visual-qa/1920x1080/elegi-amuleto.png",
    "visual-qa/1920x1080/pulperia.png", "visual-qa/1920x1080/fogon.png", "visual-qa/1920x1080/cabala.png",
    "visual-qa/1920x1080/mazo.png", "visual-qa/1920x1080/jugadas.png", "visual-qa/1920x1080/altar.png",
    "visual-qa/1920x1080/coleccion.png", "visual-qa/1920x1080/coleccion-reyes.png", "visual-qa/1920x1080/coleccion-amuletos.png",
    "visual-qa/1920x1080/cronica.png", "visual-qa/1920x1080/ajustes.png", "visual-qa/1920x1080/fin-victoria.png",
    "visual-qa/1920x1080/fin-derrota.png", "visual-qa/1280x800/mesa-mentiroso.png", "visual-qa/1280x800/mapa.png",
    "visual-qa/390x844/portada.png", "visual-qa/390x844/mesa.png", "visual-qa/390x844/mapa.png", "visual-qa/390x844/pulperia.png",
    "jurado/secuencias/1280-golpe-03.png", "jurado/secuencias/1280-golpe-05.png", "jurado/secuencias/390-golpe-04.png",
    "jurado/secuencias/1280-rey-irrumpe-01.png", "jurado/secuencias/1280-rey-irrumpe-03.png", "jurado/secuencias/1280-rey-irrumpe-05.png",
    "jurado/secuencias/1280-botin-brota-04.png", "jurado/secuencias/1280-mapa-paso-03.png", "jurado/secuencias/1280-portada-02.png",
    "mirar/1280-rey-cae.png"
  ]
}
```

## Veredicto

CÁBALA 0.13.0 tiene **piezas de 8 y pantallas de 6**. Los naipes, los dorsos, los retratos y las cifras están forjados con criterio: tramado a celda entera, luz consistente, palos que se leen sin color. Pero el juego todavía no tiene *lugares*: todo ocurre sobre la misma penumbra radial, y eso lo deja lejos de los referentes de mi ficha. No encontré nada que rompa la experiencia (ningún P0); encontré tres cosas que la frenan en todas las pantallas.

No me pasaron veredicto de la versión anterior, así que no comparo.

## Defectos menores

- **Pulpería (1920 y 1280):** el bastón y los pies del Bufón asoman por debajo del mostrador, que es un rectángulo liso; además a 1920 el marco de Servicios queda comido por el HUD. `src/client/estilos/pantallas.css:1548-1562`.
- **Mano a 1280:** el parche del índice grande tapa la primera pinta (3 y 7 de Oros, 8 de Bastos, 9 de Espadas). `src/client/estilos/mesa.css:1104-1135`.
- **Golpe (1280 y 390):** los «+7» flotantes caen encima de la fila «¡EXACTO! +3 +1» de la cuenta. `src/client/pantallas/mesa.ts:555`.
- **Rey:** en la secuencia `rey-irrumpe` los cuadros 03 y 05 son iguales y el Rey entra como un naipe más con filete celeste; no vi halo ni pose de entrada (el halo de `mesa.ts:400` lo leí en código, no lo vi). En `mirar/1280-rey-cae` el bocadillo tapa corona e índice.
- **Mapa:** las pintas de cada nodo se salen del marco por abajo y los nodos lejanos casi no contrastan con el fondo. `src/client/estilos/pantallas.css:257`. De paso, Fogón ofrece «Curás 0 de Vida» con marco rojo de opción viva (`src/client/pantallas/camino.ts:567`).

## Qué haría en la próxima versión

Un paquete «**cada pantalla, un lugar**». Primero, escenografía tramada por escena en `pintarFondo`: la mesa de madera con su canto, la Pulpería con estantes y un mostrador que de verdad tape al Bufón, el Fogón con leños y un círculo de luz que tiña los paneles, el mapa con un horizonte de arrabal. Segundo, recomponer a 1920 las cinco pantallas flojas: botín como piezas grandes en fila, mano centrada bajo un enemigo un escalón más grande, y Ajustes, Crónica y Colección con paneles del alto de su contenido. Tercero, una letra de cuerpo proporcional forjada en casa para terminar con los huecos de «Caudi l lo». Y un remate para el Rey: una entrada con dos poses claras (sombra que crece, naipe que cae con halo de su palo), que hoy es el momento más importante de cada tramo y visualmente no se distingue de una Sota.
