```json
{
  "jurado": "jurado-juice",
  "version": "0.27.0",
  "puntajes": { "claridad": 8.6, "diversion": 8.7, "estetica": 8.5, "veredicto": 8.6 },
  "defectos": [
    {
      "prioridad": "P2",
      "pantalla": "mesa · contragolpe y maldición del Garrote en el teléfono (placas «−N» del HUD)",
      "ventana": "390x844",
      "archivo": "src/client/estilos/base.css:1597-1620 (`.hud-delta` a 700 px y `hud-delta-tel`, nace a escala 1,3) · src/client/hud.ts:314-327 (`deltaHud`: una placa por caja, centrada, sin medir a la vecina)",
      "que": "En el teléfono la placa es más ancha que su caja. En 390-contragolpe-09 el «−4 ESCUDO» nace encima del «−19»: de tu daño se lee «−1» y la cifra de la VIDA queda sucia debajo. En 390-maldicion-12 el «−5 ESCUDO» tapa el «/92» de la Vida. Recién en 390-contragolpe-11, ya a escala 1, las dos placas quedan una al lado de la otra y se leen.",
      "por_que": "El número más importante del intercambio, lo que te sacaron, nace tapado en su cuadro de impacto. Es el mismo golpe que esta versión ordenó bien a 1280.",
      "propuesta": "En el teléfono, anclar la placa de VIDA a la izquierda de su caja y la de ESCUDO a la derecha de la suya, sin escala de nacimiento en la de ESCUDO cuando salen juntas (o «−4» con el ícono, sin la palabra). Que `deltaHud` mida a la placa vecina y se corra."
    },
    {
      "prioridad": "P2",
      "pantalla": "mesa · el desglose del conteo en el cuadro del impacto",
      "ventana": "1280x800",
      "archivo": "src/client/estilos/mesa.css:2356-2365 (`.cuenta .c-desglose`, `.d-fila`) · src/client/pantallas/mesa.ts:626 (`c-bajo`) y el recentrado de la mano al volar las cartas jugadas",
      "que": "Cuando el desglose llega a cuatro o cinco renglones, la mano que se recentra lo pisa. En 1280-contragolpe-06 se lee «SOL DE LA TIMBA +1» y «Cascabel sin canto −1»; en el 07, con el 170 ya sobre la Sota, el 9 de Copas se corrió 70 px y los corta en «SOL DE LA TIM» y «Cascabel sin c», y así siguen hasta el 09. En 1280-rey-tajo-11 el naipe tapa el final de «Punta y hacha ¡CRÍTICO! ×2».",
      "por_que": "El término que se corta es el último en encenderse, el remate de la escalada: el crítico o el Amuleto que resta. La cuenta pierde su último renglón justo cuando el número cae.",
      "propuesta": "Que la mano no se recentre mientras la cuenta esté a la vista (esperar al reparto del turno nuevo), o darle al desglose un tope de tres renglones a 1280 con los nombres en corto a partir del cuarto."
    },
    {
      "prioridad": "P2",
      "pantalla": "El Fogón · resultado de la Forja Brava",
      "ventana": "1280x800 y 390x844",
      "archivo": "src/client/pantallas/camino.ts:1125-1129 (el bocadillo y el gesto se fijan al empezar) y 1147-1169 (ni en la quema ni en el «×2» se toca al Bufón) · camino.ts:911-913 (`alto`: el piso de 0,26 al medio y el corte de `borde` dejan una losa de lados rectos)",
      "que": "La llama tramada resuelve el suspenso (ver aciertos), pero el remate no. En 1280-forja-brava-x2, 390-forja-brava-x2 y 1280-forja-brava-quema el Bufón sigue en la misma pose y con el mismo bocadillo, «Ya está en el fuego. No respires…», debajo del «×2» y del naipe partido. Reacciona recién con texto, después del repintado. Y la base de la llama es un rectángulo de lados rectos: en la quema queda una losa amarilla y naranja detrás del naipe roto.",
      "por_que": "Es la única apuesta de 50 % del juego, y el anfitrión no festeja ni se lamenta en los 900 ms en que el resultado está en pantalla. En el teléfono, además, es una figurita de 60 px.",
      "propuesta": "En la línea 1147 y en la 1160, cambiar el gesto del Bufón (festeja o mueca) y vaciar o cambiar el bocadillo en el mismo cuadro del resultado. Afinar la base de la llama hacia los costados y, en la quema, hacerla subir un escalón más antes de apagarse."
    }
  ],
  "aciertos": [
    "Causa y efecto en el contragolpe a 1280: en 1280-contragolpe-08 nacen el «−19» y el «−4 ESCUDO» en sus cajas con la Vida todavía en 45 y el Escudo en 4; en el 09 bajan a 26 y 0, con corazones y la mueca del retrato. Nada flota ya sobre la mano ni sobre GOLPEAR.",
    "La maldición del Garrote quedó en orden: 378 sobre la Sota (1280-maldicion-08/09), «−5 ESCUDO» con su ícono y el Escudo de 10 a 5 (10 a 12), y recién después el «−18» con la Vida de 45 a 27 (13). El turno 2 se reparte después (15).",
    "El golpe común respira: el 170 nace con su tajo en 1280-contragolpe-07 y el «−19» llega un cuadro después, no en el mismo. En el código, 380 ms para el chico y 600 para el grande o el Rey (mesa.ts:1069-1073).",
    "La Forja Brava tiene fuego de verdad: lenguas tramadas con Bayer que suben por los dos bordes del naipe y le tapan el pie, en las dos ventanas (1280 y 390-fogon-suspenso-brava-llama, 1280-forja-brava-quema-llama).",
    "Rendimiento impecable: 133 a 137 fps en las cuatro ventanas, 0,0 % de cuadros largos y un peor cuadro de 15 ms (fps.txt). Mejor que el peor de 31 ms de la 0.26."
  ],
  "capturas_vistas": [
    "jurado/secuencias/1280-maldicion-07, 08, 09, 10, 11, 12, 13, 14, 15, 16; 390-maldicion-12",
    "jurado/secuencias/1280-contragolpe-06, 07, 08, 09, 10, 11; 390-contragolpe-09, 11",
    "jurado/secuencias/1280-rey-segunda-09, 10, 11, 12, 13, 14, 15, 18, 21, 23, 24, 25; 390-rey-segunda-11, 13, 16, 24",
    "jurado/secuencias/1280-rey-tajo-09, 11; 390-rey-tajo-11; 1280-rey-cae-08; 1280-golpe-05; 1280-botin-brota-06; 1280-mapa-paso-03",
    "mirar/1280-fogon-suspenso-brava, 1280-fogon-suspenso-brava-llama, 1280-forja-brava-x2, 1280-forja-brava-quema-llama, 1280-forja-brava-quema; 390-fogon-suspenso-brava-llama, 390-forja-brava-x2",
    "visual-qa/1280x800/mesa-chinchon",
    "jurado/fps.txt"
  ]
}
```

