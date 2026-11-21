```json
{
  "jurado": "jurado-novato",
  "version": "0.20.0",
  "puntajes": { "claridad": 7.4, "diversion": 7.3, "estetica": 8.0, "veredicto": 7.5 },
  "defectos": [
    { "prioridad": "P1", "pantalla": "mesa-seleccion y secuencia golpe 00 a 09 (Par contra la Sota de Espadas)", "ventana": "1280x800", "archivo": "src/client/pantallas/mesa.ts:330 (con q.ejecuta, «revela» queda vacío) y :353-354 (el veredicto pasa a ser solo «DEGÜELLO»); src/client/textos.ts:58", "que": "La previa dice «PAR · DAÑO 43 × MULTI 7 = 301 · CURA +8 · DEGÜELLO». La Sota tiene 340. No dice «LO ABATÍS», ni «LE QUEDAN 39», ni TE PEGA. Yo leo 301 contra 340 y entiendo que no la mato, y una palabra verde que no conozco. En golpe-09 la barra queda en 39/340 con el enemigo todavía en pie (que después cae lo leí en el código, no lo vi).", "por_que": "Es la única vez que la previa me miente por omisión. En la 0.19 aprendí a confiar en «LO ABATÍS / LE QUEDAN n». Ahora, justo cuando una pieza me regala la muerte, la cuenta se calla el resultado y lo cambia por jerga. Puedo descartar la mejor jugada de la mano por miedo al contragolpe.", "propuesta": "El veredicto siempre en idioma llano, con la pieza como causa: «LO ABATÍS · DEGÜELLO (le quedan 39 ≤ 12 %)». Además, una muesca en la barra de vida del enemigo en el umbral del Degüello, y que el conteo termine con el enemigo cayendo en el mismo golpe, sin un cuadro en 39/340." },
    { "prioridad": "P1", "pantalla": "desglose de la cuenta (mesa-seleccion, mesa-segunda-cambia, golpe) y bandeja del HUD", "ventana": "1280x800", "archivo": "src/client/pantallas/camino.ts:109 y :130 (el GLOSARIO solo tiene multi, furia, escudo, exacto, alpelo, racha, segunda, engaño); src/client/hud.ts:39 (la regla de la carga solo aparece al pasar el puntero); src/client/pantallas/mesa.ts:324 (términos del desglose)", "que": "En un solo Par hay siete términos: Cantos hechos, Filo, Taba cargada, Mano corta, Taba, Peso fuerte y Par. En otro golpe aparece Primera sangre. Ninguno está en el glosario de JUGADAS, que además arranca recién bajo el pliegue: en jugadas.png FURIA queda cortada abajo. FILO y FORTUNA son las cifras más grandes de la bandeja y en la foto no dicen qué son. El dado al lado de «Turno 1» resulta ser la Taba, y nada lo dice.", "por_que": "La cuenta es el corazón del juego: Daño × Multi. Si más de la mitad de lo que suma son nombres propios que no se explican, el número final me llega como magia. No aprendo qué pieza construir. Lo marqué en la 0.18 y en la 0.19, y sigue.", "propuesta": "Glosario arriba de todo en JUGADAS, con Filo, Fortuna, Coraza, Brindis, canto, Golpe exacto y Degüello. En la mesa, el término con foco muestra su regla en un renglón bajo el desglose (la de hud.ts:39), también con el mando. La Taba lleva rótulo junto al dado («TABA 5»)." },
    { "prioridad": "P2", "pantalla": "portada, fin-derrota, botin-rey (también elegir-mazo)", "ventana": "1280x800", "archivo": "src/client/nav.ts:94-96 (todo botón de ELIGEN recibe el glifo A, tenga o no el foco)", "que": "En la primera pantalla hay dos A verdes: «A JUGAR» y «A ALTAR». En la derrota, «A OTRA VEZ» y «A ALTAR». En el Botín, dos «A ELEGIR». Con el mando no sé cuál de los dos dispara la A.", "por_que": "El glifo del botón es la promesa más simple del juego: «apretá esto». Si dos botones dicen lo mismo, la promesa es falsa, y pasa en la portada, que es la primera impresión.", "propuesta": "La A va solo en el botón con foco y sigue al foco, como ya hacen las opciones grandes (op-glifo en nav.ts:84). Los demás quedan sin glifo, o con la tecla del teclado en hueso apagado." }
  ],
  "aciertos": [
    "La bandeja dice «4 MÁS» / «5 MÁS» en hueso apagado y ya no parece un bonus: mi P1 de la 0.19, resuelto.",
    "Las Cábalas se leen por su marco (plata o dorado en piezas.png) y no aparece la palabra «Oro» suelta: mi P2 de la 0.19, resuelto.",
    "El mapa con «ESTÁS ACÁ» clavado y la ayuda pegada al nodo («PULPERÍA · Comprá Amuletos, purgá cartas, curate») se entiende sin leer nada más.",
    "El Comodín elegido se vuelve en la mano un 4 de Copas fantasma: ver la copia enseña su regla sin texto.",
    "El Rey que cae partido en dos y la Corte rasgada en la derrota se ven muy bien; la portada sobre tablas con vela es más cálida que la penumbra de antes."
  ],
  "capturas_vistas": [
    "visual-qa/1280x800/portada.png", "visual-qa/1280x800/elegir-mazo.png", "visual-qa/1280x800/cabala.png", "visual-qa/1280x800/mapa.png",
    "visual-qa/1280x800/mesa.png", "visual-qa/1280x800/mesa-seleccion.png", "visual-qa/1280x800/mesa-rey.png", "visual-qa/1280x800/mesa-mentiroso.png",
    "visual-qa/1280x800/elegi-una.png", "visual-qa/1280x800/pulperia.png", "visual-qa/1280x800/fogon.png", "visual-qa/1280x800/jugadas.png",
    "visual-qa/1280x800/piezas.png", "visual-qa/1280x800/fin-derrota.png", "visual-qa/1280x800/botin-rey.png", "visual-qa/1280x800/mesa-segunda-cambia.png",
    "visual-qa/1280x800/mesa-escudo.png",
    "jurado/secuencias/1280-golpe-00, 02, 04, 06, 08, 09.png", "jurado/secuencias/1280-rey-irrumpe-04.png",
    "mirar/1280-comodin-espectral-racha.png", "mirar/1280-rey-cae.png", "mirar/1280-conteo.png", "mirar/1280-fogon-suspenso.png"
  ]
}
```

