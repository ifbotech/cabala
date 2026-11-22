```json
{
  "jurado": "jurado-arte",
  "version": "0.26.0",
  "puntajes": { "claridad": 8.0, "diversion": 8.1, "estetica": 8.2, "veredicto": 8.1 },
  "defectos": [
    {
      "prioridad": "P1",
      "pantalla": "La mesa del teléfono con algo apoyado (mesa-seleccion, mesa-chinchon, mesa-garrote, mesa-sol, secuencias golpe, postas-golpe y rey-tajo)",
      "ventana": "390x844",
      "archivo": "src/client/mano.ts:267-277 (hv = techo − aire − subida: el paño cede alto para que la mano no se mueva) y :353-371 (cada naipe deja su hueco en su fila)",
      "que": "Para que la mano quede quieta, el paño ahora enseña solo la mitad de arriba de cada naipe. El Comodín y el 9 de Copas de mesa-seleccion quedan cortados a la altura de la quinta copa, y los tres 4 de mesa-chinchon, a la mitad. La mano, en cambio, conserva los huecos. En mesa-seleccion, un 4 de Espadas solo a la izquierda debajo de 300 px vacíos. En mesa-chinchon, el 2 de Espadas queda en la fila de atrás, medio tapado por el 5. En la 0.25 el paño iba entero.",
      "por_que": "Lo que se juzga es lo que va en el paño, y es justo lo que queda amputado. Lo que no se juega queda entero y desordenado. La jerarquía queda al revés, y la mesa parece rota a mitad de animación.",
      "propuesta": "Respetar la mano quieta, pero que el paño muestre naipes enteros a escala menor. Un naipe entero de 70 px se lee mejor que medio de 100: kp a 0,7 con el Escalón incluido, sin el recorte de hv. Los huecos de la mano, marcados con una silueta tramada del naipe que subió («acá estaba»), así se leen como un lugar a propósito y no como un error."
    },
    {
      "prioridad": "P1",
      "pantalla": "La mesa de escritorio con algo apoyado (mesa-garrote, mesa-chinchon, mesa-maldicion; secuencias golpe y maldicion)",
      "ventana": "1920x1080 y 1280x800",
      "archivo": "src/client/mano.ts:224 (kp = k/2), :318 (base = max(alto − h, manoY): la mano cae bajo el HUD) y :371 (la fila cuenta los huecos); src/client/estilos/mesa.css:563 (.pano-regla.costado)",
      "que": "Sigue igual que en la 0.25. Los naipes del paño son la mitad de la mano, en una caja verde con dos tercios vacíos, y de la mano se ve el 55 %. En mesa-chinchon a 1920 hay un hueco de 650 px entre el 2 y el 5. A 1280 es peor: el 5 y los dos 7 se montan uno sobre otro mientras a la izquierda queda el hueco, y la pista «LB RB corre de Posta» queda cortada debajo del 2 de Espadas. A 1280 «Medio: pega doble» se parte en dos renglones.",
      "por_que": "Es la pantalla donde se juega el 90 % del tiempo. La escena se va a una franja central angosta, y el naipe elegido, que debería mandar, es lo más chico de la mesa.",
      "propuesta": "Lo mismo que pedí en la 0.25. El paño a escala de mano (kp = k) y abierto a lo ancho. La mano baja solo lo necesario y va siempre entera. En escritorio, la fila cierra el hueco con un deslizamiento de 3 pasos. La regla de la izquierda pasa a un cartel tramado colgado del paño, sin columna angosta que se pise con la mano."
    },
    {
      "prioridad": "P1",
      "pantalla": "Rótulos y números que se pisan alrededor de lo nuevo (mesa-chinchon, mesa-garrote, secuencias maldicion, contragolpe y golpe)",
      "ventana": "1920x1080, 1280x800 y 390x844",
      "archivo": "src/client/estilos/mesa.css:3447 (.e-neto absoluto a la derecha de la cifra); src/client/pantallas/mesa.ts:895 y :1156 (nacerEnDueno: el −N nace encima de la caja del HUD); src/client/estilos/mesa.css:2392 y :2437-2445 (términos del desglose que saltan a 1.15)",
      "que": "A 1920, el «¡CHINCHÓN!» de la placa se mete bajo el naipe de LA CORTE y se lee «¡CHINCHÓ», y «23 − 5 ESCUDO» choca con su borde. En el teléfono, el −5 de Escudo del Garrote y el −4 del contragolpe nacen arriba de la caja ESCUDO, justo sobre «−3 oro» de DESCARTAR, y se leen como un precio. El −19 tapa GOLPEAR. A 1280 el −5 cae sobre el 9 de Copas, cian sobre hueso. Durante el conteo, los íconos de los términos se montan sobre el vecino: Taba sobre «Primera sangre +8» y Sol sobre «Taba +1».",
      "por_que": "Lo que estrena la versión (el ¡CHINCHÓN! que te salva y el Garrote que cobra Escudo) es justo lo que se lee mal. Un costo que se confunde con el precio del descarte es un error de lectura, no de estilo.",
      "propuesta": "La causa del TE PEGA va debajo de la cifra, nunca al costado. Los −N del jugador nacen adentro de su caja del HUD (encima de la cifra, con contorno) y la zona de botones queda prohibida. Los términos del desglose crecen con transform-origin propio y un hueco fijo de 6 px, o se encienden sin escala."
    }
  ],
  "aciertos": [
    "El P0 de la Forja Brava quedó resuelto en lo grueso. El panel se pliega y desaparece, el naipe baja entero sobre la fogata y el «×2» estalla grande, con contorno negro, sobre la llama (mirar/390-forja-brava-x2). Con la quema, la placa «SE QUEMÓ. LA PERDISTE.» va con su fogata dibujada y deja la escena libre (1280-forja-brava-quemada-despues).",
    "NO TE PEGA en cian, en la misma celda que TE PEGA, se lee al primer golpe de vista en las tres ventanas. El contragolpe (−19 rojo grande y el corazón que se desarma en VIDA) es la mejor respuesta del enemigo hasta ahora. DESCARTAR ∞ / −3 oro va en dos renglones limpios.",
    "La ayuda de la bandeja en el teléfono ya no tapa a la Sota: es una cajita sobre el aire entre el enemigo y la mano. La sobra de Perfora en púrpura (99 sobre el Cacique) se distingue del daño rojo sin explicación."
  ],
  "capturas_vistas": [
    "mirar/390-forja-brava-elegir.png", "mirar/390-fogon-suspenso-brava-llama.png", "mirar/390-forja-brava-quema-llama.png", "mirar/390-forja-brava-x2.png", "mirar/390-forja-brava-despues.png",
    "mirar/1280-forja-brava-x2.png", "mirar/1280-forja-brava-quema-llama.png", "mirar/1280-forja-brava-despues.png", "mirar/1280-forja-brava-quemada-despues.png",
    "mirar/1280-mesa-grito.png", "mirar/390-mesa-grito.png",
    "visual-qa/1920x1080/mesa-garrote.png", "visual-qa/1920x1080/mesa-chinchon.png", "visual-qa/1920x1080/forja-brava-eleccion.png", "visual-qa/1920x1080/forja-brava.png", "visual-qa/1920x1080/fogon-mutaciones.png",
    "visual-qa/1920x1080/rey-mascara.png", "visual-qa/1920x1080/coleccion-amuletos.png", "visual-qa/1920x1080/mapa.png", "visual-qa/1920x1080/botin.png",
    "visual-qa/1280x800/mesa-chinchon.png",
    "visual-qa/390x844/mesa-chinchon.png", "visual-qa/390x844/mesa-garrote.png", "visual-qa/390x844/mesa-sol.png", "visual-qa/390x844/mesa-seleccion.png", "visual-qa/390x844/mesa-maldicion.png",
    "visual-qa/390x844/pulperia.png", "visual-qa/390x844/hud-evolucion-foco.png", "visual-qa/390x844/resumen-derrota-movil.png", "visual-qa/390x844/fogon-mutaciones.png",
    "jurado/secuencias/1280-contragolpe-04.png", "jurado/secuencias/1280-contragolpe-09.png", "jurado/secuencias/1280-contragolpe-14.png",
    "jurado/secuencias/1280-golpe-03.png", "jurado/secuencias/1280-rey-cae-03.png", "jurado/secuencias/1280-rey-cae-05.png", "jurado/secuencias/1280-rey-cae-08.png",
    "jurado/secuencias/390-rey-tajo-06.png", "jurado/secuencias/390-rey-tajo-09.png",
    "jurado/secuencias/1280-maldicion-06.png", "jurado/secuencias/1280-maldicion-09.png", "jurado/secuencias/1280-maldicion-11.png", "jurado/secuencias/1280-maldicion-13.png",
    "jurado/secuencias/390-maldicion-11.png", "jurado/secuencias/390-contragolpe-09.png",
    "jurado/secuencias/1280-rey-segunda-08.png", "jurado/secuencias/1280-rey-segunda-11.png", "jurado/secuencias/1280-rey-segunda-14.png", "jurado/secuencias/1280-rey-segunda-20.png", "jurado/secuencias/1280-rey-segunda-23.png",
    "jurado/secuencias/390-postas-golpe-04.png", "jurado/secuencias/390-golpe-05.png"
  ]
}
```

