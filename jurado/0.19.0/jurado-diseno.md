```json
{
  "jurado": "jurado-diseno",
  "version": "0.19.0",
  "puntajes": { "claridad": 7.6, "diversion": 7.0, "estetica": 8.0, "veredicto": 7.2 },
  "defectos": [
    {
      "prioridad": "P1",
      "pantalla": "mesa · mesa-seleccion · secuencia golpe (00 → 08) · elegir-mazo (Escoba)",
      "ventana": "todas",
      "archivo": "src/rules/balance-config.json:147-155 (escoba.multiMano 8, escoba.multi 2) · src/rules/combate.ts:189 (m('mano', …)) y :253 (×2 del canto) · src/rules/mazos.ts:36",
      "que": "Para arreglar la curva, la Escoba pasó a «Mano corta +8» de Multi en todos los golpes y su canto bajó de ×3 a ×2. En golpe-00 el MULTI es Quince 1 + Mano corta 8 + Peso fuerte 1 = 10, ×2 = 20: el 80 % del Multi es un impuesto plano que no depende de lo que jugaste. Carta sola da Multi 9; Par o Flor, 10. La jugada pesa un 10 %. Lo único que decide es «¿hay un 15?». Y todo Amuleto de Multi aditivo (Poncho +2, Cáliz +2, Taba +1, Cofre +2, Moneda falsa +1, Ser mano +1) vale un quinto de lo que vale en el Mentiroso, que tiene multiMano 0.",
      "por_que": "Con la mano de 3 fija por decisión del dueño, lo único que puede darle peso al golpe es que las jugadas valgan muy distinto. Esta versión hizo lo contrario: aplanó la diferencia entre jugadas en el Mazo de arranque y mató media Pulpería para él. La regla estrella de la Escoba ahora se lee «+8 de Multi siempre», y el ×2 del 15 ya no grita.",
      "propuesta": "Devolver la Escoba a ×3 en el 15 y bajar la Mano corta a +3 o menos. La Vida que hacía falta, sacarla de la Vida del Mazo, no del Multi. Si hace falta Multi de mano, que dependa de la jugada (por ejemplo, +2 por carta del golpe), así jugar 3 cartas le gana a jugar 1. Sumar a objetivos.ts un tope de «Multi plano / Multi medio» ≤ 40 % por Mazo."
    },
    {
      "prioridad": "P1",
      "pantalla": "toda la partida (curva de caídas, meta-report)",
      "ventana": "todas",
      "archivo": "scripts/objetivos.ts:8-9 (caidaTramo1 [2, 25]) · src/rules/balance-config.json:147-191 (Vidas: Escoba 44, Mentiroso 14) · src/rules/partida.ts:99 (Heridas viejas)",
      "que": "La puerta nueva de caídas en el tramo 1 se puso de 2 a 25 %, y así pasa todo. Caen en el tramo 1 el 2,9 % de Truco, el 3,2 % de Chancho, el 13,3 % de Chinchón, el 17,7 % de Escoba y el 22,7 % del Mentiroso. Los dos Mazos de arranque se siguen separando seis veces (17,7 contra 2,9). El Mentiroso sigue con Vida 14: con Heridas viejas (Reinado 6+) cae a 7 por el piso de la mitad, y su Reinado 8 da 12,8 % contra el 47,9 % con el Altar lleno.",
      "por_que": "La puerta mide el problema pero no lo cierra: una banda que abarca de 3 a 23 no vigila nada. Un jugador nuevo que elige Escoba muere antes del primer Rey una vez de cada seis; el que elige Truco, una de cada treinta. Es la misma partida con distinta suerte de Mazo, no dificultad elegida.",
      "propuesta": "Banda de 4 a 10 % para los cinco Mazos y una regla de dispersión (máx/mín ≤ 2,5). Escoba de vuelta a Vida 55–60 a cambio del +8, el Mentiroso a Vida ≥ 24 y Heridas viejas en porcentaje (−15 %), para que ningún Mazo baje de 15 de Vida."
    },
    {
      "prioridad": "P1",
      "pantalla": "pelea de Rey · secuencias rey-segunda (06) y rey-cae (04, 11) · mesa-conteo (390)",
      "ventana": "todas",
      "archivo": "src/rules/combate.ts:652-653 (la segunda cara solo nace si el golpe deja al Rey vivo bajo la mitad) · scripts/objetivos.ts (golpesRey [3.5, 9]) · src/rules/balance-config.json (enemigos.jefe.vida 1.6)",
      "que": "Los Reyes duran 3,6 golpes en Escoba, 3,9 en Truco y 4,5–4,9 en el resto. En la secuencia, el Caudillo (390) queda en 1/390 con un 297 y cae al turno 3 con un 243. El jugador termina la pelea con 48/48 de Vida. La segunda cara (Tajo de revés, la mejor mecánica del juego) vive un turno, y un golpe que pase de más de la mitad a cero se la saltea entera.",
      "por_que": "Mi pregunta de siempre es si los Reyes son clímax o sacos de Vida. Hoy son un saco con un cartel en el medio. Las cuatro segundas caras obligan a cambiar de plan, pero no les dan tiempo de obligar a nada. El clímax del tramo dura menos que una Guardia de Élite bien jugada.",
      "propuesta": "El golpe que cruza la mitad se frena en la mitad (el sobrante se pierde y el naipe se voltea), así cada Rey muestra sus dos caras. Subir golpesRey a 5–8 en objetivos.ts. Que la segunda cara cure o blinde algo al nacer, para que el jugador tenga que jugar al menos dos turnos contra ella."
    }
  ],
  "aciertos": [
    "El P0 de los pactos está cerrado: pagarVidaMax nunca sube la Vida máxima y nunca la baja de la mitad. El Mentiroso con 14 paga el Pacto de sangre de verdad (14 → 8).",
    "La Vida máxima del Rey es proporcional (20 % del Mazo, mínimo 6) y se ve en el Botín: «+9 DE VIDA MÁXIMA», con «El Rey vencido te curte» (rey-cae-11, botin-rey).",
    "El rasgo ahora dice lo que hace: «ESTOCADA DEL CAUDILLO · Medio golpe suyo cruza tu Escudo» (rey-cae-04, rey-segunda-06).",
    "El Tajo de revés en el teléfono (mesa-conteo 390) es una decisión de verdad: el Par repetido te cuesta «TE PEGA 42 (21 ×2)» y está escrito antes de soltar.",
    "El Caudillo en 1/390 tras un 297 (rey-segunda-06) es el mejor «casi» del juego: el drama existe, solo le falta durar."
  ],
  "capturas_vistas": [
    "jurado/secuencias/1280-golpe-00.png",
    "jurado/secuencias/1280-golpe-04.png",
    "jurado/secuencias/1280-golpe-08.png",
    "jurado/secuencias/1280-rey-segunda-06.png",
    "jurado/secuencias/1280-rey-cae-04.png",
    "jurado/secuencias/1280-rey-cae-11.png",
    "visual-qa/1280x800/mesa-seleccion.png",
    "visual-qa/1280x800/mesa-segunda-cambia.png",
    "visual-qa/1280x800/mesa-mentiroso.png",
    "visual-qa/1280x800/botin-rey.png",
    "visual-qa/1280x800/cabala.png",
    "visual-qa/1280x800/elegi-una.png",
    "visual-qa/1280x800/pulperia.png",
    "visual-qa/1280x800/elegir-mazo.png",
    "visual-qa/1280x800/mapa.png",
    "visual-qa/1280x800/fin-victoria.png",
    "visual-qa/1280x800/piezas.png",
    "visual-qa/390x844/mesa-conteo.png"
  ]
}
```

