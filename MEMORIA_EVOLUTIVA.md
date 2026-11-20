# Memoria evolutiva de CÁBALA

Lo que se probó, lo que funcionó y lo que no, versión por versión. Sirve para no repetir errores y para saber por qué
cada cosa está como está. Las mediciones del panel de jugadores son **simuladas** (modelos de lenguaje con capturas y
reglas): orientan, no demuestran.

## Punto de partida

CÁBALA nace el 2026-11-19 como repo nuevo. Viene de un proyecto anterior (cuarenta versiones de otro juego de naipes)
del que se aprendió, sobre todo, esto:

- Pulir sin simplificar no mueve la aguja: siete versiones de pulido dejaron la aprobación simulada donde estaba; el
  único salto claro llegó al **quitar reglas**.
- Las cartas especiales dentro de la mano confunden al armar jugadas. Los sistemas que se apilan (sellos sobre cartas,
  acabados, reserva lateral) cuestan más claridad de la que devuelven.
- Un panel simulado con una sola tirada engaña: el mismo juego dio 162 y 140 puntos en dos corridas. Hace falta un
  listón promediado con placebos nulos.
- Las esperas en segundo plano se cuelgan en esta máquina: todo en primer plano y con tope.

## 0.1.0 · Fundación

**Hipótesis.** Un juego que se entiende mirando el centro de la pantalla: baraja española pura, un solo anfitrión, todo
lo que modifica la partida es pasivo, y la interfaz entera al nivel de los Dorsos.

**Decisiones de diseño que no venían dadas**
- Un jugador y sitio estático: sin servidor ni cooperativo.
- El Comodín copia la carta más alta del golpe (no es «cualquier carta»): se explica en una frase y arma pares,
  piernas y póker sin búsqueda.
- Los descartes son un recurso del combate (3) y no gastan el turno.
- Una sola regla de carga para los cuatro Reyes («abatís con su palo en el golpe: +1»).
- La moneda del Altar son los **Porotos** (con porotos se anotan los tantos del truco).
- La Carta Marcada no ocupa lugar en la mano: así es un Aumento pasivo y no una carta que estorba.

**Lo que enseñó el laboratorio**
- El oro que se vuelve Multi (Cofre del Caudal, Peso fuerte) y los ×2 que se apilan dominaban: se toparon o pasaron a
  sumar. «Contraflor al Resto» con media Vida de precio seguía siendo un regalo (+14,7 puntos): ahora cuesta el 60 %.
- El mazo corto del Truco se barajaba cada cuatro turnos y la Furia de barajar lo hundía (12 %): en el Truco barajar no
  sube la Furia, y el Envido escala.
- La «Vida Inicial» del Altar en puntos fijos pesaba el doble en los Mazos de poca Vida: ahora es un porcentaje.
- **El bot que elige siempre la pieza de mejor sello es un mal patrón de medida**: un sello que cambia por ruido movía
  las victorias diez puntos. Ahora prefiere los sellos altos con probabilidad y los sellos se miden con 40.000 partidas.
  Tras ese cambio, re-medir los sellos mueve cada Mazo dos puntos como mucho.

**Lo que encontraron las puertas**
- La «C» mayúscula en negrita de la primera tipografía se leía como «O»: los rótulos pasaron a una letra de píxel de
  mayúsculas nítidas.
- En 1080p los sprites al doble no entraban en alto: el nombre del enemigo va dentro de su barra de Vida y la mano
  asoma desde detrás del HUD.
- Forjar un sprite por primera vez en mitad de un golpe costaba un tirón de medio segundo: ahora se forjan en los
  ratos libres.

**Pendiente para las versiones que siguen**
- Medir la línea base con el panel simulado y sus placebos nulos.
- El retrato del HUD es chico en 1080p; los iconos de 28 celdas pierden lectura en la tira del móvil.
- El bot casi no usa los descartes para buscar el canto de su Mazo: las cifras de ¡ESCOBA! y ¡CHANCHO! son de piso.

## Línea base del panel simulado (0.1.0)

