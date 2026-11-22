```json
{
  "jurado": "jurado-arte",
  "version": "0.22.0",
  "puntajes": { "claridad": 7.8, "diversion": 7.6, "estetica": 7.9, "veredicto": 7.8 },
  "defectos": [
    {
      "prioridad": "P0",
      "pantalla": "Evoluciones: jackpot, ficha del HUD y el cofre del Tesoro",
      "ventana": "las cuatro (evolucion-jackpot, hud-evolucion y botin-tesoro a 1920; evolucion-jackpot a 390)",
      "archivo": "src/client/evolucion.ts:24 y src/client/hud.ts:56 (pxAmuleto(id, 'prisma'): el mismo sprite de siempre); src/client/estilos/pantallas.css:3342-3366 (el aro de cuatro box-shadow planos); src/client/pixel/iconos.ts:169 (poncho), :189 (cofre del Amuleto) y :742 (cofre del Tesoro)",
      "que": "El jackpot dice «DESPIERTA PONCHO DEL CACIQUE» y abajo «GARROTE DEL CACIQUE», pero al centro sigue el poncho de siempre, a 1× y metido en un aro de cuatro rayas de color plano (oro, cian, carmesí y lima) que parece un contorno de depuración y no una pieza forjada. En el HUD pasa lo mismo: el Sol de la Timba es el cofre de siempre con ese aro. Encima, el cofre del Tesoro (iconos.ts:742) es casi el mismo dibujo que el Amuleto Cofre (:189): en botin-tesoro hay dos cofres de madera con flejes de oro, uno en la cinta TESORO y otro en el HUD, y significan cosas distintas.",
      "por_que": "La Evolución es el premio gordo del Salto 2, y en pantalla no despierta nada: el nombre promete un garrote y el dibujo muestra un poncho. Un jackpot sin pieza nueva no se festeja, se lee como un error. Y cuando dos íconos iguales significan cosas distintas, la iconografía de toda la partida pierde confianza.",
      "propuesta": "Cuatro variantes malditas en la forja: siguen siendo los mismos 15 Amuletos, así que no rompe la Constitución. El Facón con la hoja ennegrecida y una gota. El Garrote con el poncho atado al mango. El Sol de la Timba con rayos que rompen el marco. La copa del Brindis rebosando sangre. Todas con la misma silueta de base, rampa corrida al índigo y destellos tramados. El aro, como marco 'prisma' de 9 trozos (marcos.ts:33 ya existe) y no como box-shadow. En el jackpot, el ícono a 3×. Y el Tesoro, redibujado como baúl de hierro remachado con el candado grande al frente, o un saco: que no sea otro cofre de madera."
    },
    {
      "prioridad": "P1",
      "pantalla": "ELEGÍ UNA con candado de Tesoro",
      "ventana": "1920x1080 y 1280x800 (a 390 entra)",
      "archivo": "src/client/estilos/pantallas.css:3623-3640 (.op-candado.falta y .bp-precio.falta a 0,6, dentro de .opcion:disabled a 0,55); src/client/pantallas/camino.ts:409-412 (la cinta .oferta-tesoro suma un renglón y empuja el botón)",
      "que": "El botón «DEJAR EL COFRE» queda montado sobre el HUD: tapa el retrato y llega al ORO, la cifra que el candado te pide mirar. La cifra crítica, el precio 27, queda a una opacidad efectiva de ~0,33: un rojo vino sobre violeta que casi no se lee. El sello EVOLUCIONA y su nombre también salen apagados, con todo el naipe.",
      "por_que": "La pantalla existe para contestar «¿me alcanza?». La respuesta está en el número más apagado de la pantalla, y la salida pisa el marcador.",
      "propuesta": "No bajar la opacidad del precio. Ponerlo entero, en carmesí (≥ 7:1 sobre el abismo), con el candado forjado cerrado al lado, y atenuar solo el arte y la descripción. Dejar el sello EVOLUCIONA siempre a plena tinta. Meter la cinta TESORO en el renglón del título o achicar la altura de las opciones, para que el botón quede siempre 16 px arriba del HUD. Sumar una regla de QA: ningún botón de un modal se cruza con #hud."
    },
    {
      "prioridad": "P1",
      "pantalla": "mesa: el paño en el teléfono y el sello ×2",
      "ventana": "390x844 (y el ×2 en las cuatro)",
      "archivo": "src/client/mano.ts:231 (paso de las Postas < ancho del naipe) y :242 (hv al 40 % del naipe en el teléfono); src/client/estilos/mesa.css:607 (.posta-marca)",
      "que": "En el teléfono las Postas se pisan: en mesa-escalon, el 2 de Copas jugado queda casi entero debajo del 3, y el 3 debajo del 4, que encima sale cortado por el pie del paño. En mesa-chispa, el 4 de Espadas del Medio pierde su pie y su índice cabeza abajo. Y en todas las ventanas, la placa negra «×2» tapa la primera pinta del naipe del Medio (el 4 de Oros en 1280 mesa-mando, el 3 de Copas en mesa-escalon).",
      "por_que": "En escritorio y en la Deck, lo jugado por fin se lee de un vistazo. En el teléfono la pregunta de la mecánica («qué hay en cada Posta») vuelve a necesitar lupa. Y el sello de la mejor Posta le come la figura al naipe que premia.",
      "propuesta": "En el teléfono, el paño con 3 Postas visibles y los naipes a 0,8 de escala, sin superponerse. Con 4 o 5 Postas, dos filas de paño o naipes a 0,65 con su índice entero. El ×2, como banderín colgado de la Posta del Medio, por arriba o por el costado del naipe y nunca sobre las pintas, con el hilo de oro de postaMedio. Sumar a la QA: ningún naipe apoyado tapa a otro en más de un 25 %."
    }
  ],
  "aciertos": [
    "Mi P0 de la previa quedó resuelto en escritorio y en la Deck. El paño es una fila propia y la mano va en la suya: el foco del mando sube dentro de su fila (1280 mesa-mando, rey-irrumpe-04). Sin cartas elegidas, el paño no aparece, y al caer el enemigo se va (rey-cae-08). El Escalón ahora sube de verdad: 2, 3 y 4 en tres alturas, con su chip ESCALÓN +2 (1920 y 1280 mesa-escalon).",
    "El paño ya es material de la forja: fieltro de 9 trozos con pelo tramado, Postas cosidas a puntadas y la del Medio en hilo de oro (marcos.ts:167-199). Y los índices dobles de la Deck desaparecieron: el 2, el 4 y el 6 salen limpios a 2×.",
    "La Forja Brava tiene su cartel en oro sobre el naipe y su ficha de mutación con ícono propio (Doble Filo: hoja carmesí con gota). Los Chiches de La Pulpería por fin tienen tamaño de mercadería."
  ],
  "capturas_vistas": [
    "visual-qa/1920x1080/mesa.png", "visual-qa/1920x1080/mesa-seleccion.png", "visual-qa/1920x1080/mesa-escalon.png", "visual-qa/1920x1080/mesa-chispa.png",
    "visual-qa/1920x1080/cabala-negra.png", "visual-qa/1920x1080/evolucion-jackpot.png", "visual-qa/1920x1080/forja-brava.png", "visual-qa/1920x1080/mapa-tesoro.png",
    "visual-qa/1920x1080/botin-tesoro.png", "visual-qa/1920x1080/oferta-evoluciona.png", "visual-qa/1920x1080/hud-evolucion.png", "visual-qa/1920x1080/pulperia.png", "visual-qa/1920x1080/rey-mascara.png",
    "visual-qa/1366x768/mesa-chispa.png",
    "visual-qa/1280x800/mesa.png", "visual-qa/1280x800/mesa-escalon.png", "visual-qa/1280x800/mesa-mando.png", "visual-qa/1280x800/botin-tesoro.png",
    "visual-qa/1280x800/cabala-negra.png", "visual-qa/1280x800/mapa-tesoro.png", "visual-qa/1280x800/forja-brava.png",
    "visual-qa/390x844/mesa.png", "visual-qa/390x844/mesa-escalon.png", "visual-qa/390x844/mesa-chispa.png", "visual-qa/390x844/botin-tesoro.png",
    "visual-qa/390x844/cabala-negra.png", "visual-qa/390x844/evolucion-jackpot.png",
    "jurado/secuencias/1280-postas-golpe-00.png", "jurado/secuencias/1280-postas-golpe-05.png", "jurado/secuencias/1280-postas-golpe-10.png",
    "jurado/secuencias/1280-rey-cae-08.png", "jurado/secuencias/1280-rey-irrumpe-04.png", "jurado/secuencias/1280-mando-08.png",
    "jurado/secuencias/1280-botin-brota-06.png", "jurado/secuencias/1280-rey-tajo-04.png",
    "jurado/secuencias/390-postas-golpe-02.png", "jurado/secuencias/390-postas-golpe-09.png"
  ]
}
```

