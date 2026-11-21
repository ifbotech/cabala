```json
{
  "jurado": "jurado-novato",
  "version": "0.18.0",
  "puntajes": { "claridad": 6.9, "diversion": 7.0, "estetica": 7.8, "veredicto": 7.1 },
  "defectos": [
    { "prioridad": "P1", "pantalla": "mesa-seleccion, mesa-segunda y secuencia golpe-00/02 (la cuenta antes de soltar)", "ventana": "1280x800", "archivo": "src/client/pantallas/mesa.ts:241-247 (revela «LE QUEDAN»/«SOBRAN» y el total recién en el conteo) y src/client/estilos/mesa.css:3146 (los esconde hasta entonces)", "que": "Antes de golpear, la cuenta ya no me da ninguna cifra final. Leo «FLOR · LO ABATÍS» o «PAR · NO LO ABATÍS» y abajo dos renglones con diez términos sueltos (1+4+4 · Flor +6 · Cantos hechos +6 · Taba cargada +10 / Flor 2 · Mano corta +4 · Cofre del Caudal +2…), sin subtotal de DAÑO, sin subtotal de MULTI y sin «LE QUEDAN n». En la 0.17 el «LE QUEDAN 81» estaba antes de soltar.", "por_que": "Es la única decisión de la mesa: con qué cartas pego. Si no abato, no sé si le saco el 90 % o el 5 %, así que no puedo comparar un Par con una Flor ni saber si conviene descartar. Para saberlo tendría que sumar diez números y multiplicar, y un novato no lo hace. El suspenso del conteo lo paga la claridad: es una regresión respecto de mi nota de la 0.17.", "propuesta": "El suspenso que vaya en la animación, no en la información. Antes de soltar, mostrar DAÑO 31 × MULTI 12 en grande (los subtotales ya están calculados en q.dano y q.multi) y, si no abate, «LE QUEDAN n». El total en oro puede seguir cayendo en el conteo. Los diez términos, en un renglón apagado o al mantener la selección." },
    { "prioridad": "P1", "pantalla": "mesa-rey y mesa-grito (El Caudillo, primera cara), bandeja del HUD", "ventana": "1280x800", "archivo": "src/client/pantallas/mesa.ts:137-141 (la primera cara es un chip con solo el nombre; la segunda, en la 140, lleva nombre + regla), src/client/textos.ts:479 (hay SEGUNDA_CORTA, pero no hay una regla corta para el rasgo) y src/rules/reyes.ts:51-53 y 89-91 (Coraza/Coraza del Cacique, Brindis/Brindis del Bacanal)", "que": "El chip dorado pasó de «FILO DEL CAUDILLO» a «ESTOCADA DEL CAUDILLO», pero sigue sin decir qué hace: que la mitad de lo que TE PEGA atraviesa mi Escudo está solo en el tip. Además, el arreglo de nombres quedó por la mitad: en la misma captura mi HUD dice «BRINDIS 1», y el Rey de Copas se llama «Brindis del Bacanal». El de Bastos, igual: carga «Coraza» y rasgo «Coraza del Cacique».", "por_que": "Era mi P1 de la 0.17 y solo cambió la palabra. Es el primer jefe, y su regla cambia lo que vale mi Escudo (en la captura tengo 2). En dorado parece un premio. Si una palabra es a la vez mía y del Rey, no sé si me ayuda o me castiga.", "propuesta": "Poner en la primera cara el mismo molde que ya funciona en la segunda: nombre + renglón rojo de cinco palabras («Medio golpe atraviesa tu Escudo»), con una tabla RASGO_CORTA al lado de SEGUNDA_CORTA. Renombrar los rasgos que pisan una carga del jugador (Coraza → Empalizada, Brindis → Borrachera, o al revés)." },
    { "prioridad": "P2", "pantalla": "secuencia golpe-04, 05, 06, 07 y 09 (el conteo sobre la bandeja)", "ventana": "1280x800", "archivo": "src/client/pantallas/mesa.ts:1116-1117 (cada pieza suelta su «+N» en f.y - 6, sin escalonar ni apartar los vecinos)", "que": "Mientras cuenta, las piezas vecinas de la bandeja sueltan a la vez «+2», «+1», «+3» y «+10». Salen encimados sobre iconos de 40 px y sobre el recuadro «+6» de FORTUNA (en el cuadro 09 se leen «+2 +1 +3» montados sobre el «3»). En el cuadro 06, el «372» cae encima de «MULTI 12» y de «CURA», y por un instante no se lee ninguno de los tres.", "por_que": "Es el momento en que aprendo qué pieza me suma qué. Si los números se pisan, no sé que la Taba me dio +10 ni el Cofre +2, y ese es el gancho para volver a la Pulpería. Ya estaba en mi P1 de la 0.17 y sigue igual.", "propuesta": "Soltar las cifras en una sola columna sobre la bandeja, cada una 18 px más arriba que la anterior y de a una, al ritmo del conteo. Si dos piezas son vecinas, la segunda espera a que se apague la primera. El total en oro tiene que caer en su propio hueco, sin cruzar los rótulos DAÑO/MULTI/CURA." }
  ],
  "aciertos": [
    "Ahora las cargas del HUD tienen rótulo: FILO 9, BRINDIS 4, FORTUNA 3, a la vista y sin pasar el cursor. Era mi reclamo de tres versiones.",
    "El grito ya no tapa VIDA ni ESCUDO («¡AY, MI ESPALDA!» queda entre las ayudas y la mano), y el modo mouse dice en un renglón qué hacer: «elegí cartas y arrastralas al enemigo».",
    "El Mentiroso explica por qué no me pegan: «NO TE PEGA · TU ESCUDO LO FRENA».",
    "Furia («ya incluida · +3 por turno») e Inmune (escudito tachado + «INMUNE A ESPADAS») se entienden de un vistazo. JUGADAS explica los cuatro palos y el Comodín en una línea cada uno."
  ],
  "capturas_vistas": [
    "visual-qa/1280x800/portada.png", "visual-qa/1280x800/elegir-mazo.png", "visual-qa/1280x800/cabala.png", "visual-qa/1280x800/mapa.png",
    "visual-qa/1280x800/mesa.png", "visual-qa/1280x800/mesa-seleccion.png", "visual-qa/1280x800/mesa-rey.png", "visual-qa/1280x800/mesa-mentiroso.png",
    "visual-qa/1280x800/elegi-una.png", "visual-qa/1280x800/pulperia.png", "visual-qa/1280x800/fogon.png", "visual-qa/1280x800/jugadas.png",
    "visual-qa/1280x800/piezas.png", "visual-qa/1280x800/fin-derrota.png", "visual-qa/1280x800/mesa-segunda.png", "visual-qa/1280x800/mesa-grito.png",
    "visual-qa/390x844/mesa.png", "mirar/1280-mesa-grito.png", "mirar/1280-comodin-espectral-racha.png", "mirar/1280-conteo.png",
    "jurado/secuencias/1280-golpe-00, 02, 04, 05, 06, 07, 08 y 09.png"
  ]
}
```

