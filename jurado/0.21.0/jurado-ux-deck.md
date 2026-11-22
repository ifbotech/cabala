```json
{
  "jurado": "jurado-ux-deck",
  "version": "0.21.0",
  "puntajes": { "claridad": 7.8, "diversion": 8.1, "estetica": 8.2, "veredicto": 7.9 },
  "defectos": [
    { "prioridad": "P1", "pantalla": "Mesa con el paño cargado y mano larga (mesa-escalon; también mesa-chispa)", "ventana": "1280x800 y 1366x768", "archivo": "src/client/mano.ts:277-311 (si los claros no alcanzan cae en «fila de siempre e índice al pie») y :368-369; src/client/estilos/mesa.css:1058-1072 (.c-pie: solo el número, 16 px de mínimo, el palo solo por color)", "que": "Con la Escalera 2-3-4 en el paño, de los cinco naipes que quedan en la mano tres se reducen a una pestañita al pie con un número coloreado: «3», «4», «7★». No llevan pinta y miden unos 20 px. Las medidas dan franjaMin 9 a 1280 y 0 a 1366. Además, esas pestañas quedan pegadas a los índices invertidos de las cartas jugadas, así que se leen cinco números en una línea y no se sabe cuál es de quién.", "por_que": "A 40 cm, una cifra de juego de 20 px sin pinta no se lee, y el palo solo por color rompe la regla de los cuatro palos distinguibles sin color. Para ver si la mano te da Flor o un Par después de este golpe hay que deseleccionar todo. Pasa cada vez que jugás 3 o más con la mano llena, o sea en la mitad de los turnos de media partida.", "propuesta": "Que la pestaña del pie lleve número y pinta (pxPalo a 2×) y mida al menos 24 px de cifra. Si los claros no alcanzan, que el paño baje a 0,85× y la mano asome su índice de arriba entero por encima del HUD, en vez de esconderse detrás. Regla de QA «indice-mano»: con el paño cargado, cada naipe de la mano tiene número y pinta a la vista, con cifra de 24 px o más." },
    { "prioridad": "P1", "pantalla": "Chiches con mando (mesa-chiches, mesa-chiche-usa, secuencia chiche-usa)", "ventana": "1280x800", "archivo": "src/client/pantallas/mesa.ts:1126 (el pie del tip se elige por pointer: coarse y no por la entrada: con mando dice «Tocalo o arrastralo al enemigo»); src/client/estilos/mesa.css:4123-4130 y :4168-4172 (rótulo L3 y nombres a 14 px); src/client/pantallas/camino.ts:110 y 136-148 (el glosario no tiene Chiches); mesa.ts:1212", "que": "La bandeja se ve bien: tres huecos de 74 px con iconos claros. Pero todo lo que la explica está a 14 px: el rótulo «L3 CHICHES» va en hueso apagado y los nombres «Ginebra», «Dado» y «Fósforo» también, y son la letra más chica de las 18 mesas a 1280 y a 1366 (minPx 14, minQue L3 CHICHES). Con un Chiche enfocado, la ayuda enseña a tocar o arrastrar y nunca nombra la A (lo leí en el código: por segunda versión no hay captura con un Chiche enfocado). JUGADAS no tiene entrada de Chiches. Después de usar uno, el foco cae en la primera carta del DOM, que puede estar en el paño.", "por_que": "Es la mitad de lo que trae la versión y en la Deck se aprende a ciegas: el texto enseña un puntero que no tenés y el glifo que importa mide 14 px. Además, el foco que salta rompe la cruceta justo antes de golpear.", "propuesta": "Un texto chicheUsaMando («A lo usa · B vuelve · no gasta el turno») elegido por html[data-entrada]. Rótulo y nombres a 18 px, con el rótulo en hueso pleno. Una entrada de glosario «Chiches (L3)». Que el foco vuelva a la carta que lo tenía antes de L3. Un estado de QA nuevo, mesa-chiche-foco, a 1280 en ES y EN." },
    { "prioridad": "P2", "pantalla": "Postas y su guía (mesa, mesa-mando, mesa-seleccion, mesa-rey, mesa-conteo, mesa-escudo-mando)", "ventana": "1280x800", "archivo": "src/client/pantallas/mesa.ts:341 (la pista con LB/RB vive solo en .cuenta.reposo); src/client/estilos/mesa.css:506-512 (.p-ayuda 15 px) y :519-521 (.posta.llena .p-rot oculta); src/client/mano.ts:495 y la ▼ de --fm", "que": "La pista ya dice «A elige · LB RB corre de Posta» (bien), pero solo en reposo. En cuanto elegís algo, que es cuando hay algo para correr, la reemplaza el desglose y no queda ningún LB ni RB en pantalla. La ayuda de cada Posta subió a 15 px, pero sigue debajo de 18. Además, la ▼ del foco cae justo sobre «en orden: Escalón» de la Posta en la que estás y lo tapa («Esc…ón» en mesa, mesa-rey y mesa-conteo).", "por_que": "Con mejorAcomodo la mesa acomoda sola y correr a mano casi no hace falta, por eso es P2. Pero cuando querés armar Chispa a tu gusto, el control no se ve, y la etiqueta que te dice para qué sirve la Posta queda debajo de tu propio cursor.", "propuesta": "Con una carta del paño enfocada, glifos LB ◀ y ▶ RB chicos a sus costados, o «LB/RB corre» al pie del desglose. La ▼ se dibuja sobre el borde del naipe, debajo de la franja de la Posta, y la ayuda pasa a 18 px con dos renglones como máximo." }
  ],
  "aciertos": [
    "El paño pasó adelante: lo elegido se ve entero y delante de lo que no elegiste (mesa-seleccion, mesa-chiche-usa). El «+2» nace sobre el naipe que de verdad pega (postas-golpe-01 en el 2 de Bastos del Medio, postas-golpe-04 en el 2 de Oros). Se resolvió mi P1 principal.",
    "Con mano de 8 se ven los 8 índices: en mesa-mentiroso y mesa-escudo-mando la enfocada ya no tapa a su vecina (franjaMin 87 y 104 a 1280).",
    "La pista de reposo enseña LB y RB, y JUGADAS ya tiene Medio, Chispa y Escalón en el glosario.",
    "La marca ×2 sobre el naipe del Medio es grande y dorada, y se lee a 40 cm mejor que cualquier texto de la mesa. Los iconos de Chiche a 74 px se distinguen bien.",
    "El rendimiento es impecable: 133,9 fps bajo golpes a 1280 y un peor cuadro de 8 ms. La portada ya dice v0.21.0."
  ],
  "capturas_vistas": [
    "visual-qa/1280x800/mesa.png", "visual-qa/1280x800/mesa-mando.png", "visual-qa/1280x800/mesa-seleccion.png", "visual-qa/1280x800/mesa-escalon.png",
    "visual-qa/1280x800/mesa-chispa.png", "visual-qa/1280x800/mesa-mentiroso.png", "visual-qa/1280x800/mesa-escudo-mando.png", "visual-qa/1280x800/mesa-chiches.png",
    "visual-qa/1280x800/mesa-chiche-usa.png", "visual-qa/1280x800/mesa-postas-arrastre.png", "visual-qa/1280x800/mesa-conteo.png", "visual-qa/1280x800/mesa-rey.png",
    "visual-qa/1280x800/jugadas.png", "visual-qa/1280x800/piezas.png", "visual-qa/1280x800/mapa-mando.png", "visual-qa/1280x800/pulperia-chiches.png", "visual-qa/1280x800/botin-rey.png",
    "visual-qa/1366x768/mesa-escalon.png", "visual-qa-en/1280x800/mesa-escalon.png",
    "jurado/secuencias/1280-postas-golpe-01/04/07/10.png", "jurado/secuencias/1280-mando-03/10.png", "jurado/secuencias/1280-mando-elige-03.png",
    "jurado/secuencias/1280-chiche-usa-01/02/05/06.png", "mirar/1280-comodin-espectral-racha.png",
    "medidas.json de todas las pantallas de 1280x800 y de las mesas de 1366x768 (node)", "jurado/fps.txt"
  ]
}
```

