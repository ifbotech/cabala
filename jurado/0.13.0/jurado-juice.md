```json
{
  "jurado": "jurado-juice",
  "version": "0.13.0",
  "puntajes": { "claridad": 7, "diversion": 6.5, "estetica": 7.5, "veredicto": 6.8 },
  "defectos": [
    {
      "prioridad": "P1",
      "pantalla": "botín / modal «ELEGÍ UNA» tras el último golpe",
      "ventana": "todas (medido a 1366x768)",
      "archivo": "src/client/pantallas/camino.ts:293-328 (con src/client/sprites.ts:38-45 y 102-123, src/client/fx/efectos.ts:365, src/client/estilos/base.css:542-549 y 991-995)",
      "que": "En frío, abrir la oferta cuesta un cuadro de ~120 ms: justo el premio del combate entra con un tirón.",
      "por_que": "Es el momento de mayor expectativa del bucle (qué me tocó) y el único cuadro largo que queda; se siente como un enganche del juego, no como suspenso.",
      "propuesta": "Calentar el modal antes de mostrarlo: decodificar (Image.decode) y pintar una vez, fuera de vista pero no en display:none, los bustos de Rey, los iconos grandes y los marcos paloX/-viva durante el conteo o la pausa de «cae»; forjar lo que falte de la oferta antes de montar; cuantizar el radio de disco() y prearmar los del halo; sacar mix-blend-mode del aura; montar el velo en un cuadro y las opciones en el siguiente."
    },
    {
      "prioridad": "P1",
      "pantalla": "mesa · caída del Rey",
      "ventana": "1280x800 y 390x844",
      "archivo": "src/client/pantallas/mesa.ts:368-389 (y :157 para el rótulo en reposo)",
      "que": "El Rey muere igual que una Sota: mismo sonido «cae», misma rajadura, mismas 5 monedas. Mientras dice su última línea el bocadillo le tapa la corona y el índice, y la mesa sigue diciendo «Elegí cartas y arrastralas al enemigo».",
      "por_que": "Es el clímax de cada tramo y no tiene remate propio: sin hitstop largo, sin fogonazo, sin silencio de la música. El cartel de reposo en plena muerte rompe la escena.",
      "propuesta": "Remate de jefe: congelar 180-220 ms con la música cortada, cuadro blanco de pantalla, sacudida de toda la .mesa con fuerza 3, rajadura más lenta, lluvia de monedas y fanfarria propia; el bocadillo al costado del naipe; ocultar el rótulo de reposo mientras `ocupado`."
    },
    {
      "prioridad": "P1",
      "pantalla": "mesa · golpe",
      "ventana": "1280x800 y 390x844",
      "archivo": "src/client/pantallas/mesa.ts:278-290 y 386-406; src/client/fx/motor.ts:227-229 y 242-257",
      "que": "El impacto no escala y el hitstop es cosmético: congelar(65) solo frena el lienzo de efectos (el DOM sigue), la sacudida mueve 2-4 px solo al enemigo, y un exacto de 340 que mata pega casi como uno de 20. Además el enemigo siguiente entra a los 420 ms con las mitades (850 ms) y el número (950 ms) todavía encima.",
      "por_que": "Sin escalada no hay «golpazo»; y el amontonamiento (golpe-07) ensucia a la vez el remate y la entrada del que viene.",
      "propuesta": "Tres escalones por total/vidaMax: hitstop real de 60/110/170 ms (pausar también las animaciones CSS de la escena), sacudida de .escena 1/2/3, fogonazo dorado en el exacto; esperar a que termine la rajadura (o limpiar sus efectos) antes de «entra»."
    }
  ],
  "aciertos": [
    "El conteo en cadena (cada carta salta con su +N, nota que sube un semitono, total que vibra) se lee de un vistazo y dura menos de medio segundo.",
    "La rajadura del naipe en dos mitades con recortes de papel y el oro volando al HUD es la mejor imagen del juego.",
    "El Bufón que se esfuma y reaparece en humo da continuidad entre pantallas; el retrato del HUD reacciona (mirada, mueca, grito).",
    "Fondos vivos: candil que respira en cuatro cuadros tramados y brasas, a medio costo (un cuadro de cada dos).",
    "Música con pista por pantalla, capa de «fuego» en racha y audio abierto en el primer gesto (leído en código, no oído)."
  ],
  "capturas_vistas": [
    "jurado/secuencias/1280-golpe-00..09 (las diez)",
    "jurado/secuencias/1280-rey-irrumpe-01, 02, 03, 06, 07",
    "jurado/secuencias/1280-botin-brota-01, 03, 04, 06, 08, 09",
    "jurado/secuencias/1280-mapa-paso-02, 04",
    "jurado/secuencias/1280-portada-02",
    "jurado/secuencias/390-golpe-04, 07",
    "mirar/1280-rey-cae, 1280-mesa-grito, 1280-fogon-suspenso, 390-rey-cae"
  ]
}
```

