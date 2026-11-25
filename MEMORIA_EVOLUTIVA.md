# Memoria evolutiva de CÁBALA

Lo que se probó, lo que funcionó y lo que no, versión por versión. Sirve para no repetir errores y para saber por qué
cada cosa está como está. Las mediciones del panel de jugadores son **simuladas** (modelos de lenguaje con capturas y
reglas): orientan, no demuestran.

## 0.47.0 · Navegación Discreta Estilo Inscryption y Bufón Esculpido (publicada)

**Qué se buscó.** Corregir el bug de retorno al menú al hacer clic en la mesa durante combate, reemplazar la cámara libre por navegación discreta estilo *Inscryption* y reconstruir el Bufón 3D con estética dark-dithered coherente.

**Qué entró.** `alSalir()` + `pantallaActual()?.nombre` en `pantallaExplorar`/`pantallaCaminoSol`, grafo discreto `VISTAS_CUARTO` + `PASOS_SOL` con `ponerPoseDiscreta3d()`, y `Bufon3D` esculpido con `TubeGeometry` y máscara de porcelana.

**Lecciones.** `raiz.isConnected` sobre `#app` nunca se desconecta entre pantallas: toda pantalla con listeners en `window` debe limpiarlos en `alSalir()`. Además, `forzarCuadro()` no debe pisar `poseDiscreta` con `ponerModo`.

## 0.46.0 · Pulido Artesanal Total (publicada)

**Qué se buscó.** Cerrar el Pilar D con física táctil 3D en naipes, bisagras reales en La Puerta Doble y doble Auditoría Adversarial consecutiva sin defectos.

**Qué entró.** Inclinación por velocidad de arrastre y rebote elástico en Postas (`cartas3d.ts`), pivotes reales de puerta con portal celeste-dorado (`cuarto3d.ts`), y ajuste de aire vertical en `1920×920` (`mesa.css`).

**Lecciones.** Auditar las capturas grandes (`2560×1320`) con GPU D3D11 real evita falsos artefactos de SwiftShader por encima de `2048px`.

## 0.45.0 · El Camino al Sol de Mayo y Cartas de Gloria (publicada)

**Qué se buscó.** Darle a CÁBALA su clímax argentino caminable en 3D y un trofeo físico persistente en La Pulpería sin alterar la huella de `src/rules/`.

**Qué entró.** `CaminoSolDeMayo3D` (empedrado porteño, faroles, festones celestes/blancos, arcos de naipes y Sol de Mayo Bayer al pulso `3-3-2`) y `CartaGloria` en `src/client/almacen.ts` clavada en `CuartoPulperia3D`.

**Lecciones.** `tests/forja.test.ts` exige que `src/rules/` conserve la huella exacta de `meta-report.json`; guardar `glorias` en `src/client/almacen.ts` mantiene las reglas 100 % congeladas.

## 0.44.0 · La Pulpería 3D Explorable (publicada)

**Qué se buscó.** Convertir el menú en un cuarto 3D caminable estilo *Inscryption* sin romper la limpieza de la Portada sentada ni las puertas de QA.

**Qué entró.** `CuartoPulperia3D` con 7 rincones interactivos (Mesa del Bufón, Altar de 7 velas vivas, Pared de la Gloria enmarcada en latón, Fogón, Libro de Crónicas, Fonógrafo al pulso `3-3-2` y Puerta Doble con resplandor celeste/dorado), caminata `WASD`/stick con *head-bob*, mirada 360° y barra rápida en una sola fila.

**Lecciones.** La pared trasera plana de `pulperia.ts` ocluía el fondo del cuarto completo hasta ocultarla en `explorar`; y en `visual-qa.ts` las cajas de HUD requieren `box-shadow` en lugar de `border` liso y `min-height: 44px` en botones.

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

## 0.14.0 · Cada pantalla, un lugar (publicada; el Jurado sube, el panel local baja)

**Cambio de instrumento.** El dueño pidió agrandar el panel con un Jurado de seis subagentes Fable en paralelo y
versiones con paquetes agresivos. El Jurado lee capturas, secuencias de cuadros (`scripts/secuencias.ts`), medidas del
DOM, el laboratorio y el código; devuelve puntajes y tres defectos con archivo. `node scripts/jurado-resumen.mjs <v>`
copia los veredictos a `jurado/<v>/` y arma la tabla.

**Jurado, 0.13.0 → 0.14.0** (media de seis): Claridad 6,3 → 6,5 · Diversión 6,5 → 7,0 · Estética 7,5 → 7,8 ·
Veredicto 6,5 → 6,8. Por jurado (veredicto): arte 6,6 → 7,0; diseño 6,4 → 6,7; jugo 6,8 → 7,3; novato 6,2 → 6,6;
Deck 6,3 → 6,4; móvil 6,6 → 6,9.

**Panel local** (`pulso-60-20261120-225613`, snapshot `20261120-223544`): F 183,5; Aprobación 63,3 %; Claridad 6,37;
Diversión 7,48; Deck 66,7 %; Móvil 73,3 %. McNemar 2 suben / 9 bajan (p = 0,065).

**Lecciones.**
- El cuadro frío no era JavaScript ni decodificación de imágenes: la traza del navegador mostró una tarea de raster
  de 114 ms en la GPU (compilación de sombreadores) la primera vez que se pinta algo nuevo. Se arregla pintándolo
  antes, casi invisible, con el contenido de verdad; un modal de mentira no alcanzó.
- Los jurados aciertan en lo que una puerta no mide: los seis vieron que los carteles del conteo se pisaban; la QA
  visual, que fotografía todo quieto, no podía verlo.
- El Jurado puntúa su especialidad sin piedad: Deck apenas se movió (6,3 → 6,4) porque su P0 (texto a 16 px) no se
  tocó. Un defecto P0 que se deja para «la versión que le toca» frena la nota de todas las intermedias.
- El Jurado y el panel local se contradicen en esta versión. No hay forma de saber cuál acierta sin el dueño
  jugando; lo que coinciden en señalar es el texto chico.
- Se añadió al panel el preset `deck-36` (solo personas de Steam Deck) para hitos; todavía sin correr.
- Dos agentes editando a la vez funcionó con una regla: carpetas disjuntas y CSS nuevo en secciones propias al final.

## 0.15.0 · La segunda cara (aceptada)

**Qué se buscó.** Atacar los P0/P1 del Jurado sobre la 0.14.0: la defensa plana (diseño), los Reyes de una nota, el
Bufón sin dilemas, la letra de 16 px en Steam Deck y la mesa que no cedía en teléfonos bajos.

