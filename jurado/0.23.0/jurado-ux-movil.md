```json
{
  "jurado": "jurado-ux-movil",
  "version": "0.23.0",
  "puntajes": { "claridad": 8.1, "diversion": 8.1, "estetica": 8.0, "veredicto": 8.0 },
  "defectos": [
    {
      "prioridad": "P1",
      "pantalla": "Resumen de la partida (fin-derrota / resumen-derrota; en menor grado fin-victoria y la versión EN)",
      "ventana": "390x844",
      "archivo": "src/client/estilos/pantallas.css:2303-2310 (.fin-cuadro con flex:1 y min-height:0: la rejilla se desborda de su caja) + pantallas.css:2457-2468 y 3960-3973 (en ≤700, tres filas auto sin rollo) + src/client/pantallas/camino.ts:1263-1275 (.fin-porotos al pie del panel, .fin-botones pintados encima)",
      "que": "En la derrota, en español, la segunda capa del resumen se mete debajo de la fila de botones. OTRA MANO YA tapa la mitad de abajo de «819 1284» (ESTA y TU MEJOR), y la línea de Porotos ganados no se ve: entre OTRA MANO YA y ALTAR solo asoma su «s» final. En inglés los botones bajan a dos renglones y las cifras se salvan, pero los Porotos siguen tapados. La QA marca 0 recortes porque mide recortes, no solapes.",
      "por_que": "Es la pantalla que más se ve, porque casi todas las partidas terminan en derrota, y es la novedad del Salto: el resumen en dos capas. Justo lo que empuja a jugar otra mano, el récord por batir y los Porotos para el Altar, queda tapado, y encima por el botón que te pide volver a jugar. Se ve como un error, no como diseño.",
      "propuesta": "En ≤700: achicar el cuadro de arriba (la Corte a escala 1 con el nombre debajo; el héroe a --k:1,5 o al costado del título) y darle a .fin-cuadro un overflow-y:auto con los botones fijos al pie sobre un fondo opaco. Mejor todavía: subir los Porotos a la primera capa, junto a MEJOR GOLPE. Sumar a la QA una medida de solape: ninguna caja de .fin-panel puede cruzarse con .fin-botones, en ES y en EN."
    },
    {
      "prioridad": "P1",
      "pantalla": "mesa con mano de 8 (Mentiroso, o cualquier Mazo con el Aumento que suma mano): mesa-mentiroso → mesa-escudo / mesa-chispa / mesa-escalon",
      "ventana": "390x844",
      "archivo": "src/client/mano.ts:326-332 (reservaPano y entraEnFila: el paño se reserva solo si la mano entera entra en una fila con 44 px; con 8 naipes, (374−100)/7 ≈ 39 px, no entra) + mano.ts:311 (dos filas solo sin paño) + mano.ts:321 (fila(enMano): sin hueco fantasma)",
      "que": "El arreglo de la 0.23 funciona con manos de 3, 4 y 7: el paño queda reservado y apagado, y el naipe que sube deja su hueco (mesa → mesa-seleccion; 390-rey-tajo-00: el 7 se queda en su sitio). Con 8 naipes no se aplica. En reposo no hay paño, la mano va en dos filas de 4 desde y≈420 y la regla flota en el aire. Con el primer toque aparece el paño, la mano baja unos 75 px a una sola fila de 7 con franjas de 46 px, y cada toque siguiente vuelve a correr todo lo que queda a la derecha.",
      "por_que": "Mentiroso es el Mazo de las combinaciones largas (Escalón, Chispa con 3 Comodines): es donde más toques seguidos hay que hacer, y ahí la diana se sigue moviendo bajo el pulgar. Mi P1 anterior quedó resuelto en 4 de los 5 Mazos, pero no en el que más lo necesita.",
      "propuesta": "Con 8 naipes en el teléfono, reservar el paño también en reposo (el Rey ya se achica a ese tamaño cuando aparece la cuenta, mesa-escudo) y no pasar nunca de dos filas a una. Dos filas fijas de 4, cada una con su hueco fantasma hasta GOLPEAR. Si no hay alto, que la fila de atrás asome 46 px, como ya se mide (asomaMin). Sumar la secuencia 390-arma-escalon con Mentiroso y medir que ningún naipe de la mano se corra más de 8 px entre toques."
    },
    {
      "prioridad": "P2",
      "pantalla": "chip EXACTO del paño (mesa-exacto)",
      "ventana": "390x844",
      "archivo": "src/client/pantallas/mesa.ts:362-366 (el chip es un botón con un rótulo seco; la explicación vive en tip(), que en el dedo aparece recién al tocar) + src/client/textos.ts:308-311 (chipExacto: 'EXACTO')",
      "que": "En el teléfono, el renglón dice «LO ABATÍS · EXACTO · SOBRAN 24». En el dedo no hay glifo R3/X, y el chip naranja, que sube y baja, se lee como un estado («es exacto») y no como una acción («hacelo exacto»). Encima lo contradice el SOBRAN 24 de al lado. La ayuda («Otra manera de apoyar…») aparece con el mismo toque que ya reacomoda el paño.",
      "por_que": "Es la ayuda más inteligente de la versión y en vertical no se entiende hasta que la usás. El que no lo toca no se entera de que existe un Golpe exacto con estas mismas cartas.",
      "propuesta": "Ponerle un verbo al rótulo: «→ EXACTO» o «PROBÁ EXACTO» (y «← MÁXIMO»). En ≤700, que vaya en su propio renglón bajo el veredicto, con el «SOBRAN 24» tachado o apagado mientras se ofrece. Al tocarlo, que el SOBRAN pase a ¡EXACTO! con el sonido que ya existe (audio.ts:58)."
    }
  ],
  "aciertos": [
    "La Cábala Negra del teléfono va en filas por número, con los cuatro palos lado a lado (cabala-negra). Elegido el 1 de Espadas, los otros tres 1 quedan encendidos en la misma fila y el resto se apaga. Mi P1 anterior está resuelto.",
    "Con manos de 3, 4 y 7, la mano ya no salta. El paño apagado ocupa su lugar en reposo, y el naipe que sube deja su hueco: el 2 y el 4 no se mueven entre mesa y mesa-seleccion. En la secuencia del Tajo, el 7 se queda quieto mientras se arma el golpe.",
    "El Comodín espectral conserva su «COMODÍN» en el paño (mesa-chispa), y el Comodín tapado de la mano de 8 lo lleva de canto, a la vista (mesa-escalon). La ficha evolucionada tiene dibujo propio, el Garrote, en el HUD (hud-evolucion-foco).",
    "La Forja Brava del teléfono es una elección clara: dos placas a lo ancho (DOBLE FILO / CHISPA DE ORO), de 44 px o más, con su efecto en dos renglones (fogon-mutaciones), y el Fogón ya no muestra cajas vacías (fogon). DEVOLVER, en el Altar, mide 48 px y queda bajo MEJORAR con el reembolso a la vista (altar).",
    "La regla ya no queda sobre la mesa vacía en el Botín (390-botin-brota-10). 0 recortes, ninguna letra de menos de 14 px y 134 fps en 390, en reposo y en golpes."
  ],
  "capturas_vistas": [
    "visual-qa/390x844: mesa, mesa-seleccion, mesa-mentiroso, mesa-escudo, mesa-escudo-mando, mesa-exacto, mesa-chispa, mesa-escalon, mesa-arrastrando, mesa-grito, jugadas, cabala, cabala-negra, altar, altar-devolver, fin-derrota, fin-victoria, resumen-derrota, resumen-victoria, forja-brava, fogon, fogon-mutaciones, botin-tesoro, mapa-tesoro, hud-evolucion-foco, evolucion-jackpot",
    "visual-qa-en/390x844: resumen-derrota",
    "jurado/secuencias: 390-rey-tajo-00, -03, -07, -11; 390-postas-golpe-00, -05; 390-chiche-usa-03; 390-rey-irrumpe-06; 390-botin-brota-10",
    "las medidas.json de 390x844 (dianas, mano, texto, recortes); jurado/fps.txt"
  ]
}
```

