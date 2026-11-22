# Registro de cambios

Todas las versiones publicadas de CÁBALA. Las cifras de balance son del laboratorio (`npm run analyze:meta`, bot propio);
las del panel de jugadores son **simuladas** y se dicen con su ruido.

## 0.25.0 · Lo que se paga (2026-11-22)

Las Evoluciones dejan de ser retoques de número: cada una cambia una regla y cobra su precio.

**Reglas**
- **Cada Evolución trae su maldición**, escrita en su ficha:
  - el **Facón Maldito** hace que todo golpe Perfore (la sobra pasa ×3), pero el golpe que no abate te corta 3 de Vida;
  - el **Garrote del Cacique** suma tu Escudo al Daño, pero tus Copas ya no curan: te dan Escudo;
  - el **Sol de la Timba** paga doble tus Oros, pero cada descarte te cuesta 3 de oro;
  - el **Brindis de Sangre** cura doble con tus Copas y suma +3 de Multi a cada golpe, pero cada golpe te bebe 2 de Vida.
  - Las maldiciones de Vida nunca te matan: te dejan en 1.
- **Sin Perfora, la mesa apoya sola el Golpe exacto** cuando las mismas cartas lo permiten; con Perfora, el dial elige.
- **Mesa limpia**: en el primer tramo la Escoba arranca cada combate con 10 de Escudo (las caídas del tramo 1 bajan de
  17,9 % a 8,7 %).
- El Truco trae más Envido (+40), bravas que pegan más y 56 de Vida.

**La mesa y las pantallas**
- La MALDICIÓN se lee como costo (bloque carmesí con su rótulo) en la oferta, el jackpot, la bandeja y «Lo que llevás»;
  la cuenta avisa «−N de Vida» antes de golpear y el cobro nace en su caja del HUD.
- El dial con Perfora dice qué gana y qué pierde cada lado; va en R3 y la Y es siempre DESCARTAR.
- En el teléfono la mano en reposo va entera sobre la barra del pulgar y TE PEGA tiene su columna.
- Las ayudas no tapan al enemigo, TE PEGA ni la cuenta.
- **Forja Brava**: la apuesta («50 % SE QUEMA») arriba y grande, «×2» en el momento cumbre, el naipe que baja a la fogata
  que crece y un Doble Filo con dibujo nuevo.
- Un respiro de ~600 ms tras el golpe grande antes de que pegue el Rey; la letra de lo nuevo a 18 px; el final con
  «hay más» en el teléfono y «TU ARMADO».

**Medición** · Laboratorio (3000 partidas por celda, sin avisos) · Altar vacío / lleno: Escoba 30,7 / 45,9 · Truco
28,2 / 48,1 · Chinchón 29,1 / 47,6 · Mentiroso 29,1 / 47,3 · Chancho 29,7 / 49,0 %. Jurado: Claridad 8,2 · Diversión 8,2 ·
Estética 8,3 · Veredicto 8,2. Panel **simulado** (n = 60, ruido ±10): 70,0 %, dentro del ruido; Deck 78 % (n = 9),
Móvil 80 % (n = 15); Claridad del panel 6,0.
## 0.24.0 · Que se entienda a la primera (2026-11-22)

Ronda de claridad guiada por los P0 y P1 del jurado de la 0.23.

**Reglas**
- **Lo que Perfora respeta las dos caras del Rey**: la sobra lo planta en la mitad, dice cuánto se pierde
  («SE PLANTA EN LA MITAD · N SE PIERDEN») y muestra su segunda cara.
- La Escoba trae 74 de Vida.

**La mesa y las pantallas**
- **Ninguna ayuda se abre sola** ni tapa botones, títulos o cifras del HUD; la QA lo vigila (reglas `tip-tapa` y
  `oferta-hud`). ELEGÍ UNA y el Tesoro quedan sobre el HUD, nunca encima.
- **DEJALO JUSTO**: el viejo chip EXACTO es una acción con su premio (+3 de oro y Multi al próximo, o PEGÁ CON TODO),
  al costado de lo apoyado, con la Y del mando; el Bufón la presenta una vez por partida.
- La oferta que **Evoluciona** dice por qué («con tu don de Copas») y su regla entera; la carga de Copas se llama
  **TRAGO**.
- **El resumen del final**: TU MANO ESTRELLA con piezas que el mando enfoca, tu jugada con cómo se arma, ESTA PARTIDA y
  TU MEJOR separadas, el récord nuevo que sube contando; en el teléfono el cuadro se desliza.
- **Forja Brava**: las dos mutaciones como cartas de elección grandes y una tercera pasada de 1,5 s que sale con hitstop
  y sacudida (o ceniza si se quema).
- La entrada del Rey apaga la cuenta del golpe anterior; la Cábala Negra con aro celeste de mando.
- En el teléfono, la mano de 8 no cambia de filas al elegir, el «−N» y el «+N» nacen en su caja del HUD y el chip del
  Tajo cabe en un renglón.

**Medición** · Laboratorio (3000 partidas por celda, sin avisos) · Altar vacío / lleno: Escoba 30,4 / 47,3 · Truco
28,4 / 46,6 · Chinchón 30,0 / 46,9 · Mentiroso 30,4 / 46,8 · Chancho 28,6 / 45,4 %. Jurado: Claridad 8,1 · Diversión 8,1 ·
Estética 8,2 · Veredicto 8,1. Panel **simulado** (n = 60, ruido ±10): 71,7 % (IC95 59–82 %), igual que la 0.23; Claridad
del panel 6,08.
## 0.23.0 · Otra mano ya (2026-11-22)

Tercer Salto: probar no castiga, el final te deja con ganas de volver y el Fogón se vuelve una apuesta que vale.