## Veredicto

**Respecto de la 0.18.0:** el P0 de los pactos quedó **resuelto** (`vidaMaxTrasCosto`). El P1 de la mano de 3 queda fuera de discusión por decisión del dueño, pero esta versión le saca a la jugada el poco peso que tenía (ver P1 de la Escoba). El P1 de la curva quedó **a medias**: la Vida máxima por Rey ya es proporcional, pero la banda se abrió en vez de cerrarse. De los menores, la pieza de Vida máxima en el Botín está **resuelta**. **Siguen** la Moneda falsa con 3 Oros, el rótulo del Tajo sin «salvo Carta sola» y el Mentiroso sin decir que su Mazo va del 1 al 7.

Simulé tres builds con las piezas reales:

- **Escoba barrendera (Moneda falsa, Taba, Cofre, Peso fuerte, Cantos):** el Multi es un +8 fijo, así que la build vive del Daño plano (Taba cargada +12 fue un tercio del golpe en golpe-00). Poncho y Cáliz son trampas en la Pulpería. El golpe es «¿hay 15? sí: lo tiro». Es la build más pobre en decisiones del juego, y es la del Mazo de arranque.
- **Truco de Bravas (Cuchillo, Lanza, Facón, Filo):** se siente distinta (sobrante que pasa, Bravas de 24), pero el Envido sale 23,4 veces por partida. Con dos del mismo palo en tres cartas, el canto es casi automático: no festeja nada.
- **Mentiroso Muro (Cara de Piedra, Mesa servida, Poncho, Rebenque, Palo y palo):** es la única build donde la mano de 8 es un rompecabezas y +2 de Multi pesa el doble. Es la más divertida y la que más se muere (22,7 % en el tramo 1).