## Veredicto

Esta 0.21.0 corrigió lo grueso que le marqué a la previa. El paño va adelante, el número del conteo nace en la carta que pega y la mano de 8 enseña sus 8 índices. Con mando, la mesa se recorre sin perder cartas y el ×2 del Medio se lee desde el sillón. Lo que queda son bordes de Deck. Con el paño cargado, el resto de tu mano se encoge a números de 20 px sin pinta. Los Chiches, que son lo nuevo, se explican a 14 px y con una ayuda que habla de tocar y arrastrar. Y la letra más chica de todas las mesas sigue en 14 px. Lo recomendaría con un pero chico: mirá bien la bandeja antes de apretar L3. **No hay P0.**

**Seguimiento de la previa:** resueltos el paño detrás de la mano (P1-1), el abanico que tapaba a la vecina (P1-2) y, en parte, la enseñanza de las Postas (P1-3): LB/RB en la pista, glosario con Medio, Chispa y Escalón, y ayuda a 15 px. Siguen la letra a 14 px, los Chiches fuera del glosario, el foco que salta después de usar un Chiche, la A montada en ELEGIR del Botín, el foco hueso en «Lo que llevás», la Posta del borde muda y el chip de racha sobre el índice del Rey.

Aviso: la ayuda de un Chiche enfocado con mando la leí en el código, no la vi. Tampoco vi la carta del pie enfocada por encima del paño (`Z.foco` 90 contra `Z.posta` 50): la deduzco del código.

