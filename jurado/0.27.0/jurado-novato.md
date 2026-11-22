```json
{
  "jurado": "jurado-novato",
  "version": "0.27.0",
  "puntajes": { "claridad": 8.9, "diversion": 8.4, "estetica": 8.5, "veredicto": 8.7 },
  "defectos": [
    { "prioridad": "P2", "pantalla": "mesa-seleccion, mesa-exacto, mesa-dejalo-justo, secuencia golpe-00 a 07 (el desglose antes de golpear)", "ventana": "1280x800", "archivo": "src/client/pantallas/mesa.ts:349-355 (los niveles «chico» sacan el nombre de las piezas cuando el desglose pasa de 140 px) y src/client/estilos/mesa.css:5068-5080 (.c-bajo.chico … .d-n)", "que": "Antes de golpear, en la Deck el desglose me muestra «espadita +4», «varita +8», «dado +10» y, en MULTI, «hueso +1» y «cascabel −1» sin una palabra. Los nombres existen: aparecen recién cuando el golpe ya salió (contragolpe-08: «Filo +4», «Primera sangre +8», «Taba cargada +10», «Cascabel sin ca…»), y ahí la mano que vuelve los tapa («SOL DE LA TIMB…», «Cascabel sin ca…» quedan detrás del 9 de Copas).", "por_que": "El momento en que decido es antes de golpear, y justo ahí los nombres no están. El «−1» de Multi es un castigo que podría evitar (golpe sin canto) y no sé de quién es ni por qué. Aprendo los nombres cuando ya no puedo cambiar nada, y cortados.", "propuesta": "Que el primer paso para achicar sea juntar renglones o acortar nombres («Filo», «1.ª sangre», «Taba c.»), no borrarlos. Como mínimo, que todo término negativo conserve siempre su nombre y su causa («Cascabel: sin canto −1»). Y que la mano no vuelva encima del desglose mientras siga encendido." },
    { "prioridad": "P2", "pantalla": "mesa-mentiroso (ENGAÑO) y mesa-chancho (PASAR)", "ventana": "1280x800", "archivo": "src/client/pantallas/mesa.ts:2449 (el botón ENGAÑO solo explica en su ayuda al foco) y mesa.ts:839 (PASAR reemplaza a DESCARTAR sin renglón propio); la pista del paño se arma en mesa.ts:609", "que": "Dos Mazos tienen un botón que es toda su gracia y la mesa no dice qué hace. En El Mentiroso hay un tercer botón «LT ENGAÑO» con un antifaz; en Chancho Va, DESCARTAR pasa a llamarse «PASAR» con una cartita y una flecha. El renglón de pistas dice lo mismo que en Escoba («Medio: pega doble · 3 o más en subida…») y la pista de botones ni nombra LT.", "por_que": "DESCARTAR lleva su costo a la vista («∞ · −5 oro», «(3)»). Estos dos no llevan nada: no sé si ENGAÑO cuesta, si se gasta o qué le pasa a la carta, ni a quién le paso qué. Con el Mazo recién elegido es lo primero que quiero probar y lo pruebo a ciegas.", "propuesta": "Un renglón chico bajo el botón, como el «−5 oro» de DESCARTAR: «ENGAÑO · tu carta pasa por otra» y «PASAR · das una, te llega otra» (con el texto real de la regla), y sumar LT a la pista de botones." },
    { "prioridad": "P2", "pantalla": "mesa-seleccion / golpe-00 (el Comodín en el paño) y mesa, mesa-chancho (el 6 y el 9)", "ventana": "1280x800", "archivo": "src/client/pixel/naipes.ts:97 (indice(): el de abajo es el de arriba girado 180°, sin marca) y src/client/estilos/mesa.css:1378 (el rótulo COMODÍN del naipe espectral)", "que": "El 9 de Copas lleva un «9» arriba y un «6» abajo; el 6 de Copas, un «6» arriba y un «9» abajo. Y cuando el Comodín copia al 9, en el paño el rótulo COMODÍN le tapa la esquina de arriba: la única cifra que le queda a la vista es el «6» de abajo, mientras la cuenta dice «DAÑO 9 + 9».", "por_que": "No conozco la baraja. Veo un naipe que dice 6, una cuenta que dice 9 y tengo que creerle a una de las dos. Es un segundo de duda en cada 6 y cada 9, y con el Comodín la duda no se resuelve mirando.", "propuesta": "Una rayita bajo el 6 y el 9 del índice (como en cualquier naipe), y que el rótulo COMODÍN del espectro no pise el índice de arriba (o que el espectro lleve su «9» al lado del rótulo)." }
  ],
  "aciertos": [
    "Mis dos P1 de la 0.26 están resueltos. El «−5 ESCUDO» del Garrote nace en la caja de ESCUDO (maldicion-10: 10 → 5, con el garrote al lado) y el «−19» y el «−4 ESCUDO» del contragolpe nacen en VIDA y ESCUDO, primero el cartel y después la cifra (contragolpe-08 → 10). Ya nada cae sobre una carta.",
    "El dial ya es un botón y la cuenta dice dónde estoy: «PEGÁS CON TODO · SOBRAN 24 ×3 = 72 PASAN» con la caja «DEJALO JUSTO · +3 de oro · +1 Multi · no pasan 72», y al revés «LO DEJÁS JUSTO» con «PEGÁ CON TODO · 72 pasan · sin los +3 de oro». En el teléfono la caja dice «TOCÁ» y trae el costo.",
    "fin-derrota cierra: «TE LLEVÓ EL CAUDILLO», «TU JUGADA: Envido · 2 del mismo palo (Truco)», «El Caudillo (tramo 2) · le quedaba 50 % de su Vida», y el «nivel 2» va debajo de su ficha.",
    "El turno del enemigo se lee sin abrir nada: «TE PEGA 19 · 23 − 4 ESCUDO», «FURIA 3 · ya incluida · +3 por turno», y en el Rey la causa va debajo de la cifra («19 ×2», «TAJO DE REVÉS: si repetís, TE PEGA ×2»).",
    "El ¡CHINCHÓN! hace cuentas que cierran: «CORTÁS 4 cartas × 6 = +24 ESCUDO», un «+6» sobre cada carta que queda y TE PEGA que baja a «31 − 28 ESCUDO»."
  ],
  "capturas_vistas": [
    "visual-qa/1280x800/portada.png", "visual-qa/1280x800/elegir-mazo.png", "visual-qa/1280x800/cabala.png", "visual-qa/1280x800/mapa.png",
    "visual-qa/1280x800/mesa.png", "visual-qa/1280x800/mesa-seleccion.png", "visual-qa/1280x800/mesa-rey.png", "visual-qa/1280x800/mesa-mentiroso.png",
    "visual-qa/1280x800/elegi-una.png", "visual-qa/1280x800/pulperia.png", "visual-qa/1280x800/fogon.png", "visual-qa/1280x800/jugadas.png",
    "visual-qa/1280x800/piezas.png", "visual-qa/1280x800/fin-derrota.png", "visual-qa/1280x800/mesa-dejalo-justo.png", "visual-qa/1280x800/mesa-pega-todo.png",
    "visual-qa/1280x800/mesa-chinchon.png", "visual-qa/1280x800/mesa-exacto.png", "visual-qa/1280x800/mesa-chancho.png", "visual-qa/1280x800/botin.png",
    "visual-qa/390x844/mesa-dejalo-justo.png", "visual-qa/390x844/mesa-pega-todo.png", "visual-qa/390x844/mesa-chinchon.png", "visual-qa/390x844/elegi-amuleto.png",
    "jurado/secuencias/1280-golpe-00, 03, 05, 07, 09", "jurado/secuencias/1280-maldicion-08, 09, 10, 12",
    "jurado/secuencias/1280-contragolpe-08, 10, 13", "jurado/secuencias/1280-rey-tajo-06"
  ]
}
```