Las tres se sienten distintas, pero la diferencia la ponen los Mazos, no las piezas. El momento de gritar existe en la cola (mejor golpe de 25 560 en Escoba y 33 264 en Chancho, contra un medio de 1 000–1 600 en el tramo 3), pero los Reyes lo desperdician: mueren antes de que el grito tenga contra quién.

**Sonido y sacudida del golpe que cae:** leído en código, no oído.

## Defectos menores

- El Golpe exacto está muerto: de 0,3 a 1,9 por partida (fin-victoria: «GOLPES EXACTOS 0»). Con Multi de 10 a 20 los totales saltan de a 20 y la Racha no se arma: `src/rules/combate.ts:271-273`, `balance-config.json` (`exacto`).
- La Cábala sigue con tres Platas sin contra, y el Bufón dice «Alguna tiene trampa»: `src/rules/aumentos.ts:31-36`, `src/client/voces.ts:46`.
- El rasgo del Caudillo dice «Su Furia sube 2 por turno» y el chip, «+3 por turno» (1 general + 2): `src/rules/reyes.ts:35` contra `src/rules/combate.ts:546-547`.
- La Moneda falsa sigue pidiendo 3 Oros (con mano de 3, solo una Flor de Oros) y su +1 de Multi vale un 10 % en Escoba: `balance-config.json` (`comunes.monedaDesde`).
- El rótulo del Tajo no dice «salvo Carta sola», aunque el motor la exime: `src/client/textos.ts:480` contra `src/rules/combate.ts:133`.

## Qué haría en la próxima versión

«Reyes de dos caras y jugadas que pesan». El golpe que cruza la mitad del Rey se frena en la mitad, para que cada segunda cara se juegue al menos dos turnos, con golpesRey de 5 a 8 vigilado por la puerta. El Multi plano de mano baja a ≤ 3 en todos los Mazos y la diferencia la ponen las jugadas, con la Escoba de vuelta a ×3 y Vida 55–60. La banda de caídas en el tramo 1 pasa a 4–10 % con dispersión ≤ 2,5 y el Mentiroso, a Vida ≥ 24. El Envido de Truco pide algo más difícil (sumar 27 o más, como en la mesa), para que vuelva a ser un canto. Y cada Plata de la Cábala lleva una contra chica escrita, para que el Bufón cobre lo que promete.
