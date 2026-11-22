```json
{
  "jurado": "jurado-diseno",
  "version": "0.21.0",
  "puntajes": { "claridad": 7.3, "diversion": 7.2, "estetica": 8.0, "veredicto": 7.4 },
  "defectos": [
    {
      "prioridad": "P1",
      "pantalla": "mesa · paño de Postas (mesa-escalon, mesa-chispa, postas-golpe)",
      "ventana": "todas",
      "archivo": "src/rules/bot.ts:63-73 (acomodos: el Escalón arranca en `desde` y deja la carta del medio en el Medio) y :93-102 (mejorAcomodo solo maximiza el total) · src/client/pantallas/mesa.ts:1920-1923",
      "que": "Ahora la mesa acomoda sola, y con eso las Postas dejaron de ser una decisión: son un bono automático de +2 a +9 de Daño y +2 de Multi que el jugador no elige. Encima, «la mejor disposición» no es la mejor. Con 4 o 5 Postas (Chancho, Chinchón, Mentiroso) y 3 naipes, acomodos() solo prueba el Escalón en las Postas 1-2-3, con la carta del medio en el Medio. Nunca prueba 0-1-2, que da Escalón y además la carta más alta en el Medio. En mesa-escalon, el 2-3-4 queda con «Medio +3» y 30 × 6 = 180, cuando en 0-1-2 hace 31 × 6 = 186. REGLAS.md:51 promete algo que el motor no cumple, y el bot y el laboratorio heredan el mismo error.",
      "por_que": "Una regla de posición resuelta por la máquina cobra todo su costo (franja de pantalla, rótulos, LB/RB, arrastre) y no da ninguna decisión. Lo único que le queda al jugador es ganarle por 6 puntos a un acomodo que dice ser el mejor. Mientras tanto, los exactos siguen muertos (0,2 a 1,3 por partida), y justo ese es el problema que las Postas podrían resolver.",
      "propuesta": "1) Que acomodos() pruebe todas las disposiciones (con 5 Postas y 5 naipes son 120 como mucho, y es barato). 2) Convertir el paño en el dial del Golpe exacto: si alguna disposición da EXACTO o AL PELO, la cuenta lo anuncia con un chip («MOVÉ EL 7 AL MEDIO → ¡EXACTO!») y LB/RB la eligen. Así la mesa sigue dando el máximo y el jugador decide si prefiere el máximo o el exacto. 3) Volver a la propuesta anterior: el Medio duplica también el poder de su palo (Escudo, cura, oro o Perfora), para que el centro pida elegir entre defenderse, curarse o cobrar."
    },
    {
      "prioridad": "P1",
      "pantalla": "mesa con mano de 3 (mesa-chiches, mesa-seleccion, postas-golpe-08 y -10, 390-chiche-usa-03) y con mano de 8 (mesa-mentiroso)",
      "ventana": "1280x800, 1920x1080, 390x844",
      "archivo": "src/client/mano.ts:277-309 (la mano «busca los claros», que son las Postas vacías) y :206-216 (paño y mano comparten la misma base)",
      "que": "La mano sigue viviendo dentro del paño. Con mano de 3 (Escoba y Truco, los dos Mazos con que arranca todo jugador nuevo), las tres cartas sin elegir están en las tres Postas, y el 2 de Oros aparece bajo «Medio: pega doble» aunque no pega nada. Cuando elegís, la mesa las reordena. Después del golpe, el 3 de Copas que sobró descansa en el Medio (postas-golpe-08 y -10). En mesa-seleccion, el 3 de Copas sin elegir queda bajo «en orden: Escalón». Con mano de 8, las ocho cartas sin elegir cubren las cinco Postas, y «en orden: Escalón» aparece cuatro veces.",
      "por_que": "Es la regla nueva del Salto y su lugar no se lee: no se distingue lo apoyado de lo que está en la mano. El primer golpe de la partida enseña algo falso (que la carta del medio de la mano pega doble).",
      "propuesta": "Darle al paño una franja propia sobre la mano, a escala menor, siempre visible y vacía hasta que elegís. Que la mano nunca ocupe una Posta. Un solo rótulo de Escalón en el borde del fieltro, no uno por Posta."
    },
    {
      "prioridad": "P1",
      "pantalla": "elegí un amuleto (rey-cae-17) · pulperia-chiches",
      "ventana": "todas",
      "archivo": "src/rules/balance-config.json (amuletos poncho, taba, cofre, caliz) · src/rules/amuletos.ts:40-50 · src/rules/chiches.ts:16-45",
      "que": "Sigue mi P1 de dos versiones. La oferta del Rey trae el Cáliz («80 % de Vida: +2 de Multi») y La Pulpería, la Taba (+1 condicional a 16 de oro). El Escalón gratis vale +2 de Multi, lo mismo que un Épico. Los cinco Chiches son pociones genéricas: ninguna pieza las potencia y ninguna toca las Postas.",
      "por_que": "Las builds las arma el Mazo, no las piezas. Bajar a un Rey no da ningún momento de «esto rompe mi partida», salvo cuando sale un Legendario.",
      "propuesta": "Rehacer los cuatro Épicos de palo como conversores atados al paño. El Poncho: «el Escudo que te sobra suma Daño al naipe del Medio». El Cáliz: «la cura que no te cabe se vuelve Daño». El Cofre: «la Posta de la izquierda cobra oro por su número». Lanza: «la Chispa también Perfora». Siguen siendo 15."
    }
  ],
  "aciertos": [
    "La Chispa se ve y se suma donde corresponde: en mesa-chispa, el Comodín a la izquierda del 3 del Medio da «Medio +3 · Chispa +3» sobre la misma carta, con su destello en la costura.",
    "El Dado Cargado se lee armado («MULTI +3» en la pista y en la cuenta, chiche-usa-03 y postas-golpe-00): quedó resuelto mi menor de la versión anterior.",
    "El Fósforo que tacha «INMUNE A ESPADAS» y el chip «¡PRENDA!» sobre el caído son consumibles que se leen sin texto.",
    "El Escalón a +2 fijo devolvió la escalera de jugadas a algo razonable, y REGLAS ya explica las Postas y los Chiches.",
    "El Cetro Legendario en la oferta del Rey (rey-cae-17) sí es una pieza que arma partida."
  ],
  "capturas_vistas": [
    "visual-qa/1280x800/mesa-escalon.png",
    "visual-qa/1280x800/mesa-chispa.png",
    "visual-qa/1280x800/mesa-seleccion.png",
    "visual-qa/1280x800/mesa-chiches.png",
    "visual-qa/1280x800/mesa-chiche-usa.png",
    "visual-qa/1280x800/mesa-mentiroso.png",
    "visual-qa/1280x800/mesa-prenda.png",
    "visual-qa/1280x800/mesa-postas-arrastre.png",
    "visual-qa/1280x800/pulperia-chiches.png",
    "visual-qa/1280x800/fin-victoria.png",
    "visual-qa/390x844/mesa-escalon.png",
    "jurado/secuencias/1280-postas-golpe-00.png",
    "jurado/secuencias/1280-postas-golpe-04.png",
    "jurado/secuencias/1280-postas-golpe-08.png",
    "jurado/secuencias/1280-postas-golpe-10.png",
    "jurado/secuencias/1280-chiche-usa-03.png",
    "jurado/secuencias/390-chiche-usa-03.png",
    "jurado/secuencias/1280-golpe-05.png",
    "jurado/secuencias/1280-rey-cae-17.png",
    "mirar/1280-mesa-grito.png"
  ]
}
```

