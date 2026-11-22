```json
{
  "jurado": "jurado-juice",
  "version": "0.22.0",
  "puntajes": { "claridad": 7.8, "diversion": 8.0, "estetica": 8.0, "veredicto": 7.9 },
  "defectos": [
    {
      "prioridad": "P0",
      "pantalla": "Botín / ELEGÍ UNA · el jackpot de una Evolución y su ficha en el HUD",
      "ventana": "todas (visto en 1280x800 y 390x844)",
      "archivo": "src/client/evolucion.ts:24 (el icono del jackpot es `pxAmuleto(de, 'prisma')`, el mismo sprite del Amuleto viejo) · src/client/hud.ts:56 (la ficha evolucionada también) · src/client/estilos/pantallas.css:3386-3444 (un fundido y dos latidos del 6 %) · src/client/pantallas/camino.ts:471-475 (suena 'oro' y el Bufón dice su frase genérica de `VOZ.elige` sobre el jackpot) · src/client/ritmo.ts:34 y evolucion.ts:67 (el próximo clic lo corta)",
      "que": "«DESPIERTA PONCHO DEL CACIQUE» y abajo «GARROTE DEL CACIQUE», pero el dibujo es el mismo Poncho de antes con un filete de cuatro colores. No hay un antes y un después: el Amuleto no se transforma en el sprite, nada lo empuja hacia el HUD y la mesa no reacciona. Detrás, el Bufón dice «Agarrá lo tuyo. Lo mío ya lo agarré.», como en cualquier botín (evolucion-jackpot en 1280 y 390). En el HUD, la ficha evolucionada se distingue de las otras solo por un borde de 2 px (hud-evolucion).",
      "por_que": "Es el titular del Salto 2 y el premio de toda una construcción. Y en el Botín se juega a clics seguidos: el segundo clic, el que el jugador da para seguir, corta el jackpot en el acto por TURBO. Mucha gente no lo va a ver nunca y, cuando lo vea, no va a saber qué cambió, porque el dibujo es el mismo. En *Balatro*, un comodín legendario lo nota cualquiera.",
      "propuesta": "Un sprite propio para cada una de las Evoluciones (el Garrote no es un Poncho). El jackpot en tres tiempos: el icono viejo tiembla y se raja con `quiebre`, un fogonazo de oro y el nuevo aparece a doble escala. Después la ficha vuela a su hueco del HUD y se queda latiendo hasta el próximo golpe. Que los primeros 400 ms no se puedan cortar (solo esos), y que el Bufón tenga una línea `VOZ.evoluciona` en lugar de la de `elige`."
    },
    {
      "prioridad": "P1",
      "pantalla": "La Cábala Negra (coser / trasplantar) y el Tesoro del Botín",
      "ventana": "todas",
      "archivo": "src/client/pantallas/camino.ts:1061-1071 (`coser`: `sonar('oro')` y `repintar()`, nada más) · camino.ts:471 (abrir un Tesoro suena 'oro', igual que cualquier pieza) · camino.ts:318 (el cofre del Mapa es un sello de 30 px pegado al nodo)",
      "que": "Coser dos naipes en uno, el pacto más oscuro del juego, se resuelve con el tintineo de una moneda y la bandeja que se repinta: no se ven los dos naipes juntándose y la aguja que promete el Bufón nunca aparece (cabala-negra en 1280 y 390). En el Tesoro, el candado y el cofre son iconos de rótulo (botin-tesoro): al pagar no salta ningún cerrojo ni se abre ninguna tapa. En el Mapa, el cofre es un sello de 30 px junto a una calavera y se pierde entre los escudos de Inmune (mapa-tesoro).",
      "por_que": "Son dos de las cuatro novedades del Salto y su remate es el mismo que comprar un Chiche. Una decisión que te cuesta un naipe o 27 de oro pide un momento que la pague: es el «cha-ching» de *Balatro* al abrir un sobre.",
      "propuesta": "Coser: los dos naipes salen de la grilla hacia el centro, una puntada negra los cruza en tres pasos con un sonido de 'grieta' agudo, y queda uno solo con su suma en grande y un `destello`. El Bufón se ríe con `gestoBufon('risa')`. Tesoro: al pagar, el candado salta en dos mitades (`partirNaipe` sobre el icono) y la tapa se abre con un puñado de `monedas` hacia afuera. En el Mapa, el cofre al doble y con un brillo que respira."
    },
    {
      "prioridad": "P1",
      "pantalla": "mesa · el Tajo de revés del Caudillo cuando te pega",
      "ventana": "390x844 (grave) y 1280x800",
      "archivo": "src/client/pantallas/mesa.ts:1413 (`rotuloRey` con «24 ×2 = 48») · mesa.ts:1105-1126 (sus alternativas solo suben, bajan o corren el rótulo dentro de la cara del Rey) · mesa.ts:538-550 (placa TE PEGA)",
      "que": "En el instante en que el Rey te embiste, el 48 está escrito cuatro veces: el rótulo «TAJO DE REVÉS 24 ×2 = 48», la placa «TE PEGA 48 / 24 ×2», el chip de la cuenta «TE PEGA 48 (24 ×2)» y la ayuda de la derecha. El rótulo tapa la cara del Rey y la palabra «TE» de la placa, y el «230» sigue grande encima del naipe (1280-rey-tajo-11 y 12). En el teléfono es un montón de capas: el 230, el rótulo, la placa, la barra «TAJO DE REVÉS» y el bocadillo del Bufón, todo en 200 px (390-rey-tajo-11 y 12).",
      "por_que": "Es el golpe más fuerte que te puede dar un Rey. Se tiene que ver el filo y la cara del que te lo da, no una pila de carteles con el mismo número.",
      "propuesta": "Cuando llega el `contra` del Tajo, el número de tu golpe se apaga con `limpiarNumeros()`, igual que en la segunda cara. El rótulo va por debajo de la barra de Vida del Rey, nunca sobre su cara. La placa TE PEGA solo late (no repite la fórmula), y en el teléfono el rótulo reemplaza a la placa en lugar de sumarse a ella."
    }
  ],
  "aciertos": [
    "Mi P0 de la 0.21 quedó resuelto en 1280: el «−48» nace apoyado sobre la caja de VIDA, centrado y bien grande, con el retrato en mueca, las chispas y el corazón que se rompe (1280-rey-tajo-12). El director ahora mide la distancia a su dueño (mesa.ts:862-875).",
    "El Dado en el teléfono deja su ficha «MULTI +3» a la vista sobre la regla del paño (390-chiche-usa-03 y 05), y cada Chiche tiene su propia voz: traqueteo de cubilete, raspón de fósforo, trago de ginebra (audio.ts:38-42, leído en código, no oído).",
    "En la caída del Rey, el paño se retira y la mesa queda para el naipe que se raja en dos con su frase. El «+23» de oro nace pegado a ORO, con la pila de monedas trepando (1280-rey-cae-06 y 09, botin-brota-10).",
    "El paño en fila propia lee mejor: el fieltro verde con tres Postas cosidas y el «×2» del Medio sobre el naipe (1280-golpe-02 y 05). El crítico estalla en el MULTI, del 5 al 10 en oro y con su sello (rey-tajo-08).",
    "Rendimiento impecable: 133–134 fps en las cuatro ventanas, 0 % de cuadros largos y un peor cuadro de 15 ms bajo golpes a 1366. Con el precalentado del sello del Bufón y de la Forja Brava, el primer golpe ya no tropieza."
  ],
  "capturas_vistas": [
    "jurado/secuencias/1280-golpe-02, 05, 08, 09; 1280-postas-golpe-09, 10; 390-postas-golpe-10",
    "jurado/secuencias/1280-rey-tajo-04, 08, 10, 11, 12; 390-rey-tajo-04, 10, 11, 12",
    "jurado/secuencias/1280-rey-segunda-04, 09; 390-rey-segunda-05, 11",
    "jurado/secuencias/1280-rey-cae-04, 06, 09; 390-rey-cae-08; 1280-rey-irrumpe-03",
    "jurado/secuencias/390-chiche-usa-03, 05; 1280-botin-brota-05, 10; 1280-mapa-paso-03",
    "visual-qa/1280x800/evolucion-jackpot, hud-evolucion, oferta-evoluciona, forja-brava, cabala, cabala-negra, mapa-tesoro, botin-tesoro, mesa-postas-arrastre",
    "visual-qa/390x844/evolucion-jackpot, forja-brava, cabala-negra, mapa-tesoro, mesa, mesa-escudo",
    "mirar/1280-mesa-grito, 1280-rey-cae, 390-mesa-grito",
    "jurado/fps.txt"
  ]
}
```

