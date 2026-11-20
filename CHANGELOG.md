# Registro de cambios

Todas las versiones publicadas de CÁBALA. Las cifras de balance son del laboratorio (`npm run analyze:meta`, bot propio);
las del panel de jugadores son **simuladas** y se dicen con su ruido.

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