## Primeras impresiones (antes de abrir el código)

- **¿Cómo gano un combate?** Bajando a cero la barra roja (340); después viene «LA CORTE · QUEDA 1». Lo que no entiendo es cómo un 1 y un 4 llegan a 340, y la cuenta previa ya no me lo dice (P1).
- **¿Qué hace el enemigo en su turno?** «TE PEGA 23»: se entiende. «NO TE PEGA · TU ESCUDO LO FRENA» dice la causa.
- **Números del enemigo:** Vida, TE PEGA y Furia, claros. El «10» y el «11» de los naipes enemigos no sé qué son (¿rango?, ¿orden?).
- **Furia / Inmune:** claras. **Escudo:** una cifra del HUD; qué frena lo dice solo el glosario. **Multi:** se entiende recién cuando cae el conteo. **Canto:** «Cantos hechos +6» en la cuenta, y nunca me dijeron qué es un canto. **Golpe exacto:** lo veo en la derrota y adivino que tiene que ver con el «SOBRAN 32». **Comodín:** al elegirlo se vuelve un 4 de copas fantasma, que se entiende mirándolo.
- Palabras que no conozco: Estocada del Caudillo, Taba cargada, Mano corta, Peso fuerte, ENGAÑO (LT), porotos (el icono es una gema), Noche mansa, «Ni fu ni fa», Plata/Oro/Épico, «la primera pasada es segura», y el «+6» o «+4» enmarcado al lado de cada carga.

## Defectos menores

- Mesa con la cuenta abierta: el rótulo «LA CORTE» queda debajo del botón JUGADAS (mesa-seleccion y todos los cuadros del golpe): `src/client/estilos/mesa.css:940`.
- Mentiroso: el marco dorado de la carta enfocada asoma por debajo y a la izquierda del HUD (x 5–55, y 660–730): `src/client/mano.ts` (elevación de la carta enfocada).
- JUGADAS: el glosario sigue bajo el pliegue y le faltan canto, carga y Al rojo: `src/client/pantallas/camino.ts:130-139`.
- Mapa: los escuditos de cada nodo siguen sin decir «inmune a», la fila de arriba queda cortada contra el horizonte y la de abajo, detrás del HUD: `src/client/pantallas/camino.ts:279-282`.
- Golpe: en los diez cuadros la barra sigue en 340/340 aunque ya cayó «372». En el cuadro 09 la Sota lleva un rectángulo rosa plano en el torso, y parece un error de dibujo, no un impacto (visto en la secuencia, no medido en código).

## Contra mi veredicto de la 0.17.0

**Resueltos:** el grito ya no tapa el HUD y las cargas tienen rótulo. **Siguen:** el rasgo de primera cara sin regla (solo cambió de nombre) y los «+N» encimados en la bandeja. **Nuevo:** la cuenta previa esconde el total y «LE QUEDAN», y eso es una regresión.

## Qué haría en la próxima versión

Una regla sola: **ninguna decisión sin su cifra y ningún nombre sin su renglón**. (1) La cuenta previa vuelve a decir DAÑO × MULTI y «LE QUEDAN n», y el suspenso queda para la animación del conteo. (2) Cada rasgo de Rey lleva un renglón rojo fijo, como la segunda cara, y ningún rasgo comparte palabra con una carga del jugador (Coraza, Brindis). (3) Los «+N» de la bandeja salen de a uno y en columna, y el total cae en su propio hueco. (4) El glosario sube al primer pliegue de JUGADAS y suma canto, carga, Al rojo y Golpe exacto; en la mesa, «SOBRAN 32» lleva al lado un «exacto = premio» de dos palabras. Es texto, orden y ubicación sobre piezas que ya existen, no toca la Constitución y me dejaría la claridad en 8.
