```json
{
  "jurado": "jurado-diseno",
  "version": "0.26.0",
  "puntajes": { "claridad": 8.3, "diversion": 8.4, "estetica": 8.2, "veredicto": 8.3 },
  "defectos": [
    {
      "prioridad": "P1",
      "pantalla": "Chancho Va y Chinchón · sus cantos (elegir-mazo, mesa-chinchon 1280 y 390; el canto de Chancho, leído en código, no visto)",
      "ventana": "todas",
      "archivo": "src/rules/combate.ts:131-133, :327 y :357 · src/rules/balance-config.json:181 (chinchon.mitiga 0) y :200 (chancho.pierna 1) · src/rules/mazos.ts:74 y :104",
      "que": "La Pierna de Chancho ya canta: 6,6 cantos por partida, contra 1,4 de antes. Pero lo que paga es Aturde 1, o sea que ese turno el enemigo no te pega. Y la Pierna del Chinchón ahora también dice NO TE PEGA · ¡CHINCHÓN! (mesa-chinchon). Dos de los cinco Mazos dan el mismo premio por la misma jugada: tres iguales y el enemigo pierde el turno. Encima, la regla de Chancho promete «×1 de Multi», que no hace nada: x() ignora todo lo que valga 1 o menos, y el paso ni aparece en la cuenta.",
      "por_que": "Mi P1 pedía que Chancho tuviera voz. La tiene, pero es la del Chinchón. Una build de Pierna se juega igual en los dos Mazos: buscar el trío para no recibir el golpe. Y un «×1» en la regla es un premio vacío escrito en el renglón que más se lee del Mazo.",
      "propuesta": "Separar los verbos: que el Chinchón cubra y que el Chancho robe. La Pierna de Chancho da ×2 de Multi y te devuelve el pase gratis ese turno, sin aturdir. El Póker queda en ×2 con Aturde 2, o sube a ×3 si multiMano baja de 4 a 3. Mientras valga 1, sacar el «×1» del texto. Recertificar con cantos ≥ 6 y mejor golpe ≤ 40 000."
    },
    {
      "prioridad": "P1",
      "pantalla": "mesa con SOL DE LA TIMBA (mesa-sol, mesa-garrote: DESCARTAR ∞ · −3 oro) · scripts/meta-report.json",
      "ventana": "todas",
      "archivo": "src/rules/bot.ts:179-180 (el bot descarta solo si c.descartes > 0) · src/rules/combate.ts:816-841 · scripts/meta-report.json (no cuenta Evoluciones)",
      "que": "El Sol es la regla más fuerte de la versión: descartes sin fin a 3 de oro cada uno. Con la Escoba, que tiene mano de 3 y busca sumar 15, eso es cavar hasta la ¡ESCOBA! ×3 en cada golpe mientras dure el oro, y cada Escoba suma Daño para siempre. Pero el bot solo descarta cuando le quedan descartes (bot.ts:180), así que nunca paga uno del Sol. Y el informe no cuenta las Evoluciones despiertas ni lo que cobra cada maldición. El «balance recertificado en los cinco Mazos» deja afuera la pieza que más cambió. Aun sin usar el Sol, el mejor golpe de la Escoba ya subió de 38 304 a 54 720.",
      "por_que": "Una regla que nadie midió puede ser un combo roto o una trampa, y hoy no sabemos cuál de las dos. Los combos rotos se buscan, pero los tiene que encontrar primero el laboratorio, no el jugador en su segunda partida.",
      "propuesta": "Que el bot pague descartes del Sol cuando el golpe es flojo y el oro sigue por encima de un piso (por ejemplo 15). Sumar celdas Escoba+Sol y Truco+Sol. Que el informe cuente, por Mazo, las Evoluciones despiertas, los descartes pagados y el oro y la Vida que cobra cada maldición. Si Escoba+Sol pasa el techo, tope de 3 descartes pagados por turno."
    },
    {
      "prioridad": "P2",
      "pantalla": "mesa-maldicion, mesa-garrote, secuencia maldicion, oferta-evoluciona",
      "ventana": "todas",
      "archivo": "src/rules/combate.ts:374 (Facón: no abate) y :736 (Garrote: no abate) · :314 (Brindis) · src/rules/evoluciones.ts:55 (despierta con cualquier don)",
      "que": "El Facón y el Garrote cobran por lo mismo: el golpe que no abate. Llevar los dos es una sola regla con dos multas. El Brindis bebe 1 por golpe, pero cada punto que bebe le suma Multi: para quien lo entiende, su maldición sigue siendo un premio. Y las cuatro siguen despertando con cualquier don de nivel 1.",
      "por_que": "Una maldición se define por lo que te prohíbe. Si dos prohíben lo mismo y la tercera no prohíbe nada, la mitad de las Evoluciones empuja hacia la misma forma de jugar (pegá solo para abatir), que además ya empujan el exacto y De un saque.",
      "propuesta": "Garrote: que la maldición caiga en el turno en que no jugás Bastos (el Escudo se enfría a la mitad). Así obliga a alternar palos y no a abatir. Brindis: que la maldición sea «tus Copas ya no te curan». Ese costo sí obliga a vivir abajo. Que despierten con un don de nivel 2."
    }
  ],
  "aciertos": [
    "Las cuatro Evoluciones ya son reglas. El Sol cava con oro, y cada descarte le baja el Multi que el mismo oro le da: el oro queda repartido entre Multi, tienda y búsqueda, un triángulo de verdad. El Brindis premia vivir abajo (con Sangre por sangre y Falta Envido arma una build berserker). El Garrote mete Escudo ×2 al Daño (GARROTE +20, 378 en mesa-garrote) y lo cobra a la vista.",
    "Todo costo se ve antes de actuar: DESCARTAR ∞ · −3 oro, SOBRAN 24 ×3 = 72 PASAN igual en la cuenta y en el dial, y MALDICIÓN −5 DE ESCUDO. La secuencia cumple la promesa: TE PEGA 18, Vida de 45 a 27, Escudo de 10 a 0. En las ofertas, el bloque MALDICIÓN dice solo el costo.",
    "Chancho cumplió mis números de la 0.25: 6,6 cantos por partida, mejor golpe 26 220 (antes 44 352) y Altar lleno en 46,2.",
    "La Forja Brava tiene su cumbre: un ×2 gigante sobre el fogón, la escena manda sobre el panel y la quema se ve en el naipe en llamas (mirar/forja-brava-x2 y quema-llama, 1280 y 390).",
    "En el teléfono, la mano ya no salta al elegir (mesa-seleccion 390), y el final entra entero, con TU JUGADA separada de su valor y HAY MÁS ↓ (resumen-victoria 390)."
  ],
  "capturas_vistas": [
    "visual-qa/1280x800/mesa-garrote.png",
    "visual-qa/1280x800/mesa-sol.png",
    "visual-qa/1280x800/mesa-maldicion.png",
    "visual-qa/1280x800/mesa-chinchon.png",
    "visual-qa/390x844/mesa-chinchon.png",
    "visual-qa/390x844/mesa-seleccion.png",
    "visual-qa/390x844/mesa.png",
    "visual-qa/1280x800/mesa-pega-todo.png",
    "visual-qa/1280x800/mesa-dejalo-justo.png",
    "visual-qa/1280x800/mesa-grito.png",
    "visual-qa/1280x800/oferta-evoluciona.png",
    "visual-qa/1280x800/hud-evolucion-foco.png",
    "visual-qa/1280x800/elegir-mazo.png",
    "visual-qa/1280x800/mapa.png",
    "visual-qa/390x844/resumen-victoria.png",
    "mirar/1280-mesa-grito.png",
    "mirar/1280-rey-cae.png",
    "mirar/1280-forja-brava-elegir.png",
    "mirar/1280-forja-brava-x2.png",
    "mirar/390-forja-brava-x2.png",
    "mirar/1280-forja-brava-quema-llama.png",
    "jurado/secuencias/1280-maldicion-01.png",
    "jurado/secuencias/1280-maldicion-06.png",
    "jurado/secuencias/1280-maldicion-12.png",
    "jurado/secuencias/390-maldicion-10.png",
    "jurado/secuencias/1280-golpe-04.png",
    "jurado/secuencias/1280-golpe-07.png",
    "jurado/secuencias/1280-golpe-09.png",
    "jurado/secuencias/1280-rey-cae-08.png",
    "jurado/secuencias/1280-rey-segunda-17.png"
  ]
}
```

