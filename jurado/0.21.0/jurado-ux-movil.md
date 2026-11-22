```json
{
  "jurado": "jurado-ux-movil",
  "version": "0.21.0",
  "puntajes": { "claridad": 7.6, "diversion": 7.9, "estetica": 8.0, "veredicto": 7.7 },
  "defectos": [
    {
      "prioridad": "P1",
      "pantalla": "mesa con naipes en el paño y mano de 8 (mesa-escudo, mesa-mando, mesa-chispa, mesa-escalon)",
      "ventana": "390x844",
      "archivo": "src/client/mano.ts:280-287 (los claros se reparten con idx = 26·k, el ancho de un índice y no el de un dedo) + src/client/mano.ts:252 (mínimo 26·k al abrir lugar a la enfocada)",
      "que": "Apenas apoyás un naipe, la mano de 8 se va a los claros del paño y se aprieta. En `mesa-escudo`, el 1, el 2, los dos 3 y el 4 quedan en tiras de 28 px a la izquierda mientras los dos 7 de la derecha tienen lugar de sobra (las medidas dan franjaMin 28). En `mesa-mando`, el 2 de Bastos queda detrás del Medio y solo se puede tocar por una tira de 26 px y su índice al pie. Lo que queda debajo de un naipe jugado solo se toca por su tercio de abajo.",
      "por_que": "Armar la jugada es justamente sumar naipes con el paño ya ocupado. Un toque errado elige al vecino, y mejorAcomodo reacomoda todo el paño, así que el error se paga dos veces. En *Balatro* móvil la mano apretada nunca baja de unos 40 px por naipe.",
      "propuesta": "Con pointer coarse, idx = max(44, 26·k). Si los claros no alcanzan, en vez de caer a «fila de siempre e índice al pie», que en ≤700 px los naipes del paño vayan a 0,8× y la mano se reparta pareja en todo el ancho. Que el .c-pie de cada naipe tapado sea una diana de 44×44. Y una regla de QA: franjaMin ≥ 44 en 390x844."
    },
    {
      "prioridad": "P1",
      "pantalla": "cuenta y paño con Medio, Chispa y Escalón (mesa-chispa, mesa-escalon, mesa-escudo)",
      "ventana": "390x844",
      "archivo": "src/client/estilos/mesa.css:2504 (en ≤700 se esconde .d-n de todo lo que no es .d-nombre) + src/client/pantallas/mesa.ts:358 (los pasos posta: llevan .d-posta pero no .d-nombre) + src/client/estilos/mesa.css:1343-1362 (el espectro esconde .c-rotulo)",
      "que": "En el teléfono, el desglose cobra las Postas solo con iconos: «◆ +3  ✦ +3  ⛰ +2». En la misma mesa a 1280 dice «Medio +3 · Chispa +3». El Comodín que da la Chispa se ve como un 3 sepia y lavado, sin el rótulo COMODÍN, y parece una carta apagada, como las del palo Inmune. La estrella queda en la costura con el naipe del Medio, que lo tapa a medias (`mesa-chispa`).",
      "por_que": "Medio, Chispa y Escalón son lo nuevo de la versión, y en vertical se cobran sin nombre. Para saber qué es ✦, el novato tiene que tocar un chip de unos 20 px. Encima, el naipe que causa la Chispa parece muerto.",
      "propuesta": "En ≤700 px, que .d-posta lleve .d-nombre: «Medio +3», «Chispa +3», «Escalón +2» son palabras cortas y entran en los dos pisos de la cuenta. Que el espectro conserve un banderín «★» de 14 px junto al índice, en la franja que asoma, y un brillo dorado en vez del lavado sepia."
    },
    {
      "prioridad": "P2",
      "pantalla": "Dado Cargado tirado en reposo (secuencia chiche-usa, mesa-chiches)",
      "ventana": "390x844",
      "archivo": "src/client/pantallas/mesa.ts:339 (el chip .d-dado vive en .cuenta.reposo) + src/client/estilos/mesa.css:2540-2556 (en el teléfono el bocadillo del Bufón ocupa ese lugar en reposo)",
      "que": "En `390-chiche-usa-01` → `-06` el Dado sale volando y estalla donde iría la cuenta, y después no queda nada. Ni un «MULTI +3» en reposo, ni el hueco del Chiche marcado. Recién aparece al elegir cartas (`390-postas-golpe-00`, «MULTI +3» en el desglose). No vi el estado «listo» del primer toque, solo lo leí en el código (mesa.ts:1980-1990): no hay captura de 390.",
      "por_que": "Si gastaste oro y no ves que el efecto quedó armado, pensás que el toque falló y tocás otro Chiche.",
      "propuesta": "En ≤700 px, mientras el Dado esté armado, que su hueco del HUD muestre un sello «MULTI +3» en oro (en vez de vaciarse) hasta el golpe, y que el bocadillo del Bufón no tape la cuenta en reposo. Sumar a la QA el estado `mesa-chiche-listo` en 390."
    }
  ],
  "aciertos": [
    "El paño va encima de la mano y cada «+N» nace del naipe que lo da. En `390-postas-golpe-03`, el +2 sale del 2 de Oros y del 2 de Bastos, y no del 3 de Copas que no jugaste. Mi P0 de la previa está resuelto.",
    "La mano de 8 en reposo, en dos filas (`mesa-mentiroso`): de la fila de atrás asoman 46 px con índice y pinta, y el paño se pliega a una banda de 28 px con sus símbolos. Es la mejor mano vertical que juzgué en CÁBALA.",
    "La placa vuelve a decir TE PEGA y lleva la causa en su propio renglón («⛨ −22» debajo del 1, en `mesa-mentiroso`; el antifaz y la Furia en `mesa-rey`).",
    "La Pulpería del teléfono abre con sus Chiches arriba (`pulperia-chiches`), la máscara del Rey ahora enseña la cara (`rey-mascara`) y la portada dice v0.21.0.",
    "En 390x844: 0 recortes, ninguna letra por debajo de 14 px y todos los botones con diana de 44 px o más en las 45 medidas, y 60 fps holgados en reposo y en golpes."
  ],
  "capturas_vistas": [
    "visual-qa/390x844: mesa, mesa-seleccion, mesa-arrastrando, mesa-postas-arrastre, mesa-chispa, mesa-escalon, mesa-escudo, mesa-escudo-mando, mesa-mando, mesa-mentiroso, mesa-conteo, mesa-rey, mesa-chiches, mesa-chiche-usa, mesa-prenda, mesa-grito, rey-mascara, pulperia, pulperia-chiches, jugadas, mapa, botin-rey, fogon",
    "visual-qa/1280x800: mesa-seleccion, mesa-chispa (comparación)",
    "jurado/secuencias: 390-postas-golpe-00, -03, -06; 390-chiche-usa-01, -03, -06; 390-golpe-02, -05, -08; 390-rey-irrumpe-03, -07; 390-rey-cae-08; 390-rey-segunda-06; 390-botin-brota-10; 390-portada-04",
    "mirar: 390-conteo, 390-comodin-espectral-racha",
    "recortes ampliados ×2–×4: mano de mesa-escudo, mesa-chispa, mesa-escalon y mesa-mentiroso; cuenta y paño de mesa-conteo; placa de mesa-rey; Comodín espectral de mesa-chispa",
    "las 45 medidas.json de 390x844; jurado/fps.txt"
  ]
}
```