**Qué entró.** Defensa ×1/×2/×3 por tramo con La Corte recalibrada; «¡AL PELO!» (pasarse ≤ 5 % sostiene la racha);
Comunes que crecen con la carga de su Rey; segunda cara de cada Rey a media Vida, con chip permanente; Cábalas
*El soplo*, *Mano larga* y *Firmar a ciegas*; letra mínima 18 px entre 1100 y 1699 px, glifos del mando y enemigo
rotulado e inspeccionable; mesa móvil con consultas de contenedor y arrastre que avisa. Dos agentes en paralelo
(Deck y móvil) en secciones propias de CSS.

**Lecciones.**
- El laboratorio depende de `notas.json`: el bot elige piezas con las notas, así que las dos pasadas (`--sin-notas`
  y `--solo-notas`) no son un punto fijo. Una corrida rápida con las notas recién calculadas ya movió a Mentiroso a
  55,8 % con el Altar lleno. Se certifica según el procedimiento, pero el balance tiene más ruido del que dice su
  informe; conviene estabilizar las notas (promediar o congelar) antes de afinar fino.
- Correr `analyze-meta` sin bandera hace una corrida completa que pisa el informe: siempre con `--sin-notas`.
- Las cartas usadas en un golpe de prueba quedan gastadas: cada caso de Vitest con su mano nueva.
- El conteo con cartel flotante, que arregló el amontonamiento de la 0.14, ahora tapa el desglose que inventó esta
  misma versión: los seis jurados lo señalan. Próximo paso: encender cada término dentro del desglose.

**Medición.** Jurado 7,1 · 7,0 · 7,8 · 7,1 (claridad · diversión · estética · veredicto). Panel pulso-60 simulado
(n = 60, ruido ±10 puntos): aprobación 71,7 % (+8,4), F 194,93 (+11,5 contra la 0.14), Móvil 86,7 %, Deck 66,7 %,
claridad 6,08 (−0,3).

## 0.16.0 · Cambiá de plan (publicada)

**Qué se buscó.** Los P0/P1 del Jurado sobre la 0.15.0: el cartel del conteo tapando el desglose (unánime), la Furia
sumable, segundas caras sin peso, audio sin bus, mesa muerta antes del botín, letra con huecos y Mentiroso escapado.

**Qué entró.** Conteo encendido dentro del desglose (DAÑO / MULTI rotulados, también en el teléfono); cuenta con
marco; chip de Furia «ya incluida»; glosario en JUGADAS; segundas caras Tajo de revés (×2 y atraviesa si repetís),
Fortín (Escudo de 25 % de la Vida, Espadas lo atraviesan), Remate (25 % de la bolsa), Última ronda (cura ×2);
audio con compresor y sonidos propios; caída del Rey encadenada al botín; letra Bitcount Prop Single; mando sin zona
de descarte; bandeja en dos filas. Dos agentes en serie (claridad, luego juice y letra) y yo en el motor.

**Lecciones.**
- El orden del laboratorio importa: primero `--solo-notas` (calcula las notas que se van a publicar) y **después**
  `--sin-notas` (certifica con esas notas). Al revés, el informe certifica un bot que no es el que queda en el repo:
  de ahí salía el 55,8 % del Mentiroso.
- `huella` incluye los textos de las reglas: cambiar una palabra en `mazos.ts` obliga a recertificar.
- PowerShell aplana `@(@(a,b))` de un solo par: un reemplazo masivo rompió `aumentos.ts` (se restauró con git).
- Con mano de 3 la única jugada a veces es Carta sola: el Tajo de revés castiga sin salida (P0 de diseño para la 0.17).
- Tres jurados ven al rótulo del Rey en segunda cara pisando la cuenta a 1366 y 1920, y la QA da 0 solapes: falta la
  regla.

**Medición.** Jurado 7,3 · 7,2 · 7,9 · 7,3 (+0,2 · +0,2 · +0,1 · +0,2). Panel: ver la entrada de la 0.17.0.
## 0.17.0 · La cara verdadera (publicada)

**Qué se buscó.** Los P0/P1 del Jurado sobre la 0.16.0: el Rey en segunda cara pisando la cuenta, el Tajo sin salida con
mano de 3, los Comunes clones, el grito tapando controles, Cara de Póker como cortina, pantallas sin escena.

**Qué entró.** Dibujo propio de segunda cara para los 4 Reyes; Tajo sin Carta sola y legible; regla de QA
«solape-enemigo», «grito-tapa» y «mapa-foco»; Comunes con segunda mitad y ×tramo; tienda sin dos Comunes; escenas de
victoria, derrota, botín, ajustes y crónica. Tres agentes en serie (mesa, arte) y yo en el motor.

**Lecciones.**
- Las notas del bot son terciles (S/A/B): unas pocas piezas en el borde cambian de letra con cualquier cambio de reglas,
  y eso movió al Mentiroso de 48,9 a 53 % con el Altar lleno. Procedimiento que funciona: recalcular las notas **una vez**
  tras el último cambio de reglas, y después afinar solo Vidas con `--sin-notas` sin volver a recalcularlas.
- Endurecer el tramo 1 (más ataque de La Corte) agranda la distancia Altar vacío / lleno y saca a Chinchón y Mentiroso
  de objetivo; un +1 de Multi plano (`multiMano`) la achica, porque ayuda más al que no tiene Altar.
- El panel 0.16.0 dio 75,0 % (IC95 63–84 %, n = 60), F 203,3, claridad 6,3, Deck 77,8 % (n = 9), Móvil 80,0 %.

**Medición.** Jurado 7,4 · 7,3 · 8,0 · 7,4 (+0,1 en las cuatro).
## 0.18.0 · El golpe se descubre (publicada)

**Qué se buscó.** Diversión: suspenso en el conteo, el Tajo con un solo número, el grito que no tapa, la Vida que crece con
cada Rey, el Mentiroso con su defensa propia y la Steam Deck con la mano grande.

**Qué entró.** Veredicto en la previa y remate del conteo (sonido, sacudida, total que se asienta); Tajo «TE PEGA n (k ×2)»;
carriles en el naipe del Rey; grito que busca hueco; +12 de Vida máxima por Rey; Cara de Piedra; mano 2× en la Deck.

**Lecciones.**
- Esconder el total y «LE QUEDAN» hasta el conteo subió Diversión (+0,1) pero bajó Claridad (-0,1): el novato y la Deck
  dejaron de poder decidir. El suspenso tiene que estar en *cómo* se cuenta, no en *qué* se sabe antes de soltar.
- Una Vida de arranque muy chica (Mentiroso 9) choca con cualquier piso absoluto (`Math.max(10, …)`): el costo se vuelve
  gratis o hasta suma. Los costos de Vida máxima pasan por `pagarVidaMax` (nunca suben, nunca bajan de la mitad).
