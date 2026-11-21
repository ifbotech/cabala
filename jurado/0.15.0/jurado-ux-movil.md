```json
{
  "jurado": "jurado-ux-movil",
  "version": "0.15.0",
  "puntajes": { "claridad": 7.1, "diversion": 7.3, "estetica": 7.6, "veredicto": 7.2 },
  "defectos": [
    {
      "prioridad": "P1",
      "pantalla": "mesa con selección (antes de golpear)",
      "ventana": "390x844, 390x664, 360x740",
      "archivo": "src/client/estilos/mesa.css:1669-1704 (.c-desglose { display: none } y solo se enciende en @media (min-width: 701px)) + src/client/pantallas/mesa.ts:174-194 (el desglose ya se arma, también en el móvil)",
      "que": "La línea fija con el desglose («7 + 7 · Par +4 …» en rojo y el Multi en azul), que es la novedad de claridad de la versión, no existe en el teléfono. En `390x844/mesa-seleccion.png`, `telefono/390x664-seleccion-escoba.png` y `360x740-seleccion-chinchon.png` la cuenta muestra «52 × 6 = 312» y los chips FLOR / TE PEGA / LE QUEDAN, pero nada dice de dónde salen el 52 y el 6. La única forma de saberlo es mirar el conteo animado después de golpear, o abrir JUGADAS, que no incluye Amuletos ni Cábalas.",
      "por_que": "En el móvil el jugador decide con el pulgar sobre la mano y la cuenta a 2 cm; es la pantalla donde más se necesita leer qué pieza suma antes de comprometerse. Balatro móvil muestra Fichas × Multi con la jugada nombrada y StS móvil enseña el daño modificado sobre cada carta. Hoy el teléfono es la ventana con menos información, y con la cuenta ya compacta en dos pisos hay lugar.",
      "propuesta": "Mostrar `.c-desglose` también en ≤700 px como tercer piso de la cuenta, a `--fs-s` (16 px), en una sola línea con `text-overflow: ellipsis` y, si no entra, solo la parte del Daño con un «…» que abre JUGADAS. En la consulta `@container mesa (max-height: 740px)` (mesa.css:2015) se puede quedar sin los rótulos de los chips para pagar ese renglón. Sumarlo a la regla «solape-mesa» de la QA."
    },
    {
      "prioridad": "P1",
      "pantalla": "mesa durante el golpe (conteo pieza por pieza)",
      "ventana": "390x844",
      "archivo": "src/client/pantallas/mesa.ts:714-722 (el cartel se clava en rc.bottom de la cuenta con translate -100%) + :699 (los «+N» de las cartas a rc.top - 4) + src/client/estilos/mesa.css:1582-1586",
      "que": "El carril único ya está (un cartel por vez, la queja de los seis), pero en 390 cae justo sobre el renglón de abajo de la cuenta, y en el móvil la mano está pegada debajo. En `390-golpe-03.png` el cartel «Calls … +10» tapa la cura «+15» y a la vez queda cortado por el «+3» gigante de la carta del medio; en `390-golpe-05.png` «Short hand +4» se monta sobre «+15» y los «+2 / +3 / +5» rojos de las cartas siguen encima de los naipes. El «+24» del HUD sale sobre el retrato (`390-golpe-05` y `-07`).",
      "por_que": "El conteo existe para enseñar qué pieza da qué, y en el teléfono el nombre de la pieza es justo lo que se tapa. Además no hay desglose previo en el móvil (defecto anterior), así que este cartel es la única explicación que recibe el jugador de pulgar.",
      "propuesta": "En ≤700 px anclar el cartel ENTRE la barra de Vida y la fórmula (rc.top de la cuenta, translate 0 hacia arriba) o reemplazando temporalmente el renglón de chips, con z-index sobre los `numero()`. Los «+N» de las cartas, dentro del naipe (rc.top + 24) y no en la franja de la cuenta. El número de la ficha del HUD, a la derecha de la bandeja, nunca sobre el retrato (hud.ts:233, `Math.max(56, …)` es poco)."
    },
    {
      "prioridad": "P2",
      "pantalla": "mesa cada vez que habla el Bufón (inicio de turno, tras el golpe, Rey)",
      "ventana": "390x844, 390x664, 360x740",
      "archivo": "src/client/estilos/mesa.css:609-632 (.esc-bufon top: -50px con bocadillo; max-width 54vw) + src/client/pantallas/mesa.ts:87-99 (3,4 s)",
      "que": "Con bocadillo, el Bufón sube 50 px y su cara pisa la cabecera: «EL REÑIDERO · GUARDIA / Turno 4» queda «EL REÑ… / urno» en todas las mesas (`390x844/mesa-seleccion.png`, `mesa-mentiroso.png`, `telefono/390x664-*.png`). El bocadillo tapa el índice del enemigo (el «10», el «12» del Caudillo) y en 360 se monta sobre el borde del botón «?» (`360x740-rey-en.png`). La QA no lo ve: mide «El Reñidero · Guardia» a 16 px y cero recortes porque el Bufón tiene `pointer-events: none` y no cuenta como solape.",
      "por_que": "Pasa cada turno, en el momento en que el jugador mira qué Rey tiene enfrente y cuántos turnos lleva. No rompe el gesto (no roba toques), pero la cabecera y el índice del rival son lectura básica.",
      "propuesta": "En el móvil, el bocadillo como tira de una línea bajo la cabecera (ancho completo menos los dos botones, sin subir al Bufón) o al costado del enemigo en la columna de los sellos; el Bufón queda en top: 0 siempre. Sumar a «solape-mesa» la cabecera y el índice del enemigo contra `.esc-bufon`."
    }
  ],
  "aciertos": [
    "La mesa ahora cede por alto: `@container mesa / size` con zonas seguras descontadas en #app. En 390x664 (`telefono/390x664-seleccion-escoba.png`, `-mentiroso.png`, `-rey.png`) y 360x740 entran enemigo, barra de Vida, cuenta entera, mano y botonera sin pisarse; la cuenta va con z-index 3 y fondo propio.",
    "El destino del arrastre avisa: esquinas doradas que laten, «SOLTÁ ACÁ» visible (`360x740-arrastre-mesa-mentiroso.png`, `390x844/mesa-arrastrando.png`) y la cuenta («ESO NO ES JUGADA», «52 × 6 = 312») queda a la vista durante todo el gesto.",
    "El gesto perdona: umbral de 14 px para el dedo, la selección previa vuelve si soltás fuera de zona y el grupo se achica a 0,8 (mano.ts:64-69, :289-295; leído en código, no visto).",
    "La Pulpería por fin tiene SALIR en la barra del pulgar y precio en el renglón del nombre; la Cábala usa todo el ancho de la tarjeta (`360x740-cabala-es.png`).",
    "La QA visual suma 390x664 para los estados de mesa con regla «solape-mesa»; letra mínima 16 px, dianas ≥ 44 px y separación 8 px en las 33 medidas de 390; 133 fps en la puerta."
  ],
  "capturas_vistas": [
    "visual-qa/390x844/mesa-seleccion.png", "visual-qa/390x844/mesa-arrastrando.png", "visual-qa/390x844/mesa-mentiroso.png", "visual-qa/390x844/pulperia.png", "visual-qa/390x844/botin.png",
    "telefono/390x664-seleccion-escoba.png", "telefono/390x664-arrastre-mesa.png", "telefono/390x664-arrastre-mesa-mentiroso.png", "telefono/390x664-mentiroso.png", "telefono/390x664-rey.png", "telefono/390x664-pulperia-es.png",
    "telefono/360x740-seleccion-chinchon.png", "telefono/360x740-arrastre-mesa-mentiroso.png", "telefono/360x740-cabala-es.png", "telefono/360x740-rey-en.png", "telefono/360x740-pulperia-es.png",
    "jurado/secuencias/390-golpe-03.png", "jurado/secuencias/390-golpe-05.png", "jurado/secuencias/390-golpe-07.png", "jurado/secuencias/390-rey-irrumpe-04.png", "jurado/secuencias/390-rey-cae-05.png", "jurado/secuencias/390-botin-brota-07.png", "jurado/secuencias/390-mapa-paso-03.png",
    "las 33 medidas.json de visual-qa/390x844 y 390x664"
  ]
}
```

