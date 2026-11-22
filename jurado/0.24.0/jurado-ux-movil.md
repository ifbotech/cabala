```json
{
  "jurado": "jurado-ux-movil",
  "version": "0.24.0",
  "puntajes": { "claridad": 8.3, "diversion": 8.1, "estetica": 8.1, "veredicto": 8.2 },
  "defectos": [
    {
      "prioridad": "P1",
      "pantalla": "mesa con mano de 8 (Mentiroso, o cualquier Mazo con el Aumento que suma mano): mesa-mentiroso → mesa-escalon / mesa-escudo",
      "ventana": "390x844",
      "archivo": "src/client/mano.ts:342 (reservaPano: en el teléfono reserva el paño solo si entraEnFila(naipes.length); con 8 naipes da false) + mano.ts:326-329 (pie = lp.manoY + DIANA − 2 solo con conPano)",
      "que": "El arreglo de la 0.24 cumple a medias. Ahora, al elegir, ningún naipe cambia de fila y cada uno deja su hueco: en mesa-escalon, el 2 de Oros se queda solo en la fila de atrás, con los huecos del 2, el 3 y el 4. Pero en reposo la mano de 8 sigue sin paño: la fila de atrás empieza en y≈420, justo bajo la regla. Con el primer toque aparece el paño, y las dos filas bajan juntas unos 65 px, a y≈485. La fila de adelante pasa de mostrar 133 px a mostrar 65.",
      "por_que": "El segundo toque de cada turno cae donde estaba la mano, que ya no está ahí: el dedo da en el paño o en el desglose. El Mentiroso es el Mazo de las combinaciones largas (Escalón, Chispa, dos Comodines) y lo sufre en cada turno. Es el único salto de la mano que queda en el teléfono.",
      "propuesta": "En ≤700, reservar el paño siempre, también con 8 naipes: reservaPano = enPosta.some(Boolean) || innerWidth <= 700. En reposo, que la mano de 8 ocupe ya la posición que tiene en mesa-escalon: la regla arriba del paño apagado, la franja de atrás de 46 px y la de adelante de 65. Sumar a la QA una secuencia 390-arma-escalon con el Mentiroso que falle si algún naipe de la mano se corre más de 8 px entre el reposo y el primer toque."
    },
    {
      "prioridad": "P2",
      "pantalla": "Resumen del final (fin-derrota / resumen-derrota contra resumen-derrota-movil; igual en EN)",
      "ventana": "390x844",
      "archivo": "src/client/estilos/pantallas.css:4238-4249 (.fin-cuadro con overflow-y:auto pero sin aviso) + src/client/pantallas/camino.ts:112-120 (avisarRollo, que solo atiende a .velo/.rollo) y camino.ts:1340 (.fin-porotos al pie del panel)",
      "que": "El solape quedó arreglado: el cuadro se desliza y los botones ya no tapan nada (resumen-derrota-movil, 0 solapes). Pero en reposo el corte cae a mitad de «le quedaba 50%» y no hay flecha de «hay más», a diferencia de JUGADAS y de la Cábala Negra. PRÓXIMO RÉCORD, ESTA PARTIDA contra TU MEJOR y +55 POROTOS quedan abajo, detrás de un gesto que nadie te indica. Arriba, el retrato partido y la Corte se llevan unos 300 px.",
      "por_que": "El récord por batir y los Porotos para el Altar son justo lo que te hace tocar OTRA MANO YA. Y en el teléfono, quien no desliza no los ve nunca.",
      "propuesta": "Darle a .fin-cuadro el mismo aviso hay-mas, generalizando avisarRollo para que acepte cualquier contenedor con rollo. En ≤700, subir +N POROTOS y la línea del récord («819 / tu mejor 1284») a la primera capa, junto a MEJOR GOLPE, y achicar el retrato partido a --k:1 o ponerlo al costado del título."
    },
    {
      "prioridad": "P2",
      "pantalla": "El «+N» del oro y el «−N» de la vida en el HUD (390-botin-brota-10/11, 390-rey-segunda-11/12)",
      "ventana": "390x844",
      "archivo": "src/client/pantallas/mesa.ts:117-120 (nacerEnDueno: en ≤700 lo centra adentro de la caja) + mesa.ts:1678 (+N del oro, a escala 1 sobre ca.x) + mesa.ts:948 y :1008 (−N de la vida)",
      "que": "Ya no caen sobre GOLPEAR ni sobre DESCARTAR, pero ahora nacen encima de la cifra que explican. El «+10» del oro mide unos 78 px en una caja de 57: tapa el 48 que sube contando y se mete en la caja del Mazo, así que en 390-botin-brota-10 no se lee ni el oro ni el 36. El «−42» del Tajo de revés se pega al 35 de la vida, y se lee «−42 35/81».",
      "por_que": "Es el momento de cobrar. La cifra que sube moneda a moneda, con su tintín, es el premio, y el número que la anuncia la tapa justo mientras sube.",
      "propuesta": "En ≤700, que el +N/−N nazca pegado al borde de arriba de su caja, sobre el marco y sin tapar la cifra, y a escala 1 con un tope de ancho igual al de la caja (ancla.max). O que reemplace al ícono (la moneda o el corazón) mientras dura, y nunca a la cifra. Sumar a la QA una medida: el número con dueño no puede cruzarse con [data-n] ni salirse de su caja."
    }
  ],
  "aciertos": [
    "DEJALO JUSTO es lo mejor de la versión en el teléfono: un verbo, su premio («+3 de oro · +1 Multi al próximo») y un marco prisma de 270×50 que no se confunde ni con GOLPEAR ni con DESCARTAR (mesa-dejalo-justo, en ES y en EN: MAKE IT EXACT). Mi P2 está resuelto.",
    "JUGADAS lleva CERRAR al pie, bajo el pulgar, con la flecha de «hay más» encima (jugadas). La Forja Brava pasa a dos cartas de elección a todo el ancho, con ícono grande y su regla sobre fondo liso, y SEGUIR queda como secundario (forja-brava-eleccion).",
    "Las ayudas ya no se abren solas. En botin-tesoro y oferta-evoluciona no aparece ningún globo, y el Tesoro queda sobre las ofertas, con DEJAR EL COFRE a 48 px. La Evolución dice por qué evoluciona: «con tu don de Copas».",
    "En el desglose del Tajo, ¡CRÍTICO! ×2 entra en su renglón del Multi (390-rey-tajo-07) y el chip dice «TE PEGA 48 (×2)». El resumen ya no queda tapado por sus botones (0 solapes), y con la mano de 8 nadie cambia de fila al elegir.",
    "0 recortes y ninguna letra de menos de 14 px en las 60 capturas de 390, y 134 fps en reposo y en golpes."
  ],
  "capturas_vistas": [
    "visual-qa/390x844: mesa, mesa-seleccion, mesa-mentiroso, mesa-escalon, mesa-escudo, mesa-exacto, mesa-dejalo-justo, mesa-segunda, mesa-segunda-cambia, mesa-postas-arrastre, rey-mascara, hud-evolucion-foco, jugadas, forja-brava, forja-brava-eleccion, oferta-evoluciona, botin-tesoro, mapa-tesoro, cabala-negra, elegi-una, pulperia, altar, fin-derrota, resumen-derrota, resumen-derrota-movil",
    "visual-qa-en/390x844: resumen-derrota-movil, mesa-dejalo-justo",
    "jurado/secuencias: 390-rey-segunda-02, -06, -09, -10, -11, -12; 390-golpe-04, -08; 390-rey-tajo-07; 390-postas-golpe-05; 390-chiche-usa-03; 390-botin-brota-10 (+ recorte de -09 a -11)",
    "las medidas.json de 390x844 (mesa-mentiroso, mesa, mesa-seleccion, mesa-exacto, mesa-dejalo-justo, resumen-derrota, resumen-derrota-movil); jurado/fps.txt"
  ]
}
```

