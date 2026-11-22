```json
{
  "jurado": "jurado-ux-deck",
  "version": "0.24.0",
  "puntajes": { "claridad": 8.2, "diversion": 8.5, "estetica": 8.5, "veredicto": 8.2 },
  "defectos": [
    { "prioridad": "P1", "pantalla": "Mesa (DEJALO JUSTO, nombre del Chiche), Fogón (cartas de mutación) y resumen del final", "ventana": "1280x800 y 1366x768", "archivo": "src/client/estilos/mesa.css:4599-4611 (.dial-verbo y .dial-premio a 16 px); src/client/estilos/pantallas.css:4060-4062 (.forja-mut .fm-desc en var(--fs-s), que da 16 px); pantallas.css:4191-4196 (.fin-jugada-como, 16 px) y :4210-4213 (.fin-rec-rot, 16 px); mesa.css:4174-4176 (.chiche .ch-nombre, 15 px)", "que": "Casi todo el texto que suma la 0.24 viene en 16 px. Pasa con el verbo y el premio de DEJALO JUSTO, con la regla de las dos mutaciones («Al jugarlo: +2 de Multi, y te corta 2 de Vida…»), con «Suman 15 (Escoba)» y «2 del mismo palo (Truco)» en el resumen, y con los rótulos ESTA PARTIDA y TU MEJOR. Lo dicen los medidas.json: mesa 15 px («Ginebra»), forja-brava-eleccion y fogon-mutaciones 16, resumen-victoria y resumen-derrota 16. En la 0.23, todo lo que no era la mesa estaba en 18 o más. Por eso el Fogón y el final retroceden.", "por_que": "Son justo los textos que deciden: qué gano si lo dejo justo, qué mutación elijo y cómo se arma mi jugada. A 40 cm, en 7 pulgadas, 16 px de cuerpo pixelado se lee con esfuerzo. La regla de la Forja, en un recuadro oscuro de 160 px de ancho, ocupa cinco renglones apretados.", "propuesta": "Llevar a 18 px .dial-verbo, .dial-premio, .fm-desc, .fin-jugada-como y .fin-rec-rot en ventanas de 1280 o más, y .ch-nombre a 16 px como mínimo. Para que las cartas de mutación no crezcan, que la regla sea más corta («+2 Multi · −2 Vida, no mata»). Y sumar a la QA visual una puerta dura que falle con texto de menos de 18 px fuera de la mesa." },
    { "prioridad": "P1", "pantalla": "Mesa: ayuda de la bandeja del HUD (hud-evolucion-foco) y de un Chiche (mesa-mando)", "ventana": "1280x800", "archivo": "src/client/ui.ts:204 (TAPA_NUNCA = 'button, .titulo, .hud [data-n]': no protege al enemigo, a TE PEGA ni a la cuenta); ui.ts:234-265 (ubicarTipLibre); src/client/hud.ts:136 (la ayuda de la bandeja, con 13 renglones)", "que": "La regla tip-tapa cumple con lo que promete: no tapa botones, títulos ni cifras del HUD. Pero el lugar «libre» que encuentra resulta ser el rival. Con el foco en la bandeja, la ayuda de ★ EVOLUCIÓN (13 renglones) cae sobre el naipe del enemigo, la barra SOTA DE BASTOS, el motivo de TE PEGA («0 Cara de…», cortado) y la pista de botones. En mesa-mando, con el foco en la Ginebra, su ayuda tapa el final de los dos renglones del desglose de la cuenta.", "por_que": "Con mando, la ayuda se abre cada vez que movés el foco a una pieza. En la Deck lo hacés a mitad de combate, para decidir. Que la explicación tape a quién le pegás y cuánto te pega te obliga a cerrar y volver a abrir para cruzar los datos.", "propuesta": "Sumar a TAPA_NUNCA '.enemigo, .te-pega, .cuenta, [data-mano] .carta'. Si no hay lugar, que la ayuda de la bandeja salga a la izquierda, sobre el paño vacío, o que muestre solo la Evolución y «A para leerlas enteras» (3 renglones) y deje el resto para RT." },
    { "prioridad": "P2", "pantalla": "Mesa con DEJALO JUSTO ofrecido (mesa-dejalo-justo)", "ventana": "1280x800", "archivo": "src/client/nav.ts:230-232 (Y aplica el dial y, si no hay dial, descarta); src/client/pantallas/mesa.ts:393 (el dial lleva el glifo Y); mesa.css:614 (la placa ×2 del Medio)", "que": "Y es DESCARTAR durante toda la partida. Cuando aparece el dial, Y pasa a ser DEJALO JUSTO, y tocarla otra vez lo vuelve PEGÁ CON TODO. Lo único que avisa del cambio es que se apaga el glifo de DESCARTAR (4), y a 40 cm ese apagado casi no se nota. Además, en esa misma captura la placa ×2 del Medio tapa el rótulo del Comodín apoyado («COMOD…»). Pasa también en golpe-04.", "por_que": "Por costumbre, quien quiere descartar aprieta Y, y en lugar de descartar le reacomodan las cartas. No pierde nada, pero el botón deja de hacer lo que hacía. A esto se suma que el estado PEGÁ CON TODO sigue sin captura de QA.", "propuesta": "Mantener Y siempre como DESCARTAR y poner el dial en R3, con su glifo grande en la caja prisma: ahora que la caja dice el verbo y el premio, R3 ya se entiende. Si se queda en Y, que DESCARTAR muestre «mantené Y». El rótulo del Comodín, sobre la placa o debajo del ×2. Y un estado de QA mesa-maximo." }
  ],
  "aciertos": [
    "Mi P1 de la Cábala Negra quedó resuelto. El naipe enfocado lleva el aro celeste con la ▼ adentro (1 de Bastos a 1280, 1 de Espadas elegido y enfocado a 1366), el «1» de orden se ve y la flecha de «hay más» se fue al rincón del visor, lejos de VOLVER.",
    "El dial ahora es una acción: una caja prisma al costado del paño que dice «DEJALO JUSTO · +3 de oro · +1 Multi al próximo», con el glifo Y. La columna de pistas suma «Y lo deja justo» y el Bufón lo presenta. En inglés entra sin recortes («MAKE IT EXACT»).",
    "La Forja Brava se elige con dos cartas grandes, con el foco celeste, la ▼ y la A en la que está enfocada. SEGUIR queda aparte, con B, y el «50 % de que se queme» a la vista.",
    "El resumen tiene ALTAR con glifo Y, foco celeste en OTRA MANO YA, piezas de 48 px que son botones y ESTA PARTIDA | TU MEJOR con rótulo y raya. El Tesoro y ELEGÍ UNA quedan por encima del HUD, que sigue a la vista. En la oferta, «EVOLUCIONA · Brindis de Sangre con tu don de Copas» dice por qué.",
    "Las ayudas ya no se abren solas. En mando-elige-03 se ve entero el globo del Bufón en el Mapa, y en altar-devolver la ayuda de DEVOLVER ya no tapa MEJORAR. Todo 1280 sigue con 0 recortes y 0 solapes de dianas."
  ],
  "capturas_vistas": [
    "visual-qa/1280x800/mesa-dejalo-justo.png", "visual-qa/1280x800/mesa-exacto.png", "visual-qa/1280x800/mesa-mando.png", "visual-qa/1280x800/hud-evolucion-foco.png",
    "visual-qa/1280x800/forja-brava-eleccion.png", "visual-qa/1280x800/fogon-mutaciones.png", "visual-qa/1280x800/forja-brava.png", "visual-qa/1280x800/cabala-negra.png",
    "visual-qa/1280x800/resumen-victoria.png", "visual-qa/1280x800/resumen-derrota.png", "visual-qa/1280x800/oferta-evoluciona.png", "visual-qa/1280x800/elegi-amuleto.png",
    "visual-qa/1280x800/botin-tesoro.png", "visual-qa/1280x800/mapa-mando.png", "visual-qa/1280x800/piezas.png", "visual-qa/1280x800/jugadas.png", "visual-qa/1280x800/altar-devolver.png",
    "visual-qa/1280x800/mesa-segunda-cambia.png", "visual-qa/1366x768/cabala-negra.png", "visual-qa-en/1280x800/mesa-dejalo-justo.png", "visual-qa/390x844/resumen-derrota-movil.png",
    "jurado/secuencias/1280-mando-03.png", "jurado/secuencias/1280-mando-05.png", "jurado/secuencias/1280-mando-06.png", "jurado/secuencias/1280-mando-07.png", "jurado/secuencias/1280-mando-10.png", "jurado/secuencias/1280-mando-15.png",
    "jurado/secuencias/1280-mando-elige-03.png", "jurado/secuencias/1280-rey-segunda-02.png", "jurado/secuencias/1280-rey-segunda-04.png", "jurado/secuencias/1280-rey-segunda-08.png", "jurado/secuencias/1280-rey-segunda-10.png", "jurado/secuencias/1280-rey-segunda-12.png",
    "jurado/secuencias/1280-rey-tajo-05.png", "jurado/secuencias/1280-rey-irrumpe-06.png", "jurado/secuencias/1280-rey-irrumpe-10.png", "jurado/secuencias/1280-golpe-04.png", "jurado/secuencias/1280-postas-golpe-03.png",
    "medidas.json de todas las pantallas de 1280x800 y 1366x768 (node)"
  ]
}
```

