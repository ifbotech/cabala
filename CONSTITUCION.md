# CONSTITUCIÓN DE «CÁBALA»

Esta es la **única fuente de verdad** del repositorio `ifbotech/cabala`. Todo cambio de reglas, de arte o de interfaz se
mide contra este documento; lo que lo contradiga se elimina o se consolida de raíz, nunca se parchea encima. Los
números viven en `src/rules/balance-config.json` y el reglamento (`REGLAS.md`) se genera desde el motor: aquí va lo
que el juego **es**, no sus cifras. Varias de estas reglas son además pruebas (`tests/constitucion.test.ts`).

---

## 0 · Qué es

**CÁBALA** (el mismo título en español y en inglés; subtítulo inglés *A Spanish-Deck Roguelike*) es un roguelike de
baraja española para un jugador, en pixel-art oscuro, que se juega en el navegador: `https://ifbotech.github.io/cabala/`.

- Repo propio y limpio. `ifbotech/derrumbe` queda como archivo histórico y no se copia de él nada que no sea chasis
  sano (el núcleo determinista de la baraja, la forja de pixel-art y las herramientas).
- Un solo jugador, sin servidor: sitio estático publicado en GitHub Pages bajo `/cabala/`.
- La marca sale de `src/shared/brand.ts`; nadie escribe el título a mano.
- Textos en español rioplatense y en inglés, siempre los dos.

## 1 · Reglas («simple para un gamer»)

### 1.1 Lo que CÁBALA no tiene (cero rastro en código, interfaz, Altar, Colección o pruebas)

- Sellos de Lacre, Acabados (filo de plata, templado, policromo, cristal maldito) ni Mesa de Lacre.
- La Manga (reserva lateral).
- Cartas Especiales o Trampas en la mano: en la mano solo hay naipes.
- El Tratante o cualquier pulpero genérico: **el Bufón es el único anfitrión de todo el juego**.
- Asalto Diario ni Partida Guiada aparte: se aprende jugando, con **tres comentarios cortos del Bufón** en el primer
  combate.
- Nombres medievales europeos: toda la toponimia y la jerga son de **pulpería nocturna rioplatense y corte oscura**.

### 1.2 Baraja española pura

- **Mazo del jugador**: cartas del **1 al 9** de los cuatro palos más **Comodines**.
- **Enemigos (la Corte)**: **10 Sota → 11 Caballo → 12 Rey** de cada palo. Un enemigo activo a la vez.
- **Poder natural de cada palo**: Espadas perforan (atraviesan la defensa y lo que sobra sigue), Bastos dan Escudo,
  Oros dan monedas, Copas curan.
- **Cada enemigo es Inmune a su propio palo.**
- **TOTAL = DAÑO × MULTI**, los dos siempre enteros.
- Códigos internos de palo (nadie los ve en pantalla): `S` Espadas, `C` Bastos, `D` Oros, `H` Copas.

### 1.3 El Bufón chanta y sus Aumentos

- El Bufón te lleva por los caminos del Mapa, atiende la Pulpería, comenta las jugadas en la mesa y ofrece pactos.
  Habla como un **chanta rioplatense tramposo** (señas falsas, dar de abajo, marcar el as, chamuyo, falta envido sin nada).
- Lleva un estado vivo de **humor (Afinidad)**: a veces es un garca que ayuda a los Reyes (apuestas trampa, le sopla tu
  juego al próximo Rey si rechazás su truco) y otras te tira la buena. *Todo es cuestión de Cábala.*
- **16 a 18 Aumentos del Bufón**, **100 % pasivos** (jamás entran como cartas en la mano), en tres niveles —Plata, Oro y
  Prismático (con sus Maldiciones)— y ofrecidos de a tres en la pantalla gigante **«ELEGÍ UNA CÁBALA»**, con la
  etiqueta `★ SINERGIA` cuando potencian tu Mazo o lo que ya llevás.

### 1.4 Los 4 Reyes vivos

- **Espadas · El Caudillo** (filo, ejecuciones, críticos), **Oros · El Caudal** (multiplicadores por oro, interés,
  dados), **Bastos · El Cacique** (Escudo persistente, contragolpes), **Copas · El Bacanal** (sobrecuración vuelta
  Multi, pactos de sangre).
