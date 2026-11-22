```json
{
  "jurado": "jurado-ux-movil",
  "version": "0.26.0",
  "puntajes": { "claridad": 8.2, "diversion": 8.3, "estetica": 8.3, "veredicto": 8.1 },
  "defectos": [
    {
      "prioridad": "P0",
      "pantalla": "Mesa al elegir: mesa-escalon (390×844, mano de 8 con Escalera de 3) y mesa → mesa-seleccion, mesa-mentiroso → mesa-escudo (390×664)",
      "ventana": "390x844 y 390x664",
      "archivo": "src/client/mano.ts:273-277 (quieta = hv >= HV_MIN_TEL, con subida = 16 del Escalón en :261) + mano.ts:427-431 (piso de la escena y «la mano cede como en la 0.25») + mano.ts:359 (unaFila) + scripts/visual-qa.ts:590 y :627 (quietaTel = v.h >= 800, solo dos toques)",
      "que": "Mi P0 está resuelto a medias. En 390×844, con uno o dos naipes, la mano ya no se mueve: el 4 de Espadas queda en x 40, y 505 (mesa → mesa-seleccion) y la mano de 8 conserva sus dos filas con huecos (mesa-escudo, mesa-chispa). Pero con el tercer naipe de una Escalera, el Mentiroso vuelve al salto de la 0.25: las dos filas se juntan en una de 5, todo baja de y 405/450 a y 500 y cambian las x (el 6 de Bastos pasa de x 8 a x 75; mesa-escalon). Y en 390×664 no cambió nada: con la mano de 3 el 4 de Espadas baja 68 px (y 337 → 405) y queda cortado bajo GOLPEAR, y la mano de 8 se junta en una fila de 7 al primer toque (390x664 mesa-escudo).",
      "por_que": "390×664 es el alto que deja el navegador de un teléfono de 390 con sus barras a la vista, y el propio proyecto lo tiene como ventana de QA. Ahí juega quien abre el enlace por primera vez. La Escalera con la mano de 8 es la jugada fuerte del Mentiroso, y el tercer toque es justo el que reordena la mano. La QA no lo ve: elige-dos hace dos toques y solo con alto ≥ 800.",
      "propuesta": "Que la regla valga siempre en ≤700: ningún naipe no elegido se mueve, sin excepción por alto. Si no hay lugar, que ceda la cuenta, no la mano: en el teléfono bajo o con Escalón, el desglose se pliega a un renglón («66×6=396 · TE PEGA 19», y se despliega con un toque) y el Escalón del paño se marca con un sello en vez de los 16 px de peldaños. Sumar a la QA «elige-tres» (Escalera con el Mentiroso) y correr elige-dos también en 390×664."
    },
    {
      "prioridad": "P1",
      "pantalla": "ELEGÍ UN AMULETO / oferta con Evolución (elegi-amuleto, oferta-evoluciona)",
      "ventana": "390x844",
      "archivo": "src/client/pantallas/camino.ts:424-425 (SALTAR al pie, después de las opciones) + camino.ts:481-492 (modalOferta sin aviso de rollo; avisarRollo de :112 busca .rollo/.panel y acá no hay)",
      "que": "La tercera opción se corta bajo el HUD. En elegi-amuleto, del Cofre del Caudal se ve la regla de su Evolución, pero la MALDICIÓN queda partida al borde («cada descarte…»). En oferta-evoluciona el corte cae en EVOLUCIONA. SALTAR no se ve, y no hay «hay más ↓», cuando la Pulpería y el resumen ya lo llevan.",
      "por_que": "La 0.25 y la 0.26 pusieron la Maldición como el precio que se lee antes de elegir. En el teléfono, el precio de la tercera opción es justo lo que queda escondido, y saltar la oferta (oro, según B.botin.saltar) depende de un gesto que nada te indica.",
      "propuesta": "Darle a la oferta el mismo hay-mas (flecha sobre el HUD y último renglón esfumado). En ≤700, SALTAR arriba, en el renglón del título, como ya hace DEJAR EL COFRE desde la 0.23 (camino.ts:406). Que la QA falle si un .opcion termina bajo el HUD sin aviso."
    },
    {
      "prioridad": "P2",
      "pantalla": "Contragolpe y maldición del Garrote (390-contragolpe-09/-10, 390-maldicion-13)",
      "ventana": "390x844",
      "archivo": "src/client/fx/director.ts:28 (los botones son zona prohibida solo con :not(:disabled))",
      "que": "El «−19» ya no pisa la Vida, pero cae sobre GOLPEAR (tapa la G) y el «−4»/«−5» del Escudo sobre «−3 oro» de DESCARTAR. En -10 ya es Turno 2, con la mano nueva repartida, y los dos números siguen encima de los botones que hay que tocar.",
      "por_que": "Mientras vuela están apagados y el director los deja libres, pero la mano nueva llega antes de que se vayan. El pulgar va a GOLPEAR y encuentra un número rojo encima. Es menor que antes, pero se repite en cada turno que te pegan.",
      "propuesta": "En ≤700, que .botones sea zona prohibida aunque esté apagado, y que el «−N» busque lugar hacia arriba (sobre la mano, a la izquierda de la Vida) o se apague antes de que GOLPEAR se encienda."
    }
  ],
  "aciertos": [
    "En 390×844 la mano de 3 y la mano de 8 no se mueven con uno o dos toques: el 4 de Espadas queda clavado en x 40 (mesa-seleccion, mesa-garrote, mesa-exacto, postas-golpe-03/-07). El Mentiroso conserva sus dos filas con el hueco de lo que subió al paño (mesa-escudo, mesa-chispa, mesa-chinchon). El paño cede alto y lo apoyado igual muestra su índice.",
    "Mi P1 de Perfora quedó resuelto con una sola familia de cifras: «LO ABATÍS · 24 ×3 = 72 PASAN», y el dial ya no repite lo que se pierde («DEJALO JUSTO +3 de oro · +1 Multi al próximo»; mesa-dejalo-justo).",
    "La Forja Brava es una cumbre de verdad en el teléfono: el panel se pliega, el naipe baja entero a la fogata, la llama lo envuelve y el ×2 o el naipe partido se leen a un brazo de distancia (390-forja-brava-x2, -quema). La oferta pone la APUESTA arriba y DOBLE FILO dice lo que da y lo que CUESTA.",
    "La mesa cuenta las reglas nuevas sin agregar ruido: «−5 DE ESCUDO» con el ícono del Garrote, «DESCARTAR ∞ −3 oro» con el Sol y «NO TE PEGA ¡CHINCHÓN!» en la placa. La Pulpería avisa «HAY MÁS ↓» sobre SALIR.",
    "0 recortes, ninguna letra de menos de 14 px y dianas de ≥ 44 px en todas las medidas de 390×844 y 390×664. El arrastre marca SOLTÁ ACÁ sobre el enemigo y DESCARTAR como destino, y la mano no se mueve mientras arrastrás (mesa-arrastrando)."
  ],
  "capturas_vistas": [
    "visual-qa/390x844: mesa, mesa-seleccion, mesa-mentiroso, mesa-escudo, mesa-chispa, mesa-escalon, mesa-chinchon, mesa-garrote, mesa-dejalo-justo, mesa-exacto, mesa-sol, mesa-arrastrando, mesa-postas-arrastre, pulperia, mapa-tesoro, oferta-evoluciona, elegi-amuleto, resumen-derrota",
    "visual-qa/390x664: mesa, mesa-seleccion, mesa-mentiroso, mesa-escudo",
    "mirar: 390-forja-brava-elegir, 390-fogon-suspenso-brava-llama, 390-forja-brava-x2, 390-forja-brava-quema",
    "jurado/secuencias: 390-postas-golpe-00, -03, -07, -10; 390-rey-tajo-03, -07, -10, -12; 390-contragolpe-06, -09, -10, -12; 390-maldicion-08, -13; 390-botin-brota-09; 390-golpe-05; 390-rey-irrumpe-06; 390-chiche-usa-04",
    "todas las medidas.json de 390x844 y 390x664; visual-qa/informe.json (corrida parcial de 33 estados, 0 fallos en 390)"
  ]
}
```

