```json
{
  "jurado": "jurado-diseno",
  "version": "0.24.0",
  "puntajes": { "claridad": 7.9, "diversion": 7.8, "estetica": 8.1, "veredicto": 7.8 },
  "defectos": [
    {
      "prioridad": "P1",
      "pantalla": "mesa · dial DEJALO JUSTO (mesa-dejalo-justo 1280, 1366 y 390; mesa-exacto 1280)",
      "ventana": "todas",
      "archivo": "src/client/pantallas/mesa.ts:2080-2084 (acomodar usa siempre mejorAcomodo) y :370-379 (dialDe, sin AL PELO) · src/rules/bot.ts:126-160 (mejorGolpe no usa acomodoExacto) · src/rules/combate.ts:346 y :520-525 · scripts/analyze-meta.ts",
      "que": "Ahora se lee de un vistazo: tiene verbo, marco prisma y premio («+3 de oro · +1 Multi al próximo»), y el Bufón lo presenta. Pero sigue sin ser una decisión. En la captura, con Copas contra la Sota y sin Perfora, PEGÁ CON TODO tira 75 a la basura y además corta la racha, así que DEJALO JUSTO gana siempre. Aun así, la mesa sigue acomodando por defecto la opción peor. AL PELO, que mantiene la racha viva, no aparece en el dial. El bot sigue sin usarlo: hace entre 0,2 y 1,7 exactos por partida, las mismas cifras que en la 0.23.",
      "por_que": "Un botón que siempre conviene apretar no es una decisión: es un trámite de un golpe, y peor todavía con mando. Enseña a buscar el chip, no a pensar el paño. La perilla de verdad, exacto contra perforar al que viene, solo existe con Espadas o Lanza, y ahí el dial no dice lo que se pierde.",
      "propuesta": "1) Sin Perfora, la mesa acomoda sola en EXACTO o AL PELO, y el dial desaparece porque no hay nada que elegir. 2) Con Perfora, el dial pone el costo a cada lado: «PEGÁ CON TODO · 72 al Caballo» frente a «DEJALO JUSTO · +3 oro, racha 2». 3) Que el Medio duplique también el poder de su palo, así elegir qué naipe va al centro pasa a ser la segunda perilla. 4) Que el bot elija y que el laboratorio cuente los diales vistos y los usados."
    },
    {
      "prioridad": "P1",
      "pantalla": "botín · ELEGÍ UN AMULETO con ★ EVOLUCIONA (oferta-evoluciona, botin-tesoro), jackpot (evolucion-jackpot)",
      "ventana": "todas",
      "archivo": "src/rules/evoluciones.ts:27-55 (sin cambios desde la 0.23) · src/rules/balance-config.json (evoluciones)",
      "que": "La oferta ahora dice por qué evoluciona («con tu don de Copas») y muestra la regla entera. Esa claridad deja a la vista lo chico que es el premio. Lado a lado se lee «con 80 % de Vida: +2 de Multi» contra «+2 siempre y, con 80 %, +1 más»: el Brindis de Sangre es una condición menos y un número más. El Garrote suma el Escudo al Daño, la única regla nueva. El Facón y el Sol siguen siendo retoques de número. Despiertan con cualquier don, y «Maldito» o «de Sangre» siguen sin maldición.",
      "por_que": "Es mi P1 por quinta versión. El momento estilo Duo de Hades, en que dos piezas cambian la forma de jugar, no existe: con un jackpot prismático que paga +1 de Multi, el jugador aprende a ignorar el sello. Los Amuletos siguen sin armar builds distintas: el naipe estrella del Fogón es la única build que nació en las últimas tres versiones.",
      "propuesta": "Cada Evolución es una regla nueva con su maldición escrita, en 110 caracteres. Brindis de Sangre: la cura que no te entra se vuelve Daño ×2, y cada golpe cuesta 1 de Vida. Sol de la Timba: cada Oro del golpe da +1 de Multi, y la Pulpería cobra un 25 % más. Facón: la sobra pasa también al primer enemigo del combate siguiente, y tus Copas no curan. Garrote: queda como está, pero el primer golpe de cada combate entra sin Escudo. Que despierten con un don de nivel 2. Siguen siendo 15 Amuletos."
    },
    {
      "prioridad": "P1",
      "pantalla": "primer contacto · Escoba, el Mazo abierto desde el principio (laboratorio)",
      "ventana": "todas",
      "archivo": "src/rules/balance-config.json:150-160 (mazos.escoba) · src/rules/combate.ts (canto de Escoba) · scripts/meta-report.json (caidaTramo1)",
      "que": "Subirle la Vida a 74 casi no movió nada. En el tramo 1 cae el 17,9 % de las partidas con Escoba, contra el 3,1 % de Truco y el 2,3 % de Chancho. Y Escoba es el único Mazo abierto desde el principio. Además, su mejor golpe es de 53 460, contra los 15 984 de Chinchón. Es el Mazo más letal al arrancar y el más roto al final, mientras Chancho canta 1,4 veces por partida, así que casi no tiene identidad.",
      "por_que": "La primera partida decide si hay una segunda. Uno de cada seis jugadores nuevos muere antes del primer Rey con el único Mazo que tiene, sin ver ni la Forja ni una Evolución. Eso pesa más que cualquier gancho de OTRA MANO YA.",
      "propuesta": "Que Escoba sume una red de primer tramo, por ejemplo que el primer Quince de cada combate cure 6 (es su verbo, no un número nuevo), o que la primera partida abra con Truco, que hoy es el más amable. Que el techo se ataje en el +2 permanente del Quince, con tope por tramo. A Chancho le daría su ¡CHANCHO! con trío más Comodín. Recertificar con caidaTramo1 ≤ 8 % en los cinco Mazos."
    }
  ],
  "aciertos": [
    "Lo que Perfora ahora respeta al Rey: entra hasta la mitad, el sello dice cuánto se pierde y enseguida se da vuelta la segunda cara (combate.ts:551-575 y mesa.ts:744-763). El combo roto de la 0.23 se cerró sin matar el grito del Facón. Leído en código, no visto.",
    "La entrada del Rey ya no arrastra la cuenta del golpe anterior: el Caudillo irrumpe a 370/370 con la mesa limpia (rey-irrumpe-10 y 12).",
    "Las mutaciones de la Forja Brava son cartas de elección de verdad: icono grande, regla sobre fondo liso, A en la elegida y SEGUIR en segundo plano (forja-brava-eleccion 1280 y 390).",
    "El resumen dice ESTA PARTIDA y TU MEJOR con raya y rótulo, y el ¡NUEVO RÉCORD! en dorado (resumen-victoria). Es el mejor final que tuvo el juego.",
    "DEJALO JUSTO es un verbo con premio, no una sigla: el dial dejó de ser invisible (mesa-dejalo-justo, 3 ventanas)."
  ],
  "capturas_vistas": [
    "visual-qa/1280x800/mesa-dejalo-justo.png",
    "visual-qa/1366x768/mesa-dejalo-justo.png",
    "visual-qa/390x844/mesa-dejalo-justo.png",
    "visual-qa/1280x800/mesa-exacto.png",
    "visual-qa/390x844/mesa-seleccion.png",
    "visual-qa/1280x800/oferta-evoluciona.png",
    "visual-qa/1280x800/botin-tesoro.png",
    "visual-qa/1280x800/evolucion-jackpot.png",
    "visual-qa/1280x800/forja-brava-eleccion.png",
    "visual-qa/390x844/forja-brava-eleccion.png",
    "visual-qa/390x844/fogon-mutaciones.png",
    "visual-qa/1280x800/cabala-negra.png",
    "visual-qa/1280x800/resumen-derrota.png",
    "visual-qa/1280x800/resumen-victoria.png",
    "visual-qa/390x844/resumen-derrota-movil.png",
    "jurado/secuencias/1280-golpe-04.png",
    "jurado/secuencias/390-golpe-06.png",
    "jurado/secuencias/1280-rey-irrumpe-10.png",
    "jurado/secuencias/1280-rey-irrumpe-12.png",
    "jurado/secuencias/1280-rey-segunda-02.png",
    "jurado/secuencias/1280-rey-segunda-06.png",
    "jurado/secuencias/1280-rey-cae-16.png",
    "jurado/secuencias/1280-botin-brota-08.png"
  ]
}
```

