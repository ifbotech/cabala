```json
{
  "jurado": "jurado-ux-movil",
  "version": "0.25.0",
  "puntajes": { "claridad": 8.0, "diversion": 8.2, "estetica": 8.2, "veredicto": 8.0 },
  "defectos": [
    {
      "prioridad": "P0",
      "pantalla": "Mesa al primer toque, con cualquier mano: mesa → mesa-seleccion / 390-postas-golpe-00 (mano de 3) y mesa-mentiroso → mesa-escudo / mesa-escalon / mesa-chispa (mano de 8)",
      "ventana": "390x844",
      "archivo": "src/client/mano.ts:351 (reservaPano = enPosta.some(Boolean): en el teléfono ya no se reserva el paño) + mano.ts:294 (base salta de alto − tapa − h a lp.manoY) + mano.ts:331 (unaFila: con algo apoyado, la mano de 8 pasa a una fila) + src/client/estilos/mesa.css:4742-4749 (alto fijo de 226 px)",
      "que": "La 0.25 cambió el salto de la mano de 8 por uno en todas las manos. Con la mano de 3, en reposo los naipes ocupan y≈505-645. Al primer toque aparece el paño en y≈432-580 y lo que queda baja 82 px, a y≈587, recortado a unos 65 px. El naipe elegido sube al Medio, que está justo encima del naipe del medio de la mano. Si el segundo toque cae donde estaba ese naipe, da en el paño y suelta el que acabás de elegir (mano.ts:686, alternar → quitar). Con la mano de 8 es peor: las dos filas se juntan en una de 7 y cambian todas las x. En mesa-mentiroso el 6 de Bastos está en x 8-100. En mesa-escudo pasa a x≈148, y en su lugar quedan el 2 de Oros y el 2 de Copas.",
      "por_que": "Tocar dos o tres naipes es el gesto de cada turno. Ahora el segundo toque elige otro naipe o deshace el primero, y en el teléfono no hay hover que te avise antes. La QA no lo ve, porque «mesa-quieta» excluye al teléfono (scripts/visual-qa.ts:584, v.w > 700). Contra Balatro móvil, donde la mano no se mueve nunca al elegir, esto se nota en la primera partida.",
      "propuesta": "Regla dura en ≤700: ningún naipe que no elegiste se mueve con un toque. Que la mano conserve su y y su x de reposo, y que lo que cede alto sea el paño, mostrando lo de arriba de cada naipe apoyado con el hv de lugaresPosta, como en la 0.24, en vez de la mano. La mano de 8 conserva sus dos filas con huecos hasta que se golpee o se descarte. Sumar a la QA 390-elige-dos, con la Escoba y con el Mentiroso: comparar la caja de cada naipe no elegido entre el reposo y el primer toque, y fallar si alguno se corre más de 8 px."
    },
    {
      "prioridad": "P1",
      "pantalla": "DEJALO JUSTO / PEGÁ CON TODO con Perfora (mesa-dejalo-justo y mesa-pega-todo, en ES y en EN)",
      "ventana": "390x844",
      "archivo": "src/client/pantallas/mesa.ts:486 (revela = q.aVida − vidaE: «SOBRAN 24») contra mesa.ts:430-435 (pasan = q.sobra, ya multiplicado por el Facón o la Lanza en src/rules/combate.ts:358: «pierde 72 que pasaban») + src/client/textos.ts:333-334",
      "que": "En la misma cuenta, el dial dice «DEJALO JUSTO · +3 de oro · +1 Multi al próximo · pierde 72 que pasaban» y, dos renglones abajo, el chip dice «LO ABATÍS · SOBRAN 24». En EN, «loses the 72 carrying over» junto a «24 OVER». Nada te dice que los 24 se triplican al pasar.",
      "por_que": "El dial es la decisión nueva de la versión y el «qué pierde» es justo lo que tiene que leerse sin dudar. Con dos cifras distintas para el mismo sobrante, el jugador no sabe cuál creer y elige a ciegas, o deja de mirar el dial.",
      "propuesta": "Con Perfora multiplicada, que el chip diga «SOBRAN 24 → PASAN 72» y el dial «pierde los 72 (24 ×3) que pasaban». En EN, «24 OVER → 72 CARRY» y «loses the 72 (24 ×3)». Una sola familia de números en toda la cuenta."
    },
    {
      "prioridad": "P2",
      "pantalla": "La Pulpería (pulperia, pulperia-chiches)",
      "ventana": "390x844",
      "archivo": "src/client/pantallas/camino.ts:726-750 (pantallaPulperia: bandejas sin avisarRollo) + camino.ts:112 (avisarRollo, que ya existe)",
      "que": "La lista de Amuletos se corta bajo SALIR, a mitad del Facón de plata, con su «Suma a Filo» partido. Más abajo quedan los Servicios, entre ellos curarte. No hay flecha de «hay más», a diferencia de JUGADAS, la Cábala Negra y el resumen, que ya la llevan.",
      "por_que": "Curarse es la compra que más te salva una partida, y en el teléfono queda detrás de un gesto que nadie te indica, debajo de un SALIR dorado que invita a irse.",
      "propuesta": "Llamar avisarRollo sobre el cuerpo de la Pulpería, con la misma flecha «hay más ↓» sobre SALIR. En ≤700, subir Servicios arriba de los Amuletos o mostrarlos como una fila compacta bajo los Chiches."
    }
  ],
  "aciertos": [
    "Las Maldiciones se leen como costo en todas partes. La oferta de Evolución lleva el bloque carmesí con MALDICIÓN y «con tu don de Copas»; el jackpot del Garrote se lee de un vistazo; en la cuenta, «−3 DE VIDA» con el ícono de la Evolución y el chip «COPAS → ESCUDO +4» avisan antes de golpear (mesa-maldicion, mesa-garrote).",
    "La Forja Brava ya es una apuesta: «APUESTA: 50 % SE QUEMA · Si sale, el naipe entero vale doble» arriba y en carmesí, YA TIENE como estado, y CUESTA aparte en las cartas de mutación, a todo el ancho y a 48 px (forja-brava-eleccion). El naipe que baja al fuego se ve en el teléfono (390-fogon-suspenso-brava).",
    "En reposo, la mano de 3 se ve entera y grande, a 140 px, sobre la barra del pulgar. El paño con lo apoyado también enseña sus naipes enteros (mesa, mesa-seleccion).",
    "Mi P2 del resumen quedó resuelto: +51 POROTOS arriba, TU ARMADO, «nivel 2» en vez de «II», y «hay más ↓» sobre OTRA MANO YA (resumen-derrota, resumen-victoria, también en EN: «MORE ↓»). El «+11» del oro nace sobre el borde de su caja y ya no tapa la cifra (390-botin-brota-11).",
    "0 recortes, ninguna letra de menos de 14 px y dianas de ≥ 44 px en las 64 capturas de 390. Los «?» y «≡» del mando ya tienen su glifo (mesa-escudo-mando). JUGADAS lleva «Multi ×3 al cantar ¡ESCOBA!» en tres renglones. 134 fps en reposo y en golpes."
  ],
  "capturas_vistas": [
    "visual-qa/390x844: mesa, mesa-exacto, mesa-seleccion, mesa-mentiroso, mesa-escalon, mesa-escudo, mesa-escudo-mando, mesa-chispa, mesa-limpia, mesa-maldicion, mesa-garrote, mesa-pega-todo, mesa-dejalo-justo, mesa-arrastrando, mesa-postas-arrastre, hud-evolucion-foco, oferta-evoluciona, evolucion-jackpot, forja-brava, forja-brava-eleccion, jugadas, mapa-tesoro, cabala-negra, pulperia, pulperia-chiches, resumen-derrota, resumen-derrota-movil, resumen-victoria",
    "visual-qa-en/390x844: mesa-dejalo-justo, resumen-derrota",
    "jurado/secuencias: 390-postas-golpe-00, -02, -05; 390-golpe-00, -05, -09; 390-botin-brota-09, -10, -11; 390-rey-segunda-02, -10, -16, -21, -24; 390-rey-tajo-07 (+ recortes ampliados de -07 y -11)",
    "mirar: 390-fogon-suspenso-brava, 390-fogon-suspenso-brava-llama, 390-forja-brava-despues",
    "todas las medidas.json de 390x844 (resumen por estado); jurado/fps.txt"
  ]
}
```

