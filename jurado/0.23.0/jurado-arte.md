```json
{
  "jurado": "jurado-arte",
  "version": "0.23.0",
  "puntajes": { "claridad": 7.8, "diversion": 7.8, "estetica": 8.1, "veredicto": 7.9 },
  "defectos": [
    {
      "prioridad": "P0",
      "pantalla": "La ayuda que se abre sola sobre lo importante: ELEGÍ UNA con candado, el Altar con DEVOLVER y la bandeja del HUD con el foco",
      "ventana": "las cuatro (botin-tesoro a 1920, 1280 y 390; altar-devolver a 1920, 1280 y 390; hud-evolucion-foco a 1280)",
      "archivo": "src/client/ui.ts:83 (abrirModal enfoca [data-inicio] y el focusin de :138 abre la ayuda), src/client/ui.ts:172-186 (ubicarTip: arriba del ancla, centrada, sin mirar qué tapa); src/client/pantallas/camino.ts:419 (el tip va en todo el renglón .oferta-tesoro y repite lo que el renglón ya dice); src/client/pantallas/menu.ts:224 (el tip de DEVOLVER)",
      "que": "Si el oro no alcanza, el modal del Tesoro enfoca DEJAR EL COFRE apenas abre, y el foco dispara la ayuda «TESORO · Un cofre con un Amuleto adentro». A 1920 y a 1280 la ayuda tapa el título («ELEG… LETO»). En el teléfono tapa el nombre, la rareza y la regla del Cáliz del Bacanal, justo el naipe que lleva el sello EVOLUCIONA. Encima, repite palabra por palabra el renglón de al lado. En el Altar, la ayuda de DEVOLVER tapa entero el botón MEJORAR, la acción principal: a 1280 directamente no se ve. En la bandeja del HUD, la ayuda de la Evolución tapa media mano y los botones GOLPEAR y DESCARTAR.",
      "por_que": "Las tres novedades del Salto 3 (el candado, el Altar que devuelve y la ficha despierta) se estrenan con un cartel encima de lo que hay que mirar. Y no es un caso raro: pasa en la primera foto de cada pantalla, con cualquier entrada, porque lo dispara el foco automático.",
      "propuesta": "Que el foco puesto por el programa (data-inicio, abrirModal y la vuelta del foco) no abra la ayuda: solo la abre un foco del usuario (con el mando o con Tab) o el puntero. Sacar el tip del renglón .oferta-tesoro, que ya dice todo. ubicarTip tiene que esquivar a los hermanos: probar arriba, abajo, izquierda y derecha, y quedarse con el lugar que no se cruza con .titulo, .opcion, [data-accion] ni #hud. En el Altar, la ayuda de DEVOLVER va al costado del altar, nunca encima de MEJORAR. Sumar a la QA: ninguna .tip se cruza con un botón habilitado ni con un título."
    },
    {
      "prioridad": "P1",
      "pantalla": "ELEGÍ UNA con candado de Tesoro: los naipes se montan sobre el HUD",
      "ventana": "1920x1080 y 1280x800 (a 390 entra)",
      "archivo": "src/client/pantallas/camino.ts:419 (la cinta .oferta-tesoro suma un renglón); src/client/estilos/pantallas.css:3707-3746 (.oferta-tesoro y .o-tesoro sin alto propio para las opciones)",
      "que": "El botón dejó de pisar el HUD (bien) y el precio se lee a plena tinta, 27 en hueso con el candado de oro (bien). Pero ahora lo que baja son los dos naipes de oferta: a 1920 terminan en y≈897 y tapan el borde del HUD, el retrato y el rótulo ORO. A 1280 llegan a y≈690 sobre un HUD que empieza en 662. La cifra del oro, que es la respuesta a «¿me alcanza?», queda rozada por el canto de la carta.",
      "por_que": "Es el mismo problema de la 0.22, corrido un renglón: el modal del Tesoro tiene un renglón más que los demás y nadie le descontó ese alto. El HUD es el ancla de toda la partida; si una pantalla lo pisa, se rompe la composición en tres pisos.",
      "propuesta": "En .o-tesoro, achicar el arte de la opción (op-icono a k2 en vez de k3) y la descripción a dos renglones con «Tocá para leer», o pasar la cinta TESORO al renglón del título como subtítulo. Que la regla de QA ya pedida (ningún hijo de .velo se cruza con #hud) cubra también las .opcion."
    },
    {
      "prioridad": "P1",
      "pantalla": "¡FORJA BRAVA! con dos mutaciones a la vista",
      "ventana": "las cuatro (fogon-mutaciones a 1920, 1280 y 390)",
      "archivo": "src/client/pantallas/camino.ts:861 (las dos mutaciones como «btn marco oro»); src/client/estilos/pantallas.css:4040-4064 (.forja-mut: ícono a 1×, .fm-desc a --fs-s sobre oro tramado)",
      "que": "Hay tres botones de oro macizo con el mismo peso: DOBLE FILO, CHISPA DE ORO y SEGUIR. La elegida se distingue solo por un hilo cian de 2 px. La regla de cada mutación va en cuerpo chico, marrón sobre amarillo tramado, y el ícono mide 16 px: la hoja de Doble Filo parece un lápiz labial. El título «TEMPLADA: +8 DE DAÑO Y +1 DE MULTI» deja «MULTI» solo en el segundo renglón.",
      "por_que": "Es la decisión más jugosa del Fogón y se lee como un formulario. Cuando todo es oro, nada es premio: el ojo no sabe si ya eligió, ni cuál es la salida.",
      "propuesta": "Que las mutaciones sean dos naipes chicos de tinta (marco hierro, como las .opcion), con el ícono a 3× y su nombre en romana. El oro queda solo para la elegida, con el mismo latido del foco del Botín. SEGUIR, en hierro, como salida secundaria. Y el título en un solo renglón: «+8★ +1 MULTI»."
    }
  ],
  "aciertos": [
    "Mi P0 de la previa quedó resuelto. Las cuatro Evoluciones tienen dibujo propio y se leen a 1×: el Facón con la hoja violeta goteando, el Garrote con la faja del poncho en el mango, el Sol que sale del cofre y el Brindis que rebalsa sangre. El jackpot cuenta «antes ▶ después» a unos 100 px, con marco prismático de 9 trozos (pantallas.css:3346) y no con box-shadow. Y el baúl de hierro remachado del Tesoro ya no se confunde con el Cofre del Caudal (iconos.ts:870).",
    "El resumen en dos capas es la mejor pantalla del juego: atardecer tramado detrás del retrato, los tres Reyes tachados en fila, BUILD ESTRELLA con sus fichas prismáticas, la cifra de 5445 dominando y OTRA MANO YA como único oro. A 390 entra entero y respira.",
    "El Altar por fin tiene escena (mesa de madera, velas en el piso y exvotos encima) y la Cábala Negra muestra los 36 naipes a 1920. En el teléfono los ordena por número, lo que deja las parejas en la misma fila. En el teléfono las Postas ya no se pisan: 2, 3 y 4 escalonados y enteros, con el ×2 encima del naipe y no sobre sus pintas."
  ],
  "capturas_vistas": [
    "visual-qa/1920x1080/evolucion-jackpot.png", "visual-qa/1920x1080/hud-evolucion.png", "visual-qa/1920x1080/botin-tesoro.png", "visual-qa/1920x1080/mapa-tesoro.png",
    "visual-qa/1920x1080/resumen-victoria.png", "visual-qa/1920x1080/resumen-derrota.png", "visual-qa/1920x1080/altar-devolver.png", "visual-qa/1920x1080/mesa-exacto.png",
    "visual-qa/1920x1080/forja-brava.png", "visual-qa/1920x1080/fogon-mutaciones.png", "visual-qa/1920x1080/mesa-seleccion.png", "visual-qa/1920x1080/mesa.png",
    "visual-qa/1920x1080/cabala-negra.png", "visual-qa/1920x1080/piezas.png", "visual-qa/1920x1080/coleccion-amuletos.png", "visual-qa/1920x1080/rey-mascara.png",
    "visual-qa/1280x800/botin-tesoro.png", "visual-qa/1280x800/mesa-exacto.png", "visual-qa/1280x800/fogon-mutaciones.png", "visual-qa/1280x800/altar-devolver.png",
    "visual-qa/1280x800/hud-evolucion-foco.png", "visual-qa/1280x800/resumen-derrota.png",
    "visual-qa/390x844/botin-tesoro.png", "visual-qa/390x844/cabala-negra.png", "visual-qa/390x844/mesa-escalon.png", "visual-qa/390x844/mesa-exacto.png",
    "visual-qa/390x844/evolucion-jackpot.png", "visual-qa/390x844/fogon-mutaciones.png", "visual-qa/390x844/resumen-victoria.png", "visual-qa/390x844/altar-devolver.png",
    "jurado/secuencias/1280-golpe-02.png", "jurado/secuencias/1280-golpe-05.png", "jurado/secuencias/1280-golpe-07.png", "jurado/secuencias/1280-golpe-08.png",
    "jurado/secuencias/1280-rey-irrumpe-04.png", "jurado/secuencias/1280-rey-irrumpe-10.png", "jurado/secuencias/1280-rey-tajo-05.png",
    "jurado/secuencias/1280-botin-brota-06.png", "jurado/secuencias/1280-botin-brota-10.png",
    "jurado/secuencias/390-rey-tajo-05.png", "jurado/secuencias/390-postas-golpe-03.png"
  ]
}
```