## Veredicto

La 0.21.0 final arregla lo que la previa rompía en vertical. El paño va encima de la mano, los «+N» nacen donde tienen que nacer, la placa vuelve a decir TE PEGA y los Chiches ya no se gastan con el mismo toque que los explica. La mano de 8 en reposo, en dos filas con el paño plegado (`mesa-mentiroso`), es lo mejor que vi en CÁBALA para el pulgar. El problema aparece en cuanto empezás a jugar. Con un naipe en el paño, la mano se aprieta en tiras de 26 a 28 px, y las Postas se cobran en el teléfono con iconos sin nombre. Claridad, que en mi ficha pesa doble, sube de 7,2 a 7,6. Todavía no llega a 8, porque el momento de armar la jugada es el más fino del juego y en el teléfono es el más apretado.

Alcance: no corrí nada. El primer toque «listo» de los Chiches, la vibración y el alza del naipe arrastrado (70 px sobre la yema, mano.ts:82) los leí en el código y no los vi. Sospecho que al reordenar Postas con el dedo el naipe vuela sobre la cuenta y no sobre la Posta que se enciende, pero sin captura no lo puedo afirmar.

## Contra mi veredicto de la previa

**Resueltos:** el P0 de las Postas bajo la mano y los «+N» del naipe equivocado. El P1 de los Chiches sin ayuda previa, según el código; el Dado ahora se lee «MULTI +3» en el desglose. El P1 de la placa (TE PEGA, causa en su renglón, Cara de Póker). También la Pulpería con Chiches, la máscara del Rey y la versión en la portada. **Siguen:** el grito que tapa GOLPEAR, JUGADAS con CERRAR arriba y la bandeja de Chiches que manda fichas a «7 MÁS» (`mesa-chiches`). **No visto en esta tanda:** el sello SE PLANTA sobre el nombre del Rey.

## Defectos menores

- **JUGADAS**: CERRAR sigue arriba a la derecha, fuera del pulgar, y «Multi ×3 al cantar ¡ESCOBA!» ocupa cuatro renglones (`src/client/pantallas/camino.ts:174` y `:188`).
- **El grito tapa GOLPEAR**: «¡AY, MI ESPALDA!» se come la palabra GOLPEAR apagada (`mesa-grito`). En `src/client/hud.ts:334`, un botón apagado solo cuenta como «mejor no»; tendría que pesar como zona dura en la barra del pulgar.
- **La mano de 3 parece jugada**: en reposo cae justo dentro de las Postas, debajo de sus rótulos «en orden: Escalón» y «Medio: pega doble» (`mesa`, `mesa-rey`, `mesa-chiches`), y parece que ya está apoyada. Está en `src/client/mano.ts:213-215`: con el paño vacío, que los rótulos no vayan sobre naipes sin elegir.
- **La Furia, dos veces**: la placa del Rey dibuja dos llamas, una pegada al 0 y otra en el chip de Furia (`mesa-rey`, `390-rey-segunda-06`). Se ve ruido sobre la cifra que importa (`src/client/estilos/mesa.css:1371`).
- **Las fichas del HUD con Chiches**: Coraza y Brindis se van a «7 MÁS» (`src/client/estilos/mesa.css:4303`, margin-right con --ancho-chiches).

## Qué haría en la próxima versión

El paquete «la mano que juega con el pulgar». En ≤700 px, en cuanto hay un naipe apoyado, el paño se pone a 0,8× y la mano restante se reparte pareja en todo el ancho, con un mínimo de 44 px por naipe y el pie de cada naipe tapado como diana, y la QA lo vigila con franjaMin ≥ 44. La cuenta del teléfono nombra las Postas («Medio», «Chispa», «Escalón»), y el Comodín espectral lleva su ★ a la vista. Los Chiches dejan un sello de lo que tienen armado en su propio hueco hasta el golpe, y se suma la captura del primer toque. JUGADAS con CERRAR abajo, en la barra del pulgar. Y una secuencia `390-postas-reordena` para ver el arrastre entre Postas con el dedo. La Constitución, intacta: de 3 a 5 Postas, tres huecos de Chiche y Multi entero.
