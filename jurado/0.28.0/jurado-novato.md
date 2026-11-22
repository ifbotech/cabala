```json
{
  "jurado": "jurado-novato",
  "version": "0.28.0",
  "puntajes": { "claridad": 9.1, "diversion": 8.5, "estetica": 8.6, "veredicto": 8.8 },
  "defectos": [
    { "prioridad": "P2", "pantalla": "cabala (El Soplo, opción «PAGAR LA TRAMPA» con el foco del mando)", "ventana": "1280x800", "archivo": "src/client/estilos/pantallas.css:5125-5138 (dos bloques seguidos con el mismo selector `.cabala .opcion > .chip.canto`: el segundo anula los márgenes del primero y deja solo un padding-right) y src/client/pantallas/camino.ts:1335 (el chip)", "que": "En la Deck, con el glifo A puesto, el chip sigue diciendo «A LA SUERTE: 60» y a continuación el botón verde: el «%» no está. A 1366x768 (sin glifo) y a 390 sí se lee «60 %». El arreglo anunciado no llegó justo a la ventana y al modo donde yo lo había marcado.", "por_que": "Es la única apuesta de la pantalla y me cuesta 12 de oro. «60» pelado puede ser oro, Vida o puntos; con el «%» se entiende en un vistazo. Y es la opción enfocada, o sea la que estoy por apretar.", "propuesta": "Que el chip no recorte su texto: sacar el glifo A del renglón del chip (a la esquina de arriba de la tarjeta, como en DESCANSAR del Fogón) o dejar que el chip crezca. Sumar a la puerta visual una comprobación de que el texto del chip contiene «%» visible con mando a 1280." },
    { "prioridad": "P2", "pantalla": "mesa-dejalo-justo, mesa-pega-todo (el dial) y mesa-chinchon", "ventana": "1280x800", "archivo": "src/client/estilos/mesa.css:5068-5080 (`.d-n` con max-width 11em y 7.2em en `.chico`) y src/client/pantallas/mesa.ts:356-363 (el orden de los pasos: primero acorta, después suelta la pista, después junta renglones)", "que": "Los nombres ya están antes de golpear (bien), pero en cuanto aparece la caja del dial o el renglón CORTÁS se cortan a media palabra: «Primer… +8», «Taba c… +10», «Mano c… +3», «SOL DE… +1», «Cantos… +4». En mesa-seleccion y mesa-exacto, con las mismas piezas, entran enteros.", "por_que": "El dial es la decisión más fina del combate y es justo donde los nombres se vuelven adivinanza. «SOL DE…» y «Mano c…» no los reconstruyo si no los vi antes enteros. Mejoró mucho contra los iconos pelados de la 0.27, pero el primer recorte cae sobre lo que más necesito leer.", "propuesta": "Invertir el orden: primero soltar la pista «corre de Posta» y juntar renglones, y recién al final acortar. Y acortar con un nombre corto escrito a mano por pieza («1.ª sangre», «Sol», «Mano chica») en vez de puntos suspensivos a 7 em." },
    { "prioridad": "P2", "pantalla": "mesa (reposo) y mesa-seleccion / mesa-chispa (el término «Chispa +9»)", "ventana": "1280x800", "archivo": "src/client/textos.ts:262-285 (`postaMedioAyuda`, `panoEscalon`: hay renglón para Medio y Escalón, no para Chispa; la regla solo vive en `postaTip`, línea 264) y src/client/pantallas/mesa.ts:609 (donde se arman las pistas del paño)", "que": "El paño me enseña dos reglas de lugar («Medio: pega doble», «3 o más en subida: Escalón +2 de Multi»). Con un Comodín en la mano hay una tercera, la Chispa, que no tiene renglón: aparece de golpe como «Chispa +9» en el desglose y como una estrella entre dos naipes. Tampoco hay una línea que diga qué hace el Comodín antes de jugarlo.", "por_que": "Es el término de Daño más grande después del Medio y depende de dónde pongo el Comodín (a la izquierda de qué carta). Sin el renglón lo coloco al azar y el +9 me cae o no me cae sin saber por qué.", "propuesta": "Cuando hay un Comodín en la mano, un tercer renglón de pista: «Comodín: copia tu más alta · su Chispa suma a la carta de su derecha». Mismo cuerpo y mismo lugar que los otros dos." }
  ],
  "aciertos": [
    "Mis tres P2 de la 0.27 están resueltos y lo vi. El desglose previo al golpe lleva nombres a 1280 («Par +4 · Medio +9 · Chispa +9 · Cantos hechos +4 · Filo +4 · Primera sangre +8 · Taba cargada +10», «Cascabel sin canto −1») y en la secuencia golpe-02 → 06 cada término se enciende cuando se cuenta: 22, 56, 66 × 6 = 396. Las sumas cierran.",
    "ENGAÑO dice «todas valen tu más alta · queda 1» y PASAR «cambiás 1 carta · gratis»; la pista suma «LT engaña» e «Y pasa 1 gratis». Ya no pruebo a ciegas.",
    "El 6 y el 9 llevan su raya arriba y abajo, y el Comodín espectral muestra su «9» con el rótulo COMODÍN de costado, sin pisar el índice.",
    "«SEGUIR SIN ELEGIR» (Botín) y «SEGUIR SIN USARLO» (Fogón) dicen lo que pasa; el «×3» de lo que sobra lleva el icono del Facón; en «LO DEJÁS JUSTO» los términos ya suman 42.",
    "En el teléfono la hoja abierta del dial trae el desglose con nombres enteros y «TOCÁ PARA CERRAR»; «HAY MÁS ↓» va sobre un pie esfumado y no parte ninguna frase."
  ],
  "capturas_vistas": [
    "visual-qa/1280x800/portada.png", "visual-qa/1280x800/elegir-mazo.png", "visual-qa/1280x800/cabala.png", "visual-qa/1280x800/mapa.png",
    "visual-qa/1280x800/mesa.png", "visual-qa/1280x800/mesa-seleccion.png", "visual-qa/1280x800/mesa-rey.png", "visual-qa/1280x800/mesa-mentiroso.png",
    "visual-qa/1280x800/elegi-una.png", "visual-qa/1280x800/pulperia.png", "visual-qa/1280x800/fogon.png", "visual-qa/1280x800/jugadas.png",
    "visual-qa/1280x800/piezas.png", "visual-qa/1280x800/fin-derrota.png", "visual-qa/1280x800/mesa-chancho.png", "visual-qa/1280x800/mesa-pega-todo.png",
    "visual-qa/1280x800/mesa-dejalo-justo.png", "visual-qa/1280x800/mesa-chinchon.png", "visual-qa/1280x800/mesa-chispa.png", "visual-qa/1280x800/mesa-exacto.png",
    "visual-qa/1280x800/botin.png", "visual-qa/1366x768/cabala.png",
    "visual-qa/390x844/mesa-seleccion.png", "visual-qa/390x844/mesa-dejalo-justo.png", "visual-qa/390x844/mesa-dejalo-justo.hoja.png",
    "visual-qa/390x844/cabala.png", "visual-qa/390x844/elegi-una.png", "visual-qa/390x844/elegi-amuleto.png",
    "jurado/secuencias/1280-golpe-00, 02, 04, 06, 08, 09", "jurado/secuencias/1280-contragolpe-10", "mirar/1280-comodin-espectral-racha.png"
  ]
}
```

