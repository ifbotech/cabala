```json
{
  "jurado": "jurado-novato",
  "version": "0.29.0",
  "puntajes": { "claridad": 9.2, "diversion": 8.6, "estetica": 8.7, "veredicto": 8.9 },
  "defectos": [
    { "prioridad": "P2", "pantalla": "mesa-dejalo-justo (la cuenta con «¡AL PELO!» y la opción R3 «DEJALO JUSTO»)", "ventana": "1280x800", "archivo": "src/client/pantallas/mesa.ts:685-686 (el veredicto `v-alpelo` de la cuenta) y src/client/textos.ts:52 y 248 (`alPelo`, y `gAlPelo`, que solo vive en el glosario)", "que": "La cuenta dice «DAÑO 48 × MULTI 6 = 288 · ¡AL PELO! · SOBRAN 24 ×2 = 48 PASAN» y justo abajo me ofrecen «DEJALO JUSTO +3 de oro · +1 Multi al próximo · no pasan 24». Para mí «al pelo» y «justo» son lo mismo: leo que ya lo dejé justo y a la vez que me sobran 24. Nada en la mesa dice qué gano con ¡AL PELO! (en el código: me pasé por poco y la racha sigue viva).", "por_que": "Es la decisión más fina del combate y tiene tres palabras para tres cosas (al pelo, justo, pasan) con una sola explicada. La cifra cierra, la palabra no: elijo entre R3 y GOLPEAR sin saber qué pierdo de ¡AL PELO!.", "propuesta": "Que el rótulo lleve su consecuencia en el mismo renglón, como ya hace «NO TE PEGA · LO ATURDÍS»: «¡AL PELO! · te pasaste por poco · la racha sigue». O cambiar el grito por uno que no signifique «exacto» en criollo («¡POR UN PELO!»)." },
    { "prioridad": "P2", "pantalla": "mesa-seleccion / golpe-00 («LB RB corre de Posta»), mesa-chinchon («CORTÁS»), fin-derrota («+24 POROTOS»)", "ventana": "1280x800", "archivo": "src/client/ui.ts:505-523 (`ayudaPrimera`: se marca como vista antes de mostrarse, dura 4,2 s y `enFoto()` la apaga) y src/client/textos.ts:77-79", "que": "La ayuda de primera vez no aparece en ninguna de las capturas que abrí: «corre de Posta» y «+24 POROTOS» siguen pelados a la vista. Leído en código, no visto: es un cartelito de 4,2 segundos que sale una sola vez en la vida del perfil y se da por visto en el instante en que nace. Además solo cubre tres palabras: «lo aturdís», «¡PRENDA!», «la primera pasada es segura» y «su humor baja un punto» siguen sin renglón.", "por_que": "Soy el que no lee: en mi primera mano estoy mirando los naipes, no un rincón del desglose. Si pestañeo, la única explicación de «Posta» se fue para siempre. Y como las fotos la apagan, nadie del jurado puede decir si se lee, si tapa algo o si entra a 390.", "propuesta": "Que la ayuda quede hasta mi primera acción sobre eso (mover de Posta, golpear con CORTÁS, entrar al Altar) y recién ahí se marque vista. Sumar un estado fotografiado con la ayuda encendida en 1280 y 390. Extenderla a «lo aturdís» («2 Bastos: pierde su turno») y a «¡PRENDA!» («le robaste un Chiche»)." },
    { "prioridad": "P2", "pantalla": "mesa, mesa-rey, mesa-mentiroso (el «10», «11», «12» del naipe enemigo)", "ventana": "1280x800", "archivo": "src/client/estilos/mesa.css:4529 (`.e-carta > .e-indice`)", "que": "El «10» verde del naipe de la Sota sigue siendo la cifra más grande de la mitad de arriba, más que el «19» de TE PEGA y mucho más que «475/475». Tercera versión que lo anoto; el autor confirma que no se tocó.", "por_que": "No conozco la baraja: el número más grande pegado al enemigo lo leo como su ataque o su nivel. No es ninguna de las dos cosas y no sirve para ninguna decisión. Con «12» en el Rey y «TE PEGA 18» al lado, compiten dos números rojos y azules por la misma pregunta.", "propuesta": "Índice a la mitad de cuerpo y con el mismo peso que el de mis naipes, o la Vida subida a la altura del índice. No hace falta sacarlo: es baraja española y está bien que esté, pero chico." }
  ],
  "aciertos": [
    "El desglose ya no corta nada. En mesa-dejalo-justo se lee «1.ª sangre +8 · Cargada +10 · Cofre +1 · Sin canto −1» y en mesa-seleccion los nombres largos enteros. Sumé a mano: 68 × 6 = 408, 48 × 6 = 288, 44 × 6 = 264, 23 × 15 = 345. Todo cierra.",
    "El paño tiene el tercer renglón que pedí: «Comodín: copia tu más alta · su Chispa repite el naipe de su derecha». Y solo aparece cuando hay Comodín en la mano (en mesa-rey no está). Ahora sé dónde ponerlo.",
    "La secuencia golpe-00 → 03 → 06 → 09 se entiende sin leer: los términos se encienden de a uno (46 × 1, después 68 × 6), el «408» cae sobre el naipe, la barra baja a 67/475 y mi Vida sube a 50.",
    "JUGADAS y LO QUE LLEVÁS a 1280 llevan «HAY MÁS ↓» en caja, igual que el teléfono y que la grilla de la Cábala Negra.",
    "En el teléfono la cuenta de mesa-seleccion ya no trae iconos pelados: «68 × 6 = 408» con una flechita, y la hoja abierta tiene todos los nombres, «TE PEGA 19 (23 − 4 ESCUDO)» y «TOCÁ PARA CERRAR».",
    "«CORTÁS 4 cartas × 6 = Escudo +24» se explica solo con la cuenta, y cada carta de la mano lleva su «+6»."
  ],
  "capturas_vistas": [
    "visual-qa/1280x800/portada.png", "visual-qa/1280x800/elegir-mazo.png", "visual-qa/1280x800/cabala.png", "visual-qa/1280x800/cabala-negra.png",
    "visual-qa/1280x800/mapa.png", "visual-qa/1280x800/mesa.png", "visual-qa/1280x800/mesa-seleccion.png", "visual-qa/1280x800/mesa-rey.png",
    "visual-qa/1280x800/mesa-mentiroso.png", "visual-qa/1280x800/elegi-una.png", "visual-qa/1280x800/pulperia.png", "visual-qa/1280x800/fogon.png",
    "visual-qa/1280x800/jugadas.png", "visual-qa/1280x800/piezas.png", "visual-qa/1280x800/fin-derrota.png", "visual-qa/1280x800/mesa-dejalo-justo.png",
    "visual-qa/1280x800/mesa-pega-todo.png", "visual-qa/1280x800/mesa-chinchon.png", "visual-qa/1280x800/mesa-garrote.png", "visual-qa/1280x800/mesa-chispa.png",
    "visual-qa/1280x800/mesa-prenda.png", "visual-qa/1280x800/botin.png", "visual-qa/1366x768/cabala.png",
    "visual-qa/390x844/mesa-seleccion.png", "visual-qa/390x844/mesa-seleccion.hoja.png", "visual-qa/390x844/fin-derrota.png",
    "jurado/secuencias/1280-golpe-00, 03, 06, 09", "jurado/secuencias/1280-contragolpe-10", "tmp/v-1280x800-mesa-mando-tip.png"
  ]
}
```