## Veredicto

La 0.15.0 arregló lo que dije que rompía el teléfono. La mesa dejó de ser una suma de alturas fijas: con la consulta sobre el propio contenedor, en 390x664 y 360x740 la cuenta queda entera, nunca bajo el enemigo, y la mano solo es alta cuando va en dos filas. El arrastre tiene ahora la jerarquía correcta: el enemigo late y dice «SOLTÁ ACÁ», la cuenta sigue a la vista y un toque nervioso ya no te borra la selección. Por eso no hay P0 esta vez y la claridad sube (6,7 → 7,1).

No sube más porque el teléfono quedó como la ventana con menos información: el desglose de Daño y Multi, la gran apuesta de claridad de la versión, está apagado por debajo de 701 px. Y el conteo de pieza por pieza, que ahora va de a uno, en 390 cae justo donde se pisa con la cura y con los «+N» de las cartas. Diversión sube un poco (el gesto se siente seguro y rápido); la estética no cambia en el móvil.

Alcance: las fotos de `artifacts/dedo/` son de la 0.14 (no las conté). **La muesca (390x844 con 47 + 34 px) no tiene foto en esta versión**: `telefono.ts` la lista pero no hay archivo; lo juzgo por código (`#app` descuenta `env()` y la mesa consulta su propio alto), no visto. La «SEGUNDA CARA» y «¡AL PELO!» no aparecen en ninguna captura de 390: no los juzgo. No corrí nada.

