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

## 0.2.0 · en curso (rama `v0.2`, sin publicar)

**Hipótesis.** Las reseñas bajan por fricción de lectura y de toque: si cada cosa que se toca mide lo que debe y cada
regla que se aplica se ve en la mesa, sube la Claridad.

Hecho en la rama: fuera la salpicadura de Oros; la tira del HUD es un solo botón que abre «LO QUE LLEVÁS»; tabla de
JUGADAS en la mesa (tecla J); cartas Inmunes marcadas en la mano; letra de texto DotGothic16 (cifras nítidas) en lugar
de Pixelify Sans; reglas de dianas en la QA visual (chica, pegada, pisada); Chinchón 63 y Chancho Va 57 de Vida.
Puertas en verde: tipos, 51 pruebas, forja y linter, laboratorio sin avisos (29,9–32,6 % / 45,0–48,7 %), QA visual
ES y EN (100 capturas cada una, 0 fallos), humo ES y EN, build.

**Pendiente antes de publicar:** la puerta de FPS falla en la primera tanda de golpes (un cuadro de ~125 ms en el
primer golpe a 1366×768). No es la tipografía, ni el filtro, ni la VRAM: el navegador lo atribuye al temporizador de
`volar()` en `src/client/mano.ts`, es decir, al código que sigue al vuelo de las cartas en el primer golpe. Después:
medir la 0.2.0 con el panel contra el listón de arriba.
