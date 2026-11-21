```json
{
  "jurado": "jurado-arte",
  "version": "0.17.0",
  "puntajes": { "claridad": 7.4, "diversion": 7.2, "estetica": 7.7, "veredicto": 7.5 },
  "defectos": [
    {
      "prioridad": "P1",
      "pantalla": "mesa contra El Caudillo: el golpe en que dispara el Tajo de revés (secuencia rey-tajo)",
      "ventana": "1280x800 (Steam Deck); por anclaje, también 1366x768",
      "archivo": "src/client/pantallas/mesa.ts:423 (numero del daño en en.y-30, el mismo centro del naipe), :758-768 (rotuloRey dentro de .e-centro), :716-729 (reyDice cuelga el bocadillo bajo el naipe); src/client/estilos/mesa.css:2539-2547 (.rey-rotulo al 64 % del naipe) y :1350-1354 (.e-dice top:100%); src/client/hud.ts:250-263 (el grito va a propósito sobre Vida, Escudo y Oro)",
      "que": "La foto quieta ya no se pisa, pero el momento vivo sí. En rey-tajo-08 el «312» del daño, el «x2» y el Rey en blanco de impacto se funden en una mancha celeste sobre el naipe. En rey-tajo-10 hay cinco capas en el mismo cuadro: «312» encima del rótulo «TAJO DE REVÉS» (se lee «TAJ 312 ÉS»), el bocadillo del Rey «¡Así se pega, carajo!» tapa «EL CAUDILLO» y el chip CURA de la cuenta, el «−48» cae sobre «AL DESCARTE» y el grito «¡EH, MÁS RESPETO!» tapa las cifras de Escudo y Oro justo cuando la Vida baja de 80 a 32. El «x2» de la bandeja se sale por el borde de abajo (rey-tajo-08).",
      "por_que": "Es el clímax de la mecánica nueva y el único cuadro en el que el jugador tiene que entender por qué perdió 48 de Vida. Cuando cinco textos de tinta y tamaño parecidos se pisan, el ojo no tiene a dónde ir y la regla no se aprende.",
      "propuesta": "Un turno de palabra por cuadro: el número del daño, arriba del naipe y fuera del rótulo; el rótulo del Rey, debajo y después (+250 ms); el bocadillo del Rey, al costado del naipe y no bajo la barra; el grito, solo cuando no hay número de daño recibido en vuelo y nunca sobre la ficha que cambió. Sumar rey-tajo-10 a la puerta de solapes de la QA, como ya hacen con mesa-segunda."
    },
    {
      "prioridad": "P1",
      "pantalla": "mesa (todas las peleas), mano del jugador",
      "ventana": "1280x800 y 1366x768",
      "archivo": "src/client/estilos/base.css:87-98 (el escalón de Deck sube la letra pero deja --k-naipe 1 y --k-enemigo 2); src/client/estilos/mesa.css:423-427 (alto de .mano) y :85-87 (naipe enemigo a 2×); src/client/pixel/naipes.ts:21 (raster de 100 celdas)",
      "que": "En la Steam Deck el naipe del Rey mide 200×280 y los tuyos 100×140: la mano es la mitad del enemigo y el elemento más chico del centro de la pantalla. A 1x los bastos del 7 son manchas de tres píxeles y el halo de elegida casi no se ve (mesa-segunda, golpe-05, rey-tajo-06). A 1920 la mano y el Rey miden igual, así que la jerarquía cambia según la ventana.",
      "por_que": "En un juego de naipes la mano es la protagonista (en Balatro y en Inscryption la carta propia es lo más grande que hay). La Deck es la ventana objetivo, y ahí el ojo va primero al Rey, después a la cuenta y por último a lo que tenés que elegir.",
      "propuesta": "En el escalón 1100–1699: la mano a k=2 (200×280) y el Rey recortado a busto sobre su barra, como ya se hace en el teléfono (390 mesa-segunda), también a k=2. Cuentas de alto: cabecera 50, busto 170 + barra 30, cuenta 120, mano 290, HUD 130: entra en 800. GOLPEAR y DESCARTAR siguen a la derecha."
    },
    {
      "prioridad": "P2",
      "pantalla": "Te llevó la Corte, Crónica y Ajustes",
      "ventana": "1920x1080, 1280x800 y 390x844",
      "archivo": "src/client/fx/escenas.ts:1306-1338 (velaQueSeApaga: luz 0,08, solo humo, sin horizonte); src/client/estilos/pantallas.css:2286-2303 (retrato partido sin marco) y :788-794 (.cr-datos sin alinear la base de las cifras); src/client/juego.ts:40-41 (Crónica y Ajustes usan el degradé de la portada)",
      "que": "«La Corte cayó» ya es un cuadro de verdad. Su gemela, en cambio, es una franja casi negra con una vela de 20 px. El retrato partido no tiene marco y, con su fondo oscuro, parece un error de carga y no una rajadura. En Crónica, «REYES VENCIDOS» y «MEJOR GOLPE» parten en dos renglones, y «17» y «1284» quedan 30 px más abajo que «14» y «3». Ajustes y Crónica siguen siendo dos paneles sobre el degradé de la portada, con 300 px muertos abajo.",
      "por_que": "La derrota es la pantalla que más se ve en un roguelike. Si el triunfo tiene amanecer y la derrota tiene negro, el juego parece hecho a medias justo donde el jugador decide si hace otra partida.",
      "propuesta": "Para la derrota, la misma mesa de tablas de la pelea con la vela recién apagada: el humo, los naipes del jugador tirados boca abajo sobre la madera y el Rey que ganó de pie bajo la última brasa. El retrato partido, con su marco dorado también partido y corrido. En Crónica, rótulos a un renglón o cifras alineadas abajo (align-items: end). Para Ajustes y Crónica, la escena del Altar o la de la mesa, no la de la portada."
    }
  ],
  "aciertos": [
    "La segunda cara tiene dibujo propio: el Caudillo pasa de manto rojo a púrpura, con ceño y mirada encendida (rey-segunda-12, mesa-segunda), y la derrota muestra al Caudal en su segunda cara. El volteo por fin revela algo.",
    "«La Corte cayó» es el mejor cuadro del juego: el sol tramado detrás del retrato, el arrabal en silueta con molinos y rancho, y los Reyes vencidos partidos en zigzag con su nombre tachado.",
    "La cuenta ya no se pisa en la foto quieta en ninguna ventana (mesa-segunda a 1920, 1366, 1280 y 390): el rasgo tiene su lugar, a la derecha de la barra.",
    "El botín son piezas con molde de naipe (moneda, candado, calavera del Bufón, corona) y no una lista."
  ],
  "capturas_vistas": [
    "visual-qa/1920x1080/mesa.png", "visual-qa/1920x1080/mesa-rey.png", "visual-qa/1920x1080/mesa-segunda.png",
    "visual-qa/1920x1080/botin.png", "visual-qa/1920x1080/fin-victoria.png", "visual-qa/1920x1080/fin-derrota.png",
    "visual-qa/1920x1080/ajustes.png", "visual-qa/1920x1080/cronica.png", "visual-qa/1920x1080/mapa.png",
    "visual-qa/1920x1080/portada.png", "visual-qa/1920x1080/pulperia.png",
    "visual-qa/1366x768/mesa-segunda.png", "visual-qa/1280x800/mesa-segunda.png", "visual-qa/1280x800/fin-derrota.png",
    "visual-qa/390x844/mesa.png", "visual-qa/390x844/mesa-segunda.png", "visual-qa/390x844/botin.png",
    "visual-qa/390x844/fin-victoria.png", "visual-qa/390x844/fin-derrota.png",
    "jurado/secuencias/1280-rey-segunda-06.png", "jurado/secuencias/1280-rey-segunda-08.png",
    "jurado/secuencias/1280-rey-segunda-10.png", "jurado/secuencias/1280-rey-segunda-12.png",
    "jurado/secuencias/1280-rey-tajo-06.png", "jurado/secuencias/1280-rey-tajo-08.png", "jurado/secuencias/1280-rey-tajo-10.png",
    "jurado/secuencias/1280-rey-cae-05.png", "jurado/secuencias/1280-rey-cae-07.png", "jurado/secuencias/1280-rey-cae-09.png",
    "jurado/secuencias/1280-rey-cae-10.png", "jurado/secuencias/1280-rey-cae-11.png", "jurado/secuencias/1280-rey-cae-12.png",
    "jurado/secuencias/1280-botin-brota-08.png", "jurado/secuencias/1280-golpe-05.png", "jurado/secuencias/1280-mapa-paso-03.png",
    "mirar/1280-fogon-suspenso.png"
  ]
}
```

