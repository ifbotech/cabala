```json
{
  "jurado": "jurado-novato",
  "version": "0.16.0",
  "puntajes": { "claridad": 7.2, "diversion": 6.9, "estetica": 8, "veredicto": 7.2 },
  "defectos": [
    { "prioridad": "P1", "pantalla": "mesa-rey en segunda cara (secuencias 1280-rey-segunda-09…12 y 1280-rey-tajo-00…10)", "ventana": "1280x800", "archivo": "src/client/pantallas/mesa.ts:123-127 (cartel e-segunda: solo el nombre; la regla va en el tip) y src/client/textos.ts:219 (gSegunda promete que «el cartel rojo dice cómo»)", "que": "Cuando el Caudillo llega a media Vida, la regla («si repetís la jugada… TE PEGA ×2») sale una sola vez en el globo del Bufón, mientras el cartel grande tapa la mesa. Después queda «TAJO DE REVÉS» bajo la barra, sin la regla. En el cuadro tajo-00 vuelvo a jugar CARTA SOLA y me pega 48: más de media Vida (87 → 39).", "por_que": "Es la regla nueva de la versión y la que más castiga, y se aprende perdiendo. El glosario dice que el cartel explica cómo, pero el cartel solo dice cómo se llama. Además, «¡CRÍTICO!» en dorado aparece justo al lado del chip rojo del Tajo: leo «crítico = bueno» y golpeo.", "propuesta": "Que el cartel quede con una línea de instrucción y no solo con el nombre: «TAJO DE REVÉS · no repitas jugada» (Fortín: «las Espadas lo atraviesan», Remate: «te roba oro», Última ronda: «no te cures»). Cuando el golpe elegido dispara el Tajo, el chip «¡CRÍTICO!» se apaga o pasa al final, para que el rojo mande." },
    { "prioridad": "P1", "pantalla": "mesa-seleccion y secuencia 1280-golpe-00…09", "ventana": "1280x800", "archivo": "src/client/pantallas/mesa.ts:226 (chip noTePega sin causa) y src/rules/combate.ts (de dónde sale contra = 0)", "que": "Elijo una Flor de Copas y la cuenta dice «NO TE PEGA» en azul, con la Sota viva (LE QUEDAN 22). No dice por qué. Recién después de golpear, en el cuadro 09, el Bufón me muestra CARA DE PÓKER: «lo primero que TE PEGAN en cada combate no llega».", "por_que": "Aprendo una regla falsa: «la Flor de Copas evita que me peguen». En el próximo combate repito la jugada, me pega 23 y no entiendo qué cambió. Una cifra de la cuenta sin causa es peor que no mostrarla.", "propuesta": "Que el chip lleve el icono y el nombre de la pieza que lo causa, como ya hacen los términos del desglose: «NO TE PEGA · [máscara] Cara de Póker» (o «· Aturdido»). Es el mismo pasoIcono que ya existe." },
    { "prioridad": "P2", "pantalla": "pulperia, piezas, elegi-una, mesa (bandeja del HUD)", "ventana": "1280x800", "archivo": "src/rules/amuletos.ts:34 («punto de carga de su Rey»), src/rules/aumentos.ts:9 (Plata/Oro como rango) y src/client/hud.ts:64 (tira de cargas sin rótulo)", "que": "Sigue de la 0.15: los tres Amuletos comunes de la Pulpería dicen lo mismo con otro palo y los tres hablan de «punto de carga de su Rey (tope +6)». El del medio agrega «SINERGIA · Suma a Filo». En el HUD, una espada con un 6 y un basto con un 2 no dicen que eso es la «carga». «Plata» y «Oro» siguen siendo rangos de Cábala, al lado del ORO que es plata y de los Oros que son un palo.", "por_que": "Es la primera compra del juego y no la puedo leer: elijo por el dibujo. Cuatro palabras para cosas distintas (oro, Oros, Oro-rango, Moneda) me hacen dudar de todo lo demás.", "propuesta": "Amuleto común: «+3 de Daño por cada Espada; crece con cada Rey de Espadas que vencés». Debajo de la espada del HUD, «FILO» en letra chica. Cábalas: Común/Rara con el marco, sin la palabra Plata/Oro." }
  ],
  "aciertos": [
    "La Furia ya no engaña: «TE PEGA 21 · FURIA 3 · ya incluida · +3 por turno», legible sin cursor. Era mi P1 de la 0.15 y quedó resuelto.",
    "El desglose ahora tiene dos renglones rotulados, DAÑO y MULTI, con el icono de cada pieza. En el cuadro golpe-03 cada término se enciende mientras suma: por fin veo de dónde sale el 318.",
    "JUGADAS: la fila QUINCE dice «Multi x3 al cantar ¡ESCOBA!», y hay un GLOSARIO con Furia, Escudo, Golpe exacto, Racha, Segunda cara y Engaño.",
    "La segunda cara entra como acto: cartel rojo «SEGUNDA CARA · TAJO DE REVÉS», lluvia y Bufón explicando. En el turno siguiente, antes de soltar, el TE PEGA muestra ×2 y el chip dice «TE PEGA 48»: el aviso existe.",
    "Portada, elegir Mazo, Cara o cruz y Elegí una Cábala se entienden en cinco segundos; el arte sigue siendo lo mejor del juego."
  ],
  "capturas_vistas": [
    "visual-qa/1280x800/portada.png", "visual-qa/1280x800/elegir-mazo.png", "visual-qa/1280x800/cabala.png", "visual-qa/1280x800/mapa.png",
    "visual-qa/1280x800/mesa.png", "visual-qa/1280x800/mesa-seleccion.png", "visual-qa/1280x800/mesa-rey.png", "visual-qa/1280x800/mesa-mentiroso.png",
    "visual-qa/1280x800/elegi-una.png", "visual-qa/1280x800/pulperia.png", "visual-qa/1280x800/fogon.png", "visual-qa/1280x800/jugadas.png",
    "visual-qa/1280x800/piezas.png", "visual-qa/1280x800/fin-derrota.png",
    "jurado/secuencias/1280-golpe-00, 03, 06 y 09.png",
    "jurado/secuencias/1280-rey-segunda-06, 09 y 12.png",
    "jurado/secuencias/1280-rey-tajo-00, 06 y 10.png"
  ]
}
```