El panel (`..\panelAgentesGaming`) quedó reapuntado a CÁBALA: `escenas_cabala.py` (20 escenas, todas las cifras salen de
`artifacts/panel-datos.json`, que exporta `scripts/panel-datos.ts`) con guardia estricta: sin palabras de venta ni
valorativas, toda cita entre «» tiene que ser texto literal del juego, y toda pantalla citada tiene que estar
fotografiada. La QA visual guarda junto a cada captura sus medidas reales del DOM.

`pulso-60` (60 personas simuladas, una reseña cada una), tres medidas del mismo juego (la medida y dos placebos nulos):

| | Medida | Placebo 1 | Placebo 2 | Listón (media) | Meta |
|---|---|---|---|---|---|
| Aprobación | 43,3 % | 46,7 % | 46,7 % | 45,6 % | 85 % |
| Críticos | 25 % | 35 % | 30 % | 30 % | 60 % |
| Claridad | 5,93 | 6,07 | 5,93 | 5,98 | 8,0 |
| Diversión | 7,32 | 7,32 | 7,28 | 7,31 | 8,4 |
| Steam Deck | 33,3 % | 44,4 % | 44,4 % | 40,7 % | 85 % |
| Móvil | 53,3 % | 53,3 % | 53,3 % | 53,3 % | 85 % |
| F | 139,78 | 152,77 | 144,98 | 145,84 | — |

El mismo juego da 13 puntos de F de diferencia entre dos tiradas: una candidata solo cuenta si supera la media del
listón con margen. Corridas: `pulso-60-20261119-214333`, `-215503`, `-220547` (snapshot `20261119-213100`).

**Lo que más pesa en las reseñas** (leído en las auditorías y en las confusiones): los iconos de la tira del HUD eran
dianas de 32 px a 2–4 px entre sí (el auditor lo marca como P0 en casi todas las pantallas); no había tabla de jugadas
en el juego; la salpicadura de Oros, el Comodín y la Furia se entendían mal; y la letra de texto dibujaba el «5» como
una «S» («Suman 1S»).

## 0.2.0 · La mesa se toca y se entiende (aceptada)

**Hipótesis.** Las reseñas bajan por fricción de lectura y de toque: si cada cosa que se toca mide lo que debe y cada
regla que se aplica se ve en la mesa, sube la Claridad.

Hecho en la rama: fuera la salpicadura de Oros; la tira del HUD es un solo botón que abre «LO QUE LLEVÁS»; tabla de
JUGADAS en la mesa (tecla J); cartas Inmunes marcadas en la mano; letra de texto DotGothic16 (cifras nítidas) en lugar
de Pixelify Sans; reglas de dianas en la QA visual (chica, pegada, pisada); Chinchón 63 y Chancho Va 57 de Vida.
Puertas en verde: tipos, 51 pruebas, forja y linter, laboratorio sin avisos (29,9–32,6 % / 45,0–48,7 %), QA visual
ES y EN (100 capturas cada una, 0 fallos), humo ES y EN, build.

**El tirón del primer golpe.** La puerta de FPS fallaba con un cuadro de ~125 ms en el primer golpe. No era la
tipografía, ni el filtro de CSS, ni la VRAM ocupada por el panel: el perfilador de CPU lo puso en `sonar()`. Abrir el
dispositivo de audio (`new AudioContext()`) cuesta más de 100 ms la primera vez en el proceso; ahora se abre con el
primer gesto del jugador, en la portada. **Lección:** ante un tirón, perfilar antes de suponer (tres hipótesis
descartadas a mano; el perfilador lo resolvió en una corrida).

**Veredicto del panel simulado** (`pulso-60-20261120-000052` contra el listón de la 0.1.0): F 169,07 contra 145,84
(+23,2, más que el ruido de 13); Aprobación 60,0 % (45,6); Claridad 6,37 (5,98; t pareada p = 0,009); Diversión 7,33
(7,31, sin cambio); Críticos 30 % (30); Steam Deck 44,4 % (40,7); Móvil 66,7 % (53,3). Suben el pulgar 14 personas y
lo bajan 4 (McNemar p = 0,03). **Aceptada.**

**Lo que no movió:** la Diversión y los Críticos. Quitar fricción sube la Claridad y la aprobación general, pero al
jugador exigente no le da nada nuevo que hacer.

