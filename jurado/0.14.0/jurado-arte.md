```json
{
  "jurado": "jurado-arte",
  "version": "0.14.0",
  "puntajes": { "claridad": 7, "diversion": 6.8, "estetica": 7.2, "veredicto": 7.0 },
  "defectos": [
    {
      "prioridad": "P1",
      "pantalla": "mesa, durante el conteo del golpe",
      "ventana": "1280x800 y 390x844",
      "archivo": "src/client/pantallas/mesa.ts:658-669 (rótulos .c-vuela) y su estilo en src/client/estilos/mesa.css",
      "que": "Los rótulos nuevos del conteo pieza por pieza («Dado cargado +8», «Cantos +8», «Par +4», «Cáliz +2», «Taba +1»...) nacen todos del mismo punto y se apilan en dos columnas pegadas que tapan el nombre y la barra de Vida del enemigo, la propia cuenta DAÑO × MULTI y las cartas que vuelan. En 390 llegan a siete etiquetas encimadas sobre el naipe enemigo y el total «340» queda mordido por el Multi.",
      "por_que": "Es el momento estrella del juego y hoy es el cuadro más sucio: el ojo no puede leer ni la etiqueta ni la cifra. Balatro enseña la pieza que dispara en su lugar, de a una; acá se pisa todo en 400 ms.",
      "propuesta": "Una sola etiqueta viva por lado a la vez (la nueva reemplaza a la anterior), anclada fuera de la barra de Vida: Daño a la izquierda de la cuenta, Multi a la derecha. O directamente sin texto flotante: que el nombre aparezca sobre la ficha del HUD que dispara, que ya salta con su «+2»."
    },
    {
      "prioridad": "P1",
      "pantalla": "botín, ajustes, crónica, colección y mesa con mano de 3",
      "ventana": "1920x1080",
      "archivo": "src/client/estilos/pantallas.css:317-353 (botín), :713 (crónica y ajustes); src/client/estilos/mesa.css:416-422 (rejilla de la mano)",
      "que": "Sigue igual que en la 0.13.0. Botín: el mismo panel de lista de 620 px, ahora sobre la mesa de madera pero con la mitad de abajo vacía. Ajustes: 220 px de nada entre el bocadillo y el panel. Crónica: tres filas en un marco de 700 px. Colección: 230 px muertos abajo. Mesa: la mano sigue centrada en x≈812 contra el enemigo en 960, porque la rejilla tiene columnas laterales desiguales.",
      "por_que": "Con escena detrás el vacío se nota menos en la mesa, pero el botín sigue siendo la pantalla más pobre siendo el premio, y las pantallas de menú parecen maquetas.",
      "propuesta": "Botín como piezas grandes en fila sobre la mesa (el mismo molde de «Elegí un Amuleto»). Columnas laterales iguales en .mano-zona para centrar la mano bajo el enemigo. Ajustes y Crónica: panel pegado al bocadillo y alto según contenido."
    },
    {
      "prioridad": "P1",
      "pantalla": "todo el texto corrido",
      "ventana": "todas",
      "archivo": "src/client/estilos/base.css:95",
      "que": "La letra de cuerpo sigue siendo DotGothic16 con sus huecos de ancho fijo: «Caudi l lo», «Vida l lena», «Semi l la», «Te l impiaron», «Cuchi l lo». Sin cambios.",
      "por_que": "Es la textura más repetida del juego y ahora desentona más: al lado de escenas tramadas con oficio, el texto parece un fallo de espaciado.",
      "propuesta": "Letra de cuerpo proporcional forjada en casa (anchos por glifo, en la línea de src/client/pixel/cifras.ts) o una de punto pensada para alfabeto latino. Las cifras se quedan."
    }
  ],
  "aciertos": [
    "Ahora hay lugares: mesa de tablas con vetas, nudos y candil; Pulpería con estantes, damajuanas y farol; Fogón con cielo estrellado, ranchos con luz, pava y brasas; mapa con luna, molinos y horizonte de arrabal. Tramado a celda entera y paleta coherente con los naipes.",
    "El Fogón a 1920 es la mejor pantalla nueva: la luz del fuego tiñe el suelo y ordena la composición.",
    "El clima del Rey (llovizna y tinte azul para Espadas) cambia la habitación sin tocar el HUD.",
    "El golpe final conserva poses claras: cifra enorme sobre el naipe rajado y cuenta limpia una vez que se van los rótulos.",
    "La baraja, los dorsos y los retratos siguen siendo de primera; «Elegí tu Mazo» y la vista del Mazo se recomiendan solas."
  ],
  "capturas_vistas": [
    "visual-qa/1920x1080/portada.png", "visual-qa/1920x1080/elegir-mazo.png", "visual-qa/1920x1080/mapa.png",
    "visual-qa/1920x1080/mesa.png", "visual-qa/1920x1080/mesa-rey.png", "visual-qa/1920x1080/botin.png",
    "visual-qa/1920x1080/elegi-amuleto.png", "visual-qa/1920x1080/pulperia.png", "visual-qa/1920x1080/fogon.png",
    "visual-qa/1920x1080/mazo.png", "visual-qa/1920x1080/coleccion.png", "visual-qa/1920x1080/cronica.png",
    "visual-qa/1920x1080/ajustes.png", "visual-qa/1920x1080/fin-victoria.png", "visual-qa/1920x1080/fin-derrota.png",
    "visual-qa/1280x800/mesa.png", "visual-qa/1280x800/pulperia.png", "visual-qa/1280x800/mapa.png",
    "visual-qa/390x844/mesa.png", "visual-qa/390x844/pulperia.png", "visual-qa/390x844/mapa.png", "visual-qa/390x844/fogon.png",
    "jurado/secuencias/1280-rey-irrumpe-01.png", "jurado/secuencias/1280-rey-irrumpe-02.png",
    "jurado/secuencias/1280-rey-irrumpe-04.png", "jurado/secuencias/1280-rey-irrumpe-06.png",
    "jurado/secuencias/1280-golpe-03.png", "jurado/secuencias/1280-golpe-05.png", "jurado/secuencias/1280-golpe-07.png",
    "jurado/secuencias/390-golpe-05.png", "jurado/secuencias/1280-botin-brota-05.png",
    "jurado/secuencias/1280-mapa-paso-03.png", "mirar/1280-rey-cae.png"
  ]
}
```

