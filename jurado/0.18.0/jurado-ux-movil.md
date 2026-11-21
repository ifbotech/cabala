```json
{
  "jurado": "jurado-ux-movil",
  "version": "0.18.0",
  "puntajes": { "claridad": 7.3, "diversion": 7.5, "estetica": 7.9, "veredicto": 7.4 },
  "defectos": [
    {
      "prioridad": "P1",
      "pantalla": "mesa con una selección que no abate y Escudo propio > 0 (segunda cara del Caudillo sin repetir; vale para cualquier enemigo)",
      "ventana": "390x844 y 390x664",
      "archivo": "src/client/pantallas/mesa.ts:332 (ponerGolpeRey recibe enemigo.ataque + furia salvo con Tajo) y :160 (la placa nace con el ataque crudo) contra :253 (el chip usa q.contra, ya descontado el Escudo; src/rules/combate.ts:285-287)",
      "que": "En `390x844/mesa-segunda-cambia.png` y `390x664/mesa-segunda-cambia.png` la placa del Rey dice «TE PEGA 21» en grande y el chip de la cuenta «TE PEGA 19», en la misma pantalla y con el mismo rótulo. Con el Tajo armado (`mesa-segunda.png`) la placa sí pasa a q.contra (42, y ahí el Escudo 2 no frena nada, cosa que la regla «TE PEGA ×2» no dice). La placa cambia de significado según el estado: a veces golpe crudo, a veces golpe neto.",
      "por_que": "Es el número con el que el jugador decide si suelta o descarta. Dos «TE PEGA» distintos obligan a adivinar cuál manda (el 2 que falta es el Escudo, pero nada lo dice). Es la tercera versión seguida en que la cifra más roja del teléfono no coincide con la verdad; en 0.17 pedí la regla semántica «[data-n=ataque] = q.contra cuando hay cuenta» y se aplicó solo al Tajo.",
      "propuesta": "Con selección viva, la placa muestra SIEMPRE q.contra (llamar a ponerGolpeRey(q.contra) fuera del Tajo también) y, si difiere del crudo, la causa chica debajo igual que el Tajo: «21 −2⛨». El chip del Tajo suma «atraviesa tu Escudo» en su ayuda y en la regla corta. Regla de QA: con cuenta y q.contra ≠ null, texto de [data-n=ataque] === q.contra en mesa-segunda-cambia."
    },
    {
      "prioridad": "P1",
      "pantalla": "grito del Personaje en la mesa y en el Botín",
      "ventana": "390x844",
      "archivo": "src/client/hud.ts:288-343 (ubicarGrito barre la pantalla entera sin tope de distancia al retrato ni cola hacia él) + scripts/visual-qa.ts:205-216 («grito-tapa» no mide la distancia, aunque su comentario dice «cerca de su retrato»)",
      "que": "Ya no tapa Vida ni botones, pero en el teléfono el único hueco libre está arriba: «¡AY, MI ESPALDA!» sale sobre la cabeza del Caudillo (`390x844/mesa-grito.png`), «¡EH, MÁS RESPETO!» encima del rótulo TE PEGA del Rey (`390-rey-tajo-00.png`) y «BARRIDO Y A LA BOLSA.» pegado bajo el Bufón (`botin-grito.png`), a 500–600 px del retrato que habla y sin cola.",
      "por_que": "Un globo sobre la cabeza del Rey se lee como voz del Rey; en el Botín, como un segundo renglón del Bufón. El Personaje pierde su voz justo cuando la versión se la quiso dar, y en el Tajo el grito cubre el rótulo del número que decide la jugada.",
      "propuesta": "En ≤700 px, el grito no busca hueco: va anclado al retrato, encima de la fila de Amuletos del HUD (o reemplazándola 1,2 s) con cola al retrato, o en la tira del Bufón con el retratito del Personaje a la izquierda. Tope de distancia en ubicarGrito (centro del globo a ≤140 px del ancla) y la QA que lo mida."
    },
    {
      "prioridad": "P2",
      "pantalla": "mesa contra el Caudillo durante el conteo del Tajo de revés",
      "ventana": "390x844",
      "archivo": "src/client/estilos/mesa.css:3147-3149 (`.cuenta:not(.revelada) .c-revela { display: none }`: LE QUEDAN aparece con display y reflowea) + src/client/pantallas/mesa.ts:244 y :290 (¡CRÍTICO! va después del chip del Tajo y salta de renglón) + scripts/visual-qa.ts:30 (ningún estado congela el conteo)",
      "que": "Antes de soltar (`390-rey-tajo-04.png`) todo entra; al revelarse «LE QUEDAN 39» (`-06` a `-12`) el ¡CRÍTICO! cae a un renglón propio, la cuenta crece unos 28 px hacia arriba, la columna del Rey se aplasta y el rótulo «TE PEGA» se monta sobre el borde inferior del botón ≡. El comentario de mesa.ts:244 promete que la cuenta no cambia de tamaño; en el teléfono sí cambia.",
      "por_que": "Es la trepada a la cabecera que marqué en 0.16 y 0.17, ahora en el momento de más atención (el golpe de 312 y el Tajo de 48). La QA no la ve porque solape-enemigo solo corre en estados quietos.",
      "propuesta": "Reservar el lugar de LE QUEDAN con visibility:hidden (no display:none) y en ≤700 px poner ¡CRÍTICO! dentro de la fórmula (junto al total) en vez de en la fila de chips. Sumar a la QA un estado «mesa-tajo-cuenta» congelado con .revelada."
    }
  ],
  "aciertos": [
    "El Tajo de revés por fin tiene una sola gramática: «48» grande, «24 ×2» chico debajo, chip «TE PEGA 48 (24 ×2)» y cartel «TAJO DE REVÉS · 24 ×2 = 48» sobre el naipe al pegar (`390-rey-tajo-04`, `-11`, `-12`). Mi P0 de 0.17 queda resuelto.",
    "La previa con suspenso funciona en el bolsillo: «LO ABATÍS / NO LO ABATÍS» manda, la tajada va a la barra y el total se revela con el conteo (`390-golpe-03` → `-07`).",
    "«AMULETOS 0/5» en la Pulpería y el «+20» del cobro ya no se posa sobre la celda del oro (`390-rey-cae-10.png`).",
    "Dianas ≥ 44 px, separación ≥ 8 px, 0 solapes y 0 recortes en las 32 medidas de 390x844 y las 6 de 390x664; letra ≥ 16 px salvo los nombres de los finales (14)."
  ],
  "capturas_vistas": [
    "visual-qa/390x844/mesa.png", "mesa-seleccion.png", "mesa-arrastrando.png", "mesa-rey.png", "mesa-segunda.png", "mesa-segunda-cambia.png", "mesa-grito.png", "mesa-mentiroso.png",
    "botin.png", "botin-grito.png", "pulperia.png", "mapa.png", "jugadas.png", "elegi-una.png", "fin-victoria.png",
    "visual-qa/390x664/mesa-segunda.png", "mesa-segunda-cambia.png",
    "jurado/secuencias/390-rey-tajo-00.png", "-02", "-04", "-06", "-08", "-09", "-10", "-11", "-12",
    "390-golpe-03.png", "390-golpe-07.png", "390-golpe-09.png",
    "390-rey-segunda-06.png", "390-rey-segunda-12.png", "390-rey-cae-10.png", "390-rey-cae-16.png", "390-rey-irrumpe-05.png",
    "390-botin-brota-06.png", "390-botin-brota-12.png", "390-mapa-paso-03.png", "390-portada-03.png",
    "las 32 medidas.json de visual-qa/390x844 y las 6 de 390x664"
  ]
}
```