**Listón de la 0.2.0** (la medida y dos placebos nulos): F 169,07 · 170,42 · 192,23 (media 177,24); Aprobación 63,3 %;
Críticos 30 %; Claridad 6,32; Diversión 7,34; Steam Deck 59,3 %; Móvil 71,1 %. Un placebo dio 23 puntos de F más que
la medida: el ruido de una tirada es grande, y por eso el listón es la media.

## 0.3.0 · La mano se lee de un vistazo (aceptada)

**Hipótesis.** En el móvil y en Steam Deck el pulgar bajaba por no reconocer las cartas montadas ni ver el foco; y en
todos los dispositivos, por no saber qué copia el Comodín.

**Qué se hizo.** Mano del móvil en dos filas; el Comodín (y el Engaño) muestran sobre el naipe el número y el palo que
copian; foco con marco claro, halo y escala; botones de 48 px; «DESCARTAR» con «quedan N»; cifras de Vida del enemigo
sobre placa; Inmune y Furia en una frase cada uno. Sin cambios de reglas.

**Veredicto del panel simulado** (`pulso-60-20261120-010033` contra el listón de la 0.2.0): F 204,98 contra 177,24
(+27,3, por encima también de la mejor tirada del listón); Aprobación 76,7 % (63,3); Críticos 50 % (30); Steam Deck
77,8 % (59,3); Móvil 80,0 % (71,1); Diversión 7,45 (7,34; p = 0,07). Suben el pulgar 13 y lo bajan 3 (p = 0,02).
**Aceptada.**

**Lo que no movió:** la Claridad (6,28 contra 6,32). Dos versiones seguidas subieron el pulgar sin subir esa nota: las
personas simuladas aprueban más, pero siguen declarando dudas de reglas (el Comodín, la Furia, Inmune). La nota de
Claridad parece depender del largo y de las excepciones del reglamento que leen, más que de la pantalla.

**Lecciones de herramienta**
- La mano de dos filas rompió la prueba de humo del móvil: tocaba el centro de la carta, que ahora tapa la fila de
  adelante. Un jugador toca lo que ve; la prueba ahora también.
- La guardia de las escenas marcó «comodín» como palabra valorativa (por «cómodo»): los patrones de la guardia van
  con terminación explícita.

**Listón de la 0.3.0** (la medida y dos placebos nulos, instrumento i5): F 204,98 · 199,77 · 207,57 (media 204,11);
Aprobación 75,6 %; Críticos 46,7 %; Claridad 6,29; Diversión 7,44; Steam Deck 77,8 %; Móvil 82,2 %.

## 0.4.0 · Menos reglas (rechazada; rama `rechazado/v0.4.0`)

**Hipótesis.** La Claridad no sube porque el reglamento tiene demasiadas cláusulas: Espadas con un solo efecto, Golpe
exacto con un solo premio, núcleo del reglamento en corto.

**Veredicto.** F 186,55 contra 204,11 (por debajo de las tres tiradas del listón). **Rechazada.**

**Lección.** El momento favorito más citado en las reseñas es el **Golpe exacto con +1 de Multi**: la 0.4.0 lo
quitaba. No se simplifica lo que la gente festeja. Recortar reglas tampoco subió la nota de Claridad (6,40 contra 6,29).

## 0.5.0 · Legibilidad y sin tiers (rechazada como paquete; rama `rechazado/v0.5.0-legibilidad`)

**Veredicto.** Tres tiradas (196,43 · 195,18 · 203,12; media 198,2) contra las tres del listón (media 204,1): no lo
supera. Lo único que se salvó fue quitar los tiers, que es decisión del dueño del proyecto (y la escena de los
Amuletos pasó de 33 % a 100 % de pulgares arriba).

**Lección de protocolo.** Una candidata dentro del ruido se mide tres veces (la medida y dos placebos) y se comparan
medias contra medias. Una sola tirada no alcanza ni para aceptar ni para rechazar.

## 0.6.0 · El Bufón vivo y el Mapa que sube (aceptada)

**Qué es.** Tres decisiones del dueño del proyecto (sin tiers; el Bufón vivo en todas las pantallas; el Mapa vertical
de red irregular) y un pulido guiado por la auditoría visual.