**Reglas**
- **Devolver en el Altar**: cada mejora reintegra entero lo que costó su nivel.
- **¡FORJA BRAVA!** duplica el naipe entero (número y temple) y deja **elegir entre dos mutaciones a la vista**.
- **El chip EXACTO** del paño: si otra manera de apoyar las mismas cartas abate con Golpe exacto, la mesa la ofrece
  (R3 o X, o un toque) y vuelve a MÁXIMO con otro.
- El Facón Maldito pasa la sobra ×3 (la Lanza, ×2); la Corte de los tramos 2 y 3 trae un poco más de Vida.

**El final y la mesa**
- **Resumen en dos capas** en la misma escena del final: la build estrella (Evoluciones, Amuletos, Bendición, tu jugada y
  tu mejor golpe) y **Qué te frenó / Próximo récord**, con el botón grande **OTRA MANO YA**.
- Las **Evoluciones** tienen dibujo propio: el jackpot muestra «antes ▶ después», no se corta en sus primeros 400 ms y
  la ficha vuela al HUD, que toma foco de mando; «Lo que llevás» muestra la forma despierta.
- El Tesoro es un **baúl de hierro** que se abre con su sonido; la Cábala Negra cose con aguja e hilo y en el teléfono
  agrupa por número; el paño queda reservado en el teléfono y la mano no salta bajo el pulgar.
- El Fósforo no se gasta si no destraba nada; el Tajo de revés ya no muestra cuatro veces el mismo número.

**Medición** · Laboratorio (3000 partidas por celda, sin avisos) · Altar vacío / lleno: Escoba 29,5 / 46,0 · Truco
29,3 / 47,5 · Chinchón 30,9 / 47,7 · Mentiroso 30,9 / 48,3 · Chancho 30,2 / 46,6 %. Jurado: Claridad 7,9 · Diversión 8,0 ·
Estética 8,1 · Veredicto 7,9. Panel **simulado** (n = 60, ruido ±10): 71,7 % (IC95 59–82 %); Deck 56 % (n = 9),
Móvil 93 % (n = 15).

## 0.22.0 · Lo que despierta en la trastienda (2026-11-22)

Segundo Salto: las piezas se transforman, el Fogón se vuelve apuesta de verdad y el mapa muestra lo que hay que ganar.

**Reglas**
- **Evoluciones**: los cuatro Amuletos de palo de rareza épica evolucionan solos cuando además llevás un don del Rey de su
  palo: el Facón Maldito, el Garrote del Cacique, el Sol de la Timba y el Brindis de Sangre. Siguen siendo 15 Amuletos.
- **¡FORJA BRAVA!**: la tercera pasada del Fogón duplica el número del naipe y le deja una mutación (Doble Filo, Roba
  Carta o Chispa de Oro).
- **La Cábala Negra**: una vez por partida, desde el segundo tramo, el Bufón cose dos naipes iguales en uno o le
  trasplanta a uno el palo de otro.
- **Tesoros a la Vista**: cofres en el mapa; tras la Élite se abren solos, tras la Guardia con candado de oro.
- Legendarios y Prismáticos con poder de verdad y un costo picante escrito en su ficha; la mesa prueba todas las maneras
  de apoyar el golpe en el paño.

**La mesa**
- El paño tiene **fila propia** de fieltro forjado, con un solo renglón de ayuda; la mano baja entera debajo y en el
  teléfono cada naipe es una diana de 44 px o más.
- El «−N» que te pegan nace junto a VIDA (y el que frena el Escudo, junto a ESCUDO); cada Chiche suena distinto.
- Jackpot de 1,2 s con fanfarria al despertar una Evolución, ficha prismática en el HUD y sello **★ EVOLUCIONA** en las
  ofertas. **TURBO**: cualquier toque corta la espera en curso.

**Medición** · Laboratorio (3000 partidas por celda, sin avisos) · Altar vacío / lleno: Escoba 29,2 / 45,1 · Truco
28,8 / 46,3 · Chinchón 31,3 / 45,8 · Mentiroso 30,0 / 48,4 · Chancho 30,9 / 46,5 %. Jurado: Claridad 7,6 · Diversión 7,9 ·
Estética 8,1 · Veredicto 7,7. Panel **simulado** (n = 60, ruido ±10): 73,3 % (IC95 61–83 %); Deck 67 % (n = 9),
Móvil 80 % (n = 15).

## 0.21.0 · La mesa de paño (2026-11-21)

Primer Salto para despegar de los juegos de cartas con puntaje: el golpe se apoya en un paño con lugares que importan, y
la mesa tiene a mano sus chucherías de pulpería.

**Las Postas del paño**
- Las cartas del golpe se apoyan en **3 a 5 Postas** (tantas como tu mano). La **Posta del Medio** pega ×2 su número; el
  naipe a la **derecha de un Comodín** recibe su **Chispa** (×2 su número); tres o más en orden creciente arman
  **Escalón** (+2 de Multi).
- **La mesa acomoda sola** la mejor disposición al elegir; se reordena arrastrando o con LB/RB y DAÑO × MULTI cambia al
  instante. Cada Posta lleva su símbolo y su ayuda corta; Medio, Chispa y Escalón están en el glosario.

**Los Chiches**
- Tres huecos **sobre la madera, a la derecha de la mesa** (nunca en la mano): Vaso de Ginebra, Dado Cargado, Fósforo de
  Fogón, Polvo de Tiza y Poroto de Yapa. Un solo uso, no gastan el turno; un clic o arrastrarlos al enemigo. En el
  teléfono, el primer toque explica y el segundo usa.
- Se compran en La Pulpería o la Corte los suelta como **Prenda** al abatir con exacto, al pelo o cantando.

**La mesa**
- El Rey entra con la **Máscara del Bufón**, una pieza propia de la forja; fichas y porotos saltan sin cruzar las cifras
  del HUD; lo que te pegan va en un carril junto a VIDA; la mano no se hunde bajo el HUD en la Deck ni en el portátil.

