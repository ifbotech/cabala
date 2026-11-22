```json
{
  "jurado": "jurado-ux-deck",
  "version": "0.28.0",
  "puntajes": { "claridad": 8.9, "diversion": 8.7, "estetica": 8.8, "veredicto": 8.8 },
  "defectos": [
    { "prioridad": "P2", "pantalla": "Mesa con muchas piezas y el dial abierto: el desglose (mesa-dejalo-justo en español y en inglés; en menor grado mesa-chinchon)", "ventana": "1280x800", "archivo": "src/client/estilos/mesa.css:5083-5090 (nivel chico-4: 14 px y nombres a 4,6em) y 6278-6300; src/client/pantallas/mesa.ts:355-363 (el escalón de niveles)", "que": "Cuando el desglose no entra en el alto del paño baja a 14 px y corta los nombres: «Cantos… +4», «Primer… +8», «Taba c… +10», «Mano c… +3», «SOL DE… +1». En inglés, seis de once términos quedan en «Calls m…», «First Bl…», «Loaded…», «Small h…», «Knuckl…», «SUN OF…». En mesa-chinchon, a 16 px, pasa lo mismo con «Cantos h…», «Taba car…», «Mano chi…», «SOL DE L…».", "por_que": "Es la letra más chica del juego (las medidas dan 14 px de mínimo donde la 0.27 daba 16) y cae justo en la decisión más fina de la mesa, DEJALO JUSTO. A 40 cm, 14 px con puntos suspensivos no se lee: es mejor que la tira de iconos de la 0.27, pero sigue sin decir qué pieza puso cada número. El total y el resultado se leen bien, por eso es P2.", "propuesta": "Piso de 16 px. Antes de achicar, juntar los términos más chicos en «otras +N» (su detalle queda en SEL JUGADAS) y dejar con nombre entero los tres que más pesan. El dial R3 puede ir en un renglón para devolverle alto a la columna." },
    { "prioridad": "P2", "pantalla": "Mesa con una Evolución en el golpe: «GARROTE DEL CAC… +20» y «GARROTE DEL CAC… +2» (mesa-garrote)", "ventana": "1280x800 y 1366x768", "archivo": "src/client/estilos/mesa.css:5069-5076 (max-width: 11em para todo .d-n, también sin apretar)", "que": "El nombre de la Evolución se corta aunque el renglón tiene lugar de sobra: a 1280 quedan unos 280 px libres a la derecha y a 1366 más de 300. Los dos renglones (DAÑO y MULTI) muestran el mismo «GARROTE DEL CAC…». A 1366 la 0.27 decía GARROTE DEL CACIQUE entero.", "por_que": "La Evolución es la pieza estrella de la partida y es la única que va en letra de rótulo, más ancha: el tope de 11em la corta siempre. Es un retroceso en el portátil y un recorte sin motivo en la Deck.", "propuesta": "Sin nivel «chico», ningún tope de ancho. El tope solo entra cuando la columna de verdad no cabe, y para la letra de rótulo se mide aparte." },
    { "prioridad": "P2", "pantalla": "El foco con mando: tres marcos distintos y la ayuda sobre el rótulo de la bandeja (mesa-mando, hud-evolucion-foco, piezas)", "ventana": "1280x800", "archivo": "src/client/estilos/base.css:346-349 (contorno hueso), src/client/estilos/mesa.css:4253 y 4267 (oro), 3872 y 4121 (celeste); src/client/ui.ts:245-312 (ubicarTip)", "que": "Naipes, botones y nodos llevan marco celeste con ▼; la bandeja del HUD, marco dorado sin ▼ (hud-evolucion-foco); las fichas de Lo que llevás, marco blanco (piezas). Además la ayuda del Fósforo tapa «L3 CHICHES» y media vela (mesa-mando), y la de la bandeja deja asomar «ES» del mismo rótulo.", "por_que": "En la Deck el foco es el puntero. Tres colores obligan a buscarlo de nuevo en cada zona, y el dorado se confunde con los marcos de oro del propio HUD. El rótulo tapado es justo el que dice con qué botón se llega ahí.", "propuesta": "Un solo foco celeste con ▼ en todo el juego. Sumar el rótulo «L3 CHICHES» a las zonas que la ayuda no pisa: la ayuda del Chiche puede ir a la izquierda de la bandeja, sobre el paño vacío." }
  ],
  "aciertos": [
    "El sello SE PLANTA se ve: caja cian de dos renglones al costado de la barra del Rey, «SE PLANTA EN LA MITAD / 230 SE PIERDEN» en rey-planta-09 a 12 y «100 SE PIERDEN» en rey-segunda-09 a 11, entero dentro de la pantalla y sin nada encima. Después cae el cartel de la SEGUNDA CARA.",
    "El desglose a 1280 ya tiene dueños: «Medio +9, Cantos hechos +4, Filo +4, Primera sangre +8, Taba cargada +10» sobre fondo opaco (mesa-mando, mesa-segunda). La vela ya no ensucia la primera cifra.",
    "La ayuda del foco dejó libres La Corte, el renglón de botones, el desglose y al Bufón: en mapa-mando la de GUARDIA va a la derecha con sus dos escudos a 60 px.",
    "La mano no se mueve entre mesas y apoya entera sobre el HUD. La mano de 8 en abanico (mesa-escudo-mando) deja ver el índice de cada naipe y trae el enfocado al frente. ENGAÑO lleva su regla y su LT, y la pista suma «LT engaña».",
    "La Pulpería: «+23 de Vida» entra a 1366 sin depender de «HAY MÁS» y la tarjeta EVOLUCIONA en dos columnas se lee a 18 px con su MALDICIÓN aparte."
  ],
  "capturas_vistas": [
    "jurado/secuencias/1280-rey-planta-04, 08, 09, 11, 13, 14", "jurado/secuencias/1280-rey-segunda-07, 09, 10, 11, 12, 15", "jurado/secuencias/1280-mando-elige-01 y 03",
    "visual-qa/1280x800/mesa-mando.png", "visual-qa/1280x800/mesa-garrote.png", "visual-qa/1280x800/mesa-chispa.png", "visual-qa/1280x800/hud-evolucion-foco.png", "visual-qa/1280x800/mesa-rey.png",
    "visual-qa/1280x800/mesa-dejalo-justo.png", "visual-qa/1280x800/mesa-chinchon.png", "visual-qa/1280x800/mesa-escudo-mando.png", "visual-qa/1280x800/mesa-mentiroso.png", "visual-qa/1280x800/mesa-segunda.png", "visual-qa/1280x800/mesa-escalon.png",
    "visual-qa/1280x800/mapa-mando.png", "visual-qa/1280x800/jugadas.png", "visual-qa/1280x800/piezas.png", "visual-qa/1280x800/pulperia-evoluciona.png", "visual-qa/1280x800/fogon.png", "visual-qa/1280x800/elegi-una.png",
    "visual-qa/1366x768/mesa-rey.png", "visual-qa/1366x768/mesa-garrote.png", "visual-qa/1366x768/pulperia.png",
    "visual-qa-en/1280x800/mesa-dejalo-justo.png",
    "medidas.json de las 68 pantallas de 1280x800 y de 1366x768 (node)"
  ]
}
```

