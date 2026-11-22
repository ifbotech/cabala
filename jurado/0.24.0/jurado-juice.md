```json
{
  "jurado": "jurado-juice",
  "version": "0.24.0",
  "puntajes": { "claridad": 8.0, "diversion": 8.3, "estetica": 8.1, "veredicto": 8.2 },
  "defectos": [
    {
      "prioridad": "P1",
      "pantalla": "mesa · tu golpe grande contra el Caudillo en segunda cara, seguido de su Tajo de revés",
      "ventana": "todas (visto en 1280x800 y 390x844)",
      "archivo": "src/client/pantallas/mesa.ts:764 (`dano`: `pausa(160)` y sigue) · mesa.ts:987-989 (`rey` → `poderRey`) · mesa.ts:1516 (`limpiarNumeros(true)` al entrar el Tajo)",
      "que": "¡ESCOBA! con ¡PRENDA! y un 300 que deja al Rey en 1/370. Es el mejor golpe de la secuencia, y el 300 queda solo un cuadro (1280-rey-segunda-07). En el cuadro siguiente ya cae la placa TAJO DE REVÉS 21 ×2 = 42, encima del 300 y del nombre del Rey (08). En el otro, `limpiarNumeros(true)` apaga tu número, entra el −42 y el Bufón dice «Y bue. A veces te toca» (09-10). En el teléfono, la placa tapa además la frase del Bufón (390-rey-segunda-08).",
      "por_que": "El conteo y el impacto son lo mejor del juego, y acá el remate se lo come la respuesta del Rey en menos de 300 ms. Quedar a 1 de Vida de abatir a un Rey es una escena en sí misma. Hoy pasa sin que se lea, y lo que te queda en la memoria es el castigo, no tu golpe. *Balatro* y *Hades* separan siempre tu turno del de ellos con un respiro.",
      "propuesta": "Que haya un compás entre turnos: antes del primer suceso del Rey (`contra`, `rey`, `furia`), esperar a que el número del jugador cumpla 650 ms de vida (el director ya sabe cuándo nació). Si el Rey quedó con menos del 5 % de Vida, un sello «¡POR UN PELO!» sobre su barra, que la barra tiemble y que el Bufón lo grite. Recién entonces, la placa del Tajo, que se apoya debajo de la barra y no encima del nombre."
    },
    {
      "prioridad": "P1",
      "pantalla": "El Fogón · el remate de la ¡FORJA BRAVA!",
      "ventana": "todas; en 390x844 es peor",
      "archivo": "src/client/pantallas/camino.ts:860-866 (`fogonazo` siempre muestra `+${B.fogon.temple}`, o sea «+4») · camino.ts:1013-1021 · pantallas.css:4303-4346 (`tiembla-sube` y `forjando` mueven el naipe y el panel; el fuego no se toca)",
      "que": "El suspenso ahora crece: 820 ms en la segunda pasada, 1,5 s en la tercera, la escalera `forjaSube`, hitstop de 110 ms y sacudida (leído en código, no visto: no hay secuencia del Fogón). Pero el número que sale en el momento cumbre es «+4», el mismo de la primera pasada, cuando lo que pasó es que el naipe entero se duplicó. El fuego que sube es un brillo en el borde del panel: la fogata no crece y el naipe no baja hasta la llama. En el teléfono, la llama sigue siendo de 20 px, 250 px debajo del naipe, y tras la Forja la mitad de abajo del panel queda vacía, con el «+12★ ×2» en un chip chico (forja-brava 390). Para colmo, `mirar/*-fogon-suspenso` todavía se saca en inglés y en la segunda pasada.",
      "por_que": "Es la única apuesta de 50/50 del juego. El jugador tiene que ver cómo su naipe se duplica, no un «+4» genérico.",
      "propuesta": "En la Forja Brava, que `fogonazo` muestre «×2» en grande y que la cifra de la placa ruede de +12 a +24 (con `numero` y `tic`). Que el naipe baje hacia la fogata real y que esta crezca 1,5× mientras dure el suspenso. En el teléfono, la llama al pie del panel y la placa a 2×. Y una secuencia `forja-brava` a 1280 y 390, en español."
    },
    {
      "prioridad": "P2",
      "pantalla": "mesa · lo que te pega el Rey, en el HUD del teléfono",
      "ventana": "390x844",
      "archivo": "src/client/pantallas/mesa.ts:945-948 (`esc = 1` en el teléfono; nace adentro de la caja con `nacerEnDueno`)",
      "que": "El «−N» ya no pisa GOLPEAR ni DESCARTAR. Ahora nace adentro de la caja de VIDA, encima del retrato y pegado a la cifra. El signo menos queda bajo los corazones, así que se lee «48 33/81» y «42 35/81», que de un vistazo parece 4833 (390-rey-tajo-12, 390-rey-segunda-11).",
      "por_que": "Es justo el momento en que tenés que entender cuánto perdiste. Dos cifras rojas del mismo tamaño, pegadas, se leen como una sola.",
      "propuesta": "En el teléfono, que nazca sobre el canto de arriba de la caja de VIDA (no adentro), corrido a la derecha de la cifra, con el «−» a la vista y un borde oscuro de 2 px. Que la cifra de VIDA haga su golpe de escala recién cuando el número ya subió."
    }
  ],
  "aciertos": [
    "Mi P1 de la 0.23 quedó resuelto: la irrupción del Rey es suya. La cuenta del golpe anterior desaparece y queda la banda con el retrato, la frase tecleada, el halo y nada más (1280-rey-irrumpe-09 y 12, 390-rey-irrumpe-11).",
    "La Forja Brava se elige bien: dos cartas de mutación grandes, con el icono a 2×, la regla sobre fondo liso, el 50 % a la vista y SEGUIR en segundo plano (forja-brava-eleccion, en 1280 y 390). El suspenso por fin escala con el riesgo (camino.ts:978-998).",
    "DEJALO JUSTO es una acción con verbo y premio: un marco prisma junto a lo apoyado, «+3 de oro · +1 Multi al próximo», la Y del mando y el Bufón que lo presenta una sola vez. Cambiar de Posta mueve los naipes con sus resortes y suena 'exacto' (mesa.ts:2150-2158).",
    "En el final, ESTA PARTIDA y TU MEJOR tienen rótulo y una raya en el medio; se acabó el «8191284». Con récord nuevo, la cifra sube contando 1,1 s con tic y cierra con un sonido de oro (camino.ts:1289-1310). En el teléfono, el resumen se desliza sin que los botones lo tapen.",
    "La caída del Rey sigue siendo de primera: se raja en luz celeste, la mesa queda limpia, el oro sube al HUD y el botín entra en escalera (1280-rey-cae-06 a 18). Rendimiento perfecto: 133-134 fps, 0 % de cuadros largos, el peor de 23 ms."
  ],
  "capturas_vistas": [
    "jurado/secuencias/1280-rey-irrumpe-05, 09, 12; 390-rey-irrumpe-04, 11",
    "jurado/secuencias/1280-rey-segunda-01, 03, 05, 06, 07, 08, 09, 10, 11; 390-rey-segunda-08, 11",
    "jurado/secuencias/1280-rey-cae-04, 06, 08, 10, 13, 18; 1280-rey-tajo-12; 390-rey-tajo-12",
    "jurado/secuencias/1280-golpe-08, 09; 390-golpe-04, 07; 1280-botin-brota-06; 1280-mando-10; 1280-chiche-usa-03; 1280-postas-golpe-06",
    "visual-qa/1280x800/forja-brava-eleccion, forja-brava, resumen-derrota, resumen-victoria, mesa-dejalo-justo, mesa-exacto, mesa-segunda-cambia, cabala-negra, botin-tesoro, oferta-evoluciona, evolucion-jackpot",
    "visual-qa/390x844/forja-brava-eleccion, forja-brava, resumen-derrota-movil, mesa-dejalo-justo, mesa-segunda-cambia, mesa-seleccion, mesa",
    "mirar/1280-fogon-suspenso, 390-fogon-suspenso",
    "jurado/fps.txt"
  ]
}
```

## Veredicto

La 0.24.0 limpia bien los bordes que marqué. El Rey entra a una mesa vacía, la Forja Brava se elige con cartas de verdad y se hace esperar, DEJALO JUSTO pasó a ser una jugada con premio y el récord del final sube contando. Lo que queda flojo es el ritmo entre tu golpe y la respuesta del Rey: la mejor jugada de la secuencia (Escoba de 300 que lo deja en 1) dura un cuadro y la borra el Tajo. Y el remate de la Forja todavía dice «+4» cuando debería gritar «×2». Ninguno de los dos rompe la experiencia, así que no hay P0. Diversión 8,3 (pesa doble), veredicto 8,2.

**Contra la 0.23.0.** Resueltos: el P1 de la irrupción del Rey, el «−N» que caía sobre los botones del teléfono y la mitad del P1 de la Forja (tiempos que escalan, hitstop y sacudida). En el P2 del final se resolvieron las cifras pegadas y el récord que no contaba. Siguen: el naipe que no baja a la llama y la llama chica del teléfono; el récord sin tachar, sin sello y sin risa del Bufón; el icono chico del jackpot; y la placa del Tajo que tapa el nombre del Rey.

## Defectos menores

- La secuencia `rey-segunda` no filma la segunda cara: el estado `mesa-rey` ya trae al Caudillo dado vuelta, así que no se ve la novedad de Perfora plantándolo en la mitad (`scripts/secuencias.ts:149-165`, falta `e.segunda = false`).
- La placa TAJO DE REVÉS sigue tapando «EL CA…» y la barra del Rey (1280-rey-tajo-12, rey-segunda-10): `rotuloRey`, `mesa.ts:1178`.
- El sello ×2 del Medio, sobre el Comodín, tapa su rótulo y se lee «COMOD…» (mesa-dejalo-justo, mesa-segunda-cambia): `src/client/estilos/mesa.css:614`.
- Récord: la cifra sube, pero el «¡NUEVO RÉCORD!» sigue siendo un chip quieto, TU MEJOR no se tacha y el Bufón no lo festeja (`camino.ts:1276` y `1305-1307`).
- Jackpot: el icono despierto sigue en unos 40 px dentro de un marco de 600 (evolucion-jackpot): `pantallas.css`, `--kd` del jackpot.

## Qué haría en la próxima versión

Un paquete de **ritmo de turno**. Primero, un compás obligatorio entre tu golpe y el del Rey: tu número vive por lo menos 650 ms antes de que entre cualquier suceso suyo, y si lo dejaste a menos del 5 % hay un sello «¡POR UN PELO!» con la barra que tiembla. Segundo, el remate de la Forja que dice la verdad: «×2» en grande, la cifra del naipe que rueda de +12 a +24, el naipe que baja a una fogata que crece y, en el teléfono, la llama pegada al panel. Tercero, el récord como escena: la cifra vieja se tacha, la nueva se estampa con `destello` y el Bufón se ríe antes de que lata OTRA MANO YA. Cuarto, secuencias nuevas en la QA (`forja-brava`, `segunda-planta`, `fin-record`, a 1280 y 390, en español), porque hoy esos tres momentos los juzgo por el código. Con eso, la 0.25 pasaría el 8,5.