## Primeras impresiones (antes de abrir el código)

- **¿Cómo gano un combate?** Bajo a cero la barra roja de cada uno («LA CORTE · QUEDA 1»). Elijo cartas, miro «DAÑO × MULTI = total» y «LE QUEDAN», y aprieto GOLPEAR. Se entiende sin leer nada.
- **¿Qué hace el enemigo?** Me pega lo que dice arriba: «TE PEGA 19 · 23 − 4 ESCUDO». Si lo abato, «NO TE PEGA · 0 · LO ABATÍS». Lo vi cobrarse en mi VIDA y mi ESCUDO.
- **Los números del enemigo:** Vida («475/475»), TE PEGA y Furia, claros. El «10» verde del naipe sigue siendo la cifra más grande de la pantalla y no me sirve para nada.
- **Furia:** sube 3 por turno y ya está sumada. **Inmune:** las cartas de ese palo se agrisan con un escudito tachado. **Escudo:** se resta de TE PEGA. **Multi:** multiplica el Daño. **Canto:** la jugada propia del Mazo (¡ESCOBA! con 15 justo). **Golpe exacto:** dejarlo en 0 justo paga oro y Multi. **Comodín:** copia mi carta más alta del golpe (lo dice JUGADAS; en el paño se ve como un fantasma).
- **No entendí:** «corre de Posta», «Medio: pega doble» (tardé en ver que es el lugar del medio), «CORTÁS», el «×3» de «24 ×3 = 72» (¿por qué triple?), «POROTOS», «ALTAR 245», «la primera pasada es segura», los escuditos bajo cada combate del mapa, ENGAÑO y PASAR.

