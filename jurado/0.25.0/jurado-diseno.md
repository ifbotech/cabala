```json
{
  "jurado": "jurado-diseno",
  "version": "0.25.0",
  "puntajes": { "claridad": 8.2, "diversion": 8.2, "estetica": 8.2, "veredicto": 8.1 },
  "defectos": [
    {
      "prioridad": "P1",
      "pantalla": "botín · ELEGÍ UN AMULETO con ★ EVOLUCIONA (oferta-evoluciona), jackpot (evolucion-jackpot), HUD (hud-evolucion-foco)",
      "ventana": "todas",
      "archivo": "src/rules/evoluciones.ts:32-50 (las cuatro desc) · src/rules/combate.ts:283-291 (Brindis cura ×2, Garrote Copas→Escudo, Sol oro ×2) y :315-318 (Brindis +3 Multi) · :830-835 (Sol al descartar) · src/rules/evoluciones.ts:55 (evoluciono: cualquier don)",
      "que": "Las Evoluciones quedaron a medias. Dos son reglas de verdad. El Facón obliga a pegar solo para abatir o a pagar 3 de Vida (mesa-maldicion: 170 contra 475, con «−3 DE VIDA» a la vista). El Garrote convierte las Copas en un palo de daño: Copas → Escudo → Daño en el golpe siguiente. Las otras dos siguen siendo números. El Sol cambia oro por oro: tus Oros pagan doble y cada descarte cuesta −3. El Brindis se anula solo: las Copas curan doble y cada golpe bebe 2. Además, el bloque MALDICIÓN del Brindis trae adentro su premio («pero suma +3 de Multi»), y la del Garrote, con el Garrote puesto, es un regalo. El jugador aprende que MALDICIÓN puede querer decir «bueno». Y siguen despertando con cualquier don de nivel 1.",
      "por_que": "Es mi P1 por sexta versión, pero esta vez a la mitad. El Facón y el Garrote ya dan el momento estilo Duo de Hades: cambian cómo jugás el paño. El Sol y el Brindis no, así que la mitad de los jackpots prismáticos siguen siendo +Multi con otro marco. Si una maldición es un premio, el rótulo pierde su peso, y es justo el peso que esta versión vino a darle.",
      "propuesta": "Sol de la Timba: cada Oro del golpe suma +1 de Multi; maldición, la Pulpería te cobra un 25 % más. Brindis: la cura que no te entra (sobre la Vida máxima) se vuelve Daño ×2; maldición, cada golpe bebe 2, y el +3 de Multi sale del bloque carmesí. Garrote: además de lo de las Copas, el primer golpe de cada combate entra sin tu Escudo sumado. Que despierten con un don de nivel 2. El laboratorio cuenta Evoluciones despiertas y la Vida u oro que cobra cada maldición."
    },
    {
      "prioridad": "P1",
      "pantalla": "Chancho Va (laboratorio) · su canto ¡CHANCHO!",
      "ventana": "todas",
      "archivo": "src/rules/combate.ts:131-132 (canto = solo póker) · src/rules/balance-config.json:194-202 (mazos.chancho) · scripts/meta-report.json",
      "que": "Chancho canta 1,4 veces por partida, igual que en la 0.23 y la 0.24, contra 22,2 de Truco y 9,3 de Escoba. Al mismo tiempo tiene el mejor golpe del laboratorio (44 352, por encima de los 38 304 de la Escoba) y el Altar lleno en 49 %, el borde de la banda. Su identidad es el pase gratis, no el canto.",
      "por_que": "La Escoba quedó arreglada. Ahora el Mazo sin voz es el que más pega al final: se gana sin gritar ¡CHANCHO! nunca. Un Mazo cuyo grito sale una vez cada partida y media no tiene clímax propio. Tampoco tiene una build distinta: es «Par + Medio ×2» con ciclado.",
      "propuesta": "Que la Pierna canta ¡CHANCHO! chico (Multi ×2, sin aturdir) si en ese turno usaste el pase gratis, y que el Póker siga siendo el grande. Así el pase y el canto se vuelven el mismo verbo. Atajar el techo bajando multiMano de 6 a 5. Recertificar con cantos ≥ 6 por partida y Altar lleno ≤ 48."
    },
    {
      "prioridad": "P2",
      "pantalla": "mesa · costo antes de actuar (mesa-dejalo-justo, mesa-pega-todo, mesa-maldicion)",
      "ventana": "todas",
      "archivo": "src/client/pantallas/mesa.ts:486 (SOBRAN usa la sobra sin ×3) contra src/client/textos.ts:334 (dialPierde con la sobra ×3) · src/client/pantallas/mesa.ts:719 (DESCARTAR sin el −3 de oro del Sol)",
      "que": "La versión promete que la maldición se lee como costo antes de cobrarse. Con la Vida se cumple: el chip «−3 DE VIDA» está en la cuenta. Con el Sol no: DESCARTAR (4) no avisa los −3 de oro, que aparecen recién después de descartar. Y con el Facón, la cuenta dice «SOBRAN 24» mientras el dial dice «pierde 72 que pasaban»: son dos cifras distintas para la misma sobra, porque una ya lleva el ×3.",
      "por_que": "El dial ya es una decisión de verdad: 72 al Caballo contra +3 de oro y +1 de Multi. Pero si las dos cifras no coinciden, el jugador desconfía de las dos. Un costo que aparece después de pagarlo es una trampa, no una maldición.",
      "propuesta": "Con el Facón, que la cuenta diga «SOBRAN 24 · PASAN 72». Con el Sol despierto, que DESCARTAR diga «(4) · −3 de oro» en carmesí y que el ícono del Sol tiemble al enfocarlo."
    }
  ],
  "aciertos": [
    "El dial pasó a ser una decisión. Sin Perfora, la mesa apoya sola el exacto y no pregunta. Con Perfora, cada lado dice qué gana y qué pierde, y los dos pesan parecido: «+3 de oro · +1 Multi al próximo · pierde 72» contra «72 pasan al siguiente · sin los +3 de oro» (mesa-dejalo-justo y mesa-pega-todo, 1280 y 390).",
    "El Facón Maldito ahora te pregunta algo en cada golpe: ¿abato o pago 3? La cuenta muestra «−3 DE VIDA» antes de golpear, con el ícono de la Evolución (mesa-maldicion 1280 y 390).",
    "Mesa limpia funciona y se lee: el rótulo va sobre el Escudo, el Bufón la presenta y la caída en el tramo 1 de la Escoba bajó del 17,9 % al 8,7 %, sin tocar su techo, que pasó de 53 460 a 38 304 (mesa-limpia y meta-report).",
    "La Forja Brava es una apuesta escrita: «APUESTA: 50 % SE QUEMA» arriba, «YA TIENE» como estado y el costo de Doble Filo en carmesí, aparte. La ceniza que vuela sobre el retrato se siente como una pérdida (forja-brava-eleccion 1280 y 390, mirar/forja-brava-despues).",
    "El Garrote con Copas → Escudo → Daño es el primer combo de dos palos que nace de una Evolución (mesa-garrote: GARROTE DEL CACIQUE +4 en el Daño)."
  ],
  "capturas_vistas": [
    "visual-qa/1280x800/mesa-maldicion.png",
    "visual-qa/390x844/mesa-maldicion.png",
    "visual-qa/1280x800/mesa-garrote.png",
    "visual-qa/1280x800/mesa-limpia.png",
    "visual-qa/1280x800/mesa-pega-todo.png",
    "visual-qa/390x844/mesa-pega-todo.png",
    "visual-qa/1280x800/mesa-dejalo-justo.png",
    "visual-qa/1280x800/mesa-exacto.png",
    "visual-qa/390x844/mesa.png",
    "visual-qa/1280x800/oferta-evoluciona.png",
    "visual-qa/1280x800/evolucion-jackpot.png",
    "visual-qa/1280x800/hud-evolucion-foco.png",
    "visual-qa/1280x800/forja-brava-eleccion.png",
    "visual-qa/390x844/forja-brava-eleccion.png",
    "visual-qa/1280x800/resumen-victoria.png",
    "visual-qa/390x844/resumen-derrota-movil.png",
    "mirar/1280-fogon-suspenso-brava-llama.png",
    "mirar/1280-forja-brava-despues.png",
    "jurado/secuencias/1280-golpe-04.png",
    "jurado/secuencias/390-golpe-06.png",
    "jurado/secuencias/1280-rey-segunda-14.png",
    "jurado/secuencias/1280-rey-segunda-17.png",
    "jurado/secuencias/1280-rey-segunda-20.png",
    "jurado/secuencias/1280-botin-brota-08.png"
  ]
}
```

