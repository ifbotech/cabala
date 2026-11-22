```json
{
  "jurado": "jurado-diseno",
  "version": "0.28.0",
  "puntajes": { "claridad": 8.6, "diversion": 8.7, "estetica": 8.4, "veredicto": 8.6 },
  "defectos": [
    {
      "prioridad": "P2",
      "pantalla": "Truco · mesa, fin-derrota («TU JUGADA: Envido») y scripts/meta-report.json (cantos 21,1; golpe medio 295 / 753 / 1784; caídas 154 / 398 / 1582)",
      "ventana": "todas",
      "archivo": "src/rules/combate.ts:128 (canto = 2 cartas del mismo palo) y :259-262 · src/rules/balance-config.json:171-173 (envido 11, cargaDano 1, multiMano 7)",
      "que": "La 0.28 arregló cuánto paga el ¡ENVIDO!, no cuándo canta. Sigue sonando 21,1 veces por partida, contra 6,9 a 12,6 de los otros cuatro Mazos. Y al escalar con el tramo quedó más dominante: en el tramo 3 dos cartas del mismo palo suman +33 de Daño más los cantados, y la Flor de tres cartas suma +6 más un naipe de 7 como mucho. Jugar dos cartas le gana siempre a jugar tres. El golpe del tramo 1 bajó de 423 a 295, pero sigue un 40 a 59 % arriba de los demás (186 a 211), y el 74 % de las caídas del Truco llega en el tramo 3 (antes 82 %; mi meta era 65 %).",
      "por_que": "Un canto que suena en casi todos los golpes es el piso, no un grito. La única decisión del Mazo, dos cartas o tres, sigue resuelta de antemano. Y toda pieza que premia cantar (Cascabel, Mano Caliente, la Prenda) le sale gratis a un Mazo abierto desde el minuto 0.",
      "propuesta": "Que el Envido valga por sus dos cartas, como en el Truco real: la suma de las dos × tramo en vez de 11 × tramo. Un 7 y 6 paga 13 / 26 / 39 y se busca; un 1 y 2 paga 3 / 6 / 9 y pierde contra una Escalera de tres con Escalón. Y que solo cuente como canto (para el Cascabel, Mano Caliente y la carga) el Envido de 10 o más. Meta de laboratorio: cantos entre 10 y 14 y caídas del tramo 3 ≤ 65 %."
    },
    {
      "prioridad": "P2",
      "pantalla": "Evoluciones: elegi-amuleto (Cofre con ★ EVOLUCIONA), piezas (Sol y Brindis), mesa-maldicion, mesa-garrote · scripts/meta-report.json (evolucion 85,2 a 93,6 %)",
      "ventana": "todas",
      "archivo": "src/rules/evoluciones.ts:55 (despierta con cualquier don del Rey) · src/rules/combate.ts:380 (Facón) y :742 (Garrote), los dos con «no abate» · :320 (Brindis)",
      "que": "El número nuevo confirma lo que venía marcando: entre el 85 y el 94 % de las partidas termina con una Evolución despierta (bot que elige por nota, contadas también las derrotas). Con un don de nivel 1 alcanza, y tres Reyes ofrecen dones tras cada Guardia: llevar un Épico es llevarlo evolucionado. El Poncho, el Cáliz y el Cofre sin despertar casi no se juegan. Las maldiciones no cambiaron: Facón y Garrote cobran por lo mismo (el golpe que no abate) y la del Brindis lo alimenta.",
      "por_que": "Una Evolución que pasa en nueve de cada diez partidas no es un hallazgo de build, es el estado normal del Épico. Se pierde el «¡se me dio!» que tienen las reliquias raras de Slay the Spire, y el Cáliz (jugar con la Vida llena) se da vuelta solo en su contrario sin que el jugador lo decida.",
      "propuesta": "Que despierten con un don de nivel 2 del Rey de su palo: repetir un don pasa a ser la apuesta. Meta: 35 a 55 % de partidas con Evolución. Garrote: el turno sin Bastos gasta medio Escudo. Brindis: tus Copas ya no te curan. Sumar al informe lo que cobra cada maldición por partida."
    },
    {
      "prioridad": "P2",
      "pantalla": "Golpe exacto y su racha (mesa-dejalo-justo, dial R3 DEJALO JUSTO) · scripts/meta-report.json (exactos 0,2 a 1,8 por partida)",
      "ventana": "todas",
      "archivo": "src/rules/combate.ts:356-358 y :522-542 (racha, tope 3; se corta en :542) · src/rules/balance-config.json:68-73 (alPelo 0.05)",
      "que": "Sin cambios. El exacto tiene dial propio, cartel, frase del Bufón, racha de hasta 3 y un Pacto Dual (Hoja y broquel) que solo vive de él. Ocurre 0,6 veces por partida con la Escoba, 0,2 con el Truco y 1,8 como mucho, con un bot que lo busca. La racha de 3 no se arma. El Degüello lo vuelve más raro: el enemigo cae antes de llegar a 0.",
      "por_que": "Es la mecánica de precisión del juego y la que más interfaz gasta, pero pesa una vez por partida. Hoja y broquel es un don muerto: +5 de Escudo y +1 de Filo una o dos veces en 15 minutos.",
      "propuesta": "Ensanchar el «al pelo» a 10 % de la Vida máxima y que cobre 1 de oro; que la racha no se corte al abatir sin exactitud dentro del mismo combate, solo al terminar un combate sin ningún exacto. Meta: 3 a 5 exactos por partida."
    }
  ],
  "aciertos": [
    "El Envido ya no arranca doblando a los demás ni se apaga: el golpe medio del Truco pasó de 423 / 832 / 1739 a 295 / 753 / 1784 y sus caídas en el tramo 1 subieron de 2,5 a 5,1 %. El arranque dejó de ir en piloto automático.",
    "El informe ahora cuenta Evoluciones y oro al Sol (6,2 a 28,3 por partida). El Sol se usa de verdad con el Chinchón y el Mentiroso, las manos grandes, y casi nada con el Truco: la pieza se juega distinto según el Mazo.",
    "El ¡CHINCHÓN! se ve cobrar (chinchon-corta-04 y -08): «CORTÁS 4 cartas × 6 = +24», un +6 sobre cada naipe que queda, el Escudo sube a 28 y el golpe del enemigo se lo come entero: «−28 ESCUDO», Vida −3.",
    "El Rey se planta y cambia de cara a la vista (rey-planta-08 y -16): el golpe frena en 195/390, el cartel dice SE PLANTA EN LA MITAD y aparece SEGUNDA CARA · TAJO DE REVÉS con su regla en una línea.",
    "El canto del Chancho por fin tiene foto: 37 × 24 = 888 contra 900, el Degüello remata y el Manotazo grita ¡OINC, OINC! (chancho-canta-08)."
  ],
  "capturas_vistas": [
    "visual-qa/1280x800/mesa.png",
    "visual-qa/1280x800/mesa-grito.png",
    "visual-qa/1280x800/mesa-rey.png",
    "visual-qa/1280x800/mesa-dejalo-justo.png",
    "visual-qa/390x844/mesa-chancho.png",
    "visual-qa/1280x800/elegi-una.png",
    "visual-qa/1280x800/elegi-amuleto.png",
    "visual-qa/1280x800/elegi-bendicion.png",
    "visual-qa/1280x800/cabala.png",
    "visual-qa/1280x800/pulperia.png",
    "visual-qa/1280x800/fogon.png",
    "visual-qa/1280x800/jugadas.png",
    "visual-qa/1280x800/piezas.png",
    "visual-qa/1280x800/mapa.png",
    "visual-qa/1280x800/fin-victoria.png",
    "visual-qa/1280x800/fin-derrota.png",
    "jurado/secuencias/1280-golpe-04.png",
    "jurado/secuencias/1280-golpe-08.png",
    "jurado/secuencias/1280-botin-brota-06.png",
    "jurado/secuencias/1280-botin-brota-12.png",
    "jurado/secuencias/1280-chancho-canta-03.png",
    "jurado/secuencias/1280-chancho-canta-08.png",
    "jurado/secuencias/1280-chancho-canta-11.png",
    "jurado/secuencias/1280-chancho-canta-13.png",
    "jurado/secuencias/1280-chinchon-corta-04.png",
    "jurado/secuencias/1280-chinchon-corta-08.png",
    "jurado/secuencias/1280-rey-planta-08.png",
    "jurado/secuencias/1280-rey-planta-16.png"
  ]
}
```

