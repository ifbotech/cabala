```json
{
  "jurado": "jurado-ux-movil",
  "version": "0.14.0",
  "puntajes": { "claridad": 6.7, "diversion": 7.2, "estetica": 7.6, "veredicto": 6.9 },
  "defectos": [
    {
      "prioridad": "P0",
      "pantalla": "mesa con selección (y mesa-mentiroso) en pantalla baja o con zonas seguras",
      "ventana": "390x664 (Safari con sus barras) y 390x844 con muesca (47 + 34 px)",
      "archivo": "src/client/estilos/mesa.css:654-657 (.e-centro alto fijo de 220 px) + :721-725 (.mano alto fijo de 206 px aunque haya una sola fila) + :1556 (la consulta de pantalla baja solo reacomoda la botonera del Mentiroso)",
      "que": "La mesa del móvil es una suma de alturas fijas (~790 px) que no se encoge. En `dedo/bajo-664-mesa-seleccion.png` la cuenta queda DETRÁS del naipe del enemigo: se lee medio «¡EXACTO!» y nada de Daño × Multi; la Vida «340/340» queda tapada por la mano. En `dedo/segura-mesa-seleccion.png` (844 con muesca) la barra del nombre pisa las cifras «34 × 10 = 340». En `segura-mesa-mentiroso.png` y `bajo-664-mesa-mentiroso.png` la barra de Vida tacha la pista «Elegí cartas y arrastralas al enemigo» y se monta sobre la fila de atrás de la mano.",
      "por_que": "664 px es el alto real de un iPhone de 390 en Safari sin instalar, y la muesca es todo iPhone instalado: o sea, el caso más común del teléfono. Ahí desaparece la cifra que el juego entero pide leer antes de golpear (y el Golpe exacto es el protagonista). Las zonas seguras se agregaron, pero al restarle 81 px a una maqueta que no cede, rompieron la mesa. La QA solo mide 390x844 sin muesca y dice recortes: 0.",
      "propuesta": "Que la mesa ceda por alto: `.mano` de 206 px solo cuando hay dos filas (con una fila, 160 px: hoy sobran 46 px muertos entre cuenta y mano); `.e-centro` con `height: clamp(120px, 26dvh, 220px)` (el naipe ya asoma tras la barra, puede asomar menos); la cuenta con `position: relative; z-index: 3` para que nunca quede bajo el enemigo. Consultas por `max-height` descontando `env(safe-area-inset-*)`, no por `display-mode`. Sumar a la QA visual las ventanas 390x664 y 390x844 con muesca, con una comprobación de solape cuenta/enemigo/mano."
    },
    {
      "prioridad": "P1",
      "pantalla": "mesa (arrastrando con el dedo)",
      "ventana": "390x844",
      "archivo": "src/client/estilos/mesa.css:654-657 (overflow: hidden recorta .e-halo de :154-175 y .e-suelta de :181-191) + src/client/mano.ts:55-58 y :170 (ALZA)",
      "que": "El destino principal no avisa. En el móvil `.e-centro` tiene `overflow: hidden`, y el halo dorado (inset negativo) y el cartel «SOLTÁ ACÁ» (top negativo) viven fuera de esa caja: en `mesa-arrastrando.png`, `arrastre-enemigo-escoba.png` y `arrastre-enemigo-mentiroso.png` el enemigo se ve igual que en reposo, mientras DESCARTAR sí late con borde punteado. Además el grupo levantado 70 px tapa justo el nombre del enemigo y la mitad de la cuenta («22 × 9» escondido, solo queda «= 198»).",
      "por_que": "Mientras arrastrás, lo único encendido en pantalla es el destino destructivo. La vibración es el otro aviso y en iOS no existe (`navigator.vibrate`). Balatro y StS encienden el blanco y dejan la cifra a la vista durante todo el gesto.",
      "propuesta": "Halo y cartel fuera de la caja recortada (en `.enemigo`, o `clip-path` solo sobre el naipe); al apuntar, encender también la barra de Vida y el marco de la cuenta. Mientras `body.arrastrando`, achicar el grupo a 0,8 y dejarlo anclado sobre el naipe (no sobre la barra), o subir la cuenta en una tira fija bajo la cabecera."
    },
    {
      "prioridad": "P1",
      "pantalla": "mesa durante el golpe (conteo pieza por pieza)",
      "ventana": "390x844",
      "archivo": "src/client/pantallas/mesa.ts:659-672 (carteles .c-vuela apilados por columna) + src/client/hud.ts:253-293 (ajustarBandeja)",
      "que": "En `390-golpe-04.png` y `-06.png` los nombres de lo que suma («Loaded Die +8», «Knucklebone +1», «Short hand +4», «Pair +2») se apilan unos sobre otros y sobre la barra de Vida: en el móvil Daño y Multi están a 60 px y las dos columnas rojas y azules se pisan. Los «+1» gigantes de las fichas salen cortados contra la esquina inferior izquierda, encima del retrato. Y la bandeja del HUD a veces deja el «+N» solo en una segunda fila (`390-rey-irrumpe-03.png`, `bajo-664-mesa-seleccion.png`), sumando ~36 px de alto.",
      "por_que": "El conteo existe «para aprender qué pieza da qué» y en el teléfono es una mancha de etiquetas; encima tapa la Vida en el instante del golpe. La fila fantasma del HUD empuja la maqueta del P0.",
      "propuesta": "En ≤700 px, un solo carril: cada cartel reemplaza al anterior en un renglón fijo sobre la cuenta (izquierda los de Daño, derecha los de Multi, con `max-width: 45vw`). Limitar `numero()` a los bordes de la pantalla. `ajustarBandeja()` también tras `document.fonts.ready` y con `ResizeObserver`, y `flex-wrap: nowrap` + `overflow: hidden` como red."
    }
  ],
  "aciertos": [
    "El arrastre táctil se rehízo bien: la franja «AL DESCARTE» ya no cruza el camino, el descarte es el propio botón DESCARTAR bajo la mano (se ve encendido en `arrastre-descarte-*.png`), el grupo se despega 70 px sobre la yema sin salto, y `pointercancel` tiene manejador propio que devuelve las cartas sin jugar (mano.ts:318-327).",
    "JUGADAS en 390 ahora muestra la fórmula entera: ficha de dos renglones con DAÑO y MULTI fijos a la derecha, canto del Mazo en su bloque y botón que parte en dos líneas sin salirse.",
    "El Mentiroso en español entra: GOLPEAR a renglón entero, DESCARTAR (3) y ENGAÑO abajo; la elegida de adelante se marca con canto dorado en vez de subir y la fila de atrás conserva sus 48 px.",
    "Sigue la disciplina de medidas: en las 28 pantallas de 390, letra mínima 16 px, dianas ≥ 44 px, separación 8 px, cero solapes medidos; 134 fps en la puerta.",
    "Los modales respetan la muesca (`segura-jugadas.png`, `segura-fin-victoria.png`) y el mapa y la portada quedan dentro de las zonas seguras."
  ],
  "capturas_vistas": [
    "dedo/arrastre-medio-escoba.png", "dedo/arrastre-enemigo-escoba.png", "dedo/arrastre-descarte-escoba.png", "dedo/arrastre-medio-mentiroso.png", "dedo/arrastre-enemigo-mentiroso.png", "dedo/arrastre-descarte-mentiroso.png",
    "dedo/mentiroso-elegida-es.png", "dedo/mesa-mentiroso-en.png", "dedo/jugadas-es.png", "dedo/jugadas-todas-es.png",
    "dedo/bajo-664-mesa-seleccion.png", "dedo/bajo-664-mesa-mentiroso.png", "dedo/bajo-763-mesa-mentiroso.png",
    "dedo/segura-mesa-seleccion.png", "dedo/segura-mesa-mentiroso.png", "dedo/segura-mapa.png", "dedo/segura-jugadas.png", "dedo/segura-fin-victoria.png", "dedo/segura-portada.png",
    "visual-qa/390x844/mesa-seleccion.png", "visual-qa/390x844/mesa-arrastrando.png", "visual-qa/390x844/mesa-rey.png", "visual-qa/390x844/pulperia.png", "visual-qa/390x844/cabala.png", "visual-qa/390x844/mapa.png", "visual-qa/390x844/piezas.png",
    "jurado/secuencias/390-golpe-02.png", "jurado/secuencias/390-golpe-04.png", "jurado/secuencias/390-golpe-06.png", "jurado/secuencias/390-rey-irrumpe-03.png", "jurado/secuencias/390-botin-brota-05.png",
    "mirar/390-conteo.png",
    "las 28 medidas.json de visual-qa/390x844"
  ]
}
```