## Veredicto

La 0.23.0 arregla en el teléfono lo que más pesaba. La mano ya no salta con 3, 4 o 7 naipes, la Cábala Negra se lee por números y el Comodín espectral recupera su nombre. Lo nuevo del Salto entra en vertical con dianas de 44 a 48 px: la Forja Brava con sus dos mutaciones, DEVOLVER en el Altar y el chip EXACTO. Claridad, que en mi ficha pesa doble, pasa de 7,8 a 8,1. Dos cosas no dejan subir más. El resumen de la derrota, que es la novedad que se ve al final de casi todas las partidas, queda tapado por sus propios botones. Y el Mentiroso, con su mano de 8, sigue saltando bajo el pulgar.

Alcance: no corrí nada. Lo de la mano de 8 lo deduzco de comparar capturas quietas (mesa-mentiroso contra mesa-escudo) y de mano.ts:326-332. No hay una secuencia que lo filme toque a toque. La aguja de la Cábala Negra, el baúl que se abre y el sonido del dial los leí en el código y en los commits, no los vi en movimiento.

## Contra mi veredicto de la previa

**Resueltos:** el P1 de la Cábala Negra (filas por número), el P2 del Comodín espectral sin rótulo, la ficha evolucionada sin dibujo propio y la regla a destiempo en el Botín. El grito que tapaba GOLPEAR figura como arreglado en el commit dbac5d3, y en mesa-grito GOLPEAR se ve limpio. **A medias:** el P1 de la mano que salta, resuelto con 3, 4 y 7 naipes pero no con 8. **Siguen:** JUGADAS con CERRAR arriba y el desglose apretado en el Tajo.

