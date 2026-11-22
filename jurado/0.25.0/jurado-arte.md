```json
{
  "jurado": "jurado-arte",
  "version": "0.25.0",
  "puntajes": { "claridad": 8.1, "diversion": 7.9, "estetica": 8.2, "veredicto": 8.0 },
  "defectos": [
    {
      "prioridad": "P0",
      "pantalla": "¡FORJA BRAVA!: el momento cumbre (suspenso y resultado)",
      "ventana": "390x844 (mirar/390-fogon-suspenso-brava, 390-fogon-suspenso-brava-llama, 390-forja-brava-despues); a 1280 a medias (mirar/1280-fogon-suspenso-brava-llama)",
      "archivo": "src/client/pantallas/camino.ts:1008-1017 (al forjar solo se suma .forjando al panel y .baja al naipe); src/client/estilos/pantallas.css:4341-4344 (.opcion.fuego.forjando: el panel queda entero) y :4620-4632 (baja-al-fuego: 90 % del camino y scale 0.7)",
      "que": "En el teléfono el clímax ocurre encima del menú. El panel de la apuesta queda apagado, pero en su lugar y a todo el ancho. El naipe «baja a la fogata» y se para sobre las cartas de mutación: tapa el texto de DOBLE FILO y después el de CHISPA DE ORO. La fogata, que ahora «casi dobla su tamaño», queda detrás del panel y solo asoma la punta sobre SEGUIR. Al quemarse, la pantalla es un cartel de una línea arriba y 330 px de negro vacío hasta una llama cortada por SEGUIR. A 1280 el naipe se achica a ~75 px junto a la fogata. El panel apagado sigue siendo lo más grande de la escena, y el fuego apenas crece.",
      "por_que": "Es la tirada de 50 % que la versión vende como apuesta, con el «×2» y la fogata que crece. Si el ojo no ve el naipe entrar al fuego, el momento no existe: en el teléfono se lee como un naipe pegado por error sobre un formulario.",
      "propuesta": "Al empezar la Forja Brava, el panel se retira: se pliega hacia arriba en 3-4 pasos, o en el teléfono sale de la escena (display:none y el espacio pasa a la fogata). El naipe baja hasta el centro de la llama, a su tamaño entero, sin achicarse antes del veredicto. La fogata ocupa el tercio de abajo y crece en pasos hasta tapar el pie del naipe. El resultado (×2 o ceniza) aparece sobre la fogata, y SEGUIR no se muestra hasta entonces. Sumar a mirar una foto de «vale doble» a 390 y a 1280."
    },
    {
      "prioridad": "P1",
      "pantalla": "La mesa de escritorio con algo apoyado (mesa-maldicion, mesa-garrote, mesa-pega-todo)",
      "ventana": "1920x1080 y 1280x800",
      "archivo": "src/client/mano.ts:217 (kp = k/2: el paño a media escala), :259 (minMano 120: de la mano se ve una franja) y :294 (base = max(alto − h, manoY): la mano cae bajo el HUD); :343 (el naipe elegido deja su hueco en la fila)",
      "que": "Lo que se juzga, los naipes del paño, es lo más chico de la mesa: a 1920 miden 100×140, la mitad de la mano. Van en una caja verde de 320 px que deja dos tercios vacíos. La mano queda amputada bajo el HUD: del 9 de Copas y del Comodín se ve el 55 %. En mesa-garrote, entre el 4 de Espadas y el Comodín queda un hueco de un naipe. Mientras tanto, entre x 140-640 solo hay dos renglones de pista y entre x 1130-1620 hay piso vacío. En mesa-pega-todo, el Comodín del paño se monta sobre el 4 de Espadas.",
      "por_que": "Con la pantalla limpia de ayudas, ahora se nota el esqueleto: la escena se va a una franja central angosta y el resto es tablón. Es lo opuesto a Balatro, donde la mano elegida crece y manda.",
      "propuesta": "A 1920 y a 1280, el paño a la escala de la mano (kp = k) y las Postas abiertas a lo ancho, que sobra. La mano baja solo lo necesario para no pisar el paño, siempre entera, y la fila se cierra sobre el hueco del elegido, aunque se anime. Las pistas de la izquierda pasan a un cartel tramado colgado del paño, no texto suelto sobre el tablón."
    },
    {
      "prioridad": "P1",
      "pantalla": "La ayuda de la bandeja (Evolución con el foco) en el teléfono",
      "ventana": "390x844 (hud-evolucion-foco); a 1280 tapa al Bufón y deja asomar su globo cortado",
      "archivo": "src/client/ui.ts:228-230 (a ≤700 px el naipe del enemigo deja de ser obstáculo: excepción explícita); src/client/hud.ts (texto de la bandeja)",
      "que": "La versión promete ayudas que no tapan al enemigo, pero a 390 la de la bandeja tapa el naipe de la Sota entero, de borde a borde: queda el TE PEGA flotando junto a un cuadro de texto. A 1280 se va arriba a la izquierda, lejos de su origen, abajo a la derecha. Ahí tapa al Bufón entero, y de su globo de diálogo asoma un recorte blanco con «Ah… sir…» contra el borde.",
      "por_que": "En el teléfono, el naipe del enemigo es el único dibujo grande de la pantalla. Taparlo deja la mesa sin protagonista, justo cuando se lee qué hace la Evolución contra él.",
      "propuesta": "En el teléfono, la ayuda larga de la bandeja va como hoja desde abajo: tapa la mano y los botones, que no se usan mientras se inspecciona, y nunca al enemigo. Se cierra al soltar el foco. A lo ancho, que se apoye pegada al borde de arriba de la bandeja. Si tapa al Bufón, que se lleve también su globo."
    }
  ],
  "aciertos": [
    "Mi P0 de la previa quedó resuelto en lo grueso: en el teléfono, el paño enseña sus naipes enteros, la mano en reposo va entera sobre la barra del pulgar y TE PEGA tiene su columna y no tapa la cara del Rey. La mano de 8 con algo apoyado va en una fila, y ningún naipe flota solo.",
    "La maldición se lee como costo: el bloque carmesí con su rótulo MALDICIÓN en el jackpot y en la ayuda de la bandeja, y el chip «−3 DE VIDA» con borde carmesí en la cuenta. «COPAS → ESCUDO +4» en verde dice la regla del Garrote sin glosario. El dial DEJALO JUSTO / PEGÁ CON TODO tiene un marco prismático propio, con lo que se gana en amarillo y lo que se pierde en rosa.",
    "El resumen sigue siendo la mejor pantalla: TU ARMADO con «nivel 2» legible, el retrato más chico y, en la derrota, todo entra sin «hay más». El Doble Filo ya es una hoja con su chispa roja, y el costo va aparte en carmesí."
  ],
  "capturas_vistas": [
    "visual-qa/1920x1080/mesa-maldicion.png", "visual-qa/1920x1080/mesa-pega-todo.png", "visual-qa/1920x1080/mesa-limpia.png", "visual-qa/1920x1080/mesa-garrote.png",
    "visual-qa/1920x1080/forja-brava-eleccion.png", "visual-qa/1920x1080/evolucion-jackpot.png", "visual-qa/1920x1080/resumen-victoria.png", "visual-qa/1920x1080/rey-mascara.png",
    "visual-qa/1920x1080/coleccion-amuletos.png", "visual-qa/1920x1080/mapa.png",
    "visual-qa/1280x800/mesa-dejalo-justo.png", "visual-qa/1280x800/hud-evolucion-foco.png", "visual-qa/1280x800/forja-brava-eleccion.png", "visual-qa/1280x800/mesa-maldicion.png",
    "visual-qa/390x844/mesa.png", "visual-qa/390x844/mesa-escalon.png", "visual-qa/390x844/mesa-dejalo-justo.png", "visual-qa/390x844/mesa-maldicion.png",
    "visual-qa/390x844/mesa-pega-todo.png", "visual-qa/390x844/mesa-limpia.png", "visual-qa/390x844/hud-evolucion-foco.png", "visual-qa/390x844/forja-brava-eleccion.png",
    "visual-qa/390x844/resumen-victoria.png", "visual-qa/390x844/resumen-derrota-movil.png",
    "jurado/secuencias/390-golpe-03.png", "jurado/secuencias/390-golpe-06.png", "jurado/secuencias/390-golpe-09.png",
    "jurado/secuencias/1280-golpe-04.png", "jurado/secuencias/1280-golpe-07.png",
    "jurado/secuencias/1280-rey-tajo-05.png", "jurado/secuencias/390-rey-tajo-06.png", "jurado/secuencias/390-rey-tajo-09.png",
    "mirar/1280-fogon-suspenso-brava.png", "mirar/1280-fogon-suspenso-brava-llama.png", "mirar/1280-forja-brava-despues.png",
    "mirar/390-fogon-suspenso-brava.png", "mirar/390-fogon-suspenso-brava-llama.png", "mirar/390-forja-brava-despues.png"
  ]
}
```

