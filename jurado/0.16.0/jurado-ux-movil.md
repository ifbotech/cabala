```json
{
  "jurado": "jurado-ux-movil",
  "version": "0.16.0",
  "puntajes": { "claridad": 7.4, "diversion": 7.4, "estetica": 7.7, "veredicto": 7.4 },
  "defectos": [
    {
      "prioridad": "P1",
      "pantalla": "mesa contra un Rey con Furia (segunda cara armada)",
      "ventana": "390x664 (Safari con sus barras)",
      "archivo": "src/client/estilos/mesa.css:1956-1993 (@container mesa (max-height: 740px): .e-ataque en grid-area centro, justify-self end, max-width 96px) + mesa.css:2325 y src/client/pantallas/mesa.ts:133 (la nota de Furia en dos renglones) + scripts/visual-qa.ts:121-143 (solape-mesa no mira la cabecera)",
      "que": "En `390x664/mesa-segunda.png` la placa del Ataque («21», la llama «3», «incluida / +3/turno») mide unos 105 px de alto y, como va montada sobre la esquina de un naipe que en esa altura solo asoma 60 px, sube por encima de la cabecera hasta y=0: tapa la mitad del naipe del Caudillo (queda el «12» y la corona), se mete en la fila de «EL ARRABAL · REY» y pisa el borde izquierdo del botón «?». El sello INMUNE cae sobre la cara del Bufón. La QA da 0 solapes y 0 recortes porque «solape-mesa» solo compara la barra de Vida, la cuenta y la mano.",
      "por_que": "Es la pelea que define la partida, en la ventana real de un iPhone con Safari. El jugador tiene que leer al Rey, su Furia y su segunda cara, y lo que ve es una pila de números sobre el título. Además, la placa tiene tip: un toque cerca del «?» abre la ficha equivocada.",
      "propuesta": "En ≤740 px de alto, la placa del Ataque en una sola fila («⚔21 🔥3») a la derecha de la barra de Vida o dentro de ella, y la nota «incluida · +3/turno» solo en el tip (es explicación, no lectura de cada turno). El naipe del enemigo con alto mínimo de 96 px: que ceda la línea del rasgo/segunda cara, que ya está en la cuenta. Sumar a «solape-mesa» `.e-ataque`, `.e-sellos` y `.esc-bufon` contra `.mesa-top` y contra los botones de la cabecera."
    },
    {
      "prioridad": "P1",
      "pantalla": "mesa con el Tajo de revés armado (Rey de Espadas, segunda cara)",
      "ventana": "390x844 y 390x664",
      "archivo": "src/client/estilos/mesa.css:2664-2669 (en ≤700 px se esconde el ×2 de .e-tajo) + src/client/pantallas/mesa.ts:141 (el rótulo «TE PEGA» del enemigo es solo-ancho) y :226 (el chip c-tajo pierde su nombre en el móvil)",
      "que": "En el teléfono hay dos números de «te pega» que no coinciden. En `390x844/mesa-segunda.png` el Rey muestra un «21» grande, sin rótulo y sin ×2, mientras la cuenta dice «⚔×2 · TE PEGA 42». En `390-rey-tajo-04.png` el naipe dice 24 y la cuenta «TE PEGA 48», y el golpe que sigue saca −48 (`390-rey-tajo-10.png`: 87 → 39). En el ancho el ×2 late al lado de la cifra del Rey; en el móvil se apagó a propósito («la columna no crece»).",
      "por_que": "Es la decisión de la segunda cara: cambiar de jugada o comerse el doble. La cifra más grande y más roja de la pantalla, la que se mira primero, es la que miente. El chip de la cuenta, sin el nombre «Tajo de revés» en el móvil, es un icono con «×2» que se confunde con el «×2» del Multi de la fila de arriba (las Tijeras ×2, ¡CRÍTICO!). Balatro móvil nunca muestra dos cifras distintas para la misma cosa.",
      "propuesta": "En el móvil, cuando `tajoAhora(q)` es cierto, reemplazar la cifra del Rey por la que va a pegar de verdad (42) con el ×2 debajo en lugar de la nota de Furia, en vez de agregar una columna. Volver a mostrar «TE PEGA» encima de la cifra (cabe en 16 px sobre 96 px) o, al menos, que la cifra del enemigo y la del chip sean siempre la misma `q.contra`."
    },
    {
      "prioridad": "P2",
      "pantalla": "mesa tras recibir un golpe fuerte y botín tras ganar (el grito del Personaje)",
      "ventana": "390x844",
      "archivo": "src/client/hud.ts:248-252 (x = max(80, …) fijo, con translate -50%) + src/client/estilos/base.css:1070-1081 (.hud-grito nowrap y z-index 60)",
      "que": "El grito del Personaje sale cortado contra el borde izquierdo y encima del botón principal: «EH, MÁS RESPETO!» sin su «¡» tapando GOLPEAR (`390-rey-tajo-10.png`, `-11`, `-12`) y «…RRIDO Y A LA BOLSA.» tapando SEGUIR del Botín (`390-rey-cae-16.png`). El retrato está en la esquina, el bocadillo mide ~220 px en letra de rótulo y la cuenta solo deja 80 px del centro al borde.",
      "por_que": "Pasa en los dos momentos de más emoción (el golpazo y la victoria), justo sobre el botón que el pulgar va a tocar. No roba toques (pointer-events: none), pero el chiste se lee mutilado y el botón queda tapado 1,5 s.",
      "propuesta": "Medir el bocadillo antes de ubicarlo: `x = clamp(w/2 + 8, centro del retrato, innerWidth − w/2 − 8)` y, en ≤700 px, anclarlo arriba de la bandeja a la derecha del retrato (translate 0 en x, cola hacia la izquierda), nunca sobre `.botones`. Sumar un estado de QA con el grito a la vista."
    }
  ],
  "aciertos": [
    "El desglose llegó al teléfono: tercer piso de la cuenta con «DAÑO 5+2+3 Flor +6 …» y «MULTI Flor 2 +4» en `390x844/mesa-seleccion.png` y también en `390x664/mesa-seleccion.png`, sin pisar la mano.",
    "El conteo ya no se pelea con nada: cada pieza se enciende en su renglón del desglose y los «+2/+3/+5» van dentro de cada naipe (`390-golpe-03.png`, `-05.png`); el carril único quedó resuelto de verdad.",
    "El Bufón dejó la cabecera: su voz es una tira bajo la barra de Vida y calla cuando hay cuenta (`390x844/mesa.png`, `mesa-rey.png`); «EL REÑIDERO · GUARDIA / Turno 1» se lee entero en todas las mesas.",
    "Botín y Fogón con sus botones en la zona del pulgar (`botin.png`, `fogon.png`, `390-botin-brota-12.png`) y `user-scalable=no` fuera de `index.html`.",
    "Letra mínima 16 px, dianas ≥ 44 px, separación 8 px y 0 recortes en las 29 medidas de 390x844 y las 5 de 390x664."
  ],
  "capturas_vistas": [
    "visual-qa/390x844/mesa.png", "visual-qa/390x844/mesa-seleccion.png", "visual-qa/390x844/mesa-arrastrando.png", "visual-qa/390x844/mesa-mentiroso.png", "visual-qa/390x844/mesa-rey.png", "visual-qa/390x844/mesa-segunda.png",
    "visual-qa/390x844/botin.png", "visual-qa/390x844/pulperia.png", "visual-qa/390x844/mapa.png", "visual-qa/390x844/elegi-una.png", "visual-qa/390x844/fogon.png", "visual-qa/390x844/cabala.png", "visual-qa/390x844/portada.png", "visual-qa/390x844/jugadas.png", "visual-qa/390x844/elegir-mazo.png",
    "visual-qa/390x664/mesa-segunda.png", "visual-qa/390x664/mesa-seleccion.png", "visual-qa/390x664/mesa-mentiroso.png",
    "jurado/secuencias/390-golpe-00.png", "390-golpe-01.png", "390-golpe-03.png", "390-golpe-05.png", "390-golpe-06.png", "390-golpe-07.png", "390-golpe-08.png", "390-golpe-09.png",
    "390-rey-segunda-03.png", "390-rey-segunda-07.png", "390-rey-segunda-11.png", "390-rey-segunda-12.png",
    "390-rey-tajo-04.png", "390-rey-tajo-08.png", "390-rey-tajo-10.png", "390-rey-tajo-11.png", "390-rey-tajo-12.png",
    "390-botin-brota-04.png", "390-botin-brota-09.png", "390-botin-brota-12.png", "390-rey-cae-08.png", "390-rey-cae-16.png", "390-rey-irrumpe-04.png", "390-mapa-paso-03.png",
    "las 29 medidas.json de visual-qa/390x844 y las 5 de 390x664"
  ]
}
```

