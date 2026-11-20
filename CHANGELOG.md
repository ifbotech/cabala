# Registro de cambios

Todas las versiones publicadas de CÁBALA. Las cifras de balance son del laboratorio (`npm run analyze:meta`, bot propio);
las del panel de jugadores son **simuladas** y se dicen con su ruido.

## 0.9.0 · Manos de verdad y Fogón de riesgo (2026-11-20)

Dos decisiones del dueño del proyecto.

**Cada Mazo, con la mano de su juego**
- Escoba y Truco juegan con 3 cartas, Chancho Va con 4, Chinchón con 7 y Mentiroso con 8, como en la mesa de verdad.
- Las manos cortas llevan Multi de más en todos sus golpes (Escoba +4, Truco +3, Chancho Va +4): golpean menos cartas,
  pero cada golpe pesa. Las manos largas arman las jugadas grandes (Escalera, Póker).
- La tabla de JUGADAS pone en gris las jugadas que piden más cartas que tu mano.
- **Vale Cuatro** ahora premia golpear con toda tu mano (o con 5 cartas): sirve a los cinco Mazos.

**El Fogón es una apuesta**
- «Templar un naipe»: la primera pasada por el fuego es segura y le da +4 de Daño para siempre (lleva su marca en la
  mano y en el visor del Mazo).
- «Arrimar otra vez»: otros +4, con 50 % de riesgo de que se queme y salga del Mazo. Hasta 3 pasadas por Fogón.
- Descansar sigue curando el 30 % de la Vida. Ya no se quema un naipe a elección: ahora se quema el que arriesgás.

**Medido**
- Laboratorio: 29,9–30,5 % con el Altar vacío y 45,0–48,1 % con el lleno, los cinco Mazos dentro de la banda; sin
  avisos. 57 pruebas.
- Panel simulado (una tirada contra una tirada; capturas nuevas, así que entra el ruido del auditor visual):
  Aprobación 70,0 % (75,0), Críticos 35 % (55), Claridad 6,03 (6,32; p = 0,06), Diversión 7,45 (7,45), Steam Deck
  55,6 % (88,9), Móvil 86,7 % (66,7). F 183,6 contra 200,7. **No mejora y la Claridad baja al borde de lo
  significativo.** Se publica por decisión del dueño del proyecto; la causa que se pudo ver se corrige en la 0.10.0
  (las capturas de la mesa mostraban una mano de 5 por un Aumento, contra la regla de 3 que cuentan las escenas).

## 0.8.0 · El Golpe exacto, protagonista (2026-11-20)

(La 0.7.0 fue una candidata que no superó el listón: sacar los Comodines de los Mazos iniciales y dejar la Furia solo
en los Reyes empeoraba las reseñas. No se publicó.)

**Reglas**
- **Racha de exactos**: cada Golpe exacto seguido sube el premio del siguiente golpe (+1, +2 y +3 de Multi, que es el
  tope). Se corta al abatir a un enemigo sin exactitud. Se ve arriba a la izquierda («RACHA ×2»).

**Interfaz**
- La cuenta dice cuánto le queda al enemigo («le quedan 64») o cuánto te sobra («CAE · sobran 12»): buscar el exacto
  es un cálculo a la vista.
- En reposo, el centro de la mesa dice qué hacer: «Elegí cartas y arrastralas al enemigo».
- «DESCARTAR (3)» en una sola línea. La tira del HUD muestra solo lo que llevás (sin cuadros vacíos).
- A 1080p la mano usa todo el ancho (la zona de descarte aparece al arrastrar). Los caminos del Mapa se ven más.
- **Corregido:** en el móvil la Vida máxima se cortaba en el HUD («42/6» por «42/61»); venía de la 0.6.0.