## Veredicto

La 0.25.0 arregló lo que más dolía: la mesa del teléfono dejó de cortar naipes en el paño y en reposo, y TE PEGA tiene su lugar. Las maldiciones tienen un color y un rótulo propios, que se leen como costo y no como bonus. Claridad sube a 8,1 y estética a 8,2.

No paso de ahí por el estreno de la versión: la Forja Brava se apuesta bien (APUESTA: 50 % SE QUEMA, arriba y en carmesí) y se escenifica mal. En el teléfono el naipe aterriza sobre el menú y la fogata queda detrás. No vi el «×2»: las fotos de mirar son de una quema. El temblor, el hitstop y el «×2» los leí en código y no los vi. Con el escritorio limpio de ayudas, también quedó a la vista la composición de la mesa con algo apoyado: un paño enano en medio de un tablón vacío.

**Respecto de la previa:** quedó resuelto el P0 del teléfono en lo principal: el paño y la mano en reposo van enteros, y TE PEGA ya no va adentro del naipe. Sigue a medias: con algo apoyado, de la mano se ve el 40 % de arriba, y en mesa-escalon la cuenta tapa medio Rey. El P1 de la bandeja está resuelto a lo ancho (ya no tapa al Rey) y empeoró en el teléfono, donde lo tapa entero. Del P1 de la Forja, el ícono, el título y el costo aparte están resueltos. El tramado está a medias: la brasa vive en una franja de 128 px al pie y la caja oscura de la regla la tapa, así que el interior sigue liso.