- Un veredicto nuevo en la fila de chips empujó la cuenta y achicó el naipe del enemigo en el teléfono bajo (QA visual
  «solape-enemigo»): «NO LO ABATÍS» sobraba, porque «LE QUEDAN n» ya lo dice.

**Medición.** Jurado 7,3 · 7,4 · 8,0 · 7,4 (sobre la build previa a los dos arreglos de cierre).
## 0.19.0 · La mesa limpia (publicada)

**Qué se buscó.** Los P1 del Jurado sobre la 0.18: crítico contado dos veces, Botín de cinco piezas sobre el Bufón, dos TE
PEGA, la mesa que saltaba en la Deck, el foco igual a la selección, la curva de caídas del tramo 1 despareja.

**Qué entró.** Crítico dentro del MULTI, un solo TE PEGA, rasgo con regla, foco celeste, mesa quieta, Botín de cinco
piezas con icono de Vida máxima, grito junto al retrato; Vida máxima por Rey proporcional a la del Mazo; objetivo de caídas.

**Lecciones.**
- Bajar la dispersión de caídas a fuerza de Multi plano (`multiMano` 8 en Escoba) aplana las jugadas: el Jurado de diseño
  lo marcó como P1 (la jugada pesa un 10 % del Multi y los Amuletos de Multi valen un quinto). El Multi de mano tiene que
  ser chico; la seguridad del arranque se compra con Vida o con defensa que dependa de lo que jugás.
- Una banda ancha (2–25 %) mide pero no cierra el problema: hace falta también un tope de dispersión entre Mazos.
- El panel simulado bajó (81,7 → 70,0 %, n = 60) mientras el Jurado subió en las cuatro columnas: con ±10 de ruido y
  estratos de n = 9–21, el panel no sirve para leer una versión suelta.

**Medición.** Jurado 7,6 · 7,5 · 8,0 · 7,6. Panel 70,0 % (IC95 57–80 %); Deck 33 % (n = 9), Móvil 93 % (n = 15).

## 0.43.0 · Cirugía Visual Total y Cohesión Pixel-3D (publicada)

**Qué se buscó.** Resolver de raíz los defectos detectados en la Auditoría Adversarial #0 sobre `v0.42.0` (Bufón 3D plástico, óvalo violeta `.e-pano` en `1920×920`, brecha de media queries `1700px+`, solape de `SEL JUGADAS` y tooltips sobre `LA CORTE`, y textos pegados al borde izquierdo).

**Qué entró.** `bufon3d.ts` + `texturas.ts` (máscara angular de tarot oscuro con claroscuro Bayer partido, cuencas abismales, cintas de arlequín y ojos *Leshy*, más `texturaCera`, `texturaLaton` y `texturaOroMoneda`); `pulperia.ts` + `escenarios3d.ts` (vela de 3 capas, monedas octogonales y mazo apartado); `mesa.css` + `base.css` (`.e-pano` y `.pul-bufon::after` ocultos en 3D, cierre de brecha `1700px+`, `margin-left: -32px` en `.mesa .corte`); `desglose.ts` + `mano.ts` + `ui.ts` (margen izquierdo `≥ 18 px` y `TAPA_NUNCA` ampliado).

**Lecciones.**
- Probar ventanas reales de navegador (`1920×920` y `2560×1320`) destapó una brecha en `@media (min-width: 1700px) and (min-height: 950px) and (max-height: 1250px)` que dejaba fuera la altura útil de Chrome con barra de marcadores y hacía reaparecer el óvalo 2D `.e-pano`.
- Pasar de una máscara ovalada lisa con luz frontal a una geometría angular cincelada con claroscuro Bayer partido integró al Bufón 3D al nivel del *Dark Dithered Pixel Art* de los 5 Dorsos.

## 0.42.0 · Pulpería Viva 3D (publicada)

**Qué se buscó.** Llevar la presencia física 3D más allá del combate a todas las pantallas clave de la travesía (Mapa sobre cuero, Fogón vivo, Mostrador de Pulpería y Elegir Mazo), sumar estallidos 3D de palo en cada golpe y cerrar los detalles finales del Bufón 3D y del foco en Steam Deck.

**Qué entró.** `escenarios3d.ts` (tablero de cuero Bayer con bordes enrollados, latón, cofrecito, brújula y 6 pedestales de nodos; fogón de 9 piedras, brasas, 4 leños, llama translúcida en 3 capas + lenguas laterales + chispas y carta real levitando; mostrador, velas, monedas y botellas en Pulpería; cuenco de porotos y vela en Mazos); `texturas.ts` (`texturaCuero`, `texturaPiedra`); `bufon3d.ts` (capucha `z = -0.11` y gorguera por debajo del mentón, anfitrión en Mapa); `cartas3d.ts` + `mesa.ts` (`estallidoPalo3d` y retroceso del tótem enemigo); `pulperia.ts` (partículas de brasa en Fogón); `mano.ts` + `desglose.ts` (`.con-pano` síncrono en `ajustar()` y `tope - 18`).

**Lecciones.**
- Un cono de capucha centrado en `z = -0.03` con escala Z `0.85` asomaba un triángulo oscuro por el mentón de la máscara veneciana: llevarlo a `z = -0.11` y `scale.z = 0.62` limpió por completo el rostro en todas las escenas.
- En el Fogón 3D, una capa exterior de llama opaca ocultaba el núcleo dorado: usar `transparent: true` y `depthWrite: false` en las capas exteriores dejó brillar el corazón de fuego y las chispas.
- En `1280×800`, `.con-pano` se alternaba recién en el `requestAnimationFrame` de `posicionar()` mientras `acomodarCuenta` medía `.c-pista-pano` con `display: none`; sincronizar `.con-pano` en `mano.ajustar()` junto con `tope - 18` en `desglose.ts` eliminó por completo el solape `mano-tapa-cuenta` sin perder legibilidad.

**Consejo de Diseño 3D (5 sillas).** Dirección 3D/Atmósfera 9,4 · Carisma Bufón/Personajes 9,4 · Física/Cámara/Game Feel 9,3 · PC/Steam Deck 9,4 · Móvil 9,3 → **Media 9,4 / 10** (+0,4 sobre v0.41.0; todas las 5 sillas ≥ 9,2/10) · **159,9–164,8 FPS**, **CLS = 0**, **0 fallos `qa:visual` ES/EN (592 capturas)**, **0 solapes (`secuencias` 1280 y 390)**, **16/16 `qa:smoke`**, **163/163 pruebas**.

## 0.41.0 · El Bufón de la Penumbra, Máscaras de los Reyes y Chiches 3D (publicada)

