# CÁBALA — Reglas
> Versión 0.12.0. Este archivo se genera con `npm run docs` a partir de los datos del motor (`src/rules`). No lo edites a mano.

*Todo es cuestión de cábala.* Roguelike de baraja española para un jugador. Elegís un Mazo, el Bufón te lleva por tres tramos de caminos y al fondo de cada uno te espera un Rey. Tu mano contra la Corte: cada golpe es **DAÑO × MULTI**.

## La baraja

Tu Mazo lleva las cartas del **1 al 9** de los cuatro palos (36) y **2 Comodines**. La Corte —**Sota (10)**, **Caballo (11)** y **Rey (12)** de cada palo— son los enemigos y nunca entran en tu mano.

| Palo | Poder |
|---|---|
| **Espadas** | Perfora: atraviesa el Escudo y lo que sobra sigue al próximo. |
| **Bastos** | Cada Basto te da Escudo. |
| **Oros** | Cada Oro paga una moneda. |
| **Copas** | Cada Copa te cura. |

Cifras: cada Basto da **2 de Escudo**, cada Copa cura **2 de Vida**, cada Oro paga **1 de oro**. El Escudo frena el Contraataque antes que tu Vida (tope 20).

**El Comodín** vale como una copia de tu carta más alta del golpe: mismo número y mismo palo. Al elegirlo, el naipe muestra qué número y qué palo copia. Necesita al menos otra carta a su lado.

## El turno

1. **Elegí cartas** de tu mano (hasta 5) que formen una jugada y **arrastralas al enemigo** (o tocá GOLPEAR). La tabla de JUGADAS está a un toque en la mesa.
2. Si el enemigo sigue en pie, **contraataca**: te pega su Ataque (⚔) más la Furia. Tu Escudo frena primero.
3. **Robás** hasta completar la mano.

Además tenés **3 descartes por combate**: descartar no gasta el turno. Solo se golpea al enemigo activo; el resto espera en la pila de la Corte.

## Daño × Multi

> **TOTAL = DAÑO × MULTI** (los dos, siempre enteros). La mesa te muestra la cuenta mientras elegís o arrastrás.

**Daño**: la base de la jugada más el número de cada carta, más lo que sumen tu Mazo, tus Amuletos y tus Bendiciones. **Multi**: el de la jugada más lo que sume, y al final lo que multiplique (×2, ×3…).

| Jugada | Cartas | Daño base | Multi |
|---|---|---|---|
| **Carta sola** | 1 carta | +0 | ×1 |
| **Par** | 2 iguales | +4 | ×2 |
| **Doble par** | 2 pares | +6 | ×2 |
| **Flor** | 3 a 5 del mismo palo | +6 | ×2 |
| **Pierna** | 3 iguales | +8 | ×3 |
| **Escalera** | 3 a 5 números seguidos | +8 | ×3 |
| **Full** | Pierna y Par | +12 | ×4 |
| **Escalera de palo** | 3 a 5 seguidos, mismo palo | +12 | ×4 |
| **Póker** | 4 iguales | +16 | ×5 |
| **Quince** | Suman 15 (Escoba) | +0 | ×1 |
| **Envido** | 2 del mismo palo (Truco) | +0 | ×2 |

### Inmune

Una sola regla: **cada enemigo es Inmune a su propio palo**: las cartas de ese palo no le hacen Daño. En tu mano se ven oscurecidas mientras ese enemigo está activo, y el Mapa te muestra de antemano los palos que te esperan.

### Golpe exacto

Abatir a un enemigo con un TOTAL **igual a su Vida** es ¡EXACTO!: cobrás **3 de oro** y tu próximo golpe lleva **+1 de Multi**. La mesa te dice cuánto le queda al enemigo o cuánto te sobra. **Racha:** cada exacto seguido sube el premio (+2 con el segundo, +3 con el tercero, que es el tope); se corta al abatir a un enemigo sin exactitud.

### Aturdido y Furia

Un enemigo **Aturdido** se salta su próximo Contraataque. La **Furia** es Ataque de más de la Corte durante un combate, y se ve sumada junto al Ataque del enemigo. Sube por dos motivos: **+1** cada turno que un Rey sigue en pie, y **+3** cada vez que se te acaba el Mazo y se baraja el Descarte.

## La Corte

