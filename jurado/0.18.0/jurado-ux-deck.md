```json
{
  "jurado": "jurado-ux-deck",
  "version": "0.18.0",
  "puntajes": { "claridad": 7.1, "diversion": 7.7, "estetica": 8.4, "veredicto": 7.3 },
  "defectos": [
    { "prioridad": "P1", "pantalla": "Mesa con mando, vista previa del golpe (mesa-mando, mesa-seleccion, mesa-segunda-cambia)", "ventana": "1280x800 (y 1366x768)", "archivo": "src/client/pantallas/mesa.ts:241-268 (el veredicto reemplaza a las cifras) y :298-317 (marcarTajada); src/client/estilos/mesa.css:3188-3205 (.b-previa)", "que": "Antes de soltar, la cuenta dice «NO LO ABATÍS» o «LO ABATÍS» en letra de ~40 px, pero no da ninguna cifra de total. El desglose deja ocho sumandos sueltos (DAÑO 4 · +6 · +10 / MULTI 1 · +4 · +2 · +1 · +1). Lo único que gradúa el golpe es la tajada: un damero de 4 px rosa sobre rojo que late entre 0,35 y 0,75 de opacidad, montado ENCIMA del nombre del enemigo. Recortada y ampliada al doble apenas se distingue; a 40 cm no se ve.", "por_que": "Con cruceta, elegir es comparar: A en una carta, mirar; A en otra, mirar. En la 0.17 comparabas 168 contra 85. Ahora comparás «NO LO ABATÍS» contra «NO LO ABATÍS». Saber qué jugada le saca más, o cuál te guarda cartas para el turno siguiente, pasa a ser una suma mental de ocho términos en una pantalla de 7 pulgadas. El suspenso suma después de soltar, no antes de decidir.", "propuesta": "Dejar el veredicto grande y el conteo con remate, pero dar la magnitud: «LE SACÁS ~180 · LE QUEDAN ~160» en chico al lado del veredicto, o una tajada maciza (color sólido, canto hueso de 2 px, nada de latido por debajo de 0,8) en una franja propia bajo la barra, sin pisar el nombre, con su porcentaje. El total exacto puede seguir revelándose en el conteo." },
    { "prioridad": "P1", "pantalla": "Mesa al elegir la primera carta (mesa → mesa-mando / mesa-seleccion; 1280-mando-00 → 03)", "ventana": "1280x800 y 1366x768", "archivo": "src/client/estilos/mesa.css:3245-3290 (bloque «la mano manda»: .escena con grid-template-rows minmax(0,1fr), clip-path de .e-centro y la mano con margin-bottom de −44 px)", "que": "Cuando pasás de 0 a 1 carta elegida, la cuenta crece y aplasta la escena: toda la mitad de arriba salta ~55 px. El naipe del Rey pierde la cabeza, el bocadillo del Bufón sube y el rótulo «LA CORTE» se mete debajo de SEL JUGADAS (en 1366 solo asoma la «L»). Con tres elegidas (mesa-seleccion), los naipes suben y el canto de arriba se esconde bajo la cuenta. La QA da 0 recortes porque el rótulo no está recortado, está tapado.", "por_que": "Con mando, cada A mueve media mesa. El ojo pierde el ancla justo cuando quiere leer la cuenta, y la pila de lo que viene se queda sin título. A 40 cm, un salto de 55 px a cada toque cansa y desorienta.", "propuesta": "Reservar siempre el alto de la cuenta: en reposo, la misma caja que en la previa (como ya hacen con el ancho: «las cifras finales ya están en su lugar, invisibles»). O que crezca hacia el hueco entre la pista y la mano, sin empujar la escena. Poner el rótulo de La Corte donde no lo cruce la cabecera y sumar a la QA el cruce rótulos ∩ cabecera ∩ cuenta en mesa-seleccion." },
    { "prioridad": "P1", "pantalla": "Mano con foco y selección a la vez (mesa-seleccion, mesa-mando)", "ventana": "1280x800", "archivo": "src/client/estilos/mesa.css:443-463 (.carta.elegida .px, .carta:focus-visible .px y .carta.elegida:focus-visible .px)", "que": "La carta elegida lleva canto oro de 2 px × k; la enfocada, canto hueso de 3 px × k, halo oro al 45 % y 1,1×; la enfocada y elegida, canto oro de 3 px × k y el mismo halo. Con los naipes a 2× y pegados, el halo queda bajo el vecino y el 1,1× se pierde bajo el HUD. En mesa-seleccion las medidas dicen que el foco está en el «1», pero en la imagen no se distingue cuál de los tres naipes lo tiene. En mesa-mando, el elegido (4 de Copas) y el enfocado (Comodín) son dos dorados casi iguales.", "por_que": "«¿Dónde estoy?» es la primera pregunta en la Deck. Si no sabés si el A va a elegir o a soltar, ni qué carta, cada golpe arranca con un toque de prueba y el error se paga con un descarte.", "propuesta": "Separar los canales. Selección = carta subida + canto oro. Foco = otro color (hueso o cian) y una forma que no se tape: una flecha ▼ sobre el índice, fuera del naipe, o un marco con z-index por encima de los vecinos, igual con o sin selección. Que la QA mida el contraste entre foco y elegida en mesa-seleccion." }
  ],
  "aciertos": [
    "Mano a 2× en la Deck: naipes de 200×280 e índices de ~30 px que se leen a 40 cm; el Mentiroso de 8 entra montado con franja mínima de 104 px y todos los índices a la vista (mesa-mentiroso).",
    "El grito del Personaje va entre la pista y la mano (mesa-grito) y ya no tapa Escudo ni Oro.",
    "Tajo de revés con una sola gramática: «48 / 24 ×2» en la placa, «TE PEGA 48 (24 ×2)» en la cuenta y «24 ×2 = 48» sobre el Rey al pegar, igual antes y durante (1280-rey-tajo-03 → 11).",
    "minPx 18 en las 32 pantallas de 1280 y 1366, dianas ≥ 48 px y 0 solapes; FPS 164,6 bajo golpes a 1280x800, con peor cuadro de 12 ms.",
    "El conteo con remate (DAÑO 17 × MULTI 9 = 153 · SOBRAN 151, 1280-mando-03 → 06) se arma término a término y se lee de lejos: lo mejor de la versión."
  ],
  "capturas_vistas": [
    "visual-qa/1280x800/mesa.png", "visual-qa/1280x800/mesa-mando.png", "visual-qa/1280x800/mesa-seleccion.png", "visual-qa/1280x800/mesa-mentiroso.png",
    "visual-qa/1280x800/mesa-grito.png", "visual-qa/1280x800/mesa-rey.png", "visual-qa/1280x800/mesa-segunda.png", "visual-qa/1280x800/mesa-segunda-cambia.png",
    "visual-qa/1280x800/mapa-mando.png", "visual-qa/1280x800/jugadas.png", "visual-qa/1280x800/piezas.png", "visual-qa/1280x800/pulperia.png",
    "visual-qa/1366x768/mesa-mando.png",
    "jurado/secuencias/1280-mando-00/03/06/10/14/17.png", "jurado/secuencias/1280-mando-elige-03.png",
    "jurado/secuencias/1280-rey-tajo-03/04/09/11.png", "jurado/secuencias/1280-rey-irrumpe-05.png",
    "medidas.json de las 32 pantallas de 1280x800 y 1366x768 (node)", "jurado/fps.txt"
  ]
}
```