## Veredicto

La 0.22.0 arregló la mitad de abajo de la mesa, que era lo que más le reclamaba. Ahora hay tres pisos: el paño de fieltro forjado, que aparece solo cuando hay algo apoyado; la mano en su fila, y el HUD. Los índices de la Deck se imprimen limpios y el Escalón se ve como escalera. Claridad sube a 7,8. El Salto 2, en cambio, llegó con poco arte propio. Las Evoluciones son el mismo ícono con un aro de cuatro rayas planas, el «Garrote» se dibuja como poncho y el cofre del Tesoro es gemelo del Amuleto Cofre. El candado del Tesoro apaga justo la cifra que importa y su botón se monta sobre el HUD. La Cábala Negra es una bandeja correcta, pero flota en un panel de tinta vacío. Estética sube solo a 7,9 y diversión a 7,6: la Forja Brava y el jackpot tienen buen ritmo, pero el premio no se ve como premio.

**Respecto de la previa:** quedaron resueltos el P0 de la mano encimada con el paño (en escritorio y en la Deck; en el teléfono las Postas todavía se pisan), el P1 del índice doble y el P1 del paño de maqueta. También se resolvieron tres menores: el Escalón invisible, los Chiches diminutos de La Pulpería y el «23 − 7 ESCUDO» bajo La Corte. Siguen la banda negra plana de la máscara (rey-mascara), el Altar y la Colección vacíos, y el Bufón chico en el portátil.

