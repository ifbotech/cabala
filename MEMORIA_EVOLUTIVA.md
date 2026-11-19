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