- Te seducen con **Bendiciones que se acumulan** (cargas permanentes, visibles en vivo) y con **Pactos Duales** al
  combinar dos Reyes.
- Son **personajes vivos**: aparecen en pantalla, respiran, parpadean, llevan el aura de su color y te hablan, tanto al
  ofrecer Bendiciones como al enfrentarte de jefes (reaccionan a si aceptaste sus dones).

### 1.5 Exactamente 15 Amuletos y el oráculo nativo

- **3 Amuletos por palo** (1 Común, 1 Raro, 1 Épico) y **3 del Bufón, todos Legendarios**. Ni uno más.
- **Las piezas no enseñan tier** (ni `S / A / B` ni `S+`): decisión del dueño del proyecto del 2026-11-20, porque
  confundían. Un Amuleto, una Bendición o un Aumento se elige por lo que hace; solo lleva la etiqueta **`★ SINERGIA`**,
  con una micro-línea de 2–3 palabras, cuando potencia tu Mazo o lo que ya llevás. El laboratorio
  (`npm run analyze:meta`) sigue midiendo cada pieza con victorias reales, pero esa nota es interna: la usa el bot que
  certifica el balance y no se le muestra al jugador.

### 1.6 Los 5 Mazos y sus 5 Personajes

Cada Mazo es una fantasía mecánica única y tiene su Personaje jugable, con retrato animado en el HUD:

1. **Escoba** (Escoba del 15) · *La Barrendera*: los golpes que suman 15 justo cantan **¡ESCOBA!**.
2. **Truco** (Envido y Bravas) · *El Paisano Bravo*: mazo corto del 1 al 7, las 4 Bravas y **¡ENVIDO!**.
3. **Chinchón** (Pierna y Escalera) · *La Timbera del Club*: Piernas y Escaleras de palo que escalan y cantan
   **¡CHINCHÓN!**: cortás la mano y lo que te queda sin jugar es Escudo.
4. **El Mentiroso** (Cara de Piedra) · *El Chamuyero*: Comodines de más y el **Engaño**.
5. **Chancho Va** (Mano al Centro) · *El Manotazo*: ciclado frenético, **¡CHANCHO!** y golpes que aturden.

**Escoba y Truco están abiertos desde el minuto 0**; los otros tres, con hitos cortos y claros.

### 1.7 El Altar

Una sola pantalla oscura con **6 a 8 mejoras incrementales directas**, cada una con su barra de niveles, su coste y un
botón grande **MEJORAR**. Sin árbol, sin zoom, sin desplazamiento, sin paredes de texto.

### 1.8 Balance certificado

`balance-config.json` se calibra con `npm run analyze:meta`: los 5 Mazos ganan **28–33 %** con el Altar vacío y
**45–49 %** con el Altar lleno (Reinado 1, bot del laboratorio). Si cambian las reglas, las pruebas exigen volver a
certificar (la huella del informe tiene que coincidir).

### 1.9 La mesa: Postas del paño y Chiches (0.21.0)

- **Postas del paño.** Los naipes elegidos se apoyan en **3 a 5 Postas** (tantas como entran en un golpe). La **Posta
  del Medio** pega doble el número de su naipe; el naipe a la **derecha de un Comodín** recibe su número otra vez (la
  **Chispa**); tres o más naipes en orden estrictamente creciente de izquierda a derecha arman **Escalón** (+2 de Multi
  fijo). Al elegir las cartas, la mesa las acomoda sola en la mejor disposición; se reordenan arrastrando o con LB/RB y DAÑO × MULTI se actualiza al instante. Cada Posta lleva su símbolo
  y una ayuda de 3–4 palabras.
- **Chiches.** Tres huecos sobre la madera, en el borde de la mesa y **nunca en la mano**: Vaso de Ginebra, Dado
  Cargado, Fósforo de Fogón, Polvo de Tiza y Poroto de Yapa. Son de un solo uso, no gastan el turno y se usan con un
  clic o arrastrándolos al enemigo. Se compran en La Pulpería o se le roban a la Corte como **Prenda** al abatir con
  Golpe exacto, al pelo o cantando.