## Veredicto

La 0.22.0 arregla todo lo que le pedí al turno. El «−N» va pegado a la Vida, el Dado del teléfono se lee, el paño deja sola a la caída del Rey y el oro nace en ORO. El paño en fila propia es lo mejor que le pasó a la mesa en varias versiones. Lo que flojea es justo lo nuevo: las cuatro novedades del Salto 2 llegan con la regla hecha y el golpe sin hacer. La Evolución, que se vende como jackpot, es un cartel con el mismo dibujo del Amuleto viejo, y el siguiente clic la borra. Coser en la Cábala Negra suena a moneda y nada más. El Tesoro no se abre, y la tercera pasada de la Forja espera los mismos 820 ms que las otras dos. El juego tiene más que decidir y lo mismo que sentir. Diversión 8,0 (pesa doble), veredicto 7,9.

**Contra la 0.21.0.** Resueltos: el P0 del golpe recibido lejos de VIDA (en 1280; en el teléfono no hay ninguna ráfaga que lo filme), el P1 del Dado en el teléfono con voz propia por Chiche y el P2 del paño en el remate. Siguen dos menores: los «+N» clavados en el naipe y la ráfaga de `rey-irrumpe`, que filma a la Sota.

## Defectos menores

- La tercera pasada de la Forja Brava tiene el mismo suspenso (820 ms, 'suspenso') que la primera, cuando le corresponde uno que crezca pasada a pasada, con sacudida y un frenado de golpe al salir: `src/client/pantallas/camino.ts:899-900`.
- En el teléfono, el «−N» se apoya en `rv.top − alto − 12` y cae sobre la fila GOLPEAR / DESCARTAR (leído en código, no visto): `mesa.ts:872-875`. Además, ninguna ráfaga de 390 filma un contragolpe que llegue a la Vida: `scripts/secuencias.ts`.
- El grito del canto («¡ESCOBA!») tapa el botón GOLPEAR en el teléfono («STR…») y también en 1280 queda sobre él (mirar/390-mesa-grito): `src/client/hud.ts:305` (`ubicarGrito`).
- La regla «Medio: pega doble · Escalón +2» queda flotando en la mesa vacía durante la caída y el cobro (rey-cae-09, botin-brota-10): `src/client/mano.ts:157`.
- `rey-irrumpe` sigue filmando a la Sota de la Corte y no al Rey: `src/client/qa.ts:150-152`.

## Qué haría en la próxima versión

Un paquete de «cada novedad con su momento», medido con secuencias propias en la QA: `evolucion`, `coser`, `cofre` y `forja-brava`, cada una a 1280 y a 390. La Evolución, con sprites propios, una transformación que no se puede cortar en sus primeros 400 ms, la ficha que vuela al HUD y la voz del Bufón. Coser, con dos naipes que se juntan bajo una puntada negra y su suma en grande. El Tesoro, con un candado que salta y una tapa que escupe monedas. La Forja, con un suspenso que crece pasada a pasada y un martillazo con hitstop en la tercera. Además, el Tajo de revés limpio: el número de tu golpe se apaga cuando el Rey embiste y el 48 aparece una sola vez. Con eso el Salto 2 se sentiría además de leerse, y el veredicto pasaría el 8,3.