**El Mapa y el balance.** El Mapa nuevo (un piso más, Fogón o Pulpería asegurados antes del Rey, Guardia Brava
esquivable) dejó el juego mucho más fácil: el bot pasó de 30 % a 53–62 % de victorias. Hubo que recalibrar la Corte
(tramos ×1,18 · ×3,4 · ×9,3 de Vida y +1 · +9 · +20 de Ataque) y la Vida de los Mazos. **Lección:** la forma del Mapa
es balance; cualquier cambio de sus reglas pasa por el laboratorio antes que por la pantalla.

**La medida, en dos tiempos.**
1. Tal como salió (sin pulido): F 167,9 contra 204,1. Los 14 que bajaron el pulgar no nombran al Bufón ni al Mapa ni
   a los tiers: se quejan de legibilidad («quedan N», iconos del HUD, contrastes, el Comodín).
2. Se listaron los 86 problemas P1 que el auditor visual marcaba en las 108 capturas y se arreglaron por tema. Con el
   pulido y el instrumento corregido (i6): F 200,7 contra 181,5 del Campeón medido igual; Aprobación 75 % (66,7);
   Críticos 55 % (40); suben 5 pulgares y no baja ninguno. El auditor pasó de 76 a 63 problemas. **Aceptada.**

**Lecciones de instrumento**
- **El auditor visual es la mayor fuente de ruido.** El mismo Campeón, re-auditado con una frase apenas distinta,
  pasó de F 204 a 181. Los placebos nulos no lo ven (no vuelven a auditar las capturas). Toda comparación se hace con
  las dos versiones auditadas con el mismo instrumento, y una diferencia de menos de 20 puntos de F entre versiones
  con capturas distintas no prueba nada por sí sola.
- **Instrumento i6:** junto a la medida del objetivo más chico se dice si cumple el mínimo del contexto. El auditor
  leía «224×48 px» y escribía «insuficiente para el mínimo de 40 px».
- **El auditor como guía directa.** Listar sus problemas P1 por pantalla y arreglarlos por tema es más barato y más
  certero que adivinar: una pasada de auditoría son 12 minutos y dice exactamente qué molesta y dónde.
- En la ventana de Steam Deck las capturas se toman con el foco puesto (ahí se juega solo con mando): antes el
  auditor marcaba «foco invisible» en pantallas donde simplemente no había nada enfocado.

**Lo que sigue sin moverse:** Claridad (6,3; meta 8,0) y Diversión (7,45; meta 8,4). Cinco versiones medidas y las dos
notas no salieron de ±0,15. Suben los pulgares, no las notas.

## 0.7.0 · Dos reglas menos (rechazada; rama `rechazado/v0.7.0`)

**Hipótesis.** Las dudas que más repiten las reseñas son el Comodín y la Furia: sacar los Comodines de los dos Mazos
iniciales y dejar la Furia solo en los Reyes subiría la Claridad.

**Medida controlada** (mismas capturas que el Campeón, así el auditor no mete ruido): F 184,4 contra 200,7; Claridad
6,17 contra 6,32; bajan 9 pulgares y suben 3. **Rechazada.**

**Lecciones**
- Segunda vez (con la 0.4.0) que recortar reglas no sube la Claridad en este panel y sí baja el gusto. Las personas
  simuladas siempre nombran dos o tres dudas: si no es el Comodín, es otra.
- Sin Comodines, Chinchón y Chancho Va se hunden (15,6 % y 21 %): los necesitan para armar sus cantos.
- **Medida controlada:** para probar un cambio de reglas, se toma el snapshot antes de volver a fotografiar. Las
  capturas son las del Campeón, salen de la caché y la comparación mide solo las reglas.

## 0.8.0 · El Golpe exacto, protagonista (publicada dentro del ruido)

**Hipótesis.** El momento favorito más citado es el Golpe exacto: darle una racha y poner a la vista cuánto falta o
sobra debería subir la Diversión. Más una segunda pasada de pulido con la lista del auditor.

**Medida.** F 192,8 contra 200,7 del Campeón (una tirada cada una, mismo instrumento); Claridad 6,38 (6,32);
Diversión 7,50 (7,45); Móvil 80 % (66,7); Críticos 30 % (55); Steam Deck 66,7 % (88,9). Suben 3 pulgares y bajan 5
(p = 0,73). Ninguna diferencia es significativa: **empate dentro del ruido**.

