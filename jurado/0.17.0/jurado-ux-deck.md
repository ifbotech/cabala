```json
{
  "jurado": "jurado-ux-deck",
  "version": "0.17.0",
  "puntajes": { "claridad": 7.4, "diversion": 7.6, "estetica": 8.4, "veredicto": 7.5 },
  "defectos": [
    { "prioridad": "P1", "pantalla": "Mesa: grito del Personaje (mesa-grito, y en vivo justo después de comerte el Tajo en 1280-rey-tajo-11)", "ventana": "1280x800", "archivo": "src/client/hud.ts:281-310 (ubicarGrito: solo esquiva '#app button, [data-accion]', no las celdas de cifras del HUD)", "que": "El bocadillo «¡AY, MI ESPALDA!» / «¡EH, MÁS RESPETO!» se apoya a la izquierda del retrato, a la altura del HUD, y tapa enteras las cifras de ESCUDO y ORO durante 1,5 s. En 1280-rey-tajo-11 pasa en el mismo cuadro en que cae «-48»: perdés la Vida y no ves con cuánto Escudo ni con cuánto oro quedaste. La puerta dice 0 solapes porque esas cifras no son dianas.", "por_que": "A 40 cm, el HUD es lo único que se mira de reojo tras recibir un golpe. Tapar dos de las tres cifras de estado en el momento de más tensión es exactamente el «no sé cómo quedé» que la Deck castiga: no hay puntero para pasarle por encima ni tiempo para esperar.", "propuesta": "Que ubicarGrito sume a los obstáculos '.hud-celda' (o todo '.hud' salvo el retrato) y, si no hay costado libre, ponga el grito ENCIMA del retrato, sobre la mesa entre la mano y el HUD (hay 60 px libres). Sumar a la QA la intersección .hud-grito ∩ cifras del HUD en mesa-grito." },
    { "prioridad": "P1", "pantalla": "Mesa con mando: foco en un naipe templado (mesa-mando)", "ventana": "1280x800", "archivo": "src/client/ui.ts:150-163 (ubicarTip: siempre arriba del ancla) y src/client/mano.ts:424-428 (data-tip del temple en cada carta templada)", "que": "Con la cruceta sobre el 9 de Oros templado, la ayuda «NAIPE TEMPLADO EN EL FOGÓN · +8 de Daño y +1 de Multi» se abre encima de la carta y tapa la mitad de la cuenta: el «= 168», CURA, TE PEGA y la mitad del desglose. Con mando el foco ES el cursor, así que la ayuda aparece sola cada vez que pasás por esa carta.", "por_que": "Elegir cartas con la cruceta es leer la cuenta mientras movés el foco; justo la carta que más suma esconde el total que querés comparar. Con puntero se aparta el mouse; con mando no hay forma de ver carta y total a la vez.", "propuesta": "Para '.carta' con data-entrada='mando', ubicar la ayuda al costado de la mano (en el hueco entre la mano y GOLPEAR) o por debajo del índice, nunca por encima de la línea superior de la mano; o directamente mostrarla solo con un botón (R3/«ver») y dejar el «+8★» como la única pista en reposo." },
    { "prioridad": "P1", "pantalla": "TE PEGA del Caudillo con Tajo de revés (mesa-segunda, 1280-rey-tajo-03 → 09)", "ventana": "1280x800", "archivo": "src/client/pantallas/mesa.ts:147-159 (cifra grande + e-tajo ×2), :281-291 (golpe = q.contra solo mientras haya selección) y :788 (deguello vuelve a sumar .tajo sin reescribir la cifra)", "que": "Antes de soltar, la columna dice «TE PEGA ~~24~~ 48 ×2»: el número grande ya viene duplicado y al lado lleva otro ×2 en grande, así que se lee 96. Cuando el Tajo cae (rey-tajo-09) la selección ya se vació y la misma columna pasa a «~~24~~ 24 ×2». En un segundo el jugador ve dos fórmulas distintas para el mismo golpe; el chip de la cuenta, «TE PEGA 48 · TAJO ×2», repite la ambigüedad.", "por_que": "Pedí que la cifra grande dijera la verdad y lo hizo, pero ahora el ×2 suelto la contradice. Es la cifra que decide si repetís o no la jugada contra el jefe del tramo 1; a 40 cm, «48 ×2» se lee como multiplicación pendiente, no como explicación.", "propuesta": "Una sola gramática en ambos momentos: cifra grande = golpe final (48), y la causa como rótulo, no como operador («TAJO» o «24 ×2 =» chico encima, junto al tachado). En deguello, reescribir data-n=ataque con el golpe real antes de animar. En la cuenta, «TE PEGA 48 (TAJO)»." }
  ],
  "aciertos": [
    "mesa-segunda quedó limpia en las dos ventanas: el rasgo «TAJO DE REVÉS» va al costado de la barra de Vida y la cuenta entra en dos renglones con «TE PEGA 42 · TAJO ×2» fundido; en 1366x768 ya no se tapa el 192 ni el chip.",
    "Mapa con mando: el foco se centra en el rollo y la ayuda va en un carril lateral a la altura del nodo; «ESTÁS ACÁ» ya se lee entero y el corrimiento vertical bajó a ±0,05 (camino.ts:268).",
    "La pista «A elige · X golpea · Y descarta» con glifos de color sobre la mano, y X/Y/LT/SEL/RT en botones: en la mesa el mando se enseña solo.",
    "minPx 18 en las 31 pantallas de 1280 y 1366; dianas ≥ 48 px; FPS 164,6 bajo golpes en 1280x800, peor cuadro 12 ms.",
    "Los Reyes con dibujo de segunda cara y el cartel de entrada (rey-irrumpe-05) se leen a distancia: nombre a ~26 px y retrato grande."
  ],
  "capturas_vistas": [
    "visual-qa/1280x800/mesa-segunda.png", "visual-qa/1366x768/mesa-segunda.png", "visual-qa/1280x800/mapa-mando.png", "visual-qa/1280x800/mesa-mando.png",
    "visual-qa/1280x800/mesa-rey.png", "visual-qa/1280x800/mesa-grito.png", "visual-qa/1280x800/mesa-mentiroso.png", "visual-qa/1280x800/pulperia.png",
    "visual-qa/1280x800/jugadas.png", "visual-qa/1280x800/piezas.png", "visual-qa/1280x800/elegi-una.png",
    "jurado/secuencias/1280-mando-00/03/06/10/12/14/17.png", "jurado/secuencias/1280-mando-elige-01/03.png",
    "jurado/secuencias/1280-rey-tajo-03/09/11.png", "jurado/secuencias/1280-golpe-04.png", "jurado/secuencias/1280-rey-irrumpe-05.png", "jurado/secuencias/1280-mapa-paso-03.png",
    "medidas.json de las 31 pantallas de 1280x800 y 1366x768 (node)", "jurado/fps.txt"
  ]
}
```

