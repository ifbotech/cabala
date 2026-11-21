```json
{
  "jurado": "jurado-arte",
  "version": "0.19.0",
  "puntajes": { "claridad": 7.5, "diversion": 7.3, "estetica": 7.9, "veredicto": 7.6 },
  "defectos": [
    {
      "prioridad": "P1",
      "pantalla": "mesa, el remate con canto (secuencias golpe, botin-brota y rey-segunda)",
      "ventana": "1280x800 (y 390x844)",
      "archivo": "src/client/pantallas/mesa.ts:516-531 (canto-grande en centro(carta())), :535-540 y :913-917 (carrilDano: número alineado a la derecha sobre el canto izquierdo, vx −18)",
      "que": "El número del daño y el canto en grande nacen a 100 px uno del otro y chocan. En 1280-golpe-09 se lee «700¡ESCOBA!»: el «700» tapa el escudo de INMUNE A ESPADAS y el «¡E» del canto, y el canto cae sobre la cara de la Sota. En 1280-botin-brota-08 el choque se repite sobre el naipe que se raja, con el canto medio escondido detrás de las mitades. En el mismo cuadro, «¡ESCOBA!» está tres veces: el sello grande, el chip de la cuenta y el bocadillo del Personaje sobre el HUD. En 1280-rey-segunda-06, el «297» tapa el escudo de inmunidad del Caudillo.",
      "por_que": "Es el cuadro más festejado del juego (abatir con canto) y se lee como una pila de letras. El carril nuevo saca el número de la cara, pero lo manda justo adonde están los sellos del enemigo y adonde estampa el canto.",
      "propuesta": "Darle a cada cosa su turno: el número primero, y el canto unos 250 ms después y en carril(-0.1), arriba del naipe. Si hay sellos (.e-sellos), el número sale a la derecha. Cuando vuela el canto grande, el grito del Personaje no repite el texto (que haga solo el gesto del retrato). Sumar golpe-09 y botin-brota-08 a la puerta de solapes: ningún título en vuelo encima de otro ni de .e-sellos."
    },
    {
      "prioridad": "P1",
      "pantalla": "Altar, Colección, Portada y Elegí tu Mazo (y Ajustes)",
      "ventana": "1920x1080 y 390x844",
      "archivo": "src/client/fx/escenas.ts:495-500 y :1355-1362 (penumbra(): un degradé radial para portada y altar), src/client/juego.ts:36-43 (Mazo y Colección usan 'portada'; Ajustes usa 'pulperia'), src/client/pantallas/menu.ts:182 (pantallaAltar)",
      "que": "La mesa, el mapa, La Pulpería, el Fogón, la Crónica y los finales ya son escenas. Las cuatro pantallas del metajuego siguen siendo paneles sobre un degradé violeta. El Altar es una planilla: siete filas con siete botones amarillos iguales, cuadraditos de progreso y un Bufón de 60 px flotando junto a su bocadillo. A 390 son seis barras amarillas que se comen la pantalla y no dicen qué mejora cada una. Colección y Portada dejan el tercio de abajo en negro. Ajustes sigue en los estantes de La Pulpería: parece la tienda.",
      "por_que": "Por estas pantallas se pasa entre partida y partida. Son las que hacen que el juego se sienta como un lugar y no como un menú. Hoy dos mundos conviven: el arrabal pintado y la web con marcos dorados. Inscryption gana justamente acá: la cabaña es el menú.",
      "propuesta": "Una escena 'altar': un rincón de pulpería con un altarcito de esquina, velas, naipes clavados y un platito de porotos. Cada mejora, una vela o un exvoto que se enciende por nivel, en lugar de cuadraditos, y un solo botón MEJORAR, el de la fila elegida. Colección como pared de naipes clavados. Portada y Elegí tu Mazo sobre la mesa de tablas con la vela. Ajustes, en la mesa, con el abanico de Dorsos que ya existe."
    },
    {
      "prioridad": "P2",
      "pantalla": "mesa en el escalón portátil/Deck (mano a 2×)",
      "ventana": "1280x800 y 1366x768",
      "archivo": "src/client/estilos/mesa.css:3277-3280 (margin-bottom: −22px × k), :3275 (--k-bufon: 1) y :3303-3308 (.e-centro recortado contra el borde)",
      "que": "La mesa ya no salta, pero la mano sigue hundida unos 44 px bajo el HUD. Arriba de la mano quedan unos 100 px de madera vacía, sobre la línea «elige · golpea». Los naipes sin elegir pierden el índice de abajo y la última fila de pintas (1280 mesa y mesa-segunda: el 9 de Copas termina en medio cáliz). El Rey sigue pegado al borde de arriba, sin margen. El Bufón mide 60 px en la Deck contra unos 400 a 1920: hay tres escalas del anfitrión. Con la cuenta abierta, la vela queda tapada entera bajo la cuenta (1280 y 1366 mesa-seleccion).",
      "por_que": "Cuatro planos apilados sin aire. El recorte de la mano parece un error de maqueta y no un encuadre, porque el aire está justo encima.",
      "propuesta": "Subir la mano esos 44 px (la línea de ayuda puede ir dentro de la franja de botones). Dejar 8 px fijos entre el busto del Rey y la cabecera. Poner el Bufón a 2× con el bocadillo a su derecha. Que la vela se corra al costado de la cuenta cuando esta se abre."
    }
  ],
  "aciertos": [
    "El crítico ya no se estampa sobre el total: el ×2 se enciende en su término del MULTI («¡ESCOBA! ×2») y el total remata limpio (1280-golpe-06). Era mi P1.",
    "El Botín del Rey quedó resuelto en las dos ventanas: cinco columnas que no tocan al Bufón a 1280, una lista vertical prolija a 390, y la Vida máxima con dibujo propio (corazón con flecha), distinta de la Vida.",
    "La mesa ya no salta al elegir: la cuenta se aprieta en un renglón y «LA CORTE / QUEDA 1» queda al costado de su naipe, lejos de JUGADAS (1366 mesa-seleccion).",
    "El grito del Personaje ya vive junto al retrato y su cola le apunta (1920 mesa-grito, 1280 golpe-09). La victoria sigue siendo el mejor cuadro del juego."
  ],
  "capturas_vistas": [
    "visual-qa/1920x1080/mesa.png", "visual-qa/1920x1080/mesa-grito.png", "visual-qa/1920x1080/botin-rey.png",
    "visual-qa/1920x1080/mapa.png", "visual-qa/1920x1080/pulperia.png", "visual-qa/1920x1080/ajustes.png",
    "visual-qa/1920x1080/fin-victoria.png", "visual-qa/1920x1080/cronica.png", "visual-qa/1920x1080/altar.png",
    "visual-qa/1920x1080/coleccion.png", "visual-qa/1920x1080/portada.png", "visual-qa/1920x1080/elegir-mazo.png",
    "visual-qa/1280x800/mesa.png", "visual-qa/1280x800/mesa-seleccion.png", "visual-qa/1280x800/mesa-rey.png",
    "visual-qa/1280x800/mesa-segunda.png", "visual-qa/1366x768/mesa-seleccion.png",
    "visual-qa/390x844/mesa-seleccion.png", "visual-qa/390x844/mesa-grito.png", "visual-qa/390x844/altar.png",
    "jurado/secuencias/1280-golpe-04.png", "jurado/secuencias/1280-golpe-06.png", "jurado/secuencias/1280-golpe-07.png",
    "jurado/secuencias/1280-golpe-08.png", "jurado/secuencias/1280-golpe-09.png",
    "jurado/secuencias/1280-rey-cae-08.png", "jurado/secuencias/1280-rey-cae-11.png",
    "jurado/secuencias/1280-rey-segunda-06.png", "jurado/secuencias/1280-rey-segunda-10.png", "jurado/secuencias/1280-rey-segunda-12.png",
    "jurado/secuencias/1280-rey-irrumpe-06.png", "jurado/secuencias/1280-mapa-paso-03.png", "jurado/secuencias/1280-botin-brota-08.png",
    "jurado/secuencias/390-golpe-05.png", "jurado/secuencias/390-golpe-09.png",
    "jurado/secuencias/390-rey-cae-12.png", "jurado/secuencias/390-rey-cae-18.png", "jurado/secuencias/390-rey-segunda-10.png"
  ]
}
```

