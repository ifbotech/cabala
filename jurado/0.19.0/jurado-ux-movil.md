```json
{
  "jurado": "jurado-ux-movil",
  "version": "0.19.0",
  "puntajes": { "claridad": 7.5, "diversion": 7.5, "estetica": 7.9, "veredicto": 7.5 },
  "defectos": [
    {
      "prioridad": "P1",
      "pantalla": "mesa, el número de tu golpe sobre el Rey (secuencias rey-segunda y rey-cae)",
      "ventana": "390x844",
      "archivo": "src/client/pantallas/mesa.ts:537-540 (carrilDano: borde derecho en r.left + 4 % del naipe, alinear 'derecha', vx −18) y :913-917 + src/client/fx/efectos.ts:279-306 (el tope contra el borde se aplica solo al nacer; después vx lo empuja a la izquierda y el rebote k = escala+1 lo agranda corrido hacia afuera)",
      "que": "En el teléfono el naipe del Rey arranca en x≈80, así que un golpe de tres cifras a escala 2 nace contra el borde izquierdo y se va de la pantalla. En `390-rey-segunda-06.png` el «297» se lee «29» con el 2 mordido por el borde y el 7 encima del cuerpo del Rey. En `-08` y en `390-rey-cae-04.png` («243») arranca en x=0. Mide unos 120 px de alto y tapa entera la columna izquierda: el Bufón, tu Escudo y el «INMUNE».",
      "por_que": "Es la cifra del clímax, la que se saca captura y se comparte. En *Balatro* móvil el número grande nunca se corta y nunca tapa tus defensas. Acá en vertical se pierde justo el golpe que pasa a segunda cara o el que mata al Rey. Las fotos quietas no lo ven, porque el número vive en el lienzo de efectos.",
      "propuesta": "En ≤700 px, que el número nazca centrado sobre el tercio de abajo del naipe (carril 0,62, donde no hay cara ni índice), con escala 2 como tope y sin el +1 del rebote cuando el ancho supera el 40 % de la pantalla. Que vx apunte hacia adentro y que el tope [1, innerWidth − ancho] se recalcule en cada paso(). La QA tiene que mirar el lienzo en `rey-cae` y medir la caja del número contra el viewport."
    },
    {
      "prioridad": "P1",
      "pantalla": "Botín del Rey con el grito del Personaje (en vivo y en la foto quieta)",
      "ventana": "390x844",
      "archivo": "src/client/hud.ts:378-385 (al cambiar de pantalla se reubica UNA vez, en el rAF del evento, con el HUD y las filas del Botín todavía entrando) + :304-317 (si .hud-retrato no tiene caja, el ancla cae en la esquina de arriba a la izquierda y nadie lo vigila) + :295 (.botin-fila es solo 'mejor no', peso 1)",
      "que": "En la mesa el arreglo anda: «¡AY, MI ESPALDA!» sale pegado al retrato y con cola (`mesa-grito.png`). En el Botín vivo no. En `390-rey-cae-11.png` y `-12`, «BARRIDO Y A LA BOLSA.» aparece arriba de todo, montado sobre el Bufón y justo debajo de su bocadillo, con la cola hacia BOTÍN. Queda a ~600 px del retrato y no tiene ningún tope de distancia. En la foto quieta (`botin-rey.png`, `botin-grito.png`) cae en otro lado: encima de la fila elegible, tapa el icono y el nombre de «CÁBALA DEL BUFÓN» o deja «BENDICIÓN DE UN…» trunco.",
      "por_que": "Es el mismo defecto de la 0.18 (el Personaje habla con la boca del Bufón) y aparece en el momento de cobrar, que es cuando más se lee. Encima, la QA sacó una foto que no reproduce lo que pasa en vivo, así que la regla «grito-tapa» da verde sin razón.",
      "propuesta": "En ubicarGrito: si el retrato mide 0×0 o la pantalla está entrando, reintentar en animationend/transitionend del Botín, no en el primer rAF. En ≤700 px, sacar la búsqueda «pantalla entera»: si en 120 px no hay hueco limpio, el grito no se dibuja (queda la voz y el salto del retrato). Pasar .botin-fila que tenga ELEGIR a ZONAS_SIN_GRITO. Y una QA que dispare el grito durante el cambio mesa→Botín, no después."
    },
    {
      "prioridad": "P2",
      "pantalla": "la cuenta durante el conteo y su desglose (mesa-seleccion, secuencia golpe)",
      "ventana": "390x844",
      "archivo": "src/client/estilos/mesa.css:2036-2047 (.c-formula con flex-wrap: los chips de efecto caen o suben de renglón según el ancho del total que cuenta) + :3590-3612 (apretada-tel: .d-i con margin −6px −4px −6px −3px y column-gap 0,2em) + src/client/pantallas/mesa.ts:234-245 (apretarCuenta)",
      "que": "La cuenta ya no crece de alto (bien). Pero en el conteo baila de costado. En `390-golpe-00` el renglón 1 es «35 × 20 = 700» y abajo van ESCUDO y ORO. En `-03`, mientras cuenta «35 × 1 = 35», ESCUDO sube al renglón del total y ORO queda solo debajo. En `-05` vuelven a su lugar. Además, para que entre en dos renglones, el desglose apretado monta cada icono sobre su cifra: se lee «Quince1», «★+4», «◎+4», «🎲+12» pegados, y ampliado al doble el +4 toca el icono.",
      "por_que": "El conteo es el momento de máxima atención. Si un chip salta de renglón, el ojo lo sigue a él y deja de mirar el total. El desglose es el «por qué» del número y en el teléfono pide ampliar, que es justo lo que mi ficha prohíbe.",
      "propuesta": "Fijar el ancho de .c-total, del Daño y del Multi al de su cifra final (min-width en ch, puesto en la previa) para que nada fluya mientras cuentan. En ≤700 px los chips de efecto van en su propio renglón siempre. En el desglose apretado, que lo que se saque sea el nombre de la jugada repetido o el separador, nunca el aire entre el icono y su cifra (margen ≥ 0)."
    }
  ],
  "aciertos": [
    "Un solo TE PEGA con selección: en `mesa-conteo.png` la placa dice 42 con «21 ×2» y el chip dice «TE PEGA 42 (21 ×2)». Leído en mesa.ts:389, golpeNeto alimenta la placa siempre que hay selección. Mi P1 de la 0.18 quedó resuelto.",
    "¡CRÍTICO! ×2 vive adentro del renglón MULTI y la cuenta del teléfono no crece al revelarse. La trepada a la cabecera desapareció de todas las secuencias a 390.",
    "Botín de cinco piezas en vertical: «+9 DE VIDA MÁXIMA» en un renglón, con su corazón con flecha distinto del de Vida, y SEGUIR pegado a la última pieza, en la zona del pulgar (`botin-rey.png`, `390-rey-cae-12.png`).",
    "La Estocada lleva su regla escrita («Medio golpe suyo cruza tu Escudo») y el foco del mando es celeste, inconfundible con el canto oro de la elegida (`mesa-rey.png`, `mesa-mando.png`).",
    "0 recortes, 0 solapes, dianas ≥ 44 px y letra ≥ 16 px en las 32 medidas de 390x844 y las 7 de 390x664 (salvo los finales, a 14)."
  ],
  "capturas_vistas": [
    "visual-qa/390x844/mesa.png", "mesa-seleccion.png", "mesa-conteo.png", "mesa-segunda.png", "mesa-segunda-cambia.png", "mesa-grito.png", "mesa-arrastrando.png", "mesa-rey.png", "mesa-mando.png", "mesa-mentiroso.png",
    "botin-rey.png", "botin-grito.png", "pulperia.png", "jugadas.png", "elegi-una.png", "fin-victoria.png",
    "visual-qa/390x664/mesa-conteo.png", "mesa-seleccion.png", "mesa-segunda.png",
    "jurado/secuencias/390-golpe-00.png", "-03", "-05", "-07", "-08", "-09",
    "390-rey-segunda-04.png", "-06", "-08", "-12",
    "390-rey-cae-03.png", "-04", "-09", "-10", "-11", "-12", "-14",
    "390-rey-irrumpe-05.png", "390-botin-brota-06.png", "390-mapa-paso-03.png",
    "recortes ampliados ×2 de mesa-seleccion, mesa-conteo y 390-rey-segunda-06",
    "las 32 medidas.json de visual-qa/390x844 y las 7 de 390x664"
  ]
}
```

