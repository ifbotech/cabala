```json
{
  "jurado": "jurado-juice",
  "version": "0.21.0",
  "puntajes": { "claridad": 7.6, "diversion": 8.0, "estetica": 8.1, "veredicto": 7.9 },
  "defectos": [
    {
      "prioridad": "P0",
      "pantalla": "mesa · el «−N» que te pega el enemigo cuando el Escudo frena algo (casi todos los turnos)",
      "ventana": "390x844 (grave) y 1280x800",
      "archivo": "src/client/pantallas/mesa.ts:857-859 (el «−7» azul nace primero y se queda con el renglón junto a VIDA) · src/client/fx/efectos.ts:328 (la caja «sobre» suma `+ base` de ancho y un `altoG` de más, así que choca con su vecino aunque no se toquen) · efectos.ts:334 (si choca, las alternativas suben 1, 2 y 3 renglones) · src/client/fx/director.ts:24 (el director mide que nada se pise, pero no lo lejos que queda el número de lo que nombra)",
      "que": "El commit dice «lo que te pegan, en un solo carril junto a VIDA», pero las capturas muestran otra cosa. En 1280 el «−16» nace dos renglones arriba: queda en el margen izquierdo, a media altura del paño, unos 200 px por encima de la cifra de VIDA. El «−7» azul queda solo, al pie del paño (1280-golpe-09, 1280-postas-golpe-09 y 10). En el teléfono es peor. El «−16» a escala 2 tapa el renglón TE PEGA / LE QUEDAN de la cuenta y la Posta del Medio, y el «−7» cae sobre el 3 de copas (390-postas-golpe-10).",
      "por_que": "Es el número del dolor, y con Escudo pasa en casi todos los turnos. Lejos de VIDA no se lee como «me sacaron 16»: parece una cifra más de la cuenta. Ya es la segunda versión con este defecto, el arreglo anunciado no llegó a la pantalla y la QA pasa porque solo mide choques.",
      "propuesta": "El rojo nace primero y sin alternativas hacia arriba: va en un sitio fijo dentro de la caja de VIDA, a la izquierda del corazón, que la regla permita salvo sobre `.valor`. El frenado no es un segundo número: es un subtítulo chico pegado debajo («7 al escudo»), o un solo texto «−16 · −7🛡». Escala 1,5 en el teléfono. Que la caja de `sobre` deje de sumar `base`. Y una regla nueva en la QA de movimiento: el número del contragolpe tiene que nacer a menos de 40 px de `[data-hud-vida]`."
    },
    {
      "prioridad": "P1",
      "pantalla": "mesa · usar el Dado Cargado en el teléfono",
      "ventana": "390x844",
      "archivo": "src/client/estilos/mesa.css:2540-2556 (en el teléfono el bocadillo del Bufón va encima de la cuenta en reposo y solo apaga `.pista`, no la ficha `.d-dado`) · src/client/pantallas/mesa.ts:339 · src/client/audio.ts:35 (una sola receta «chiche» para los cinco)",
      "que": "En 1280 quedó resuelto: el Dado vuela a la cuenta, destella y deja la ficha «MULTI +3» en reposo (1280-chiche-usa-03 y 05). En el teléfono, en cambio, el Dado destella sobre la frase del Bufón («Ahí viene otro. Dale sin asco.») y después no queda nada. La ficha está, pero debajo del bocadillo (390-chiche-usa-03, 05 y 06). Además, todos los Chiches suenan igual: un toc de 880 y 330 Hz (leído en código, no oído).",
      "por_que": "El teléfono es la mitad del público. Ahí un consumible de 9 de oro se gasta sin que la mesa diga qué compró. Y un Dado que no suena a dado pierde la mitad de la gracia.",
      "propuesta": "Con `dadoArmado`, el bocadillo se calla igual que cuando hay cartas elegidas (`.mesa:has(.d-dado) .esc-bufon .bocadillo { visibility: hidden }`), o la ficha sube a la placa del TE PEGA. Una receta por Chiche: el Dado, tres tocs que bajan en altura y se aceleran (rodar); el Fósforo, un raspón de ruido y un siseo; la Ginebra, un glu grave."
    },
    {
      "prioridad": "P2",
      "pantalla": "mesa · la caída del Rey y el cobro del oro, con el paño vacío en el centro",
      "ventana": "1280x800 y 390x844",
      "archivo": "src/client/estilos/mesa.css:455-472 (`.pano-postas` queda a opacidad 0,85 aunque no haya mano: el comentario dice «en reposo apenas se ve») · src/client/mano.ts:155 · src/client/pantallas/mesa.ts:1520 (el «+N» de oro nace a 34 celdas sobre el HUD, encima del paño)",
      "que": "Cuando el Rey se raja en dos con sus rayos, debajo sigue un rectángulo verde de 640 px con tres Postas punteadas y sus rótulos «en orden: Escalón» (1280-rey-cae-06 y 08). El «+33» de oro grande aterriza sobre el borde del paño vacío (rey-cae-09), y pasa lo mismo con el «+10» del golpe común (1280-mando-10).",
      "por_que": "La caída del Rey es el mejor momento del juego y ahora la comparte con una grilla de juego apagada. El paño es una herramienta del turno y en el remate es ruido.",
      "propuesta": "Si la mano está vacía o el enemigo cae (`.mesa.cae`), el paño se funde a 0 en tres pasos y se lleva los rótulos. Vuelve con el reparto. El «+N» de oro nace pegado a la caja ORO del HUD y no a media mesa."
    }
  ],
  "aciertos": [
    "Mi P1 de la previa sobre las fichas del HUD quedó resuelto: los corazones salen hacia la izquierda y ya no tapan la Vida (1280-postas-golpe-10, 1280-rey-cae-11, y en el teléfono 390-postas-golpe-10).",
    "El Dado en 1280 por fin paga el clic. Gira en el aire (chiche-usa-02), destella en la cuenta y deja «MULTI +3» en reposo, que luego aparece como término en el desglose del golpe (postas-golpe-00).",
    "Los «+N» de las Postas viajan a su término del desglose («Medio +2», postas-golpe-03): la bandeja dispara y la cuenta recibe.",
    "«SE PLANTA EN LA MITAD · 198 SE PIERDEN» pegado bajo el 198 celeste, y la SEGUNDA CARA «REMATE» con el Rey volteado y las brasas del Reñidero (rey-segunda-08, 09 y 11). La placa del TE PEGA dice «0 · Cara de Póker».",
    "Rendimiento sano: 133–134 fps en las cuatro ventanas, 0 % de cuadros de más de 25 ms y un peor cuadro de 22 ms bajo golpes."
  ],
  "capturas_vistas": [
    "jurado/secuencias/1280-postas-golpe-00, 03, 05, 07, 09, 10; 390-postas-golpe-05, 09, 10",
    "jurado/secuencias/1280-chiche-usa-01, 02, 03, 05; 390-chiche-usa-03, 04, 05, 06",
    "jurado/secuencias/1280-golpe-04, 07, 09; 390-golpe-09",
    "jurado/secuencias/1280-rey-irrumpe-01, 02, 04, 07, 08",
    "jurado/secuencias/1280-rey-segunda-03, 05, 06, 07, 08, 09, 11",
    "jurado/secuencias/1280-rey-cae-02, 04, 05, 06, 08, 09, 11, 14, 17; 390-rey-cae-08",
    "jurado/secuencias/1280-botin-brota-03, 07, 11; 1280-mapa-paso-03; 1280-mando-04, 07, 10",
    "mirar/1280-mesa-grito, 1280-comodin-espectral-racha, 1280-fogon-suspenso",
    "visual-qa/1280x800/rey-mascara, mesa-escalon; visual-qa/390x844/mesa-chispa",
    "jurado/fps.txt"
  ]
}
```