## Veredicto

La 0.19.0 cobra mis dos P1 de la 0.18. El crítico ya no tapa el total: su ×2 se enciende dentro del MULTI. El Botín del Rey entra en la Deck y en el teléfono, y la Vida máxima tiene dibujo propio. La mesa ya no salta al elegir. Claridad sube a 7,5 y estética a 7,9. No pasa el 8 por dos motivos. El momento vivo sigue apilando letras: el número del golpe y el canto grande chocan en el mismo cuadro, y «¡ESCOBA!» aparece tres veces a la vez. Y la mitad del juego que no es combate (Altar, Colección, Portada, Elegí tu Mazo) sigue siendo un panel sobre un degradé, al lado de escenas que ya están a la altura de la victoria con amanecer. Diversión queda en 7,3: lo visual no frena el ritmo, pero el remate no se festeja limpio.

**Respecto de la 0.18.0:** resuelto el P1 del crítico (golpe-06: «¡ESCOBA! ×2» en su término, sin estampa encima). También el P1 del Botín de cinco piezas (rey-cae-11 a 1280 y rey-cae-12 a 390). El P2 de la Deck está a medias: «LA CORTE» ya no queda bajo JUGADAS, pero la mano sigue hundida bajo el HUD, el Rey pegado al borde y la vela ahora se tapa entera bajo la cuenta. De los menores siguen todos: la mesa vacía tras la caída del Rey, «TAJO DE REVÉS» dos veces, Ajustes en La Pulpería y el mapa montado sobre el horizonte.

