```json
{
  "jurado": "jurado-diseno",
  "version": "0.27.0",
  "puntajes": { "claridad": 8.6, "diversion": 8.6, "estetica": 8.4, "veredicto": 8.5 },
  "defectos": [
    {
      "prioridad": "P2",
      "pantalla": "Truco · mesa y scripts/meta-report.json (cantos 21,9; golpe medio 423 / 832 / 1739; caídas 76 / 301 / 1741)",
      "ventana": "todas",
      "archivo": "src/rules/combate.ts:128 (canto = 2 cartas del mismo palo) y :259-262 · src/rules/balance-config.json:171-172 (envido 45, cargaDano 1)",
      "que": "El ¡ENVIDO! canta 21,9 veces por partida, contra 6,9 a 12,6 de los otros cuatro Mazos: casi todos los golpes. Paga +45 de Daño fijo, que en el tramo 1 duplica a cualquier otro Mazo (423 de golpe medio contra unos 200) y en el tramo 3 ya no pesa: el golpe crece ×4 entre tramos, y el de la Escoba ×10. Resultado: solo el 2,5 % cae en el primer tramo y el 82 % de las caídas llega en el tercero. Los números son iguales desde la 0.25 y no lo había señalado: error mío.",
      "por_que": "Un canto que suena en casi todos los golpes deja de ser grito y pasa a ser el piso. La decisión (jugar 2 del mismo palo o las 3) se resuelve sola. Y es uno de los dos Mazos abiertos desde el minuto 0: el primer tramo va en piloto automático y el último es una pared que la build no puede escalar, porque +1 de Daño por Envido no llega a nada.",
      "propuesta": "Bajar el Envido fijo (45 → 25 o 30) y que escale: +3 de Daño por Envido cantado, o que el valor salga de las dos cartas, como en el Truco real (20 + la suma). Así un Envido de 7 y 6 se busca y uno de 1 y 2 se duda. Meta de laboratorio: cantos entre 10 y 14, golpe medio del tramo 1 ≤ 300, caídas del tramo 3 ≤ 65 %."
    },
    {
      "prioridad": "P2",
      "pantalla": "piezas (LO QUE LLEVÁS: Brindis y Sol), mesa-maldicion, mesa-garrote, oferta-evoluciona",
      "ventana": "todas",
      "archivo": "src/rules/combate.ts:379 (Facón: no abate) y :741 (Garrote: no abate) · :319 (Brindis) · src/rules/evoluciones.ts:55 (despierta con cualquier don)",
      "que": "Sin cambios desde la 0.26. El Facón y el Garrote cobran por lo mismo, el golpe que no abate. El Brindis bebe 1 de Vida por golpe y esa Vida que falta le sube el Multi: su maldición lo alimenta. Las cuatro despiertan con un don de nivel 1.",
      "por_que": "De cuatro maldiciones, dos prohíben lo mismo y una no prohíbe nada. La única que cambia cómo jugás es la del Sol.",
      "propuesta": "Garrote: el turno sin Bastos enfría el Escudo a la mitad. Brindis: tus Copas ya no te curan. Que despierten con un don de nivel 2."
    },
    {
      "prioridad": "P2",
      "pantalla": "Golpe exacto y su racha (mesa-dejalo-justo, mesa-pega-todo) · scripts/meta-report.json (exactos 0,1 a 1,8 por partida)",
      "ventana": "todas",
      "archivo": "src/rules/combate.ts:355-357 y :524-526 (racha, tope 3) · src/rules/balance-config.json:68-73 · scripts/analyze-meta.ts:160 (el informe no cuenta Evoluciones ni descartes pagados)",
      "que": "El exacto tiene dial propio, cartel LO DEJÁS JUSTO y una racha de hasta 3. Pero ocurre 0,6 veces por partida con la Escoba, 0,1 con el Truco y 1,8 como mucho, con un bot que lo busca en cada abatida. Una racha de 3 no se arma nunca. Aparte, el bot ya paga los descartes del Sol (bot.ts:184-188), pero el informe sigue sin decir cuántas partidas despertaron una Evolución ni cuánto oro se pagó: que el balance se certificó con el Sol en juego no se puede comprobar desde el archivo.",
      "por_que": "Es mucha interfaz para algo que pasa una vez por partida y una racha que no existe. Y la pieza más fuerte de la 0.26 sigue sin número propio.",
      "propuesta": "Ensanchar el «al pelo» de 5 % a 10 % de la Vida máxima y que también cobre 1 de oro, o que la racha no se corte al cambiar de combate. Meta: 3 a 5 exactos por partida. Sumar al informe, por Mazo, las Evoluciones despiertas, los descartes pagados y lo que cobra cada maldición."
    }
  ],
  "aciertos": [
    "¡CHINCHÓN! ya tiene verbo propio y trae una decisión: la Pierna de 3 deja 4 cartas en la mano y cubre más (12, 24 o 36 de Escudo según el tramo); la Escalera de palo larga pega más y cubre menos. El Escudo queda en la mesa y alimenta al Poncho, al Garrote y a Palo y palo. Los cinco Mazos tienen cinco premios distintos.",
    "La cuenta lo explica sin leer reglas: «CORTÁS 4 cartas × 6 = +24 ESCUDO», un +6 sobre cada carta que te queda y «TE PEGA 3 · 31 − 28 ESCUDO» (mesa-chinchon, 1280 y 390).",
    "El «×1 de Multi» salió de la regla del Chancho y el bot paga los descartes del Sol dejando una reserva para no apagar su Multi. El mejor golpe de la Escoba bajó de 54 720 a 44 496.",
    "Un golpe no lleva más cartas que Postas: lo que mide el laboratorio es lo que una persona puede apoyar (combate.ts:192).",
    "La secuencia del golpe se lee paso a paso: en golpe-03 el +9 de la Chispa salta del Comodín al naipe y en golpe-06 las piezas se encienden una por una hasta 66 × 6 = 396. El dial dice PEGÁ CON TODO con su cuenta, «24 ×3 = 72 pasan · sin los +3 de oro»."
  ],
  "capturas_vistas": [
    "visual-qa/1280x800/mesa-chinchon.png",
    "visual-qa/390x844/mesa-chinchon.png",
    "visual-qa/390x844/mesa-chinchon.elige-5.png",
    "visual-qa/1280x800/mesa-chancho.png",
    "visual-qa/390x844/mesa-chancho.png",
    "visual-qa/1280x800/mesa-sol.png",
    "visual-qa/1280x800/mesa-maldicion.png",
    "visual-qa/1280x800/mesa-pega-todo.png",
    "visual-qa/1280x800/mesa-rey.png",
    "visual-qa/1280x800/elegir-mazo.png",
    "visual-qa/1280x800/elegi-una.png",
    "visual-qa/1280x800/cabala.png",
    "visual-qa/1280x800/cabala-negra.png",
    "visual-qa/1280x800/pulperia.png",
    "visual-qa/1280x800/fogon.png",
    "visual-qa/1280x800/mapa.png",
    "visual-qa/1280x800/jugadas.png",
    "visual-qa/1280x800/piezas.png",
    "visual-qa/1280x800/fin-victoria.png",
    "mirar/1280-mesa-grito.png",
    "jurado/secuencias/1280-golpe-03.png",
    "jurado/secuencias/1280-golpe-06.png",
    "jurado/secuencias/1280-golpe-09.png",
    "jurado/secuencias/1280-botin-brota-05.png",
    "jurado/secuencias/1280-botin-brota-11.png",
    "jurado/secuencias/1280-rey-segunda-17.png"
  ]
}
```

