```json
{
  "jurado": "jurado-novato",
  "version": "0.21.0",
  "puntajes": { "claridad": 7.4, "diversion": 7.5, "estetica": 7.9, "veredicto": 7.6 },
  "defectos": [
    { "prioridad": "P1", "pantalla": "mesa, mesa-rey, mesa-chiches, mesa-mentiroso, mesa-escalon", "ventana": "1280x800", "archivo": "src/client/textos.ts:250 («en orden: Escalón» en cada Posta de costado) y src/client/mano.ts:158-164; alineación: src/client/mano.ts:206-216 (Postas repartidas en nPostas) contra :246-266 (la mano repartida en n naipes)", "que": "Con mano de 3 (Escoba), la mano en reposo queda justo debajo de los tres rótulos del paño, así que «en orden: Escalón» parece una propiedad del 2 de Bastos o del 3 de Copas que tiene abajo. La flecha del foco tapa la palabra («Esc▼ón») en la primera Posta en todas las capturas. Con 8 naipes (El Mentiroso), las 5 Postas no coinciden con los 8 naipes: el rombo del Medio cae entre el 3 de Espadas y el 3 de Oros, y no sé cuál «está» en el Medio.", "por_que": "El Medio se entiende al toque. Escalón, que es la otra mitad de la novedad, sigue siendo un cartel repetido que no dice cuántas cartas ni qué da. La regla buena («tres o más en orden creciente: +2 de Multi») vive en un tip que con el mando no se ve.", "propuesta": "Las Postas de costado van sin texto, solo con su peldaño. Un renglón fijo en el hueco de la pista de botones dice «MEDIO ×2 · 3 EN SUBIDA = ESCALÓN +2 MULTI». La mano sin elegir no comparte x con las Postas: baja medio naipe, o el paño solo aparece cuando hay algo elegido. La flecha del foco va arriba del rótulo, no encima." },
    { "prioridad": "P1", "pantalla": "desglose de la cuenta (mesa-seleccion, mesa-escalon, mesa-chispa) y jugadas", "ventana": "1280x800", "archivo": "src/client/pantallas/camino.ts:110 y :136-148 (GLOSARIO de 11 entradas); src/client/textos.ts:621 y :647 contra src/rules/reinados.ts:11", "que": "«Mano corta» significa dos cosas: en la cuenta es «+3 de Multi» (Escoba, mano de 3), y como Reinado 5 es «1 descarte menos por combate». En un Par leo Cantos hechos, Palo y palo, Mano corta, Filo, Filo dorado y Taba, y ninguno está en el glosario de JUGADAS. Tampoco están Chiche, Posta, Coraza, Cara de Póker ni porotos. La ayuda de cada término ya existe (PASO_AYUDA, textos.ts:642), pero solo sale al pasar el puntero.", "por_que": "La cuenta Daño × Multi es el corazón del juego. Si más de la mitad de lo que suma son nombres propios, el 95 me llega como magia y no aprendo qué construir. Es mi P1 de la 0.19, la 0.20 y la previa, y ahora encima una palabra choca consigo misma.", "propuesta": "Renombrar uno de los dos («Mano chica» para la Escoba). El glosario se arma solo desde PASO_NOMBRE + PASO_AYUDA, más Chiche y Posta, y arranca arriba en JUGADAS. Una prueba recorre los términos que emite el motor y falla si alguno no tiene glosa. Con el mando, R3 sobre la cuenta pasa el foco por los términos y lee la regla en un renglón." },
    { "prioridad": "P2", "pantalla": "mesa-chiche-usa (Fósforo contra la Sota de Espadas)", "ventana": "1280x800", "archivo": "src/rules/combate.ts:824-827 (el Fósforo se acepta siempre); src/client/pantallas/mesa.ts:1182-1188 (la negativa «niega» ya existe para la Ginebra)", "que": "Uso el Fósforo, «INMUNE A ESPADAS» se tacha y está lindo. Pero el golpe es 2 de Oros + 2 de Bastos: la cuenta sigue en 19 × 5 = 95, igual que antes, y el Chiche (9 de oro) se gastó sin efecto. Nada me avisa.", "por_que": "Un consumible que se puede tirar a la basura sin aviso enseña a no usar consumibles. Es la novedad de la versión y su primera lección es «no sirvió».", "propuesta": "Si en la mano no hay ningún naipe del palo Inmune, el Fósforo se niega como la Ginebra con la Vida llena. Si hay pero no los elegiste, esos naipes se encienden y la cuenta muestra «FÓSFORO · tus Espadas pegan» hasta que golpeás." }
  ],
  "aciertos": [
    "La pista de botones ahora dice «LB RB corre de Posta»: por fin sé que puedo mover un naipe de lugar. Mi P1 de la previa, resuelto a medias.",
    "Los Chiches llevan su nombre bajo el icono (Ginebra, Dado, Fósforo). Mi P2 de la previa, resuelto en lo principal.",
    "Los naipes elegidos se ven enteros en su Posta, y el Escalón ya no tapa el tercer naipe (mesa-escalon, mesa-seleccion). Mi P1 de la previa, resuelto.",
    "La cuenta sigue siendo lo mejor del juego: «PAR · DAÑO 19 × MULTI 5 = 95 · TE PEGA 16 · LE QUEDAN 335», y en golpe-02 a 06 cada término se enciende cuando suma.",
    "El Fósforo que tacha «INMUNE A ESPADAS» y la Pulpería con CHICHES 0/3 y una frase por Chiche se entienden sin leer nada más."
  ],
  "capturas_vistas": [
    "visual-qa/1280x800/portada.png", "visual-qa/1280x800/elegir-mazo.png", "visual-qa/1280x800/cabala.png", "visual-qa/1280x800/mapa.png",
    "visual-qa/1280x800/mesa.png", "visual-qa/1280x800/mesa-seleccion.png", "visual-qa/1280x800/mesa-rey.png", "visual-qa/1280x800/mesa-mentiroso.png",
    "visual-qa/1280x800/elegi-una.png", "visual-qa/1280x800/pulperia.png", "visual-qa/1280x800/fogon.png", "visual-qa/1280x800/jugadas.png",
    "visual-qa/1280x800/piezas.png", "visual-qa/1280x800/fin-derrota.png", "visual-qa/1280x800/mesa-chiches.png", "visual-qa/1280x800/mesa-chiche-usa.png",
    "visual-qa/1280x800/mesa-postas-arrastre.png", "visual-qa/1280x800/mesa-escalon.png", "visual-qa/1280x800/mesa-chispa.png",
    "jurado/secuencias/1280-golpe-00, 02, 04, 06, 07, 08, 09.png"
  ]
}
```

