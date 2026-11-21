```json
{
  "jurado": "jurado-ux-movil",
  "version": "0.13.0",
  "puntajes": { "claridad": 6.3, "diversion": 6.8, "estetica": 7.6, "veredicto": 6.6 },
  "defectos": [
    {
      "prioridad": "P0",
      "pantalla": "mesa (arrastrando)",
      "ventana": "390x844",
      "archivo": "src/client/estilos/mesa.css:740 (.descarte-zona móvil) + src/client/mano.ts:243 y :255-271",
      "que": "Al arrastrar, la franja «AL DESCARTE» aparece a todo el ancho (56 px, bottom:100% de la mano) justo ENTRE la mano y el enemigo, encima de la cuenta: tapa «¡EXACTO! +3 +1» y obliga al pulgar a cruzarla para golpear. Además el naipe queda clavado bajo el dedo (dx/dy conservan el punto de agarre, sin despegue táctil) y tapa nombre y Vida del enemigo. Leído en código, no visto: `pointercancel` usa el mismo manejador que `pointerup` y ejecuta `alSoltar(zona)`, o sea que un gesto cancelado por el sistema sobre una zona golpea o descarta.",
      "por_que": "El gesto que el propio juego enseña («Elegí cartas y arrastralas al enemigo») tiene una trampa en el medio: soltar corto gasta uno de los 3 descartes, un recurso escaso e irreversible. Y mientras arrastrás perdés la cifra que estabas por confirmar. Balatro y StS móvil levantan la carta por encima del dedo y nunca ponen un destino destructivo en el camino del destino principal.",
      "propuesta": "En ≤700 px sacar la franja del trayecto: que la zona de descarte sea el propio botón DESCARTAR (abajo, bajo la mano) encendido mientras arrastrás; la cuenta queda siempre visible. Con `pointerType==='touch'` subir el grupo ~70 px sobre el dedo. En `arriba`, si `ev.type==='pointercancel'` devolver las cartas a la mano sin llamar `alSoltar` con zona."
    },
    {
      "prioridad": "P1",
      "pantalla": "jugadas (modal)",
      "ventana": "390x844",
      "archivo": "src/client/estilos/pantallas.css:1165-1190 y :1241 + src/client/pantallas/camino.ts:110-116",
      "que": "La tabla tiene cuatro columnas (JUGADA, CARTAS, DAÑO, MULTI) y en el móvil solo se ven tres: MULTI queda fuera del panel por la derecha. El canto del Mazo también se corta («¡ESCOBA! Su… justo») y el botón «VER LAS QUE PIDEN MÁS CARTAS (3)» se sale por los dos lados («/ER LAS QUE…»). El `.medidas.json` dice recortes: 0, así que la puerta no lo ve.",
      "por_que": "Es la pantalla de consulta de un juego cuya fórmula es Daño × Multi, y en el teléfono falta la mitad de la fórmula. Un jugador nuevo no puede saber por qué una Escalera de Palo vale más que una Pierna.",
      "propuesta": "En ≤700 px: `table-layout: fixed`, quitar `white-space: nowrap` del nombre de la jugada, fundir la columna CARTAS como segundo renglón bajo el nombre y dejar DAÑO y MULTI como dos cifras fijas a la derecha. Canto en bloque propio (no `caption` con inline). Botón con `white-space: normal` o texto corto («VER MÁS (3)»). Sumar a la QA una comprobación de `scrollWidth > clientWidth` en el cuerpo del modal."
    },
    {
      "prioridad": "P1",
      "pantalla": "mesa-mentiroso (mano de 8, tres botones)",
      "ventana": "390x844",
      "archivo": "src/client/estilos/mesa.css:726-738 (.botones móvil) + src/client/mano.ts:86-99 (dos filas)",
      "que": "En español la botonera de tres no entra: «DESCARTAR (3» pierde el paréntesis bajo el botón vecino y «ENGAÑO» queda cortado contra el borde derecho de la pantalla. La mano en dos filas ocupa todo el ancho sin margen, de la fila de atrás asoman 48 px (justo la diana mínima) y al elegir una de adelante sube 18 px y deja 30 px tocables de la de atrás; la cuenta, con la mano de 8, se pega a la Vida del enemigo.",
      "por_que": "Es el Mazo que más toques pide (Engaño + selección múltiple) y es donde la barra del pulgar está rota. Tres acciones primarias ilegibles y dianas de 30 px en la fila de atrás dan toques errados en la jugada más cara.",
      "propuesta": "Con tres botones: GOLPEAR ocupa un renglón entero y DESCARTAR + ENGAÑO comparten el de abajo (o ENGAÑO pasa a ser un conmutador de icono de 48 px con su rótulo arriba de la mano). `min-width:0; overflow:hidden` no alcanza: bajar GOLPEAR a `--fs` y fijar `flex` por contenido. En dos filas, que la carta elegida de adelante no suba (marcarla con borde/halo) o que la de atrás asome 60 px."
    }
  ],
  "aciertos": [
    "Disciplina de medidas real: en las 28 pantallas de 390 la letra mínima es 16 px, ninguna diana baja de 44 px de alto, separación mínima 8 px y cero solapes medidos.",
    "La mesa de 3 cartas es de lo mejor que vi en vertical: naipes de 100 px que se leen sin ampliar, GOLPEAR y DESCARTAR de 48 px en la zona del pulgar, HUD de Vida/Escudo/oro abajo y la cuenta «34 × 10 = 340 ¡EXACTO!» enorme en el medio.",
    "`touch-action: none` en la mano, `overscroll-behavior: none` y umbral de 8 px: el arrastre no se pelea con el desplazamiento de la página; tocar para elegir + botón sigue siendo un camino completo sin arrastrar.",
    "Las elecciones de tres (Cábala, Amuleto, Bendición) entran enteras en 844 px, con tarjetas de ancho completo y SALTAR al alcance.",
    "El golpe y el Rey que cae conservan el impacto a 390: la cifra de daño gigante y el naipe rajado se leen en un cuadro."
  ],
  "capturas_vistas": [
    "visual-qa/390x844/mesa.png", "visual-qa/390x844/mesa-seleccion.png", "visual-qa/390x844/mesa-arrastrando.png", "visual-qa/390x844/mesa-rey.png", "visual-qa/390x844/mesa-mentiroso.png",
    "visual-qa/390x844/mapa.png", "visual-qa/390x844/botin.png", "visual-qa/390x844/pulperia.png", "visual-qa/390x844/fogon.png", "visual-qa/390x844/cabala.png",
    "visual-qa/390x844/elegi-una.png", "visual-qa/390x844/elegi-amuleto.png", "visual-qa/390x844/elegi-bendicion.png", "visual-qa/390x844/elegir-mazo.png",
    "visual-qa/390x844/piezas.png", "visual-qa/390x844/jugadas.png", "visual-qa/390x844/mazo.png", "visual-qa/390x844/portada.png", "visual-qa/390x844/ajustes.png", "visual-qa/390x844/fin-derrota.png",
    "jurado/secuencias/390-golpe-02.png", "jurado/secuencias/390-golpe-04.png", "jurado/secuencias/390-golpe-07.png", "jurado/secuencias/390-rey-irrumpe-03.png", "jurado/secuencias/390-botin-brota-04.png", "jurado/secuencias/390-mapa-paso-03.png",
    "mirar/390-fogon-templada.png", "mirar/390-comodin-espectral-racha.png",
    "las 28 medidas.json de visual-qa/390x844"
  ]
}
```

