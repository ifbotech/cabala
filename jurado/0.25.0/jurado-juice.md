```json
{
  "jurado": "jurado-juice",
  "version": "0.25.0",
  "puntajes": { "claridad": 8.1, "diversion": 8.4, "estetica": 8.2, "veredicto": 8.3 },
  "defectos": [
    {
      "prioridad": "P1",
      "pantalla": "mesa · golpear con una Evolución maldita (Facón, Brindis)",
      "ventana": "todas",
      "archivo": "src/rules/combate.ts:765-770 (el suceso `maldicion` va ANTES de `dano`) · src/client/pantallas/mesa.ts:1092-1109 (`case 'maldicion'`: «−N», sello, `sonar('maldicion')` y `pausa(220)`)",
      "que": "La maldición se cobra en el medio de tu golpe. El orden es: tajo y hitstop, después el «−3» en tu VIDA con el ícono, la ficha que brinca, un golpe grave de 82 Hz y 220 ms de espera, y recién ahí sale tu número sobre el enemigo. Con el Facón, que «corta si no abate», es peor: el «−3» te avisa que el enemigo sobrevive antes de que veas cuánto le pegaste. Lo leí en el código y no lo vi: no hay secuencia de la maldición, y mesa-maldicion (1280 y 390) solo muestra el chip «−3 DE VIDA» quieto en la cuenta.",
      "por_que": "El ritmo impacto → número → remate es lo mejor que tiene la mesa, y acá se corta justo en el medio. Te lleva la vista abajo a la derecha en el instante en que el número nace arriba, y el sonido seco de la maldición tapa la cola del golpe y el timbre del palo. En *Balatro* el costo nunca se mete entre la jugada y su puntaje. Encima es un spoiler: te cuenta el resultado antes del número.",
      "propuesta": "En combate.ts, empujar `maldicion` después de `dano` y de `cae`/`segunda`. En mesa.ts, cobrarla adentro del `respiro()`, cuando tu número ya cumplió sus 600 ms, o junto al primer suceso del Rey. Bajar `maldicion` en audio.ts:100 a 0,16 de ganancia para que no compita con `fuerte`. Y sumar una secuencia `maldicion-cobra` a 1280 y 390."
    },
    {
      "prioridad": "P1",
      "pantalla": "mesa · lo que Perfora le sobra le entra al Rey que irrumpe y lo planta en la mitad",
      "ventana": "1280x800 y 390x844",
      "archivo": "src/rules/combate.ts:553-567 (`entra` va antes que `perfora`/`dano`) · src/client/pantallas/mesa.ts:819-825 (número `azul` a escala 1 cuando no es «grande») y 979-982 (`perfora`: un tajo de 60 px y nada más) · mesa.ts:1563-1577 (`selloPlanta`)",
      "que": "Tu 200 a la Sota (1280-rey-segunda-06/07) queda dos cuadros. Después se raja la Sota y entra la banda de la irrupción con el discurso del Cacique (09-12), el Bufón dice «El patrón en persona» (15) y recién en el cuadro 16, casi dos segundos después de tu golpe, llega lo que te sobró. Llega como un «99» celeste a escala 1, el número más chico de la secuencia y del mismo color que el Escudo (98) que el Rey levanta enseguida. El sello SE PLANTA EN LA MITAD tapa «EL CACIQUE» y la placa Cuero del Cacique, y en el cuadro siguiente lo despide la placa SEGUNDA CARA FORTÍN (18-20). En el teléfono es peor: el sello se parte en dos renglones y el 99 tapa el «100 SE PIERDEN» (390-rey-segunda-17).",
      "por_que": "Que lo que sobra de tu golpe parta a un Rey por la mitad es de las mejores jugadas posibles. Hoy la causa (tu golpe) y el efecto (el Rey partido) quedan separados por una escena entera, y el efecto se lee como si el Rey se hubiera puesto Escudo.",
      "propuesta": "Que la sobra pegue de corrido. Si después de `entra` de un Rey viene `perfora`, el tajo de Espadas sigue desde la Sota hasta el naipe del Rey mientras cae, y la banda de irrupción sale después del planta (o una versión corta de 600 ms). El número de la sobra va a escala 2 en rojo con un borde celeste, nunca en celeste liso. El sello va debajo de la barra, en un solo renglón (en el teléfono, «SE PLANTA · 100 SE PIERDEN»). Y la placa de la segunda cara espera a que el sello cumpla 500 ms."
    },
    {
      "prioridad": "P2",
      "pantalla": "El Fogón · el suspenso de la Forja Brava en el teléfono",
      "ventana": "390x844",
      "archivo": "src/client/pantallas/camino.ts:1010-1021 (`baja` con `--bx/--by` hacia `fuegoEnPantalla`) · src/client/fx/motor.ts:206-215 · src/client/estilos/pantallas.css (panel del Fogón en móvil)",
      "que": "En el escritorio ya funciona: la fogata crece y el naipe baja hasta la llama (mirar/1280-fogon-suspenso-brava-llama). En el teléfono el panel sigue tapando el fuego. El naipe se para encima del «YA TIENE» y del texto de DOBLE FILO, y después encima de CHISPA DE ORO (390-fogon-suspenso-brava y -llama). De la llama solo asoma la punta, cortada por SEGUIR. Si se quema, queda un hueco vacío de 350 px entre «SE QUEMÓ» y una fogata recortada (390-forja-brava-despues). El «×2» del momento cumbre lo conozco solo por el código (`fogonazo`, camino.ts:860-866): no hay secuencia que lo filme.",
      "por_que": "Es la única apuesta de 50 % del juego, y en el teléfono el naipe se juega su vida encima de un texto, no sobre el fuego.",
      "propuesta": "Durante el suspenso en el teléfono, que las cartas de mutación se plieguen hacia arriba (opacidad 0 y alto 0 en 200 ms) y dejen ver la fogata entera. Que el naipe baje hasta ella y el panel vuelva a abrirse con el resultado. Y que haya una secuencia `forja-brava` a 1280 y 390, con un resultado que sale y otro que se quema."
    }
  ],
  "aciertos": [
    "La segunda cara por fin se ve entera: la Sota con 1 de Vida, el 200 que la raja en dos naipes que vuelan, la irrupción, el planta, el cartel FORTÍN con rayos verdes y la Empalizada de estacas que crece delante del Cacique (1280-rey-segunda-07, 18, 21; 390-rey-segunda-23). Es la mejor escena nueva de la versión.",
    "El respiro está en el código y está bien hecho: `tGolpe` marca cuándo nace tu número grande, o cualquiera contra un Rey, y `respiro()` completa 600 ms antes de `contra` y de `rey`, y TURBO lo corta (mesa.ts:766-773, 992, 1060). El 200 queda a la vista dos cuadros enteros antes de que se raje la Sota.",
    "La Forja Brava en el escritorio cumple lo que pedí. La fogata pasa de una llamita a una hoguera que dobla su alto mientras el naipe tiembla encima (mirar/1280-forja-brava-elegir → -suspenso-brava → -llama). El momento cumbre dice «×2» a escala 3, con destello, chispas y sacudida (camino.ts:860-866, 1050-1058). Y la apuesta se lee arriba: «APUESTA: 50 % SE QUEMA».",
    "Si se quema, el naipe se parte en pedazos que vuelan al MAZO del HUD (38 → 37), y eso tiene peso (mirar/1280-forja-brava-despues).",
    "La mesa del teléfono muestra los naipes enteros y el TE PEGA, en su columna, ya no tapa la cara del enemigo (390x844/mesa, 390-golpe-06). El rendimiento sigue perfecto: 133-134 fps en las cuatro ventanas, 0 % de cuadros largos y el peor de 22 ms (fps.txt)."
  ],
  "capturas_vistas": [
    "jurado/secuencias/1280-rey-segunda-01, 03, 04, 05, 06, 07, 08, 09, 10, 12, 15, 16, 17, 18, 20, 21, 24",
    "jurado/secuencias/390-rey-segunda-06, 16, 17, 19, 23",
    "jurado/secuencias/1280-rey-tajo-03, 06, 09, 10, 11, 12; 390-rey-tajo-09, 12",
    "jurado/secuencias/1280-golpe-05, 08; 390-golpe-06; 1280-postas-golpe-06; 390-botin-brota-06; 1280-rey-cae-08; 1280-rey-irrumpe-09; 1280-mapa-paso-03",
    "mirar/1280-forja-brava-elegir, 1280-fogon-suspenso-brava, 1280-fogon-suspenso-brava-llama, 1280-forja-brava-despues, 390-fogon-suspenso-brava, 390-fogon-suspenso-brava-llama, 390-forja-brava-despues",
    "visual-qa/1280x800/forja-brava, mesa-maldicion, mesa-pega-todo, resumen-victoria",
    "visual-qa/390x844/forja-brava, mesa, mesa-maldicion, resumen-derrota-movil",
    "jurado/fps.txt"
  ]
}
```