## Defectos menores

- **Cartel de la segunda cara sobre TE PEGA**: en 1280-rey-segunda-10 tapa el 17 y convive con el rótulo fijo «TAJO DE REVÉS»; a 390 deja solo «PEGA». Mientras vuela, que el rótulo fijo se apague y el cartel baje a carril(0.65). `src/client/pantallas/mesa.ts:999-1007` y `:146`.
- **Mesa vacía tras la caída del Rey**: en 1280-rey-cae-08 se ven tablas, el Bufón y un «+20» gigante que tapa el rótulo ORO. `src/client/pantallas/mesa.ts:1023` (despejar) y el «+N» del oro.
- **El Bufón del Botín pisa la vela pintada**: en 1280-rey-cae-11 la vela le atraviesa la túnica. A 1920 queda vacío el tercio derecho del Botín. `src/client/fx/escenas.ts:592-593` y `src/client/estilos/pantallas.css:2160`.
- **A 390 el grito tapa GOLPEAR** cuando está desactivado (mesa-grito): el botón principal desaparece. `src/client/hud.ts:295` (button:disabled pesa 1, como lo blando).
- **Mapa**: la primera fila de nodos tapa molinos y ranchos, y siete de nueve nodos son el mismo icono de espadas cruzadas. `src/client/fx/escenas.ts` (mapa) y `src/client/pantallas/camino.ts`.

(La portada y Ajustes dicen «v0.18.0»: las capturas son de antes del cambio de versión, no lo cuento como defecto.)

## Qué haría en la próxima versión

**El metajuego como lugar.** Tres escenas nuevas en `escenas.ts`, en lugar de `penumbra()`: el altarcito de esquina para el Altar (cada mejora, una vela que se enciende por nivel, y un solo botón activo), la pared de naipes clavados para la Colección, y la mesa de tablas con la vela para la Portada y Elegí tu Mazo. Ajustes vuelve a la mesa. Un Bufón a una sola escala por ventana, siempre sentado en la escena y no flotando. Además, cerrar el **director de cuadros** que pedí en la 0.18: una cola única para número, canto, cartel del Rey y gritos, con turno de 250 ms y zonas prohibidas (.e-sellos, el total, la Vida). La puerta de QA mediría solapes sobre golpe-09, botin-brota-08 y rey-segunda-10. Con las dos cosas, estética pasa el 8.