## Veredicto

La 0.27 cierra mis dos P1 y no abre ninguno: no hay P0 ni P1 míos. A 1280 el intercambio de todos los días ya tiene anticipación, impacto y remate en ese orden. Lo que la separa del 9,1 son tres P2 de remate: las placas que se pisan en el teléfono, el desglose que la mano corta en el cuadro del impacto y un Bufón que no reacciona al resultado de la Forja. Diversión 8,7 (pesa doble), veredicto 8,6.

Sobre el aviso del autor: la placa del «−19» no pierde golpe a 1280. Nace a escala 1,7, con sacudida, hitstop de 50 ms y corazones (1280-contragolpe-08). En el teléfono sí pierde, por el primer defecto.

**Contra la 0.26.0.** Resuelto: el P1 del contragolpe del Garrote (la barra ya no baja antes que su número). Resuelto: el P1 del golpe común sin respiro; queda un resto menor, abajo. Resuelto en parte: el P2 de la Forja (la llama sí, el Bufón no). Siguen los menores del 99 de Perfora a escala 1 sobre la corona (1280-rey-segunda-10/11) y de la chapa «×2» sobre la cifra del MULTI (1280-rey-tajo-09).

**Lo que no pude ver.**
- El sello SE PLANTA no sale en `rey-segunda`: el 99 deja al Cacique en 195/390, la mitad justa, y `selloPlanta` solo corre si se pierde algo (mesa.ts:1063). Los 900 ms los leí en código (mesa.ts:1081, 1961-1964).
- ¡CHINCHÓN! corta la mano: leído en código (`cortarMano`, mesa.ts:958-993). Los escuditos salen cada 70 ms y la nota sube 6 % por carta; promete bien. La foto quieta muestra el renglón «CORTÁS 4 cartas × 6 = +24 ESCUDO».
- `remateChico`: leído en código (audio.ts:60 y 126). Dos triángulos que caen de 294 a 196 Hz y de 147 a 98 Hz, con un chasquido de 25 ms, a 160 ms del número. Es corto y seco, como corresponde.

## Defectos menores

- El 170 sigue a la vista cuando nace el «−19» (1280-contragolpe-08): `limpiarNumeros()` sin `forzar`, `mesa.ts:1244`.
- El cartel SEGUNDA CARA tapa el comienzo de su propia regla («RTÍN», «udo que vuelve ×2») y el nombre en la barra del Rey durante tres cuadros (1280-rey-segunda-23 a 25): `src/client/estilos/mesa.css:2712`.
- El bocadillo de tres renglones del Bufón tapa el título «EL REÑIDERO · GUARDIA» (1280-contragolpe-08 a 11, 1280-maldicion-13 a 16): `decir`, `mesa.ts:131`.
- La placa «−19» sigue en pantalla con el turno 2 ya repartido (1280-contragolpe-10, 1280-maldicion-15), contra lo que dice su propio comentario: `hud.ts:326` (1050 ms) frente a `mesa.ts:1291` (470 ms).
- En la foto quieta del Chinchón, el renglón «CORTÁS…» pisa el borde de arriba del renglón DAÑO del desglose (visual-qa/1280x800/mesa-chinchon): `.c-corta`, `mesa.ts:603`.

## Qué haría en la próxima versión

Un paquete de **remates**. Primero, placas del HUD que se miden entre sí en el teléfono, para que tu «−N» de Vida nunca nazca tapado. Segundo, la mano quieta mientras la cuenta está en pantalla, así el último término del desglose (el crítico) se lee entero en el impacto. Tercero, un Bufón que juega la Forja: se tapa los ojos en el suspenso y festeja o se agarra la cabeza en el mismo cuadro del «×2» o de la quema, con la llama que sube un escalón más cuando el naipe arde. Cuarto, el 99 de Perfora a escala 2 con un tajo que viaje de la Sota al Rey. Quinto, que la QA filme lo que hoy solo se lee en código: un `rey-planta` donde de verdad se pierda daño y un `chinchon-corta` con los escuditos en vuelo. Con eso defiendo el 9.
