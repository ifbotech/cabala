```json
{
  "jurado": "jurado-juice",
  "version": "0.17.0",
  "puntajes": { "claridad": 7.4, "diversion": 7.8, "estetica": 8.2, "veredicto": 7.8 },
  "defectos": [
    {
      "prioridad": "P1",
      "pantalla": "mesa (TE PEGA y siguiente turno) y cobro del botín",
      "ventana": "1280x800 y 390x844 (en el teléfono es peor)",
      "archivo": "src/client/hud.ts:247-310 (gritar/ubicarGrito); disparos en src/client/pantallas/mesa.ts:600 y 884",
      "que": "El grito ya no tapa la mano, pero ahora se para justo encima de la cifra que acaba de cambiar. Lo dice el propio comentario: «en el escritorio, sobre la Vida, el Escudo y el oro». Después de un −48, «¡EH, MÁS RESPETO!» tapa el Escudo y el Oro (rey-tajo-10). Sigue ahí en el Turno 5, cuando ya volviste a jugar (rey-tajo-12). En 390 tapa la Vida entera justo después del golpe (390-rey-tajo-12, mirar/390-mesa-grito). En el cobro, «BARRIDO Y A LA BOLSA.» tapa el Oro mientras sube contando (rey-cae-11, 390-rey-cae-11).",
      "por_que": "El remate de un golpe recibido es leer cuánta Vida te queda. El del cobro es ver subir el oro. El grito tapa ese pago en los dos momentos. Además dura 1500 ms fijos, así que invade el turno siguiente, cuando ya estás eligiendo cartas.",
      "propuesta": "Prioridad por evento: ubicarGrito recibe la caja que acaba de cambiar (Vida en `contra`, Oro en `cobrar`) y la excluye como zona prohibida, igual que a los botones. Si no hay lado libre, el grito va como cinta sobre el borde superior del marco del retrato y no sobre las fichas. El grito se borra cuando la mano se desbloquea (`mano.bloquear(false)`), no por reloj."
    },
    {
      "prioridad": "P1",
      "pantalla": "mesa · segunda cara del Caudillo y Tajo de revés",
      "ventana": "1280x800 y 390x844",
      "archivo": "src/client/pantallas/mesa.ts:423 (número de daño), 846-852 (cartel-segunda), 397 (×2 del crítico), 783 (rotuloRey del Tajo)",
      "que": "Todo cae en el mismo punto, el centro del naipe. El «240» que deja al Rey a media Vida sigue flotando cuando entra el cartel, y se lee «TAJO 240 REVÉS» (rey-segunda-06/07, 390-rey-segunda-09). En el Tajo se apilan tres capas en la cara del Rey: el «×2» dorado del crítico (tuyo), el «312» y el rótulo rojo «TAJO DE REVÉS ×2» (suyo) (rey-tajo-07/09/10, 390-rey-tajo-10). Son dos «×2» de signo contrario, en el mismo lugar y en el mismo segundo.",
      "por_que": "La segunda cara y el Tajo son las dos ceremonias nuevas de las últimas dos versiones, y su cuadro clave sale ilegible. Si el jugador no distingue «yo pegué doble» de «él me va a pegar doble», el castigo del Tajo no enseña nada.",
      "propuesta": "Un carril por dueño. Los números de daño suben por encima del naipe y un `limpiarNumeros()` los apaga cuando entra un cartel. El ×2 del crítico se estampa sobre el total del desglose, porque es tu multiplicador. El rótulo del Tajo viaja con la embestida y estalla sobre tu VIDA, porque es su golpe. El naipe del Rey queda limpio para la grieta y el volteo."
    },
    {
      "prioridad": "P2",
      "pantalla": "mesa · segunda cara (cualquier Rey)",
      "ventana": "1280x800 y 390x844",
      "archivo": "src/client/pantallas/mesa.ts:854 (decir(segundaDesc))",
      "que": "En pleno clímax, el Bufón teclea la regla entera en 7 renglones: «A media Vida: si repetís la jugada…». El bocadillo tapa el título de la mesa («EL ARRABAL · REY Turno 3») en 1280 (rey-segunda-07/08/10) y la mano en 390 (390-rey-segunda-09). El cartel, el chip «TAJO DE REVÉS · Si repetís jugada, TE PEGA x2» y el bocadillo dicen lo mismo tres veces a la vez.",
      "por_que": "Un bloque de texto adentro de una ceremonia la mata: el ojo va a leer y se pierde el volteo. Ya lo marqué en la 0.16 con 5 renglones; ahora son 7.",
      "propuesta": "El Bufón dice una burla de 5 palabras como mucho («Ojo: no repitas jugada»). La regla completa queda en el chip del Rey y en su inspector. El bocadillo largo, solo la primera vez por partida y después del cartel, nunca durante."
    }
  ],
  "aciertos": [
    "Cara de Póker sin cortina: ahora es un sello local con su propio sonido (`mascara`, el cascabel) y la risa del Bufón. El golpe ya no se corta (golpe-07 a 09). Era mi P1 de la 0.16.",
    "La caída del Rey tiene anticipación: fogonazo blanco, el naipe que se agrieta en tres pasos con su `grieta` cada vez más agudo y rayos de su palo mientras dice la frase. La mano y los botones se van con el fogonazo (rey-cae-03 a 05). El corte en dos ahora llega con peso. Era mi P2.",
    "El cobro encadenado sigue impecable: mesa limpia, «+20» que vuela, oro que cuenta y botín que brota en la misma madera (rey-cae-08 a 11).",
    "Los finales son escenas que viven. «La Corte cayó» tiene amanecer con rayos, polvo de oro y los Reyes partidos. En la derrota la vela se apaga y humea. Es la mejor imagen del juego (visual-qa/1280x800/fin-victoria).",
    "La segunda cara del Caudillo tiene dibujo propio y se nota en la mesa (rey-segunda-12 contra 01).",
    "El paso del mapa a La Pulpería es una transición de verdad: primero el lugar vacío y después el Bufón, que se arma en píxeles (mapa-paso-02/03).",
    "El rendimiento sigue intachable: 164 fps en las cuatro ventanas; el peor cuadro es de 24 ms en 1366 bajo golpes."
  ],
  "capturas_vistas": [
    "jurado/secuencias/1280-golpe-00, 02, 03, 04, 05, 06, 07, 08, 09",
    "jurado/secuencias/1280-rey-irrumpe-01, 04, 07",
    "jurado/secuencias/1280-rey-segunda-01, 04, 06, 07, 08, 10, 12",
    "jurado/secuencias/1280-rey-tajo-00, 04, 07, 09, 10, 12",
    "jurado/secuencias/1280-rey-cae-02, 03, 04, 05, 06, 07, 08, 09, 10, 11, 12, 13, 16, 18",
    "jurado/secuencias/1280-botin-brota-03, 08, 12",
    "jurado/secuencias/1280-mapa-paso-01, 02, 03, 04, 06; 1280-portada-02; 1280-mando-08",
    "jurado/secuencias/390-golpe-07; 390-rey-tajo-10, 12; 390-rey-cae-05, 11; 390-rey-segunda-09",
    "mirar/1280-mesa-grito, 390-mesa-grito, 1280-comodin-espectral-racha",
    "visual-qa/1280x800/fin-victoria, fin-derrota",
    "jurado/fps.txt"
  ]
}
```