## Veredicto

La 0.28.0 cierra mi único P1: **0 P0 y 0 P1 abiertos**. Sube dos décimas (tres en claridad) y todavía no llega al 9,1: lo que la frena es la letra del desglose cuando la mesa se llena, no algo roto.

**El sello SE PLANTA: cerrado de verdad.** Lo miré cuadro por cuadro. En `1280-rey-planta` entra en el cuadro 08 (todavía translúcido, llegando desde la derecha), está entero y nítido en 09, 11 y 12 con «230 SE PIERDEN», y en el 13 ya no está y empieza la rajadura. En `1280-rey-segunda` está en 09, 10 y 11 con «100 SE PIERDEN», junto al 99 púrpura sobre el Rey y la barra en 195/390; en el 12 se fue. La caja queda dentro de la ventana y nada la pisa. Un resto menor: mientras dura tapa el chip de la habilidad del Rey y corta «FURIA 3 ya incluida».

**Seguimiento de la 0.27:**
- **P1 sello SE PLANTA:** resuelto.
- **P2 desglose sin nombres a 1280:** resuelto en las mesas normales; queda el caso apretado (14 px con «…») y el Garrote cortado sin necesidad.
- **P2 la ayuda tapa lo que se lee:** resuelto para La Corte, botones, desglose y Bufón; sigue sobre «L3 CHICHES».
- **Menores:** resuelto «+23 de Vida» a 1366. Siguen los tres marcos de foco. El cartel SEGUNDA CARA sobre el chip y la frase del Rey bajo los rayos no los volví a comprobar.

