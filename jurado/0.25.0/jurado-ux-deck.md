```json
{
  "jurado": "jurado-ux-deck",
  "version": "0.25.0",
  "puntajes": { "claridad": 8.4, "diversion": 8.5, "estetica": 8.6, "veredicto": 8.4 },
  "defectos": [
    { "prioridad": "P1", "pantalla": "Mesa con Perfora y el dial a la vista (mesa-dejalo-justo, mesa-pega-todo)", "ventana": "1280x800, 1366x768 y EN", "archivo": "src/client/pantallas/mesa.ts:486 (la cuenta dice «SOBRAN» = aVida − vidaE) y mesa.ts:430-435 (el dial usa q.sobra, que ya viene multiplicado por el Facón)", "que": "La misma sobra aparece con dos cifras distintas y nada las une. La cuenta dice «LO ABATÍS · SOBRAN 24» y, cuarenta píxeles más abajo, la caja del dial dice «DEJALO JUSTO · pierde 72 que pasaban». En el estado contrario dice «72 pasan al siguiente» y la cuenta dice ¡EXACTO!. El ×3 del Facón Maldito no figura en ningún lado: ni en el chip ni en el dial.", "por_que": "El dial es una decisión de costo contra beneficio («+3 de oro y +1 Multi» o «72 al Caballo»). En la Deck no podés pasar el puntero para ver la ayuda. Cruzás dos números que no cuadran y desconfiás del dial justo en la versión que lo vuelve central.", "propuesta": "Un solo número en los dos lugares, con su multiplicador a la vista. En la cuenta: «SOBRAN 24 → 72 AL SIGUIENTE» (o «24 ×3»). En el dial: «pierde 72 (24 ×3) que pasaban». Que la QA falle si el número de SOBRAN no aparece en la caja del dial." },
    { "prioridad": "P1", "pantalla": "Mesa: el chip de la maldición en la cuenta (mesa-maldicion)", "ventana": "1280x800", "archivo": "src/client/pantallas/mesa.ts:529-530 (el span .chip.c-maldicion no tiene tabindex=\"0\" ni la clase mirable); nav.ts:9 (FOCO solo toma button y [tabindex=\"0\"])", "que": "La novedad de la versión cobra en la mesa con un chip que dice «−3 DE VIDA» y lleva el ícono de la Evolución a unos 24 px. No dice MALDICIÓN ni nombra la pieza. La regla («el Facón corta si no abate») está en una ayuda que solo se abre con el puntero, porque la cruceta no llega al chip. INMUNE, TE PEGA y el rasgo del Rey sí llegan: tienen tabindex.", "por_que": "Con mando no hay manera de saber por qué vas a perder 3 de Vida además del TE PEGA 19 que está al lado. La maldición está pensada para leerse como costo, y en la Deck solo se ve como un número rojo de más.", "propuesta": "Darle al chip tabindex=\"0\" y la clase mirable, como a los e-sello. Que el chip diga el nombre corto: «FACÓN −3 VIDA», o al menos el rótulo MALDICIÓN en carmesí, como en la oferta. Y que la primera vez que cobra, el Bufón lo diga en un renglón, como ya hace con Mesa limpia." },
    { "prioridad": "P2", "pantalla": "Mesa: el sello del Rey que se planta en la mitad (secuencia rey-segunda)", "ventana": "1280x800", "archivo": "src/client/estilos/mesa.css:4282-4285 (.sello-planta .sp-pierde a 14 px fijos); mesa.ts:1562-1570 (dónde se pone el sello)", "que": "En rey-segunda-16, «SE PLANTA EN LA MITAD» se lee bien, pero la cifra que importa, «100 SE PIERDEN», está a 14 px fijos. Es el único texto del juego por debajo de 16 y además es una cifra de juego. El sello se posa sobre la barra de Vida del Rey (no se ve el 294/390) y sobre la ficha de CUERO DEL CACIQUE.", "por_que": "Es el momento en que entendés por qué tu golpe enorme no mató al Rey. A 40 cm, un «100» de 14 px en hueso apagado no se lee, y tapar la Vida del Rey borra justo la otra mitad de la explicación.", "propuesta": "Llevar .sp-pierde a var(--fr) (24 px a 1280) y pintar el número en blanco: «100 SE PIERDEN». Poner el sello debajo de la barra de Vida, nunca encima, y sumar .sello-planta a las reglas de tip-tapa de la QA." }
  ],
  "aciertos": [
    "Mi P2 de la 0.24 quedó resuelto de raíz. La Y es DESCARTAR siempre (nav.ts:230-231), el dial va en R3 con su glifo en la caja prisma y ahora hay captura de PEGÁ CON TODO. La placa ×2 ya no tapa el rótulo COMODÍN.",
    "La letra de lo nuevo está en 18 px. Todas las pantallas que no son la mesa miden 18 o más a 1280 y a 1366 (fogon-mutaciones, forja-brava-eleccion, resumen-*, oferta-evoluciona). La mesa tiene un mínimo de 16, que es solo la regla del paño. Los nombres de los Chiches y «cómo se arma» ya están en 18.",
    "Las ayudas ya no tapan al enemigo, el TE PEGA ni la cuenta (ui.ts:220). La ayuda del Fósforo cae al costado del paño, sin pisar nada. La de la bandeja es corta y trae cada maldición en su bloque carmesí.",
    "La Forja Brava se lee como apuesta, de arriba a abajo: «APUESTA: 50 % SE QUEMA», lo que ya tiene el naipe y dos cartas con el costo del Doble Filo aparte. En la secuencia, el naipe baja a una fogata que crece y, si se quema, dice «SE QUEMÓ. LA PERDISTE.» sin vueltas.",
    "MALDICIÓN dice lo mismo en la oferta, el jackpot, «Lo que llevás» y la bandeja: un rótulo carmesí y la regla al lado. Mesa limpia trae su rótulo sobre el ESCUDO y el Bufón la presenta. DEVOLVER mide 48 px y la Bendición dice «nivel 2»."
  ],
  "capturas_vistas": [
    "visual-qa/1280x800/mesa-maldicion.png", "visual-qa/1280x800/mesa-dejalo-justo.png", "visual-qa/1280x800/mesa-pega-todo.png", "visual-qa/1280x800/hud-evolucion-foco.png",
    "visual-qa/1280x800/mesa-garrote.png", "visual-qa/1280x800/mesa-limpia.png", "visual-qa/1280x800/mesa-mando.png", "visual-qa/1280x800/forja-brava-eleccion.png",
    "visual-qa/1280x800/forja-brava.png", "visual-qa/1280x800/resumen-victoria.png", "visual-qa/1280x800/resumen-derrota.png", "visual-qa/1280x800/oferta-evoluciona.png",
    "visual-qa/1280x800/evolucion-jackpot.png", "visual-qa/1280x800/piezas.png", "visual-qa/1280x800/elegi-amuleto.png", "visual-qa/1280x800/jugadas.png",
    "visual-qa/1280x800/altar-devolver.png", "visual-qa/1280x800/mapa-mando.png", "visual-qa/1366x768/mesa-dejalo-justo.png", "visual-qa/1366x768/hud-evolucion-foco.png",
    "visual-qa-en/1280x800/mesa-pega-todo.png",
    "jurado/secuencias/1280-golpe-04.png", "jurado/secuencias/1280-golpe-08.png", "jurado/secuencias/1280-rey-segunda-04.png", "jurado/secuencias/1280-rey-segunda-10.png",
    "jurado/secuencias/1280-rey-segunda-14.png", "jurado/secuencias/1280-rey-segunda-16.png", "jurado/secuencias/1280-rey-segunda-18.png", "jurado/secuencias/1280-rey-segunda-22.png",
    "jurado/secuencias/1280-rey-tajo-05.png", "jurado/secuencias/1280-chiche-usa-03.png", "jurado/secuencias/1280-postas-golpe-03.png", "jurado/secuencias/1280-mando-07.png",
    "jurado/secuencias/1280-mando-15.png", "jurado/secuencias/1280-mando-elige-03.png",
    "mirar/1280-fogon-suspenso-brava-llama.png", "mirar/1280-forja-brava-despues.png",
    "medidas.json de todas las pantallas de 1280x800 y 1366x768 (node)"
  ]
}
```

