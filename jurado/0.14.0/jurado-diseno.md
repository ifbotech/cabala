```json
{
  "jurado": "jurado-diseno",
  "version": "0.14.0",
  "puntajes": { "claridad": 6.8, "diversion": 6.4, "estetica": 7.8, "veredicto": 6.7 },
  "defectos": [
    {
      "prioridad": "P0",
      "pantalla": "mesa (tramos 2 y 3) · elegi-bendicion",
      "ventana": "todas",
      "archivo": "src/rules/balance-config.json:49-57 (escudoPorBasto 2, curaPorCopa 2, escudoMax 20) y contragolpe 10/16/22 · src/rules/combate.ts:267, :484-494 y :579",
      "que": "Sin cambios desde la 0.13.0: todo lo defensivo del jugador sigue plano (tope de Escudo 20, Basto +2, Copa +2, Contragolpe fijo) contra una Corte que escala Ataque y Vida por tramo. La 0.14.0 solo tocó la Vida de Truco (81→79) y Chancho (89→87).",
      "por_que": "La build del Cacique (Poncho, Empalizada, Contragolpe, Peaje, Palo y palo) se sigue apagando sola desde el Caballo del tramo 2 y el juego no lo avisa. En el tramo 3 todas las builds convergen en carrera de Multi: el golpe medio pasa de ~150 a ~1.000-1.500 y nada del lado defensivo acompaña.",
      "propuesta": "Escalar lo del jugador con el mismo multiplicador entero por tramo que ya usa el Escudo enemigo (1/2/4): tope 20/40/80, Basto y Copa 2/4/8. Contragolpe devuelve lo frenado ×2/×3/×4 y dispara al frenar al menos la mitad. Recertificar la Vida del tramo 3 en el laboratorio."
    },
    {
      "prioridad": "P1",
      "pantalla": "mesa (Escoba y Truco, los dos Mazos iniciales)",
      "ventana": "todas",
      "archivo": "src/rules/balance-config.json:136-158 (mano 3) y :63-67 (exacto) · src/rules/combate.ts:254",
      "que": "Sin cambios: mano de 3 = 7 golpes posibles con el total ya calculado en la mesa. El laboratorio de hoy repite el cuadro: exactos 0,4 (Truco) a 1,9 (Chinchón) por partida, cantos 26,2 en Truco (trámite) y 1,6 en Chancho (ausente).",
      "por_que": "El conteo nuevo hace más lindo un golpe que se sigue decidiendo solo. Cetro, Hoja y broquel y la Racha dependen de un exacto que no se construye: en fin-victoria y fin-derrota la partida entera cierra con «Golpes exactos: 1».",
      "propuesta": "Mano de 4 jugando hasta 3 en Escoba y Truco (14 golpes). Exacto «al pelo» (sobra de hasta 5 % de la Vida máxima) que sostiene Racha y Cetro, con el oro reservado al exacto puro. Envido con Multi extra solo la primera vez por enemigo; Chancho canta también con Pierna a medio premio."
    },
    {
      "prioridad": "P1",
      "pantalla": "mesa · secuencia golpe (conteo pieza por pieza)",
      "ventana": "1280x800 y 390x844",
      "archivo": "src/client/pantallas/mesa.ts:614 (presupuesto de 820 ms), :621 (Multi arranca en 0), :660-669 (carteles) y :671 · src/client/hud.ts:217-219",
      "que": "El conteo existe, pero se atropella. Con 2 cartas y 7 piezas cada paso dura ~80 ms: entre golpe-02 y golpe-04 aparecen siete carteles. Los carteles (letra chica) se apilan sobre la barra de Vida y el nombre del enemigo y se pisan entre sí («Hard Coin +1» sobre «Pair +2» en golpe-06; en 390 son un amasijo ilegible). Las piezas escondidas tras el «+5» de la bandeja no disparan ficha. Y la cuenta arranca en «DAÑO 7 × MULTI 0» (golpe-01, mirar/conteo), que se lee como un golpe de cero.",
      "por_que": "Cuantas más piezas tiene la build, menos tiempo recibe cada una: justo al revés que en Balatro. El jugador ve una ráfaga, no su máquina disparando; no llega a aprender qué pieza dio qué. El total además está a la vista (atenuado) desde antes: no hay suspenso que resolver.",
      "propuesta": "Paso mínimo de ~110 ms con tope total de ~1,6 s y aceleración progresiva (lento al principio, rápido al final), saltable con un toque. Un solo cartel a la vez por cifra, pegado a la ficha que dispara y no sobre la barra de Vida. Si la pieza está en el «+N», que salte el «+N» con su número. Arrancar el Multi en 1 o esconderlo hasta el primer paso de Multi. Ocultar el total («???») hasta el final cuando el golpe no es exacto ni letal."
    }
  ],
  "aciertos": [
    "El conteo pieza por pieza es real: Daño y Multi suben a la vista, cada pieza dice su nombre y su ficha del HUD salta con +2/+1 (golpe-02 a golpe-04). Era mi pedido de mayor retorno y está.",
    "Tres escalones de peso en el golpe y fogonazo dorado en el exacto letal (golpe-06): el remate exacto por fin se distingue de un golpe cualquiera.",
    "El Rey trae clima propio (lluvia del Caudillo en rey-irrumpe y mesa-rey) y cae con última frase bajo el naipe (rey-cae): más clímax de puesta en escena que antes.",
    "La previa sigue impecable: PAR · DAÑO 34 × MULTI 10 = 340 con ¡EXACTO! y sus premios antes de soltar (mesa-seleccion, 1280 y 390).",
    "El Fogón en tres pasadas (fogon-suspenso, 35 % de quemar) sigue siendo la mejor decisión de riesgo del juego.",
    "FPS holgado en las tres ventanas medidas (fps.txt): el conteo nuevo no costó cuadros."
  ],
  "capturas_vistas": [
    "jurado/secuencias/1280-golpe-00.png",
    "jurado/secuencias/1280-golpe-01.png",
    "jurado/secuencias/1280-golpe-02.png",
    "jurado/secuencias/1280-golpe-03.png",
    "jurado/secuencias/1280-golpe-04.png",
    "jurado/secuencias/1280-golpe-06.png",
    "jurado/secuencias/1280-golpe-07.png",
    "jurado/secuencias/390-golpe-04.png",
    "jurado/secuencias/390-golpe-05.png",
    "jurado/secuencias/1280-rey-irrumpe-01.png",
    "jurado/secuencias/1280-rey-irrumpe-03.png",
    "jurado/secuencias/1280-rey-irrumpe-06.png",
    "jurado/secuencias/1280-botin-brota-04.png",
    "jurado/secuencias/1280-botin-brota-09.png",
    "visual-qa/1280x800/mesa-seleccion.png",
    "visual-qa/1280x800/mesa-rey.png",
    "visual-qa/1280x800/mesa-mentiroso.png",
    "visual-qa/1280x800/elegi-una.png",
    "visual-qa/1280x800/elegi-amuleto.png",
    "visual-qa/1280x800/elegi-bendicion.png",
    "visual-qa/1280x800/cabala.png",
    "visual-qa/1280x800/pulperia.png",
    "visual-qa/1280x800/fogon.png",
    "visual-qa/1280x800/mapa.png",
    "visual-qa/1280x800/jugadas.png",
    "visual-qa/1280x800/piezas.png",
    "visual-qa/1280x800/fin-victoria.png",
    "visual-qa/1280x800/fin-derrota.png",
    "visual-qa/390x844/mesa-seleccion.png",
    "mirar/1280-conteo.png",
    "mirar/1280-rey-cae.png",
    "mirar/1280-mesa-grito.png",
    "mirar/1280-fogon-suspenso.png"
  ]
}
```