### 1.10 Evoluciones, Forja Brava, Cábala Negra y Tesoros (0.22.0)

- **Evoluciones.** Siguen siendo exactamente 15 Amuletos: los cuatro Épicos de palo evolucionan solos cuando además
  llevás un don del Rey de su palo. La Lanza se vuelve el **Facón Maldito** (Espadas), el Poncho el **Garrote del
  Cacique** (Bastos), el Cofre el **Sol de la Timba** (Oros) y el Cáliz el **Brindis de Sangre** (Copas). Suman, no
  duplican. Al despertar hay un jackpot de 1,2 s que se salta con cualquier input; en el HUD llevan un ícono prismático
  y en «ELEGÍ UNA» y La Pulpería la pieza que despierta una lleva el sello **«★ EVOLUCIONA»**.
- **Forja Brava.** El Fogón tiene tres pasadas: +Daño, Templada (+Multi al jugarla) y **¡FORJA BRAVA!**, que duplica el
  naipe entero (su número y su temple) y le deja la mutación que elegís entre dos a la vista (desde la 0.23): **Doble Filo** (+Multi, pero te corta Vida), **Roba Carta** (robás
  una al jugarla) o **Chispa de Oro** (paga oro al jugarla). Cada pasada arriesga más: el Fogón es apuesta.
- **Cábala Negra.** Una vez por partida, desde el segundo tramo, el Bufón cose naipes en la trastienda: **coser dos
  iguales** (dos del mismo número se vuelven uno que junta lo suyo y pega más) o **trasplantar** (el primero se
  sacrifica y el segundo toma su palo y lo que le dejó el fuego). Se elige en la misma escena, sin pantalla nueva.
- **Tesoros a la Vista.** El mapa muestra de antemano algunos nodos con cofre: tras la Élite se abre solo; tras la
  Guardia, con candado de oro. Adentro hay dos Amuletos de los buenos para elegir uno.
- **Contrapesos.** Los Legendarios y Prismáticos tienen poder de verdad y un costo picante y claro, escrito en su
  propia ficha (110 caracteres como máximo).
- **TURBO.** Ninguna animación bloquea el input: el siguiente toque la corta.

### 1.11 El Altar devuelve, el acomodo EXACTO y el resumen en dos capas (0.23.0)

- **Devolver.** Cada mejora del Altar tiene su botón «Devolver», que reintegra entero lo que costó el nivel: probar no
  castiga.
- **EXACTO.** La mesa acomoda sola el golpe que más pega; si otra manera de apoyar esas mismas cartas abate con Golpe
  exacto, lo ofrece con un chip **EXACTO** que se elige con un toque o un botón. El paño es el dial del exacto.
- **Resumen de la partida** en la misma escena del final, en dos capas: **Build Estrella** (Evoluciones, hasta tres
  Amuletos, la Bendición y la jugada que más usaste, el mejor golpe) y **Qué te frenó / Próximo récord**, con un botón
  grande **OTRA MANO YA**.

### 1.12 Las Evoluciones malditas, DEJALO JUSTO y Mesa limpia (0.25.0)

- **Cada Evolución cambia una regla y trae su maldición**, escrita en su ficha: el **Facón Maldito** hace que todo
  golpe Perfore (la sobra pasa ×3), pero el golpe que no abate te corta Vida. El Garrote, el Sol y el Brindis se
  rehicieron en la 0.26.0 (ver 1.13). Las maldiciones de Vida nunca te matan: te dejan en 1.
- **DEJALO JUSTO.** Sin Perfora lo que sobra no va a ningún lado: si las mismas cartas abaten con Golpe exacto apoyadas
  de otra manera, la mesa las apoya así sola. Con Perfora, la elección queda en el dial (exacto o pegar con todo).
- **Mesa limpia.** En el primer tramo la Escoba, el Mazo de entrada, arranca cada combate con Escudo: el primer
  contacto no castiga.

### 1.13 Tres Evoluciones rehechas, el Chancho que canta y el Chinchón que cubre (0.26.0)