**Decisión.** El dueño del proyecto pidió avanzar hasta la 0.10.0 con funciones nuevas y hacer él mismo la prueba; se
publica (corrige además un error real del HUD del móvil que salió con la 0.6.0: la Vida máxima cortada).

**Estado de las metas tras ocho versiones medidas.** Suben con arreglos reales de interfaz la Aprobación (45 → 72–75 %),
el móvil y Steam Deck. No se mueven la Claridad (5,98 → 6,3–6,4; meta 8,0) ni la Diversión (7,31 → 7,45–7,50; meta
8,4): el instrumento parece tener un techo propio para esas dos notas con escenas hechas solo de hechos y cifras.

## 0.9.0 · Manos de verdad y Fogón de riesgo (publicada por decisión del dueño; mide peor)

**Pedido del dueño.** Que cada Mazo tenga en la mano las cartas de su juego; que los Amuletos sirvan medianamente a
todos; que el Fogón sea una apuesta (mejorar un naipe o perderlo en el fuego).

**Diseño.**
- Manos 3 / 3 / 4 / 7 / 8. Para que una mano de 3 no sea un Mazo menor, las manos cortas llevan Multi fijo de más
  (+4, +3, +4) y la Vida de cada Mazo se reajustó hasta certificar los cinco en la banda.
- Vale Cuatro pasó de «golpes de 4 cartas» a «golpes con toda tu mano (o 5 cartas)»: era inútil con manos de 3.
- Fogón: primera pasada segura (+4 de Daño al naipe), las siguientes con 50 % de quemarlo; hasta 3. El bot templa una
  vez y se retira (el riesgo esperado de arrimar no le paga).

**Medida** (`pulso-60-20261120-141348`, snapshot `20261120-140442`, contra el Campeón `…-115956`): F 183,6 contra
200,7; Claridad 6,03 contra 6,32 (t = −1,93; p = 0,058); Diversión igual (7,45); suben 6 pulgares y bajan 9 (p = 0,61);
Steam Deck 55,6 % (88,9); Móvil 86,7 % (66,7). Capturas nuevas: la diferencia incluye el ruido del auditor visual (el
mismo juego re-auditado ya se movió 23 puntos de F una vez).

**Lo que se vio al leer las reseñas.**
- La Claridad bajó sobre todo en las escenas de la mesa (c04 7,3 → 6,0; c05 7,0 → 5,7). Las capturas de esas escenas
  muestran una mano de **5** cartas (la partida de QA traía el Aumento «Dar de abajo»), mientras el texto dice que la
  Escoba juega con 3: la foto contradice la regla, y en el móvil esa mano de 5 cae en dos filas.
- Las dudas repetidas no cambiaron: el Comodín («copia la más alta»), la Furia y el tamaño de los números del naipe en
  Steam Deck. Nadie nombra las manos ni el Fogón como confusos; tampoco como momento favorito.

**Lección.** Las fotos de QA tienen que mostrar el caso común de la regla que cuentan las escenas. Un Aumento que
cambia la mano en el primer turno no puede estar en la partida que se fotografía.

## 0.10.0 · Con música y con voz (publicada por decisión del dueño; empate dentro del ruido)

**Pedido del dueño.** «Más animaciones, música, los personajes con voces.» Y llegar a la 0.10.0 para hacer él la prueba.

**Qué se hizo.**
- `src/client/musica.ts`: un secuenciador sobre WebAudio (bajo, rasgueo, canto y percusión de ruido), ocho pistas, una
  por pantalla. El canto de cada pista se compone solo, una vez y con semilla fija: notas del acorde en los tiempos
  fuertes y grados vecinos entre medio; la segunda mitad repite el dibujo de la primera sobre los acordes nuevos
  (frase y respuesta). Tres pruebas cuidan que entone.
- Voces por timbre (`audio.ts`) y habla letra por letra (`habla.ts`) para los Reyes; gritos de los Personajes
  (`GRITO` en `voces.ts`, `gritar` en `hud.ts`).
