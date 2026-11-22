```json
{
  "jurado": "jurado-juice",
  "version": "0.21.0",
  "puntajes": { "claridad": 7.6, "diversion": 7.9, "estetica": 8.1, "veredicto": 7.9 },
  "defectos": [
    {
      "prioridad": "P1",
      "pantalla": "mesa · el «−N» que te pega el enemigo cuando el Escudo frena algo",
      "ventana": "390x844 (grave) y 1280x800",
      "archivo": "src/client/pantallas/mesa.ts:837-845 (el «−N» azul del Escudo nace primero y le roba el carril al de la Vida) · src/client/fx/efectos.ts:328-335 (la caja «sobre» cubre toda la caída más un renglón extra, y los nacimientos alternativos solo suben 1, 2 y 3 renglones)",
      "que": "Si el Escudo frena algo, el «−16» no puede nacer junto a VIDA. Choca con el «−7» azul y el director lo manda tres renglones arriba. En 1280 queda flotando en medio del paño, 150 px por encima de la Vida (golpe-09, postas-golpe-09), y sigue ahí en el turno 2, encima del naipe nuevo que se reparte (postas-golpe-10). En el teléfono, el «−16» a escala 2 tapa el renglón TE PEGA / LE QUEDAN de la cuenta, y el «−7» cae sobre el 3 de copas (390-postas-golpe-10).",
      "por_que": "Es el número que te dice cuánto te dolió. Lejos de la Vida no se lee como daño recibido: parece una cifra más de la cuenta. Encima, ahora que el Escudo frena casi siempre, pasa en casi todos los turnos.",
      "propuesta": "Un solo carril para el golpe recibido: «−16» pegado a la izquierda de la caja de VIDA y el frenado chico detrás («−16 · 7 al escudo»), sin un segundo número que compita. Los carriles alternativos van de costado y no hacia arriba. Sumar `[data-cuenta]` y `[data-mano] .carta` a las zonas prohibidas para la capa número. Escala 1,5 en el teléfono. Al repartir la mano nueva se apagan los números del turno anterior."
    },
    {
      "prioridad": "P1",
      "pantalla": "HUD · las fichas de Vida y de oro que saltan",
      "ventana": "las cuatro",
      "archivo": "src/client/hud.ts:145 (--dx = lado × 2,2 hacia la derecha al perder) · src/client/estilos/mesa.css:4344-4355 (ff-salta termina a la derecha y abajo, sobre la cifra) · hud.ts:122 (el comentario promete «nunca sobre las cifras»)",
      "que": "Los corazones que saltan al perder Vida se van a la derecha y pasan justo por la primera cifra. «52» se lee «J2» (golpe-09, postas-golpe-09), «35» se lee «J5» (rey-tajo-11) y al curarte tapan «VIDA 74» (botin-brota-06). La pila de monedas que gana oro tapa «ORO» (rey-cae-08; 390-rey-cae-08 tapa el 24). En el teléfono los corazones tapan la Vida entera (390-postas-golpe-10).",
      "por_que": "La idea es buena: la Vida y el oro son cosas. Pero el cuadro en que perdés Vida es el único en que necesitás leerla, y justo ahí queda tapada. El efecto le roba la cifra al momento que acompaña.",
      "propuesta": "Al perder, las fichas salen del icono hacia la izquierda y hacia arriba (dx siempre negativo) y van por debajo de `.valor` en el z-index. Al ganar, caen en fila a la izquierda del icono. Además, que la QA de movimiento mida estas fichas contra las cifras de `data-hud-*` igual que mide los números."
    },
    {
      "prioridad": "P1",
      "pantalla": "mesa · usar el Dado Cargado (ráfaga chiche-usa)",
      "ventana": "1280x800 y 390x844",
      "archivo": "src/client/pantallas/mesa.ts:1182-1188 (el Dado vuela al enemigo y suelta un destello) · :1184 (dadoArmado solo se ve en el desglose, :235/:263)",
      "que": "El Dado sale de la bandeja, gira y aterriza sobre la Sota como si fuera un ataque. Destella (chiche-usa-03) y después no pasa nada: la Vida sigue 430/430, el TE PEGA sigue 21 y no hay ninguna marca de «+3 MULTI» en la mesa (chiche-usa-04 y 05, 390-chiche-usa-06). El efecto recién aparece cuando elegís cartas, como «Dado Cargado +3» en el desglose.",
      "por_que": "Un consumible tiene que pagar el clic en el momento. El Dado sube tu Multi, pero aterriza en el enemigo y enseña lo contrario. Encima el hueco queda vacío, y el jugador no sabe si funcionó.",
      "propuesta": "Que el Dado caiga sobre el paño o sobre la cuenta y ruede tres caras con un sonido propio de dado. Que deje un «MULTI +3» posado junto a la cuenta en reposo, latiendo hasta el golpe. El Fósforo sí va al enemigo, y le tacha el sello INMUNE a la vista."
    }
  ],
  "aciertos": [
    "Mi P1 de la 0.20 quedó resuelto: el 190 del crítico contra el Caudillo se ve en tres cuadros seguidos (rey-tajo-09, 10 y 11), por encima del cartel del Tajo de revés.",
    "Los «+N» de la bandeja y de las Postas ya no se clavan en los botones: vuelan a su término del desglose y lo hacen brincar (postas-golpe-03: el «+2» del Medio entra en «Medio +2»; golpe-04: el «+1» viaja a «Palo y palo»). Es el recorrido de Balatro que pedí.",
    "El Escalón suena con un arpegio de cuatro notas y la Chispa chisporrotea (audio.ts:33-34; leído en código, no oído). La estrella dorada entre el Comodín y su vecino se lee de un vistazo (visual-qa mesa-chispa).",
    "El Bufón con la máscara del Rey en franja de cine («¿Te asusté? Ahí viene el de verdad», rey-mascara) es la mejor entrada de Rey que tuvo el juego. «¡PRENDA!» sobre el caído con el Dado volando a su hueco se entiende sin leer.",
    "Rendimiento sano: 133–134 fps en las cuatro ventanas, 0 % de cuadros de más de 25 ms y un peor cuadro de 22 ms bajo golpes."
  ],
  "capturas_vistas": [
    "jurado/secuencias/1280-postas-golpe-00 a 10; 390-postas-golpe-03, 05, 09, 10",
    "jurado/secuencias/1280-chiche-usa-01 a 05; 390-chiche-usa-02, 06",
    "jurado/secuencias/1280-rey-tajo-04, 05, 08, 09, 10, 11; 390-rey-tajo-10",
    "jurado/secuencias/1280-golpe-04, 07, 09; 1280-botin-brota-03, 06; 1280-rey-segunda-07",
    "jurado/secuencias/1280-rey-cae-02, 04, 06, 08, 10, 12; 390-rey-cae-08",
    "jurado/secuencias/1280-rey-irrumpe-01, 03, 05",
    "visual-qa/1280x800/rey-mascara, mesa-chispa, mesa-prenda; visual-qa/390x844/mesa-chispa",
    "jurado/fps.txt"
  ]
}
```