## Veredicto

La 0.26 hizo lo que pedí en el caso que pedí. En 390×844, uno o dos toques ya no mueven ningún naipe, la mano de 8 conserva sus filas y hay una QA con toques de verdad. El dial, Perfora, la Pulpería y la Forja Brava quedaron claros en el teléfono. Claridad sube de 8,0 a 8,2, y no más, porque la regla de «el dedo manda» tiene dos excepciones escritas en el código. Con el Escalón (la Escalera del Mentiroso) y en el teléfono bajo, la mano cede como en la 0.25. El veredicto queda en 8,1.

Alcance: no corrí nada. El salto lo saco de comparar capturas quietas (mesa-mentiroso contra mesa-escalon, y 390x664 mesa contra mesa-seleccion) y de mano.ts:261-281 y :427-431. Que 390×664 sea el alto del navegador con sus barras es mi lectura del tamaño y de que el proyecto lo use como ventana. Sonido y tiempos, leídos en el código, no vistos.

## Contra mi veredicto de la previa

**Resueltos:** el P0 en 390×844 con uno o dos toques, el P1 de Perfora (una sola cuenta: 24 ×3 = 72), el P2 de la Pulpería (hay más ↓), el chip del Doble Filo (dice lo que da), la fogata bajo SEGUIR y el «+10» sobre DESCARTAR (ahora vuela sobre el HUD). **Siguen:** el P0 con Escalón en la mano de 8 y en todo 390×664, el baúl sobre la calavera del mapa y «TU JUGADA» pegado a «Envido». **Casi:** el naipe que cruza el HUD en el botín ahora lo roza unos 7 px (390-botin-brota-09).