## Veredicto

La 0.23.0 le dio al Salto 2 el arte que le faltaba. Las Evoluciones despiertan con sprite propio y con un «antes ▶ después» que se festeja. El Tesoro es un baúl de hierro que no se confunde con nada. El Altar tiene mesa, velas y exvotos. Y el resumen de la partida, con el atardecer tramado y la BUILD ESTRELLA en fichas prismáticas, es la mejor composición del juego. Estética sube a 8,1.

El defecto nuevo es de sistema: la ayuda se abre sola con el foco automático y cae encima de lo que hay que mirar. Tapa el título y el naipe que evoluciona en el Tesoro, y el botón MEJORAR en el Altar. Por eso claridad no sube (7,8). La Forja Brava se elige, pero se ve como tres botones de oro iguales.

**Respecto de la previa:** quedaron resueltos el P0 (Evoluciones con dibujo propio y Tesoro distinto del Cofre) y el P1 de las Postas pisadas en el teléfono. El ×2 también salió de encima de las pintas. Del P1 del candado se resolvió la mitad: el precio se lee a plena tinta y el botón ya no pisa el HUD, pero ahora los naipes de oferta sí lo pisan. Entre los menores se resolvieron la Cábala Negra cortada a 1920, la Forja con caja vacía, la ayuda del Vaso abierta todo el golpe y el Altar vacío. Siguen la banda negra plana de la máscara y la Colección vacía.