## Veredicto

La 0.24.0 es la versión más clara hasta ahora en el teléfono. El chip EXACTO, que se leía como un estado, pasa a ser DEJALO JUSTO, una acción con su premio. CERRAR baja al pulgar, ninguna ayuda se abre sola y el resumen ya no queda tapado por sus botones. Claridad, que en mi ficha pesa doble, sube de 8,1 a 8,3. No llega a 8,5 por dos cosas. El Mentiroso, con su mano de 8, todavía baja 65 px de golpe al primer toque de cada turno. Y en el teléfono, lo que más motiva del resumen, el récord y los Porotos, queda abajo de un rollo que nadie te anuncia.

Alcance: no corrí nada. El salto de la mano de 8 lo deduzco de comparar capturas quietas (mesa-mentiroso contra mesa-escalon) y de mano.ts:342. El suspenso de la tercera pasada de la Forja, la Cábala Negra con el mando y lo que Perfora planta al Rey los leí en el código y en los commits, no los vi en movimiento.

## Contra mi veredicto de la previa

**Resueltos:** el P2 del chip EXACTO, el solape del resumen (ahora se desliza), CERRAR arriba en JUGADAS y el ¡CRÍTICO! montado en el desglose del Tajo. **A medias:** el P1 de la mano de 8. Ya nadie cambia de fila al elegir, pero el bloque entero sigue bajando al primer toque. **Siguen:** el baúl sobre el nodo vecino, TE PEGA sobre la cara de la Sota con la mano de 8 y «Multi ×3 al cantar ¡ESCOBA!» en cuatro renglones.