## Veredicto

La 0.24.0 cumple casi todo lo que le pedí a la 0.23. La Cábala Negra se juega con mando sin adivinar, el dial dejó de ser una palabra suelta y pasó a ser una acción con verbo, premio y botón, y el resumen se recorre con la cruceta. **No hay P0.** Lo que la frena en la Deck es más chico, pero se repite. El texto nuevo viene en 16 px, por debajo de lo que se lee a 40 cm, justo donde se decide (DEJALO JUSTO, la mutación, tu jugada). Y la regla que aleja las ayudas de los botones las deja caer sobre el enemigo y la cuenta. La recomendaría con un pero: subir esa letra.

**Seguimiento de la 0.23:**
- **P1 Cábala Negra:** resuelto.
- **P1 chip EXACTO:** resuelto en lo central (verbo, premio, glifo, pista y Bufón). Queda la letra de 16 px y que Y cambia de función. El estado PEGÁ CON TODO sigue sin captura.
- **P2 resumen:** resuelto en código. Las piezas son botones de 48 px, el foco es celeste y ALTAR lleva Y. Ninguna captura muestra una pieza enfocada con su ayuda abierta: leído en código, no visto.
- **Menores:** resueltos «A para leerlas» con mando (hud.ts:136, data-tip-pie-mando; la captura muestra «Tocá» porque la QA pone la entrada en mando después de enfocar), la ayuda de DEVOLVER y la del nodo del Mapa. Siguen el 48 dicho dos veces en el Tajo (rey-tajo-05: «48 / 24 ×2» arriba y «TE PEGA 48 (24 ×2)» en la cuenta) y la letra de la mesa por debajo de 18 px.

