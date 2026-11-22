```json
{
  "jurado": "jurado-novato",
  "version": "0.26.0",
  "puntajes": { "claridad": 8.6, "diversion": 8.3, "estetica": 8.3, "veredicto": 8.5 },
  "defectos": [
    { "prioridad": "P1", "pantalla": "secuencias maldicion (Garrote del Cacique) y contragolpe", "ventana": "1280x800", "archivo": "src/client/pantallas/mesa.ts:119-123 (nacerEnDueno: a más de 700 px el «−N» nace en r.top − h − 12, encima de la caja del HUD, o sea arriba de la mano) y mesa.ts:893-897 (cobrarMaldicion) y 1156 (el Escudo que frena)", "que": "El cobro nuevo del Garrote, «−5» azul con el garrote al lado, aparece arriba del 9 de Copas que tengo en la mano (maldicion-09/10). Lo mismo pasa con el «−4» del Escudo que frena en contragolpe-08. Parece que la carta perdió 5. Además ESCUDO pasa de 10 a 5 y enseguida a 0, en el mismo instante en que la Vida baja de 45 a 27.", "por_que": "El Garrote es la pieza nueva de esta versión y su costo es justamente gastar Escudo. Antes de golpear, la cuenta lo dice muy bien («MALDICIÓN −5 DE ESCUDO», «TE PEGA 18 · 23 − 5»). Pero cuando se cobra, el número cae sobre una carta y no sobre ESCUDO, así que lo leo como daño a mi naipe o directamente no lo veo.", "propuesta": "En las ventanas anchas, que el «−N» de Escudo y de Vida nazca adentro de su caja del HUD o pegado a su borde, nunca sobre la mano (descontar de la zona prohibida las cajas de [data-carta]). Que diga «−5 ESCUDO» y dejar unos 250 ms entre el cobro (10→5) y el golpe del enemigo (5→0, Vida −18), para que se vean dos cosas distintas." },
    { "prioridad": "P1", "pantalla": "mesa-dejalo-justo / mesa-pega-todo (dial)", "ventana": "390x844 (y el verbo, también a 1280)", "archivo": "src/client/pantallas/mesa.ts:477 y 482 (por debajo de 700 px el dial deja afuera lo que pierde) y mesa.ts:489 (el botón no tiene verbo de acción, solo el glifo R3)", "que": "En el teléfono, la caja dice «DEJALO JUSTO · +3 de oro · +1 Multi al próximo» y, justo abajo, la cuenta dice «LO ABATÍS · 24 ×3 = 72 PASAN». No dice que dejarlo justo hace que esos 72 no pasen, y no hay nada que me avise que la caja se toca. A 1280 la cuenta ya cierra («no pasan 24 ×3 = 72»), pero la caja sigue pareciendo un cartel y no un botón: el único verbo es «R3».", "por_que": "Esta decisión es lo único que el juego me hace elegir antes de golpear. Si en el teléfono me muestra el premio sin el costo, y además no sé si estoy leyendo el estado actual o una opción, elijo a ciegas o ni me entero de que había algo para elegir.", "propuesta": "Que en el teléfono la caja diga «TOCÁ: DEJALO JUSTO · +3 oro · +1 Multi · 72 no pasan» y en la ventana ancha «R3 / clic: DEJALO JUSTO». Y que la cuenta muestre el estado actual con la misma palabra («PEGÁS CON TODO · 72 PASAN»), así la caja se lee como la otra opción." },
    { "prioridad": "P2", "pantalla": "fin-derrota", "ventana": "1280x800", "archivo": "src/client/pantallas/camino.ts:1342 (el «nivel 2» va suelto) y camino.ts:1360-1361 (frenoTramo + leQuedaba)", "que": "Esto sigue igual que en la 0.25: «QUÉ TE FRENÓ: El Caudillo en el tramo 2 / le quedaba 50%» está mal armada, y el «nivel 2» va pegado a la última ficha de TU ARMADO sin que se sepa de cuál es. Ahora además se ve «TU JUGADAEnvido», todo junto, y el título dice «TE LLEVÓ LA CORTE» aunque el que me frenó fue un Rey.", "por_que": "Es la pantalla donde un novato entiende por qué perdió y qué tiene que mejorar. Si las frases no cierran, la lección se pierde.", "propuesta": "Que diga «Al Caudillo (tramo 2) le quedaba 50 %». Que el nivel vaya adentro de la ficha («II» o «nivel 2» debajo de esa pieza), que haya un espacio entre TU JUGADA y su nombre, y que el título nombre a quien te llevó («TE LLEVÓ EL CAUDILLO»)." }
  ],
  "aciertos": [
    "Mis dos P1 de la 0.25 están resueltos. Lo que sobra tiene una sola cifra con su causa: «SOBRAN 24 ×3 = 72 PASAN» en la cuenta y «no pasan 24 ×3 = 72» en el dial. Y si lo abato, la placa dice «NO TE PEGA · 0 LO ABATÍS», no el ataque pelado.",
    "El ¡CHINCHÓN! se entiende de una: la placa de arriba dice «NO TE PEGA · 0 ¡CHINCHÓN!» y la cuenta lo repite en celeste. En el teléfono también.",
    "Al Garrote, antes de golpear, lo entendí a la primera: «GARROTE DEL CACIQUE +20» en DAÑO, «+2» en MULTI, «MALDICIÓN −5 DE ESCUDO» y TE PEGA, que se recalcula a «23 − 5». Es una cuenta que cierra.",
    "En la oferta de Evolución, la regla va arriba a lo ancho y la MALDICIÓN abajo, en rojo y con el costo solo («cada golpe te bebe 1 de Vida»). El premio del Brindis ya no está metido en lo rojo. Era mi P2 y está resuelto.",
    "«DESCARTAR ∞ · −3 oro» se lee sin abrir nada. Y en la Forja Brava, el Bufón ya canta «¡FORJA BRAVA! Doble Filo.» y la cumbre «¡FORJA BRAVA!» corona el naipe."
  ],
  "capturas_vistas": [
    "visual-qa/1280x800/portada.png", "visual-qa/1280x800/elegir-mazo.png", "visual-qa/1280x800/cabala.png", "visual-qa/1280x800/mapa.png",
    "visual-qa/1280x800/mesa.png", "visual-qa/1280x800/mesa-seleccion.png", "visual-qa/1280x800/mesa-rey.png", "visual-qa/1280x800/mesa-mentiroso.png",
    "visual-qa/1280x800/elegi-una.png", "visual-qa/1280x800/pulperia.png", "visual-qa/1280x800/fogon.png", "visual-qa/1280x800/jugadas.png",
    "visual-qa/1280x800/piezas.png", "visual-qa/1280x800/fin-derrota.png", "visual-qa/1280x800/mesa-garrote.png", "visual-qa/1280x800/mesa-sol.png",
    "visual-qa/1280x800/mesa-dejalo-justo.png", "visual-qa/1280x800/mesa-pega-todo.png", "visual-qa/1280x800/mesa-chinchon.png", "visual-qa/1280x800/oferta-evoluciona.png",
    "visual-qa/1280x800/mesa-maldicion.png", "visual-qa/1280x800/mesa-escudo.png", "visual-qa/1280x800/forja-brava.png", "visual-qa/1280x800/fogon-mutaciones.png",
    "visual-qa/1280x800/hud-evolucion-foco.png",
    "visual-qa/390x844/mesa.png", "visual-qa/390x844/mesa-seleccion.png", "visual-qa/390x844/mesa-garrote.png", "visual-qa/390x844/mesa-chinchon.png",
    "visual-qa/390x844/oferta-evoluciona.png", "visual-qa/390x844/mesa-dejalo-justo.png",
    "mirar/1280-mesa-grito.png", "mirar/1280-comodin-espectral-racha.png", "mirar/1280-conteo.png", "mirar/1280-rey-cae.png",
    "mirar/1280-forja-brava-elegir.png", "mirar/1280-fogon-suspenso-brava.png", "mirar/1280-forja-brava-x2.png", "mirar/1280-forja-brava-despues.png",
    "mirar/1280-forja-brava-quemada-despues.png", "mirar/1280-fogon-templada.png",
    "jurado/secuencias/1280-golpe-00, 04, 07, 09", "jurado/secuencias/1280-maldicion-04, 06, 08, 09, 10, 11, 15",
    "jurado/secuencias/1280-contragolpe-00, 08, 13", "jurado/secuencias/1280-postas-golpe-00, 05, 07", "jurado/secuencias/1280-rey-segunda-10",
    "jurado/secuencias/1280-botin-brota-08", "jurado/secuencias/390-maldicion-09"
  ]
}
```