| Enemigo | Vida | Ataque | Escudo |
|---|---|---|---|
| Sota (10) | 100 | ⚔ 11 | — |
| Caballo (11) | 150 | ⚔ 14 | 14 |
| Rey (12) | 230 | ⚔ 17 | — |

| Tramo | Lugar | Vida | Ataque |
|---|---|---|---|
| 1 | El Arrabal | ×1.18 | +1 |
| 2 | El Reñidero | ×3.4 | +9 |
| 3 | La Corte de Medianoche | ×9.5 | +20 |

La **Guardia Brava** (élite) tiene ×1.4 de Vida y +2 de Ataque. El **Rey** de cada tramo llega detrás de su Sota y su Caballo, con ×1.6 de Vida. Por cada Bendición suya que llevés, arranca con 5 % menos de Vida (tope 20 %).

## Los 4 Reyes

Cada Rey te corteja con Bendiciones y, si es el jefe de un tramo, te enfrenta con su rasgo. Cada uno tiene **una carga** con una sola regla para los cuatro: **cada enemigo que abatís con su palo en el golpe, +1** (si llevás algún don suyo).

| Rey | Apodo | Carga | Lo que da cada punto | Rasgo de jefe |
|---|---|---|---|---|
| El Rey de Espadas | **El Caudillo** | Filo | +1 de Daño en todos tus golpes por punto. | *Filo del Caudillo*: Su Furia sube 2 por turno y la mitad de su Contraataque atraviesa tu Escudo. |
| El Rey de Bastos | **El Cacique** | Coraza | +1 de Escudo al empezar cada combate por punto (tope 12). | *Coraza del Cacique*: Arranca con 30 de Escudo y recupera 12 por turno. Si tu golpe no le saca Vida, pega más fuerte. |
| El Rey de Oros | **El Caudal** | Fortuna | +1 de oro al ganar cada combate por punto (tope 10). | *Diezmo del Caudal*: Cada Contraataque te cobra 3 de oro, y cada moneda que te saca es +1 de Furia. |
| El Rey de Copas | **El Bacanal** | Brindis | +1 de Vida curada al ganar cada combate por punto (tope 10). | *Brindis del Bacanal*: Se cura 14 por turno; lo que no le cabe se le vuelve Furia. |

### Bendiciones

Tras cada combate de Guardia, tres Reyes ofrecen un don cada uno: te quedás con uno. Repetir un don **sube su nivel** (hasta 3). Los **Pactos Duales** solo aparecen si ya llevás un don de cada uno de sus dos Reyes.