## Defectos menores

- **El desglose en cuatro pisos**: en 390-rey-tajo-03 y -07, el Daño se parte en dos renglones, queda un «+3» suelto entre DAÑO y MULTI y «¡CRÍTICO! ×2» se monta sobre el renglón del Multi (`src/client/estilos/mesa.css:2601`, `:4050`). En ≤700, juntar los Chiches en un solo «Chiches +N».
- **JUGADAS**: CERRAR sigue arriba a la derecha, fuera del pulgar, y «Multi ×3 al cantar ¡ESCOBA!» ocupa cuatro renglones (`src/client/pantallas/camino.ts:210`).
- **Ayudas por foco en el dedo**: al abrir un modal, el foco va a [data-inicio] sin mirar cómo se juega, y `focusin` abre la ayuda. En el teléfono, eso puede tapar la primera oferta, como el globo TESORO sobre el Brindis en botin-tesoro (`src/client/ui.ts:83` y `:138`). Con `pointer: coarse`, que el foco por programa no abra la ayuda.
- **El baúl del mapa**: en mapa-tesoro se monta sobre el marco del combate vecino. Darle su lugar al costado del nodo, sin pisar a otro (el lienzo del mapa, `src/client/pantallas/mapa.ts`).
- **El Rey de la mano de 8**: con la cuenta abierta, la placa TE PEGA tapa la cara de la Sota (mesa-escudo, mesa-chispa, mesa-escalon). En ≤700, bajarla al pie del naipe del Rey (`src/client/estilos/mesa.css`, placa del Rey).

## Qué haría en la próxima versión

El paquete «nada se mueve y nada se tapa». La mano de 8 del teléfono pasa a dos filas fijas, con el paño reservado desde el reposo y el hueco fantasma en su fila; la QA filma 390-arma-escalon con el Mentiroso y falla si un naipe se corre más de 8 px. El resumen del final se reordena para el teléfono: Corte chica, Porotos en la primera capa y botones fijos sobre un fondo opaco. Se suma una medida de solapes al lado de la de recortes, en las cuatro ventanas y en los dos idiomas, porque este error pasó la puerta con 0 recortes. El chip EXACTO lleva un verbo y su renglón propio, y el desglose del teléfono junta los Chiches en un número. La Constitución queda intacta.
