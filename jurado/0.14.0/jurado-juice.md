```json
{
  "jurado": "jurado-juice",
  "version": "0.14.0",
  "puntajes": { "claridad": 7, "diversion": 7.2, "estetica": 8, "veredicto": 7.3 },
  "defectos": [
    {
      "prioridad": "P1",
      "pantalla": "mesa · conteo pieza por pieza",
      "ventana": "1280x800 y 390x844",
      "archivo": "src/client/pantallas/mesa.ts:614 y 659-675; src/client/estilos/mesa.css:1316-1356; src/client/hud.ts:217-225",
      "que": "Los nombres de lo que suma se apilan en dos columnas encima de la barra de Vida y del nombre del enemigo (golpe-03 a 06), la quinta etiqueta vuelve al hueco de la primera y la pisa («Hard Coin +1» sobre «Pair +2»), y cada una dura en pantalla 42-95 ms de turno: ocho nombres en 0,8 s no se leen. A 390 los «+2 +1» de las fichas del HUD se montan entre sí y se salen por el borde izquierdo (390-golpe-04, 06, 07). El total aparece y a los ~135 ms las cartas ya le vuelan por encima (golpe-05).",
      "por_que": "Es la pieza estrella de la versión y la que debería enseñar qué da qué (el Balatro de cada comodín que salta en su sitio). Hoy es una pila de rótulos chicos sobre el dato más importante de la mesa: ruido, no lectura, y el total no tiene su segundo de gloria.",
      "propuesta": "Que el nombre salga pegado a la ficha que dispara (en el HUD) y no sobre el enemigo; para jugada y canto, un solo renglón fijo sobre la cuenta que se reemplaza. Pila sin módulo (o tope de 3 y el resto empuja). Ritmo que arranca en ~110 ms y acelera hasta 45. Acotar la x de `numero` al ancho de la ventana. Sostener el total 250-300 ms vibrando antes de `mano.volar`."
    },
    {
      "prioridad": "P1",
      "pantalla": "mesa → botín (último enemigo)",
      "ventana": "1280x800 y 390x844",
      "archivo": "src/client/pantallas/mesa.ts:407 y 525-529; src/client/pantallas/camino.ts:413-439",
      "que": "Tras la rajadura quedan ~1,2 s de escenario muerto: pedestal vacío con la barra «JACK OF SWORDS 0/340», el escudo de Inmune, el Ataque 20, la mano y GOLPEAR apagado, sin nada moviéndose (botin-brota-07 y 08). Después, corte seco a otra pantalla: desaparecen mano y enemigo, el Bufón se deshace en humo y el panel BOTÍN queda corrido a la derecha sobre la madera vacía, con el oro ya sumado (09).",
      "por_que": "El tirón de 120 ms se fue, pero el premio sigue llegando después de un bache y con un corte. Es el momento de cobrar: tiene que encadenar con el golpe, no esperar.",
      "propuesta": "En el `cae` del último: barrer barra, Inmune y Ataque con la rajadura, que la mano se vaya al Mazo y las monedas vuelen al HUD durante esa pausa (no después). Montar el botín sobre el mismo DOM de la mesa, centrado en el eje, sin `pantalla-entra` y sin esfumar al Bufón."
    },
    {
      "prioridad": "P1",
      "pantalla": "mesa · sonido del golpe y de la caída del Rey (leído en código, no oído)",
      "ventana": "todas",
      "archivo": "src/client/audio.ts:12-13 y 137-160; src/client/pantallas/mesa.ts:286 y 392-399; src/client/musica.ts:290",
      "que": "El peso nuevo es solo visual. Hay tres escalones de hitstop y dos sonidos (`golpe`, `fuerte`): el remate no tiene el suyo. Siguen siendo osciladores sin transitorio de ruido ni variación de altura, directo a `destination`, sin bus ni compresor, y la música no se agacha en el impacto. En la caída del Rey `victoria` y `cae` arrancan en el mismo instante, sumados.",
      "por_que": "La mitad del golpazo es el oído. Con hitstop de 170 ms y fogonazo dorado, un «bip» igual al de siempre desinfla la imagen; y dos jingles encimados en el clímax del tramo suenan a error.",
      "propuesta": "Bus maestro con compresor; golpe = ruido filtrado de 30 ms + cuerpo grave con ±2 semitonos al azar; tercer sonido para el remate (sub que cae + cola); agachar la música 6 dB durante `frenar`; en el Rey, `cae` primero y `victoria` cuando termina la rajadura."
    }
  ],
  "aciertos": [
    "Hitstop de verdad y escalonado (60/110/170 ms, sacudida de escena, candil que salta, fogonazo dorado en el exacto que mata): golpe-06 es por fin un golpazo, y el siguiente ya no entra encimado.",
    "Cero tirones medidos: peor cuadro 8-23 ms y cambio de pantalla 8-23 ms en las tres ventanas, con la oferta calentada al montar la mesa.",
    "Escenarios por parada (pampa de noche en el Mapa, estantes de la Pulpería, fogata del Fogón) y clima por Rey (lluvia y rayo, ascuas, bruma carmesí, hojas): el fondo dejó de ser un plano.",
    "El HUD ya no parpadea al cambiar de pantalla (mapa-paso-02).",
    "Las fichas del HUD brincan con su +N cuando disparan: la idea correcta, falta ordenarla."
  ],
  "capturas_vistas": [
    "jurado/secuencias/1280-golpe-00..09 (las diez)",
    "jurado/secuencias/1280-rey-irrumpe-01, 02, 03, 05, 07",
    "jurado/secuencias/1280-botin-brota-01, 03, 05, 07, 08, 09",
    "jurado/secuencias/1280-mapa-paso-01, 02, 04",
    "jurado/secuencias/1280-portada-02",
    "jurado/secuencias/390-golpe-04, 06, 07; 390-botin-brota-06, 09; 390-rey-irrumpe-02",
    "mirar/1280-rey-cae, 390-rey-cae, 1280-mesa-grito, 1280-comodin-espectral-racha, 390-conteo, 1280-fogon-suspenso",
    "escenas/mesa-rey-S-1280x800-rayo, mesa-rey-D-1280x800-golpe, mesa-rey-H-1280x800, mesa-rey-C-1280x800-golpe, fogon-1280x800, mapa-390x844"
  ]
}
```

