```json
{
  "jurado": "jurado-arte",
  "version": "0.29.0",
  "puntajes": { "claridad": 8.9, "diversion": 8.6, "estetica": 8.9, "veredicto": 8.9 },
  "defectos": [
    {
      "prioridad": "P2",
      "pantalla": "La Colección a 1080p, en sus tres pestañas vistas (coleccion, coleccion-reyes, coleccion-amuletos)",
      "ventana": "1920x1080",
      "archivo": "src/client/estilos/pantallas.css:727 (.col-cuerpo: flex 1 pero la pared termina con su contenido) y :5073-5084 (la rejilla a 1080p solo estira cuando hay .col-rejilla; Mazos y Reyes no entran en la regla)",
      "que": "La pared de la Colección termina en y≈700 en Mazos y Reyes y en y≈845 en Amuletos; debajo queda un zócalo violeta liso de 230 a 380 px, entre el 22 % y el 35 % de la pantalla, sin un solo objeto. En Reyes la cuarta columna («???») no tiene texto debajo y deja otro hueco. En Amuletos la última fila tiene tres celdas y media pared vacía a la derecha. El farol de la izquierda queda cortado por el marco.",
      "por_que": "Es la pantalla más vacía del juego en la resolución de escritorio. Al lado del Botín, la Forja y el Mapa, que en esta versión ganaron escena, la vitrina del coleccionista parece una maqueta con el piso sin pintar.",
      "propuesta": "Que la pared llegue al pie en las cinco pestañas: Mazos y Reyes centrados en alto con piezas más grandes (los dorsos a 1,25×, los retratos de Rey a 1,5× con su Segunda Cara al lado). El zócalo, si queda, con objetos dibujados (banco, baraja apilada, damajuana) y trama, no un degradé."
    },
    {
      "prioridad": "P2",
      "pantalla": "La mesa del teléfono con mano sellada en dos filas, y el enemigo en los teléfonos bajos (mesa-chinchon)",
      "ventana": "390x844, 390x664 y 360x740",
      "archivo": "src/client/mano.ts:380-392 (reparto en dos filas: Math.ceil(N/2) atrás, la de adelante tapa); src/client/estilos/mesa.css:2181 y :2241 (.mano.dos-filas); :4396 y :4539-4580 (@container mesa max-height 700px: el naipe del enemigo asoma lo que quede)",
      "que": "Con cuatro naipes sellados el 2 de Espadas va solo en la fila de atrás, tapado en un 70 % por el 5; se le ve el índice y media espada. Es la tercera versión seguida. A 390x844 el busto quedó bien encuadrado (cabeza, pecho y cintura), pero a 390x664 y 360x740 el enemigo sigue siendo un sombrero, media cara y un «10» que pesa más que él, y el rótulo TE PEGA desaparece: queda un «3» suelto pegado a un escudo.",
      "por_que": "El momento ¡CHINCHÓN! es el más vistoso del Mazo y en el teléfono se muestra con un naipe escondido. En los teléfonos bajos el antagonista no tiene cara justo cuando se decide el golpe. Se entiende todo; afea.",
      "propuesta": "Mano de cuatro en una sola fila con paso parejo (a 390 entran a 84 px de paso con solape del 15 %). En alto menor a 700, el índice del enemigo a la escala del naipe de la mano y el recorte anclado a la cara; el rótulo TE PEGA, aunque sea en una sola palabra, no se quita."
    },
    {
      "prioridad": "P2",
      "pantalla": "Las elecciones sobre el Botín: ELEGÍ UN AMULETO y el Tesoro con candado (elegi-amuleto, botin-tesoro)",
      "ventana": "1920x1080",
      "archivo": "src/client/estilos/pantallas.css:3239-3248 (.oferta-bufon-lado: left fijo, sin reservar su ancho); :2899-2906 y :3231-3235 (el Botín plegado a scale 1 0.16 con brightness 0.38); src/client/pantallas/camino.ts:415 (.opcion)",
      "que": "El Bufón queda cortado por los dos lados: el borde izquierdo de la pantalla le come el cascabel y la primera tarjeta le tapa la punta del gorro (elegi-amuleto, x≈270). Arriba queda el Botín aplastado y oscurecido, una franja sucia de 90 px que no se lee como nada. Las tarjetas flotan sobre el velo sin mesa; la de un solo renglón (Bota de vino) tiene la mitad de abajo vacía. En el Tesoro, «Te faltan 20 de oro» va en rojo chico sobre fondo oscuro, al lado del botón.",
      "por_que": "Es el cobro más frecuente del juego, y es el único lugar donde el anfitrión aparece mutilado ahora que la mesa lo respeta. La regla bufon-tapado se aplicó en la mesa y acá no.",
      "propuesta": "Reservar la columna del Bufón (las tarjetas arrancan a su derecha, o el Bufón a 0,8×). Sacar el Botín plegado: en su lugar, el paño verde del Botín extendido debajo de las tres tarjetas, que es la escena que ya existe. Tarjetas con el icono a 2× cuando el texto es corto."
    }
  ],
  "aciertos": [
    "La mesa a 1080p cerró: el Bufón tiene cara en todas las capturas y el bocadillo va a su izquierda; el paño a 2× iguala a la mano y lo jugado es por fin lo más grande del centro; el desglose en dos columnas, DAÑO a la izquierda y MULTI a la derecha, se lee de un vistazo y sin un solo punto suspensivo (mesa-garrote, mesa-seleccion, mesa-sol).",
    "El cobro ganó escena: el Botín sobre paño verde con monedas volcadas y el Bufón grande al costado; la Forja Brava con el naipe a 2×, el sello ×2 torcido en la esquina y la fogata al pie; el Mapa con el retrato del Rey del tramo en el tercio derecho.",
    "El busto del enemigo a 390x844 está bien encuadrado, las placas «−19» y «−4» bajan de la caja y dejan libre el retrato, y el resumen de derrota muestra a los tres Reyes con cabeza y corona. fin-victoria sigue siendo la mejor pantalla."
  ],
  "capturas_vistas": [
    "visual-qa/1920x1080/mesa.png", "visual-qa/1920x1080/mesa-chinchon.png", "visual-qa/1920x1080/mesa-rey.png", "visual-qa/1920x1080/mesa-postas-arrastre.png", "visual-qa/1920x1080/mesa-garrote.png", "visual-qa/1920x1080/mesa-conteo.png", "visual-qa/1920x1080/mesa-chancho.png", "visual-qa/1920x1080/mesa-seleccion.png", "visual-qa/1920x1080/mesa-pega-todo.png", "visual-qa/1920x1080/mesa-sol.png",
    "visual-qa/1920x1080/botin.png", "visual-qa/1920x1080/botin-tesoro.png", "visual-qa/1920x1080/elegi-amuleto.png", "visual-qa/1920x1080/forja-brava.png", "visual-qa/1920x1080/mapa.png", "visual-qa/1920x1080/mapa-mando.png", "visual-qa/1920x1080/pulperia.png", "visual-qa/1920x1080/pulperia-evoluciona.png", "visual-qa/1920x1080/coleccion.png", "visual-qa/1920x1080/coleccion-reyes.png", "visual-qa/1920x1080/coleccion-amuletos.png", "visual-qa/1920x1080/portada.png", "visual-qa/1920x1080/fin-derrota.png", "visual-qa/1920x1080/fin-victoria.png",
    "visual-qa-en/1920x1080/mesa-chinchon.png",
    "visual-qa/1366x768/mesa-chinchon.png", "visual-qa/1280x800/mesa-chinchon.png", "visual-qa/1280x800/mesa.png",
    "visual-qa/390x844/mesa-chinchon.png", "visual-qa/390x844/mesa-seleccion.png", "visual-qa/390x844/resumen-derrota-movil.png", "visual-qa/390x844/botin.png", "visual-qa/390x844/mapa.png", "visual-qa/390x664/mesa-chinchon.png", "visual-qa/360x740/mesa-chinchon.png",
    "jurado/secuencias/1920-golpe-06.png", "jurado/secuencias/1920-golpe-11.png", "jurado/secuencias/1920-golpe-16.png", "jurado/secuencias/1920-chinchon-corta-04.png", "jurado/secuencias/1280-rey-planta-10.png", "jurado/secuencias/1280-rey-planta-14.png", "jurado/secuencias/390-rey-planta-10.png", "jurado/secuencias/390-contragolpe-09.png"
  ]
}
```