| Bendición | Rey | Nivel 1 | Nivel 2 | Nivel 3 |
|---|---|---|---|---|
| **Degüello** | El Caudillo | El enemigo que queda con 12 % de Vida o menos, cae. | El enemigo que queda con 16 % de Vida o menos, cae. | El enemigo que queda con 20 % de Vida o menos, cae. |
| **Punta y hacha** | El Caudillo | Uno de cada 4 golpes es Crítico: ×2 de Multi. | Uno de cada 3 golpes es Crítico: ×2 de Multi. | Uno de cada 2 golpes es Crítico: ×2 de Multi. |
| **Primera sangre** | El Caudillo | +8 de Daño en tu primer golpe contra cada enemigo. | +12 de Daño en tu primer golpe contra cada enemigo. | +16 de Daño en tu primer golpe contra cada enemigo. |
| **Empalizada** | El Cacique | Cada carta de Bastos da +1 de Escudo más. | Cada carta de Bastos da +2 de Escudo más. | Cada carta de Bastos da +3 de Escudo más. |
| **Contragolpe** | El Cacique | Si tu Escudo frena entero un Contraataque, el enemigo recibe 10 más tu Coraza. | Si tu Escudo frena entero un Contraataque, el enemigo recibe 16 más tu Coraza. | Si tu Escudo frena entero un Contraataque, el enemigo recibe 22 más tu Coraza. |
| **Palo y palo** | El Cacique | +1 de Daño por cada 2 de Escudo que tengas. | +2 de Daño por cada 2 de Escudo que tengas. | +3 de Daño por cada 2 de Escudo que tengas. |
| **Interés compuesto** | El Caudal | Al ganar un combate: +1 de oro por cada 10 que tengas (tope 5). | Al ganar un combate: +1 de oro por cada 8 que tengas (tope 7). | Al ganar un combate: +1 de oro por cada 6 que tengas (tope 9). |
| **Peso fuerte** | El Caudal | +1 de Multi por cada 40 de oro en tu bolsa (tope +2). | +1 de Multi por cada 30 de oro en tu bolsa (tope +2). | +1 de Multi por cada 25 de oro en tu bolsa (tope +2). |
| **Taba cargada** | El Caudal | Cada turno tirás un dado: tu golpe suma 2 × el dado de Daño. | Cada turno tirás un dado: tu golpe suma 3 × el dado de Daño. | Cada turno tirás un dado: tu golpe suma 4 × el dado de Daño. |
| **Copa rebosante** | El Bacanal | Cada 4 de curación que no te cabe en un golpe: +1 de Multi a ese golpe. | Cada 3 de curación que no te cabe en un golpe: +1 de Multi a ese golpe. | Cada 2 de curación que no te cabe en un golpe: +1 de Multi a ese golpe. |
| **Sangre por sangre** | El Bacanal | Con tu Vida al 50 % o menos: +1 de Multi. | Con tu Vida al 50 % o menos: +2 de Multi. | Con tu Vida al 50 % o menos: +3 de Multi. |
| **Otra ronda** | El Bacanal | Cada carta de Copas cura +1 más. | Cada carta de Copas cura +2 más. | Cada carta de Copas cura +3 más. |
| **Hoja y broquel** | El Caudillo + El Cacique | Cada Golpe exacto: +5 de Escudo y +1 de Filo. | — | — |
| **Filo dorado** | El Caudillo + El Caudal | +1 de Daño por cada 5 de oro que tengas (tope +12). | — | — |
| **Sangría** | El Caudillo + El Bacanal | Cada enemigo abatido te cura 3. | — | — |
| **Peaje** | El Cacique + El Caudal | Cada Contraataque que tu Escudo frena entero: +2 de oro. | — | — |
| **Rescoldo** | El Cacique + El Bacanal | Al ganar un combate, cada 2 de Escudo que te queda te cura 1. | — | — |
| **Convite** | El Caudal + El Bacanal | Al ganar un combate: +1 de Vida máxima por cada 15 de oro (tope +3). | — | — |

## Amuletos

Exactamente **15**: tres por palo (uno Común, uno Raro, uno Épico) y tres del Bufón, todos Legendarios. Llevás hasta **4** (uno más con el Altar). Salen de la Guardia Brava, de los Reyes y de la Pulpería.

| Amuleto | De | Rareza | Efecto | Precio |
|---|---|---|---|---|
| **Cuchillo criollo** | Espadas | Común | +3 de Daño por cada carta de Espadas del golpe. | 10 |
| **Facón de plata** | Espadas | Raro | Abatir a un enemigo con Espadas en el golpe: +1 de Multi en tu próximo golpe. | 16 |
| **Lanza del Caudillo** | Espadas | Épico | Todos tus golpes Perforan, y lo que sobra pasa ×2 al siguiente. | 24 |
| **Rebenque** | Bastos | Común | +3 de Daño por cada carta de Bastos del golpe. | 10 |
| **Boleadoras** | Bastos | Raro | Golpe con 2 o más Bastos: el enemigo queda Aturdido (una vez por enemigo). | 16 |
| **Poncho del Cacique** | Bastos | Épico | Con 6 o más de Escudo: +2 de Multi. | 24 |
| **Moneda falsa** | Oros | Común | +3 de Daño por cada carta de Oros del golpe. | 10 |
| **Taba** | Oros | Raro | Cada turno se tira la taba: con 4 o más, +1 de Multi. | 16 |
| **Cofre del Caudal** | Oros | Épico | +1 de Multi por cada 30 de oro que tengas (tope +2). | 24 |
| **Mate curado** | Copas | Común | +3 de Daño por cada carta de Copas del golpe. | 10 |
| **Bota de vino** | Copas | Raro | Al empezar cada combate curás 8 de Vida. | 16 |
| **Cáliz del Bacanal** | Copas | Épico | Con 80 % de Vida o más: +2 de Multi. | 24 |
| **Cascabel del Bufón** | El Bufón | Legendario | Los cantos de tu Mazo valen doble, y cada canto te deja +1 de Multi para el resto del combate. | 40 |
| **Naipe de dos caras** | El Bufón | Legendario | Nada es Inmune a tus cartas, y las del palo del enemigo pegan ×2. | 40 |
| **Cetro del Bufón** | El Bufón | Legendario | Tu primer golpe de cada combate pega ×3. Cada Golpe exacto lo vuelve a cargar. | 40 |