**Medido**
- Laboratorio: 29,6–32,7 % con el Altar vacío y 45,2–48,3 % con el lleno; sin avisos. 54 pruebas.
- Panel simulado (una tirada contra una tirada, mismo instrumento): Aprobación 71,7 % (75,0), Críticos 30 % (55),
  Claridad 6,38 (6,32), Diversión 7,50 (7,45), Steam Deck 66,7 % (88,9), Móvil 80,0 % (66,7). F 192,8 contra 200,7:
  **dentro del ruido del instrumento** (ninguna diferencia es significativa; suben 3 pulgares y bajan 5). Se publica
  por decisión del dueño del proyecto de avanzar hasta la 0.10.0 y porque corrige un error del móvil.

## 0.6.0 · El Bufón vivo y el Mapa que sube (2026-11-20)

Tres decisiones del dueño del proyecto, más un pulido guiado por la auditoría visual. (Las 0.4.0 y 0.5.0 fueron
candidatas que no superaron el listón: no se publicaron. Ver `MEMORIA_EVOLUTIVA.md`.)

**El Bufón vivo**
- Te sigue pantalla por pantalla: al cambiar de pantalla se esfuma en una nube de humo (con su «puf») y reaparece en
  la siguiente (con su cascabel). Está también en Mazos, Altar, Colección, Crónica y Ajustes, asomado en la cabecera.
- Se mueve todo el tiempo: flota, respira, mece el palo y parpadea.
- Cuando habla, el bocadillo se escribe letra por letra con su voz, se queda un rato y se va. Reacciona a lo que hacés
  (elegir, saltar, comprar, descansar, quemar, mejorar en el Altar) y, si lo dejás solo, cada tanto dice algo.
- En la Pulpería va grande, centrado en su mitad, con el texto debajo. En el resto de las pantallas, también con el
  texto debajo.

**El Mapa**
- Vertical en todas las pantallas: se sube desde abajo hasta el Rey y se desplaza hacia arriba y hacia abajo.
- Red irregular: seis pisos por tramo, de 1 a 5 lugares por piso y hasta tres caminos por lugar. Ya no hay siempre
  tres opciones (hay 2, 3, 4 o 5 entradas) y ninguna forma se repite.
- El azar tiene reglas de balance, vigiladas por pruebas sobre cientos de semillas: se empieza con una Guardia; el
  último piso es Fogón o Pulpería; la Guardia Brava no aparece antes del piso 3 y siempre se puede esquivar; nada que
  no sea una Guardia se repite pegado; una bifurcación nunca ofrece dos veces lo mismo; y cualquier recorrido tiene
  entre 3 y 5 combates antes del Rey.
- La Corte se recalibró para el Mapa nuevo (un piso más y descanso asegurado antes de cada Rey).

**Sin tiers**
- Las piezas ya no enseñan `S / A / B`: se eligen por lo que hacen. Queda la etiqueta `★ SINERGIA` con su línea. La
  nota del laboratorio pasa a ser interna (la usa el bot que certifica el balance).

**Pulido guiado por la auditoría visual**
- «DESCARTAR» dice «quedan N» en claro y con aire. La tira del HUD respira. A 1080p la mano entera queda a la vista.
- El Comodín lleva su nombre en el naipe. La marca de Inmune va al pie de la carta y no tapa el dibujo.
- El texto de las tarjetas va sobre una placa lisa y la trama de fondo es más rala. Más aire entre renglones en
  bocadillos, en la tabla de JUGADAS y en «LO QUE LLEVÁS». El visor del Mazo muestra los naipes a escala entera.
- «SEGUIR» con marco claro cuando no es la acción principal. Los niveles del Altar que faltan se distinguen.

**Medido**
- Laboratorio: 29,7–32,5 % con el Altar vacío y 45,3–48,3 % con el Altar lleno; sin avisos. 14–17 minutos por partida.
- Puertas: 53 pruebas (dos nuevas para el Mapa y una que vigila que no vuelvan los tiers), QA visual ES y EN (108
  capturas, 0 fallos), humo con una comprobación nueva del Bufón, 60 FPS.
- Panel simulado (`pulso-60`, las dos con el mismo instrumento): Aprobación 75,0 % (Campeón 66,7), Críticos 55 % (40),
  Claridad 6,32 (6,30), Diversión 7,45 (7,43), Steam Deck 88,9 % (88,9), Móvil 66,7 % (66,7). F 200,7 contra 181,5.