## Primeras impresiones (antes de abrir el código)

- **¿Cómo gano un combate?** Bajo a cero la barra roja de cada naipe de «LA CORTE · QUEDA 1». Elijo cartas, leo «DAÑO × MULTI = total» y «LE QUEDAN», aprieto GOLPEAR. Sin leer nada.
- **¿Qué hace el enemigo?** Me pega lo que dice arriba: «TE PEGA 19 · 23 − 4 ESCUDO». Si lo dejo en cero, «NO TE PEGA · 0 · LO ABATÍS». En contragolpe-10 vi el «−19» en VIDA y el «−4 ESCUDO» en ESCUDO.
- **Los números del enemigo:** «475/475» es su Vida y TE PEGA es lo que cobra. El «10» verde gigante del naipe sigue sin servirme; con el «11» y el «12» de al lado intuyo que es el número del naipe, nada más.
- **Furia:** «ya incluida · +3 por turno». **Inmune:** las cartas de ese palo se agrisan con un escudito tachado. **Escudo:** se resta de TE PEGA. **Multi:** multiplica el Daño. **Canto:** la jugada propia del Mazo (¡ESCOBA! con 15 justo, ¡CHINCHÓN!). **Golpe exacto:** dejarlo en 0 justo, «+3 de oro · +1 Multi al próximo». **Comodín:** copia mi carta más alta (lo dice JUGADAS; en el paño lo veo como un 9 fantasma).
- **No entendí:** «corre de Posta», «Chispa», «CORTÁS», «POROTOS», «ALTAR 245», «la primera pasada es segura», los escuditos bajo cada combate del mapa, «lo aturdís» (¿por qué?), «EL BUFÓN: NI FU NI FA».