## Veredicto

La 0.25.0 cumple lo central del paquete de ritmo que pedí. Tu número grande ahora respira antes de que el Rey responda, la Forja Brava grita «×2» sobre una fogata que crece y la segunda cara se filma entera, con una Empalizada que es puro espectáculo. Lo que la frena es lo nuevo que se metió en el medio de los golpes. La maldición se cobra entre tu impacto y tu número, y la sobra de Perfora le llega al Rey dos segundos y un discurso después de tu golpe, como un «99» chico y celeste. Ninguna de las dos rompe la experiencia: no hay P0. Diversión 8,4 (pesa doble), veredicto 8,3.

**Contra la 0.24.0.** Resueltos: el P1 del ritmo entre turnos (el respiro de 600 ms está en el código, pero rey-tajo termina en el impacto y no filma la respuesta del Rey, así que lo leí y no lo vi) y el P1 de la Forja en el escritorio («×2» a escala 3, el naipe que baja y la fogata que crece). De mis menores, quedaron resueltos rey-segunda (ahora filma la segunda cara) y la placa ×2 sobre COMODÍN. Siguen: la Forja en el teléfono, la cifra de la placa que no rueda de +12 a +24, el «¡POR UN PELO!» que nunca llegó y el récord como chip quieto. El P2 del «−N» en el HUD del teléfono no lo pude verificar, porque ninguna secuencia de 390 filma un contragolpe.