## Veredicto

La 0.25.0 es la versión que mejor explica sus reglas en el teléfono. Las Maldiciones se leen como precio, la Forja Brava como apuesta y el dial dice qué gana y qué pierde. El resumen, por fin, te pone los Porotos arriba y te avisa que hay más. Pero el teléfono pagó todo eso con lo más básico, que es tocar naipes. Para enseñarlos enteros en reposo, la mano ahora salta al primer toque en todas las manos, no solo en la de 8. Y la de 8 se reordena entera. Claridad, que en mi ficha pesa doble, baja de 8,3 a 8,0. El veredicto queda en 8,0 por el P0.

Alcance: no corrí nada. El salto lo saco de comparar capturas quietas (mesa contra mesa-seleccion, mesa-mentiroso contra mesa-escudo) y de mano.ts:294, :331 y :351. Que el segundo toque suelte la carta del Medio lo deduzco de alternar (mano.ts:686) y de dónde cae el paño, pero no lo vi con un dedo. El respiro de ~600 ms después del golpe grande y la fogata que crece los leí en el código y los commits, no los vi en movimiento.

## Contra mi veredicto de la previa

**Resueltos:** el P2 del resumen (hay más, Porotos arriba y retrato más chico), el P2 del «+N» del oro (ahora nace sobre el borde de su caja), los «?» y «≡» vacíos con el mando, el «II» que parecía pausa y «Multi ×3 al cantar» en cuatro renglones. **Empeoró:** el P1 de la mano de 8. Ya no salta 65 px: ahora salta toda mano y la de 8 cambia de x. **Siguen:** el baúl sobre la calavera del mapa y «TU JUGADA» pegado a «Envido». **No verificado:** la placa TAJO DE REVÉS en el Turno 4 y el «−N» de la vida (este último lo leí en el commit).

