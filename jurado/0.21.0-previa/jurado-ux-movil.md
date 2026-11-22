```json
{
  "jurado": "jurado-ux-movil",
  "version": "0.21.0",
  "puntajes": { "claridad": 7.2, "diversion": 7.8, "estetica": 7.9, "veredicto": 7.5 },
  "defectos": [
    {
      "prioridad": "P0",
      "pantalla": "mesa con naipes en las Postas (mesa-seleccion, mesa-chispa, mesa-escalon, secuencias golpe y postas-golpe, mirar/390-conteo)",
      "ventana": "390x844",
      "archivo": "src/client/pantallas/mesa.ts:1693 (el «+N» nace a min(alto×0,58, 52) px del canto, pero en el teléfono solo asoman 28) + src/client/mano.ts:205-207 (la Posta queda a `asoma` px sobre la fila de la mano) + src/client/estilos/mesa.css:2112 (--asoma: 28px)",
      "que": "En el teléfono, de cada naipe apoyado solo asoma una franja de 28 px con el índice, y la mano que sobra se le monta encima. En `mesa-seleccion.png`, el 2 de Bastos del Medio (×2) queda tapado por el 3 de Copas, que no jugaste y queda adentro del marco de oro de esa Posta. Al contar, los «+N» nacen 24 px debajo de la franja, o sea sobre el naipe de la mano. En `390-golpe-03` y `390-postas-golpe-03`, el «+2» del Medio sale del 3 de Copas. En `mirar/390-conteo.png`, los dos «+6» del Par de 6 salen del As de Bastos y del 3 de Oros. Los 6 que suman no se ven.",
      "por_que": "Las Postas son lo nuevo de la versión, y en vertical la cuenta le muestra al jugador un origen equivocado. Así aprende que el 3 de Copas pega doble. Encima, para devolver un naipe desde su Posta hay que tocar una franja de 28 px, por debajo de las dianas de 44. En *Balatro* móvil la mano jugada sube a su propia fila y cada ficha nace del naipe que la da.",
      "propuesta": "En ≤700 px, con algún naipe apoyado, que el paño pase a una fila propia encima de la mano, a escala 0,7 y entero, y que la mano baje detrás de la barra del pulgar (ya lo hace con el pie). Si no, como mínimo: --asoma ≥ 44 px en el teléfono, el «+N» nacido en `rc.top + asoma/2` y la mano que sobra corrida fuera del Medio."
    },
    {
      "prioridad": "P1",
      "pantalla": "bandeja de Chiches en el renglón de fichas del HUD (mesa-chiches, mesa-chiche-usa, secuencia chiche-usa)",
      "ventana": "390x844",
      "archivo": "src/client/pantallas/mesa.ts:1112 y :1952 (un toque = usarChiche) + src/client/ui.ts:135 (la ayuda sale en pointerover, en el mismo toque) + src/client/estilos/mesa.css:4198-4202 (en ≤700 se esconden el rótulo y los huecos)",
      "que": "En el teléfono, los Chiches son tres redondeles de 44 px sin nombre ni carga: un vaso verde, un dado y un fósforo (`mesa-chiches.png`). La única forma de saber qué hacen es la ayuda, y la ayuda aparece con el mismo toque que los gasta. En `390-chiche-usa-01` → `-06`, el Dado se va y el lienzo da un destello, pero nada en pantalla dice que quedó cargado +3 de Multi hasta que armás una jugada.",
      "por_que": "Son de un solo uso y cuestan oro. Un consumible que no se puede mirar antes de usar castiga al curioso, y en móvil no existe pasar el cursor por encima. *Slay the Spire* móvil abre la poción con un toque y la usa con otro.",
      "propuesta": "Con el dedo (pointerType touch), que el primer toque levante el Chiche y abra su ayuda con «TOCÁ DE NUEVO o ARRASTRALO AL ENEMIGO», y que el segundo lo use. El arrastre al enemigo sigue siendo directo. Y que el Dado, una vez usado, deje un sello «🎲 +3» junto a la cifra del MULTI de la cuenta en reposo."
    },
    {
      "prioridad": "P1",
      "pantalla": "placa del enemigo (mesa, mesa-conteo, mesa-rey, mesa-segunda, mesa-mentiroso)",
      "ventana": "390x844",
      "archivo": "src/client/pantallas/mesa.ts:478 (con Cara de Póker, en reposo, la placa queda cruda) + :202 (.e-neto vive dentro de .e-golpe y el flex-basis de mesa.css:3347 no lo baja de renglón) + src/client/estilos/mesa.css:3343-3366 y :2118-2122",
      "que": "La causa del Escudo llegó a la placa, pero diminuta: «⛨ −2» en la letra de rótulo de 14 px, cian, con cifras de unos 7 px de alto. Queda al lado del 21 y no debajo, como dice el comentario. Contra los Reyes, las llamas de la Furia se le montan encima (`mesa-conteo`, `mesa-rey`: el «−1» casi no se ve). Desde que el teléfono de 844 usa la mesa compacta, la placa perdió la palabra TE PEGA y quedan unas espadas cruzadas y un número. Y en `mesa-mentiroso.png` (Escudo 22, Cara de Póker) la placa dice 23, cuando ese golpe no llega: el chip de la misma mesa con una jugada dice «NO TE PEGA · Cara de Póker».",
      "por_que": "Es el número que te mata, y en reposo miente o no dice por qué. El Mentiroso es el Mazo que más vive del Escudo y de la Cara de Póker.",
      "propuesta": "Sacar .e-neto de .e-golpe para que, en ≤700 px, vaya en su renglón debajo de la cifra: icono a 2× y «−20» en cifra hueso de 18 px. Las llamas de la Furia, a la izquierda de las espadas. Con Cara de Póker, en reposo: «0», con el antifaz de causa. Y devolverle a la placa la palabra TE PEGA en 844, aunque sea arriba en 14 px."
    }
  ],
  "aciertos": [
    "El grito del Personaje ya no cruza la pantalla: si no hay lugar a 120 px del retrato, no se dibuja (hud.ts:407). En `mesa-grito` sale pegado al retrato y en `390-rey-tajo-00` → `-12` no aparece en ninguna punta. Mi P1 de la 0.20 está resuelto.",
    "El sello «SE PLANTA EN LA MITAD · 60 SE PIERDEN» vive en el lienzo, bajo el número (`390-rey-segunda-06`, `-07`), y el número va en celeste piedra. La cifra grande ya no contradice a la barra.",
    "El Tajo de revés se lee entero en vertical: en la placa «46» con «23 ×2» al lado, y en el chip «TE PEGA 46 (23 ×2)» (`390-rey-tajo-00`).",
    "El paño de fieltro con el Medio en oro, el «×2» pegado al índice y el Escalón con sus peldaños y su «+3» (`mesa-escalon`) dan una mesa más física que cualquier versión anterior. La Prenda que vuela al hueco (`mesa-prenda`) se celebra bien.",
    "«ELEGÍ UNA» en el teléfono, sin el Botín fantasma detrás (`elegi-una`). 0 recortes y letra ≥ 14 px en las 45 medidas de 390x844, con todas las dianas de botón ≥ 44 px."
  ],
  "capturas_vistas": [
    "visual-qa/390x844: mesa, mesa-chiches, mesa-chiche-usa, mesa-escudo, mesa-escudo-mando, mesa-conteo, mesa-seleccion, mesa-postas-arrastre, mesa-chispa, mesa-escalon, mesa-mentiroso, mesa-rey, mesa-segunda, mesa-prenda, mesa-grito, mesa-arrastrando, rey-mascara, pulperia, pulperia-chiches, elegi-una, botin-rey, jugadas, altar, mapa, portada",
    "visual-qa/1280x800: rey-mascara, pulperia-chiches, mesa-seleccion (comparación)",
    "jurado/secuencias: 390-postas-golpe-00, -03, -06, -08, -10; 390-chiche-usa-01, -02, -03, -06; 390-rey-tajo-00, -04, -08, -11, -12; 390-rey-segunda-06, -07, -08, -10; 390-golpe-03; 390-rey-cae-12; 390-rey-irrumpe-05; 390-botin-brota-10",
    "mirar: 390-conteo, 390-comodin-espectral-racha",
    "recortes ampliados ×2–×4: placa de mesa, mesa-escudo, mesa-conteo; paño de mesa, mesa-seleccion, mesa-chispa, mesa-escalon; renglón de Chiches; máscara; cartel de segunda cara",
    "las 45 medidas.json de 390x844; contraste medido de los rótulos de Posta (3,5:1 apagados, 7,5:1 vacíos)"
  ]
}
```

