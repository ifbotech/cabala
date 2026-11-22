```json
{
  "jurado": "jurado-diseno",
  "version": "0.22.0",
  "puntajes": { "claridad": 7.4, "diversion": 7.5, "estetica": 8.1, "veredicto": 7.6 },
  "defectos": [
    {
      "prioridad": "P1",
      "pantalla": "el Fogón · tercera pasada (forja-brava, mirar/fogon-templada, mirar/fogon-suspenso)",
      "ventana": "todas",
      "archivo": "src/rules/balance-config.json:243-254 (fogon.riesgos y mutaciones) · src/rules/partida.ts:434-458 (templar) · src/rules/bot.ts:274-281 · src/client/textos.ts:149 (riesgoBrava)",
      "que": "La Forja Brava es una apuesta perdedora. Para llegar hay que pasar el 35 % de la segunda pasada y después el 50 % de la tercera, y lo que se arriesga es el mejor naipe con +8 y Templado (+1 de Multi). Lo que se gana es +n de Daño (+9 como mucho, +1 en el 1 de Espadas de la captura) y una mutación al azar, de las cuales solo el Doble Filo mueve la aguja. Con un 9 templado se juegan al 50 % 17 de Daño, +1 de Multi y la carta, contra +9 y un tercio de chance de +2 de Multi. El propio bot no la toma nunca (bot.ts:277), así que el laboratorio no tiene un solo dato. Además, el cartel de la tercera pasada («su número vale doble… 50 % de que se queme») no menciona la mutación, que es justamente el premio.",
      "por_que": "Una tentación que el jugador experto aprende a rechazar no da su grito: los que la toman se queman dos de cada tres veces, y el resto la ignora. Es el pico de dopamina del Salto, y sale con EV negativo y a ciegas.",
      "propuesta": "1) Que la tercera pasada duplique el naipe entero (número + temple), así un 9+8 pasa a valer 34. 2) Que el que se quema deje ceniza: su temple pasa a otro naipe al azar (el mismo heredar() de la Cábala Negra), y la pérdida duele pero no borra la partida. 3) Ofrecer dos mutaciones a elegir en lugar de sortear una, y nombrarlas en el cartel antes de arrimar. 4) Que el bot la tome con EV positivo y que el laboratorio cuente las Forjas y las quemadas."
    },
    {
      "prioridad": "P1",
      "pantalla": "mesa · paño de Postas (mesa-seleccion, mesa-escalon, mesa-chispa, postas-golpe, mesa-postas-arrastre)",
      "ventana": "todas",
      "archivo": "src/rules/bot.ts:104-116 (mejorAcomodo) · src/client/pantallas/mesa.ts:1968-1972 (acomodar) y :383-410 (veredicto de la cuenta) · src/rules/combate.ts:229-236",
      "que": "Ya está bien resuelto qué disposición gana: mejorAcomodo prueba las 120 y el error del 0-1-2 desapareció. El problema es que justamente por eso el paño sigue sin pedir ninguna decisión. Medio, Chispa y Escalón son +n que la máquina maximiza sola, y ninguna disposición distinta tiene una razón para existir. Las dos patas de mi propuesta anterior, el dial del exacto y el palo del Medio, no entraron. Los exactos siguen muertos: de 0,3 a 1,8 por partida, y Chancho y Truco entre 0,3 y 0,4.",
      "por_que": "Una regla de posición que cobra una fila de pantalla, rótulos, LB/RB y arrastre tiene que generar al menos una pregunta por golpe. Hoy la única que genera es «¿le gano a la mesa?», y la respuesta es siempre no.",
      "propuesta": "Que mejorAcomodo devuelva dos candidatas: MÁXIMO, y EXACTO o AL PELO cuando alguna disposición da justo la Vida del enemigo (o queda dentro del 5 %). Que la cuenta muestre el chip «MOVÉ EL 7 AL MEDIO → ¡EXACTO!» y que LB/RB salten entre las dos. Y que el Medio duplique también el poder de su palo (Escudo, cura, oro o sobra de Perfora): así elegir qué palo va al centro decide si te defendés, te curás o cobrás."
    },
    {
      "prioridad": "P1",
      "pantalla": "botín · jackpot de Evolución (evolucion-jackpot), ELEGÍ UN AMULETO (oferta-evoluciona, botin-tesoro), HUD (hud-evolucion)",
      "ventana": "todas",
      "archivo": "src/rules/evoluciones.ts:27-52 y :55 (evoluciono) · src/rules/balance-config.json:256-267 (facon.sobra 2 = amuletos.lanza 2, :332) · src/rules/combate.ts:302-309, 349, 533-537",
      "que": "Tres de las cuatro Evoluciones son retoques numéricos, y se despiertan casi solas. El Facón Maldito pasa la sobra ×2, igual que la Lanza (lanza = 2 y facon.sobra = 2): lo único que suma es +1 de Multi por abatido. El Brindis de Sangre le saca la condición al Cáliz y le agrega +1. El Sol de la Timba sube el tope a +3 y paga 2 de oro por abatido. Solo el Garrote (el Escudo entero se suma al Daño) cambia la manera de jugar. Para despertar alcanza cualquier don del Rey del palo, incluido un Pacto Dual, y con una Bendición después de cada Guardia eso es casi seguro desde el tramo 2. Un jackpot prismático de 1,2 s para un +1 de Multi promete más de lo que paga, y «Maldito» no tiene ninguna maldición.",
      "por_que": "Es la promesa central del Salto: el momento en que dos piezas se tocan y la partida cambia de forma, como un Duo de Hades. Si la recompensa es +1, el jugador aprende a no leer el jackpot, y los Amuletos siguen sin armar builds (mi P1 de tres versiones). La única que se nota es la de Bastos.",
      "propuesta": "Que cada Evolución cambie una regla y tenga un costo escrito, como los Legendarios (110 caracteres). Facón Maldito: la sobra salta también al próximo combate, pero tus Copas no curan. Brindis de Sangre: la cura que no te cabe se vuelve Daño ×2, y cada golpe te cuesta 1 de Vida. Sol de la Timba: cada Oro del golpe da +1 de Multi, y la Pulpería te cobra un 25 % más. Garrote: queda como está, pero el primer golpe de cada combate entra sin Escudo. Que despierte solo con un don de nivel 2, o con dos dones, para que la Evolución sea una meta y no un accidente. Siguen siendo 15 Amuletos."
    }
  ],
  "aciertos": [
    "Los Tesoros a la vista le dan al Mapa un objetivo de ruta desde la entrada del tramo (mapa-tesoro), y el cofre pesa al Épico y al Legendario (partida.ts:69). Con candado, el oro pasa a ser una decisión entre Pulpería y cofre.",
    "La Cábala Negra es escultura de mazo de verdad: coser dos 9 da un 9 con +9 en un Mazo más fino, y trasplantar mueve palo, temple, Forja y mutación (bufon.ts:427-433). Combinada con el Fogón arma una línea propia: forjar y después coser.",
    "El Garrote del Cacique es el primer conversor real: con Empalizada, Rebenque y Palo y palo, la build de Bastos tanque pega con su Escudo. Es la única build que se siente distinta por las piezas y no por el Mazo.",
    "El paño en fila propia: la mano ya no ocupa las Postas y el 2 de Oros ya no aparece bajo «Medio» (mesa-seleccion, 390 mesa-seleccion). Además mejorAcomodo prueba todas las disposiciones.",
    "TURBO (cualquier entrada corta la animación) y la oferta del Rey con dos Legendarios (rey-cae-17) mejoran el ritmo y las ganas de bajar a un Rey."
  ],
  "capturas_vistas": [
    "visual-qa/1280x800/mesa.png",
    "visual-qa/1280x800/mesa-seleccion.png",
    "visual-qa/1280x800/mesa-escalon.png",
    "visual-qa/1280x800/mesa-chispa.png",
    "visual-qa/1280x800/mesa-mentiroso.png",
    "visual-qa/1280x800/mesa-postas-arrastre.png",
    "visual-qa/1280x800/hud-evolucion.png",
    "visual-qa/1280x800/evolucion-jackpot.png",
    "visual-qa/1280x800/oferta-evoluciona.png",
    "visual-qa/1280x800/forja-brava.png",
    "visual-qa/1280x800/fogon.png",
    "visual-qa/1280x800/cabala-negra.png",
    "visual-qa/1280x800/mapa-tesoro.png",
    "visual-qa/1280x800/botin-tesoro.png",
    "visual-qa/1280x800/pulperia.png",
    "visual-qa/390x844/mesa-seleccion.png",
    "mirar/1280-fogon-templada.png",
    "mirar/1280-fogon-suspenso.png",
    "jurado/secuencias/1280-postas-golpe-00.png",
    "jurado/secuencias/1280-postas-golpe-05.png",
    "jurado/secuencias/1280-postas-golpe-10.png",
    "jurado/secuencias/1280-golpe-05.png",
    "jurado/secuencias/1280-rey-cae-17.png",
    "jurado/secuencias/1280-botin-brota-08.png",
    "jurado/secuencias/1280-chiche-usa-03.png"
  ]
}
```