## Primeras impresiones (antes de abrir el código)

- **¿Cómo gano?** Bajo a cero la barra de cada uno de la Corte («LA CORTE · QUEDA 1»). Está claro.
- **¿Qué hace el enemigo?** «TE PEGA 19 · 23 − 4 ESCUDO». En el Rey dice «FURIA 3 ya incluida · +3 por turno» y su golpe especial viene en un cartel amarillo. Si lo abato, «NO TE PEGA». Si canto ¡CHINCHÓN!, también.
- **Números del enemigo:** la Vida, TE PEGA y la Furia se entienden. El «10» del naipe sigue siendo la cifra más grande y no me dice nada.
- **Furia, Inmune, Escudo, Multi, canto, Golpe exacto:** se entienden («¡EXACTO!», con el Bufón: «Dejalo en 0 justo y cobrás oro y Multi»). **Comodín:** lo explica JUGADAS en una línea, y en la mesa se ve como un fantasma del naipe que copia.
- **Palabras que no conozco:** «RACHA ×2», «LO ATURDÍS», «Envido», «corre de Posta», «lo que le dejó el fuego» y SEGUIR en el Fogón. A la Brindis de Sangre y a la Pierna del Chancho Va (¡CHANCHO!) no las vi en ninguna captura: solo las conozco por el código.