- **Garrote del Cacique**: tu Escudo suma ×2 al Daño, pero el golpe que no abate gasta la mitad de tu Escudo (las Copas
  vuelven a curar). **Sol de la Timba**: Oros dobles, Multi por oro y, con oro, los descartes no se acaban; cada
  descarte cuesta oro. **Brindis de Sangre**: +1 de Multi por cada 10 % de Vida que te falta, y cada golpe te bebe Vida.
  El premio va en la regla; la MALDICIÓN dice sólo el costo.
- **Chancho Va**: la Pierna (tres iguales) también canta ¡CHANCHO! y aturde 1 turno; el Póker aturde 2.

### 1.14 ¡CHINCHÓN! corta la mano (0.27.0)

- **Chinchón**: cada Pierna o Escalera de palo canta ¡CHINCHÓN! y **corta la mano**: cada carta que te queda sin jugar
  te da Escudo (crece con el tramo, como los Bastos). Jugar corto cubre más; jugar largo pega más. Ya no anula el golpe
  del enemigo: ese premio (Aturdir) es del Chancho Va.
- El laboratorio juega el **Sol de la Timba**: el bot paga descartes con oro cuando el golpe es flojo o no canta, y el
  balance se certifica con esa regla en juego.

### 1.15 El Envido que escala y un laboratorio que cuenta (0.28.0)

- **Truco**: el Daño del ¡ENVIDO! crece con el tramo (×2 y ×3), como los poderes de palo: el golpe del Truco ya no
  arranca doblando al de los demás Mazos ni se apaga en el tramo 3.
- El informe del laboratorio cuenta, por Mazo, cuántas partidas terminan con una Evolución despierta y cuánto oro se
  paga en descartes del Sol de la Timba.

### 1.16 Evoluciones que se ganan, Envido que se canta y maldiciones distintas (0.29.0)

- **Las Evoluciones despiertan con cuatro niveles de dones** del Rey de su palo (dos dones de nivel 2, uno de nivel 4…):
  son un premio de media partida, no el estado normal del Épico (el laboratorio mide 47–58 % de partidas con una
  despierta; antes, 85–94 %).
- **Cada maldición cobra por algo distinto.** Facón: el golpe que no abate te corta Vida. Garrote: el golpe sin Bastos
  gasta la mitad de tu Escudo. Sol: cada descarte cuesta oro. Brindis: tus Copas ya no te curan.
- **Truco**: el ¡ENVIDO! pide dos cartas del mismo palo que sumen 8 o más.
- **Chancho Va**: el ¡CHANCHO! que abate no pierde su Aturdido (lo recibe el enemigo que entra), y «de un saque» vale
  también cuando remata el Degüello.
- **Al pelo**: pasarte por hasta el 10 % de la Vida máxima del enemigo paga 1 de oro y sostiene la racha.

## 2 · Dirección de arte: «Dark Dithered Lithography»

**La vara es la de los 5 Dorsos.** Vale para todas las pantallas y componentes.

- **Prohibido**: pantallas beige, `border: 2px solid #000`, cajas blancas con letra de sistema, tono «cutie» o infantil.
- **Tramado matemático real** (Bayer 2 × 2 y 4 × 4, a celda entera) y **paleta híper-saturada**. Fondo nocturno
  `#09070F → #160C1C → #24112B` con viñeta tramada a luz de candil.
- **Naipes españoles** de 96 × 140 celdas lógicas, sin suavizado: papel hueso `#F4EFE2` con canto tramado `#D9CEB4`,
  recuadro fino con las pintas reales del palo (Oros línea continua, Copas 1 corte, Espadas 2, Bastos 3).
- **Sin mini-palo debajo del número**: en las dos esquinas opuestas va solo el número, nítido.
- **Rampas eléctricas** con corrimiento de matiz hacia el índigo `#120A24`: Espadas `#1440B8 → #00C8FF → #B8F6FF`,
  Bastos `#0B5E28 → #22D95B`, Oros `#FF7B00 → #FFD500 → #FFF799`, Copas `#7A0026 → #FF1453`.