## Defectos menores

- En el teléfono, mesa-seleccion sigue con «icono +4 · icono +8 · icono +10» después de «Chispa +9», y nada avisa que un toque abre la hoja (en el dial sí hay flecha y «TOCÁ») (`src/client/pantallas/mesa.ts:349-363`, `src/client/estilos/mesa.css:5068`).
- JUGADAS y LO QUE LLEVÁS a 1280 se cortan abajo con una flechita amarilla suelta; el glosario (FURIA, Inmune, Escudo) queda bajo el pliegue. Merece el mismo «HAY MÁS ↓» del teléfono (`src/client/estilos/base.css:1378`).
- El «10» del naipe enemigo sigue siendo la cifra más grande de la mesa (`src/client/estilos/mesa.css:4528`).
- «corre de Posta», «CORTÁS» y «POROTOS» siguen sin ayuda de primera vez (`src/client/textos.ts:209`).
- En mesa-mentiroso la segunda carta de la mano queda con el índice partido («2» cortado por la primera) (`src/client/estilos/mesa.css`, abanico de la mano de 7).

## Contra mi veredicto de la 0.27

**Resueltos (vistos):** los tres P2 (nombres antes de golpear, ENGAÑO/PASAR con regla y tecla, 6/9 y Comodín), «SEGUIR SIN…», «HAY MÁS ↓», la suma de «LO DEJÁS JUSTO», el porqué del «×3». **Siguen:** el «%» de El Soplo en la Deck con mando (resuelto solo sin glifo y en el teléfono) y el «10» gigante.

## Qué haría en la próxima versión

Un pase de «primera vez» sin tutorial. (1) Una pista de paño por cada regla de lugar que esté viva en la mano: Medio, Escalón y, si hay Comodín, Chispa. (2) Nombres cortos escritos a mano para las 15 piezas y las jugadas, y el desglose que suelta primero la pista del mando antes de acortar. (3) La primera vez que aparece «Posta», «CORTÁS», «POROTOS» o «lo aturdís», un renglón de una línea bajo la palabra, que no vuelve. (4) El «%» a prueba de glifos y «HAY MÁS ↓» también en las hojas de la Deck. (5) El «10» del naipe enemigo a mitad de tamaño o con la Vida arriba de él. Nada toca la Constitución. No encontré nada que rompa ni que frene: son tres P2, más chicos que los de la 0.27. La claridad pasa la meta por poco; diversión y estética no cambiaron lo bastante para moverse más de una décima, y desde mi silla no llegan a 9,1.