## Veredicto

**Respecto de la 0.21.0:** quedó **resuelto** el error del acomodo (ahora se prueban las 120 disposiciones). **Resuelto en su mayor parte** el paño bajo la mano: tiene fila propia, aunque en reposo no se ve y aparece recién al elegir. El P1 de los Amuletos **mejoró en parte**: el Garrote es un conversor, y suman los Tesoros y los dos Legendarios en la oferta del Rey. **Sigue** el paño sin decisión. **Siguen** también estos menores: el arrastre que miente, el Dado que tapa LB/RB, el Escalón imposible con iguales, la Moneda falsa a 3 Oros y el laboratorio ciego.

Simulé tres builds con las piezas reales:

- **Bastos tanque (Chinchón):** Poncho → Garrote con Empalizada, Rebenque, Palo y palo y Mesa Servida. En el tramo 2, con tope de 40 de Escudo, el Garrote suma +40 de Daño y Palo y palo suma hasta +60. La defensa se vuelve ataque. Es la primera build que se arma por las piezas, y se siente distinta.
- **Timba de Oros (Truco):** Cofre → Sol con Peso fuerte, Filo dorado y una Chispa de Oro forjada. Aparece una tensión linda: guardar oro para el Multi o gastarlo en el candado del Tesoro. Pero con 90 de oro llega al tope y se aplana.
- **Espadas (Escoba):** Lanza → Facón Maldito. Es la Lanza de siempre con +1 de Multi a partir del segundo abatido del combate. No se nota. El grito lo sigue dando el ¡ESCOBA! ×3.

