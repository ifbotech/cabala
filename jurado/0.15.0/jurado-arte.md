```json
{
  "jurado": "jurado-arte",
  "version": "0.15.0",
  "puntajes": { "claridad": 7.3, "diversion": 6.8, "estetica": 7.1, "veredicto": 7.0 },
  "defectos": [
    {
      "prioridad": "P1",
      "pantalla": "mesa, durante el conteo del golpe",
      "ventana": "1280x800 y 390x844",
      "archivo": "src/client/pantallas/mesa.ts:714-722 (cartel anclado a rc.bottom de la cuenta) y src/client/estilos/mesa.css:1582-1590 (.c-vuela) y :1674-1688 / :1767-1769 (cuenta de 1180 px con desglose)",
      "que": "El conteo ya no amontona rótulos, pero cambió un problema por dos. La cuenta es ahora una franja negra plana de lado a lado (1180 px a 1280) que corta la mesa de madera en dos, sin marco ni tramado. Y el cartel único se planta justo sobre el renglón del desglose, tapando la misma pieza que anuncia («Short hand +4» encima de «Short hand +4»), con un azul liso que parece texto seleccionado del navegador. En 390 el cartel cae sobre los naipes de la mano, junto a los +2/+3/+5, y el «+24» del Amuleto muerde el retrato. Además, mientras cuenta, el hueco de MULTI vacío y el «=312» al 18 % dejan la fórmula con dientes (golpe-02, conteo).",
      "por_que": "Es el momento estrella y ahora tiene la peor pieza de interfaz del juego: un panel de depuración cruzando la escena. Balatro hace brillar la ficha que dispara en su lugar; acá se repite la información dos veces, una tapando a la otra.",
      "propuesta": "Sacar el cartel flotante: que la pieza que dispara se encienda dentro del propio desglose (fondo de su color, un brinco de 1,15×) y su ficha del HUD salte. La cuenta, con el marco de 9 trozos del HUD y su tramado, y del ancho de la fórmula, no de la pantalla. MULTI arranca mostrando su valor base, no un hueco."
    },
    {
      "prioridad": "P1",
      "pantalla": "botín, ajustes, crónica, final (victoria y derrota)",
      "ventana": "1920x1080",
      "archivo": "src/client/estilos/pantallas.css:317-353 (botín), :588-640 (final), :713 (ajustes y crónica); src/client/fx/escenas.ts:495-500 (penumbra de portada y menús)",
      "que": "Tercera versión sin tocar. Botín: el mismo panel de lista de 620 px a la derecha, la mitad inferior de la mesa vacía. Ajustes: 230 px de nada entre el bocadillo y el panel, y un Bufón de 60 px perdido arriba. «La Corte cayó»: título, cuatro retratos, un Bufón diminuto y una tabla sobre el degradé radial; el cuadro que debería ser el más memorable es el más pobre.",
      "por_que": "Con mesa, mapa, Pulpería y Fogón ya hechos lugares, estas pantallas parecen de otro juego, y dos de ellas son premio (botín y victoria).",
      "propuesta": "Botín en piezas grandes sobre la mesa con el molde de «Elegí un Amuleto». Final con escena propia: amanecer sobre el arrabal (victoria), candil que se apaga sobre la mesa (derrota), el Bufón a escala de mesa. Ajustes y Crónica al alto de su contenido, pegados al bocadillo."
    },
    {
      "prioridad": "P1",
      "pantalla": "todo el texto corrido",
      "ventana": "todas",
      "archivo": "src/client/estilos/base.css:108",
      "que": "Sigue DotGothic16 con huecos de ancho fijo: «Vida l lena», «cába la», «Caudi l lo», «Fi lo», «sue ldo». Tercera vez que lo marco.",
      "por_que": "Es la textura más vista del juego y la última marca de prototipo en todas las pantallas; al lado del tramado de las escenas parece un fallo de espaciado.",
      "propuesta": "Letra de cuerpo proporcional forjada en casa (anchos por glifo, como src/client/pixel/cifras.ts) o una pixel latina proporcional. Las cifras y la romana de títulos se quedan."
    }
  ],
  "aciertos": [
    "El desglose fijo bajo la cuenta, en reposo (golpe-06/08), se lee de un vistazo con Daño en rosa y Multi en celeste: la claridad del golpe subió.",
    "Los glifos del mando (A, X, Y, SEL, RT) están dibujados en el mismo pixel-art y colores que el resto; no parecen pegados de otro kit.",
    "La Pulpería ganó: las tres piezas tienen el color de su palo y el precio grande; a 1280 entra entera y sin mordidas.",
    "Rótulos del enemigo (TE PEGA, +3 FURIA, QUEDA 1, INMUNE A ESPADAS) ordenan la cabecera sin ensuciarla.",
    "El golpe final sigue con poses claras: cifra enorme sobre el naipe y el naipe que se raja en dos (botin-brota-05)."
  ],
  "capturas_vistas": [
    "visual-qa/1920x1080/mesa.png", "visual-qa/1920x1080/mesa-rey.png", "visual-qa/1920x1080/botin.png",
    "visual-qa/1920x1080/portada.png", "visual-qa/1920x1080/mapa.png", "visual-qa/1920x1080/pulperia.png",
    "visual-qa/1920x1080/elegi-amuleto.png", "visual-qa/1920x1080/ajustes.png", "visual-qa/1920x1080/fin-victoria.png",
    "visual-qa/1280x800/mesa.png", "visual-qa/1280x800/pulperia.png",
    "visual-qa/390x844/mesa.png", "visual-qa/390x844/mapa.png",
    "jurado/secuencias/1280-golpe-02.png", "jurado/secuencias/1280-golpe-04.png", "jurado/secuencias/1280-golpe-06.png",
    "jurado/secuencias/1280-golpe-08.png", "jurado/secuencias/390-golpe-05.png",
    "jurado/secuencias/1280-rey-irrumpe-03.png", "jurado/secuencias/1280-rey-irrumpe-06.png",
    "jurado/secuencias/1280-rey-cae-04.png", "jurado/secuencias/1280-rey-cae-08.png",
    "jurado/secuencias/1280-botin-brota-05.png", "mirar/1280-conteo.png"
  ]
}
```

