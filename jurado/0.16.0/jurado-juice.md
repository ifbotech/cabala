```json
{
  "jurado": "jurado-juice",
  "version": "0.16.0",
  "puntajes": { "claridad": 7.4, "diversion": 7.7, "estetica": 8.1, "veredicto": 7.7 },
  "defectos": [
    {
      "prioridad": "P1",
      "pantalla": "mesa (golpe → contraataque) con el Aumento Cara de Póker",
      "ventana": "1280x800 (y todas: es una cortina de pantalla entera)",
      "archivo": "src/client/pantallas/mesa.ts:522-524 y 628-632",
      "que": "El 318 entra, el Bufón dice «¡Tomá mate!» y, justo en el remate del golpe, cae una cortina de pantalla entera: banda negra, Bufón brillando, «CARA DE PÓKER» y su descripción. Dura 1000 ms, oscurece la mesa y deja el 318 congelado detrás (golpe-08 y 09). Suena `canto`, el mismo sonido del Canto del Personaje. Como el Aumento dice «en cada combate», esto pasa en todos los combates mientras lo tengas.",
      "por_que": "Es la peor ubicación posible para frenar: rompe el arco golpe → reacción → contra en el cuadro del pago. Además usa el mismo lenguaje (cortina + banda) que la irrupción de un Rey y la segunda cara, así que gasta la ceremonia en un pasivo menor. Diez combates por partida son diez segundos de cortina por un efecto que se entiende con un sello.",
      "propuesta": "Borrar la cortina para los pasivos del Bufón. Que la máscara de Cara de Póker se estampe sobre TE PEGA con «NO LLEGA» tachado (unos 350 ms), con el cascabel del Bufón y un gesto de `risa` en la escena. La cortina, solo la primera vez por partida, o nunca. Un sonido propio, no `canto`."
    },
    {
      "prioridad": "P1",
      "pantalla": "grito del retrato (mesa, cobro y elección de Amuleto)",
      "ventana": "1280x800 y 390x844",
      "archivo": "src/client/hud.ts:240-258; src/client/estilos/base.css:1070-1081",
      "que": "Es la cuarta versión con el mismo problema. «¡AY, MI ESPALDA!» tapa el 6 y el 8 de la mano en pleno turno (rey-tajo-10 y 12), y «¡ESCOBA!» tapa el 3 y el 5 (mirar/1280-mesa-grito). «BARRIDO Y A LA BOLSA.» queda encima del velo del modal «ELEGÍ UN AMULETO» y tapa SALTAR (rey-cae-16 y 17). A 390 el bocadillo se corta por la izquierda: «RRIDO Y A LA BOLSA.» (390-rey-cae-15 y 17). El tope fijo de 80 px no mide el bocadillo, el z-index 60 le gana a los modales y nadie lo saca al cambiar de fase.",
      "por_que": "El grito es la voz del Personaje: tiene que festejar, no tapar la mano con la que vas a jugar ni el botón que vas a tocar. En móvil se lee cortado justo en el momento de cobrar.",
      "propuesta": "Medir el bocadillo después de agregarlo y limitar `left` a [ancho/2 + 8, innerWidth − ancho/2 − 8]. En la mesa de escritorio, sacarlo al costado del retrato (dentro del carril del HUD) y no encima de la mano. Bajarle el z-index por debajo del velo de los modales y borrarlo en `pintarFase` y al abrir cualquier oferta."
    },
    {
      "prioridad": "P2",
      "pantalla": "mesa · caída del Rey (antes de la rajadura)",
      "ventana": "1280x800 y 390x844",
      "archivo": "src/client/pantallas/mesa.ts:465-479",
      "que": "Viene el fogonazo blanco (rey-cae-03). Después el Rey queda entero, quieto, en 0/390, con el «140» pegado en la cara, mientras escribe «Buen tajo… paisano.» letra por letra (04 a 06). La mano y los botones apagados siguen en la mesa, y siguen ahí aun con la mesa vacía y el Rey ya partido (08 y 390-rey-cae-09). La rajadura (07) es muy buena, pero llega después de más de un segundo de cuadro congelado sin anticipación visible.",
      "por_que": "La anticipación de un remate tiene que crecer: temblor, grietas, luz que se escapa. Acá el Rey se queda quieto y la tensión se cae justo antes del mejor cuadro del juego. Que la mano siga en la mesa con la pelea terminada ensucia el clímax.",
      "propuesta": "Mientras dice la última línea, que el naipe tiemble cada vez más y se agriete en 2 o 3 pasos (reusar `quiebre()` con tinte de su palo). La frase, de 3 palabras como mucho. La mano y los botones se van con el fogonazo blanco (agregar `cobra` a `.mesa` ahí y no en `cobrar()`)."
    }
  ],
  "aciertos": [
    "El conteo vive dentro del desglose: cada término se enciende en su lugar, las cartas saltan con su «+N» adentro del naipe y el total pasa de gris a oro y vibra (golpe-02 a 04). Era mi P1 de la 0.15 y quedó resuelto con elegancia.",
    "La segunda cara ya es un acto: anillos que se meten, el naipe que se cierra de canto, rayos, el cartel «SEGUNDA CARA · TAJO DE REVÉS» y la mesa teñida (rey-segunda-05 a 10). Lo leí en código y también lo vi.",
    "El Tajo de revés se ve y se siente: «×2» estampado, rótulo, TE PEGA con su ×2 y un «−48» a escala 2 (rey-tajo-05 a 08).",
    "El cobro está encadenado: la mesa se despeja, el «+20» vuela y el oro sube contando de a una moneda (rey-cae-10 a 13), y el botín brota centrado sobre la misma madera (rey-cae-14, botin-brota-11). Ya no hay corte seco.",
    "Audio rehecho (leído en código, no oído): compresor y buses, transitorios de ruido, ±2 semitonos en el golpe, sonidos propios para al pelo, Tajo, segunda cara (acorde que se quiebra, teñido por palo) y remate, la victoria después de la rajadura y la música que baja 6 dB en cada hitstop. Era mi P1 de tres versiones.",
    "Rendimiento impecable: 133 fps y peor cuadro de 8 ms (30 ms una sola vez en 1366 bajo golpes)."
  ],
  "capturas_vistas": [
    "jurado/secuencias/1280-golpe-00, 02, 03, 04, 05, 06, 07, 08, 09",
    "jurado/secuencias/1280-rey-irrumpe-01, 03, 05, 06, 07, 08",
    "jurado/secuencias/1280-rey-segunda-01, 03, 04, 05, 06, 07, 08, 10, 12",
    "jurado/secuencias/1280-rey-tajo-00, 05, 06, 08, 10, 12",
    "jurado/secuencias/1280-rey-cae-03, 04, 05, 06, 07, 08, 10, 12, 13, 14, 16, 17, 18",
    "jurado/secuencias/1280-botin-brota-03, 05, 07, 10, 11, 12",
    "jurado/secuencias/1280-mapa-paso-02, 04, 06; 1280-portada-03",
    "jurado/secuencias/390-golpe-03, 07; 390-rey-segunda-07, 09; 390-rey-tajo-08; 390-rey-cae-09, 14, 15, 17",
    "mirar/1280-mesa-grito, 1280-comodin-espectral-racha",
    "jurado/fps.txt"
  ]
}
```