Hay dos builds distintas y una de relleno: es un paso real respecto de la 0.21.

**Laboratorio:** la caída en el tramo 1 empeoró: va de 2,3 % (Chancho) a 19,1 % (Escoba), 8 veces de diferencia. Los cantos de Chancho siguen en 1,5 por partida contra 24,2 de Truco. El laboratorio no mide nada del Salto. **Leído en código, no visto:** el sonido de la forja, que el TURBO corte el jackpot y que la Cábala Negra salga solo en el tramo 2 o 3.

## Defectos menores

- Mientras arrastrás el 6 fuera del Medio, la cuenta sigue diciendo «Medio +6» (mesa-postas-arrastre): `src/client/mano.ts:600-660`.
- La ráfaga del Dado sigue tapando «LB RB corre de Posta» (chiche-usa-03): `src/client/pantallas/mesa.ts` (vuelo del Chiche).
- REGLAS.md no dice una palabra de las Evoluciones, las mutaciones, la Cábala Negra, los Tesoros ni el TURBO, y describe la Forja sin mutación: `scripts/reglas.ts:110`.
- El laboratorio no cuenta Evoluciones despiertas, Forjas, quemadas, Cábala Negra, Tesoros abiertos, Escalón, Chispa ni Prenda: `scripts/analyze-meta.ts`.
- El contrapeso del Cetro (−2 de Vida ×tramo por combate) no pica contra un ×3. Y el Escalón sigue vedado a iguales y Comodines, lo que castiga a Chancho y a Mentiroso: `src/rules/balance-config.json:339` y `src/rules/combate.ts:237`.

## Qué haría en la próxima versión

**«Las piezas mandan».** Las Evoluciones se reescriben como cambios de regla con su maldición escrita, y despiertan con un don de nivel 2. Así son una meta que se persigue y no un accidente. La Forja Brava duplica el naipe entero, deja ceniza al quemarse y ofrece dos mutaciones a la vista. El paño pasa a ser el dial del exacto: la mesa ofrece MÁXIMO y EXACTO con un chip que dice qué mover, y el Medio duplica el poder de su palo. La Prenda sale también del Escalón y de la Chispa, para que el paño alimente la bandeja. Y el laboratorio mide todo lo del Salto antes de que el panel vote.