## Contra mi veredicto de la 0.14.0

**Resueltos:** P0 de la mesa que no cedía (en 664 y 360, visto); P1 del halo y «SOLTÁ ACÁ» recortados; la cuenta tapada durante el arrastre; el umbral táctil y la selección perdida; el bocadillo durante el arrastre; la cabecera en inglés; la fila fantasma del «+N» del HUD; la Pulpería con SALIR arriba; la tarjeta de Cábala con media mitad vacía. **A medias:** el P1 del conteo (un carril, pero mal anclado en 390). **Siguen:** `user-scalable=no`; la muesca sin foto en la QA.

## Defectos menores

- **Botín**: SEGUIR y ELEGIR quedan a media pantalla (y ~480) con 200 px vacíos debajo; llevarlos a la barra del pulgar como en la Pulpería (`src/client/estilos/pantallas.css:959-970`).
- **`user-scalable=no`** sigue en `index.html:5`: impide ampliar a quien lo necesite; quitarlo y frenar el doble toque con `touch-action: manipulation`.
- **QA**: la ventana baja solo cubre `mesa*` sin `mesa-arrastrando`, y no hay 360x740 ni muesca en `scripts/visual-qa.ts` (~:25); sumarlas como en `artifacts/telefono.ts`.
- **Pulpería**: los tres Comunes repiten la misma frase larga y entra artículo y medio en 360; con el palo como icono, abreviar a «+3 Daño por carta de Oros · +1 por carga (tope +6)» (`src/rules/notas.json` / textos de Amuletos).
- **Mesa arrastrando en 844**: con toda la mano en el aire quedan ~160 px muertos entre cuenta y botones; ahí podría ir el desglose (`mesa.css:1956-1961`).

## Qué haría en la próxima versión

Paquete «el teléfono sabe lo mismo que la tele». Uno: desglose de Daño y Multi visible en ≤700 px como tercer piso de la cuenta, cediendo rótulos de chips en pantallas bajas. Dos: el conteo anclado entre la barra de Vida y la fórmula, por encima de todos los números, con los «+N» de las cartas dentro del naipe. Tres: el Bufón deja de subir a la cabecera: su voz pasa a una tira fija de un renglón bajo la barra superior. Cuatro: Botín y Fogón con sus botones en la barra del pulgar. Cinco: la QA visual con 360x740 y muesca en todos los estados de mesa, y la regla «solape-mesa» ampliada a cabecera, índice del enemigo y cartel del conteo. La Constitución, intacta.