Las piezas no llevan nota ni nivel: se eligen por lo que hacen. Cuando una potencia tu Mazo o algo que ya llevás, la mesa le pone la etiqueta **★ SINERGIA** con una línea que dice por qué.

## Aumentos del Bufón

Son **18**, todos pasivos: jamás entran en tu mano. Se eligen de a tres en la pantalla **«ELEGÍ UNA CÁBALA»**: una de Plata al empezar, una de Oro tras el primer Rey y una Prismática tras el segundo (ahí también viven las Maldiciones: mucho poder con su precio).

| Aumento | Nivel | Efecto |
|---|---|---|
| **Seña Falsa** | Plata | Tu primer descarte de cada combate convierte tu carta más baja en un 7, para siempre. |
| **Dar de Abajo** | Plata | Robás +2 cartas en el turno 1 de cada combate. |
| **Corte de Mazo** | Plata | +1 descarte por combate. |
| **Vuelto de Más** | Plata | +4 de oro al ganar cada combate. |
| **Ser Mano** | Plata | Tu primer golpe de cada combate: +1 de Multi. |
| **Mesa Servida** | Plata | Empezás cada combate con 6 de Escudo. |
| **Carta Marcada** | Oro | Sumás un 1 de Espadas marcado: no ocupa lugar y vuelve a tu mano al jugarlo. |
| **Mano Caliente** | Oro | Cada canto de tu Mazo: +1 de Multi por el resto del combate (tope +4). |
| **Chamuyo** | Oro | La Pulpería te cobra 25 % menos y el humor del Bufón nunca baja de neutral. |
| **Retruco** | Oro | Si el enemigo sobrevivió a tu golpe anterior: +1 de Multi. |
| **Cara de Póker** | Oro | El primer Contraataque de cada combate no llega. |
| **Irse al Mazo** | Oro | Una vez por partida, el golpe que te mataría no llega y curás 30 % de tu Vida. |
| **Falta Envido** | Prismático | Al golpear con 40 % de Vida o menos: ×3 de Multi. |
| **Vale Cuatro** | Prismático | Golpes con toda tu mano (o con 5 cartas): ×2 de Multi. |
| **Baraja Cargada** | Prismático | Los 2 y los 3 de tu Mazo se vuelven 9. |
| **Pacto Garca** | Prismático · Maldición | +40 de oro ya, pero el próximo Rey arranca con +2 de Furia. |
| **Contraflor al Resto** | Prismático · Maldición | ×2 de Multi en todos tus golpes, pero perdés el 60 % de tu Vida máxima. |
| **Vender el Alma** | Prismático · Maldición | +1 carta en la mano, pero el Bufón se queda con 6 de tu Vida máxima. |

## Los 5 Mazos

| Mazo | Personaje | Vida · mano | Regla estrella | Se abre con |
|---|---|---|---|---|
| **Escoba** · Escoba del 15 | La Barrendera | 70 · 3 | Sumá 15 justo: ¡ESCOBA!, Multi ×2 y más Daño para siempre. | abierto desde el principio |
| **Truco** · Envido y Bravas | El Paisano Bravo | 81 · 3 | Mazo corto del 1 al 7: Bravas que matan y ¡ENVIDO! | abierto desde el principio |
| **Chinchón** · Pierna y Escalera | La Timbera del Club | 53 · 7 | Piernas y Escaleras de palo crecen siempre y frenan el Contraataque. | Vencé a un Rey. |
| **El Mentiroso** · Cara de Piedra | El Chamuyero | 56 · 8 | Cuatro Comodines y un Engaño por combate: mentí y cobrá. | Vencé a 3 Reyes. |
| **Chancho Va** · Mano al Centro | El Manotazo | 89 · 4 | Pasá una carta gratis por turno. Cuatro iguales: ¡CHANCHO! | Hacé un Póker (4 iguales). |