- Animaciones de entrada con la clase `recien` (solo al montar una pantalla nueva: repintar no las repite).
- `scripts/mirar.ts`: fotos de momentos vivos (el grito, el Rey que cae, el Fogón en suspenso) para revisarlos a ojo.

**Medida** (`pulso-60-20261120-145033`, snapshot `20261120-144650`): F 194,5 contra 200,7 del Campeón (p de
Claridad 0,27; de Diversión 0,78; suben 6 pulgares y bajan 8) y contra 183,6 de la 0.9.0 (+10,9). Empate dentro del
ruido. Los Críticos vuelven a 50 % (35 en la 0.9.0).

**Lecciones.**
- **El instrumento es sordo y no ve movimiento.** Lee escenas de hechos y audita fotos quietas. La música, las voces y
  las animaciones solo le llegan como una frase («hay 8 pistas»), y eso no mueve la Diversión (7,45 → 7,47). Para
  medir «chicha» hace falta una persona o un instrumento que mire video.
- **Una animación con retardo rompe la QA visual** aunque el sistema pida movimiento reducido (eso acorta la duración,
  no el retardo): las entradas van detrás de una clase que solo se pone en vivo.
- **Corregir la foto recuperó lo perdido.** Con la mano real de 3 cartas en las capturas de la mesa, la medida volvió
  al nivel del Campeón (183,6 → 194,5). La caída de la 0.9.0 era, al menos en parte, la foto que contradecía la regla.

**Estado de las metas al cerrar el ciclo 0.1.0 → 0.10.0** (panel simulado; ninguna de las seis se cumple):

| Meta | Pedido | 0.1.0 | Mejor medida | 0.10.0 |
|---|---|---|---|---|
| Aprobación | ≥ 85 % | 45 % | 75 % (0.6.0) | 71,7 % |
| Claridad | ≥ 8,0 | 5,98 | 6,38 (0.8.0) | 6,15 |
| Diversión | ≥ 8,4 | 7,31 | 7,50 (0.8.0) | 7,47 |
| Críticos | ≥ 60 % | — | 55 % (0.6.0) | 50 % |
| Steam Deck | ≥ 85 % | — | 88,9 % (0.6.0) | 66,7 % |
| Móvil | ≥ 85 % | — | 86,7 % (0.9.0) | 80,0 % |

Steam Deck y Móvil son grupos de 9 y 15 personas: un pulgar mueve 11 y 7 puntos. La Aprobación subió 27 puntos con
arreglos reales de interfaz; Claridad y Diversión no salieron de una banda de ±0,2 en diez versiones.

## 0.11.0 · Cirugía de composición (publicada; empate con el Campeón)

**Pedido del dueño** tras su UAT de la 0.10.0: HUD simétrico (50 · retrato · 50), todo centrado y sin espacio muerto,
bocadillos con marco, menos cortes de pantalla y números más grandes en Steam Deck. Recta final hacia la 1.0.0 en
rondas (0.11 composición, 0.12 las cinco reglas de adicción, 0.13+ pulido por inspección visual).

**Medida** (`pulso-60-20261120-162624`, snapshot `20261120-161558`): F 201,2 contra 200,7 del Campeón (0.6.0) y 194,5
de la 0.10.0. Claridad 6,30, Diversión 7,48, Aprobación 75 %. Nada significativo: empate.

**Lecciones**
- **Un observador de tamaño que cambia lo que observa se muerde la cola.** La bandeja del HUD esconde fichas y con
  eso cambia de alto: el `ResizeObserver` se re-disparaba y en el móvil bajaba los fps. Solo mira el ancho.
- **La puerta de FPS medía de más.** La ráfaga seguía contando cuadros después del combate; con el botín sobre la
  mesa, ahí cae la primera pintura de «ELEGÍ UNA» (un cuadro de ~120 ms en frío). Ahora la ráfaga termina con el
  combate y el cambio de pantalla tiene su propio tope (250 ms). No es un golpe, pero es deuda: conviene precalentar
  esa capa.
- **Agrandar una letra de píxel por un factor no entero la emborrona** y la saca de su caja (el «¡EXACTO!» pisaba el
  corazón de al lado). El peso se da con aire, no con un 1,3×.
- El índice grande del naipe es una placa con letra del cuerpo engordada un píxel (sombra de texto): la letra fina
  sola se leía peor que el índice dibujado.