## Veredicto

La 0.16.0 es la primera versión en que el teléfono sabe casi lo mismo que la tele. El desglose entra como tercer piso de la cuenta también en 664 de alto, el conteo se lee dentro de ese mismo desglose (cada pieza se ilumina en su renglón) y los «+N» quedaron adentro de cada naipe. El Bufón bajó de la cabecera a una tira bajo la Vida. Botín y Fogón tienen los botones donde llega el pulgar. Claridad sube de 7,1 a 7,4 y diversión un poco: el golpe en 390 se entiende sin JUGADAS.

No sube más porque la novedad de la versión, la segunda cara, se lee peor justo en el teléfono. Contra el Caudillo hay dos cifras de «te pega» que no coinciden, y la del naipe, la más grande, es la falsa. En 390x664 la placa del Ataque con su Furia trepa sobre la cabecera y deja al Rey en una tira de 60 px. Y la QA no ve ninguna de las dos cosas: «solape-mesa» solo mira tres franjas. Estética igual que antes en el móvil: buena, pero la mesa de Rey en pantalla baja es un amontonamiento.

Alcance: no corrí nada. La muesca y 360x740 siguen sin foto en esta versión (`artifacts/telefono/` es de la madrugada, de la 0.15). El arrastre lo juzgo por `mesa-arrastrando.png` y por código (mano.ts:65-66, 309-390: umbral de 14 px para el dedo, captura del puntero, `touch-action: none` en la mano). El sonido lo conozco solo por código, no lo oí.