## Veredicto

**Respecto de la 0.27.0:**
- Envido (P2): **resuelto a medias**. El monto ya escala y el tramo 1 quedó en 295, dentro de mi meta. **Sigue** la frecuencia (21,1 cantos; pedía 10 a 14) y las caídas del tramo 3 (74 %; pedía 65 %).
- Maldiciones (P2): **sigue igual**, y ahora con número: 85 a 94 % de partidas con Evolución.
- Exacto (P2): **sigue igual**. La mitad del informe **quedó resuelta**: cuenta Evoluciones y oro al Sol. Falta lo que cobra cada maldición.
- Menores: el canto del Chancho ya tiene secuencia. **Siguen** el `pierna: 1` muerto, el Chinchón en 16,6 % en el Reinado 8 y el dial en R3.

No abro P1: nada rompe ni frena. La versión es un paso corto y bien dado en diseño; subo diversión una décima por la curva del Truco y nada más, porque las tres cosas de fondo siguen ahí.

Simulé tres builds con las piezas reales:

- **Truco + Cascabel + Lanza → Facón.** Tramo 3: dos Espadas, +33 del Envido, más unos 15 de cantados, por Multi 9 o más. El Cascabel nunca cobra su −1 porque canto siempre. El Facón me corta 3 si no abato, así que busco el remate con la Brava. Pega parejo y fuerte, pero elijo el par y nada más.
- **Chancho Va + Boleadoras + Cetro.** Control: paso una carta gratis por turno hasta la Pierna, aturdo, y el «de un saque» encadena al siguiente. El enemigo casi no pega. Es la build más distinta del juego. Tiene un agujero (ver menores): con Degüello el encadenado se rompe sin aviso.
- **Mentiroso + Cáliz → Brindis + Falta Envido + Sangre por sangre.** 25 de Vida y 20 de Escudo. El Brindis me bebe 1 por golpe y me empuja bajo el 40 %, donde Falta Envido da ×3. Cañón de vidrio que se juega al borde. Divertida, pero su «maldición» es combustible.