## Defectos menores

- **La Cábala Negra corta la fila de Copas** en las cuatro ventanas, incluso a 1920, donde sobra alto. A 390 solo entran las Espadas, así que las parejas válidas quedan fuera de cuadro. La placa «1» tapa el índice del naipe elegido. `src/client/estilos/pantallas.css:3500` (max-height) y `:3531-3545` (.negra-orden).
- **La Forja Brava a 1280:** la placa «+12★ ×2» tapa la mitad baja del naipe, el aviso va en cuatro renglones de romana y DESCANSAR apagado deja una caja vacía de unos 220×330 en el medio de la escena. `src/client/pantallas/camino.ts:828` y `src/client/estilos/pantallas.css:3478`.
- **La regla «Medio: pega doble · Escalón +2» queda flotando** con la mesa vacía, mientras cae el enemigo (rey-cae-08, mando-08). `src/client/mano.ts:384`.
- **El cofre del mapa es un sticker** de 28 px pegado a la esquina del nodo a 1280. No proyecta sombra ni tiene brillo. `src/client/estilos/pantallas.css:3579-3600`.
- **La ayuda del Vaso de Ginebra queda abierta todo el golpe** (1280-postas-golpe-00 a 10) y tapa «Taba cargada +12» del desglose. `src/client/pantallas/mesa.ts` (cerrar el tip de los Chiches al golpear).

## Qué haría en la próxima versión

**Que el Salto 2 se vea.** Forjar las cuatro formas malditas como variantes del mismo sprite (hoja negra, garrote, sol desbordado, copa que rebosa), con el marco prismático de 9 trozos y el ícono a 3× en el jackpot. Redibujar el Tesoro como baúl de hierro remachado, para que no se confunda con el Amuleto Cofre. En ELEGÍ UNA con candado, el precio siempre a plena tinta y el botón siempre arriba del HUD, con una regla de QA que lo vigile. En el teléfono, un paño de 3 Postas sin superposición y el ×2 como banderín que cuelga de la Posta del Medio. La Cábala Negra, en su escena: el Bufón detrás de un mostrador oscuro alumbrado por velas negras y la bandeja como paño de costura con sus 36 naipes enteros a 1920. Y la banda de la máscara sobre la mesa tramada. Con eso la estética pasa de 8 y la claridad se acerca a 8,5.
