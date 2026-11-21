```json
{
  "jurado": "jurado-ux-movil",
  "version": "0.17.0",
  "puntajes": { "claridad": 7.2, "diversion": 7.4, "estetica": 7.9, "veredicto": 7.3 },
  "defectos": [
    {
      "prioridad": "P0",
      "pantalla": "mesa contra el Caudillo en segunda cara (Tajo de revés armado), antes y después de soltar",
      "ventana": "390x844 y 390x664",
      "archivo": "src/client/estilos/mesa.css:2806-2813 (en ≤700 px se esconde .e-base, la cifra base tachada, y queda solo «42 ×2») + mesa.css:2918-2927 (el chip pierde «· TAJO» y dice «TE PEGA 42 ×2») + src/client/pantallas/mesa.ts:147-149, 159, 281-291 y :788 (tras el golpe se pone .tajo con la cifra base de vuelta)",
      "que": "En el teléfono la placa del Rey dice «42×2» y el chip de la cuenta «TE PEGA 42 ×2» (`390x844/mesa-segunda.png`, `390x664/mesa-segunda.png`; en `390-rey-tajo-04.png` «48×2» y el golpe real es −48 en `390-rey-tajo-12.png`). El 42 ya es el doble: la lectura natural es 84. Y justo después del golpe la misma placa pasa a «24×2» (`390-rey-tajo-10.png`, `-11`): el mismo «×2» pegado a la cifra significa una vez «ya multiplicado» y otra «se multiplicará». En el ancho lo salva la base tachada; en el móvil se escondió.",
      "por_que": "Es la decisión que define la segunda cara (repetir o cambiar de jugada) y es la segunda versión seguida en que el número más grande y más rojo de la pantalla del teléfono no dice lo que pega. Antes mentía por abajo (21 contra 42); ahora miente por arriba (84 contra 42). Balatro y StS móvil nunca ponen un multiplicador al lado de un resultado.",
      "propuesta": "Una sola gramática: la cifra grande es SIEMPRE lo que te va a pegar y el ×2 nunca va pegado a ella. Con el Tajo armado y la selección que repite: «42» grande, y debajo, en el lugar de la nota de Furia, un sello chico «TAJO ×2» (o «21→42» en hueso). El chip, «TE PEGA 42 · TAJO» sin «×2». Fuera de la selección que repite, sacar `.tajo` (mesa.ts:788 no debe dejarlo puesto tras el golpe). Sumar a la QA una regla: el texto de [data-n=ataque] es igual a q.contra cuando hay cuenta."
    },
    {
      "prioridad": "P1",
      "pantalla": "mesa tras recibir un golpe (y botín tras ganar): el grito del Personaje",
      "ventana": "390x844",
      "archivo": "src/client/hud.ts:281-311 (ubicarGrito solo esquiva button/[data-accion]; en el teléfono elige la derecha del retrato = la celda de Vida) + scripts/visual-qa.ts:205-211 («grito-tapa» solo mira controles)",
      "que": "El grito ya no tapa GOLPEAR ni SEGUIR, pero ahora se apoya sobre la Vida, el Escudo y el oro: en `390x844/mesa-grito.png` «¡AY, MI ESPALDA!» deja ver solo el «29» del oro; en `390-rey-tajo-11.png` y `-12` «¡EH, MÁS RESPETO!» cubre la Vida justo cuando baja 48, con el «−48» encima de GOLPEAR. En el Botín (`botin-grito.png`) tapa Vida, Escudo y oro mientras el oro está cobrando.",
      "por_que": "La Vida es la cifra que el jugador busca después de un golpazo; el bocadillo la oculta 1,5 s exactamente en ese instante. La QA lo da por bueno porque la Vida no es un botón.",
      "propuesta": "En ≤700 px el grito del Personaje usa el mismo canal que la voz del Bufón: la tira bajo la barra del enemigo (con el retratito del Personaje a la izquierda para marcar quién habla), o, si hay cuenta abierta, encima de la bandeja y a la izquierda de GOLPEAR sin cruzar la fila de cifras del HUD. Sumar a «grito-tapa» las cifras del HUD (.hud [data-n], la Vida y el oro) como zonas prohibidas."
    },
    {
      "prioridad": "P1",
      "pantalla": "mesa contra un Rey en segunda cara con una cuenta que NO dispara el Tajo",
      "ventana": "390x844",
      "archivo": "src/client/estilos/mesa.css:2801-2805 (la nota «incluida +3/turno» solo se esconde con .tajo) y :2857 (la placa compacta solo en ≤740 px de alto) + src/client/pantallas/mesa.ts:145 (furiaHtml con nota en dos renglones)",
      "que": "En `390-rey-tajo-08.png` (cuenta abierta, regla de la segunda cara a la vista, sin .tajo) la placa vuelve a llevar «incluida / +3/turno», crece unos 30 px, y su rótulo «TE PEGA» trepa sobre los botones «?» y «≡» de la cabecera. Es el caso común (elegir una jugada distinta, que es justo lo que la segunda cara pide) y el estado `mesa-segunda` de la QA solo congela la jugada repetida.",
      "por_que": "El arreglo de la trepada se hizo para 664 y para el caso con Tajo; en 844 con el naipe del Rey achicado por la cuenta más la regla de la segunda cara, la placa vuelve a montarse en la cabecera y el toque cerca de «?» cae en el tip del Ataque.",
      "propuesta": "En el teléfono, la nota de la Furia nunca en la placa (solo en el tip): basta con sacar `.tajo` del selector de mesa.css:2803 dentro de @media (max-width: 700px). Y un estado de QA `mesa-segunda-cambia` (Caudillo en segunda cara, selección distinta) con «solape-mesa» midiendo .e-ataque contra .mesa-top."
    }
  ],
  "aciertos": [
    "La segunda cara se lee: nombre y regla corta bajo la barra del Rey («TAJO DE REVÉS · Si repetís jugada, TE PEGA ×2», `390x844/mesa-segunda.png`) y dentro de la barra en 664; el Caudillo de segunda cara tiene dibujo propio (manto violeta) y se distingue de un vistazo.",
    "En 390x664 la placa del Ataque ya no trepa la cabecera: va al pie del naipe, a la derecha (`390x664/mesa-rey.png`, `mesa-segunda.png`); el Rey asoma hasta la barra.",
    "Chip de la cuenta y cifra del Rey coinciden (42/42, 48/48): el número de verdad es uno solo; falta sacarle el ×2 de al lado.",
    "Finales como escena, con los tres Reyes partidos y el retrato rajado (`fin-victoria.png`, `fin-derrota.png`); OTRA VEZ grande en la zona del pulgar.",
    "Letra ≥ 16 px (14 solo en los nombres de los finales), dianas ≥ 44 px, separación 8 px y 0 recortes en las 31 medidas de 390x844 y las 5 de 390x664."
  ],
  "capturas_vistas": [
    "visual-qa/390x844/mesa.png", "mesa-seleccion.png", "mesa-arrastrando.png", "mesa-mentiroso.png", "mesa-segunda.png", "mesa-grito.png",
    "botin.png", "botin-grito.png", "pulperia.png", "mapa.png", "elegi-una.png", "jugadas.png", "fin-victoria.png", "fin-derrota.png",
    "visual-qa/390x664/mesa-segunda.png", "mesa-rey.png", "mesa-seleccion.png", "mesa-mentiroso.png",
    "jurado/secuencias/390-rey-tajo-02.png", "-04", "-06", "-07", "-08", "-09", "-10", "-11", "-12",
    "390-golpe-03.png", "390-golpe-07.png", "390-golpe-09.png",
    "390-rey-segunda-06.png", "390-rey-segunda-12.png", "390-rey-cae-10.png", "390-rey-cae-16.png", "390-rey-irrumpe-05.png", "390-mapa-paso-03.png",
    "las 31 medidas.json de visual-qa/390x844 y las 5 de 390x664"
  ]
}
```