## Contra mi veredicto de la 0.15.0

**Resueltos:** P1 del desglose ausente en ≤700 px (visto en 844 y 664); P1 del cartel del conteo mal anclado (ahora va dentro del desglose); P2 del Bufón sobre la cabecera; botones del Botín en el pulgar; `user-scalable=no`. **Siguen:** la QA sin 360x740 ni muesca; los tres Comunes de la Pulpería con la misma frase larga; el hueco muerto bajo la cuenta cuando la mano está en el aire.

## Defectos menores

- **Pulpería**: «HUECOS DE AMULETO: 0 DE 5» deja «DE 5» solo en el segundo renglón y no aclara si son libres u ocupados; «AMULETOS 0/5» alcanza (`src/client/pantallas/camino.ts:82`, texto `avance` en `textos.ts`).
- **Mano de 8 del Mentiroso**: la fila de atrás asoma 46–48 px (`mesa-mentiroso.png`); se lee el índice pero no el dibujo. Abanico de una fila con solape horizontal como Balatro (`mesa.css:1900-1902`).
- **Conteo**: el «+5» de la tercera carta se sale del naipe hasta el borde de la pantalla (`390-golpe-01.png`); topar el x al naipe (`src/client/pantallas/mesa.ts`, donde se dispara `numero()` por carta).
- **Cara de Póker**: su cortina cae justo encima del «318» y de la barra que baja (`390-golpe-09.png`); demorarla hasta que el número se asiente (`mesa.ts:521-524`).
- **JUGADAS**: «Multi ×3 al cantar ¡ESCOBA!» ocupa cuatro renglones en la columna de Multi y CERRAR queda arriba a la derecha, lejos del pulgar (`src/client/estilos/pantallas.css`, modal de jugadas).

## Qué haría en la próxima versión

Paquete «el Rey se lee de un vistazo en el bolsillo». Uno: una sola cifra de Ataque, la verdadera (`q.contra` cuando hay selección), con su ×2 en el lugar de la nota de Furia, y «TE PEGA» encima también en el móvil. Dos: en ≤740 px de alto, Ataque y Furia en una fila junto a la barra de Vida, y el naipe del enemigo con alto mínimo de 96 px. Tres: grito y bocadillos medidos antes de ubicarse, nunca sobre `.botones`. Cuatro: la QA sube a 360x740 y muesca en los estados de mesa, con `mesa-segunda` y un estado con el Tajo armado, y «solape-mesa» suma la cabecera, la placa del Ataque, los sellos y los gritos. Cinco: mano de ocho en abanico de una fila. La Constitución, intacta.