## Defectos menores

- **Colección de Amuletos:** la mitad de abajo de la pantalla es tablón vacío, no está el Bufón y las Evoluciones no tienen dónde verse. `src/client/pantallas/menu.ts:320`.
- **La máscara del Rey sigue siendo una banda negra plana** cruzando la mesa (rey-mascara a 1920). `src/client/estilos/mesa.css:4330`.
- **Con el paño puesto, la mano baja y queda medio tapada por el HUD.** A 1920 se ve la mitad de cada naipe (mesa-seleccion, mesa-exacto) y a 1280 el 4 de Oros enseña 2 de sus 4 oros. `src/client/mano.ts:583-586` y `src/client/estilos/mesa.css:447`.
- **El Garrote del Cacique y el escudo INMUNE A BASTOS** son el mismo garrote verde, y en hud-evolucion están a 600 px uno del otro con significados distintos. `src/client/pixel/iconos.ts:273` (EVOLUCION_DIBUJO): darle al Garrote una cabeza de piedra o de hierro.
- **El «II» del nivel de la Bendición** en BUILD ESTRELLA se lee como basura tipográfica, pegado a la última ficha y a --fs-s. `src/client/pantallas/camino.ts:1208` y `src/client/estilos/pantallas.css:3863`: mejor un chip «NV 2» o velas como en el Altar.

## Qué haría en la próxima versión

**Que nada tape lo que se elige.** Una política única de ayudas: el foco que pone el programa no abre ayuda, y ubicarTip esquiva títulos, botones y el HUD, con una regla de QA que lo vigile en todas las pantallas fijas. Un presupuesto de alto por modal, para que ELEGÍ UNA (con cinta o sin ella) nunca cruce el HUD. Las mutaciones de la Forja Brava como dos naipes chicos de tinta, con el oro reservado para la elegida. La Colección como vitrina: el Bufón detrás del mostrador, los 15 Amuletos en estantes y cada Evolución colgada al lado de su forma de base, revelada con su marco prismático. Y la máscara del Rey con su escena: telón tramado y candil, no una banda negra. Con eso la estética llega a 8,5 y la claridad pasa de 8.
