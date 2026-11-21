```json
{
  "jurado": "jurado-juice",
  "version": "0.15.0",
  "puntajes": { "claridad": 7, "diversion": 7.2, "estetica": 8, "veredicto": 7.3 },
  "defectos": [
    {
      "prioridad": "P1",
      "pantalla": "mesa → botín (último enemigo y caída del Rey)",
      "ventana": "1280x800 y 390x844",
      "archivo": "src/client/pantallas/mesa.ts:425-456; src/client/pantallas/camino.ts:407; src/client/ui.ts:43; src/client/bufon-vivo.ts:33",
      "que": "Igual que en la 0.14.0. Después de la rajadura (rey-cae-06, muy buena) la mesa queda muerta: pedestal vacío, barra «THE WARLORD 0/390», el rasgo, TE PEGA 21 +3 FURIA, la mano y GOLPEAR, todo quieto (rey-cae-07 y 08; botin-brota-07 y 08). Después llega un corte seco: el Bufón se deshace en humo y el panel BOTÍN aparece corrido a la derecha, sobre la madera vacía y medio transparente, con el oro ya sumado (31→52). Encima se monta el modal de Amuleto o Bendición, con el panel del botín fantasma detrás (rey-cae-10, botin-brota-09).",
      "por_que": "Es el pago del tramo y el momento de cobrar. Hoy el premio llega después de un bache de más de un segundo y por un corte de pantalla. Matar a un Rey tiene que encadenar con la recompensa, y hoy se desinfla.",
      "propuesta": "En el `cae` del último enemigo, barrer barra, rasgo y Ataque junto con la rajadura, mandar la mano al Mazo y que las monedas vuelen al HUD durante esa pausa, no después. Que el botín brote sobre el mismo DOM de la mesa, centrado en el eje, sin `pantalla-entra` y sin `esfumar()` del Bufón. La elección de Amuleto o Bendición, en el mismo panel, sin apilar velos."
    },
    {
      "prioridad": "P1",
      "pantalla": "mesa · conteo del golpe contra el desglose nuevo",
      "ventana": "1280x800 y 390x844",
      "archivo": "src/client/pantallas/mesa.ts:173-180 y 713-723; src/client/estilos/mesa.css:1582-1596",
      "que": "La línea fija del desglose ya muestra todos los términos antes de que arranque el conteo (golpe-02), y el cartel `c-vuela` se pega centrado justo encima de esa línea. Tapa otro término: «Calls made +10» cae sobre «Seasoned Mate +24» (golpe-03) y «Short hand +4» también va sobre Seasoned Mate (04 y 05). Así dice dos veces lo mismo y además en el lugar equivocado. La cifra de DAMAGE escalada pisa el chip FLOR (03 y 04). A 390 el desglose no se ve y el cartel «Flor +2» se monta sobre el «+15» de la cura (390-golpe-04).",
      "por_que": "El conteo era la pieza estrella. Dejó de ensuciar al enemigo, pero ahora compite con su propio texto: el ojo no sabe si leer la línea o el cartel, y el cartel le miente sobre qué término suma.",
      "propuesta": "Usar la línea del desglose como escenario: un `<span data-k>` por paso, todos apagados al 35 %, y que cada uno se encienda y brinque en su sitio cuando dispara. Borrar `c-vuela`. A 390, la misma línea en dos renglones. Anclar el escalado de `[data-cd]` al centro de su caja para que no invada el chip de la jugada."
    },
    {
      "prioridad": "P1",
      "pantalla": "mesa · sonido de golpe, remate, «¡AL PELO!» y segunda cara (leído en código, no oído)",
      "ventana": "todas",
      "archivo": "src/client/audio.ts:100-160; src/client/pantallas/mesa.ts:346-374 y 425-446",
      "que": "`audio.ts` no cambia desde la 0.12.0: osciladores directo a `ctx.destination`, sin ruido, sin bus ni compresor y sin variación de altura. Los dos momentos nuevos reciclan sonidos: «¡AL PELO!» suena `frena` (el mismo que un Escudo que para el golpe) y la SEGUNDA CARA usa `sonar('rey')` más `fogonazo('blanco')`, que son exactamente la irrupción y la caída del Rey. `victoria` y `cae` siguen sonando a la vez sobre la rajadura.",
      "por_que": "Tres versiones con el oído congelado mientras la imagen crece. Si el giro del duelo suena igual que la entrada y la salida del Rey, no se registra como otro acto. Y si «al pelo» suena a bloqueo, enseña lo contrario de lo que significa.",
      "propuesta": "Bus maestro con compresor. Golpe = 30 ms de ruido filtrado + cuerpo grave con ±2 semitonos. Un sonido propio para el remate y otro para la segunda cara (acorde que se quiebra hacia abajo, con un tinte por palo). «Al pelo» = un roce agudo con risa del Bufón. La música baja 6 dB durante `frenar`. En la caída del Rey, `cae` primero y `victoria` al terminar la rajadura."
    }
  ],
  "aciertos": [
    "La caída del Rey por fin tiene su cuadro: el naipe se parte en dos mitades que giran y se separan, con chispas y lluvia de monedas (rey-cae-06). Es el mejor fotograma del juego.",
    "El conteo ya no escribe sobre el enemigo: un cartel a la vez, ritmo que arranca en 115 ms y acelera, y el total vibra 280 ms antes de que vuelen las cartas (golpe-05 y 06).",
    "El HUD se mantiene durante el golpe y el contraataque: sacudida localizada, retrato con mueca y «HEY, SOME RESPECT!» en el momento justo (golpe-09).",
    "Cero tirones: el peor cuadro está entre 8 y 23 ms en las cuatro ventanas, a unos 133 fps.",
    "La lluvia sobre el Rey de Espadas y las ascuas tras su muerte mantienen vivo el fondo incluso con la mesa quieta."
  ],
  "capturas_vistas": [
    "jurado/secuencias/1280-golpe-02, 03, 04, 05, 06, 07, 08, 09",
    "jurado/secuencias/1280-rey-irrumpe-01, 03, 05, 07",
    "jurado/secuencias/1280-rey-cae-01, 02, 03, 04, 05, 06, 07, 08, 09, 10",
    "jurado/secuencias/1280-botin-brota-07, 08, 09",
    "jurado/secuencias/1280-mapa-paso-03",
    "jurado/secuencias/390-golpe-04, 07; 390-rey-cae-06, 09; 390-botin-brota-09",
    "mirar/1280-conteo, 1280-mesa-grito"
  ]
}
```