## Veredicto

**Respecto de la 0.23.0:** el P1 de la perfora contra el Rey quedó **resuelto**, leído en código porque no hay captura del momento. El dial **mejoró en claridad, no en decisión**. Las Evoluciones **siguen** con las mismas reglas: solo cambió cómo se ofrecen. Entre los menores quedaron **resueltos** la cuenta vieja durante la entrada del Rey y QUÉ TE FRENÓ con rótulos. **Siguen** el premio de la Forja en el teléfono, el «+8★ ×2» sin «pega N», QUÉ TE FRENÓ sin el porqué y el laboratorio ciego.

Simulé tres builds con las piezas reales:

- **Bastos tanque (Chinchón):** Poncho → Garrote, con Empalizada y Palo y palo. Está igual que antes: sólida y clara.
- **Espadas (Escoba):** Lanza → Facón ×3. Ahora la perfora planta al Rey en la mitad y le da vuelta la cara. El grito queda y el clímax también. Es la build que más ganó con esta versión.
- **Naipe estrella (Truco):** el Fogón con un 9 de Oros, la Forja con Chispa de Oro y la Cábala Negra. Es distinta y con apuesta, pero con mano 3 sale una de cada cuatro o cinco manos.

Siguen siendo tres builds distintas, y esta vez ninguna se apoya en un agujero. Lo que falta es que los Amuletos armen una cuarta.