## Veredicto

La 0.26 hizo lo que pedí para el momento cumbre: cuando la Forja Brava pasa, el panel se va y queda el dibujo. En el teléfono el naipe baja entero a la fogata y el «×2» se ve de lejos. Sumado al NO TE PEGA y al contragolpe nuevo, diversión sube a 8,1. Estética queda en 8,2: lo que ganó el Fogón lo perdió la mesa del teléfono. Para que la mano no se mueva, el paño enseña medio naipe y la mano queda con huecos. Claridad baja a 8,0 por los pisotones en lo nuevo: el ¡CHINCHÓN! bajo La Corte y el −5 de Escudo que nace sobre «−3 oro». El temblor, el hitstop y el sonido de la Forja los leí en código y no los vi.

**Respecto de la previa:** resuelto el P0 de la Forja Brava en lo grueso. Quedan la llama, que es un degradado liso, y la fogata, que no crece. Resuelto el P1 de la bandeja en el teléfono: ya no tapa al enemigo. Sigue igual el P1 de la mesa de escritorio con algo apoyado. De los menores siguen: «23 − 5 ESCUDO» contra La Corte, la brasa tapada en las mutaciones, los Reyes sin cabeza en el resumen a 390, la máscara plana y la Colección a medias.

## Defectos menores