## Defectos menores

- El bocadillo del Rey («¡Así se pega, carajo!») se apoya arriba de su propio naipe y le tapa la corona y la cara en el cuadro del 384; en el teléfono queda debajo del número (1280-rey-tajo-10 a 12, 390-rey-tajo-12): `ubicarDice` prueba primero `arriba`, en `src/client/pantallas/mesa.ts:1239-1241`.
- Mesa limpia: el Bufón dice «Arrancás con 10 de Escudo» y el HUD muestra 13. El Escudo aparece sin llenarse a la vista y el rótulo sigue durante toda la animación del primer golpe (1280-rey-segunda-01 a 21): `src/client/textos.ts:345` (decir «+10») y `mesa.ts:176-187` (motas de Escudo al ponerlo).
- En el teléfono, con un naipe apoyado, el 9 de Copas y el Comodín quedan cortados por la mitad bajo GOLPEAR (390x844/mesa-maldicion): el bloque móvil de la mano en `src/client/estilos/mesa.css`.
- La placa TE PEGA salta entre «18» y «6 · 19−13 ESCUDO» durante la misma secuencia (1280-rey-segunda-08, 15, 18): `placa` y `pintarArriba`, `mesa.ts:197` y siguientes.
- Récord: «¡NUEVO RÉCORD!» sigue siendo un chip quieto, TU MEJOR no se tacha y el Bufón no lo festeja (resumen-victoria): `src/client/pantallas/camino.ts:1313`.

## Qué haría en la próxima versión

Un paquete de **causa y efecto**. Primero, nada se mete entre tu impacto y tu número: las maldiciones, el Doble Filo y cualquier otro cobro van al respiro, después de que tu número vivió sus 600 ms. Segundo, la cadena de Perfora de corrido: el tajo sigue de la Sota al Rey que cae, el número de la sobra va a escala 2 y rojo, el sello va bajo la barra y en un renglón, la banda de irrupción va corta o después, y si el Rey quedó a menos del 5 %, el «¡POR UN PELO!» con la barra que tiembla. Tercero, la Forja del teléfono con el panel que se pliega durante el suspenso y la cifra que rueda de +12 a +24. Cuarto, el récord como escena (cifra vieja tachada, nueva estampada, risa del Bufón). Quinto, la QA que filme lo que hoy juzgo por el código: `maldicion-cobra`, `forja-brava` (sale y se quema), `rey-responde` (tu golpe grande y el Tajo, con el «−N» en el HUD del teléfono), a 1280 y 390, en español. Con eso, la 0.26 pasa el 8,5.