## Veredicto

La 0.18.0 arregla lo que más me dolía en el teléfono: el Tajo de revés ahora se lee de una, con la cifra grande que es el golpe de verdad, la causa chica debajo y un cartel que hace la cuenta al pegar. El conteo con suspenso funciona en vertical: primero el veredicto, después el número que se asienta. El grito dejó la Vida en paz y la Pulpería dice «0/5». Diversión sube un poco (7,5).

Claridad, que en mi ficha pesa doble, apenas sube (7,2 → 7,3). La lógica de «una sola verdad por cifra» se aplicó solo al caso del Tajo. En el caso común, cuando el Escudo frena algo, la placa dice 21 y el chip dice 19. El grito, al huir de las cifras, terminó lejos de su dueño y se lee como voz del Rey o del Bufón. Y la trepada a la cabecera vuelve justo en el conteo del golpe grande. Las tres cosas tienen la misma raíz: la QA mide estados quietos y no mide qué significa cada número.

Alcance: no corrí nada. El arrastre lo juzgo por `mesa-arrastrando.png` («SOLTÁ ACÁ» sobre el Rey, DESCARTAR con borde punteado; bien) y por código (`src/client/mano.ts` sin cambios desde 0.17: umbral de 14 px). El sonido del conteo lo conozco solo por código, no lo oí. Sigue sin haber foto de 360x740 ni de la muesca.

