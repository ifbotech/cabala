```json
{
  "jurado": "jurado-juice",
  "version": "0.28.0",
  "puntajes": { "claridad": 8.7, "diversion": 8.9, "estetica": 8.7, "veredicto": 8.8 },
  "defectos": [
    {
      "prioridad": "P2",
      "pantalla": "mesa · el golpe que abate (visto en el ¡CHANCHO! con Degüello)",
      "ventana": "1280x800",
      "archivo": "src/client/pantallas/mesa.ts:942-948 (`pintarEnemigo` repinta la placa del enemigo y pierde `no-pega`) · mesa.ts:2527 (`placa`) · mesa.ts:1166-1168 (la barra queda en la Vida del suceso `dano`)",
      "que": "Antes de golpear la placa dice «NO TE PEGA 0 · LO ABATÍS» (1280-chancho-canta-06 y 07). En el cuadro del impacto, con el 888 encima y el naipe partiéndose, pasa a «TE PEGA 23» en rojo y así queda tres cuadros (08, 09 y 10). La barra de la Sota se queda en 12/900 mientras el naipe se rompe: nunca llega a 0.",
      "por_que": "Es el mejor golpe del juego y la pantalla, en su cuadro de gloria, anuncia en rojo un golpe que no va a existir y muestra a un enemigo muerto con Vida. El remate pierde su «cero».",
      "propuesta": "Mientras el golpe abate o ejecuta, `pintarEnemigo` conserva la placa «NO TE PEGA · LO ABATÍS» (o la apaga). En el suceso `cae` con `ejecutado`, vaciar la barra a 0 con un barrido corto antes de partir el naipe."
    },
    {
      "prioridad": "P2",
      "pantalla": "mesa · contragolpe en el teléfono (placas «−N» sobre el retrato)",
      "ventana": "390x844",
      "archivo": "src/client/hud.ts:333-346 (`deltaHud`: en el teléfono las placas se posan sobre `.hud-retrato`) · src/client/pantallas/mesa.ts:1366 (`gestoRetrato('mueca', 900)`)",
      "que": "Las placas ya no se pisan ni tapan la cifra de Vida: resuelto. Pero ahora «−4» y «−19» tapan el retrato entero durante los 820 ms en que hace la mueca (390-contragolpe-09 y 10): la reacción del Personaje no se ve nunca en el teléfono. Y el «−19», a 11 px, es lo más chico del HUD mientras el 26 de al lado salta a escala grande.",
      "por_que": "El retrato que reacciona es la mitad del impacto que recibís. En el teléfono se cambió un defecto de lectura por uno de reacción, y tu daño sigue leyéndose chico.",
      "propuesta": "Una sola placa por renglón sobre la mitad de abajo del retrato (la cara queda libre), o la placa de Vida sobre la barra de Vida, debajo de la cifra, a la altura de «/92». El «−N» de Vida, un escalón más grande que el de Escudo."
    },
    {
      "prioridad": "P2",
      "pantalla": "mesa · el Rey se planta en la mitad",
      "ventana": "1280x800 y 390x844",
      "archivo": "src/client/pantallas/mesa.ts:1157-1163 (el número que entra sale a escala 1 si no es «grande») · mesa.ts:1934-1975 (`selloPlanta`) · src/client/fx/efectos.ts (no hay gesto de «plantarse»)",
      "que": "Por fin se ve (1280-rey-planta-06 a 12): el sello queda fijo, grande y legible al costado de la barra. Pero la jugada no tiene impacto: la cuenta infla un 234 dorado, el Rey recibe el mismo fogonazo de siempre (07) y lo que entra es un «4» celeste a escala 1 sobre su pecho (09 a 11). El Rey no hace nada para plantarse: ni escudo, ni pisada, ni empujón del número. El sello nace encima de la placa de su rasgo y deja un cuadro ilegible (08), y tapa la explicación de la FURIA.",
      "por_que": "Es el momento en que el juego te quita 230 de daño. Hoy se explica con un cartel, no se siente: el 234 no choca contra nada. En Balatro o Hades una negación así tiene su propio golpe.",
      "propuesta": "Que el 234 vuele al Rey y rebote: el Rey clava la espada (pose de 300 ms y sacudida vertical), el número se parte en «4» que entra y «230» que cae gris hacia el sello. Un sonido de tope seco (leído en código: hoy suena el golpe común). El rasgo se atenúa mientras el sello vive."
    }
  ],
  "aciertos": [
    "Mis tres P2 de la 0.27 están resueltos o casi. La mano ya no pisa el desglose: en 1280-contragolpe-07 a 09 se leen enteros «SOL DE LA TIMBA +1» y «Cascabel sin canto −1». Las placas del teléfono no se pisan ni tapan la Vida (390-contragolpe-09 y 10).",
    "La Forja Brava ya tiene anfitrión: el Bufón festeja con «¡SALIÓ! ¡Pega el doble!» en el mismo cuadro del ×2 (1280 y 390-forja-brava-x2) y entrecierra un ojo con «Ceniza… El fuego cobró.» en la quema. La llama del suspenso sube en lenguas, sin losa.",
    "El 888 del Chancho es el golpe más jugoso que le vi al juego: número a escala grande, tajo, naipe que gira y se parte, ¡CHANCHO! sobre el paño, «¡Tomá mate!» y «¡OINC, OINC!» (1280-chancho-canta-08 a 10).",
    "El corte del Chinchón se entiende: cada naipe de la mano lleva su «+6», el ESCUDO chispea al llegar a 28 y el renglón «CORTÁS 4 cartas × 6 = +24» lo cierra (1280-chinchon-corta-02 a 05). Después el «−28 ESCUDO» y el «−3» salen en orden (06 y 07).",
    "Rendimiento: 164 fps en las cuatro ventanas, 0,0 % de cuadros largos, peor cuadro de 24 ms a 1366 con golpes y de 12 a 18 ms en el resto (fps.txt).",
    "Audio, leído en código y en las medidas, no oído: el golpe queda entre 5,1 y 6,8 dB sobre la música, la música se agacha en el hitstop y 9 dB en el contragolpe, la racha y la poca Vida mueven el brillo ±8 dB en 288 ms, y la caída del Rey remata con La7 → Rem en vez de callar. Sin recortes en 47 escenas."
  ],
  "capturas_vistas": [
    "jurado/secuencias/1280-contragolpe-06, 07, 08, 09; 390-contragolpe-08, 09, 10",
    "jurado/secuencias/1280-rey-planta-06, 07, 08, 09, 10, 11, 12, 14, 16; 390-rey-planta-09, 11",
    "jurado/secuencias/1280-chinchon-corta-02, 03, 04, 05, 06, 07, 08; 390-chinchon-corta-06",
    "jurado/secuencias/1280-chancho-canta-06, 07, 08, 09, 10, 11, 12, 13; 390-chancho-canta-08, 09",
    "jurado/secuencias/1280-rey-segunda-10; 1280-rey-tajo-09; 1280-rey-cae-06, 09; 1280-mapa-paso-03; 1280-golpe-05",
    "mirar/1280-forja-brava-x2, 1280-forja-brava-quema, 1280-forja-brava-quema-llama, 390-forja-brava-x2",
    "jurado/fps.txt; jurado/audio/RESUMEN.md (cadena, escenas, balance efectos / música, voces y stingers)"
  ]
}
```