## Veredicto

La 0.21.0 terminó de pulir lo que la previa traía crudo. Las fichas del HUD ya no tapan las cifras, el Dado en 1280 se lee y la segunda cara del Caudal está muy bien armada. El paño suma decisión y tiene su arpegio. Pero el arreglo estrella de esta ronda, el golpe recibido «en un solo carril junto a VIDA», no llegó a la pantalla. El «−16» sigue flotando lejos de la Vida en 1280 y en el teléfono tapa la cuenta y un naipe. Es el número que más se repite en una partida y ya es la segunda versión en que sale mal. El director lo deja pasar porque mide choques y no distancias. Diversión 8,0 (pesa doble), Veredicto 7,9.

**Contra la previa de la 0.21.0.** Resueltos: las fichas que tapaban VIDA y ORO (P1) y el Dado mudo en 1280 (P1). Siguen: el golpe recibido lejos de VIDA (sube a P0) y el Dado en el teléfono, que ahora queda debajo del bocadillo. Siguen también los menores de los «+2» clavados en los naipes y del chip que crece sobre su vecino.

## Defectos menores

- Los «+2» de los naipes no vuelan: se clavan sobre la carta mientras los de las piezas viajan (golpe-04, mando-04). Que vayan a «2+2» del desglose: `src/client/pantallas/mesa.ts:1714`.
- Al asentarse, la ficha LE QUEDAN / SOBRAN crece sobre su vecina: «TE PEGA 1|» en postas-golpe-05 y «SOBRAN 50» pisa «LO ABATÍS» en mando-04. Fijar su ancho como el de las cifras: `mesa.ts:329-334`.
- El naipe enemigo que se raja tapa el total de la cuenta durante un cuadro (mando-07). `partirNaipe` no pasa por el director: `src/client/fx/efectos.ts:403`.
- El chip «4 MÁS» salta sobre la placa CORAZA cada vez que dispara una pieza escondida (golpe-04, botin-brota-03): `src/client/estilos/mesa.css:1744`.
- La ráfaga `rey-irrumpe` filma a la Sota de la Corte y no al Rey, así que la irrupción no se ve desde que el tramo del Rey abre con Corte: `src/client/qa.ts:150-152`, `scripts/secuencias.ts:126-129`.

## Qué haría en la próxima versión

Primero, un paquete «cada cifra junto a su dueño». El daño recibido va dentro de la caja de VIDA con el frenado como subtítulo. El oro ganado nace en ORO y el daño de los naipes viaja a su término. La QA de movimiento suma una regla de distancia al referente, además de la de choques. Segundo, el paño como actor: que se encienda paso a paso durante el conteo (el Medio late en oro cuando duplica, el Escalón sube nota por peldaño con un brillo que trepa) y que se apague en el remate para dejarle la mesa al Rey que cae. Tercero, una voz por Chiche: el Dado rueda y suena a dado, y el Fósforo tacha el INMUNE a la vista con raspón y humo. Con eso el turno sería un 8,5.