## Veredicto

**Respecto de la 0.13.0:** de mis tres defectos principales quedó resuelto uno (el conteo pieza por pieza, P1), aunque llega atropellado y pasa a ser mi tercer defecto de hoy con otra forma. Siguen intactos el P0 (defensa plana contra una Corte que escala) y el P1 de la mano de 3 y el exacto por suerte. De los cinco menores no se resolvió ninguno.

La 0.14.0 es una versión de puesta en escena, no de diseño: `src/rules` cambió dos números de Vida. El golpe se siente mejor y el juego se juega igual. Subo poco la nota por eso: la sensación mejoró de verdad, la decisión no.

Volví a simular las tres builds con las piezas reales:

- **Banca (Escoba):** sigue siendo la única que cambia tu conducta en la Pulpería. Ahora, además, ves a Peso fuerte y al Cofre sumar en el conteo. Gana con la versión.
- **Muro de Bastos (Chinchón):** idéntica. Divertida en el tramo 1, muerta desde el Caballo del tramo 2. El conteo no la ayuda porque el Escudo no pasa por la cuenta.
- **Cantos (Truco):** 26,2 cantos por partida. El canto ahora salta en la cuenta, pero algo que pasa en casi todos los turnos no es un grito.

**Reyes.** Mejor teatro: clima, frases al pegar y al doler, silencio y fogonazo al caer. De eso vi la lluvia y la última frase; el silencio de la música, el hitstop de 210 ms y la lluvia de monedas los leí en código (`mesa.ts:375-398`), no los vi. Como mecánica siguen siendo sacos de Vida: el Caudillo del tramo 1 tiene 415 contra 340 de una Sota, y sus rasgos no me hacen jugar distinto. La secuencia `rey-irrumpe` muestra al Bufón apareciendo y la mesa ya servida; ninguno de los cuadros que abrí muestra una entrada del Rey.