## Veredicto

La 0.14.0 hizo lo que pedí: «el dedo primero» es real. El gesto ya no tiene una trampa en el medio, la carta va por encima de la yema, cancelar es seguro, Jugadas muestra Daño y Multi, y la botonera del Mentiroso entra en español. En 390x844 limpio la mesa se juega con un pulgar y está más cerca de *Balatro* móvil que la anterior.

Pero juzgo lo que veo, y las fotos nuevas de `artifacts/dedo/` muestran un problema que antes no se fotografiaba: **la mesa solo funciona en 844 px exactos y sin muesca**. Con las barras de Safari (664) o con las zonas seguras recién agregadas, la cuenta se mete detrás del enemigo o queda tachada por su barra de Vida. Es la cifra central del juego y es el teléfono real, así que va como P0 aunque la versión haya mejorado. Lo segundo es que al arreglar el descarte quedó al revés la jerarquía del arrastre: el blanco destructivo late y el enemigo no, porque su halo quedó recortado. Claridad sube poco (6,3 → 6,7) por eso; diversión sube más (el conteo pieza por pieza y el golpe con peso se sienten, aunque en 390 las etiquetas se pisen).

Alcance: el arrastre lo juzgo por las fotos táctiles (CDP) y el código; la vibración y el `pointercancel` están leídos en código, no vistos. No corrí nada.

