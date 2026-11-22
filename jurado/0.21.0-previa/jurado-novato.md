```json
{
  "jurado": "jurado-novato",
  "version": "0.21.0",
  "puntajes": { "claridad": 7.1, "diversion": 7.5, "estetica": 7.8, "veredicto": 7.4 },
  "defectos": [
    { "prioridad": "P1", "pantalla": "mesa-seleccion, mesa-mando, mesa-escalon, mesa-chispa y secuencia postas-golpe 00 a 06", "ventana": "1280x800 (igual en 390x844)", "archivo": "src/client/mano.ts:93 (Z: posta 10 queda debajo de mano 30) y :207 (la fila del paño va en base − asoma: del naipe elegido solo se ve la tira de arriba); src/client/mano.ts:175 (el chip ESCALÓN se apoya encima del tercer naipe)", "que": "Los naipes que voy a jugar son los que menos se ven. En mesa-mando elijo el 2 de Oros, que va al Medio, y lo tapan el 2 de Bastos y el 3 de Copas: solo se ve un «2» y el «×2». En mesa-seleccion, el 3 de Copas, que no juego, queda montado encima del 2 de Bastos, que sí juego. En mesa-escalon, de los tres naipes de la Flor se ven dos índices, y el chip «ESCALÓN +3» tapa el tercero (el 7 de «6 + 3 + 7» no aparece en la mesa).", "por_que": "La novedad de la versión es dónde apoyás cada naipe, y es justo el lugar que la mano tapa. Así no puedo comprobar qué voy a tirar ni ver la escalera que me promete el chip. Además, el naipe que no juego encima del que juego me hace creer que también entra en el golpe.", "propuesta": "Con algo elegido, los naipes elegidos se ven enteros. Dos caminos: la mano baja medio naipe y se apaga, o el paño sube al hueco libre entre la cuenta y la mano (ahí, en reposo, solo vive la pista de botones). El chip ESCALÓN va arriba del paño, no encima de un naipe." },
    { "prioridad": "P1", "pantalla": "mesa, mesa-mentiroso, mesa-chispa y jugadas", "ventana": "1280x800", "archivo": "src/client/textos.ts:249 («en orden: Escalón» en cada Posta de costado) y :250 (postaTip está escrito y nadie lo usa); src/client/pantallas/mesa.ts:334 (la pista dice elige · golpea · descarta, pero no cómo cambiar de Posta); src/client/pantallas/camino.ts:110 y :131 (el glosario no tiene Posta, Medio, Escalón, Chispa ni Chiche)", "que": "«Medio: pega doble» se entiende al toque: el rombo, el «×2» y «Medio +2» en la cuenta llevan el mismo icono. Lo demás no. «en orden: Escalón» se repite en cada Posta de costado, como si fuera una regla de ese lugar, y no dice cuántas cartas, ni en qué orden, ni qué da. La Chispa no figura en ningún lado hasta que salta. Nada me dice que puedo mover un naipe de Posta (LB/RB, Q/W o arrastrar): el juego llena el Medio solo y yo nunca decido.", "por_que": "Si el jugador no sabe que elige el lugar, las Postas son un bonus automático y no una decisión, y la versión pierde lo que agrega. Encima, el texto que lo explicaba ya existe (postaTip) y no se muestra.", "propuesta": "Un renglón fijo bajo el paño: «MEDIO ×2 · 3 EN SUBIDA = ESCALÓN (+1 MULTI C/U) · A LA DERECHA DEL COMODÍN: CHISPA». Las Postas de costado quedan sin texto, o con el número de su lugar. La pista suma «LB/RB mueve de Posta» (con ratón: «arrastrá para cambiar de lugar»). El glosario de JUGADAS gana Posta, Escalón, Chispa y Chiche." },
    { "prioridad": "P2", "pantalla": "mesa-chiches, mesa (primer combate), secuencia chiche-usa 01 a 06", "ventana": "1280x800", "archivo": "src/client/pantallas/mesa.ts:1108-1113 (el hueco es solo un icono: el nombre y la regla viven en el tip, que en la foto no se ve); mesa.ts:263 (el Dado armado aparece en la cuenta recién cuando elegís cartas)", "que": "Junto a GOLPEAR hay tres cuadros oscuros con «L3 CHICHES»: un vaso verde, un dado y un fósforo, sin nombre. En el primer combate son tres huecos vacíos que no dicen nada. Cuando uso el Fósforo, «INMUNE A ESPADAS» se tacha y está buenísimo. Pero cuando uso el Dado, el dado vuela al enemigo, el hueco queda vacío y en la mesa no queda rastro de que tengo +3 de Multi armado (chiche-usa-05).", "por_que": "Un consumible que no sé qué hace no lo uso, o lo gasto mal. Y el Dado que vuela al enemigo parece un ataque, no un refuerzo de mi golpe. En la Pulpería («Fósforo de Fogón: Quema el Inmune en este golpe») se entiende perfecto: el problema es que en la mesa esa frase desaparece.", "propuesta": "El nombre corto bajo cada icono (VASO, DADO, FÓSFORO) y, con el foco, la regla en un renglón visible, como el desglose. El Chiche que arma el próximo golpe deja una ficha encendida pegada a GOLPEAR («DADO · +3 MULTI») hasta que golpeás. Con cero Chiches, la bandeja no se muestra." }
  ],
  "aciertos": [
    "La A del mando ahora sigue al foco: en la portada solo JUGAR la lleva, y en la derrota solo OTRA VEZ. Mi P2 de la 0.20, resuelto.",
    "FILO «+5 daño» y CORAZA «+2 escudo» en la bandeja del HUD: por fin sé qué es la cifra más grande de la bandeja. Mi P1 de la 0.20, resuelto a medias.",
    "El Medio se lee solo: rombo dorado, «×2» sobre el naipe y «Medio +2» en la cuenta, con el mismo icono. En postas-golpe-03 el +2 salta del naipe y se enciende su término.",
    "El Fósforo usado tacha «INMUNE A ESPADAS» y apaga el escudo del enemigo: enseña la regla sin texto.",
    "La Pulpería con CHICHES 2/3, VENDIDO y una frase por Chiche es la pantalla más clara de la versión. La Taba por fin dice qué hace."
  ],
  "capturas_vistas": [
    "visual-qa/1280x800/portada.png", "visual-qa/1280x800/elegir-mazo.png", "visual-qa/1280x800/cabala.png", "visual-qa/1280x800/mapa.png",
    "visual-qa/1280x800/mesa.png", "visual-qa/1280x800/mesa-seleccion.png", "visual-qa/1280x800/mesa-postas-arrastre.png", "visual-qa/1280x800/mesa-arrastrando.png",
    "visual-qa/1280x800/mesa-escalon.png", "visual-qa/1280x800/mesa-chiches.png", "visual-qa/1280x800/mesa-chiche-usa.png", "visual-qa/1280x800/mesa-chispa.png",
    "visual-qa/1280x800/mesa-prenda.png", "visual-qa/1280x800/mesa-mando.png", "visual-qa/1280x800/mesa-rey.png", "visual-qa/1280x800/mesa-mentiroso.png",
    "visual-qa/1280x800/elegi-una.png", "visual-qa/1280x800/pulperia.png", "visual-qa/1280x800/pulperia-chiches.png", "visual-qa/1280x800/fogon.png",
    "visual-qa/1280x800/jugadas.png", "visual-qa/1280x800/piezas.png", "visual-qa/1280x800/fin-derrota.png", "visual-qa/390x844/mesa-seleccion.png",
    "jurado/secuencias/1280-golpe-00, 05, 09.png", "jurado/secuencias/1280-postas-golpe-00, 03, 06, 10.png",
    "jurado/secuencias/1280-chiche-usa-01, 03, 05, 06.png", "jurado/secuencias/1280-botin-brota-10.png", "mirar/1280-conteo.png"
  ]
}
```