**Qué se buscó.** Elevar la presencia teatral del Bufón en la penumbra al nivel *Inscryption*, darle a los 4 Reyes Jefe máscaras/coronas 3D teatrales y climas propios, y materializar los 5 Chiches sobre la madera de la mesa.

**Qué entró.** `bufon3d.ts` (máscara veneciana esculpida con `ExtrudeGeometry` y UVs normalizadas, ojos almendrados con seguimiento de cursor/carta y parpadeo, manto oscuro mate con gorguera arlequín de 8 puntas, cetro veneciano y 4 antifaces dominó + coronas de Rey); `chiches3d.ts` (Ginebra con borde cristalino e hielo, Dado Cargado de 6 caras, Fósforo encendido con halo Bayer, Polvo de Tiza cobalto y Poroto de Yapa); `pulperia.ts` (climas diferenciados por palo en partículas y farol); realce del retrato DOOM y cartas de Segunda Cara.

**Lecciones.**
- La primera iteración con primitivas de caja y domo brillante parecía cartón iluminado: pasar a silueta puntiaguda veneciana (`ExtrudeGeometry` con bisel), terciopelo oscuro mate (`roughness: 0.98`) y una luz puntual corta focalizada solo sobre la máscara (`distance: 1.6`) transformó por completo la lectura dramática.
- En la mesa (`1920×1080`), bajar ligeramente el anclaje (`factorY = 0.62`, `escala = 0.84`) despejó por completo el dado `Turno 1` y dejó la corona de Rey intacta bajo el borde superior.

**Consejo de Diseño 3D (5 sillas).** Dirección 3D/Atmósfera 8,8 · Carisma Bufón/Personajes 9,1 · Física/Cámara/Game Feel 8,8 · PC/Steam Deck 9,1 · Móvil 9,0 → **Media 9,0 / 10** (+0,7 sobre v0.40.0) · **160,9–164,8 FPS**, **CLS = 0**, **0 fallos `qa:visual` ES/EN (592 capturas)**, **0 solapes (`secuencias` 1280 y 390)**, **163/163 pruebas**. Próximo salto (`v0.42.0`): Mapa 3D sobre cuero, Fogón 3D vivo y Mostrador de la Pulpería 3D.

## 0.40.0 · La Mesa Nocturna 3D (publicada)

**Qué se buscó.** Dar el salto inicial a una experiencia 3D en primera persona sobre la mesa nocturna de pulpería con Three.js + WebGL manteniendo el 100 % del motor determinista, la música adaptativa `3-3-2`, las voces líricas y la estética *Dark Dithered Pixel Art*.

**Qué entró.** Capa `src/client/escena3d/` (`index.ts`, `pulperia.ts`, `camara.ts`, `cartas3d.ts`, `texturas.ts`) con habitación persistente de pulpería nocturna (tablones Bayer `NearestFilter`, paño verde esmeralda, farol oscilando, estanterías con botellas, vela 3D con llama y luz puntual `PCFShadowMap` al compás de `armoniaActual()`, polvo/brasas 3D, climas de Reyes, pila dinámica del Mazo, monedas 3D y 5 Mazos físicos en Portada), naipes físicos 3D sincronizados con `marcarSucio3d()`, tótem 3D enemigo y fractura física en 2 mitades + monedas.

**Lecciones.**
- En modo híbrido 3D + DOM gemelo, ocultar `.pano-postas` no basta si `.pano-postas::before` pinta un relleno 9-slice verde opaco en `#app`: hay que ocultar `.pano-postas::before` y `.posta.llena::before` para dejar pasar las cartas 3D limpias.
- `#capa > * { pointer-events: auto; }` en `base.css` gana por especificidad sobre `.chiche-vuela { pointer-events: none; }`: hace falta `pointer-events: none !important` en fichas voladoras.
- En `desglose.ts`, `margin-top` de `.c-bajo` (`+12 px`) empuja la columna hacia abajo respecto a `tope`: restarlo al medir evita el roce de 3 px con la carta enfocada en `1280×800`.
- `Three.js` r187+ removió `PCFSoftShadowMap` (usar `THREE.PCFShadowMap`) y conviene limpiar el `WebGLRenderer` en `pagehide`.

**Consejo de Diseño 3D (5 sillas).** Dirección 3D/Atmósfera 8,2 · Carisma Bufón/Personajes 7,5 · Física/Cámara/Game Feel 8,4 · PC/Steam Deck 8,8 · Móvil 8,7 → **Media 8,3 / 10** · **158,7–164,8 FPS**, **CLS = 0**, **0 fallos `qa:visual` ES/EN**, **0 solapes en movimiento (`secuencias` 1280 y 390)**, **163/163 pruebas**. Próximo salto (`v0.41.0`): Bufón 3D articulado con ojos que siguen al puntero/carta, Máscaras 3D de los 4 Reyes y Chiches 3D físicos sobre la mesa.

## 0.33.0 · Obra Maestra Rioplatense (publicada)

**Qué se buscó.** Cerrar la Temporada de Diseño superando `≥ 9,2/10` en todas las métricas de las 5 sillas mediante una auditoría visual exhaustiva de todas las pantallas secundarias (Colección, Ajustes, Victoria, Fogón, Mapa, Pulpería móvil) y los últimos dos píxeles de la mesa en las 6 resoluciones (ES y EN).

**Qué entró.** Clavos de Colección alineados al eje superior (`align-items: flex-start`); abanico de 5 Dorsos despejado sobre el Bufón en Ajustes; nombres nítidos sin `line-through` en Reyes vencidos de Victoria; íconos del Fogón en un mismo horizonte; degradado limpio en `.mapa-rollo` de escritorio, cofre `--k: 1` sin tapar la calavera y Rey faro sin máscara superior en Mapa móvil; pie esfumado limpio bajo `HAY MÁS ↓` en Pulpería móvil; tacto unificado en tarjetas/ventas/nodos/velas; margen derecho limpio en `1280px` con doble canto + `SOBRAN → PASAN`.

**Lecciones.**
- `scripts/visual-qa.ts` lee una sola bandera `--ventana=` con `.find()`: pasar dos `--ventana=` en una misma invocación omitía la segunda. Auditar las capturas con ojos propios y comprobar fechas de modificación destapó el detalle y permitió verificar genuinamente las 6 ventanas individuales en ES y EN (0 fallos).
- El 80 % de pasar de «muy bueno (8,9)» a «obra maestra (9,3+)» está en la disciplina invisible de las pantallas secundarias: alinear clavos de galería, quitar tachados feos, limpiar bordes de scroll y dar la misma respuesta táctil a cada botón fuera del combate.