**Escoba** (¡ESCOBA!)
- Mano de 3 cartas, como en la mesa: tus golpes llevan +4 de Multi.
- Si las cartas del golpe suman 15: ¡ESCOBA!, ×3 de Multi.
- Cada Escoba deja +2 de Daño en todos tus golpes, para siempre.
- Cualquier grupo de cartas que sume 15 vale como jugada.

**Truco** (¡ENVIDO!)
- Mano de 3 cartas, como en la mesa: tus golpes llevan +3 de Multi.
- Tu Mazo va del 1 al 7, y barajarlo no sube la Furia.
- Las 4 Bravas pegan de más: 1 de Espadas +24, 1 de Bastos +20, 7 de Espadas +16, 7 de Oros +12.
- Dos cartas del mismo palo: ¡ENVIDO!, ×2 de Multi y +28 de Daño, más +1 por cada Envido ya cantado.

**Chinchón** (¡CHINCHÓN!)
- Mano de 7 cartas.
- Cada Pierna o Escalera de palo: ¡CHINCHÓN!, +3 de Daño para siempre en esas jugadas.
- Ese turno, el Contraataque te llega a la mitad.

**El Mentiroso** (¡MENTIRA!)
- Mano de 8 cartas.
- Tu Mazo lleva 4 Comodines.
- Engaño, una vez por combate: todas las cartas del golpe fingen ser tu carta más alta y nada les es Inmune.
- Si el Engaño no abate al enemigo, su Furia sube 3.

**Chancho Va** (¡CHANCHO!)
- Mano de 4 cartas, como en la mesa: tus golpes llevan +4 de Multi.
- Cada turno, descartar 1 sola carta es gratis: robás otra en el acto.
- Póker (4 iguales): ¡CHANCHO!, ×2 de Multi y el enemigo queda Aturdido 2 turnos.
- De un saque: si abatís a un enemigo de un solo golpe, el siguiente entra Aturdido.

## El camino

Tres tramos (El Arrabal, El Reñidero, La Corte de Medianoche). Cada tramo es un Mapa que **se sube desde abajo**: 6 pisos y, arriba, su Rey. La red de caminos sale de la semilla y no repite la forma: en cada piso hay de 1 a 5 lugares, y de cada uno salen hasta tres caminos hacia arriba. A veces hay dos entradas, a veces cuatro; a veces todo pasa por un solo lugar.

El azar del Mapa tiene reglas, y se cumplen siempre: se empieza con una Guardia; el último piso antes del Rey es un Fogón o una Pulpería; la Guardia Brava no aparece antes del piso 3 y siempre hay un camino que la esquiva (hay de 1 a 3 por tramo); nada que no sea una Guardia se repite pegado; una bifurcación nunca ofrece dos veces lo mismo; y cualquier recorrido de un tramo tiene entre 3 y 5 combates antes del Rey.

| Nodo | Qué pasa |
|---|---|
| **Guardia** | Combate. Al ganar, un Rey te ofrece una Bendición. |
| **Guardia Brava** | Combate duro. Paga un Amuleto. |
| **Pulpería** | Comprá Amuletos, purgá cartas, curate. |
| **Cábala del Bufón** | El Bufón te propone un truco. |
| **Fogón** | Descansá o templá un naipe al fuego. |
| **Rey** | El Rey del tramo y su guardia. |

**Pulpería** (la atiende el Bufón): Amuletos (Común 10, Raro 16, Épico 24, Legendario 40 de oro), **Purgar** una carta (8 de oro, +4 cada vez; tu Mazo no baja de 12) y **Curar** 30 % de tu Vida (8 de oro, +3 cada vez).

**Fogón**: descansar (curás 30 % de tu Vida) o **templar un naipe**, hasta 3 pasadas por el fuego. La primera es segura: +4 de Daño para siempre. La segunda (35 % de quemarlo) suma otros +4 y lo deja **Templado**: +1 de Multi cada vez que lo jugás. La tercera (50 % de quemarlo) es la **Forja Brava**: su número vale doble en el Daño. Si se quema, lo perdés. **Tras un Rey** curás 30 % de tu Vida.

### El Bufón y sus Cábalas