## Veredicto

La 0.17.0 cumple dos de los tres arreglos que pedí y hace bien el más difícil: el Rey ya no se parte en frío. Se agrieta, cruje y se raja, y el corte tiene peso. Cara de Póker dejó de frenar cada combate. Los finales ya son escenas y no planillas. Sube a 7,8 y no llega a 8 por un patrón que se repite: **cada mejora local se estampa encima de otra cosa**. El grito pisa la cifra que acaba de cambiar. El cartel de la segunda cara pisa el número del golpe. Los dos «×2» se pisan entre sí. A este juego no le falta jugo: le falta **coreografía**, un lugar y un turno para cada capa.

**Contra el veredicto de la 0.16.0.** Resueltos: la cortina de Cara de Póker (P1) y la caída del Rey sin anticipación, con la mano colgada (P2). A medias: el grito (P1). Ya no tapa la mano ni los modales, y en 390 no se corta, pero ahora tapa la Vida, el Escudo y el Oro. Siguen: el «−N» de TE PEGA cae sobre AL DESCARTE, el desglose cambia de ancho mientras cuenta y la regla de la segunda cara sigue en un bocadillo largo (ahora de 7 renglones).

**Lo que no pude juzgar.** El sonido nuevo (`mascara`, `grieta` en escalera de altura) lo leí en el código y no lo oí. La receta promete: crujido seco con ruido agudo filtrado y altura que sube en cada paso.

## Defectos menores

- El «−23» y el «−48» de TE PEGA siguen cayendo sobre la caja AL DESCARTE y no junto a la Vida (golpe-09, rey-tajo-10): `src/client/pantallas/mesa.ts:589`.
- El recuadro del desglose cambia de ancho mientras cuenta (golpe-00 contra 02, unos 10 px por lado). Falta un `min-width` en em para las cifras: `src/client/estilos/mesa.css:1610`.
- Los «+1», «+8» y «+4» de las fichas de la bandeja se apilan unos sobre otros (golpe-04, botin-brota-03). Hay que escalonarlos en el tiempo o en la altura: `src/client/hud.ts:226` (`dispararFicha`).
- La última frase del Rey queda debajo de las mitades del naipe partido (rey-cae-06, 390-rey-cae-05). Que se vaya con el fogonazo del remate: `src/client/pantallas/mesa.ts:526`.
- La vela que se apaga de la derrota no se mueve en vertical: no hay brasa ni humo en el teléfono, justo donde más se juega: `src/client/fx/escenas.ts:1318` (`if (vert) return;`).

## Qué haría en la próxima versión

Un paquete de **coreografía de capas**, sin reglas nuevas. Primero, un registro central de flotantes en `src/client/fx/`: cada número, sello, cartel y bocadillo pide una zona (naipe, desglose, Vida, Oro, retrato) y un dueño (vos o el enemigo). Si la zona está ocupada, se hace cola o se apaga lo anterior. Así se resuelven de un saque el «TAJO 240 REVÉS», los dos ×2, las fichas apiladas y el grito sobre el Oro. Segundo, **lo tuyo pasa en tu lado y lo suyo en el suyo**: tu crítico se estampa sobre el total, su Tajo explota sobre tu Vida y el «−N» cae pegado a la Vida y no sobre AL DESCARTE. Tercero, **los bocadillos con tope de 6 palabras durante las ceremonias**: la regla va al inspector. Cuarto, la elección de Amuleto brota del propio panel del botín, sin velo nuevo, porque es la única costura que queda en el bucle golpe → caída → cobro. Con eso el jugo de CÁBALA se lee tan bien como se siente, y ahí está el 8.