## Veredicto

La 0.14.0 atacó de frente mi defecto número uno y se nota: las cuatro paradas de la partida ya son lugares, y están dibujados con el mismo oficio que los naipes. Eso sube la estética de 6,5 a 7,2. No sube más porque la escena todavía es un telón: la interfaz no se apoya en ella (el Bufón flota sobre la mesa, los nodos del mapa flotan sobre el cielo), el resto del juego sigue en la penumbra radial, y el conteo nuevo ensucia el mejor momento. Ningún P0.

**Respecto de la 0.13.0:** resuelto en lo esencial el defecto 1 (escenas en mesa, mapa, Pulpería y Fogón; faltan portada, menús y final). Siguen sin tocar el 2 (espacios muertos a 1920 y mano descentrada) y el 3 (letra de cuerpo). De los menores: sigue el índice que tapa la primera pinta a 1280, siguen los pies del Bufón bajo el mostrador y las pintas que se salen de los nodos; el Rey ganó clima pero no pose de entrada; los «+7» sobre la cuenta empeoraron con los rótulos nuevos.

## Defectos menores

- **Portada, Elegí tu Mazo, Colección, Crónica, Ajustes y final:** siguen en la penumbra radial; la victoria y la derrota, que deberían ser el cuadro más memorable, son paneles sobre un degradé. `src/client/fx/escenas.ts:1233-1236`.
- **Mapa (todas las ventanas):** la fila de nodos de arriba queda encima del horizonte y del cielo, tapando ranchos y molinos; el camino no pisa el suelo que se dibujó. `src/client/fx/escenas.ts:980` (altura del horizonte) y `src/client/estilos/pantallas.css:238-257`.
- **Pulpería:** hay dos mostradores (el de la escena, `escenas.ts:809`, y el tablón liso de CSS, `pantallas.css:1549-1562`) y los pies y el bastón del Bufón siguen asomando por debajo. A 1920 el panel de Servicios queda cortado por el HUD; a 1280 el rótulo «Amuletos · Huecos» está mordido por el filete superior del marco.
- **Mesa a 1280:** el índice grande sigue tapando la primera pinta (6 y 7 de Oros, 7 de Copas) y «AL DESCARTE» se corta contra el borde izquierdo. `src/client/estilos/mesa.css:1104-1135`.
- **Rey:** en `rey-irrumpe` los cuadros 02, 04 y 06 solo difieren en la luz de la mesa; el Rey no tiene pose de entrada ni halo visible (la «caída del Rey» del commit la leí en código, no la vi), y en `mirar/1280-rey-cae` el bocadillo tapa el nombre en la barra de Vida.

## Qué haría en la próxima versión

Un paquete «**la interfaz pisa la escena**». Primero, limpiar el conteo: una etiqueta por lado, fuera de la barra de Vida, o el nombre sobre la ficha que dispara. Segundo, apoyar las cosas: sombra de contacto del Bufón y del naipe enemigo sobre las tablas, un solo mostrador que de verdad lo tape, y el mapa con el horizonte arriba de la primera fila de nodos para que el camino corra por el suelo. Tercero, llevar la escena a lo que falta: portada con la mesa servida y los cinco dorsos, y dos finales con cuadro propio (amanecer sobre el arrabal en la victoria, candil apagado en la derrota). Cuarto, la deuda de composición a 1920: botín en piezas grandes sobre la mesa, mano centrada, Ajustes y Crónica al alto de su contenido. Y, de una vez, la letra de cuerpo proporcional: es el último rasgo de prototipo que queda a la vista en todas las pantallas.