## Veredicto

La 0.16.0 es la primera versión en la que el jugo pegó un salto de verdad. Este paquete cumple casi todo lo que pedí en la 0.15: el oído, el cobro encadenado, el conteo en su propia línea y la segunda cara como acto. Por eso la nota sube de 7,3 a 7,7. No llega a 8 por tres cosas: una cortina que corta el golpe en cada combate, el grito del Personaje (que sigue tapando la mano y los modales) y un Rey que se queda quieto antes de partirse.

**Contra el veredicto de la 0.15.0.** Resueltos: el conteo contra el desglose (ahora se enciende adentro), el audio congelado (bus, compresor, ruido, variación, sonidos propios y la música que se agacha), el cobro con bache y corte seco (la mesa se despeja, el oro cuenta y el botín brota en el lugar), la ráfaga de la segunda cara y la captura de la irrupción. A medias: la elección de Amuleto sigue en un modal aparte con velo, aunque el botín ya no queda fantasma detrás. Siguen: el grito sobre la mano y fuera de pantalla en 390 (ahora además pisa los modales) y el bocadillo del Rey encima de su nombre (rey-cae-04).

**Lo que no pude juzgar.** El sonido: lo leí, no lo oí. Las recetas prometen bien, pero el volumen relativo entre `remate`, `victoria` y la música no se puede medir mirando.

## Defectos menores

- El recuadro del desglose cambia de ancho mientras cuenta (unos 10 px entre golpe-00, 02 y 04) porque las cifras cambian de ancho. Hay que fijar el ancho de `[data-v]` y `[data-total]` con `min-width` en em: `src/client/estilos/mesa.css` (bloque `.c-desglose`).
- Los «+2» y «+3» de las cartas siguen subiendo cuando las cartas ya volaron y quedan huérfanos sobre la madera vacía (golpe-05 y 06). Tendrían que viajar con su naipe o apagarse cuando despega: `src/client/pantallas/mesa.ts:907`.
- El «−15» y el «−48» del contraataque caen sobre la zona AL DESCARTE y no sobre la Vida (rey-segunda-12, rey-tajo-08): `src/client/pantallas/mesa.ts:541`.
- En rey-tajo-08 queda un hueco fantasma de naipe a medio fundir entre el 3 y el 6 de la mano: `src/client/mano.ts` (la salida de la carta jugada).
- La regla de la segunda cara, en el bocadillo del Bufón, son 5 renglones pegados al borde izquierdo (rey-segunda-07) y a 390 tapan la mano (390-rey-segunda-09). Basta con una línea; el resto, en el inspector: `src/client/pantallas/mesa.ts:784`.

## Qué haría en la próxima versión

Un paquete de **jerarquía de ceremonias**, sin tocar reglas. La cortina de pantalla entera queda solo para la irrupción del Rey y la segunda cara. Los pasivos del Bufón (Cara de Póker, Seña falsa, Irse al Mazo) pasan a ser sellos sobre el elemento que afectan, con un sonido propio cada uno. **El grito del Personaje** se mueve a un carril propio junto al retrato, con medida real y por debajo de los modales. **La caída del Rey** necesita anticipación de verdad: temblor que crece y grietas por pasos mientras dice una línea corta, y la mano y los botones que se van con el fogonazo blanco. Así el corte en dos llega con todo el peso. Por último, **la elección de Amuleto o Bendición dentro del mismo panel del botín**: las tres cartas brotan de la fila «AMULETO», sin velo nuevo. Con eso el bucle golpe → caída → cobro queda sin costuras y el jugo pasa a ser un 8.