**Medición** · Laboratorio (3000 partidas por celda, sin avisos) · Altar vacío / lleno: Escoba 30,1 / 46,7 · Truco
30,2 / 48,2 · Chinchón 29,7 / 45,9 · Mentiroso 29,1 / 47,3 · Chancho 29,4 / 46,6 %. Jurado: Claridad 7,5 · Diversión 7,7 ·
Estética 8,0 · Veredicto 7,7. Panel **simulado** (n = 60, ruido ±10): 70,0 % (IC95 57–80 %); Deck 67 % (n = 9),
Móvil 73 % (n = 15).

## 0.20.0 · Las dos caras del Rey (2026-11-21)

Paquete dictado por el Jurado sobre la 0.19.0: Reyes que morían sin mostrar su segunda cara, un Multi de mano que
aplanaba las jugadas, números que chocaban con los cantos y un metajuego que no era un lugar.

**Reglas**
- **Cada Rey muestra sus dos caras**: en su primera cara se planta en la mitad de su Vida; el golpe que la cruza lo deja
  justo ahí y la cuenta lo avisa con el chip **SE PLANTA EN LA MITAD**.
- Multi de mano chico (Escoba 3 y ×3 en el 15), Reyes con menos Vida y Cara de Piedra plana.

**La mesa**
- Un **director de escena** ordena todo lo que vuela sobre la mesa: lo liviano cede, nada se posa sobre el naipe ni sobre
  la cuenta y el número del golpe queda dentro de la pantalla.
- El **Crítico estalla en el MULTI** con su sello ×2 en un lugar propio; la cuenta tiene alto y ancho fijos.
- Glifos A/B/Start en todos los botones y foco celeste en Botín, ofertas, Mapa y Pulpería.
- Del Botín a «ELEGÍ UNA» sin velo negro; «4 MÁS» en la bandeja; «ESTÁS ACÁ» clavado a su nodo; escudos de Inmunidad
  más grandes en la ayuda del nodo; la placa del enemigo dice el golpe neto también en reposo.

**El metajuego como lugar**
- El Altar es un rincón de adobe con su mesa de paño y cirios (una vela por nivel, un solo MEJORAR); la Colección, una
  pared con farol y fichas clavadas; la portada, Elegí tu Mazo, los Ajustes y la Crónica, sobre la mesa de tablas con vela.

**Medición** · Laboratorio (3000 partidas por celda, sin avisos) · Altar vacío / lleno: Escoba 29,7 / 47,9 · Truco
32,7 / 48,8 · Chinchón 29,3 / 45,5 · Mentiroso 29,8 / 48,6 · Chancho 29,9 / 48,7 %. Jurado: Claridad 7,7 · Diversión 7,6 ·
Estética 8,2 · Veredicto 7,7. Panel **simulado** (n = 60, ruido ±10): 76,7 % (IC95 65–86 %); Deck 78 % (n = 9),
Móvil 87 % (n = 15).
## 0.19.0 · La mesa limpia (2026-11-21)

Paquete dictado por el Jurado Fable sobre la 0.18.0: el crítico que contaba dos veces, el Botín de cinco piezas que
tapaba al Bufón, dos «TE PEGA» distintos, la mesa que saltaba en la Steam Deck y la curva de caídas despareja.

**El golpe**
- **«¡CRÍTICO! ×2» vive dentro del MULTI**: en el conteo estalla en su término, con sonido, chispas y un frenazo; ya no
  se estampa sobre un total que ya lo incluía. El número del daño sale al costado del naipe, sin tapar cara ni índice.
- **Un solo TE PEGA**: la placa del Rey y la cuenta dicen lo mismo, con la causa («21 − 2 ESCUDO») cuando entra.
- **El rasgo de cada Rey se lee con su regla** también en la primera cara («Medio golpe suyo cruza tu Escudo»). Los rasgos
  del Cacique y del Bacanal se llaman ahora **Cuero del Cacique** y **Sed del Bacanal** (no chocan con Coraza y Brindis).
- Cada palo suena distinto al golpear, y un toque o una tecla apura el conteo.

**Mesa, mando y teléfono**
- **La mesa no salta al elegir** en la Steam Deck: la cuenta reserva su alto y se aprieta en vez de crecer (la QA lo vigila
  con la regla «mesa-quieta»). El foco del mando es un marco celeste con flecha, distinto de la selección en oro.
- El cartel de la segunda cara se pliega antes de que el Rey pegue; el grito del Personaje sale junto a su retrato, con cola.
- El Botín de un Rey con cinco piezas no tapa al Bufón y la **Vida máxima tiene icono propio**. Estados de QA nuevos:
  `botin-rey` y `mesa-conteo`.

**Reglas y balance**
- **La Vida máxima que da un Rey sale de la Vida del Mazo** (20 %, mínimo 6): un +12 plano era +133 % para el Mentiroso.
- Vidas y Multi de mano reafinados; el laboratorio vigila ahora las **caídas en el tramo 1** (Escoba 17,7 · Truco 2,9 ·
  Chinchón 13,3 · Mentiroso 22,7 · Chancho 3,2 %; en la 0.18 iban de 3 a 34 %).
- Laboratorio (3000 partidas por celda, sin avisos) · Altar vacío / lleno: Escoba 31,4 / 47,1 · Truco 30,2 / 47,8 ·
  Chinchón 30,7 / 49,0 · Mentiroso 30,7 / 47,9 · Chancho 31,0 / 47,0.

**Medición** · Jurado Fable: Claridad 7,6 · Diversión 7,5 · Estética 8,0 · Veredicto 7,6. Panel **simulado** (n = 60,
ruido ±10): 70,0 % (IC95 57–80 %), contra 81,7 % de la 0.18; los intervalos se pisan.
## 0.18.0 · El golpe se descubre (2026-11-21)