## Defectos menores

- **El mapa**: el baúl del Tesoro sigue montado sobre el nodo de la calavera (mapa-tesoro; `src/client/pantallas/mapa.ts`, ubicación del cofre).
- **El Fogón en el teléfono**: la base de la fogata queda bajo SEGUIR. El fuego está en y≈671 y la barra ocupa 650-695 (`src/client/fx/escenas.ts:1292`, fy = 0.795·H; subirlo a ~0.73).
- **El chip forjado**: dice «DOBLE FILO −2 de Vida al jugarlo» pero no lo que da, «+2 de Multi». Se lee como pura pérdida (`src/client/pantallas/camino.ts:876`, mutChip sin MUTACION_GANA).
- **Durante el golpe**: el «+10» del Dado flota sobre el borde de DESCARTAR, en la barra del pulgar (390-golpe-05; `src/client/pantallas/mesa.ts`, el número de la pieza sin ancla en ≤700).
- **En el botín**: el naipe que quedaba en la mano cruza, semitransparente, sobre la caja del Escudo del HUD mientras el enemigo se raja (390-botin-brota-09; `src/client/mano.ts:620`, el corte solo vale con paño).

## Qué haría en la próxima versión

El paquete «el dedo manda»: ningún naipe que no tocaste se mueve. La mano tiene un lugar fijo desde que se reparte hasta que golpeás o descartás. El paño cede alto, mostrando el índice y las primeras pintas de lo apoyado, y el enemigo se achica como ya lo hace. La mano de 8 conserva sus dos filas con huecos. Una QA del teléfono compara cada naipe no elegido entre el reposo y el primer y el segundo toque (≤ 8 px) con la Escoba, el Mentiroso y el Aumento que suma mano, y prueba con un toque real que el segundo nunca suelte al primero. Sumaría una sola familia de cifras para lo que sobra con Perfora y el aviso hay-mas en toda pantalla con rollo (Pulpería, Fogón, Colección), medido por la QA: si hay rollo y no hay aviso, falla. Así el teléfono llegaría a la altura de la claridad de reglas que ya ganó esta versión. La Constitución queda intacta.