## Veredicto

La 0.17.0 paga casi todo lo que reclamé en la 0.16. La segunda cara se dibuja de nuevo, la cuenta ya no se pisa en ninguna foto quieta y el final victorioso pasó de tabla sobre degradé a cuadro de atardecer con los Reyes partidos. Por eso estética sube de 7,4 a 7,7. No llega a 8 por tres cosas: el momento vivo del Tajo de revés sigue siendo un montón de textos encimados; en la Steam Deck la mano es la mitad del Rey; y la derrota, Crónica y Ajustes no recibieron el trato que sí recibió la victoria. Claridad sube a 7,4 (la foto quieta se lee, el movimiento todavía no). Diversión sube a 7,2: la segunda cara con cara propia y la caída del Rey («Buen tajo… paisano.», rey-cae-05) tienen peso de acto.

**Respecto de la 0.16.0:** resueltos el defecto 1 (solape barra/rasgo/cuenta en mesa-segunda, ahora con puerta de QA) y el 2 (segunda cara con dibujo propio y aura a celda entera). El 3 está resuelto a medias: el botín y la victoria sí; la derrota, Ajustes y Crónica no. De los menores: sigue el bocadillo pegado a x≈5 (rey-segunda-08 tapa «EL ARRABAL · REY»), siguen los números que caen sobre la bandeja y el HUD, y el grito «Barrido y a la bolsa» ya no queda fantasma, pero tapa Escudo y Oro con el botín abierto (rey-cae-10/11).