## Veredicto

**Respecto de la 0.24.0:** el P1 del dial quedó **resuelto**: sin Perfora no pregunta, y con Perfora pone el costo de cada lado. El de la Escoba en el primer contacto, **resuelto** (17,9 % → 8,7 %, cerca de mi ≤ 8 %). El de las Evoluciones está **a medias**: el Facón y el Garrote cambian una regla, y el Sol y el Brindis siguen siendo números. Entre los menores quedaron **resueltos** la Y con doble función (ahora el dial va en R3), el ×2 que tapaba el COMODÍN, el «vale doble» de la Forja en el teléfono y TU MANO ESTRELLA, que ahora es TU ARMADO. **Siguen** los Reyes cortados arriba en el final del teléfono y el laboratorio sin contar diales, Forjas ni Evoluciones.

Simulé tres builds con las piezas reales:

- **Bastos y Copas (Chinchón):** Poncho → Garrote. Las Copas dejan de curar y se vuelven Escudo, y ese Escudo entra como Daño al golpe siguiente. Ahora se juega en dos tiempos: primero me cubro, después pego. Es la build que más ganó.
- **Espadas (Escoba):** Lanza → Facón. Todo perfora ×3, pero con 3 naipes en la mano, contra un Rey de 390, cada golpe que no lo abate cuesta 3. Son unos 12 de Vida por Rey. Es una apuesta real, y con Mesa limpia el primer tramo la aguanta.
- **Oros (Truco):** Cofre → Sol. Dobla el oro y cobra el descarte. Se juega igual que sin despertarlo, solo que más rico. Es la que sigue sin forma propia.