## Veredicto

La 0.13.0 tiene buen esqueleto de jugo: anticipación (conteo), impacto (tajo por palo, blanco del naipe) y remate (rajadura, oro al HUD). Le falta **peso y jerarquía**: todo pega parecido, y el momento más grande, la caída del Rey, es el más chato. Contra *Balatro* o Vlambeer, el golpe informa pero no sacude.

**El cuadro de ~120 ms (causa probable, por lectura; no lo medí).** No hay `fps.txt`. El modal es lo primero que el navegador pinta de casi todo lo que lleva, y varias cosas caen en el mismo cuadro:

1. **La precarga no calienta la pintura.** `precargarTodo` solo deja armadas las cadenas data-URL (`sprites.ts:38-45`). Nadie decodifica ni rasteriza los bustos de Rey (fondo + busto a `--k2`), los iconos a `--k3` ni los marcos `--m-paloX` de 9 trozos con `fill`/`repeat`, que solo usa `.opcion`. Todo eso se decodifica en el primer pintado del velo.
2. **Capas nuevas de golpe.** `brota` (escala + opacidad) promueve cada opción a capa propia, y `.r-aura` suma `mix-blend-mode: plus-lighter` animado (`base.css:542-549`, `991-995`). Al cuadro siguiente el foco inicial cambia `border-image-source` a la variante `-viva`, tampoco decodificada (`ui.ts:81`, `pantallas.css:402-406`).
3. **Maquetado forzado y halo.** `camino.ts:326` pide `getBoundingClientRect()` recién insertado el modal. `haloRey` llama a `disco()` con un radio distinto cada cuadro (`efectos.ts:365`): hasta tres lienzos nuevos por cuadro, llenados píxel a píxel (`motor.ts:263-279`).
4. **Si la cola de forja no terminó** (una tarea por rato libre, `sprites.ts:102-123`), `reyHtml`/`pxPieza` corren `pixeles()` + `toDataURL()` en línea dentro de `modalOferta`.

`artifacts/perf-modal.ts` ya separa `:sync` de `:peor`: `sync` bajo con `peor` alto confirma 1-2; `sync` alto apunta a 3-4.

**Lo que no pude juzgar.** En los cinco cuadros que abrí de `rey-irrumpe` no aparece la banda de irrupción: solo el Bufón llegando en humo y el Rey quieto. La banda, el halo y el tecleo existen en código (`mesa.ts:514-523`), no los vi. El sonido lo leí, no lo oí.

## Defectos menores

- El HUD parpadea en cada cambio de pantalla (`mapa-paso-02` es un cuadro vacío, sin HUD): `pantalla-entra` anima todo el `main` desde opacidad 0 (`src/client/estilos/base.css:982`).
- El grito del retrato («SPOTLESS!», «¡ESCOBA!») tapa el pie de las cartas de la mano (`golpe-08`, `mesa-grito`): `src/client/hud.ts:207` y `.hud-grito` en `base.css:1039`.
- `disco()` guarda un lienzo por cada radio y nunca suelta; `haloRey` y `golpeBastos` piden radios nuevos cada cuadro: `src/client/fx/motor.ts:263`, `src/client/fx/efectos.ts:165` y `365`.
- A 390, en `golpe-07` queda un «NOT A PLAY» fantasma sobre el botón GOLPEAR (visto; causa no confirmada, probable chip de cuenta inválida): `src/client/pantallas/mesa.ts:158-161`.
- Audio (leído): el golpe son dos osciladores sin ruido ni variación de altura, y los efectos van directo a `destination`, sin compresor ni bajar la música: `src/client/audio.ts:12-13` y `137-160`.

## Qué haría en la próxima versión

Un paquete «peso»:

- **Hitstop real y escalonado**, que frene DOM y lienzo, con sacudida de escena en tres niveles.
- **Golpe con cuerpo**: transitorio de ruido y altura variable, y un compresor maestro que agache la música en cada impacto.
- **Muerte de Rey como micro-escena**: silencio, fogonazo, rajadura lenta, lluvia de oro y fanfarria.
- **Botín sobre la mesa de verdad**: hoy en `botin-brota-06` la mesa desaparece y queda un panel sobre el vacío. Lo montaría sobre la mesa todavía visible, con el HUD fijo fuera de `#app` para que no parpadee nunca.
- **Calentado del modal de oferta** durante el conteo del último golpe, con `fps.txt` midiendo también ese cuadro en frío como puerta.

Sin veredicto anterior para comparar.