## Primeras impresiones (antes de abrir el código)

- **¿Cómo gano un combate?** Bajo la barra (340/340) a cero y sigue LA CORTE · QUEDA 1. «LE QUEDAN 22» me lo dice antes de soltar. Claro.
- **¿Qué hace el enemigo en su turno?** «TE PEGA 23». Con la Flor de Copas dice «NO TE PEGA» y no entiendo por qué (ver P1).
- **Números del enemigo:** vida, golpe, Furia «ya incluida» y cuántos quedan. Resuelto.
- **Furia:** se entiende. **Inmune:** se entiende y la carta se pone gris. **Escudo:** cifra del HUD; qué frena, solo en el glosario. **Multi:** se entiende en la cuenta. **Canto:** «¡ESCOBA!». **Golpe exacto:** está en el glosario, pero el glosario queda abajo del pliegue de JUGADAS (a 1280 solo se ve MULTI y media FURIA). **Comodín:** JUGADAS lo explica en una línea.
- Palabras que no conozco: carga, Filo, «Suma a Filo», Plata/Oro (como rango), Mano corta, porotos, Noche mansa, «la primera pasada es segura», el «+8★» del 9, el dado junto a «Turno 1», ENGAÑO (botón LT, sin texto en la mesa).

## Defectos menores

- JUGADAS a 1280: el glosario, que es la mejor ayuda nueva, queda bajo el pliegue; subirlo arriba de LOS PALOS o partir en pestañas: `src/client/pantallas/camino.ts:167-193`.
- Mapa: la fila de arriba queda cortada bajo la cabecera, la de abajo bajo el HUD, y los escuditos bajo cada nodo siguen sin decir «inmune a»: `src/client/pantallas/camino.ts:202-204`.
- Mentiroso y Cara o cruz: en la bandeja del HUD hay un glifo blanco suelto («∠») sin marco, que no parece ninguna pieza: `src/client/hud.ts:64`.
- Fogón: «La primera pasada es segura» insinúa un riesgo que recién se nombra después de elegir: `src/client/textos.ts:133`.
- Portada: dice «v0.15.0». Las capturas son anteriores al cambio de `src/shared/brand.ts:7` (sin commitear), así que no es un defecto del juego, pero el material de la ronda no muestra la versión juzgada.

## Contra mi veredicto de la 0.15.0

Quedaron resueltos: la Furia que parecía sumable, el desglose ilegible, QUINCE ×1 y el glosario (Golpe exacto, Engaño y Escudo ya tienen su línea). Siguen: «carga» y Plata/Oro, el «+8★», el dado y los escuditos del mapa. Hay dos nuevos: la segunda cara, que se explica una sola vez, y el «NO TE PEGA» sin causa.

## Qué haría en la próxima versión

Que ninguna cifra ni cartel de la mesa aparezca sin su porqué. (1) Cada chip de la cuenta que cambia el resultado («NO TE PEGA», «¡CRÍTICO!», «×2») lleva el icono y el nombre de su causa, como ya lo llevan los términos del desglose. (2) Los carteles de segunda cara pasan a ser nombre + instrucción de tres o cuatro palabras, fijos hasta el final del duelo. (3) El glosario sube al primer pliegue de JUGADAS. (4) Un solo nombre por cosa: «carga» pasa a FILO/CORAZA/BOLSA/COPA con rótulo en el HUD; fuera Plata/Oro como rango. (5) Los tres comunes de la primera Pulpería se ofrecen con palos que el jugador ya tiene en el Mazo, para que la elección sea real. Es texto e iconos que ya existen, no toca la Constitución, y me dejaría la claridad en 8.