Paquete dictado por el Jurado Fable sobre la 0.17.0: más suspenso en el conteo, un solo número para el Tajo, el grito
que no tapa nada, la Vida que crece con cada Rey y la Steam Deck con la mano grande.

**El golpe**
- La vista previa encabeza con su veredicto cuando abatís: **LO ABATÍS**, **¡EXACTO!** o **¡AL PELO!** (este último con
  su propio contador en la Crónica); al soltar, la fórmula sube término a término y el total cae en oro y se asienta,
  con sonido y sacudida. El total, «LE QUEDAN n» y «SOBRAN n» se siguen leyendo antes de soltar.
- **Tajo de revés con una sola fórmula**: «TE PEGA 48 (24 ×2)» en el chip y en la placa del Rey, sostenida hasta que pega.
- El naipe del Rey ordena su centro por carriles: tu golpe arriba, el cartel del Rey al medio, lo que te pega abajo.

**Reglas**
- **Cada Rey vencido sube 12 tu Vida máxima** (el Botín lo muestra y el HUD lo cobra a la vista).
- **El Mentiroso**: Cara de Piedra (empieza cada combate con Escudo, ×2 y ×3 en los tramos 2 y 3) y Vida chica.
- **Un costo de Vida máxima siempre cuesta**: los pactos, la Cábala y Heridas viejas ya no la suben ni salen gratis con
  una Vida chica; nunca la bajan de la mitad.
- La Estocada del Caudillo cambia de nombre para no confundirse con el Contraataque; la moneda del Bufón va pareja (10/10).

**Mesa, mando y teléfono**
- El grito del Personaje dura 1,2 s y busca un hueco libre: nunca sobre Vida, Escudo, Oro, la cuenta, la mano ni botones.
- **Steam Deck**: naipes de la mano a 2×, ayuda del naipe al costado, cargas rotuladas, «+N» escalonados.

**Balance** (laboratorio, 3000 partidas por celda, sin avisos) · Altar vacío / lleno: Escoba 32,1 / 47,9 · Truco
30,5 / 48,3 · Chinchón 28,2 / 48,3 · Mentiroso 31,1 / 47,0 · Chancho 30,2 / 47,1.

**Jurado Fable** (sobre la versión anterior a los dos arreglos de cierre): Claridad 7,3 · Diversión 7,4 · Estética 8,0 ·
Veredicto 7,4. El arreglo del piso de Vida máxima (su P0) y la vuelta del total a la previa (su regresión de Claridad)
entraron después del dictamen.
## 0.17.0 · La cara verdadera (2026-11-21)

Paquete dictado por los P0 y P1 del Jurado Fable sobre la 0.16.0: el Rey en segunda cara pisando la cuenta, el Tajo de
revés que castigaba sin salida, los cuatro Comunes clones, el grito sobre los controles y las pantallas sin escena.

**Los Reyes, de verdad distintos a media Vida**
- **Cada Rey tiene un dibujo propio para su segunda cara**: el Caudillo con la espada invertida y la cicatriz, el Cacique
  tras una empalizada de estacas, el Caudal con la bolsa abierta y monedas cayendo, el Bacanal con la copa que rebalsa.
  El volteo, la mesa y la rajadura final muestran ese dibujo.
- **El Tajo de revés ya no castiga la Carta sola** (con mano de 3 a veces era la única jugada). Armado, la cifra grande del
  Rey muestra el golpe real con «×2», y la regla corta queda escrita bajo su nombre mientras dure.
- El rótulo y la barra del Rey ya no pisan la cuenta en ninguna ventana; la QA visual tiene una regla que lo vigila.

**Los Amuletos comunes, cada uno con su juego**
- Los cuatro suman Daño por carta de su palo (×2 en el tramo 2, ×3 en el 3) y cada uno tiene su segunda mitad: el
  **Cuchillo criollo** pega ×2 contra un enemigo a media Vida, el **Rebenque** da Escudo de más, la **Moneda falsa** suma
  +1 de Multi con tres Oros y el **Mate curado** cura de más. La Pulpería ya no ofrece dos Comunes juntos.

**Escenas**
- **Victoria** con amanecer sobre el arrabal y los Reyes vencidos partidos en dos; **derrota** con la vela apagada y tu
  retrato rajado; **Botín** con las piezas grandes sobre la mesa; **Ajustes** con el abanico de Dorsos; **Crónica** con el
  retrato de la última partida.

**Mesa, mando y teléfono**
- El grito del Personaje sale al costado del retrato y nunca encima de un modal ni de los botones.
- Cara de Póker es un sello sobre el enemigo («NO LLEGA») y el chip dice la causa: «NO TE PEGA · Cara de Póker».
- La caída del Rey arranca enseguida: la mano y los botones se retiran en el instante en que muere el último enemigo.
- Mapa con mando: la ayuda va al costado del nodo enfocado, «ESTÁS ACÁ» se ve y el foco se centra en el rollo.
- Las cargas de los Reyes en el HUD dicen qué hacen («Filo 9: +9 de Daño en cada golpe»).
- En el teléfono bajo (390×664) la placa de lo que te pega ya no trepa a la cabecera.

**Balance** (laboratorio, 3.000 partidas por celda, con las notas que se publican): Altar vacío / lleno — Escoba 32,8 / 48,8 ·
Truco 28,3 / 48,7 · Chinchón 28,0 / 48,1 · Mentiroso 28,1 / 48,7 · Chancho Va 28,8 / 47,2. Chinchón pasa a Vida 43 con +1
de Multi en cada golpe; el Mentiroso, a 3 Comodines.

