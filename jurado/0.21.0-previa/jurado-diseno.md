```json
{
  "jurado": "jurado-diseno",
  "version": "0.21.0",
  "puntajes": { "claridad": 7.2, "diversion": 7.2, "estetica": 8.0, "veredicto": 7.3 },
  "defectos": [
    {
      "prioridad": "P1",
      "pantalla": "mesa · paño de Postas (mesa-escalon, mesa-chispa, postas-golpe)",
      "ventana": "todas",
      "archivo": "src/rules/combate.ts:228 y :276 (Escalón: +1 de Multi por naipe) · :222 y :226 (Medio y Chispa: +n de Daño) · src/rules/balance-config.json:247-251 · src/client/mano.ts:118 (postasPorDefecto: la primera elegida al Medio)",
      "que": "Las Postas son un rompecabezas resuelto. El Escalón da +3 a +5 de Multi y el Medio y la Chispa dan +n de Daño (1 a 9). Con la misma mano del Mentiroso, la Flor 3-6-7 en Escalón hace 38 × 5 = 190 (mesa-escalon) y el Par de 6 con Comodín, con Medio y Chispa, hace 38 × 2 = 76 (mesa-chispa): 2,5 veces más. Casi siempre hay una sola respuesta: «de menor a mayor». Además, la mesa no la arma sola: el primer naipe que tocás va al Medio, el segundo a la izquierda y el tercero a la derecha. Si tocás 3, 5 y 7 en ese orden, quedan 5-3-7 y no hay Escalón. La escalera de jugadas también queda al revés: una Escalera de 3 naipes vale Multi 6, más que el Full (4) y que el Póker (5). Las jugadas de naipes iguales (Par, Pierna, Full, Póker) nunca arman Escalón, y el Comodín, que copia la carta más alta, tampoco. La tabla JUGADAS que lee el jugador ya no ordena las jugadas como de verdad pesan.",
      "por_que": "Una regla de posición tiene que plantear un dilema, como el orden de los Comodines en Balatro. Esta le cobra un trámite al jugador en cada golpe. Encima, los enemigos tienen un 27 % más de Vida, calibrada para un bot que siempre ordena. Al que no descubre el Escalón el juego lo castiga, y al que lo descubre lo aburre. Escoba y Chancho van a querer Quinces y Flores de números distintos antes que su jugada propia.",
      "propuesta": "1) Que la mesa acomode sola en la mejor disposición (de menor a mayor y la carta más alta al Medio cuando entra) y que mover a mano sea solo para casos especiales. 2) Que la decisión pase por el palo: la Posta del Medio duplica el poder de su palo (el Escudo del Basto, la cura de la Copa, el oro del Oro y el Perfora de la Espada) además del número. Así, qué palo va al centro se vuelve una pregunta táctica de verdad (¿defiendo, me curo o cobro?). 3) El Escalón da +2 de Multi fijo y no +1 por naipe, para que no le gane a la jugada."
    },
    {
      "prioridad": "P1",
      "pantalla": "mesa con mano de 3 (Escoba, Truco) y mano de 7–8 (Chinchón, Mentiroso)",
      "ventana": "1920x1080, 1280x800, 390x844",
      "archivo": "src/client/mano.ts:198-207 (lugaresPosta: el paño asoma detrás de la fila de la mano) y :224-245 (la fila de la mano centrada en la misma base)",
      "que": "El paño y la mano ocupan el mismo rectángulo. Con mano de 3, las cartas sin elegir caen justo dentro de las Postas (mesa-chiches, 390-chiche-usa-03) y parecen ya apoyadas. Al elegir, la carta que queda en la mano se dibuja encima de la del Medio y la tapa: en mesa-seleccion, a 1280 y a 1920, del 2 de Bastos del Medio solo se ve el índice y el ×2. Después del golpe, la carta que queda (rey-segunda-05 y 07, postas-golpe-08) descansa en el Medio. Con mano de 8 (mesa-escalon), de las elegidas asoma una tira de ~50 px y el chip ESCALÓN +3 tapa entera la carta de la tercera Posta.",
      "por_que": "La regla nueva es de posición, y la posición no se ve. El jugador no sabe qué apoyó dónde ni si una carta está elegida o solo en la mano. La ventaja de las Postas está en verlas, y la mesa las esconde.",
      "propuesta": "Darle al paño su propia franja, entre la cuenta y la mano, con las elegidas enteras a escala entera menor (1× en la Deck y el teléfono). Que la mano baje y nunca dibuje una carta sobre una Posta llena. Con mano de 3, la fila de la mano va corrida a un lado del paño, no debajo de él. Llevar el chip ESCALÓN fuera de las cartas, sobre el borde del fieltro."
    },
    {
      "prioridad": "P1",
      "pantalla": "elegí un amuleto (rey-cae-17) · pulperia-chiches",
      "ventana": "todas",
      "archivo": "src/rules/amuletos.ts:40-50 · src/rules/balance-config.json:287-298 (poncho, taba, cofre)",
      "que": "Sigue mi P1 de la 0.20: la oferta del Rey en rey-cae-17 vuelve a traer el Cofre («+1 de Multi por cada 30 de oro, tope +2») junto a la Bota, y en La Pulpería está la Taba («con 4 o más, +1 de Multi»). Ahora es peor: el Escalón, gratis en cada golpe, da +3 a +5 de Multi y deja en ridículo a los Épicos de +2. Los Chiches tampoco abren builds: son cinco pociones genéricas (curar, +3 de Multi, quitar el Inmune, un Comodín, robar 2) que ninguna pieza potencia.",
      "por_que": "Mi pregunta central sigue sin respuesta: las builds las arma el Mazo, no las piezas. La recompensa por bajar a un Rey es elegir entre un +2 condicional y algo que el paño ya te da gratis. Así no hay un momento de «esto rompe mi partida».",
      "propuesta": "Rehacer los tres Épicos de palo como cambiadores de regla que se apoyen en las Postas. El Poncho: «el Escudo que te sobra pasa al Daño del naipe del Medio». El Cáliz: «la Cura que pasa de tu Vida máxima se vuelve Daño». El Cofre: «la Posta de la izquierda cobra 2 de oro por número de su naipe». Siguen siendo 15, y cada palo tiene una build de conversión y un lugar en el paño."
    }
  ],
  "aciertos": [
    "El golpe que se planta dice la verdad: «SE PLANTA EN LA MITAD · 60 SE PIERDEN» bajo el número (rey-segunda-05), el número es lo que entra (60 en celeste) y la segunda cara despide el sello.",
    "El Fósforo de Fogón tacha el «INMUNE A ESPADAS» en el acto (mesa-chiche-usa): un consumible que se lee sin texto.",
    "La curva mejoró: el Mentiroso cae en el tramo 1 el 16,7 % de las veces (antes 29,9 %) y la puerta volvió de 30 a 25.",
    "La Pulpería con Chiches a 9 de oro junto a Purgar y Curar a 8 (pulperia-chiches) suma una decisión de oro barata y clara.",
    "El fieltro del paño, la Posta del Medio en oro y los naipes del Escalón que suben un peldaño cada uno (mano.ts:221) son buen lenguaje de mesa."
  ],
  "capturas_vistas": [
    "jurado/secuencias/1280-postas-golpe-00.png",
    "jurado/secuencias/1280-postas-golpe-04.png",
    "jurado/secuencias/1280-postas-golpe-08.png",
    "jurado/secuencias/390-postas-golpe-02.png",
    "jurado/secuencias/1280-chiche-usa-01.png",
    "jurado/secuencias/1280-chiche-usa-04.png",
    "jurado/secuencias/1280-chiche-usa-06.png",
    "jurado/secuencias/390-chiche-usa-03.png",
    "jurado/secuencias/1280-rey-segunda-03.png",
    "jurado/secuencias/1280-rey-segunda-04.png",
    "jurado/secuencias/1280-rey-segunda-05.png",
    "jurado/secuencias/1280-rey-segunda-07.png",
    "jurado/secuencias/1280-rey-cae-17.png",
    "visual-qa/1280x800/mesa-escalon.png",
    "visual-qa/1280x800/mesa-chispa.png",
    "visual-qa/1280x800/mesa-chiches.png",
    "visual-qa/1280x800/mesa-prenda.png",
    "visual-qa/1280x800/mesa-chiche-usa.png",
    "visual-qa/1280x800/mesa-seleccion.png",
    "visual-qa/1920x1080/mesa-seleccion.png",
    "visual-qa/1280x800/mesa-postas-arrastre.png",
    "visual-qa/1280x800/mesa-mentiroso.png",
    "visual-qa/1280x800/pulperia-chiches.png"
  ]
}
```