## Veredicto

En mi especialidad, la 0.15.0 es una versión de reglas y de mando: el jugo casi no se movió. La nota queda en 7,3. Ahora se ve la rajadura del Rey y el conteo dejó de escribir sobre el enemigo, pero el cobro sigue llegando tras un bache, el sonido está congelado desde la 0.12.0 y los dos momentos nuevos («¡AL PELO!» y la SEGUNDA CARA) se montaron con sonidos y fogonazos ya usados.

**Contra el veredicto de la 0.14.0.** Resueltos: el conteo apilado sobre el enemigo y su ritmo ilegible (ahora un cartel a la vez, ritmo que acelera y total sostenido); `secuencias.ts` ya captura la caída del Rey entera. A medias: el conteo, que tiene un problema nuevo (el cartel tapa el desglose). Siguen: el cobro con bache y corte seco, el audio sin bus ni cuerpo, el grito sobre la mano (`mirar/1280-mesa-grito`: «¡ESCOBA!» sobre el 3 y el 5) y el Rey entero y tecleando con el bocadillo sobre su nombre (rey-cae-03 a 05).

**Lo que no pude juzgar.** La irrupción del Rey, por tercera versión: los siete cuadros muestran al Rey ya sentado en el turno 3 y al Bufón rearmándose. La SEGUNDA CARA no tiene ninguna captura. Su cartel, el fogonazo y la frase los leí en `mesa.ts:353-374` sin verlos. El sonido lo leí, no lo oí.

## Defectos menores

- A 390 el grito del retrato se sale por el borde izquierdo y tapa GOLPEAR («WEPT AND BAGGED.», 390-rey-cae-06 y 09). El tope de 80 px no tiene en cuenta el ancho del bocadillo: `src/client/hud.ts:249`.
- El «-23» del contraataque, a escala 2, tapa entero el rótulo y la cifra de VIDA (golpe-09). Moverlo al costado o bajar la escala: `src/client/pantallas/mesa.ts:500`.
- En el botín, el bocadillo del Bufón teclea encima del título del modal («The Reveler: Anot») y deja detrás una caja gris fantasma (botin-brota-09): `src/client/bufon-vivo.ts` y `src/client/pantallas/camino.ts:407`.
- En el conteo, el «+24» de la ficha del HUD aparece después de que las cartas ya volaron (golpe-07): queda desfasado del cartel que lo nombra. `src/client/pantallas/mesa.ts:724-725`.
- La irrupción no se captura y la segunda cara no tiene ráfaga: `scripts/secuencias.ts:42` (debe abrir en el turno 1 de `mesa-rey`) y una ráfaga nueva `rey-segunda`.

## Qué haría en la próxima versión

Un paquete «el oído y el cobro», sin tocar reglas. Primero, **audio de verdad**: bus maestro con compresor, golpe con transitorio de ruido y variación, un sonido propio para el remate, la segunda cara y «al pelo», y la música que se agacha en cada hitstop. Es la mitad del game feel y lleva tres versiones sin cambios. Segundo, **el cobro encadenado**: el último enemigo se raja, la mesa se despeja sola mientras el oro vuela y el botín brota en la misma mesa, con la elección de Amuleto en el mismo panel. Tercero, **el conteo en su propia línea**: el desglose arranca apagado y cada término se enciende en su sitio, sin carteles flotantes. Cuarto, **la segunda cara como acto**: el naipe del Rey se da vuelta de verdad (un giro en Y a mitad de duelo, con otra paleta) en lugar de un fogonazo prestado. Y que `secuencias.ts` capture la irrupción y la segunda cara: el clímax no puede seguir juzgándose por el código.