## Veredicto

La 0.15.0 es una versión de reglas y de mando, y en lo visual se nota: casi nada cambió de lugar. Lo que sí tocó, el conteo, quedó más legible en reposo y más feo en movimiento. Estética baja de 7,2 a 7,1 por la franja negra que cruza la mesa; claridad sube de 7 a 7,3 por el desglose y los rótulos del enemigo. Ningún P0.

**Respecto de la 0.14.0:** el defecto 1 (rótulos encimados en el conteo) quedó resuelto a medias: uno solo a la vez y fuera de la barra de Vida, pero ahora tapa el desglose y en 390 cae sobre la mano. Siguen sin tocar el 2 (botín, menús y espacios muertos a 1920; la mano a 1920 sigue centrada en x≈810 contra el enemigo en 960) y el 3 (letra de cuerpo). De los menores: resuelto «AL DESCARTE» cortado a 1280; siguen el índice sobre la primera pinta, los pies del Bufón bajo el mostrador, los nodos del mapa sobre el horizonte y el Rey sin pose de entrada.

## Defectos menores

- **Segunda cara del Rey:** no hay captura ni secuencia de ella (leído en código, no visto), y el latido usa `box-shadow` con desenfoque y `ease-in-out`, un brillo suave que rompe la rejilla de píxeles. `src/client/estilos/mesa.css:2073-2081`; pedir el estado a la QA.
- **Rey que irrumpe:** los cuadros 03 y 06 son idénticos salvo la lluvia; sin pose ni halo. En `rey-cae-04` el bocadillo tapa el nombre en la barra de Vida y en `rey-cae-08` «Swept and bagged» pisa la mano. `src/client/pantallas/mesa.ts:354-372` y la caída del Rey.
- **Bocadillo del Bufón:** a 1280 crece hacia la izquierda hasta pegarse al borde (x≈5); en 390 tapa el título del tramo arriba a la izquierda. `src/client/estilos/mesa.css:35-41` y `:610-632`.
- **Mapa:** la primera fila de nodos sigue encima de ranchos y molinos; en 390 el Bufón pisa el horizonte. `src/client/fx/escenas.ts:982` (yH) y `src/client/estilos/pantallas.css:238-257`.
- **Mesa a 1280:** el índice sigue tapando la primera pinta (3 y 9 de Oros, 3 y 5 de Copas). `src/client/estilos/mesa.css:1104-1135`.

## Qué haría en la próxima versión

Un paquete «**una sola casa**». Primero, rehacer la cuenta como objeto del juego: marco de 9 trozos, tramado, ancho de la fórmula, y la pieza que dispara encendida dentro del desglose, sin cartel flotante. Segundo, terminar de llevar la escena a lo que falta: botín como piezas sobre la mesa, dos finales con cuadro propio y el Bufón a escala de mesa, Ajustes y Crónica al alto de su contenido. Tercero, darle a los Reyes un cuerpo de entrada y una segunda cara que se vea en pixel-art (el naipe cambia de dibujo o de rampa, no un brillo CSS), con su captura en la QA. Y la letra de cuerpo proporcional, que ya es deuda vieja: tercera versión que la pido.