**Medición.** Jurado Fable 7,4 · 7,3 · 8,0 · 7,4 (antes 7,3 · 7,2 · 7,9 · 7,3). Panel simulado de la 0.16.0 (n = 60, ruido
±10 puntos): aprobación 75,0 % (IC95 63–84 %), F 203,3 (+8,4), claridad 6,3.
## 0.16.0 · Cambiá de plan (2026-11-21)

Paquete dictado por los P0 y P1 del Jurado Fable sobre la 0.15.0: el conteo que tapaba su propio desglose (los seis
jurados), la Furia que parecía sumable, segundas caras que no pesaban, el audio sin bus y la mesa muerta antes del botín.

**La cuenta, de una sola lectura**
- **El conteo se enciende dentro del desglose.** No hay más cartel flotante: cada término se prende en su lugar y queda
  encendido; el total sube contando y cierra en oro. Los «+N» de los naipes salen dentro de la carta, sin tapar índices.
- **Dos renglones rotulados, DAÑO y MULTI**, cada pieza con su icono, y la cura como «CURA ♥ +N». El desglose se ve
  también en el teléfono (390×664 y 360×740), compacto, con iconos y valores.
- **La cuenta tiene marco** (hierro, dorado si abate) y el ancho de su fórmula, en vez de una franja negra de lado a lado.
- **La Furia no se suma dos veces:** TE PEGA lleva al lado un chip de llama «FURIA n · ya incluida · +n por turno».
  Un solo nombre para el golpe del enemigo: «TE PEGA» (adiós «Contraataque»).
- **Glosario en JUGADAS** (Multi, Furia, Escudo, Golpe exacto, ¡Al pelo!, Racha, segunda cara, Engaño) con los números
  reales del motor. La Escoba dice ×3 en todos lados (la regla decía ×2 y JUGADAS ×1).

**Segundas caras que obligan a cambiar de plan**
- **El Caudillo · Tajo de revés:** si repetís la jugada del golpe anterior, ese turno pega ×2 y atraviesa todo tu Escudo.
  TE PEGA lo avisa antes de soltar.
- **El Cacique · Fortín:** levanta un Escudo de un cuarto de su Vida máxima y lo recupera ×2; solo las Espadas lo atraviesan.
- **El Caudal · Remate:** cada vez que te pega se lleva un cuarto de tu bolsa (mínimo 6) y cada moneda es Furia.
- **El Bacanal · Última ronda:** se cura ×2 lo que vos te curás, y su cura por turno también va ×2.
- El volteo del naipe del Rey, cartel propio, sonido propio y rótulos sobre el Rey cuando cada cara dispara.
- «¡AL PELO!» vale también con Espadas en el golpe, y se cuenta en las estadísticas de la partida.

**Sensación**
- **Audio con bus maestro y compresor**, buses de efectos y música, ruido blanco para golpes y variación de altura.
  Sonidos propios para «¡AL PELO!», la segunda cara, el Tajo de revés, el remate, el Fortín, el Diezmo y el cobro.
- **La caída del Rey encadena con el botín:** la mesa se despeja, el oro vuela al HUD contando y el botín brota al
  centro; la elección «ELEGÍ UNA» reemplaza al panel en vez de montarse encima.
- **Letra de cuerpo nueva, Bitcount Prop Single:** pixel y proporcional. Se acabaron los «Caudi l lo» y «Vida l lena».

**Steam Deck, mando y teléfono**
- Con mando no hay zona de descarte: la mano usa ese ancho (la de 8 del Mentiroso entra sin cortes).
- La bandeja del HUD va en dos filas de fichas de 42 px entre 1100 y 1699 px; la que dispara brinca con su número.
- El daño recibido sale por encima de la Vida, sin taparla. En el teléfono el Bufón ya no pisa la cabecera, SEGUIR del
  Botín y del Fogón quedan en la zona del pulgar y se puede hacer zoom (sin `user-scalable=no`).
- Las secuencias del Jurado ahora van en español y con un recorrido en modo mando; estado nuevo de QA `mesa-segunda`.

**Balance** (laboratorio, 3.000 partidas por celda, certificado con las mismas notas internas que se publican):
Altar vacío / lleno — Escoba 32,7 / 47,0 · Truco 28,2 / 45,5 · Chinchón 30,9 / 46,7 · Mentiroso 29,0 / 48,5 (antes se
escapaba a 55,8) · Chancho Va 31,0 / 48,2. Vida de los Mazos: Escoba 80, Truco 96, Chinchón 63, Mentiroso 43, Chancho 90.

**Medición.** Jurado Fable 7,3 · 7,2 · 7,9 · 7,3 (claridad · diversión · estética · veredicto; antes 7,1 · 7,0 · 7,8 · 7,1).

## 0.15.0 · La segunda cara (2026-11-21)

Paquete dictado por los P0 y P1 del Jurado Fable sobre la 0.14.0: la defensa plana, los Reyes de una sola nota, el
Bufón sin dilemas y la letra chica en Steam Deck.

**Reglas y builds**
- **La defensa escala con el tramo.** El Escudo de los Bastos, la cura de las Copas y el tope de Escudo valen ×1, ×2
  y ×3 en los tres tramos: armar un mazo defensivo ya no es tirar cartas al final del Reinado. Para compensar,
  La Corte pega más en el segundo y el tercer tramo y los Mazos tienen más Vida.
- **Golpe al pelo.** Pasarse por muy poco (hasta el 5 % de la Vida del enemigo) no cobra el premio del Golpe exacto,
  pero sostiene la racha y recarga el Cetro. La cuenta lo canta: «¡AL PELO!».
- **Amuletos comunes que crecen con su Rey:** suman Daño por carta de su palo y, además, por cada punto de carga de
  ese Rey (con tope). Peaje y Contragolpe se disparan cuando frenás al menos la mitad del golpe.