## Contra mi veredicto de la 0.13.0

**Resueltos:** P0 del arrastre (franja fuera del camino, despegue sobre el dedo, cancelación segura); P1 de Jugadas (columna Multi, canto y botón); P1 de la botonera y la fila de atrás del Mentiroso; zonas seguras en modales, portada y mapa. **Siguen:** la cuenta tapada a medias mientras arrastrás (ahora por el grupo levantado), `user-scalable=no`, la tarjeta «Apostar 10 de oro» con media mitad vacía, la Pulpería de artículo y medio con SALIR arriba, las marcas de recompensa del mapa y la pila de la Corte ilegibles, y la tira del HUD con «+N». **Nuevo:** las zonas seguras rompen la mesa (P0).

## Defectos menores

- **Toque que resbala borra la selección**: el umbral de arrastre es 8 px también para el dedo y, si la carta no estaba elegida, deselecciona todas las demás (`src/client/mano.ts:273-282`); con tres elegidas, un toque nervioso te deja con una. Umbral de 14 px con `pointerType === 'touch'` y restaurar la selección si se suelta fuera de zona.
- **El bocadillo del Bufón tapa la cabecera y el índice del enemigo** («10» cortado en `mesa-mentiroso`) durante todo el arrastre (`src/client/estilos/mesa.css:609-632`); esconderlo con `body.arrastrando`.
- **Cabecera en inglés**: «THE OUTSKIRTS» se corta a cuchillo contra «Turn 4» (`mesa.css:680-685`, `text-overflow: clip` con `max-width: 34vw`).
- **Jugadas**: en la fila resaltada el «+4» rojo sobre fondo oliva pierde contraste (`src/client/estilos/pantallas.css` ~:1700, bloque móvil de `.jugadas`).
- **`dedo/segura-portada.png` dice «v0.13.0»**: la foto es anterior al cambio de `src/shared/brand.ts:7` o la portada no lo lee; conviene verificar antes de publicar.

## Qué haría en la próxima versión

Un paquete «cualquier teléfono, no solo el de la foto». Uno: la mesa del móvil como rejilla que cede por alto (`dvh` y `env()`), con el enemigo y la mano encogiéndose antes de que nada se pise, probada en 390x664, 390x763, 360x740 y 844 con muesca dentro de la QA visual, más una comprobación de solape entre cuenta, barra de Vida y mano. Dos: cerrar el gesto: halo y «SOLTÁ ACÁ» visibles en el enemigo, cuenta siempre a la vista durante el arrastre, umbral táctil más ancho con selección que no se pierde. Tres: el conteo en carril único para 390, legible de a una pieza. Cuatro: Pulpería con dos artículos por pantalla y SALIR en la barra del pulgar, y la tarjeta de Cábala a ancho completo. Reglas y arte, intactos: la Constitución no se toca.