## Primeras impresiones (antes de abrir el código)

- **¿Cómo gano?** Bajo a cero la barra de cada uno de la Corte («LA CORTE · QUEDA 1»). «LE QUEDAN 335» me lo dice siempre.
- **¿Qué hace el enemigo?** «TE PEGA 21 · 23 − 2 ESCUDO». Claro. Con el Rey, «TE PEGA 0 · Cara de Póker» parece el nombre de alguien.
- **Números del enemigo:** Vida, TE PEGA y Furia, bien. El «10» o el «12» del naipe sigue siendo la cifra más grande y no significa nada.
- **Furia, Inmune, Escudo, Multi:** claros. **Canto:** «Cantos hechos +8» sin origen. **Golpe exacto:** solo en la estadística de la derrota. **Comodín:** en mesa-chispa, el naipe fantasma con el Bufón encima tapa los índices del 1, 2 y 3, y la estrella entre naipes no la sé leer.
- **Palabras que no conozco:** Escalón (como cartel), Chispa, Mano corta, Palo y palo, Filo dorado, Taba, Perforan, ENGAÑO, «Ni fu ni fa», «la primera pasada es segura», porotos.

## Defectos menores

- Mi golpe se ve chico y el del enemigo, enorme: el «95» va a escala 1 dentro del sprite, y el «−16» que me pegan va a escala 2 (golpe-08/09). Está en `src/client/pantallas/mesa.ts:677-678` contra `:859`.
- En el primer combate, en la compu, hay tres huecos vacíos de Chiches que no dicen nada: solo el teléfono los oculta (`src/client/estilos/mesa.css:4288`).
- El Chiche «Poroto de Yapa» choca con los «porotos» del Altar, que además se dibujan con una gema (`src/rules/chiches.ts:38-41`, `src/client/pantallas/camino.ts:958`).
- «TE PEGA 1(23 − 22 ESCUDO)» sin espacio antes del paréntesis (mesa-chispa, `src/client/pantallas/mesa.ts:281`).
- El anillo punteado verde del golpe de Bastos (golpe-08), quieto, parece un círculo de depuración (`src/client/fx/efectos.ts:147-165`; la animación la leí en código, no la vi).

## Contra mi veredicto de la previa

**Resueltos:** los naipes elegidos tapados (P1) y los Chiches sin nombre (P2, salvo los huecos vacíos). **A medias:** las Postas, porque la pista ya enseña LB/RB y el glosario suma Medio, Chispa y Escalón, pero el cartel «en orden: Escalón» sigue igual y el Mentiroso sigue desalineado. **Sigue:** la jerga del desglose, ahora con una palabra repetida.

## Qué haría en la próxima versión

Un pase de «cada palabra se explica sola». (1) El glosario se genera desde PASO_NOMBRE, PASO_AYUDA, los Chiches y las piezas que llevás, arranca arriba en JUGADAS, y una prueba falla si un término del motor no tiene glosa o si dos términos comparten nombre. (2) Con el mando se pueden recorrer los términos de la cuenta y leer su regla en un renglón. (3) Las Postas de costado van sin texto, la regla va en un renglón fijo, y la mano sin elegir baja para no confundirse con el paño. (4) Los Chiches que no harían nada se niegan, y el Fósforo enciende los naipes que destraba. (5) Mi daño se ve más grande que el que me pegan, y el índice del naipe enemigo se apaga a hueso chico. Nada de esto toca la Constitución, y me dejaría la claridad en 8.