## Veredicto

**El P1 de la mesa a 1920×1080 quedó cerrado.** Lo comprobé en diez capturas de mesa y cuatro cuadros de secuencia a 1920: el Bufón tiene cara en todas, el paño a 2× mide lo mismo que la mano, y el desglose se lee entero a 24–30 px. No queda ningún P0 ni P1 de arte. Los tres defectos son P2.

Claridad y estética suben a 8,9. No llegan a 9,1 por tres cosas que vi:
- La Colección a 1080p tiene hasta un 35 % de pantalla lisa.
- El teléfono bajo (664 y 740 de alto) sigue con el enemigo aplastado y un naipe escondido en la mano de dos filas.
- La elección de Amuleto corta al Bufón por los dos lados.

Diversión 8,6: el golpe a 1920 tiene poses claras (los naipes sobre la barra, las placas «−19» y «−4 ESCUDO» sobre sus cajas, el Bufón que guiña con «Te vi la cara»). El sonido y el temblor no los juzgo: no los vi.

No abrí Ajustes, Jugadas, Mazo, Altar, Crónica, Cábala Negra, Fogón ni Elegí tu Mazo en esta versión, ni las secuencias de Chancho, maldición, Rey que cae o Botín que brota. De eso no opino.

**Respecto de la 0.28:**
- **P1 de la mesa a 1920: resuelto** (bocadillo, paño y desglose).
- **P2 del teléfono: resuelto a medias.** Cerraron el busto a 390x844, los Reyes con cabeza y las placas fuera del retrato. Siguen el 2 tapado en dos filas y el enemigo aplastado a 390x664 y 360x740.
- **P2 de pantallas de cobro: resuelto** en Botín, Forja Brava y Rey del Mapa. Siguen los nudos sin visitar apagados.
- **Menores:** resueltos los nombres cortados del desglose y el «HAY MÁS ↓» de la Pulpería, que ahora va al pie. Siguen el busto a 1366 y el zócalo de la Colección, que sube a defecto principal.