## Defectos menores

- En El Soplo se lee «A LA SUERTE: 60»: el glifo A tapa el «%» (`src/client/textos.ts:157`, `src/client/estilos/mesa.css:4102`).
- En la oferta del teléfono, «HAY MÁS ↓» cae en medio de una frase de la tercera carta («…de oro ( … artes sin fin») (`src/client/estilos/base.css:1378`).
- SEGUIR en el Fogón y en el Botín sigue sin decir que me voy sin elegir; en el Botín está pegado a «ELEGIR» de la Bendición (`src/client/pantallas/camino.ts:622` y `1053-1054`).
- En «LO DEJÁS JUSTO» la cuenta dice DAÑO 42 y los términos de abajo siguen sumando 46: falta el «−4» que lo ajusta (`src/client/pantallas/mesa.ts:534-556`).
- El «10» del naipe enemigo sigue compitiendo con su Vida (`src/client/estilos/mesa.css:4528`).

## Contra mi veredicto de la 0.26

**Resueltos:** el P1 de los cobros que caían sobre la mano, el P1 del dial sin verbo ni estado (a 1280 y a 390), el P2 de fin-derrota, «sobran N · se pierden» (no lo vi en captura; leído en la lista de cambios, no lo doy por visto) y el roce de «LE QUEDAN» con TE PEGA. **Siguen:** SEGUIR en el Fogón, el «10» gigante y los términos sin nombre en el desglose (la Ginebra de la 0.26 era un caso; ahora lo veo como regla a 1280).

## Qué haría en la próxima versión

Un pase de «ningún botón ni cifra sin su palabra». (1) El desglose previo al golpe conserva los nombres en la Deck, con abreviaturas antes que iconos pelados, y los negativos siempre con causa. (2) Cada Mazo presenta su botón propio en la mesa con un renglón de regla y su tecla en la pista. (3) El 6 y el 9 subrayados y el Comodín espectral con su índice libre. (4) El «%» de El Soplo, «SEGUIR SIN ELEGIR» y «HAY MÁS ↓» fuera del texto. (5) El primer «×3» de lo que pasa con su porqué al lado. Nada toca la Constitución. No encontré nada que rompa ni que frene: son tres P2, y con (1) y (2) la claridad pasa de 9.
