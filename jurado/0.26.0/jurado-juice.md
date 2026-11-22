```json
{
  "jurado": "jurado-juice",
  "version": "0.26.0",
  "puntajes": { "claridad": 8.2, "diversion": 8.5, "estetica": 8.3, "veredicto": 8.4 },
  "defectos": [
    {
      "prioridad": "P1",
      "pantalla": "mesa · contragolpe después de un golpe con el Garrote (maldición en tu ESCUDO)",
      "ventana": "1280x800 y 390x844",
      "archivo": "src/client/pantallas/mesa.ts:1137-1152 (`case 'contra'`: `ponerHud(hud)` en 1140 va ANTES de la espera de 760 ms por `tMalEscudo` de 1149-1152)",
      "que": "El arreglo de la maldición rompió la causa y el efecto del contragolpe. En 1280-maldicion-10 la VIDA ya cae de 45 a 27 y el ESCUDO de 5 a 0, con los corazones volando, pero no hay ningún número. Recién en el cuadro 12, cuando ya repartió la mano del turno 2, aparecen el «−18» y el «−5», flotando sobre el naipe nuevo. En el teléfono pasa igual: la barra baja en 390-maldicion-12 y el «−18» nace en el 14, encima de GOLPEAR.",
      "por_que": "Ves bajar la barra sin causa y el número llega medio segundo tarde, como si fuera otro golpe. Pasa justo en la jugada que esta versión vino a ordenar.",
      "propuesta": "Mover la espera (`falta = 760 − …`) ANTES de las líneas 1138-1140, para que el embiste, la barra y los dos «−N» salgan juntos. Y que la mano del turno nuevo no se reparta hasta que el «−N» cumpla 400 ms."
    },
    {
      "prioridad": "P1",
      "pantalla": "mesa · golpe común que no abate, seguido del contragolpe",
      "ventana": "todas",
      "archivo": "src/client/pantallas/mesa.ts:974 (`tGolpe` solo si `grande || enemigo.jefe`) · 844-850 (`respiro`) · 1127-1136",
      "que": "Tu golpe mediano no tiene respiro. En 1280-contragolpe-08 tu 170 sobre la Sota y el «−19» que te pegan nacen en el mismo cuadro, y la sacudida del HUD se come tu número. En 390-contragolpe-09 pasa lo mismo: el 170 todavía en la Sota y el «−19 / −4» abajo. Del 170 al −19 van unos 300 ms (160 + 140).",
      "por_que": "Es el intercambio que más se repite en una partida. El respiro de 600 ms de la 0.25 solo protege los golpazos y los golpes a un Rey, y el golpe de todos los días pierde su remate.",
      "propuesta": "Marcar `tGolpe` en todo `dano` donde el enemigo sobrevive, con un respiro escalonado: 380 ms para el golpe chico y 600 para el grande o contra un Rey. TURBO lo sigue cortando. Además, que el número del golpe se apague (`vidaMin`) antes de que nazca el embiste."
    },
    {
      "prioridad": "P2",
      "pantalla": "El Fogón · suspenso de la Forja Brava (el momento cumbre)",
      "ventana": "1280x800 y 390x844",
      "archivo": "src/client/pantallas/camino.ts:871-891 (`bajarAlFuego`: el pie del naipe entra solo un 12 % en la llama) · src/client/estilos/pantallas.css:4660-4681 (`.forja-llama`) · camino.ts:1046-1060 (el Bufón no hace nada durante el suspenso)",
      "que": "La llama no envuelve el naipe: lo tapa. El naipe, entero y grande, cubre toda la fogata, que en la 0.25 crecía a la vista y ahora queda escondida detrás. Lo que se ve de fuego es una tira de dientes con degradé liso, sin tramado (1280-fogon-suspenso-brava-llama), o directamente una barra naranja plana (1280-forja-brava-quema-llama, 390-fogon-suspenso-brava-llama). Parece una corona de cartulina. Durante los 1,5 s el Bufón queda como una estatua, con el mismo bocadillo («…rezá»), y en el teléfono es una figurita de 60 px en una esquina.",
      "por_que": "Es la única apuesta de 50 % del juego, y el fuego, que es el protagonista, desaparece justo cuando tendría que crecer. El suspenso descansa solo en el temblor del naipe y en el sonido.",
      "propuesta": "Bajar el naipe para que un tercio quede dentro de la fogata. Que la fogata real, que sí está tramada, pase por delante del pie del naipe y suba en tres escalones de 400 ms. Reemplazar `.forja-llama` por lenguas tramadas con Bayer. Y que el Bufón reaccione: se tapa los ojos y espía entre los dedos, y con el ×2 festeja o hace una mueca."
    }
  ],
  "aciertos": [
    "La maldición ya no se mete en el golpe. El 378 nace sobre la Sota con su tajo (1280-maldicion-07/08), el Bufón dice «Eso dolió hasta acá» y recién después el «−5» del Garrote baja tu ESCUDO de 10 a 5, con el ícono y la mueca del retrato (cuadro 09). La cuenta lo avisa desde antes: «MALDICIÓN −5 DE ESCUDO».",
    "La Forja Brava tiene su cumbre en las dos ventanas. El panel se pliega, el naipe baja entero hasta la fogata, y el «×2» a escala 3 estalla encima con sacudida y hitstop (1280 y 390-forja-brava-x2). Si se quema, el naipe se parte en V sobre la llama y vuelan brasas (1280-forja-brava-quema), y el MAZO baja de 38 a 37.",
    "En el teléfono, el Fogón por fin deja ver el fuego: el panel desaparece en el suspenso y la fogata queda entera debajo del resultado (390-fogon-suspenso-brava-llama, 390-forja-brava-quemada-despues).",
    "La sobra de Perfora llega antes de que hable el Rey: la Sota se raja, el 99 púrpura cae sobre el Cacique y recién después entra la banda con su discurso (1280-rey-segunda-08 → 10 → 12). Ya no se confunde con el Escudo.",
    "El rendimiento sigue sobrado: 133 fps en las cuatro ventanas y 0-0,1 % de cuadros largos. El peor es de 31 ms, en golpes a 1280 (fps.txt)."
  ],
  "capturas_vistas": [
    "mirar/1280-forja-brava-elegir, 1280-fogon-suspenso-brava, 1280-fogon-suspenso-brava-llama, 1280-forja-brava-x2, 1280-forja-brava-despues, 1280-forja-brava-quema-llama, 1280-forja-brava-quema, 1280-forja-brava-quemada-despues",
    "mirar/390-forja-brava-elegir, 390-fogon-suspenso-brava-llama, 390-forja-brava-x2, 390-forja-brava-quemada-despues",
    "jurado/secuencias/1280-maldicion-00, 03, 05, 07, 08, 09, 10, 11, 12, 13, 16; 390-maldicion-07, 09, 10, 11, 12, 14",
    "jurado/secuencias/1280-contragolpe-07, 08, 09; 390-contragolpe-06, 08, 09, 11, 13",
    "jurado/secuencias/1280-rey-segunda-06, 08, 09, 10, 11, 12, 16, 17, 19, 21, 23; 390-rey-segunda-09, 10",
    "jurado/secuencias/1280-rey-tajo-06, 09, 12; 390-rey-tajo-11; 1280-rey-cae-07, 10, 14",
    "jurado/secuencias/1280-golpe-04, 06; 390-golpe-06; 1280-postas-golpe-06; 1280-chiche-usa-03; 390-botin-brota-06",
    "visual-qa/1280x800/mesa-chinchon",
    "jurado/fps.txt"
  ]
}
```