## Veredicto

La 0.21.0 trae la mejor idea de mesa desde que juzgo: las Postas hacen que el orden de los naipes importe, y los Chiches dan una jugada de rescate fuera del turno. Diversión sube a 7,8. En vertical, en cambio, lo nuevo se ve peor que lo viejo. El paño queda debajo de la mano, y del naipe que pega doble asoman 28 px. Los «+N» salen de naipes que no jugaste. Los Chiches se gastan con el mismo toque que los explica. Claridad, que en mi ficha pesa doble, baja de 7,7 a 7,2.

Alcance: no corrí nada. El arrastre lo juzgo por `mesa-postas-arrastre` y `mesa-arrastrando`, que se ven bien («SOLTÁ ACÁ», DESCARTAR punteado, la Posta que apunta). El sonido de la Chispa y del Escalón lo conozco solo por código. La portada sigue diciendo «v0.20.0».

## Contra mi veredicto de la 0.20.0

**Resueltos:** el grito del Personaje que nacía lejos en la mesa (P1), el número contra el Rey que se planta (P2, ahora con su sello), el «…LEGIR» fantasma de ELEGÍ UNA y el índice de la Sota cortado en el Mentiroso. **A medias:** la causa del TE PEGA (P1) ya está en la placa, pero diminuta, tapada por la Furia y mal con Cara de Póker. **Siguen:** «?» y «≡» vacíos con mando, CERRAR arriba en JUGADAS, «Multi ×3 al cantar» en cuatro renglones y la Pulpería sin flecha de «hay más» (ahora peor, ver abajo).