## Veredicto

La 0.19.0 hace bien lo que le pedí. Con selección, el número que decide la jugada es uno solo, y la placa y el chip dicen lo mismo. El crítico entró en la fórmula y la cuenta ya no trepa a la cabecera. En la mesa, el grito sale pegado a su retrato y con cola. El Botín de cinco piezas se lee en vertical y deja SEGUIR bajo el pulgar. Claridad, que en mi ficha pesa doble, sube de 7,3 a 7,5.

No paso de ahí por dos fallas de lo vivo que las fotos quietas no atrapan. La cifra del golpe grande se sale por el borde izquierdo y tapa tu columna. El grito del Botín sigue cayendo debajo del Bufón. Y la cuenta, que ya no crece de alto, ahora baila de costado mientras cuenta. Las tres tienen la misma raíz que en la 0.18: la QA no mira el lienzo de efectos ni las transiciones.

Alcance: no corrí nada. Juzgo el arrastre por `mesa-arrastrando.png` («SOLTÁ ACÁ» sobre el Rey, DESCARTAR punteado; bien) y por código: `src/client/mano.ts` no cambió, umbral de 14 px con el dedo. El sonido lo conozco solo por código. Las fotos de 360x740 de `artifacts/telefono/` son de la madrugada, no de esta versión.