**Consejo de Diseño (5 sillas).** Arte 9,4 · Layout/Estabilidad 9,4 · Animación/Game Feel 9,3 · Steam Deck 9,3 · Móvil 9,3 → **Media 9,3** (+0,4 sobre 0.32.0; +2,0 desde 0.29.0; todas las 20 métricas ≥ 9,3/10). Puertas: `qa:estabilidad` 0 hallazgos, `qa:visual` ES/EN 0 fallos en las 6 ventanas individuales, `qa:smoke` ES/EN 100 % verde, `qa:fps` 163,1–164,8 fps (0 cuadros > 50 ms), `secuencias` 1280/390 0 solapes.

## 0.32.0 · Mesa Viva: Animación Cinematográfica, Física Táctil y Game Feel a 60 FPS (publicada)

**Qué se buscó.** Dar vida continua y peso táctil a la mesa sin perder un píxel de estabilidad ni un cuadro por segundo: sincronizar la luz con la milonga, suavizar los cambios de pantalla sin saltos, sumar respuesta física al apoyar cartas y al presionar botones, dar lectura visual viva al enemigo aturdido/furioso y pulir la coreografía de golpe (sello crítico `×2`, `TAJO DE REVÉS` vs `FURIA`, conteo móvil y `×2` en Comodín copiado).

**Qué entró.** Lectura pura de `armoniaActual()` en `motor.ts` para pulsar la luz en los acentos 3-3-2; fundido cálido sin `translate` + `.transicion-velo` en `ui.ts`/`base.css`; barrido dorado en CTA y depresión física; chispas + destello de Posta al apoyar (`mano.ts`/`mesa.css`); enemigo `.aturdido` con 3 estrellas doradas y `.con-furia` con halo de brasa (`mesa.ts`/`mesa.css`); `.c-crit-sello` encima de `MULTI`, corredor limpio para `FURIA` junto a `TAJO`, cuenta en una sola fila en escritorio, escalado progresivo de conteo en móvil y `×2` arriba a la derecha en Comodín copiado.

**Lecciones.**
- Correr `scripts/secuencias.ts` en `1280` y `390` y mirar los cuadros con ojos propios atrapó cuatro detalles sutiles invisibles para las capturas estáticas: un salto de renglón de `.c-queda` bajo las cartas del paño en `chancho-canta`, `FURIA` tocando el borde de `SEL JUGADAS` en `rey-tajo`, `×2` rozando `COMODÍN` cuando el Comodín copiado ocupaba la Posta del Medio (`mano.ts:606` aún suponía el rótulo arriba), y el aterrizaje central de `+N` en móvil.
- Leer `armoniaActual()` en el motor de fondo enriquece la sensación orgánica del juego a 0 ms de costo extra (163,3–164,8 FPS intactos) respetando al 100 % el congelamiento de `musica.ts`.
- Para el salto final `v0.33.0` (`≥ 9,2/10` en las 20 métricas): revisar el borde derecho de `SOBRAN → PASAN` con doble canto en `1280px`, Fila 1 de `360px` Chinchón y pulir todas las pantallas secundarias (Mapa, Pulpería, Fogón, Cábala, Altar, Colección, Crónica, Botín, Victoria/Derrota) a nivel obra maestra.

**Consejo de Diseño (5 sillas).** Arte 8,9 · Layout/Estabilidad 8,9 · Animación/Game Feel 9,0 · Steam Deck 8,9 · Móvil 8,9 → **Media 8,9** (+0,4 sobre 0.31.0). Puertas: `qa:estabilidad` 0 hallazgos, `qa:visual` ES/EN 0 fallos (6 ventanas), `qa:smoke` ES/EN 16/16, `qa:fps` 163,3–164,8 fps (peor cuadro 24 ms), `secuencias` 1280/390 0 solapes.

## 0.31.0 · Belleza de Pulpería Nocturna (publicada)

**Qué se buscó.** Elevar la belleza visual, la simpleza y la legibilidad en Steam Deck (`1280×800`) y teléfono (`390×844` / `390×664` / `360×740`): limpiar el Comodín apoyado y la caja fantasma `AL DESCARTE`, equilibrar tarjetas cortas (Fogón, Botín, Ofertas, Pulpería, Cábala), unificar el foco de mando sin pisadas y compactar la hoja de cuenta móvil en 2 columnas.

**Qué entró.** Comodín foil a opacidad 1 con chapita horizontal inferior izquierda (`mesa.css`); `AL DESCARTE` oculto en reposo (`opacity: 0`) y visible al arrastrar; foco `> .px` sin marcar íconos internos, `.pieza-fila` en foco celeste, azul zafiro para `CORTÁS`, mayor contraste en `TE PEGA`/`FURIA`; `.mapa-rey` incorporado a `vecinos` en `ui.ts`; `.cuenta-hoja` en 2 columnas, 2 filas exactas en Chinchón móvil, corazón restaurado en `360 px` y mayor aire entre filas de Chinchón móvil (`mano.ts`).

**Lecciones.**
- La animación `@keyframes espectro` arrancando en `opacity: 0` con `steps(4)` dejaba al Comodín en 75 % de opacidad en las capturas, transparentando al Bufón detrás de las pintas: las transformaciones de naipe deben animar brillo y escala sobre opacidad 1.
- Dos reglas `.carta:focus-visible .px` separadas (líneas 703 y 3874 de `mesa.css`) hacían que al corregir solo la segunda reapareciera el halo amarillo de la primera sobre el escudo Inmune interno: usar siempre selector de hijo directo `> .px`.
- Un `<div class="op-sinergia"></div>` vacío con `margin-top: auto` empujaba hacia arriba las tarjetas sin sinergia (`BOTA DE VINO`): ocultarlo con `:empty` devuelve centrado natural al instante.

**Consejo de Diseño (5 sillas).** Arte 8,5 · Layout/Estabilidad 8,7 · Animación/Game Feel 8,3 · Steam Deck 8,6 · Móvil 8,5 → **Media 8,5** (+0,5 sobre 0.30.0). Puertas: `qa:estabilidad` 0 hallazgos, `qa:visual` ES/EN 0 fallos (6 ventanas), `qa:smoke` ES/EN 16/16, `qa:fps` 163,6–164,8 fps (peor cuadro 18 ms).

## 0.30.0 · Arquitectura de Roca (publicada)

**Qué se buscó.** Abrir la Temporada de Diseño (UI/UX, Dirección de Arte, Armonía Espacial y Game Feel, manteniendo congelados música, voces y reglas) atacando la sensación de «página web interactiva»: cajas que cambian de tamaño al tocar, cartas vecinas que bailan, recortes en Pulpería 1080p y descentrado en Ofertas y Colección.