## Veredicto

La 0.26 ordena lo que pedí: la maldición espera a tu número, la sobra de Perfora llega antes del discurso del Rey y la Forja Brava tiene su cumbre en las dos ventanas, con el «×2» enorme y el naipe que arde en V. Lo que la frena es que el orden nuevo dejó una costura. En el contragolpe del Garrote la barra baja antes que el número, y el golpe común sigue sin respiro: tu 170 y su −19 nacen en el mismo cuadro. Ninguna de las dos rompe la experiencia, así que no hay P0. Diversión 8,5 (pesa doble), veredicto 8,4.

**Contra la 0.25.0.** Resuelto: el P1 de la maldición en medio del golpe (1280-maldicion-07 → 09). Resuelto en parte: el P1 de Perfora. El orden y el color ya están, pero el 99 sigue a escala 1, apretado sobre la corona, y ningún tajo une la Sota con el Rey. Resuelto: el P2 de la Forja en el teléfono (el panel se pliega y el naipe baja al fuego). También quedó resuelto mi pedido de filmar `maldicion`, `contragolpe` y la forja que sale y la que se quema. Siguen: el bocadillo del Rey sobre su corona, la placa TE PEGA que salta y el «¡POR UN PELO!». El récord no lo verifiqué. La Pierna del Chancho que canta un escalón menos la leí en el código (mesa.ts:926-936) y no la vi: ninguna secuencia filma un Chancho.

## Defectos menores

- La sobra de Perfora sale como un 99 a escala 1 encima de la corona del Cacique, y el tajo de Perfora mide 60 px sobre el que entra (1280-rey-segunda-10/11): `src/client/pantallas/mesa.ts:963-966` y `1114-1117`.
- El bocadillo del Rey («¡Así se pega, carajo!») tapa su corona a 1280, y en el teléfono el 384 lo tapa a él (1280-rey-tajo-12, 390-rey-tajo-11): `ubicarDice`, `mesa.ts:1363`.
- La placa TE PEGA salta de 18 a «6 · 19−13 ESCUDO» y vuelve a 18 durante la segunda cara (1280-rey-segunda-19 → 21): `ponerGolpeRey`/`placa`, `mesa.ts:803`.
- En el teléfono, el «−5» de Escudo nace corrido sobre la columna de ORO y DESCARTAR, y el «−18» sobre GOLPEAR (390-maldicion-10, 14): `nacerEnDueno`, `mesa.ts:119`.
- La chapa «×2» del crítico tapa el «=» y la cifra del MULTI en la cuenta (1280-rey-tajo-09), y los corazones de la cura tapan la cifra de la VIDA (1280-rey-cae-10: «8_/92»): `src/client/estilos/mesa.css` (`.c-x2`) y `motas` en `src/client/fx/`.

## Qué haría en la próxima versión

Un paquete de **respiración universal**. Primero, todo golpe que no abate respira: 380 ms el chico y 600 ms el grande, y la barra del HUD nunca se mueve antes que su «−N» (corregir el orden en `contra`). Segundo, la cadena de Perfora de corrido: el tajo de Espadas viaja de la Sota rajada al naipe del Rey, el número de la sobra sale a escala 2 en púrpura y, si planta, el sello va en un renglón bajo la barra. Tercero, la Forja Brava con el fuego por delante: lenguas tramadas que suben en tres escalones y tapan el pie del naipe, y un Bufón que se tapa los ojos y después festeja o se lamenta. Cuarto, el «¡POR UN PELO!» cuando el Rey queda a menos del 5 %, con la barra que tiembla. Quinto, la QA que filme `chancho-pierna`, `perfora-rey` y `forja-brava-telefono` en movimiento. Con eso la 0.27 pasa el 8,6.