## Defectos menores

- **El botón GOLPEAR cambia de lugar según el Mazo.** Con el Engaño va a todo el ancho en y 600, y sin él va a la mitad izquierda en y 655. La memoria del pulgar se rompe al cambiar de Mazo (`src/client/estilos/mesa.css:1688-1697`).
- **En 390×664 el TE PEGA tapa la cara del enemigo** y pierde su rótulo (390x664 mesa, mesa-escudo). La columna propia solo existe desde 741 de alto (`src/client/estilos/mesa.css:4831`).
- **En el mapa**, el baúl del Tesoro sigue montado sobre el nodo de la calavera (mapa-tesoro; `src/client/pantallas/camino.ts:328`, .nodo-tesoro).
- **En el suspenso de la Forja Brava**, el Bufón sigue diciendo «Elegí la mutación y rezá» cuando ya elegiste (390-forja-brava-x2; `src/client/textos.ts:363`, cambiar a otra línea al plegar el panel).
- **En el resumen**, «TU JUGADA» sigue pegado a «Envido», sin espacio (resumen-derrota; `src/client/pantallas/camino.ts:1349`, .fin-jugada).

## Qué haría en la próxima versión

Terminaría «el dedo manda» como regla sin excepciones en ≤700: ningún naipe no elegido se mueve, con cualquier alto y cualquier jugada. Para conseguir el alto, que ceda la cuenta y no la mano. En el teléfono, el desglose va plegado en un renglón (total, TE PEGA y LE QUEDAN) y se abre con un toque, como la bandeja de Amuletos. El Escalón se marca con un sello en lugar de peldaños, y en el teléfono bajo el enemigo pasa a un retrato horizontal. La QA del dedo corre en 390×844 y en 390×664 con tres jugadas: un toque y otro, una Escalera de tres con el Mentiroso y descartar después de elegir. Que falle si algo se corre más de 8 px. Fijaría GOLPEAR en el mismo lugar para los cinco Mazos. Y daría hay-mas a toda pantalla con rollo, la oferta incluida, con SALTAR arriba. La Constitución queda intacta.