## Contra mi veredicto de la 0.17.0

**Resueltos:** el ×2 pegado a la cifra (P0); el grito sobre la Vida (aunque nació otro problema); la trepada en `mesa-segunda-cambia` quieta; «HUECOS DE AMULETO: 0 DE 5»; el «+20» sobre el oro. **Siguen:** CERRAR de JUGADAS arriba a la derecha y «Multi ×3 al cantar ¡ESCOBA!» en cuatro renglones; los nombres de los finales a 14 px tachados; Servicios de la Pulpería bajo el pliegue sin indicio; la placa del Tajo sobre la cara del Caudillo en 664; sin 360x740.

## Defectos menores

- **Daño recibido**: el «−48» nace sobre la Vida y tapa el «15» justo cuando cambia (`390-rey-tajo-12.png`); el comentario dice «sin taparla» (`src/client/pantallas/mesa.ts:654-657`: en ≤700 px, que nazca a la derecha de la celda o más arriba).
- **390x664, Tajo**: la placa «⚔42 21×2 🔥3» tapa la cara del Caudillo entera (`src/client/estilos/mesa.css:2875-2882`).
- **Mentiroso**: la fila de atrás de la mano de 8 asoma ~48 px y solo deja ver índice y medio palo (`390x844/mesa-mentiroso.png`; `src/client/estilos/mesa.css`, mano montada en ≤700 px).
- **Finales**: «EL CAUDILLO / EL CAUDAL / EL CACIQUE» a 14 px, tachados y grises (`src/client/estilos/pantallas.css`, nombres de los Reyes caídos).
- **JUGADAS**: CERRAR lejos del pulgar y la nota del canto en cuatro renglones (`src/client/estilos/pantallas.css`, modal de jugadas).

## Qué haría en la próxima versión

Paquete «el número es el número». Uno: la placa del Rey muestra siempre q.contra con selección viva, con su causa chica debajo (Tajo ×2, Escudo −N), y la QA la compara con el chip en todos los estados de mesa. Dos: un canal de voz anclado en ≤700 px, el grito del Personaje pegado a su retrato (sobre la fila de Amuletos, con cola) y nunca en la mitad del enemigo. Tres: la cuenta del teléfono de alto fijo de la previa al conteo (visibility en vez de display, ¡CRÍTICO! dentro de la fórmula). Cuatro: la QA congela el conteo revelado, el golpe recibido y el grito, y suma 360x740 con muesca. Cinco: CERRAR al pie de los modales. La Constitución, intacta.