**Qué entró.** Nueva puerta estricta `npm run qa:estabilidad` (7 sondas interactivas en 5 resoluciones); mesa de roca en escritorio y móvil (`mano.ts`, `desglose.ts`, `mesa.css`); dimensiones fijas y simetría en Portada, Elegir Mazo, Altar, Colección, Pulpería y Ofertas (`pantallas.css`).

**Lecciones.**
- Medir *layout shift* de verdad reveló **432 hallazgos** invisibles para la QA estática (cartas que bailaban por el encogimiento de `CANTO`, `@keyframes cuenta-sale` que vibraba 4 px en cada jugada, cascada de fuente 30→26→24 px en desglose, filas desparejas en Pulpería y saltos de 23–46 px al alternar `ES↔EN` en Portada). Bajar eso a **0** transformó la solidez táctil del juego.
- Reglas sobre `.cuenta-zona` en móvil sin `:not(.cuenta-hoja)` recortaron la hoja expandida porque ésta también porta la clase `.cuenta-zona`: en CSS de capas acumuladas conviene aislar siempre la hoja flotante.
- Las puertas automáticas en verde no reemplazan el ojo humano: revisar las PNGs detectó texto rozando el bisel inferior en Pulpería 1080p, bocadillo tocando el borde de Chinchón en Elegir Mazo 1080p y detalle ajustado en móvil.

**Consejo de Diseño (5 sillas).** Arte 8,0 · Layout/Estabilidad 8,3 · Animación/Game Feel 7,9 · Steam Deck 8,1 · Móvil 7,9 → **Media 8,0** (subida +0,7 desde base 7,3 en 0.29.0). Puertas: `qa:estabilidad` 0 hallazgos, `qa:visual` ES/EN 0 fallos (6 ventanas), `qa:smoke` ES/EN 16/16, `qa:fps` 163,8–164,8 fps (peor cuadro 18 ms).

## 0.29.0 · Lo que se gana (publicada)

**Qué se buscó.** Cerrar el P1 de la mesa a 1080p y todos los P2 de la 0.28 en tres frentes a la vez (interfaz, audio
y reglas, cada uno en su copia de trabajo), y los tres P2 de reglas que diseño repetía: Envido, Evoluciones, exacto.

**Lecciones.**
- Séptima subida seguida y primera versión con 0 P0 y 0 P1 en los siete jurados: 8,9 · 8,7 · 8,7 · 8,8. Claridad llega
  a la meta en novato (9,2) y móvil (9,1); ninguna otra columna pasa de 9,0. Quedan 21 P2: a esta altura cada décima
  cuesta una pantalla entera pulida.
- Tres copias de trabajo en paralelo funcionan si cada frente tiene sus archivos; lo que se rompe aparece al fusionar
  (un botón que no entraba a 360 px, un sello bajo un número, dos placas que se montaban) y no en el informe de ningún
  agente: las puertas se corren SIEMPRE sobre el conjunto.
- El humo intermitente era el guion (insistía en un Tesoro con candado que no podía pagar), no el juego.
- Guardé el balance con siete pruebas en rojo por cambiar el umbral de las Evoluciones después de escribirlas: las
  pruebas leen el número de la configuración, no lo repiten.
- Con un umbral de 2 o 3 niveles de dones las Evoluciones seguían despertando en 63–89 % de las partidas; hicieron
  falta 4. Y cambiarlo sin tocar los textos dejó reglas escritas falsas («un don», «no cobrás el premio»): lo cazó el
  jurado de diseño. Todo texto que cita una regla sale del número de la configuración.
- El laboratorio completo no entra en 300 s con agentes corriendo en la misma máquina: se certifica con la máquina libre.
- Audio: el juez no pone un 9 a una mezcla que nadie oyó. Encontró un error real con cuentas a mano (una «altura» de
  0,85 bajaba un rasgueo una tercera menor en cada golpe que no abate); ninguna medición lo veía porque medía con
  altura 1. Abiertos: las voces (la compensación empareja el volumen, no el timbre; siguen entrando hasta 144 ms tarde),
  y el duelo con un Rey, que es un loop de dos compases.
- La QA visual no fotografía varias reglas nuevas («ENVIDO: faltan N», «COPAS NO CURAN», El Soplo, la ayuda de primera
  vez, el progreso de la Evolución): tres jurados no pudieron juzgarlas.
- Unificar la cuenta del teléfono le costó la escalada del conteo (los términos ya no se encienden).

**Medición.** Jurado de siete 8,9 · 8,7 · 8,7 · 8,8 (0 P0, 0 P1). Laboratorio sin avisos; Evoluciones despiertas en
~50–60 % de las partidas.

## 0.28.0 · La milonga de la Corte (publicada)

**Qué se buscó.** Segundo salto del mandato de obra maestra: música adaptativa sobre un reloj único y personajes que
cantan en armonía; y cerrar los tres P1 de la 0.27 (escritorio con algo apoyado, cuenta plegada, sello SE PLANTA).

**Lecciones.**
- Sexta subida seguida. Los seis jurados visuales dan 8,8 · 8,65 · 8,6 · 8,75 y el de audio pasa de 5,1 a 7,6; la
  media de siete queda en 8,7 · 8,6 · 8,4 · 8,6. El novato llega a 9,1 de Claridad: primera columna en la meta.
- Los tres P1 de la 0.27 quedaron cerrados y vistos cuadro por cuadro. Queda uno nuevo: al rehacer el reparto del
  escritorio, a 1920 el bocadillo tapa al Bufón y el paño sigue a 1×. Arreglar tres ventanas rompió la cuarta.
- La música se compuso y mezcló sin que nadie la oyera: el render fuera de línea da picos, sonoridad y brillo, y prueba
  que cada nota cantada cae en el acorde, pero no dice si suena bien. El juez de audio pide una escucha humana como
  puerta; es el mayor riesgo de la versión.
- Lo que el juez de audio ve flojo: los ~60 efectos siguen siendo ondas cuadradas contra una música acústica; la voz
  no tiene consonantes y canta a la misma sonoridad que la música; los remates de premio heredan la tensión del acorde
  (un tritono como recompensa en 1 de cada 8 compases); seis pantallas comparten los mismos 8 compases.
- Escalar el Envido por tramo abre la brecha vacío/lleno del Truco; la cierra el Multi de mano (5 → 7), no la Vida.
- El contador nuevo lo confirma: 85–94 % de las partidas terminan con una Evolución despierta. No es un premio.
- Diseño repite tres P2: el Envido canta casi siempre (21 por partida), las maldiciones del Facón y el Garrote cobran
  por lo mismo, y el Golpe exacto ocurre menos de dos veces por partida. Y un error: el «de un saque» del Chancho no
  cuenta el Degüello.
- El desglose con nombres, apretado, baja a 14 px y corta palabras: lo marcan tres jurados.