**Los cuatro Reyes, con segunda cara**
- A media Vida cada Rey cambia: el de Espadas cobra Furia si repetís la jugada (Degüello), el de Bastos recupera todo
  su Escudo una vez (Empalizada), el de Oros duplica su Diezmo (Remate) y el de Copas se cura lo que vos te curás
  (Última ronda). Un cartel grande «SEGUNDA CARA» lo anuncia y el Rey lo dice.

**El Bufón chanta**
- **Tres Cábalas nuevas con dilema:** *El soplo* (pagás para que el próximo Rey llegue herido), *Mano larga* (le robás
  a La Corte un naipe templado, y te puede costar Vida) y *Firmar a ciegas* (un pacto que se lee después).
  La moneda y el doble o nada escalan con el tramo, y el Bufón ya no repite la misma frase cuando le decís que no.

**Steam Deck y portátil**
- **Ninguna letra por debajo de 18 px** entre 1100 y 1699 px de ancho (antes 16): cuerpo 20, rótulos 24.
- **Glifos del mando** en GOLPEAR, DESCARTAR, ENGAÑO, JUGADAS y la bandeja; el juego distingue puntero, teclado y
  mando y muestra los del que estás usando. Select abre JUGADAS, LT arma el Engaño, RT abre «Lo que llevás», LB/RB
  saltan entre mano y botones y la palanca derecha desplaza listas.
- **Todo lo del enemigo se inspecciona con la cruceta**, y sus números llevan rótulo: TE PEGA, FURIA, QUEDAN N,
  INMUNE A ESPADAS. El desglose de Daño y Multi vive en una línea fija bajo la cuenta.

**Móvil**
- **La mesa cede por alto:** en 390×664, 360×740 y con muesca entran enemigo, Vida, cuenta entera, mano y botones
  sin pisarse (consultas sobre el propio alto de la mesa). La mano mide una fila o dos según las cartas.
- **El arrastre avisa a dónde va:** esquinas que laten, «SOLTÁ ACÁ» visible y la cuenta siempre a la vista; un toque
  que resbala ya no borra la selección.
- La Pulpería lleva SALIR en la barra del pulgar y la Cábala usa todo el ancho.

**Medición** (simulada y con su ruido)
- Jurado Fable, media de los seis: Claridad 7,1 · Diversión 7,0 · Estética 7,8 · Veredicto 7,1 (0.14.0: 6,5 · 7,0 ·
  7,8 · 6,8). Defecto unánime para la próxima: el cartel del conteo tapa el desglose.
- Panel pulso-60: aprobación 71,7 % (0.14.0: 63,3 %; IC95 59–82 %), Móvil 86,7 %, Steam Deck 66,7 %, claridad 6,1.

## 0.14.0 · Cada pantalla, un lugar (2026-11-20)

Primera versión dictada por el **Jurado Fable**: seis especialistas (diseño, arte, Steam Deck, móvil, jugo y novato)
que miran las capturas y las secuencias de cuadros reales, puntúan de 1 a 10 y señalan tres defectos cada uno con
archivo y línea. Sus fichas están en `.claude/agents/`, el protocolo en `.claude/jurado/PROTOCOLO.md` y los veredictos
de cada versión en `jurado/`.

**Rendimiento**
- **Cero tirones, también en frío.** El cuadro de ~120 ms al brotar «ELEGÍ UNA» era la GPU compilando sus sombreadores
  la primera vez que pintaba el modal. Ahora, al entrar a la mesa y bajo la cortina, se pinta una vez casi invisible
  una oferta de cada tipo y los efectos que estrena el golpe. La puerta de FPS pasó de tolerar 80 ms por cuadro y
  250 ms en el cambio de pantalla a **50 ms en los dos**; mide 8–23 ms.

**Escenarios y clima**
- **La mesa** es de tablas, con vela, humo y un candil que salta con cada golpe. **La Pulpería** tiene estantes,
  damajuanas y un farol que se hamaca. **El Mapa**, luna, ranchos, molinos y niebla, y el camino andado se traza con
  tinta. **El Fogón**, leños, pava y un redondel de luz que respira.
- **Cada Rey trae su clima:** relámpagos y llovizna (Espadas), hojas y esporas (Bastos), monedas que caen (Oros) y
  bruma carmesí (Copas).

**El golpe**
- **Conteo pieza por pieza.** Después de las cartas dispara cada cosa que suma (la jugada, el canto, cada Amuleto,
  Cábala y Bendición): un cartel dice su nombre y cuánto pone, su ficha del HUD pega un brinco con el número, y el
  Daño y el Multi suben a la vista. Arranca despacio y acelera; el total aparece al final y tiene su instante.
- **Peso en tres escalones:** golpe, golpazo (media Vida o más) y remate. El hitstop ahora frena de verdad la mesa
  (60, 110 y 170 ms), la escena se sacude y el Golpe exacto que mata da un fogonazo dorado.
- **La caída de un Rey es una escena:** la música calla, fogonazo blanco, su última frase bajo el naipe, lluvia de
  monedas y fanfarria. El que sigue ya no entra encimado sobre la rajadura.
- **Los Reyes hablan en pelea:** se burlan cuando te lastiman de verdad y se quejan del golpazo.

**Presencia**
- **Tres gestos nuevos en los cinco retratos:** carcajada (Golpe exacto, Rey vencido), pavor (cuando quedás en las
  últimas) y guiño (al armar el Engaño), con el cuerpo acompañando.
- El Bufón reacciona con todo el cuerpo según su expresión, y el HUD ya no parpadea al cambiar de pantalla.

**Móvil: el dedo primero**
- Al arrastrar, el descarte es el propio botón DESCARTAR (ya no una franja cruzada en el camino al enemigo) y el naipe
  va por encima del dedo. Un gesto cancelado por el sistema devuelve las cartas sin jugar.