## Veredicto

La 0.13.0 en vertical tiene una base muy seria: las medidas no mienten (16 px de letra mínima, dianas de 44–48, cero solapes) y la mesa de tres cartas se juega con un pulgar. Lo que la separa de *Balatro* móvil no es el tamaño de las cosas sino **el gesto**: el arrastre está pensado para ratón y trasladado al dedo sin adaptar. La franja de descarte cruzada en el camino al enemigo, el naipe debajo del dedo y la cuenta tapada mientras arrastrás son exactamente los tres errores que los referentes ya resolvieron. Aclaro el alcance: lo juzgo por la geometría de `mesa-arrastrando.png` y por el código; no jugué con el dedo, y el `pointercancel` está leído, no visto.

El segundo frente es que las pantallas «con más contenido del previsto» se rompen y la puerta de recortes no se entera: el modal de Jugadas pierde la columna Multi y la botonera del Mentiroso se corta en español (en inglés, `390-comodin-espectral-racha.png`, STRIKE / DISCARD (3) / BLUFF entran justo). Claridad pesa doble en mi nota y por eso el veredicto queda en 6,6 pese a una estética de 7,6.

## Defectos menores

- **Sin zonas seguras**: `index.html:5` declara `viewport-fit=cover` pero no hay ningún `env(safe-area-inset-*)` en `src/client/estilos/`; el HUD pegado al borde inferior cae bajo el indicador de inicio de iOS y la cabecera bajo la muesca. Además `user-scalable=no` impide ampliar (`base.css:70` es donde sumaría el relleno).
- **Cábala «Apostar 10 de oro»**: la tarjeta deja toda la mitad izquierda vacía y aprieta título y texto en una columna de ~130 px a cinco renglones (`src/client/estilos/pantallas.css`, bloque móvil ~:1289).
- **Pulpería**: entra un artículo y medio por pantalla, el precio del tercero queda cortado por el HUD y no hay indicio de desplazamiento; SALIR está arriba a la derecha, fuera del pulgar (`pantallas.css` ~:864).
- **Mapa y pila de la Corte**: las marcas de recompensa bajo cada nodo (~10 px) y el naipe de la Corte de ~25 px arriba a la derecha no se leen sin ampliar (`mesa.css:655-670`, `src/client/pantallas/camino.ts`).
- **Tira del HUD**: iconos de ~28 px sin rótulo y un «+2/+4/+6» que esconde piezas; obliga a abrir «LO QUE LLEVÁS» para saber qué Amuletos tenés (`src/client/hud.ts:93`, `mesa.css:1012`).

## Qué haría en la próxima versión

Un paquete «el dedo primero» y nada más. Uno: rehacer el arrastre táctil en `mano.ts` — despegue sobre el dedo, descarte como destino abajo (el propio botón), cancelación segura, vibración corta al entrar en zona y al soltar (`navigator.vibrate`, con el ajuste de «Reducir movimiento» respetado) y la cuenta siempre visible durante el gesto. Dos: una botonera móvil de dos renglones cuando hay tres acciones y dianas de 60 px en la fila de atrás de la mano doble. Tres: Jugadas rediseñada para 390 con Daño y Multi como cifras fijas. Cuatro: zonas seguras de iOS en HUD y cabecera. Cinco: endurecer la QA para que estos casos no vuelvan — `scrollWidth > clientWidth` dentro de modales, texto de botón cortado, y un estado nuevo `mesa-mentiroso` medido también en español con la botonera completa, más un estado de arrastre con el grupo a mitad de camino. No tocaría reglas ni arte: la Constitución queda intacta y el salto de claridad en el teléfono sería el más grande posible para la 1.0.0.

No recibí veredicto de la versión anterior: no hay comparación de defectos resueltos.