## Veredicto

**Respecto de la 0.20.0:** mi P1 del golpe que se planta quedó **resuelto en la mesa**: el número es lo que entra y el sello dice cuánto se pierde. No se adoptó la otra mitad (que el sobrante deje Aturdida a la segunda cara), así que tantear la mitad con la jugada barata sigue siendo lo óptimo. El P1 de la curva **mejoró pero sigue**: Escoba 21,4 % contra Truco 3,5 % en el tramo 1, una dispersión de 6,1×. El P1 de los Amuletos **sigue intacto** y ahora pesa más. De los menores, **siguen** los exactos muertos (0,3 a 1,3 por partida, Escoba bajó de 0,9 a 0,5), los cantos desparejos (Chancho 1,5, Truco 25,5) y la Moneda falsa con 3 Oros.

Simulé tres builds con las piezas reales:

- **Escoba de los Quinces (Cascabel, Taba):** un Quince de tres naipes distintos, ordenado, suma +3 de Escalón antes del ×3: el Multi pasa de 12 a 21. El grito es real, pero lo da el paño y no las piezas.
- **Chancho de Póker:** cuatro iguales nunca arman Escalón. Su Póker de Multi 5 queda por debajo de una Flor de 4 naipes en escalera (2 + 4 = 6). El ¡CHANCHO! (×2) sostiene el récord del laboratorio (60 168), pero en el turno a turno el paño le pide naipes distintos a un Mazo que vive de los iguales.
- **Mentiroso de Comodines:** el Comodín copia la carta más alta, así que mata el Escalón y deja la Chispa (+n) como premio consuelo. En mesa-chispa, el Par con Comodín bien acomodado hace 76 y la Flor de la misma mano hace 190.