- JUGADAS entra entera en 390 px (antes se perdía la columna Multi). El Mentiroso tiene GOLPEAR a renglón entero y
  DESCARTAR + ENGAÑO debajo. Zonas seguras de iOS.

**Menores**
- En el Fogón, con la Vida llena, «Descansar» sale apagado.
- La QA visual suma dos reglas: panel que desborda a lo ancho y rótulo de botón cortado.
- Balance: Vida de Truco 81 → 79 y de El Chancho Va 89 → 87 (el laboratorio rozaba el techo por décimas).

**Medido**
- 61 pruebas, QA visual ES y EN sin fallos, humo, FPS con el tope nuevo. Laboratorio: 28,2–31,6 % con Altar vacío
  y 45,2–48,7 % con Altar lleno, sin avisos.
- **Jurado Fable** (media de seis, contra su propio veredicto de la 0.13.0): Claridad 6,3 → **6,5**, Diversión 6,5 →
  **7,0**, Estética 7,5 → **7,8**, Veredicto 6,5 → **6,8**. Lejos del 8,5 pedido. Juzgó antes del último arreglo del
  conteo (un cartel a la vez), que era la queja de los seis.
- **Panel simulado local** (una tirada): **mide peor.** Aprobación 63,3 % (venía de 76,7), Claridad 6,37, Diversión
  7,48, Steam Deck 66,7 %, Móvil 73,3 %, F 183,5 contra 200,7 del Campeón. Nueve votos bajan y dos suben
  (p = 0,065: no llega a significativo). Quienes bajaron repiten el texto chico en portátil y Steam Deck, que es
  también el defecto número uno del jurado de Deck y va en la 0.15.0.

**Pendiente, dicho por el Jurado**
- Texto de lectura a 16 px en Steam Deck y portátil; el mando sin glifos ni gatillos; la defensa del jugador no
  escala con el tramo; mano de 3 con pocas decisiones; la mesa del móvil no cede en pantallas bajas o con muesca;
  el botín sigue siendo un panel pobre; el sonido del golpe no acompaña el peso nuevo.

## 0.13.0 · Leer a 40 cm (2026-11-20)

Primera ronda de pulido por inspección de capturas y por lo que más repite el panel simulado.

- **Corregido:** la bandeja del HUD escondía fichas de más. Las cargas y las Bendiciones, que son de otra altura, se
  contaban como «segunda fila» y se iban al «+N» aunque hubiera lugar (venía de la 0.11.0).
- En portátil y Steam Deck los iconos de la bandeja van al doble (60 px): era la queja más repetida («los iconos de
  la barra de abajo no se leen a 40 cm», 33 menciones en 60 reseñas).
- El botón de descartar muestra cuántos descartes quedan en una cifra más grande y dorada.
- El número grande de la esquina del naipe ya no toca el borde.

**Medido**
- 61 pruebas, QA visual ES y EN sin fallos, humo, 60 fps. Reglas sin cambios (el laboratorio de la 0.12.0 vale).
- Panel simulado (una tirada contra una tirada): **Aprobación 76,7 %** y **Claridad 6,40** (las más altas medidas),
  Diversión 7,52, Críticos 40 %, Steam Deck 66,7 %, Móvil 86,7 %. F 199,7 contra 200,7 del Campeón: **empate**.

## 0.12.0 · Romper el juego (2026-11-20)

Las cinco reglas de adicción que pidió el dueño del proyecto.

**Piezas que rompen el juego** (el Multi sigue siendo entero: no hay ×1,5)
- **Cetro del Bufón**: el primer golpe pega ×3 y **cada Golpe exacto lo vuelve a cargar**.
- **Cascabel del Bufón**: los cantos valen doble y **cada canto deja +1 de Multi para el resto del combate**, sin tope.
- **Naipe de dos caras**: nada es Inmune y **las cartas del palo del enemigo pegan ×2**.
- **Vale Cuatro** pasa de +3 a **×2 de Multi**; **Falta Envido**, de ×2 a **×3**.
- Para sostener el balance, los enemigos del tramo 3 tienen un 2 % más de Vida y se reajustó la Vida de cuatro Mazos.
- **El Mentiroso** tiene un Engaño por combate, como siempre dijo su texto (el número interno decía dos).

**El Fogón, en tres pasadas**
- Primera, segura: +4 de Daño. Segunda (35 % de quemarlo): otros +4 y queda **Templada** (+1 de Multi al jugarla).
  Tercera (50 %): **¡FORJA BRAVA!**, su número vale doble en el Daño.

**Se entiende mirando**
- **JUGADAS por Mazo**: arriba, el canto de tu Mazo; después, solo las jugadas que entran en tu mano. Las que piden
  más cartas quedan plegadas detrás de un botón.
- **El Comodín** elegido se dibuja como la carta que copia, en dorado y con su destello.
- **La Furia** arde detrás de las espadas del Ataque: una, dos o tres llamas.

**Jugo**
- **Conteo en cadena**: al golpear, cada carta salta con su número y una nota que sube un semitono; después lo que
  multiplica, y el total vibra. Menos de medio segundo.
- **Racha encendida**: con dos Golpes exactos seguidos se encienden el marco de la mesa y el retrato, y la música
  suma palmas y un rasgueo más agudo.
- **Ojos vivos**: el retrato sigue con la mirada la carta que arrastrás y sonríe en cuanto tu selección marca un
  Golpe exacto.