## Veredicto

**Respecto de la 0.21.0 previa:** de mi P1 de las Postas se adoptaron dos de las tres propuestas: la mesa acomoda sola y el Escalón da +2 fijo. La tercera, el palo del Medio, quedó afuera, y sin ella el paño ya no pide ninguna decisión. Mi P1 del paño bajo la mano **mejoró pero sigue**: la mano ahora busca los claros, pero los claros son las Postas. El P1 de los Amuletos **sigue intacto**. De los menores, quedaron **resueltos** REGLAS y el Dado armado. **Siguen**: el bot centra el Escalón (y ahora ese error también lo hereda la mesa), la Prenda atada a exactos y cantos, y un laboratorio que no mide Postas ni Chiches.

Simulé tres builds con las piezas reales:

- **Escoba con Cetro:** un Quince de 3 naipes distintos suma +2 de Escalón antes del ×3, y con el Cetro el primer golpe sale ×3 otra vez. Grita, pero el grito lo dan el Mazo y el Legendario, no el paño.
- **Chancho de Póker:** cuatro iguales nunca arman Escalón, así que del paño solo le toca el Medio (+n). El ¡CHANCHO! sale 1,5 veces por partida contra 25,7 cantos de Truco: la identidad del Mazo casi no aparece.
- **Mentiroso con Polvo de Tiza:** un Comodín más da una Chispa más, que es lo único que suma. Con el Engaño todas las cartas valen lo mismo y el Escalón muere.

Se sienten distintas por el Mazo, no por las piezas, y el paño suma lo mismo a todas sin preguntar nada.

**Laboratorio:** las caídas en el tramo 1 siguen 6 veces desparejas (Escoba 22,4 %, Truco y Chancho 3,6 %), y los exactos siguen entre 0,2 y 1,3 por partida. **Leído en código, no visto:** el sonido del Chiche, y la mano que se reordena al elegir con mano de 3.

## Defectos menores

- El Escalón no se puede armar con naipes iguales ni con el Comodín (que copia la carta más alta), así que penaliza en silencio a Chancho y a Mentiroso: `src/rules/combate.ts:228`.
- Mientras arrastrás entre Postas, la cuenta sigue diciendo «Medio +2» con el Medio vacío, hasta que soltás (mesa-postas-arrastre): `src/client/mano.ts:600-658`.
- La ráfaga del Dado tapa «LB RB corre de Posta» en la pista (chiche-usa-03): `src/client/pantallas/mesa.ts` (vuelo del Chiche).
- El laboratorio sigue sin contar cuántas veces salen Escalón, Chispa y Prenda, ni cuántos Chiches se usan: `scripts/analyze-meta.ts`.
- La Moneda falsa sigue pidiendo 3 Oros en un golpe, y con mano de 3 eso es una Flor de Oros: `src/rules/balance-config.json` (amuletos.comunes.monedaDesde).

## Qué haría en la próxima versión

«El paño decide». acomodos() prueba todas las disposiciones y la cuenta ofrece dos: **MÁXIMO** (la que pone la mesa) y **EXACTO / AL PELO** cuando alguna existe, con un chip que se elige con LB/RB o con un toque. Así el Golpe exacto se juega en cada golpe y no por casualidad. El Medio duplica también el poder de su palo, y la pregunta pasa a ser qué palo va al centro: ¿me defiendo, me curo, cobro o perforo? El paño gana una franja propia, vacía hasta que elegís. Los cuatro Épicos de palo pasan a ser conversores atados a una Posta. Y la Prenda sale también del Escalón y de la Chispa, para que el paño alimente la bandeja de Chiches.