**Medidas (node sobre los .medidas.json, 68 pantallas por ventana):** fuera de la mesa la letra mínima es 18 o 20 px. En la mesa, 16 px («Medio: pega doble», «L3 CHICHES», el «+6» del naipe) y 14 px en nueve estados a 1280: el rótulo «COMODÍN» del naipe y el «DAÑO» del desglose apretado de mesa-dejalo-justo. Ningún texto bajo 14, recortes 0, solapes de dianas 0. Diana mínima 104 × 48 px. Franja visible por naipe con mano de 8: 92 a 104 px a 1280 y 99 a 117 a 1366. FPS: 164 en reposo y en golpes a 1280, peor cuadro 12 ms.

Aviso: la navegación de la cruceta, el sonido y el hitstop los leí en código, no los vi. La captura elegi-una muestra el foco en SALTAR; en `src/client/pantallas/camino.ts:411` el foco inicial es la primera opción y el primer B lo lleva a SALTAR, así que no lo cuento como defecto.

## Defectos menores

- El sello SE PLANTA tapa el chip del Rey y corta «FURIA 3 ya incluida» mientras dura; en el cuadro 08 entra translúcido por encima del chip. `src/client/estilos/mesa.css:5772-5800`.
- Rótulo «COMODÍN» del naipe a 14 px, y en vertical cuando el naipe queda montado (mesa-escudo-mando, mesa-escalon). `src/client/estilos/mesa.css`, no ubiqué la línea.
- Las pistas del paño («Medio: pega doble», «3 o más en subida…») a 16 px en gris sobre madera: poco contraste para la Deck. `src/client/estilos/mesa.css`, bloque `.c-pista-pano` (cerca de 5060).
- En el mapa, los escudos de Inmune bajo cada nodo miden unos 28 px y los nodos lejanos van atenuados: solo se distinguen en la ayuda. `src/client/pantallas/camino.ts:324` y su CSS.
- A 1366 la causa «21 − 3 ESCUDO» se parte en dos renglones a la izquierda de la cifra del TE PEGA (mesa-rey). `src/client/estilos/mesa.css`.

## Qué haría en la próxima versión

**«Ninguna letra de juego bajo 16».**
1. Desglose con piso de 16 px: los tres términos que más pesan con nombre entero y el resto en «otras +N»; el dial R3 en un renglón.
2. Nombres sin tope de ancho mientras el renglón tenga lugar; la Evolución nunca se corta.
3. Un solo foco celeste con ▼, también en la bandeja del HUD y en Lo que llevás.
4. La ayuda del Chiche a la izquierda de la bandeja, sin pisar «L3 CHICHES».
5. El sello SE PLANTA un renglón más abajo, o el chip del Rey corrido mientras dura, para que FURIA y la habilidad sigan a la vista.
6. «COMODÍN» y las pistas del paño a 18 px con más contraste.

Nada de esto toca la Constitución.