## Veredicto

La 0.25.0 es la primera versión en la que mi lista de la anterior se cierra casi entera. La Y hace siempre lo mismo, la letra nueva no baja de 18 fuera de la mesa y las ayudas dejaron de tapar al rival. **No hay P0.** Lo que queda nace de lo nuevo. El dial y la maldición cuentan el costo con números que la Deck no deja verificar: 24 contra 72, sin el ×3 a la vista, y un «−3 DE VIDA» al que la cruceta no llega. La recomendaría con un pero chico, y es la primera vez que la nota sube por claridad y no por espectáculo.

**Seguimiento de la 0.24:**
- **P1 letra de 16 px:** resuelto. Los medidas.json dan 18 o más en toda pantalla que no es la mesa y un mínimo de 16 en la mesa (solo la regla del paño, mesa.css:545).
- **P1 ayudas sobre el enemigo y la cuenta:** resuelto en lo que pedí. El efecto secundario lo anoto abajo.
- **P2 Y que cambiaba de función:** resuelto, y la placa ×2 ya no tapa COMODÍN.
- **Menores:** DEVOLVER a 48 px y el «III» que ahora es «nivel N»: resueltos. Siguen tres. El foco no es uno solo (contorno blanco en piezas, marco dorado en la bandeja, doble filo hueso en DEVOLVER). El 38 del Tajo aparece dos veces (rey-tajo-05). El aro de foco queda puesto durante el golpe (4 de Espadas en golpe-04, Ginebra en postas-golpe-03).