**Medido**
- Laboratorio: 29,6–31,9 % con el Altar vacío y 46,0–48,6 % con el lleno; sin avisos. 61 pruebas.
- Panel simulado (una tirada contra una tirada): Aprobación 75,0 %, Críticos 55 %, Claridad 6,33, **Diversión 7,57**
  (la más alta medida; 7,45 el Campeón, p = 0,16), **Móvil 93,3 %** (cumple su meta), Steam Deck 55,6 % (5 de 9).
  F 200,6 contra 200,7 del Campeón: **empate**. Ninguna diferencia es significativa.

## 0.11.0 · Cirugía de composición (2026-11-20)

Pedido del dueño del proyecto tras su prueba de la 0.10.0: simetría, centrado y cero espacio muerto.

**El HUD, en tres zonas**
- A la izquierda Vida, Escudo y oro llenan su mitad; en el centro exacto, el retrato; a la derecha, el Mazo y una
  **bandeja de una sola fila** con tus Amuletos, Cábalas, cargas y Bendiciones. Lo que no entra no se apila ni se
  corta: se cuenta en un «+N». Tocar la bandeja abre «LO QUE LLEVÁS».

**Todo centrado**
- El Mapa va en el eje de la pantalla; el Bufón, a un costado, ya no lo corre.
- La Pulpería: el Bufón detrás de su mostrador, pegado a las bandejas; el grupo entero, centrado.
- Colección: los 5 Mazos en una fila; cada Rey muestra debajo su rasgo y su carga; la caja abraza lo que contiene.
- Portada: el Bufón a un lado del menú y la pila de Mazos al otro.
- Los bocadillos llevan marco de pixel-art con filete de oro. En Elegí tu Mazo, Altar, Colección, Crónica y Ajustes
  el Bufón va en la escena, bajo la cabecera, con lo que dice al lado (ya no flota en la esquina).

**Menos pantallas**
- El botín pasa sobre la mesa: el oro vuela al HUD, «ELEGÍ UNA» brota sola y, elegida la última, la partida sigue.
- Altar, Colección, Crónica y Ajustes comparten solapas: se pasa de una a otra sin volver a la portada.

**Steam Deck y portátil**
- Los naipes de la mano llevan el número de la esquina más grande (28 px) donde el naipe va a escala 1.

**Medido**
- 60 pruebas, QA visual ES y EN sin fallos (112 capturas cada una; estado nuevo `coleccion-reyes`), humo con 15
  comprobaciones, 60 fps. La puerta de FPS ahora mide la ráfaga de golpes hasta que termina el combate y, aparte, el
  cambio de pantalla que sigue (tope 250 ms): en frío, abrir «ELEGÍ UNA» sobre la mesa cuesta un cuadro de ~120 ms.
- Panel simulado (una tirada contra una tirada; capturas nuevas): Aprobación 75,0 % (75,0), Críticos 50 % (55),
  Claridad 6,30 (6,32), Diversión 7,48 (7,45), Steam Deck 66,7 % (88,9), Móvil 80,0 % (66,7). F 201,2 contra 200,7 del
  Campeón: **empate** (suben 4 pulgares y bajan 4). Sube 6,7 sobre la 0.10.0, sin significación.

## 0.10.0 · Con música y con voz (2026-11-20)

Pedido del dueño del proyecto: más animaciones, música y personajes con voz.

**Música**
- Cada lugar tiene su pista, sintetizada en el navegador (sin archivos): milonga en la portada, un paseo en el Mapa,
  corcheas que empujan en el combate, galope contra los Reyes, vals criollo en la Pulpería, una guitarra lenta en el
  Fogón, campanitas en la Cábala y el Altar, y un lamento en la derrota. Ocho pistas.
- Ajustes → «Música» la apaga sin apagar los efectos.

**Voces**
- Cada uno habla con su timbre: el Bufón, los cuatro Reyes (graves, cada uno distinto) y los cinco Personajes.
- El Rey habla al entrar y al ofrecer su Bendición: su frase se escribe letra por letra con su voz. Al caer dice su
  última frase antes de que se parta el naipe.
- Tu Personaje grita desde su retrato: el canto («¡ESCOBA!»), algunos Golpes exactos, los golpes que duelen, y le
  contesta al Rey cuando entra y cuando cae.

**Animaciones**
- El canto cruza la mesa en letras grandes.
- Las pantallas entran y sus opciones brotan una tras otra; el logotipo cae y rebota; los números del HUD laten al
  cambiar; el retrato salta al gritar.
- En el Mapa, el nodo que elegís late y los demás se apagan antes de entrar.
- El Fogón está vivo: suben brasas, el fuego se mueve, el naipe templado da un fogonazo con su «+4»; al arrimarlo otra
  vez tiembla sobre las llamas mientras sube el chisporroteo, y si se quema se parte en brasas y humo.

**Claridad**
- Las pantallas de la mesa que se fotografían para la QA y el panel muestran la mano real del Mazo (3 cartas en la
  Escoba). En el móvil esa mano va en una sola fila, con las cartas enteras.
- El nombre del canto y «GOLPE EXACTO» van más grandes en la cuenta.

**Medido**
- 60 pruebas (3 nuevas, de la música: las pistas están bien escritas y el canto entona). QA de humo con 15
  comprobaciones (música, ajuste de Música y voz de los Reyes). 60 fps con la música sonando. Reglas sin cambios.
- Panel simulado (una tirada contra una tirada; capturas nuevas): Aprobación 71,7 % (75,0), Críticos 50 % (55),
  Claridad 6,15 (6,32), Diversión 7,47 (7,45), Steam Deck 66,7 % (88,9), Móvil 80,0 % (66,7). F 194,5 contra 200,7 del
  Campeón y 183,6 de la 0.9.0. **Empate dentro del ruido** con el Campeón (ninguna diferencia es significativa);
  recupera 11 puntos sobre la 0.9.0. El panel lee textos y fotos quietas: **no oye la música ni ve las animaciones**,
  así que esta versión hay que juzgarla jugando.

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