Ya son tres builds que se sienten distintas en la mesa, no solo en la cuenta. El naipe estrella del Fogón sigue siendo la cuarta.

**Laboratorio:** los exactos casi no se movieron (de 0,2 a 1,8), aunque el bot ya apoya en exacto. El exacto es raro y el dial aparece poco, y está bien que sea así. El Mentiroso cae en el tramo 1 el 13,3 % de las veces, aunque se abre recién con 3 Reyes. **Leído en código, no visto:** el respiro de unos 600 ms tras el golpe grande (mesa.ts:766-772), el golpe seco y el sonido de la maldición (mesa.ts:1092-1100) y el «hay más ↓» del final en el teléfono, que en la captura no aparece porque el cuadro entra entero.

## Defectos menores

- El comentario de Mesa limpia dice «Escoba y Truco», pero solo la Escoba tiene `mesaLimpia`: `src/rules/combate.ts:437`.
- El sello «SE PLANTA EN LA MITAD · 100 SE PIERDEN» pisa el nombre del Rey y la placa del Cuero del Cacique (rey-segunda-17), y el cartel SEGUNDA CARA corta «FORTÍN» en la placa del rasgo (rey-segunda-20): `src/client/pantallas/mesa.ts:824` y `:1705`.
- En el final, «TU JUGADA» va pegado a su valor («TU JUGADAEnvido» en 390): `src/client/pantallas/camino.ts` (bloque de TU ARMADO).
- R3 es el botón menos descubrible del mando para una decisión que vuelve a aparecer. Con mando, mejor que el dial tome el foco al aparecer y se resuelva con A: `src/client/nav.ts:237`.
- En el teléfono, al elegir, lo que queda de la mano asoma a medias bajo GOLPEAR. Es a propósito, pero el Comodín se reconoce solo por su rótulo: `src/client/estilos/mesa.css:4742-4749`.

## Qué haría en la próxima versión

**«Las cuatro malditas».** El Sol y el Brindis se reescriben como reglas, el Sol con Multi por Oro y el Brindis con la cura que sobra convertida en Daño. Cada bloque MALDICIÓN dice solo el costo, y el premio va afuera. El Garrote paga un costo de verdad. Las cuatro despiertan con un don de nivel 2. Chancho gana su ¡CHANCHO! chico con la Pierna y el pase, y se le ataja el techo. Todo costo se ve antes de actuar: el oro en DESCARTAR y la sobra con su ×3. Con mando, el dial toma el foco al aparecer. El laboratorio cuenta las Evoluciones despiertas, lo que cobra cada maldición y los diales vistos y usados, y se recertifica con cantos de Chancho ≥ 6 y Altar lleno ≤ 48 en los cinco Mazos.