## Defectos menores

- **La Pulpería con Chiches**: en 390 no se ve ningún Chiche del mostrador. `pulperia-chiches.png` es idéntica a `pulperia.png`: SERVICIOS queda vacío sobre SALIR y nada avisa que hay más abajo. `src/client/estilos/pantallas.css:1961` (.pul-cuerpo del teléfono) y `:3096` (bandejas-pie). Hace falta una ▼ como la de JUGADAS.
- **La máscara del Rey**: en 390 el óvalo queda negro y lo único que asoma es el cáliz y un trozo de manto, no la cara (`rey-mascara.png`; a 1280 sí se ve). En `src/client/estilos/mesa.css:4254-4260`, `top:-14%` no acompaña a --k2 del teléfono.
- **El grito tapa GOLPEAR**: aunque esté apagado, la palabra desaparece entera (`mesa-grito.png`). `src/client/hud.ts:404`: contar los botones apagados como zona que pesa, no como libre.
- **El sello SE PLANTA**: se monta sobre el nombre del Rey y sobre «230/460», justo cuando querés ver la barra frenarse (`390-rey-segunda-06`). Va en `src/client/estilos/mesa.css:4169`: arriba del número, no debajo.
- **Con Chiches, el HUD manda cuatro fichas más a «7 MÁS»**: Coraza y Brindis, que dan Escudo y Vida, dejan de verse (`mesa-chiches` contra `mesa`). Está en `src/client/estilos/mesa.css:4210`: que los Chiches tomen el lugar de las Cábalas sin contador, no el de las que lo tienen.

## Qué haría en la próxima versión

El paquete «la mesa vertical en dos pisos». En ≤700 px, en cuanto hay un naipe apoyado, el paño de Postas pasa a ser un piso propio entre la cuenta y la mano: naipes a 0,7×, enteros y con su marca (×2, Chispa, peldaño). La mano restante baja detrás de la barra del pulgar como ya hace el pie. Cada «+N» nace del naipe que lo da. Devolver un naipe es tocarlo entero (diana de 70 px). Los Chiches, con toque para mirar y doble toque o arrastre para usar, más el sello de lo que dejan armado en la cuenta. La placa del TE PEGA vuelve a decir su palabra y lleva la causa en su propio renglón, a 18 px y nunca bajo las llamas. Y una ▼ en la Pulpería. La Constitución, intacta: 3 a 5 Postas, tres huecos y Multi entero.