## Veredicto

La 0.21.0 trae juguetes nuevos con buen jugo. El paño suma decisiones y tiene sonido propio, los «+N» por fin viajan de la bandeja a la cuenta, y el Bufón disfrazado de Rey es una entrada de verdad. El crítico ya no pierde su cifra. Pero las capas nuevas se pelean con lo que más importa leer. El golpe que te pega el enemigo termina en el medio del paño, o tapando la cuenta en el teléfono. Los corazones que saltan te tapan la Vida en el cuadro en que la perdés. Y el Dado se usa sin que la mesa diga qué hizo. Diversión 7,9 (pesa doble), Veredicto 7,9: una décima abajo de la 0.20. Lo nuevo divierte, pero ensucia el cuadro del dolor.

**Contra el veredicto de la 0.20.0.** Resueltos: el 364/190 del crítico que se borraba (P1) y los «+N» clavados sobre los botones (P1: ahora vuelan al desglose). Sigue: el destello del crítico, que tapa «MULTI 10» durante un cuadro (rey-tajo-05, P2). Sin verificar: el choque del número con «¡ESCOBA!», porque sigue sin haber ráfaga de abatir cantando.

## Defectos menores

- El destello del Crítico nace en el MULTI y lo tapa entero (rey-tajo-05): centrarlo en la cifra y con radio de su alto, `src/client/pantallas/mesa.ts:1743`.
- El paño vacío, con sus rótulos «en orden: Escalón», queda en el centro durante la caída del Rey, y el «+20» de oro sale en medio del fieltro (rey-cae-04, 06 y 08). Fundir el paño cuando la mesa se vacía: `src/client/mano.ts:146`.
- Los «+2» de los naipes no vuelan: nacen con `numero()` y siguen sobre la carta después de que el total ya cayó (postas-golpe-05, 390-postas-golpe-05). Que viajen a «2+2» como los de las piezas: `mesa.ts:1693`.
- Al asentarse, la ficha LE QUEDAN crece sobre la de TE PEGA y el «16» se lee «1€» (postas-golpe-05): `mesa.ts:1766` y el chip en `src/client/estilos/mesa.css`.
- En el teléfono, con 5 Postas, la mano en dos filas tapa el paño y solo asoman los dos 6. La Chispa brilla, pero las Postas no se ven (visual-qa 390x844/mesa-chispa): `src/client/mano.ts:146-171`.

## Qué haría en la próxima versión

Un paquete «el cuadro del dolor». El golpe recibido va en un solo carril pegado a VIDA, con el frenado del Escudo como subtítulo. Las fichas físicas van detrás de las cifras y hacia afuera. La QA de movimiento falla si algo tapa una cifra del HUD. Cada Chiche resuelve a la vista: el Dado rueda y deja «MULTI +3» en la cuenta, el Fósforo tacha el INMUNE, la Tiza convierte una carta en Comodín con su propio destello y el Poroto reparte con sonido. Los «+N» de los naipes vuelan a «DAÑO» igual que los de las piezas, para que la cuenta reciba todo por el mismo camino. Y dos ráfagas nuevas obligatorias en la puerta: **abatir cantando** y **golpe recibido con Escudo**. Con eso, el paño sería un 8,5.