## 0.3.0 · La mano se lee de un vistazo (2026-11-20)

**Hipótesis.** Lo que más bajaba el pulgar en el móvil y en Steam Deck era no reconocer las cartas ni ver dónde está
el foco; y en todas partes, no saber qué copia el Comodín.

**Interfaz**
- **Móvil: la mano va en dos filas.** Ninguna carta tapa de costado a otra; de las de atrás asoma la parte de arriba,
  con su número y el comienzo de sus pintas. El naipe del enemigo asoma por detrás de su barra de Vida para hacerle
  lugar.
- **El Comodín muestra lo que copia**: al elegirlo con otras cartas, lleva arriba el número y el palo. Lo mismo con el
  Engaño de El Mentiroso.
- **Foco del mando y del teclado**: marco claro, halo dorado y la carta enfocada un punto más grande. Al entrar a un
  combate con mando, el foco va solo a la mano.
- Botones de 48 px o más. «DESCARTAR» dice debajo cuántos quedan («quedan 3»). Las cifras de Vida del enemigo van
  sobre una placa oscura. Más aire entre las líneas del bocadillo del Bufón.
- Reglamento: Inmune y Furia redactados en una frase cada uno; el Comodín dice que necesita otra carta a su lado.

**Puertas**
- Dos estados nuevos con el foco a la vista (`mesa-mando`, `mapa-mando`): 108 capturas por idioma, 0 fallos. La QA
  visual mide ahora las filas de la mano y el foco (marco, halo, escala).

**Medido**
- Laboratorio: sin cambios de reglas (el informe de la 0.2.0 sigue vigente).
- Panel simulado (`pulso-60`, una tirada contra la media de tres del listón de la 0.2.0): Aprobación 76,7 % (63,3),
  Críticos 50 % (30), Claridad 6,28 (6,32), Diversión 7,45 (7,34), Steam Deck 77,8 % (59,3), Móvil 80,0 % (71,1).
  F 204,98 contra 177,24.

## 0.2.0 · La mesa se toca y se entiende (2026-11-20)

**Hipótesis.** Las reseñas bajaban por fricción de lectura y de toque, no por el diseño: si cada cosa que se toca mide
lo que debe y cada regla que se aplica se ve en la mesa, sube la Claridad.

**Reglas**
- Una regla menos: los Oros pagan oro y nada más (fuera la salpicadura al enemigo que espera).
- Chinchón sube a 63 de Vida y Chancho Va a 57 (los sellos se volvieron a medir y el balance se recertificó).

**Interfaz**
- **Tabla de JUGADAS** en la mesa (botón «?» o tecla J): las jugadas con su Daño y su Multi, la que tenés elegida
  resaltada, lo que hace cada palo, la regla de Inmune y la del Comodín.
- **«LO QUE LLEVÁS»**: la tira de iconos del HUD es ahora un solo botón que abre la lista de tus Amuletos, Cábalas,
  cargas y Bendiciones con el texto entero de cada una. Antes eran iconos de 32 px pegados entre sí.
- Las cartas a las que el enemigo es **Inmune** se oscurecen en tu mano y llevan el escudo tachado.
- **Letra de texto nueva** (DotGothic16): en la anterior el «5» se leía como una «S» y el «2» casi como un «8».
- El audio se abre con el primer clic del jugador: abrirlo al primer sonido dejaba un tirón en el primer golpe.
- Reglamento: la Furia con sus dos cifras, el Comodín sin ambigüedad.

**Puertas**
- La QA visual mide ahora lo que de verdad se puede tocar y falla por diana chica (menos de 44 px), pegada (a menos
  de 8 px) o pisada. Dos estados nuevos (`jugadas`, `piezas`): 100 capturas por idioma, 0 fallos.