## Veredicto

La 0.17.0 arregla en el teléfono lo que se veía en la foto quieta: en 664 la placa del Ataque bajó al pie del naipe y dejó de comerse la cabecera, la segunda cara tiene nombre, regla de un renglón y dibujo propio, y el grito ya no se para encima de GOLPEAR ni de SEGUIR. Los finales como escena son lo más lindo que vi en 390. Estética sube a 7,9.

Claridad, que en mi ficha pesa doble, baja un poco (7,4 → 7,2). El Tajo de revés sigue sin leerse bien en el bolsillo: ahora la cifra grande es la de verdad, pero lleva un «×2» pegado y se lee 84. Medio segundo después del golpe, la misma placa dice «24×2» con el significado contrario. El grito, al mudarse, quedó sobre la Vida justo cuando baja. Y la trepada a la cabecera reaparece en 844 en el caso más común de la segunda cara: elegir otra jugada. Las tres cosas se ven en las secuencias y ninguna en la QA, porque las reglas miden botones y un solo estado congelado.

Alcance: no corrí nada. El arrastre lo juzgo por `mesa-arrastrando.png` (el naipe se posa sobre el Rey con «SOLTÁ ACÁ», DESCARTAR se marca con borde punteado; bien) y por código (mano.ts:65-66, 318: umbral de 14 px para el dedo). El sonido lo conozco solo por código, no lo oí. Sigue sin haber foto de 360x740 ni de la muesca.