Aviso: no vi el respiro de unos 600 ms después del golpe grande ni el golpe seco cuando cobra la maldición en el HUD; los leí en el código (mesa.ts:1090-1100). La fogata que crece sí la vi (fogon-suspenso-brava-llama).

## Defectos menores

- La ayuda de la bandeja se fue al otro extremo de la pantalla: arriba a la izquierda, a unos 900 px de la bandeja. Tapa el título del lugar, el globo del Bufón y medio «INMUNE A BASTOS», que no está en TAPA_NUNCA (ui.ts:220). Conviene sumar `.mesa .e-sello` y anclarla sobre la franja vacía de la pista, en el centro.
- La pista fija del paño dice «R3 lo deja justo» aunque el dial esté ofreciendo PEGÁ CON TODO (mano.ts:172, textos.ts:320). El Bufón repite «¡Dejalo en 0 justo…!» cuando ya está justo.
- El verbo del dial va en Silkscreen de 18 px (mesa.css:4601-4604), un tamaño que base.css:88 reconoce que deforma el rótulo. Se ve más chico que «LO ABATÍS». Mejor var(--fr).
- La ayuda del Fósforo con el foco del mando dice «Tocalo o arrastralo al enemigo» (mesa-mando). Con mando debería decir «A lo usa».
- El resultado de la Forja Brava dice dos veces lo mismo: «NAIPE ENTERO x2» y «FORJA BRAVA: EL NAIPE ENTERO VALE DOBLE». Mientras tanto, el Bufón sigue con el saludo genérico del Fogón (forja-brava.png).

## Qué haría en la próxima versión

**«Que el costo se pueda verificar con mando».**
1. Un número por concepto. Que SOBRAN, el dial y la placa de Perfora digan la misma cifra con su multiplicador («24 ×3 = 72»), y una regla de QA que lo compare.
2. Toda cifra que cobra se enfoca con la cruceta: el chip de la maldición, la del Doble Filo y la del sello que se planta. Para eso, una puerta de QA que recorra la cuenta con el mando y falle si un chip con ayuda no tiene tabindex.
3. El piso de 24 px para las cifras en vivo (sellos, placas, «−N»), con la misma puerta de medidas que ya cumple el 18.
4. Un solo foco celeste con ▼ en todo el juego, incluidos «Lo que llevás», la bandeja y el Altar. El foco se suelta al golpear.
5. Que la ayuda de la bandeja quede pegada a lo que explica, con una flecha hacia la bandeja.

Nada de esto toca la Constitución.