## Veredicto

**Respecto de la 0.25.0:**
- El P1 de las Evoluciones quedó **resuelto en lo central**: las cuatro cambian una regla y la MALDICIÓN dice solo el costo. **Siguen** dos cosas: despiertan con cualquier don de nivel 1 y el Brindis cobra con algo que lo alimenta.
- El P1 de Chancho está **resuelto en los números**, pero abrió una colisión con el Chinchón (P1 nuevo).
- El P2 del costo antes de actuar quedó **resuelto**: el −3 de oro está en DESCARTAR y la sobra coincide con el ×3.
- Entre los menores, **resueltos**: TU JUGADA pegada, los Reyes cortados en el final del teléfono y la mano que asomaba a medias. El sello sobre el Cacique no lo vi repetirse en rey-segunda-17.
- **Siguen** el dial en R3 (mesa-pega-todo) y el laboratorio sin contar diales, Forjas ni Evoluciones, que ahora es P1.

Simulé tres builds con las piezas reales:

- **Escoba + Cofre → Sol:** cavo hasta el 15 con oro. Cada descarte me baja el Multi del Sol y me vacía la Pulpería. Es la primera Evolución que cambia *cuándo* golpeo, no cuánto. Es la build del grito, y la que nadie midió.
- **Chinchón + Poncho → Garrote:** junto Bastos, cubro con la Pierna (NO TE PEGA) y remato con Escudo ×2. Se juega en dos tiempos y con la Vida de 32 sin margen. Es la más táctica.
- **Mentiroso + Cáliz → Brindis + Falta Envido:** vivo bajo la mitad, las Copas me restan Multi y el Engaño remata. Es una build de riesgo de verdad, aunque la maldición casi no la siento.