## 0.12.0 · Romper el juego (publicada; empate con el Campeón)

**Pedido del dueño.** Cinco reglas: piezas que rompan el juego, un Fogón que tiente, una tabla de JUGADAS por Mazo,
matar con dibujo las dudas del Comodín y la Furia, y jugo de conteo con racha encendida.

**Decisiones**
- Pidió multiplicadores «×1,5, ×2». La Constitución manda Multi entero: se hicieron ×2 y ×3 y efectos que crecen
  (Cascabel sin tope, Cetro que se recarga con el exacto), no fracciones.
- El balance se sostuvo como pidió: sin topar al jugador. Tramo 3 +2 % de Vida y Vida de Mazos (Truco 81, Chinchón 53,
  Chancho Va 89, El Mentiroso 56).
- **Hallazgo:** El Mentiroso tenía 2 Engaños por combate en los números y «un Engaño por combate» en su texto. Con las
  piezas nuevas ganaba 36–42 % y sus partidas duraban menos de 14 min. Se dejó en 1, que es lo que el juego decía.
- El bot ahora toma la segunda pasada del Fogón (paga) y no la Forja Brava.

**Medida** (`pulso-60-20261120-172524`, snapshot `20261120-171846`): F 200,6; Diversión 7,57 contra 7,45 del Campeón
(t = 1,41; p = 0,16); Claridad 6,33; Móvil 93,3 %; Steam Deck 55,6 %. Empate.

**Lecciones**
- Una animación de CSS no puede tocar `translate` en un naipe de la mano: la mano coloca cada carta por su cuenta y
  el naipe se va de su sitio. El salto del conteo usa solo `scale` y brillo.
- El laboratorio completo ya no entra en 298 s con las notas: se corre en dos (`--sin-notas`, `--solo-notas`).
- La Diversión se movió por primera vez fuera de su banda (7,57), sin llegar a ser significativa. Es la primera
  versión cuyas escenas cuentan cosas que pasan en el golpe (conteo, racha, piezas que escalan).

## 0.13.0 · Leer a 40 cm (publicada; empate con el Campeón)

**Método.** Abrir las capturas de 1920×1080, 1280×800 y 390×844, y contar las quejas de interfaz de las 60 reseñas de
la 0.12.0. La más repetida, por lejos: los iconos de la barra de abajo (33 menciones).

**Hallazgo al mirar.** En el Fogón a 1080p la bandeja mostraba 4 iconos y «+6» con media bandeja vacía: la cuenta de
filas comparaba el borde de arriba de cada ficha, y las de otra altura (cargas, Bendiciones), centradas, quedan unos
píxeles más abajo. Ahora una ficha está en otra fila solo si empieza por debajo de donde termina la primera. La QA
visual no lo veía: no hay regla que mida «espacio vacío con cosas escondidas».

**Medida** (`pulso-60-20261120-175105`, snapshot `20261120-174441`): F 199,7; Aprobación 76,7 %; Claridad 6,40;
Diversión 7,52; Steam Deck 66,7 %; Móvil 86,7 %. Empate.

**Estado de las metas tras la recta 0.11 → 0.13** (panel simulado, una tirada por versión):

| Meta | Pedido | 0.10.0 | 0.11.0 | 0.12.0 | 0.13.0 |
|---|---|---|---|---|---|
| Aprobación | ≥ 85 % | 71,7 | 75,0 | 75,0 | 76,7 |
| Claridad | ≥ 8,0 | 6,15 | 6,30 | 6,33 | 6,40 |
| Diversión | ≥ 8,4 | 7,47 | 7,48 | 7,57 | 7,52 |
| Críticos | ≥ 60 % | 50 | 50 | 55 | 40 |
| Steam Deck | ≥ 85 % | 66,7 | 66,7 | 55,6 | 66,7 |
| Móvil | ≥ 85 % | 80,0 | 80,0 | 93,3 | 86,7 |

Tres versiones seguidas suben un poco la Aprobación y la Claridad, siempre dentro del ruido de una tirada. El Móvil
cumple su meta en las dos últimas. Ninguna versión se despega del Campeón de forma significativa: con este instrumento,
F ronda 200 desde la 0.6.0.