## Primeras impresiones (antes de abrir el código)

- **¿Cómo gano?** Bajo a cero la barra de cada uno de la Corte. «LE QUEDAN 335» me lo dice siempre.
- **¿Qué hace el enemigo?** «TE PEGA 21 · 23 − 2 ESCUDO». Claro.
- **Números del enemigo:** Vida, TE PEGA y Furia, bien. El «10» del naipe sigue siendo la cifra más grande y no me dice nada.
- **Furia / Inmune / Escudo / Multi:** claros. **Canto:** «Cantos hechos +8» sigue sin origen. **Golpe exacto:** no lo vi. **Comodín:** se vuelve copia, y en mesa-chispa le pasa una estrella al vecino que no sé leer.
- **Postas:** el Medio, sí. «en orden: Escalón», no: ¿orden de qué? No supe que podía mover un naipe de lugar.
- **Chiches:** en la mesa no sé qué son. En la Pulpería, sí.
- **Palabras que no conozco:** Escalón, Chispa, Chiche (en la mesa), Prenda, Palo y palo, Cara de póker, Cantos hechos, Mano corta, ENGAÑO, porotos.

## Defectos menores

- El naipe con foco se monta sobre el marco del HUD (mesa-mando, mesa-escalon), porque la base de la mano es `alto − h` (`src/client/mano.ts:245`).
- Después del combate, el paño vacío queda con tres cajas punteadas sobre la madera (botin-brota-10). Debería irse con la mano (`src/client/mano.ts:146-159`, clase `activo`).
- Con 7 naipes (mesa-mentiroso), las 5 Postas no quedan alineadas con los naipes de la mano: el rótulo «Medio» cae entre dos cartas (`src/client/mano.ts:198-208` contra `:226-245`).
- «porotos» sigue con un icono de gema (`src/client/pantallas/camino.ts:950`, `pxHud('poroto')`).
- Nota del material: la portada dice «v0.20.0», porque la foto es anterior al commit de versión.

## Contra mi veredicto de la 0.20.0

**Resueltos:** la A que no seguía al foco (P2), y en parte la jerga de la bandeja (FILO y CORAZA ya dicen qué suman, la Taba se explica). **No verificable:** DEGÜELLO contra «LO ABATÍS» (P1), porque no hay captura con Degüello. **Sigue:** el glosario, que no crece al ritmo de las palabras. Esta versión suma Escalón, Chispa, Chiche y Prenda, y ninguna está en JUGADAS.

## Qué haría en la próxima versión

Un pase de «el paño se ve y se explica». (1) Con cartas elegidas, la mano baja y se apaga, y el paño muestra los naipes enteros. Una prueba de QA falla si un naipe en Posta tiene menos del 60 % de su caja visible. (2) Un renglón fijo bajo el paño con las tres reglas (Medio, Escalón, Chispa), usando el `postaTip` que ya existe, y las Postas de costado sin texto. (3) La pista de botones suma «LB/RB mueve de Posta», y con ratón aparece un fantasma «arrastrá acá» sobre el Medio la primera vez. (4) Chiches con nombre bajo el icono, ficha de «armado» junto a GOLPEAR y bandeja oculta con cero Chiches. (5) El glosario gana todas las palabras nuevas, y una prueba recorre los términos del desglose y falla si alguno no tiene glosa. Nada de esto toca la Constitución, y me devolvería la claridad a 8.