## Veredicto

**Respecto de la 0.26.0:**
- P1 de los cantos repetidos (Chancho y Chinchón): **resuelto**. El Chinchón cubre con la mano y el Chancho aturde; el «×1» ya no está en la regla.
- P1 del Sol sin medir: **resuelto en lo central**. El bot paga descartes y el techo de la Escoba bajó. **Sigue**, como P2, que el informe no cuenta Evoluciones ni descartes pagados.
- P2 de las maldiciones: **sigue igual**.
- Menores: **sigue** el dial en R3, aunque ahora tiene verbo y cuenta. El canto del Chancho **sigue sin foto**: `mesa-chancho` muestra la mano quieta.

No abro ningún P1 esta vez: nada rompe ni frena. Lo que separa a la versión del 9,1 son tres cosas de fondo, no de pulido.

Simulé tres builds con las piezas reales:

- **Chinchón + Poncho → Garrote + Palo y palo.** Canto una Pierna corta, me quedan 4 cartas y 24 de Escudo. El golpe siguiente lleva ese Escudo ×2 al Daño y +2 de Multi. Si no abato, el Garrote me gasta la mitad. Con 26 de Vida, el turno sin canto casi me mata (TE PEGA 31 con 34 de Vida en la captura). Se juega en dos tiempos, cubrir y descargar, y es la build nueva de la versión.
- **Escoba + Cofre → Sol.** Cavo hasta el 15 a 5 de oro por descarte. Cada descarte me acerca a perder un punto de Multi del Sol y me vacía La Pulpería. Decido cuándo golpear, no cuánto.
- **Truco + Cascabel + Mano caliente.** Los cantos valen doble y dejan Multi, y el Envido canta casi siempre. No decido nada: toda pieza que premia cantar es gratis. Es la más fuerte al principio y la más chata de jugar.