**Medición.** Jurado de siete 8,7 · 8,6 · 8,4 · 8,6 (0 P0, 1 P1). Laboratorio sin avisos.

## 0.27.0 · Cero P0 (publicada)

**Qué se buscó.** Primer salto del mandato de obra maestra (meta nueva: Jurado ≥ 9,1 con 0 P0 y 0 P1, sin panel
simulado, con un séptimo juez de audio): cerrar el P0 de la mano del teléfono, separar ¡CHINCHÓN! del Chancho, que el
bot juegue el Sol, causa → efecto en los cobros y limpiar la Constitución.

**Lecciones.**
- Quinta subida seguida de los seis jurados visuales (8,6 · 8,5 · 8,5 · 8,6) y ningún P0: el de ux-móvil quedó cerrado
  haciendo ceder la cuenta y no la mano. Quedan 3 P1: escritorio con algo apoyado (arte), cuenta plegada que calla de
  más (móvil) y el sello SE PLANTA, que la aserción da por visto y nadie ve (deck): una aserción que mira el DOM no
  prueba que algo se vea.
- El juez de audio puntuó 5,1 la música vieja: sin reloj común, voces ajenas a la armonía, stingers desafinados. Baja
  la media de los siete a 8,3 · 8,0 · 7,9 · 8,1; es la línea de base de la 0.28.
- `corta` del Chinchón es muy sensible: de 2 a 3 de Escudo por carta sube 10 puntos de victorias; se compensó con Vida.
- Que el bot pague los descartes del Sol sube a todos los Mazos ~2 puntos: el descarte pasó a costar 5.
- El bot jugaba golpes de 4–5 cartas con 3 Postas (mano con cartas de más): lo cazó el humo de la interfaz, no el
  laboratorio. Las reglas se topan en `cuenta`, no en el paño.
- Diseño (P2): el Envido canta en casi todos los golpes del Truco (21,9 por partida), las maldiciones del Facón y el
  Garrote cobran por lo mismo, el Golpe exacto casi no ocurre y el informe no cuenta Evoluciones ni oro en descartes.

**Medición.** Jurado de siete 8,3 · 8,0 · 7,9 · 8,1 (seis visuales 8,6 · 8,5 · 8,5 · 8,6; audio 5,1). Laboratorio sin
avisos (vacío 28,0–31,4; lleno 45,1–48,6).

## 0.26.0 · Que cambie cómo se juega (publicada)

**Qué se buscó.** Que el Sol y el Brindis dejen de leerse como números y el Garrote no apague las Copas; que la Pierna
del Chancho cante; que el ¡CHINCHÓN! proteja de verdad; y los P0/P1 de la 0.25 (la mano del teléfono que se movía al
elegir, la Forja Brava sin cumbre, la sobra con dos cifras, la maldición cobrada en medio del golpe).

**Lecciones.**
- Cuarta subida seguida: media 8,3 en las cuatro columnas; el novato llega a 8,6 de Claridad y 8,5 de Veredicto, ux-deck
  a 8,6 de Estética. Nadie marcó P0 salvo ux-móvil (la mano todavía cede con la Escalera de 3 y en 390×664).
- Rehacer las Evoluciones las dejó mucho más flojas que las de la 0.25 y hundió cuatro Mazos (Mentiroso al 4 %): no
  eran las notas internas ni la configuración. Se recuperó con Garrote ×2 y gasto sólo en el golpe que no abate, Sol con
  tope 3 y un Brindis proporcional; después, Mazo por Mazo.
- En `mitiga` menos es más protección: lo tuve al revés un rato.
- Diseño marca que el bot no juega los descartes pagados del Sol: la recertificación no mide la regla más fuerte de la
  versión. Y que Pierna de Chancho (Aturde) y ¡CHINCHÓN! dan el mismo premio (no te pegan).
- Juice: el contragolpe tras el Garrote muestra el efecto antes que la causa (`ponerHud` antes de la espera); el golpe
  chico no tiene respiro.
- El panel simulado bajó a 61,7 % (−8,3, dentro del ruido) con el jurado en alza; Claridad del panel 5,75. Tercera vez
  que panel y jurado van en direcciones opuestas.

**Medición.** Jurado 8,3 · 8,3 · 8,3 · 8,3. Panel simulado 61,7 % (n = 60, IC95 49–73 %); Deck 56 % (n = 9), Móvil 67 %
(n = 15). Laboratorio sin avisos en los cinco Mazos (vacío 28,2–30,3, lleno 45,8–48,3).

## 0.25.0 · Lo que se paga (publicada)

**Qué se buscó.** El P1 que el jurado de diseño repetía por quinta vez (Evoluciones que eran números) con una maldición
por Evolución; que DEJALO JUSTO sea una decisión; una red de primer tramo para la Escoba; y los P0/P1 de la 0.24 (mesa
del teléfono, ayudas que tapaban al enemigo, Forja Brava).

**Lecciones.**
- Tercera subida seguida (+0,1 en cada columna) y Diseño +0,3 en Diversión: las maldiciones convencen cuando cambian
  cómo se juega (Facón, Garrote); el Sol y el Brindis siguen leyéndose como números, y meter el premio dentro del bloque
  MALDICIÓN confunde.
- Las maldiciones le costaron 3–6 puntos a cada Mazo y al Truco más que a nadie, con la brecha vacío/lleno al borde
  (≤ 21). Vida y bravas abren la brecha; el Envido es la palanca que mejor la cierra (cambiar Vida por Envido).
- Mesa limpia en el Truco no sirvió (sus caídas del tramo 1 ya eran bajas y la brecha creció): quedó sólo en la Escoba.
- Dejar de reservar el paño en el teléfono para mostrar la mano entera en reposo hizo que el primer toque mueva toda la
  mano (P0 de ux-móvil): el alto lo tiene que ceder el paño, no la mano.
- La sobra se muestra con dos cifras (24 y 72) porque el ×3 del Facón no aparece: toda cifra que cambia de escala dice
  por qué.

**Medición.** Jurado 8,2 · 8,2 · 8,3 · 8,2. Panel simulado 70,0 % (n = 60, dentro del ruido); Deck 78 % (n = 9), Móvil 80 %
(n = 15); Claridad del panel 6,0.

## 0.24.0 · Que se entienda a la primera (publicada)

**Qué se buscó.** Los P0 y P1 de la 0.23: ayudas que se abrían solas, el chip EXACTO que se leía como estado, la
Evolución sin causa, el resumen tapado en el teléfono y la Forja Brava sin suspenso; en reglas, que Perfora respete la
segunda cara del Rey.

**Lecciones.**
- Segunda ronda seguida de subida (+0,2 en Claridad, Veredicto y en la media), otra vez sin reglas grandes: el jurado
  premia que cada acción tenga verbo, premio y lugar propio.