## Defectos menores

- **El desglose cambia de forma y de tamaño según la jugada y la ventana.** A 1920 la columna DAÑO mide 440 px con letra de 30 en mesa-sol y 245 px con letra de 24 en mesa-chinchon, donde «Taba cargada» pasa a «Cargada» y «Cantos hechos» a «Cantos». A 1280 y 1366 es un párrafo de fichas que parte renglón con el icono huérfano («Cofre del Caudal +1»). `src/client/estilos/mesa.css:6494-6570` y `src/client/pantallas/mesa.ts:349`.
- **El Comodín copiado sobre el paño es barro.** El fantasma del Bufón encima de las pintas, más el rótulo COMODÍN de canto, ensucia el naipe más importante de la jugada (mesa-seleccion, mesa-pega-todo). `src/client/estilos/mesa.css:1159` y `:1380`.
- **El Rey del Mapa se apaga a 0,16** cuando abrís la ayuda de un nudo: queda un fantasma ilegible detrás del cartel, con «EL CAUDAL» a medio ver. Mejor correr la ayuda debajo del retrato. `src/client/estilos/pantallas.css:5374-5379`.
- **Busto a 1366 y 1280:** la Sota sigue cortada en el pecho, con media moneda bajo la barra de vida (~110 px). `src/client/estilos/mesa.css:5468` en adelante.
- **Botín a 1920:** la tarjeta «+12 DE ORO» es una moneda deforme en una losa azul con la mitad vacía, y el tercio derecho sigue teniendo solo la vela. `src/client/estilos/pantallas.css:317-360`.

## Qué haría en la próxima versión

**Que no quede una sola pantalla de escritorio con un tercio liso, y que el teléfono bajo tenga cara.**
- Colección a 1080p con la pared hasta el pie en las cinco pestañas y un zócalo con objetos.
- Elección de Amuleto sobre el paño del Botín, con el Bufón entero en su columna.
- Mano del teléfono en una fila hasta cuatro naipes, y busto anclado a la cara por debajo de 700 px de alto.
- Un solo molde de desglose: dos columnas de ancho fijo a 1080p, con los mismos nombres siempre, y la misma lógica plegada a 1280.
- El Comodín copiado con un sello chico en la esquina en vez del fantasma.

Con eso estética y claridad pasan de 9,1. Diversión no depende de mí: desde el arte, lo que le falta es que el cobro del Amuleto tenga un cuadro de pose propio, como ya lo tiene la Forja.