Las tres se sienten distintas entre sí. La primera es la más chata de manejar.

**Reyes:** clímax. Se plantan en la mitad, cambian de regla y caen en 4 a 4,8 golpes. **Bufón y Cábala:** pesan; El Soplo sigue siendo una apuesta con costo y el 60 a la vista. **Mitad de partida:** 14,1 a 15,5 minutos, sin novedad propia en el tramo 2.

**Leído en código, no visto:** un descarte pagado del Sol en movimiento y la maldición del Garrote sobre el Escudo del ¡CHINCHÓN!.

## Defectos menores

- Chancho Va: si el golpe de un saque remata por Degüello, el siguiente no entra Aturdido, aunque la mesa diga «LO ABATÍS · DEGÜELLO · ¡CHANCHO!». En chancho-canta-11 y -13 el Caballo entra con TE PEGA 26. La regla escrita dice «si abatís de un solo golpe»: `src/rules/combate.ts:791` (`deUnSaque && q.abate`; debería valer también con `q.ejecuta`).
- La Pierna del Chancho que abate pierde su Aturdido (solo se aplica si el enemigo sobrevive) y `pierna: 1` sigue muerto: `src/rules/combate.ts:794` y `src/rules/balance-config.json:200`.
- En rey-planta-08 el cartel SE PLANTA EN LA MITAD cruza un cuadro por encima de ESTOCADA DEL CAUDILLO: `src/client/estilos/mesa.css` (cartel del Rey).
- Chinchón: 11,1 % de caídas en el tramo 1 y 16,6 % en el Reinado 8, contra 27,8 % del Chancho: `src/rules/balance-config.json:176`.

## Qué haría en la próxima versión

**«Que el canto se elija y la Evolución se gane».** El Envido vale la suma de sus dos cartas por el tramo y solo canta desde 10: el Truco pasa a dudar entre un Envido flaco y una Escalera con Escalón. Las Evoluciones despiertan con un don de nivel 2, y cada maldición prohíbe algo distinto (Garrote sin Bastos, Brindis sin cura). El «al pelo» se ensancha a 10 % y la racha vive dentro del combate. El Chancho encadena también cuando remata el Degüello, y su Pierna que abate pasa el Aturdido al siguiente. El informe suma lo que cobra cada maldición. Se recertifica con cantos entre 6 y 14 en los cinco Mazos, Evoluciones entre 35 y 55 % y 3 a 5 exactos por partida.
