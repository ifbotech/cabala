```json
{
  "jurado": "jurado-diseno",
  "version": "0.15.0",
  "puntajes": { "claridad": 7.1, "diversion": 6.7, "estetica": 7.8, "veredicto": 6.9 },
  "defectos": [
    {
      "prioridad": "P0",
      "pantalla": "mesa · mesa-seleccion (Escoba y Truco, los dos Mazos iniciales)",
      "ventana": "todas",
      "archivo": "src/rules/balance-config.json:146 y :155 (mano 3) · src/rules/combate.ts:261 (alPelo) · src/client/pantallas/mesa.ts (línea de desglose bajo la cuenta)",
      "que": "Tercera versión sin tocar la mano de 3. El «al pelo» es un parche: no aplica si hay una sola Espada en el golpe (combate.ts:261, `!perfora`), la ventana es de ~17 sobre una Sota de 340 y el laboratorio no se movió: exactos 0,4 (Truco) a 2,0 (Chinchón) por partida, cantos 26,8 en Truco y 1,7 en Chancho. Y ahora la cuenta muestra el desglose entero antes de soltar («5 + 2 + 3 · Flor +6 · Cantos hechos +10 · Mate curado +24…= 312 · LE QUEDAN 28», mesa-seleccion).",
      "por_que": "Con 7 golpes posibles y la respuesta escrita en la mesa, el golpe no es una decisión: es leer y confirmar. El conteo pieza por pieza pasa a ser la repetición de un resultado que ya conocés, y el exacto sigue siendo suerte del reparto. Es el corazón del bucle y es lo que más separa a CÁBALA de Balatro.",
      "propuesta": "Mano de 4 jugando hasta 3 en Escoba y Truco (14 golpes). Que el «al pelo» valga también con Espadas (la sobra que Perfora no la anula). En la previa, mostrar Daño × Multi de la jugada y las cartas, pero no las piezas: que el aporte de Amuletos y Bendiciones se descubra en el conteo («312?» en vez de «312»), salvo el sello ¡EXACTO! / ¡AL PELO!, que sí se anticipa."
    },
    {
      "prioridad": "P1",
      "pantalla": "mesa-rey · secuencias rey-irrumpe y rey-cae",
      "ventana": "todas",
      "archivo": "src/rules/balance-config.json:121, :124, :130 y :133 · src/rules/combate.ts:483, :609-617 y :634-649",
      "que": "La segunda cara existe pero no pesa: Degüello suma +2 de Furia contra un Rey que ya pega 21 con +3 de Furia (mesa-rey); Remate pasa el Diezmo de 3 a 6 de oro; Última ronda le cura lo que vos te curás (2 a 6 por Copa); Empalizada devuelve 30 de Escudo una vez contra golpes medios de 150 a 1.500. Con 4,1 a 5,7 golpes por Rey, la cara dura dos golpes. Ninguna captura ni secuencia muestra el cartel «SEGUNDA CARA»: lo leí en código, no lo vi.",
      "por_que": "Era el pedido para que el Rey sea clímax y no saco de Vida. Con estos números ningún jugador cambia de jugada a media Vida: lo óptimo sigue siendo pegar lo más fuerte posible. La única que pide pensar (Degüello) castiga con una cifra que no se nota.",
      "propuesta": "Cifras proporcionales al golpe y al tramo: Degüello = la jugada repetida hace la mitad de Daño; Empalizada = Escudo igual al 25 % de su Vida máxima; Remate = +2 de Furia por moneda cobrada; Última ronda = se cura el doble de lo que te curás. Agregar el estado `mesa-segunda` a la QA visual y un cuadro de la secuencia rey-irrumpe con el cartel."
    },
    {
      "prioridad": "P1",
      "pantalla": "toda la partida (curva de tramos)",
      "ventana": "todas",
      "archivo": "src/rules/balance-config.json:84-104 (ataque de La Corte 1 / 12 / 28) y :145-178 (Vida de los Mazos)",
      "que": "La defensa por tramo (×1/×2/×3) llegó, pero la compensación se la comió: La Corte pega +33 % en el tramo 2 y +40 % en el 3, y los Mazos traen más Vida. Resultado en el laboratorio: caídas del tramo 3 suben en los cinco Mazos (Escoba 842→1.007, Truco 1.676→1.897, Chinchón 1.052→1.405, Chancho 1.430→1.665) y el tramo 1 mata menos todavía (Truco 13→6, Chancho 12, Mentiroso 62 de 3.000).",
      "por_que": "El primer tercio es un paseo sin riesgo y la partida se decide toda en el último. Eso aplasta la curva de tensión: no hay miedo temprano que haga valorar una Copa o un Basto, y cuando el miedo llega ya no hay Pulpería para corregir la build.",
      "propuesta": "Bajar la Vida de Truco (96) y Chancho a la altura de Escoba, subir el ataque del tramo 1 hasta que muera entre el 3 y el 6 % de las partidas en todos los Mazos, y bajar el del tramo 3 a ~24 dejando que la escala del jugador haga el trabajo. Recertificar con el objetivo de caídas por tramo en meta-report."
    }
  ],
  "aciertos": [
    "La defensa ya no es plana: Basto, Copa y tope de Escudo escalan ×1/×2/×3, y Contragolpe devuelve lo frenado ×2/×3/×4 y dispara al frenar la mitad. La build del Cacique existe en el tramo 2.",
    "Los Comunes que crecen con la carga de su Rey le dan sentido al mono-palo: «Mate curado +24» es la pieza más gorda del golpe en mesa-seleccion.",
    "Firmar a ciegas es la primera Cábala con dilema de verdad (perder un Amuleto al azar). La moneda y el doble o nada escalan: en cabala.png se apuestan 20 con 73 en la bolsa.",
    "Rótulos en el enemigo (TE PEGA, +3 FURIA, QUEDA 1, INMUNE A ESPADAS) y la línea de desglose: claridad real para quien aprende.",
    "El conteo ya no arranca en «MULTI 0» y tiene ritmo (115 → 45 ms, tope 1,6 s)."
  ],
  "capturas_vistas": [
    "jurado/secuencias/1280-golpe-01.png",
    "jurado/secuencias/1280-golpe-03.png",
    "jurado/secuencias/1280-golpe-05.png",
    "jurado/secuencias/1280-golpe-07.png",
    "jurado/secuencias/1280-golpe-09.png",
    "jurado/secuencias/390-golpe-04.png",
    "jurado/secuencias/1280-rey-irrumpe-05.png",
    "jurado/secuencias/1280-rey-cae-03.png",
    "jurado/secuencias/1280-rey-cae-07.png",
    "visual-qa/1280x800/mesa-seleccion.png",
    "visual-qa/1280x800/mesa-rey.png",
    "visual-qa/1280x800/cabala.png",
    "visual-qa/1280x800/pulperia.png",
    "visual-qa/1280x800/elegi-bendicion.png",
    "visual-qa/1280x800/jugadas.png",
    "visual-qa/1280x800/piezas.png",
    "visual-qa/1280x800/fin-victoria.png",
    "visual-qa/390x844/mesa-rey.png",
    "mirar/1280-mesa-grito.png"
  ]
}
```