## Defectos menores

- **El resumen**: entre «TU JUGADA» y «Envido» casi no hay aire, y el «II» del nivel de la Bendición queda suelto a la derecha de las piezas; parece un ícono de pausa (`src/client/estilos/pantallas.css:4187` sin `gap`; `src/client/pantallas/camino.ts:1251`, el `.fin-nivel` fuera de su `.fin-pieza`).
- **Con el mando en el teléfono**: en mesa-dejalo-justo, ES y EN, los botones ? y ≡ quedan vacíos, sin glifo (`src/client/pantallas/mesa.ts`, la barra de arriba con `data-entrada=mando`).
- **La placa TAJO DE REVÉS**: tapa el nombre del Rey y el renglón del Bufón y sigue ahí cuando ya es el Turno 4 (390-rey-segunda-10 a -12). Que se vaya antes de repartir (`src/client/pantallas/mesa.ts`, el evento del tajo).
- **El baúl del mapa**: sigue montado sobre el marco del combate de la calavera (mapa-tesoro; `src/client/pantallas/mapa.ts`).
- **El desglose con DEJALO JUSTO**: el Daño se parte en dos renglones y el panel llega a cinco pisos, lo que achica el paño a unos 85 px (`src/client/estilos/mesa.css:4565` y la regla del desglose en ≤700).

## Qué haría en la próxima versión

El paquete «el teléfono no se mueve ni se tapa». Paño reservado siempre en ≤700, con la mano de 8 ya en su sitio desde el reposo, y una secuencia de QA con el Mentiroso que falle si un naipe se corre más de 8 px. Los números con dueño se apoyan en el borde de su caja y la QA mide que no pisen ningún [data-n]. El resumen del teléfono sube los Porotos y el récord a la primera capa, achica el retrato partido y lleva el aviso hay-mas. Sumaría una medida de solapes entre capas: un número vivo, una placa o un globo encima de una cifra o de un botón. Hoy la QA mide recortes y dianas, pero no lo que se tapa en movimiento. La Constitución queda intacta.