Las dos primeras se sienten distintas entre sí y de la tercera. La tercera muestra el defecto 1.

**Reyes:** siguen siendo clímax. El Caudillo anuncia la Estocada y la Furia ya incluida (mesa-rey), y el Cacique cambia de cara a media Vida con su frase (rey-segunda-17). Caen en 3,8 a 4,8 golpes.

**Bufón y Cábala:** pesan. El Soplo ofrece pagar 12 de oro por un Rey con 20 % menos de Vida, a la suerte con el 60 a la vista, y negarse le baja el humor. La Cábala Negra cose dos naipes en uno. Son decisiones con costo.

**Mitad de la partida:** las partidas duran 14,1 a 15,5 minutos, pegadas al piso del objetivo (14 a 24). No aburre, pero el tramo 2 es el que menos novedades trae.

**Leído en código, no visto:** el canto del Chancho, un descarte pagado del Sol en movimiento y la maldición del Garrote cobrando sobre el Escudo que dio el ¡CHINCHÓN!.

## Defectos menores

- La Pierna del Chancho canta y aturde, pero no suma nada al golpe; queda `pierna: 1` como número muerto: `src/rules/balance-config.json:200` y `src/rules/combate.ts:332`.
- El Chinchón cae 11,1 % en el tramo 1 (antes 5 %) y gana 16,6 % en el Reinado 8, contra 27,8 % del Chancho: `src/rules/balance-config.json:176` (Vida 26).
- El estado `mesa-chancho` no fotografía el canto: `src/client/qa.ts:483`.
- El dial sigue en R3, el botón menos descubrible del mando: `src/client/nav.ts:237`.
- En mesa-chinchon 1280, el renglón CORTÁS queda pegado encima del desglose, sin aire: `src/client/estilos/mesa.css` (bloque del desglose).

## Qué haría en la próxima versión

**«Que el Envido se dude y el exacto se busque».** El Envido vale por sus dos cartas y escala con los cantados, para que el Truco deje de cantar en cada golpe y llegue con algo al tercer tramo. El «al pelo» se ensancha y la racha sobrevive entre combates, con meta de 3 a 5 exactos por partida. Cada maldición prohíbe algo distinto: Garrote sin Bastos, Brindis sin cura, y las cuatro despiertan con un don de nivel 2. La Pierna del Chancho roba: te devuelve el pase gratis. El informe cuenta Evoluciones despiertas, descartes pagados y lo que cobra cada maldición. Se recertifica con cantos entre 6 y 14 en los cinco Mazos y caídas del tramo 3 ≤ 65 %.