**Medido**
- Laboratorio: 29,9–32,6 % con el Altar vacío y 45,0–48,7 % con el Altar lleno; sin avisos.
- Panel simulado (`pulso-60`, una tirada contra la media de tres del listón de la 0.1.0): Aprobación 60,0 % (45,6),
  Claridad 6,37 (5,98; p = 0,009), Diversión 7,33 (7,31), Críticos 30 % (30), Steam Deck 44,4 % (40,7), Móvil 66,7 %
  (53,3). F 169,07 contra 145,84. El ruido entre dos tiradas del mismo juego es de unos 13 puntos de F.

## 0.1.0 · Fundación (2026-11-19)

Primera versión de CÁBALA, en repo propio (`ifbotech/cabala`). Del proyecto anterior solo se trajo el chasis sano: el
núcleo determinista de la baraja española, la forja de pixel-art y las herramientas. Todo lo demás es nuevo.

**Reglas**
- Baraja española pura: tu Mazo va del 1 al 9 con Comodines (que copian tu carta más alta); la Corte —Sota, Caballo y
  Rey— son los enemigos, uno a la vez. `TOTAL = DAÑO × MULTI`, siempre enteros. Nueve jugadas (Carta sola, Par, Doble
  par, Flor, Pierna, Escalera, Full, Escalera de palo, Póker).
- Cada palo hace lo suyo: Espadas perforan, Bastos dan Escudo, Oros pagan y salpican, Copas curan. Cada enemigo es
  Inmune a su propio palo.
- 5 Mazos con su Personaje: Escoba (La Barrendera), Truco (El Paisano Bravo), Chinchón (La Timbera del Club), El
  Mentiroso (El Chamuyero) y Chancho Va (El Manotazo). Escoba y Truco, abiertos desde el principio.
- 4 Reyes vivos (El Caudillo, El Cacique, El Caudal, El Bacanal): 12 Bendiciones con tres niveles, 6 Pactos Duales y
  una carga por Rey con una sola regla para los cuatro. Cada Rey es además el jefe de un tramo, con su rasgo.
- El Bufón, único anfitrión: 18 Aumentos pasivos en tres niveles (Plata, Oro, Prismático con Maldiciones), 10 Cábalas
  en el Mapa y un humor que cambia cómo te trata.
- Exactamente 15 Amuletos (3 por palo y 3 Legendarios del Bufón), con sello S / A / B medido en el laboratorio.
- Mapa de tres tramos con caminos que se bifurcan (Guardia, Guardia Brava, Pulpería, Cábala, Fogón, Rey).
- Altar de 7 mejoras directas; 8 Reinados.
- Fuera, sin rastro: Sellos de Lacre, Acabados, la Manga, cartas especiales en la mano, el Tratante, el Asalto Diario,
  la Partida Guiada, el cooperativo y la toponimia medieval.

**Arte e interfaz**
- «Dark Dithered Lithography»: todo forjado por código, sin una sola imagen. Naipes con solo el número en las esquinas
  (sin mini-palo), 5 Personajes de 19 cuadros cada uno, marcos de 9 trozos, cifras dibujadas, logotipo.
- HUD inferior con el retrato vivo del Personaje, Vida, Escudo, oro, Mazo y las tiras de Amuletos, Cábalas y cargas.
- Mesa centrada: enemigo sobre el paño, Bufón que comenta, pila de la Corte, cuenta `DAÑO × MULTI = TOTAL`.
- Arrastrar y soltar para golpear y descartar, más clic, teclado y mando.
- Efectos en Canvas con doble buffer (color y luz): candil, brasas, tajo de cada palo, *hitstop*, números con gravedad,
  el naipe enemigo que se raja en dos, monedas al HUD, irrupción de los Reyes.
- Español e inglés.

**Medido**
- Laboratorio (6.000 partidas por celda): los 5 Mazos ganan 29,1–32,7 % con el Altar vacío y 45,7–48,0 % con el
  Altar lleno; el Reinado 8, 16,9–19,5 %. Partida ganada: 14–17 minutos estimados.
- Puertas: 51 pruebas, linter de pixel-art limpio, QA visual en 4 ventanas y 2 idiomas (184 capturas, 0 fallos), QA de
  humo con una partida entera por la interfaz en los dos idiomas, 60 FPS.