## Veredicto

La 0.28 es la mejor versión que juzgué: no tiene P0 ni P1 míos y sube en las cuatro columnas. No llega al 9,1. Diversión 8,9 (pesa doble), veredicto 8,8. El intercambio de todos los días está limpio a 1280 y el golpe grande tiene anticipación, impacto y remate. Lo que falta son tres remates: la placa que miente mientras el enemigo muere, el retrato tapado en el teléfono y un Rey que se planta sin plantarse.

**Contra la 0.27.0.**
- Resuelto: el desglose que la mano cortaba.
- Resuelto: las placas del teléfono que se pisaban. Abren un defecto nuevo, el segundo de arriba.
- Resuelto: el Bufón de la Forja y la losa de la llama. En la quema quedan dos bloques de fuego de base recta a los costados del naipe roto; es menor.
- Resuelto a medias: el 170 a la vista con el «−19». Todavía parpadea en el cuadro en que nace la placa (1280-contragolpe-08).
- Siguen, como avisa el autor: el 99 de Perfora a escala 1 sobre la corona (1280-rey-segunda-10) y la chapa «×2» sobre la cifra del MULTI (1280-rey-tajo-09).

**Lo que no pude ver ni oír.**
- El aturdido del ¡CHANCHO!: en la secuencia la Pierna abate y el sello no aparece. Leído en código (mesa.ts:214 y 1250-1254), no visto. Hace falta una secuencia donde el enemigo sobreviva.
- Los escuditos en vuelo: hay 150 ms o más entre cuadros y solo se ve la salida (el «+6» que late en el naipe) y la llegada (las chispas en el ESCUDO). El vuelo y la nota que sube 6 % por carta los leí en mesa.ts:1052-1087.
- Todo el sonido. Juzgo lo que prometen el código y las medidas: el golpe sobresale de la música y la música lo deja pasar. Si el golpazo de un Rey pesa lo suficiente contra el nivel 3, con el LUFS en −21, lo dirá el jurado de audio.

## Defectos menores

- Con cinco Postas el desglose corta los nombres con puntos suspensivos («Cantos h…», «Taba car…», «Mano chi…», «SOL DE L…») en 1280-chinchon-corta-02 a 08: `src/client/estilos/mesa.css:1853-1856`.
- El 170 sigue parpadeando cuando nace el «−19»: el apagado forzado dura 220 ms y la espera es de 140 (`mesa.ts:1344-1352`, `efectos.ts:366`).
- El cartel SEGUNDA CARA tapa el final del desglose («Taba +1») en 1280-rey-planta-14 y 16: `src/client/estilos/mesa.css:2712`.
- Después de un ¡CHINCHÓN! que frena 28 de 31, el Bufón dice «Y bue. A veces te toca.» (1280-chinchon-corta-06): la línea de contragolpe no mira cuánto frenó el Escudo, `mesa.ts:1381`.
- En el teléfono el canto grande (¡CHINCHÓN!, ¡CHANCHO!) tapa el título, el turno y los dos botones de arriba (390-chinchon-corta-06, 390-chancho-canta-09): `cantoGrande`, `mesa.ts`.

## Qué haría en la próxima versión

Un paquete de **golpes negados y golpes finales**. Primero, la muerte con su cero: la placa del enemigo se apaga o sostiene «LO ABATÍS» y la barra barre hasta 0 antes de que el naipe se parta, también en el Degüello. Segundo, el Rey que se planta como coreografía: el número grande viaja, choca y se parte en lo que entra y lo que se pierde, con pose y sonido propios. Tercero, el retrato del teléfono libre en el contragolpe y un «−N» de Vida más grande. Cuarto, el 99 de Perfora a escala 2 con un tajo que viaje del caído al Rey, y la chapa «×2» al costado del MULTI. Quinto, que la QA filme lo que falta: un ¡CHANCHO! donde el enemigo quede aturdido y un `chinchon-corta` a 60 ms por cuadro. Con eso defiendo el 9,1 en diversión.