**Bufón y Cábala.** Igual que antes: gran presencia, poca palanca. En `cabala.png` se apuestan 10 de oro con 95 en la bolsa.

**Nota de material.** Las secuencias de `golpe`, `rey-irrumpe` y `botin-brota` están en inglés; juzgué el español por las fotos quietas.

## Defectos menores

- Persiste: la regla de Escoba dice «Multi ×2» y el motor aplica ×3 (se ve en `jugadas.png`): `src/rules/mazos.ts:33` contra `balance-config.json:141`.
- Persiste: los cuatro Comunes son la misma pieza recoloreada y la tienda ofrece tres clones juntos (`pulperia.png`, otra vez): `src/rules/amuletos.ts:33-46`, `src/rules/partida.ts:70`.
- Persiste: las Cábalas no escalan con el tramo ni con la bolsa, y el rechazo siempre dice lo mismo: `src/rules/bufon.ts:70` y `:95-101`.
- Persiste: el tramo 1 casi no mata en Truco, Mentiroso y Chancho (13, 26 y 8 caídas de 3.000): `balance-config.json:85-89`.
- Nuevo: la última frase del Rey tapa su nombre y media barra de Vida justo cuando llega a 0 (`rey-cae`): `src/client/pantallas/mesa.ts:385-391`.

## Qué haría en la próxima versión

Una versión de reglas, que es lo que falta: «Que cada build llegue viva al Rey». Primero, escalar el lado del jugador por tramo (tope de Escudo, Bastos, Copas, Contragolpe proporcional) y convertir los cuatro Comunes en piezas que crecen con la carga de su Rey, para que el muro y la build de Copas existan en el tramo 3. Segundo, mano de 4 jugando 3 en Escoba y Truco con el exacto «al pelo», así el conteo nuevo premia una decisión y no un trámite. Tercero, un rasgo por Rey que cambie la jugada (un Caudillo que castiga repetir la misma jugada, un Bacanal que se cura lo que vos te curás). Y cerrar el conteo: ritmo que desacelera con pocas piezas y acelera con muchas, un cartel por vez y total oculto hasta el final. Todo con Multi entero, 15 Amuletos y 5 Mazos, y laboratorio completo después, porque esto mueve las tasas de victoria.