## Defectos menores

- En mesa-chinchon a 1280, la columna de reglas de la izquierda se angosta y «corre de Posta» queda cortado detrás del 2 de Espadas (`src/client/estilos/mesa.css:563`, `.pano-regla.costado`).
- «SOBRAN 38» sin Perfora no dice adónde van; tendría que decir «SOBRAN 38 · SE PIERDEN» (`src/client/pantallas/mesa.ts:426`).
- La ayuda de la bandeja está más compacta y ya no tapa los sellos, pero sí el «descarta» de la pista y el rótulo CHICHES (`src/client/ui.ts:222`).
- En golpe-07, la caja que late de «LE QUEDAN 79» sigue rozando el 9 de «TE PEGA 19» (`src/client/estilos/mesa.css`, pulso de la cuenta).
- La Ginebra aparece como «MULTI +3» en la cuenta y no con su nombre (`src/client/pantallas/mesa.ts:497`).

## Contra mi veredicto de la 0.25

**Resueltos:** el P1 de «sobran 24 / pasan 72» (ahora es una sola cuenta, con su ×3 a la vista), el P1 de TE PEGA cuando lo abato («NO TE PEGA · LO ABATÍS»), el P2 de la Evolución (la regla arriba, la maldición abajo y sin premio adentro), los sellos tapados por la ayuda y la voz del Fogón después de una Forja Brava que sale bien. **Siguen:** «QUÉ TE FRENÓ» mal armada, el «nivel 2» suelto, el dial que no tiene verbo de acción, SEGUIR en el Fogón y el «10» gigante del naipe enemigo.

## Qué haría en la próxima versión

Un pase de «cada número cae donde vive». (1) Los «−N» de Vida, Escudo y oro nacen en su caja del HUD, nunca sobre una carta, y el cobro de una maldición tiene un respiro propio antes del golpe del enemigo. (2) El dial es un botón con verbo en todas las ventanas («TOCÁ / R3: DEJALO JUSTO · 72 no pasan») y la cuenta dice en qué estado estás («PEGÁS CON TODO»). (3) El resumen final con frases enteras («Al Caudillo, en el tramo 2, le quedaba 50 %», «TE LLEVÓ EL CAUDILLO») y el nivel dentro de su ficha. (4) Capturas de QA de la Brindis bebiendo y de ¡CHANCHO! con la Pierna, para poder juzgarlas. (5) Que el «10» del naipe enemigo achique a favor de su Vida. Nada de esto toca la Constitución. Con (1) y (2), la claridad llega a 8,8.