## Primeras impresiones (antes de abrir el código)

- **¿Cómo gano un combate?** Bajo a cero la barra (340/340) de cada uno de la Corte («LA CORTE · QUEDA 1»). La previa casi siempre me dice cuánto le queda, salvo con DEGÜELLO.
- **¿Qué hace el enemigo?** «TE PEGA 23», o «19 · 21 − 2 ESCUDO». Claro. Con el Tajo armado avisa en la placa roja.
- **Números del enemigo:** Vida, TE PEGA y Furia, bien. El «10», «11» o «12» grande del naipe sigue siendo la cifra más visible del enemigo y no significa nada para mí.
- **Furia / Inmune / Escudo / Multi:** claros. **Canto:** el chip «¡ESCOBA!» sí, pero «Cantos hechos +10» no sé de dónde sale. **Golpe exacto:** solo por la estadística de la derrota. **Comodín:** se entiende al elegirlo, porque se vuelve copia.
- **Palabras que no conozco:** Filo, Fortuna, Taba cargada, Mano corta, Peso fuerte, Primera sangre, DEGÜELLO, ENGAÑO (LT), porotos (el icono es una gema), «Ni fu ni fa», «la primera pasada es segura», «A LA SUERTE: 60» (¿60 qué?).

## Defectos menores

- Botín: el Amuleto se dibuja con un candado, el mismo icono de los Mazos bloqueados, y se lee «cerrado» (`src/client/pantallas/camino.ts:513`, contra `menu.ts:146`).
- Conteo: los «+1» y «+20» que vuelan quedan encima del texto de GOLPEAR y DESCARTAR (golpe-06 y 09). Se arregla en el punto de partida de las cifras del HUD (`src/client/hud.ts:232-244`).
- Moneda falsa: «+2 de Daño por cada Oro del golpe» choca con ORO, mi plata (`src/rules/amuletos.ts:45`). Mejor «por cada naipe de Oros».
- Cábala: «A LA SUERTE: 60» sin el %, y la A tapa el borde del recuadro.
- Nota del material: la portada dice «v0.19.0», porque la foto es anterior al commit de versión. No es un defecto del juego.

## Contra mi veredicto de la 0.19.0

**Resueltos:** el «+N» que parecía bonus (ahora «4 MÁS») y «Oro» como nivel de Cábala. **No verificable:** el choque del canto con el daño en el clímax, porque la secuencia nueva es un Par sin canto; en golpe-09 el «301» ya cae al costado del naipe. **Sigue:** la jerga sin glosario. Además, «LO ABATÍS» retrocedió con DEGÜELLO.

## Qué haría en la próxima versión

Un pase de «idioma llano primero». (1) El veredicto de la previa siempre es uno de cuatro: LO ABATÍS, NO LO ABATÍS, EXACTO o SE PLANTA, y cualquier pieza que lo cause va en chiquito como causa. Lo cuida una prueba de QA que falle si un `.c-veredicto` no contiene una de esas cuatro palabras. (2) El glosario sube a la primera pantalla de JUGADAS y gana una entrada por cada término que pueda aparecer en el desglose. Otra prueba recorre los nombres que emite el motor y falla si alguno no tiene glosa. (3) La regla del término con foco se lee con el mando bajo la cuenta. (4) La A sigue al foco en todas las pantallas. (5) La cifra del naipe enemigo se apaga a hueso chico, y Vida y TE PEGA quedan como los dos números grandes. Nada de esto toca la Constitución, y me dejaría la claridad en 8.