- **Llama de la Forja:** es un `linear-gradient` de cuatro bandas planas recortado en sierra. Es lo único sin tramado del Fogón y se ve como una losa naranja al pie del naipe. La fogata sigue en su anillo de 150 px. `src/client/estilos/pantallas.css:4660-4681`.
- **La Forja a 1280:** la capa usa k = 1. El naipe mide ~100 px, más chico que el gorro del Bufón, y el «×2» queda arriba del naipe y no de la llama. Durante el suspenso, el Bufón sigue diciendo «Elegí la mutación y rezá». `src/client/pantallas/camino.ts:876` y `:1040-1063`.
- **Resultado de la Forja a 1920:** es una columna de 340 px, y el ×2 queda reducido a «NAIPE ENTERO ×2» en letra de cuerpo. El momento se apaga apenas se va la capa. `src/client/pantallas/camino.ts:907` y `:1099-1104`.
- **Chip doble:** en la misma cuenta van «¡CHINCHÓN!» y «NO TE PEGA · ¡CHINCHÓN!». `src/client/pantallas/mesa.ts:550`.
- **Segunda cara:** a 1280, el cartel FORTÍN tapa el rótulo del rasgo de su derecha (rey-segunda-20). `src/client/estilos/mesa.css` (cartel de segunda cara).

## Qué haría en la próxima versión

**La mesa, por fin.** Ya no es una pantalla más: es la deuda de tres versiones. Un solo paquete, con la regla de la Forja: lo jugado manda.
- **Teléfono:** mano quieta y paño entero a escala menor. Cada hueco, con la silueta tramada de su naipe.
- **Escritorio:** paño a escala de mano y abierto a lo ancho, mano entera, la fila que cierra su hueco en tres pasos y la regla en un cartel colgado del paño.
- **Números del jugador:** nacen adentro de su caja del HUD, nunca sobre botones.
- **Causa del TE PEGA:** va debajo de la cifra.

Además, la llama de la Forja tramada a celda entera (Bayer 4×4, rampa blanco → oro → naranja → carmín al índigo) y una fogata que crezca en pasos hasta el tercio de abajo. Con eso, estética pasa de 8,5.
