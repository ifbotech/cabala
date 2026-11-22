```json
{
  "jurado": "jurado-ux-movil",
  "version": "0.27.0",
  "puntajes": { "claridad": 8.6, "diversion": 8.5, "estetica": 8.4, "veredicto": 8.5 },
  "defectos": [
    {
      "prioridad": "P1",
      "pantalla": "Mesa al elegir, con la cuenta plegada (390x664 mesa-seleccion, mesa-escalon, mesa-mentiroso.elige-3, mesa-garrote; 360x740 mesa-escalon; 390x844 mesa-mentiroso.elige-3)",
      "ventana": "390x664, 360x740 y 390x844 con la mano de 8",
      "archivo": "src/client/estilos/mesa.css:5086-5128 (.plegada esconde .c-desglose; .plegada-2 esconde .c-jugada, .c-efectos, .c-causa, .c-frena y .c-queda) + src/client/pantallas/mesa.ts:370-389 (elige el nivel; no hay toque que la despliegue)",
      "que": "La mano ya no cede, pero la cuenta que cede se lleva de más. En un renglón queda «23 × 24 = 552 LO ABATÍS» o «66 × 6 = 396 TE PEGA 19»: no dice qué jugada armaste (Par, Escalera), ni lo que curan las Copas (el «+8» que sí está en 390×844), ni el Escudo que suma, ni «SOBRAN 77 · SE PIERDEN», ni LE QUEDAN. En 390×844 con el Mentiroso y tres naipes (elige-3) ya se va el desglose entero. El comentario del CSS dice que queda «a un toque, en la ayuda»: es el botón «?» de arriba a la derecha, fuera de la zona del pulgar, y nada en la cuenta lo señala.",
      "por_que": "Es un juego de jugadas de naipes: el nombre de la jugada y lo que te da cada palo son la mitad de la decisión. En la ventana del navegador con barras (390×664), que es donde cae quien abre el enlace, nunca se ve escrito «Par» ni «Escalera» al elegir. Balatro móvil no esconde nunca el nombre de la mano. El autor lo declara a medias y coincido: es lo que frena hoy.",
      "propuesta": "Que el renglón lleve siempre la jugada y los efectos en chico: «Escalera · 23×24=552 · ♥+8 · LO ABATÍS» (el nombre a 14 px a la izquierda, los chips de palo sin rótulo). Y que la cuenta plegada sea una diana: un toque la despliega como hoja sobre la escena (no empuja la mano) y otro la cierra; un «▾» al final del renglón lo avisa. Que la QA falle si con una jugada válida no hay ningún nodo visible con el nombre de la jugada."
    },
    {
      "prioridad": "P2",
      "pantalla": "Mesa con escena baja: el enemigo es una tira y la placa TE PEGA le tapa la cara (360x740 mesa-seleccion, mesa-escudo; 390x664 mesa, mesa-seleccion, mesa-chinchon; 360x740 mesa-mentiroso en reposo)",
      "ventana": "360x740 y 390x664",
      "archivo": "src/client/mano.ts:113 (ESCENA_PISO = 108) + src/client/estilos/mesa.css:4831 (la columna propia de la placa solo desde 741 de alto) y el bloque de la placa en un renglón de la 0.27",
      "que": "En 360×740 al elegir, del Guardia queda el «10» y la punta del sombrero: la placa «×19 escudo −4» cae justo sobre la cabeza. En 390×664 en reposo, la placa «19» le tapa el torso y al elegir la cara. En 360 en reposo, TE PEGA ocupa la mitad derecha de la figura con el naipe entero disponible a su izquierda.",
      "por_que": "No se pierde información (el daño se lee bien), pero el rival deja de ser un personaje y pasa a ser un rectángulo con un número. Slay the Spire móvil nunca pone la intención sobre la cara del enemigo. En el Rey (mesa-rey) duele más, porque la corona y la cara son el premio visual del tramo.",
      "propuesta": "Con escena baja, recortar el naipe del enemigo desde la cabeza (object-position arriba, con la cara centrada en los 80 px del piso) y anclar la placa de un renglón al borde derecho, fuera de la caja de la cara (x ≥ 62 % del naipe), o colgarla de la barra de Vida a la derecha del nombre. Sumar a la QA una regla: la placa no pisa la caja «cara» del enemigo."
    },
    {
      "prioridad": "P2",
      "pantalla": "Contragolpe y maldición del Garrote: los números ahora nacen sobre la Vida (390-contragolpe-10, 390-maldicion-13)",
      "ventana": "390x844",
      "archivo": "src/client/fx/director.ts:25-28 (zonas prohibidas: [data-hud-vida] .valor está, pero los flotantes del contragolpe nacen dentro de la caja del HUD) + src/client/pantallas/mesa.ts (origen de «−N» y «−N ESCUDO» del contragolpe)",
      "que": "Cerraron lo que pedí: ya no caen sobre GOLPEAR ni DESCARTAR. Pero ahora «−19» y «−4 ESCUDO» se apoyan en el canto de arriba del HUD, y en maldicion-13 el «−18» pisa la cifra de Vida justo cuando cambia: se lee «4…/92» con el número tapado por la etiqueta y una mancha.",
      "por_que": "El dato que el golpe modifica es el que queda ilegible durante el golpe. Es breve y no frena, pero es el momento en que mirás cuánta Vida te queda.",
      "propuesta": "Que el «−N» nazca encima del retrato (a la izquierda de la Vida, que no es dato) o suba 28 px sobre el borde del HUD, hacia la franja vacía entre botones y HUD; y que la cifra de Vida haga su propio pulso rojo debajo, sin nada encima."
    }
  ],
  "aciertos": [
    "Mi P0 quedó cerrado en lo que se ve: en 390×844, 390×664 y 360×740, con manos de 3, 4, 7 y 8, entre el reposo y elige-3/elige-4/elige-5 ningún naipe no elegido cambia de lugar (6 de Bastos en x 8, y 505 / y 365 antes y después; mesa-mentiroso contra sus elige-3 y elige-5). Queda el hueco en silueta de lo que subió.",
    "La Escalera de 3 del Mentiroso ya no junta las filas: el Escalón es un sello «+2» sobre el naipe del paño (mesa-escalon en las tres ventanas) y la mano sigue en sus dos filas.",
    "El paño con naipes enteros a escala menor funciona: cinco naipes en fila a 360 de ancho se leen por índice y palo sin ampliar (360x740 mesa-mentiroso.elige-5), con GOLPEAR apagado y «ESO NO ES JUGADA» en su lugar.",
    "La oferta quedó como pedí: SALTAR (+4 DE ORO) en el renglón del título, a 48 px de alto, y «HAY MÁS ↓» sobre el HUD (elegi-amuleto, oferta-evoluciona, elegi-bendicion). «TU JUGADA: Envido» ya lleva su espacio.",
    "Medidas: 0 recortes, 0 solapes de dianas, separación mínima de 8 px, ninguna diana de menos de 44 px de alto y ninguna letra de menos de 14 px en los 69 + 12 + 12 estados de las tres ventanas. Franja tocable mínima de la mano: 60 px (360, mano de 8), asoma 46 px."
  ],
  "capturas_vistas": [
    "visual-qa/390x844: mesa-mentiroso, mesa-mentiroso.elige-3, mesa-mentiroso.elige-5, mesa-escalon, mesa-seleccion, mesa-postas-arrastre, mesa-chinchon.elige-5, elegi-amuleto, oferta-evoluciona, elegi-bendicion, mapa-tesoro, resumen-derrota-movil, botin, pulperia",
    "visual-qa/390x664: mesa, mesa.elige-3, mesa-seleccion, mesa-mentiroso, mesa-mentiroso.elige-3, mesa-mentiroso.elige-5, mesa-escalon, mesa-chancho.elige-4, mesa-chinchon, mesa-chinchon.elige-5, mesa-garrote, mesa-rey",
    "visual-qa/360x740: mesa-mentiroso, mesa-mentiroso.elige-5, mesa-escalon, mesa-chancho.elige-4, mesa-escudo, mesa-rey, mesa-seleccion",
    "jurado/secuencias: 390-contragolpe-08, -10; 390-maldicion-13; 390-botin-brota-09; 390-rey-segunda-12; 390-rey-cae-08; 390-golpe-05; 390-postas-golpe-06",
    "mirar: 390-conteo",
    "todas las medidas.json de 390x844, 390x664 y 360x740; visual-qa/informe.json"
  ]
}
```