## Defectos menores

- **Después de que cae el Rey, la mesa queda vacía unos 600 ms** (rey-cae-07 a -09: madera, Bufón y chispas). Que el botín brote mientras el naipe todavía se raja. `src/client/pantallas/mesa.ts:858-914`.
- **En el botín a 1280, el Bufón se para encima de la vela** y la llama le sale del costado (rey-cae-10/11, botin-brota). El comentario dice «lejos de la vela», pero la vela queda debajo. `src/client/estilos/pantallas.css:2152-2160`.
- **A 390, «INMUNE» queda montado sobre el borde del naipe del Rey** (mesa-segunda), y los nombres tachados del final («EL CAUDILLO») no se leen a 18 px con la raya a la altura de las minúsculas. `src/client/pantallas/mesa.ts:124`; `src/client/estilos/pantallas.css:2319-2326`.
- **Botín a 390: los 400 px de arriba son madera vacía** y las piezas se apilan en lista abajo. `src/client/estilos/pantallas.css` (botín en `max-width: 700px`).
- **La primera fila del mapa sigue montada sobre el horizonte** (los nodos tapan ranchos y molinos a 1920). `src/client/fx/escenas.ts` (mapa) y la rejilla de `src/client/pantallas/camino.ts`.

## Qué haría en la próxima versión

Un paquete «**la mano manda**». Primero, el escalón de la Deck a k=2 para la mano, con el Rey a busto sobre su barra como en el teléfono, de modo que la jerarquía sea la misma en todas las ventanas: tu mano es lo más grande que hay. Segundo, un director de cuadros para los momentos vivos: un solo texto grande por vez (daño, después rótulo, después voz) y una puerta de QA de solapes también sobre cuadros de secuencia (rey-tajo-10, rey-segunda-08, golpe-05). Tercero, terminar la casa: la derrota como la mesa con la vela recién apagada y los naipes boca abajo, y Crónica y Ajustes dentro de la escena del Altar. Con eso estética pasa el 8.