## Veredicto

La 0.14.0 atacó de frente lo que pedí y se nota: el golpe ahora **pesa**, el fondo **vive** y el juego **no se engancha**. Sube de 6,8 a 7,3. No llega al 8 porque el jugo nuevo todavía está desordenado (el conteo ensucia más de lo que enseña), el premio llega tras un bache y el sonido quedó en la versión anterior.

**Contra el veredicto de la 0.13.0.** Resueltos: el cuadro de ~120 ms del botín (medido, 8-23 ms); el hitstop cosmético y sin escala (ahora frena lienzo y animaciones de la mesa, en tres escalones); el enemigo que entraba encimado (espera 640 ms); el HUD que parpadeaba; el rótulo de reposo en plena muerte. Resuelto a medias: la caída del Rey. Siguen: botín sobre el vacío, grito del retrato sobre el pie de la mano (`mesa-grito`), caché de `disco()` sin tope, audio sin cuerpo ni bus. El «NOT A PLAY» fantasma a 390 no apareció en los cuadros de hoy.

**Salvedades de la medida.** `scripts/fps.ts:50` espera a que termine la forja antes de medir: es «frío de pintura», no «frío de forja». Y 133 fps de media dice que la máquina va sobrada; el tope de 50 ms por cuadro es generoso para un hitstop de 60.

**Lo que no pude juzgar.** La irrupción del Rey, otra vez: `scripts/secuencias.ts:40` abre `qa=mesa-rey` en el turno 4, donde `entrada()` no corre (`mesa.ts:805-813`), así que los siete cuadros muestran al Bufón llegando y un rayo. De la caída del Rey vi un solo cuadro (el bocadillo); silencio, fogonazo blanco, lluvia de monedas y fanfarria los leí en `mesa.ts:379-398`, no los vi. El sonido, leído, no oído.

## Defectos menores

- Caída del Rey: después del fogonazo el Rey queda entero 1,5-2 s mientras teclea, con el bocadillo tapándole el nombre y el rasgo (`rey-cae`), y recién ahí se raja igual de rápido que una Sota: `src/client/pantallas/mesa.ts:386-407`, `src/client/estilos/mesa.css:1392`.
- La sacudida de `.escena` a 390 saca el escudo y «IMMUNE» por el borde izquierdo (390-golpe-07): `src/client/fx/motor.ts:217-232`.
- El fogonazo dorado lava toda la pantalla al 85 % en cada exacto que mata, que es lo que el juego pide hacer siempre: va a cansar. Acotarlo a la escena o reservar el pleno para racha ≥ 2: `src/client/estilos/mesa.css:1380`.
- Todo golpe que mata es «remate» de 170 ms, aunque sea un toque de 5 a un enemigo con 1 de Vida: `src/client/pantallas/mesa.ts:285`.
- El número de daño y la baja de la barra llegan 150-260 ms después del tajo (tras el hitstop): deberían clavarse en el cuadro congelado: `src/client/pantallas/mesa.ts:291-318`.

## Qué haría en la próxima versión

Un paquete «orden y oído». Primero, **rehacer la coreografía del conteo**: cada pieza dispara en su sitio (carta en la mano, ficha en el HUD, jugada en la cuenta), una por vez, con ritmo que acelera y altura que sube, y el total sostenido con su vibración antes de que salgan las cartas; nada escrito sobre el enemigo. Segundo, **un bus de audio** con compresor, golpe con ruido y variación, sonido propio del remate y música que se agacha en el hitstop. Tercero, **el cobro encadenado**: el último enemigo cae, la mesa se despeja sola mientras el oro vuela y el botín brota sobre la misma mesa, sin cambio de pantalla. Cuarto, **el Rey muere distinto**: rajadura lenta en tres tiempos durante su última línea, no después. Y arreglar `secuencias.ts` para que capture la irrupción y la caída completas: dos versiones seguidas juzgando el clímax por el código es demasiado.