## Primeras impresiones (antes de abrir el código)

- **¿Cómo gano un combate?** Vacío la barra roja de cada naipe de «LA CORTE · QUEDA 1». Elijo cartas, leo «DAÑO × MULTI = total» y «LE QUEDAN», aprieto GOLPEAR.
- **¿Qué hace el enemigo?** Me cobra lo de arriba: «TE PEGA 19 · 23 − 4 ESCUDO». En contragolpe-10 vi el «−19» sobre VIDA y el «−4 ESCUDO».
- **Sus números:** «475/475» es su Vida, TE PEGA su golpe. El «10» gigante sigue sin decirme nada.
- **Furia:** «ya incluida · +3 por turno». **Inmune:** ese palo se agrisa con el escudito tachado. **Escudo:** se resta de TE PEGA. **Multi:** multiplica el Daño. **Canto:** la jugada propia del Mazo (¡ESCOBA!, ¡CHINCHÓN!). **Golpe exacto:** dejarlo en 0 justo, «+3 de oro · +1 Multi al próximo». **Comodín:** copia mi más alta y repite la carta de su derecha; ahora lo dice el paño.
- **No entendí:** «¡AL PELO!», «¡PRENDA!» (un dado vuela a CHICHES y nadie dice por qué), «corre de Posta», «POROTOS», «ALTAR 245», «la primera pasada es segura», «su humor baja un punto», «EL BUFÓN: NI FU NI FA», «lo que le dejó el fuego», «lo aturdís», «MALDICIÓN −5 DE ESCUDO» junto a un Garrote que me suma +20, y los escuditos bajo cada combate del mapa.