## Defectos menores

- **Cartas de mutación:** la caja `.fm-desc` (fondo oscuro) tapa la brasa: el tramado solo asoma en las esquinas. El fondo de la regla debería ser transparente sobre la brasa. `src/client/estilos/pantallas.css:4567-4581`.
- **«23 − 4 ESCUDO» junto al TE PEGA a 1920:** con un 19 o un 15, la «O» de ESCUDO choca con el borde del naipe de LA CORTE. `src/client/pantallas/mesa.ts:627` (la causa debería ir debajo de la cifra, no al costado).
- **El resumen a 390:** «HAY MÁS ↓» corta por la mitad el renglón GOLPE MÁS GRANDE. En la derrota, el título de dos renglones deja a los tres Reyes sin cabeza ni índice. `src/client/pantallas/camino.ts:1208` y `src/client/estilos/pantallas.css:4240`.
- **MESA LIMPIA a 390:** el rótulo es más ancho que la caja del Escudo y se monta sobre la de VIDA. `src/client/estilos/mesa.css` (rótulo de la caja del ESCUDO).
- **Siguen igual:** la Colección de Amuletos tiene la mitad de abajo vacía y no muestra las Evoluciones (`src/client/pantallas/menu.ts:320`), y la máscara del Rey es una banda negra plana entre dos rayas celestes (`src/client/estilos/mesa.css:4330`).

## Qué haría en la próxima versión

**La escena manda sobre los paneles.** Tres pantallas rehechas con la misma regla: cuando pasa algo, el panel se va y queda el dibujo.
- **La Forja Brava:** el panel se pliega, el naipe entra entero a una fogata que ocupa el tercio de abajo, y el ×2 o la ceniza estallan sobre la llama.
- **La mesa de escritorio:** el paño a escala de mano y abierto a lo ancho, la mano siempre entera y cerrando su hueco, y las pistas en un cartel tramado colgado del paño.
- **El teléfono:** las ayudas largas como hoja desde abajo, nunca sobre el enemigo.

Además, una pasada de tramado sobre lo liso que queda: el interior de las mutaciones, la banda de la máscara (telón con candil) y la Colección como vitrina del Bufón con cada Evolución colgada junto a su forma base. Con eso, la estética pasa de 8,5.