- Que la oferta diga por qué evoluciona deja a la vista lo chico del premio: el jurado de diseño pide por quinta vez
  Evoluciones con regla nueva y maldición.
- DEJALO JUSTO casi siempre conviene: sin Perfora no es una decisión. O la mesa acomoda sola en exacto, o el dial tiene
  que decir qué se pierde.
- La regla `tip-tapa` protege botones y HUD, pero no al enemigo, TE PEGA ni la cuenta: la ayuda de la bandeja los tapa.
- Que el bot busque el exacto no subió los exactos y sumó 50 s al laboratorio: revertido.
- Escoba sigue con 17,9 % de caídas en el tramo 1 (Chancho 2,3 %): pide una red de primer tramo, no más Vida.

**Medición.** Jurado 8,1 · 8,1 · 8,2 · 8,1. Panel simulado 71,7 % (IC95 59–82 %, n = 60, plano); Claridad del panel 6,08.## 0.23.0 · Otra mano ya (publicada)

**Qué se buscó.** El Salto 3 (Altar que devuelve, resumen en dos capas con OTRA MANO YA) y los P0 de la 0.22: dibujo
propio de las Evoluciones, el baúl del Tesoro, la Cábala Negra en el teléfono; además, una Forja Brava que valga la
apuesta y el chip EXACTO para que el paño pida una decisión.

**Lecciones.**
- El mayor salto del ciclo (+0,3 de Claridad, +0,2 de Veredicto) vino de mostrar lo que ya existía (Evoluciones con arte,
  regla legible con mando), no de reglas nuevas.
- Un chip que usa la misma palabra que un veredicto («EXACTO» frente a «¡EXACTO!») se lee como estado, no como acción;
  y con «SOBRAN 24» al lado parece contradecirse. Las acciones van con verbo y premio.
- Una ayuda que se abre sola con el foco del programa tapa títulos y botones: el foco automático no debe abrir ayudas.
- El Facón que Perfora puede saltear la segunda cara del Rey: la sobra tiene que respetar «se planta en la mitad».

**Medición.** Jurado 7,9 · 8,0 · 8,1 · 7,9. Panel simulado 71,7 % (IC95 59–82 %, n = 60, dentro del ruido); Deck 56 %
(n = 9), Móvil 93 % (n = 15).
## 0.22.0 · Lo que despierta en la trastienda (publicada)

**Qué se buscó.** El Salto 2: Evoluciones, Forja Brava con mutación, Cábala Negra, Tesoros a la vista, contrapesos y
TURBO; además, los P0 de la 0.21 (el paño en fila propia, el «−N» junto a VIDA, dianas de 44 px en el teléfono).

**Lecciones.**
- Las Evoluciones como ×2 subían 20 puntos: se rehicieron como sumas chicas. El jurado ahora dice lo contrario, que son
  retoques que no cambian la manera de jugar (el Facón es casi la Lanza). El punto medio es una regla nueva con costo.
- Un jackpot sin arte propio no es jackpot: tres jurados pidieron sprites malditos, una transformación que no se corte en
  sus primeros 400 ms y «antes → después». Y «Lo que llevás» seguía mostrando el Amuleto viejo.
- La Forja Brava pide pasar un 35 % y un 50 % de riesgo para ganar poco; el bot nunca la toma, así que el laboratorio no
  la mide.
- La guardia de honestidad del panel frena palabras de venta: «Épico» (el nombre de la rareza) cuenta como tal.

**Medición.** Jurado 7,6 · 7,9 · 8,1 · 7,7. Panel simulado 73,3 % (IC95 61–83 %, n = 60); Deck 67 % (n = 9), Móvil 80 %
(n = 15). Claridad del panel 6,12.
## 0.21.0 · La mesa de paño (publicada)

**Qué se buscó.** El Salto 1 del mandato para despegar de Balatro: Postas del paño con Medio, Chispa y Escalón, y Chiches
de un solo uso sobre la madera.

**Qué entró.** Postas de 3 a 5 con acomodo automático (`mejorAcomodo`) y reorden a mano; cinco Chiches con Prenda de la
Corte; Máscara del Rey como pieza de la forja.

**Lecciones.**
- El jurado previo bajó (7,3 · 7,6 · 7,9 · 7,6) porque el paño quedaba detrás de la mano: una mecánica nueva que no se ve
  resta más de lo que suma. Se archivó como `jurado/0.21.0-previa` y se arregló antes de publicar.
- El Escalón «+1 por naipe» premiaba las manos largas: Chinchón, Mentiroso y Chancho perdieron 5 puntos al pasarlo a +2
  fijo y se reafinaron con el Multi de mano y la Vida.
- Con la mesa acomodando sola, el paño deja de ser una decisión (jurado de diseño): el reordenamiento tiene que valer algo
  más que el máximo, por ejemplo apuntar al exacto. Y la mano y el paño no pueden compartir franja.
- Al rebasar ramas de reglas, tomar `--theirs` en `balance-config.json` pisa los números recién afinados.

**Medición.** Jurado 7,5 · 7,7 · 8,0 · 7,7. Panel simulado 70,0 % (IC95 57–80 %, n = 60, dentro del ruido de la 0.20);
Deck 67 % (n = 9), Móvil 73 % (n = 15).
## 0.20.0 · Las dos caras del Rey (publicada)

**Qué se buscó.** Que cada Rey muestre su segunda cara, sacar el Multi plano de la Escoba, ordenar lo que vuela sobre la
mesa y que el metajuego sea un lugar.

**Qué entró.** El Rey se planta en la mitad; Multi de mano chico; director de escena; crítico en el MULTI; glifos de mando
en todas partes; Altar, Colección, portada, Ajustes y Crónica como lugares.

**Lecciones.**
- Plantar al Rey en la mitad funciona en el motor, pero el número del golpe sigue mostrando el total: la mesa dice «280»
  y la barra baja 1. Lo que se dibuja tiene que salir de lo que entra (`aVida`), no de la cuenta.
- La QA visual dio 0 fallos y aun así las fichas de los Reyes se cortaban en la Colección: hay que mirar las capturas.
- El director de escena protege el naipe y la cuenta, no los botones ni la bandeja: los «+N» caen sobre GOLPEAR.
- Para que el laboratorio entre en su tope, cada celda se parte en trozos que juegan las mismas semillas (0.21).

**Medición.** Jurado 7,7 · 7,6 · 8,2 · 7,7. Panel simulado 76,7 % (IC95 65–86 %, n = 60); Deck 78 % (n = 9), Móvil 87 %
(n = 15). Caídas en el tramo 1: de 3,6 % (Truco) a 29,9 % (Mentiroso).