Se sienten distintas, pero todas desembocan en «naipes distintos de menor a mayor». Las Postas inflaron el golpe medio del tramo 1 (Escoba de 138 a 187) y el 27 % más de Vida de los enemigos lo compensó: nos quedamos donde estábamos y con un paso más por turno.

**Leído en código, no visto:** el sonido de la Chispa y del Chiche (`sonar('chiche')`, mesa.ts:1178).

## Defectos menores

- `REGLAS.md` no dice una palabra de las Postas, los Chiches ni la Prenda, y el paso 1 de «El turno» no menciona el paño. El generador no se actualizó: `scripts/reglas.ts`.
- Después de usar el Dado Cargado, la mesa no muestra que hay +3 de Multi armado hasta que elegís cartas (chiche-usa-04 y 06): `src/client/pantallas/mesa.ts:1165-1189`.
- El bot centra el Escalón (`src/rules/bot.ts:69`) en vez de apoyarlo pegado a la izquierda. Con 5 Postas deja de lado que la carta más alta caiga en el Medio: ni el bot encuentra el óptimo del paño.
- La Prenda sale de exactos (casi nulos) y cantos: Truco roba Chiches a cada rato y Chancho casi nunca (`src/rules/combate.ts:470`).
- El laboratorio no mide cuántas veces se arma Escalón o Chispa ni cuántos Chiches se usan o se roban: `scripts/analyze-meta.ts`.

## Qué haría en la próxima versión

«El centro de la mesa». La mesa acomoda sola el Escalón, y la decisión pasa a qué palo va al Medio, que duplica su poder (Escudo, cura, oro o Perfora): defender, curarse o cobrar en cada golpe. El Escalón queda en +2 de Multi fijo, para que la escalera de jugadas vuelva a ser verdad. El paño sale de debajo de la mano y gana una franja propia con las cartas enteras. Los tres Épicos de palo se rehacen como conversores atados a las Postas (Poncho, Cáliz y Cofre), para que cada palo tenga su build. Y el sobrante del golpe que se planta, si pasa del 25 %, deja Aturdida a la segunda cara: así el golpe grande vuelve a pagar contra el Rey.