## Veredicto

La 0.17.0 arregló lo que más me dolía de la 0.16: la segunda cara ya no se come la cuenta y el Mapa con cruceta se entiende. En reposo, la mesa a 1280x800 sigue siendo de lo más legible que vi en esta silla. Lo que la frena es lo mismo que la vez pasada: lo que aparece **encima** de algo sin que la puerta lo mida. Esta vez son el grito sobre las cifras del HUD, la ayuda de la carta templada sobre el total y el TE PEGA con dos fórmulas para un solo golpe. Sigue en «Verificado con reparos».

**Seguimiento de la 0.16.0:** resuelto el P1 de mesa-segunda en 1366. El P1 del Mapa está resuelto en buena parte: el chip se lee y la ayuda va al costado. Pero «ESTÁS ACÁ» sigue arriba del nodo y toca los sellos del de arriba (mapa-mando), y no queda claro de quién es. El P2 de la cifra del Tajo está resuelto en reposo, pero con el ×2 suelto se lee 96 y en el golpe vuelve a 24 (lo convertí en el P1 n.º 3). Menores que siguen: glifos B y Start, el separador que se come el término encendido, la ficha «∠» que parece un 2 y «Turno 1» a 18 px.

Avisos sobre el material: la portada de la QA dice «v0.16.0», así que las capturas son anteriores al cambio de número. golpe, rey-tajo y rey-irrumpe siguen grabadas en modo puntero (AL DESCARTE a la vista). El sonido del Tajo y el volteo del Rey los leí en el código, no los vi ni los oí.

## Defectos menores

- No hay glifo B en SALTAR, SEGUIR, CERRAR, ‹ VOLVER ni SALIR, ni glifo A en ELEGIR del Botín. El tipo tiene 'B' y nadie lo usa: `src/client/pantallas/camino.ts:371,500,515`, `src/client/nav.ts:74`.
- «ESTÁS ACÁ» se ancla arriba del nodo (`top` negativo) y queda pegado a los sellos del piso de arriba (mapa-mando, mando-elige-03): `src/client/estilos/pantallas.css:291-298`. Ponelo debajo.
- Los «+N» que brincan en la bandeja tapan la ficha y se pisan entre sí: «+8» encima del «0» y «+1» sobre «+8» en 1280-mando-03 y 1280-golpe-04 (`src/client/hud.ts`, brinco de fichas).
- Al encenderse, el término del desglose se come el separador («Mate curado +4▮Filo +4», 1280-mando-03): `src/client/estilos/mesa.css` (.d-t encendido).
- En el Tajo se juntan cuatro capas sobre el Rey: 312, ×2, el rótulo «TAJO DE REVÉS ×2» y el bocadillo «¡Así se pega, carajo!», que además tapa la barra del Rey y CURA (1280-rey-tajo-09). Fuente: `src/client/pantallas/mesa.ts:783` (rotuloRey) más el bocadillo del Personaje.

## Qué haría en la próxima versión

«Nada encima de una cifra». Primero, una regla de QA general: ninguna capa transitoria (grito, tip, rótulo del Rey, «+N») puede cruzar la caja de una cifra de estado (Vida, Escudo, Oro, Mazo, total de la cuenta, TE PEGA). Que se mida en los estados fijos y en los cuadros de las secuencias de 1280, no solo en las dianas. Segundo, un carril fijo para lo efímero en la Deck: los gritos sobre el retrato, encima del HUD, y las ayudas de carta al costado de la mano. Tercero, una gramática única para el daño del enemigo: cifra final grande y causa como rótulo, igual antes y durante el golpe. Cuarto, completar los glifos (A en toda opción, B en todo volver o saltar, Start en MENÚ) y grabar todas las secuencias de 1280 con data-entrada='mando'. Nada toca reglas ni la Constitución.