## Contra mi veredicto de la 0.18.0

**Resueltos:** la placa contra el chip con selección (P1); la trepada de la cuenta al revelarse (P2); el grito lejos del retrato **en la mesa**. **Siguen:** el grito lejos en el Botín; la placa del Tajo sobre la cara en 664; CERRAR de JUGADAS arriba a la derecha; los finales a 14 px tachados; la fila de atrás del Mentiroso; sin 360x740 fresco.

## Defectos menores

- **Placa en reposo**: sin selección dice 21 (crudo, `mesa-segunda.png`, Escudo 4). Durante el golpe dice 17 (neto, `390-rey-segunda-12`). Cambia de número sin que el jugador toque nada (`src/client/pantallas/mesa.ts:386-389`: en reposo también debería ir neto, con «−4 ⛨» chico).
- **390x664**: con cuenta, la placa «⚔42 21×2 🔥3» tapa la cara del Caudillo y la regla del Tajo desaparece (`src/client/estilos/mesa.css:2889-2913`).
- **Grito sobre GOLPEAR apagado** (`mesa-grito.png`). Si el turno vuelve antes de los 1,2 s, tapa el botón ya encendido (`src/client/hud.ts:288-293`).
- **JUGADAS**: CERRAR lejos del pulgar y «Multi ×2 al cantar ¡ESCOBA!» en cuatro renglones (`src/client/estilos/pantallas.css:1119-1210`).
- **Finales**: «EL CACIQUE / EL CAUDILLO / EL BACANAL» a 14 px, tachados y grises (`src/client/estilos/pantallas.css:2366`).

## Qué haría en la próxima versión

Paquete «lo vivo también se mide». Uno: el número del golpe tiene carril propio en ≤700 px, nace adentro del naipe y está topado en cada cuadro; la QA lee la caja del lienzo en `rey-cae` y `rey-segunda`. Dos: el grito sin búsqueda de pantalla entera en el teléfono; se reubica al terminar la entrada del Botín, nunca sobre una fila elegible, y la QA lo dispara en plena transición. Tres: la cuenta con anchos fijos desde la previa hasta el total, los chips de efecto en su renglón y el desglose sin iconos montados. Cuatro: la placa siempre neta, también en reposo, con la causa chica. Cinco: CERRAR al pie de los modales y una tanda nueva de 360x740 con muesca. La Constitución, intacta.