## Defectos menores

- Tras el golpe, el naipe que no jugaste se recentra y queda solo en la Posta dorada del Medio mientras cae el 152 (postas-golpe-07 y 10): parece que el doble lo pegó él. Ver `src/client/mano.ts:311` (fila centrada); el paño debería apagarse mientras vuela el golpe.
- Un «+1» rojo suelto queda sobre el borde de DESCARTAR (mando-03) y otro junto a «L3 CHICHES» (postas-golpe-04). Ver `src/client/pantallas/mesa.ts:1675-1745`.
- «STREAK ×2» sigue pisando el «10» del Rey. Van cuatro versiones (mirar/1280-comodin-espectral-racha; `src/client/pantallas/mesa.ts:609`).
- En inglés, con 5 Postas, «Middle: hits double» se parte en tres renglones y el primero queda cortado arriba (mismo cuadro). Ver `src/client/estilos/mesa.css:506-512` y `:545`.
- LB o RB en la Posta del borde no suena ni tiembla: `src/client/mano.ts:734` devuelve false en silencio y `src/client/nav.ts:115-117` igual da la pulsación por usada.

## Qué haría en la próxima versión

**«La mano siempre legible».** Uno: una pestaña de pie con número y pinta a 24 px, y si no alcanza el lugar, el paño a 0,85× para que la mano asome su índice de arriba entero, con la regla de QA «indice-mano». Dos: los Chiches enseñados para mando, con texto por entrada, rótulo y nombres a 18 px, entrada en el glosario, foco que vuelve adonde estaba y un estado mesa-chiche-foco. Tres: minPx 18 como puerta dura en las mesas de 1280 y de 1366, empezando por .p-ayuda, .ch-rot y .ch-nombre. Cuatro: LB/RB junto a la carta del paño enfocada, la ▼ fuera de la franja de la Posta y error audible en los bordes. Cinco: sacar de una vez el chip de racha de la órbita del naipe enemigo. Nada de esto toca la Constitución.