Las tres se juegan distinto, y es la primera versión en que puedo decirlo de las cuatro Evoluciones. El ¡CHINCHÓN! que te cubre entero es un verbo limpio y legible. Por eso duele que Chancho haya recibido el mismo verbo.

**Leído en código, no visto:** el canto chico de la Pierna de Chancho (mesa.css:1335), el respiro antes de la maldición en 1280 (en 390 sí se ve: 378 arriba y el −5 después) y cualquier descarte pagado del Sol. Ninguna captura lo muestra en acción.

## Defectos menores

- En la Forja Brava, con el ×2 ya en pantalla, el Bufón sigue diciendo «Elegí la mutación y rezá»: `src/client/pantallas/camino.ts:978`.
- En mesa-chinchon 1280, el naipe que sube tapa la última palabra de «corre de Posta» en la regla del costado: `src/client/estilos/mesa.css:585`.
- En 390, el chip dice «¡CHINCHON!» sin tilde, mientras en 1280 dice «¡CHINCHÓN!»: `src/client/pantallas/mesa.ts:547`.
- El dial sigue en R3, el botón menos descubrible del mando: `src/client/nav.ts:237`.
- El canto del Chancho no tiene foto en la QA: falta un estado `mesa-chancho` en `src/client/qa.ts:465`.

## Qué haría en la próxima versión

**«Cada Mazo, su verbo».** Chinchón cubre y Chancho roba: la Pierna de Chancho da ×2 de Multi y te devuelve el pase, sin aturdir, y su regla pierde el «×1». El laboratorio aprende a jugar el Sol, con celdas Escoba+Sol y Truco+Sol y un tope de descartes pagados si hace falta. Cada maldición prohíbe algo distinto: el Facón castiga el golpe que no abate, el Garrote el turno sin Bastos, el Sol cobra oro y el Brindis te niega la cura. Las cuatro despiertan con un don de nivel 2. El informe cuenta Evoluciones despiertas, descartes pagados y lo que cobra cada maldición. Se recertifica con cantos ≥ 6 en los cinco Mazos y un techo ≤ 50 000 para Escoba+Sol. Con mando, el dial toma el foco y se resuelve con A.