## Defectos menores

- El Soplo no está fotografiado en ninguna ventana (las dos capturas `cabala*` son la Cábala Negra): el «A LA SUERTE: 60 %» con mando a 1280 solo lo pude leer en código (`src/client/estilos/pantallas.css:5125-5139`). Falta el estado en la puerta visual.
- «ENVIDO: faltan N» y «COPAS NO CURAN» tampoco salen en ninguna captura; no los juzgo.
- La insignia «×2» del Medio no coincide con el desglose cuando hay Chispa: la carta cuenta 9 + Medio 9 + Chispa 9 (`src/client/pantallas/mesa.ts:609`).
- En mesa-garrote la cuenta pierde el nombre de la jugada («CARTA SOLA») y «GARROTE DEL CACIQUE» va en mayúsculas entre nombres en minúscula (`src/client/pantallas/mesa.ts:653-690`).
- En fin-derrota, «PRÓXIMO RÉCORD · TRAMO MÁS ALTO · 1 / 2» parece un premio y es una comparación (`src/client/pantallas/camino.ts:1557`).

## Contra mi veredicto de la 0.28

**Resueltos (vistos):** nombres cortados en el dial (P2), renglón del Comodín y la Chispa (P2), hoja con nombres en el teléfono, «HAY MÁS ↓» a 1280, índice partido en mesa-mentiroso. **Sin poder confirmar:** el «%» de El Soplo (P2), arreglado en código y sin foto. **Siguen:** el «10» gigante y la ayuda de primera vez, que existe para tres palabras pero no se ve.

## Qué haría en la próxima versión

Cerrar el vocabulario del combate. (1) Cada grito con su consecuencia pegada: «¡AL PELO! · la racha sigue», «¡PRENDA! · le robaste un Chiche», «lo aturdís · 2 Bastos». (2) Ayuda de primera vez que espera a mi primera acción en vez de 4,2 segundos, fotografiada en la puerta visual. (3) El índice del naipe enemigo al tamaño de los míos. (4) Estados nuevos en la puerta: El Soplo con mando, ENVIDO, COPAS NO CURAN, ayuda encendida. (5) El Fogón diciendo qué arriesgo en la segunda pasada. Nada toca la Constitución. No encontré nada que rompa ni que frene: tres P2, otra vez más chicos. La claridad sube una décima porque lo que pedí está y lo vi; no sube más porque dos de los arreglos anunciados no se pueden mirar. Diversión y estética mejoran apenas y desde mi silla no llegan a 9,1.