## Veredicto

La 0.27 cumple la regla que vengo pidiendo desde la 0.25: en el teléfono, el dedo manda. Comparé reposo contra elige-3, elige-4 y elige-5 en las tres ventanas y la mano no se corre en ninguna, ni con la Escalera del Mentiroso ni en 390×664. **Mi P0 está cerrado.** Claridad sube de 8,2 a 8,6 y el veredicto de 8,1 a 8,5.

No llega a 9 porque el alto que ganó la mano lo pagó la cuenta, y pagó de más: plegada, calla el nombre de la jugada y lo que dan los palos, y no se abre con un toque. Ese es el P1 que queda. El enemigo aplastado bajo su placa en 360 y 664 y los números del contragolpe sobre la Vida son P2.

Alcance: no corrí nada. Que la mano no se mueve lo saco de comparar capturas quietas a ojo, de `mano.ts:108-117` y `:373-421` y de la regla «elige-cinco» en `scripts/visual-qa.ts:711-769`. El `informe.json` que quedó en disco solo trae los 12 estados de 360×740 (0 fallos); los de 390×844 y 390×664 no los pude confirmar en el informe, solo en las fotos. El arrastre en vivo, el rollo de la oferta y los tiempos del contragolpe: leídos en código, no vistos.

## Contra mi veredicto de la 0.26