El Bufón es el único anfitrión del juego y un chanta. Te sigue pantalla por pantalla: se esfuma en una nube de humo y reaparece en la siguiente; lo que dice se escribe, suena y al rato se va. Además lleva un **humor** (de garca a «de tu lado»). Seguirle un truco lo sube; rechazarlo lo baja. Cuando el truco se juega a la suerte, sale bien el 50 % de las veces, ±10 puntos por cada punto de humor. Si lo rechazás estando garca, le sopla tu juego al próximo Rey (+2 de Furia).

| Cábala | Humor | Opciones |
|---|---|---|
| **Cara o cruz** | cualquiera | *Apostar 10 de oro*: Si sale bien, +15 de oro. Si no, perdés los 10. · *No juego*: El Bufón se ofende un poco. |
| **La carta tapada** | cualquiera | *Dar vuelta una*: Si sale bien, un Amuleto. Si no, −8 de Vida. · *Paso*: El Bufón se ofende un poco. |
| **Pacto de sangre** | cualquiera | *Firmar*: −6 de Vida máxima. Elegís una Bendición. · *Ni loco*: El Bufón se ofende un poco. |
| **El vale** | cualquiera | *Tomar el vale*: +15 de oro ya. El próximo Rey arranca con +3 de Furia. · *Rechazar*: El Bufón se ofende un poco. |
| **Naipes al fuego** | cualquiera | *Entregarlas*: Tus 2 cartas más bajas salen del Mazo para siempre. · *Me las quedo*: El Bufón se ofende un poco. |
| **Doble o nada** | cualquiera | *Jugar la bolsa*: Si sale bien, duplicás tu oro (tope +25). Si no, perdés la mitad. · *Guardar la bolsa*: El Bufón se ofende un poco. |
| **El naipe pintado** | cualquiera | *Pagar 6 de Vida*: Tu carta más baja se vuelve Comodín. · *Dejala así*: El Bufón se ofende un poco. |
| **Te tiro la buena** | de tu lado | *+18 de Vida*: Un trago que cura. · *+12 de oro*: De la caja de otro. |
| **Invita la casa** | de tu lado | *Elegir una Cábala*: Un Aumento del Bufón, gratis. · *Otro día*: El Bufón se ofende un poco. |
| **La apuesta trampa** | garca | *Apostar 8 de Vida*: Si sale bien, +20 de oro. Si no, −8 de Vida. La moneda está cargada. · *Rechazar*: El Bufón se ofende un poco. |

## El Altar

Ganes o pierdas, cada partida deja **Porotos** (4 por combate, 8 por Guardia Brava, 15 por Rey y 40 por ganar). Se gastan en el Altar: una sola pantalla con 7 mejoras directas.

| Mejora | Efecto | Niveles | Coste de cada nivel |
|---|---|---|---|
| **Vida Inicial** | +3 % de Vida por nivel. | 5 | 20 · 40 · 70 · 110 · 160 |
| **Oro de Arranque** | +2 de oro al empezar por nivel. | 5 | 20 · 40 · 70 · 110 · 160 |
| **Descuento en Pulpería** | Todo cuesta 3 % menos por nivel. | 5 | 20 · 40 · 70 · 110 · 160 |
| **Suerte del Bufón** | +5 % de que sus trucos te salgan bien por nivel. | 5 | 20 · 40 · 70 · 110 · 160 |
| **Poder de Reyes** | Tu primera Bendición llega con +1 carga por nivel. | 2 | 110 · 160 |
| **Hueco de Amuleto** | +1 hueco de Amuleto. | 1 | 160 |
| **Purga Barata** | Purgar cuesta 2 de oro menos por nivel. | 3 | 70 · 110 · 160 |

## Reinados

Ganar una partida abre el Reinado siguiente (hasta el 8). Cada uno suma su giro a todos los anteriores.

| Reinado | Nombre | Giro |
|---|---|---|
| 1 | Noche mansa | Las reglas de siempre. |
| 2 | Guardia doble | La Guardia tiene 10 % más de Vida. |
| 3 | Corte airada | Cada combate empieza con 1 de Furia. |
| 4 | Reyes acorazados | Los Reyes tienen 20 % más de Vida. |
| 5 | Mano corta | 1 descarte menos por combate. |
| 6 | Heridas viejas | Tu Vida máxima baja 8. |
| 7 | Guardia de noche | Toda la Corte pega +1. |
| 8 | Medianoche | Los Reyes arrancan con +3 de Furia. |