**Laboratorio:** los exactos no se movieron (de 0,2 a 1,7). Escoba muere en el tramo 1 en el 17,9 % de las partidas y Chancho canta 1,4 veces por partida. **Leído en código, no visto:** el sonido de la forja, la tercera pasada de 1,5 s con hitstop y el Bufón presentando el dial una sola vez por partida.

## Defectos menores

- Con mando, Y descarta salvo cuando está el dial: entonces lo alterna, y apretarlo dos veces vuelve a PEGÁ CON TODO sin descartar nunca. Es un atajo que cambia según el contexto: `src/client/nav.ts:230-232`.
- La marca «×2» del Medio tapa el rótulo COMODÍN del naipe, que queda en «COMODÍ…» (mesa-dejalo-justo y golpe-04): `src/client/mano.ts:187` y `:435`.
- En el teléfono, la Forja Brava solo dice «50 % de que se queme»: le falta «el naipe entero vale doble», que en 1280 sí está (390 forja-brava-eleccion): `src/client/pantallas/camino.ts:882`.
- En el resumen del teléfono, los Reyes salen recortados arriba (no se ve el «12» de arriba) y «TU MANO ESTRELLA» confunde, porque «mano» es tu mano de naipes: `src/client/pantallas/camino.ts:1261` y `src/client/textos.ts:295`.
- El laboratorio no cuenta los diales vistos y usados, las Forjas quemadas, las Evoluciones despiertas ni los Reyes plantados por perfora: `scripts/analyze-meta.ts`.

## Qué haría en la próxima versión

**«Las piezas mandan».** Las cuatro Evoluciones se reescriben como cambios de regla con su maldición y despiertan con un don de nivel 2: es el Salto que falta para pasar de «sumo Multi» a «juego distinto». El paño deja de preguntar lo obvio: sin Perfora acomoda solo en EXACTO o AL PELO, y con Perfora el dial muestra el costo de cada lado. El Medio duplica también el poder de su palo. Escoba recibe una red de primer tramo hecha con su propio verbo, Chancho su canto con Comodín, y se recertifica la caída del tramo 1 en ≤ 8 % para los cinco Mazos. El laboratorio mide todo esto antes de que vote el panel.