- **Tono pícaro, oscuro e inquietante**: el Bufón de máscara de marfil afilada; Reyes severos; los 5 Personajes, al
  nivel de los Reyes y de los Dorsos, en varios cuadros expresivos.
- **Interfaz 100 % forjada en pixel-art**: marcos de 9 trozos (madera oscura, hierro, oro) para botones, bocadillos y
  tarjetas; barra de Vida y Escudo del enemigo, emblema de Ataque `⚔ N` (late y tiembla cuando es inminente) y sello
  heráldico de `INMUNE`, todos sprites integrados sobre el paño.
- Las escalas de los sprites son **siempre enteras**. Luz de arriba a la izquierda; sin contorno negro en las
  ilustraciones, sin sombreado de almohada, sin bandas, sin píxeles huérfanos (`scripts/pixel-lint.ts`).

## 3 · UX: centro de pantalla, HUD abajo, sensación de videojuego

**Regla de oro: mínimo texto, máxima lectura visual. Mirando el centro de la pantalla se entiende todo.**

- **HUD inferior** cincelado (madera, hierro, oro): en el centro, el **retrato animado del Personaje** (mira a los lados,
  se lastima según la Vida que queda, sonríe feroz al clavar ¡Escoba! / ¡Envido! / ¡Chancho! / Golpe exacto, hace una
  mueca al recibir el Contraataque); a sus lados, **VIDA, ESCUDO, ORO, MAZO** y la tira de Amuletos, Aumentos y
  Bendiciones con sus cargas, todo inspeccionable con el cursor o el foco.
- **Mesa centrada**: el enemigo activo, grande, flotando sobre el paño tramado; el Bufón vivo a la izquierda, con
  bocadillos cortos; la pila real de la Corte que queda, a la derecha.
- **Cuenta auto-explicativa**: al elegir o arrastrar cartas, `DAÑO X × MULTI Y = TOTAL` con el canto del Mazo. En
  reposo, silencio visual.
- **Arrastrar y soltar de verdad**, más clic, teclado y mando: una carta o el grupo elegido se arrastra sobre el
  enemigo (con halo de destino) para golpear, o al descarte para descartar. Siguen los botones **GOLPEAR** y
  **DESCARTAR** junto a la mano.
- **Mano en fila respirada**: cartas grandes, física de resorte, micro-flotación desfasada, inclinación al cursor.
- **Macro-flujo**: portada y elegir Mazo (los 5 Dorsos con el retrato de su Personaje, la regla estrella en una línea de
  12 palabras como mucho, Reinado 1…8 y un **JUGAR** monumental) → Mapa ramificado que se desplaza, presentado por el
  Bufón (Guardia, Élite, Pulpería, Cábala del Bufón, Fogón, Rey) → Botín en lista y **«ELEGÍ UNA»** en un modal gigante
  con 3 opciones y Saltar → Pulpería atendida por el Bufón, con bandejas y precios grandes.
- **Vida ambiental a 60 FPS** (Canvas, doble buffer de color y luz): brasas, candil que respira, Bufón que mece el
  cetro y parpadea, retrato vivo, cartas que flotan, `⚔` que late. **Coreografía de combate**: reparto desde el Mazo,
  las cartas convergen al centro, el tajo del palo, *hitstop* de 65 ms, sacudida medida, números con gravedad y el
  naipe enemigo que se raja en dos mitades soltando monedas hacia el HUD.
- **Micro-escenas** de 0,8 a 1,5 s, saltables con un clic: entrada del combate, irrupción de un Rey con su aura,
  aparición del Bufón cuando una Cábala hace de las suyas.
- Se respeta **Reducir movimiento** y hay un **modo foto** determinista para la QA visual.
- Tipografía de 14 px como mínimo; dianas de 44 px (48 en la barra del pulgar del móvil); cero recortes en
  1920 × 1080, 1366 × 768, 1280 × 800 y 390 × 844, en los dos idiomas.

## 4 · Puertas, publicación y bucle evolutivo

Antes de publicar cualquier versión, todo en verde:

| Puerta | Orden |
|---|---|
| Tipos | `npm run typecheck` |
| Pruebas (constitución incluida) | `npm test` |
| Forja y linter de pixel-art | `npm run forja` · `npm run pixel-lint` |
| Laboratorio de balance | `npm run analyze:meta` |
| QA visual, ES y EN, 4 ventanas, 0 fallos | `npm run qa:visual` · `npm run qa:visual -- --lang=en` |
| QA de humo (arrastrar para atacar, HUD) | `npm run qa:smoke` |
| 60 FPS | `npm run qa:fps` |
| Construcción | `npm run build:web` |

- **Inspección con ojos propios**: antes de publicar se abren al menos 12 capturas reales (portada, elegir Mazo, Mapa,
  mesa, mesa arrastrando, Elegí una, Pulpería, Altar, Colección, Crónica, Steam Deck 1280, móvil 390) y se auditan
  contra la vara de los Dorsos.
- **Publicación**: commit limpio, etiqueta `vX.Y.Z`, `git push origin main --tags`, y se verifica que Pages quede en
  verde sirviendo esa versión.
- **Bucle evolutivo** con el panel simulado (`../panelAgentesGaming`, `escenas_cabala.py`, guardia de honestidad: solo
  hechos y cifras): línea base con el listón promediado de 2–3 placebos nulos, una hipótesis cohesiva por versión, y se
  publica solo lo que pasa todas las puertas y mejora al Campeón. Metas norte: **Aprobación ≥ 85 % · Claridad ≥ 8,0 ·
  Diversión ≥ 8,4 · Críticos ≥ 60 % · Steam Deck ≥ 85 % · Móvil ≥ 85 %**. Cada versión publicada se anota en
  `CHANGELOG.md` y en `MEMORIA_EVOLUTIVA.md`.

## 5 · Cómo se trabaja aquí

- Todo corre **en primer plano y con tope duro** (`node scripts/con-tope.mjs <segundos> …`; cada script de puertas lleva
  su `guardian`). Nada de procesos en segundo plano ni de esperar archivos de señal.
- Los números no se tocan a ciegas: primero el laboratorio rápido (`npm run analyze:meta -- --fast`), después el
  completo. Lo que propone el panel simulado se mide antes de aplicarlo.
- El panel es **simulado**: se dice siempre, con su ruido.
- Inspiraciones de diseño (mesa centrada con anfitrión, dones que escalan, barra de estado con
  retrato): son mecánicas y estructuras de género. **Ningún nombre, texto, personaje ni arte de otro juego entra en
  CÁBALA**: todo el arte es original y se forja por código.

## 6. Decisiones del dueño del proyecto (2026-11-20)

Lo que sigue lo pidió el dueño del proyecto después de jugar la 0.3.0, y manda sobre lo que diga más arriba:

- **Sin tiers a la vista.** Las piezas no enseñan `S / A / B`; solo la etiqueta `★ SINERGIA`.
- **El Bufón vivo.** El anfitrión está en todas las pantallas y te sigue: al cambiar de pantalla se esfuma en una nube
  de humo y reaparece en la siguiente, con su sonido; se mueve todo el tiempo (flota, respira, parpadea); cuando
  habla, el bocadillo aparece, suena y después se va; reacciona a lo que hacés y, si lo dejás solo, cada tanto dice
  algo. En la Pulpería va grande, centrado en su mitad, con el texto debajo.
- **El Mapa es vertical.** Se sube desde abajo hasta el Rey y se navega hacia arriba y hacia abajo. La red de caminos
  es irregular (no siempre tres opciones) y su azar está domado por reglas de balance que vigilan las pruebas
  (`REGLAS_MAPA` en `src/rules/mapa.ts`).
- **Cada Mazo, con la mano de su juego.** Escoba y Truco 3 cartas, Chancho Va 4, Chinchón 7, El Mentiroso 8. Las
  manos cortas se compensan con Multi; los Amuletos y Aumentos tienen que servirle a todas las manos.
- **El Fogón es una apuesta.** Templar un naipe es seguro la primera vez; arrimarlo otra vez lo mejora o lo quema.
- **Con música y con voz.** Cada lugar tiene su pista sintetizada (con su ajuste propio); el Bufón, los Reyes y los
  Personajes hablan cada uno con su timbre; lo que pasa en la mesa se anima.