Aviso: los 1,5 s de suspenso de la tercera pasada, el TURBO que la corta y el Rey que se planta en la mitad con su segunda cara los leí en el código, no los vi. En las secuencias de rey-segunda el Caudillo ya está en su segunda cara.

## Defectos menores

- El foco no es el mismo en todo el juego. En «Lo que llevás» es un contorno blanco (piezas), en la bandeja del HUD un marco dorado y en DEVOLVER un doble filo hueso, sin aro celeste ni ▼. El canal celeste de mesa.css:4055 no incluye .piezas, .hud ni el Altar.
- DEVOLVER sigue midiendo 45 px de alto (altar-devolver.medidas), la única diana de 1280 por debajo de 48 (bloque del Altar en pantallas.css).
- En el resumen, el nivel de la Bendición es «III» en palitos de 16 px pegados al último ícono, y parece un glifo de pausa (camino.ts:1251, pantallas.css:3863). Mejor «NV 3» o una cifra.
- En rey-segunda-10, la placa «TAJO DE REVÉS 21 ×2 = 42» tapa unos 300 ms la pista de botones y el nombre del Rey (mesa.css:4675).
- En postas-golpe-03, la Ginebra conserva el aro celeste durante el conteo del golpe, como si el foco siguiera ahí (nav.ts, el foco no se suelta al golpear).

## Qué haría en la próxima versión

**«18 en serio».**
1. Una puerta dura de QA que falle si en 1280 hay texto de menos de 18 px fuera de la mesa, o de menos de 16 px dentro. Esta versión la habría reprobado en cuatro pantallas.
2. Que TAPA_NUNCA proteja también al enemigo, TE PEGA, la cuenta y la mano. Y que las ayudas largas (la bandeja) tengan una versión corta con mando, con el resto en RT.
3. Un solo foco celeste con ▼ en todo el juego, incluidos el HUD, «Lo que llevás» y el Altar, y la puerta getComputedStyle que propuse en la 0.23.
4. Y siempre es DESCARTAR. El dial va en R3, con su glifo grande en la caja prisma, y con un estado de QA mesa-maximo.
5. Una foto de QA con una pieza del resumen enfocada y su ayuda abierta, para verlo y no creerlo.

Nada de esto toca la Constitución.