## Veredicto

La 0.18.0 hizo lo que más pedí: la mano manda en la Deck (naipes a 2×), el grito ya no tapa el HUD y el Tajo tiene una sola fórmula. Pero el «golpe que se descubre» le quitó a la vista previa lo que más se usa con mando: un número para comparar jugadas. Y la cuenta, al crecer, empuja la escena hacia arriba en cada primer A. Mientras tanto, el foco y la selección siguen hablando con el mismo dorado. En reposo es la mesa más legible que tuvo CÁBALA; al usarla con la cruceta, se mueve y no te dice cuánto. Bajo la claridad (pesa doble) y queda en «Verificado con reparos».

**Seguimiento de la 0.17.0:** resuelto el P1 del grito sobre Escudo y Oro. Resuelto el P1 del Tajo con dos fórmulas. El P1 de la ayuda del naipe templado lo leí en el commit (ui.ts) pero no lo vi: ninguna captura de 1280 trae un naipe templado. Siguen los glifos B y Start, los «+N» de la bandeja, «ESTÁS ACÁ» ambiguo y «Turno 1» a 18 px. Se fueron la ficha «∠» y el separador comido.

Avisos sobre el material: rey-tajo y rey-irrumpe siguen grabadas en modo puntero (AL DESCARTE, «? JUGADAS»). El sonido del remate lo leí en el código: no lo oí.

## Defectos menores

- Se pisan dos bocadillos: el del Rey (.e-dice, a la izquierda del naipe, top 10 %) tapa el del Bufón y el «Turno 4» (1280-rey-tajo-09 y -11). La regla grito-tapa no los cruza entre sí: `src/client/estilos/mesa.css:3315-3323`.
- Dos «TE PEGA» para el mismo golpe: 21 en la placa del Rey y «TE PEGA 19» en la cuenta (mesa-segunda-cambia), porque la cuenta descuenta Escudo según la Estocada y la placa no. Además, «ESTOCADA DEL CAUDILLO» no muestra su regla, cuando el Tajo sí la muestra: `src/client/pantallas/mesa.ts:141` y `:253`.
- Los «+N» y «×2» que brincan en la bandeja tapan las cifras de las cargas: un «×2» gigante sobre FILO 6 (1280-rey-tajo-04) y un «+10» sobre FORTUNA 3 (1280-mando-03). Ver `src/client/hud.ts:227`.
- Sigue sin haber glifo B en CERRAR, SALTAR, SEGUIR y SALIR ›, ni glifo A en ELEGIR del Botín. `glifo()` existe (`src/client/nav.ts:74`) y solo lo usa `mesa.ts:214`.
- «ESTÁS ACÁ» bajó, pero ahora queda entre el nodo enfocado y el de abajo sin decir de cuál es (mando-elige-03): `src/client/estilos/pantallas.css:2218-2230`.

## Qué haría en la próxima versión

«La mesa quieta y el foco inconfundible». Uno: la cuenta tiene el mismo alto en reposo y en la previa; elegir una carta no mueve nada de la escena, y la QA compara las cajas de mesa y mesa-seleccion (el Rey, La Corte y el Bufón no pueden correrse más de 4 px). Dos: la previa conserva el veredicto y agrega la magnitud (cuánto le sacás y cuánto le queda, aproximado), con una tajada maciza en su propio carril; el conteo sigue revelando la cifra exacta con su remate. Tres: el foco tiene canal propio (otro color y una marca fuera del naipe) y la selección conserva el oro y la subida; las dos se miden por contraste en la QA. Cuatro: un solo «TE PEGA» por golpe en todas partes (neto, con la causa en chico) y la regla de cada rasgo a la vista, como ya tiene el Tajo. Cinco: glifos A, B y Start en todo botón, y todas las secuencias de 1280 grabadas con data-entrada='mando'. Nada de esto toca reglas ni la Constitución.