**Resueltos:** el P0 entero (Escalón y 390×664), el P1 de la oferta (SALTAR arriba y «hay más ↓»), el P2 de los números sobre GOLPEAR/DESCARTAR, «TU JUGADA» pegado a «Envido», y GOLPEAR ya queda a la misma altura con y sin el botón del Engaño. **Siguen:** el TE PEGA sobre la cara del enemigo en ventanas bajas (ahora mi P2), el baúl del mapa, que colgado de la esquina todavía tapa media calavera, y el botín que roza el HUD. **Nuevo:** la cuenta plegada (P1) y los números del contragolpe sobre la Vida.

## Defectos menores

- **«HAY MÁS ↓» tapa el texto de la tercera opción** en vez de ir sobre un pie esfumado: corta «+1 Multi cada 30 de oro (…» por el medio (elegi-amuleto, elegi-bendicion; `src/client/estilos/pantallas.css:4853-4876`, margin-top −30 px y máscara de solo 44 px). La Maldición del Cofre sigue debajo del pliegue.
- **Reyes sin cabeza en el resumen**: se ven tres medios naipes con el «12» patas arriba (resumen-derrota-movil; `src/client/pantallas/camino.ts:~1500`, .fin-reyes: anclar el recorte arriba).
- **El baúl del Tesoro** sigue tapando media calavera de su nodo (mapa-tesoro; `src/client/pantallas/camino.ts:328`, .nodo-tesoro).
- **Los huecos de la mano de 7 y 8** son una mancha gris donde se enciman siluetas de dos filas; con cinco elegidos no se entiende qué quedó (mesa-chinchon.elige-5; `src/client/mano.ts:125`, capa `hueco`: dibujar solo el contorno).
- **Los sellos «+6» de Escudo del Chinchón** tapan los palos de la fila de abajo en 390×664 (mesa-chinchon; `src/client/estilos/mesa.css:5131+`).

## Qué haría en la próxima versión

Haría de la cuenta plegada una pieza de primera y no un recorte. Un renglón fijo con cuatro casillas en el mismo orden siempre: jugada, fórmula, lo que te dan los palos y el desenlace (LO ABATÍS, TE PEGA N o NO TE PEGA). Un toque sobre el renglón abre el desglose como hoja sobre la escena, sin mover la mano ni el paño, y se cierra sola al golpear. Con eso la cuenta larga puede plegarse también en 390×844 cuando hay más de seis términos, y la regla es una sola en las tres ventanas. Para la escena baja, un retrato del enemigo pensado para 80 px: cara a la izquierda, nombre y Vida al medio y TE PEGA a la derecha, en una fila, como la barra de jefe de Slay the Spire móvil. Los números del contragolpe, sobre el retrato. Y la QA con dos reglas nuevas: jugada válida implica nombre visible, y ninguna placa pisa la cara del enemigo. La Constitución queda intacta.