## Veredicto

**Respecto de la 0.14.0:** el P0 de la defensa plana quedó resuelto en la regla, pero la compensación de La Corte lo devolvió como problema de curva (mi nuevo P1). El P1 del conteo quedó a medias: tiene ritmo y no arranca en cero, pero los carteles siguen cayendo encima de la línea de desglose (golpe-03, golpe-05; en 390, «+24» sobre el retrato) y el total se ve atenuado desde el primer cuadro. El P1 de la mano de 3 sigue intacto y sube a P0. De los menores: Cábalas que escalan y frase de rechazo repetida, resueltos; Escoba ×2/×3, Comunes clones y tramo 1 que no mata, siguen.

La 0.15.0 es la primera versión de reglas que pedí y se nota. Subo diversión poco porque el bucle central no cambió: el golpe se sigue decidiendo solo.

Simulé las tres builds:

- **Banca (Escoba):** igual de buena. El Cofre y Peso fuerte suman en el conteo.
- **Muro de Bastos (Chinchón):** revive. Con 6 de Escudo por Basto en el tramo 3, tope 60 y Contragolpe ×4, frenar 40 devuelve 160 más la Coraza. Sigue lejos de los 764 de golpe medio del tramo 3, pero por fin es una build y no una trampa.
- **Mono-palo con Común (Copas):** nueva y real. El Mate llega a +9 por carta. Problema: el Bacanal en su segunda cara se cura lo que vos te curás, y eso castiga justo a esta build. Me gusta esa tensión, pero con 2 a 6 por Copa no se siente.

**Reyes.** El teatro sigue bien (lluvia, frase final, fogonazo). La segunda cara no la vi en ninguna captura. En código, son cuatro cifras chicas.

**Bufón.** La moneda al 60 % con 20 contra 30 tiene esperanza de +10: aceptar sigue siendo obvio. El soplo (12 de oro por −20 % de Vida al Rey, casi un golpe) también. Firmar a ciegas es la única que pide coraje. Las tres nuevas no aparecen en las capturas: las leí en código, no las vi.

**Nota de material.** Las secuencias siguen en inglés. Las fotos quietas en 1280 ya muestran los glifos del mando.

## Defectos menores

- Persiste y empeora: la regla de Escoba dice «Multi ×2», el motor aplica ×3 y la tabla de JUGADAS pone «Quince ×1» (`jugadas.png`): `src/rules/mazos.ts:33` contra `balance-config.json`.
- Persiste: la Pulpería ofrece tres Comunes juntos, con el mismo texto y el mismo precio (`pulperia.png`): `src/rules/partida.ts:70`.
- Nuevo: la línea de desglose repite «Flor +6» en Daño y «Flor +2» en Multi; se lee como dos Flores. Habría que poner «Flor +6 / +2» una sola vez: `src/client/pantallas/mesa.ts` (sumaD/sumaM).
- Mejora a medias: la última frase del Rey ya no tapa la barra, pero todavía corta la parte de abajo de su nombre (`rey-cae-03`): `src/client/pantallas/mesa.ts:433-437`.
- Nuevo: el fin de partida cuenta «Golpes exactos» pero no los «al pelo», así que la racha sostenida no deja rastro: `src/rules/combate.ts:~412-425` (rama `alPelo` de `abatir`, sin `p.stats`).

## Qué haría en la próxima versión

«El golpe se piensa». Mano de 4 jugando hasta 3 en Escoba y Truco, «al pelo» también con Espadas, y una previa que muestre la jugada y las cartas pero deje a los Amuletos y Bendiciones para el conteo: el número final se descubre, como en Balatro. Segundas caras que obliguen a cambiar de plan, con cifras proporcionales al tramo, y su captura en la QA. Reequilibrar la curva: que el tramo 1 mate algo (3–6 %) y que el 3 descanse en la escala del jugador, no en un ataque inflado. Que la moneda y el soplo tengan esperanza cercana a cero, para que aceptar sea una apuesta y no un trámite. Todo con Multi entero, 15 Amuletos y 5 Mazos, y el laboratorio completo con objetivo de caídas por tramo.