## Contra mi veredicto de la 0.16.0

**Resueltos:** la placa que trepaba en 664 (estático); el grito sobre los botones. **A medias:** las dos cifras de TE PEGA ya coinciden, pero el ×2 al lado vuelve a mentir. **Siguen:** «HUECOS DE AMULETO: 0 DE 5» partido; CERRAR de JUGADAS arriba a la derecha; fila de atrás de la mano de 8 a 48 px; la QA sin 360x740 ni muesca.

## Defectos menores

- **390x664, mesa-segunda**: la placa «⚔42 ×2 🔥3» se monta sobre la cara del Caudillo (`src/client/estilos/mesa.css:2875-2882`, justify-self center: correrla a la derecha del naipe o achicar el ×2).
- **Pulpería**: «AMULETOS · HUECOS DE AMULETO: 0 DE 5» deja «DE 5» solo; «AMULETOS 0/5» alcanza (`src/client/pantallas/camino.ts:84`, `avance` en `textos.ts`). Los Servicios quedan bajo el pliegue sin indicio de desplazamiento.
- **Finales**: los nombres de los Reyes caídos a 14 px, tachados y en gris sobre oscuro, casi ilegibles (`src/client/estilos/pantallas.css:2347-2348`).
- **Cobro del botín**: el «+20» dorado se posa sobre la celda del oro mientras cuenta (`390-rey-cae-10.png`); que vuele hasta el borde de la celda y se apague antes (`src/client/fx/` del cobro, `mesa.ts` donde se lanza).
- **JUGADAS**: CERRAR arriba a la derecha, lejos del pulgar, y «Multi ×3 al cantar ¡ESCOBA!» en cuatro renglones (`src/client/estilos/pantallas.css`, modal de jugadas).

## Qué haría en la próxima versión

Paquete «una sola verdad por cifra en el bolsillo». Uno: gramática fija de TE PEGA en el teléfono: la cifra grande es lo que pega, nunca un multiplicador pegado; el Tajo como sello debajo, y la clase `.tajo` solo mientras la selección repite. Dos: un único canal de voz en ≤700 px (Bufón y Personaje en la tira bajo la barra del enemigo, con el retratito de quien habla), así el HUD de cifras no se tapa nunca. Tres: la nota de la Furia fuera de la placa en todo el teléfono. Cuatro: la QA congela los momentos que hoy solo se ven en secuencias (tras el Tajo, segunda cara sin repetir, grito con golpe) y suma reglas semánticas (cifra del Rey = q.contra) y de zonas prohibidas (cifras del HUD). Cinco: 360x740 y muesca en todos los estados de mesa. La Constitución, intacta.
