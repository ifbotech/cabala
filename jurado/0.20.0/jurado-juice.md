```json
{
  "jurado": "jurado-juice",
  "version": "0.20.0",
  "puntajes": { "claridad": 7.9, "diversion": 8.0, "estetica": 8.3, "veredicto": 8.0 },
  "defectos": [
    {
      "prioridad": "P1",
      "pantalla": "mesa · Crítico contra El Caudillo con el Tajo de revés armado (el golpe más grande del tramo)",
      "ventana": "1280x800 (en 390x844 dura un solo cuadro)",
      "archivo": "src/client/pantallas/mesa.ts:1056 (limpiarNumeros() al entrar poderRey('deguello')) contra :596-604 (el número nace y solo espera pausa(160))",
      "que": "El crítico por fin estalla en el MULTI: la cifra pasa a oro, cae el sello ×2 y la cuenta se sacude (rey-tajo-04 a 06). Pero el 364 que le saca al Rey no aparece en ningún cuadro de 1280-rey-tajo. En 08 el Rey se pone blanco, en 09 la barra ya dice 46/455 y no hay número, y en 10 entra el cartel del Tajo de revés. En el teléfono el 364 se ve en un solo cuadro (390-rey-tajo-10) y en 11 ya no está. El comentario de la línea 1054 dice que el número «ya va bajando por su carril», pero la línea 1056 lo apaga.",
      "por_que": "Es el remate que vengo pidiendo hace tres versiones. Se arma bien todo el crítico y después se le borra la cifra. Si el Tajo está armado (repetís algo que no es Carta sola contra el Caudillo), el golpazo de la partida queda sin número, que es justo lo que el jugador viene a ver.",
      "propuesta": "El cartel del Rey no apaga lo que está en el aire: se lo pide al director (pedir('cartel', …)) y, si choca, espera a que el número pase su punto alto (unos 450 ms). Un número de media Vida o más se garantiza 600 ms de vida. limpiarNumeros() queda solo para la caída del Rey. Que la QA de movimiento falle si en una ráfaga baja la Vida del enemigo y ningún cuadro muestra la cifra."
    },
    {
      "prioridad": "P1",
      "pantalla": "mesa · los «+N» y «×N» de la bandeja durante el conteo",
      "ventana": "1280x800",
      "archivo": "src/client/fx/director.ts:24 (ZONAS_PROHIBIDAS no incluye los botones ni la fila de fichas) · src/client/fx/efectos.ts:333-335 (los nacimientos alternativos suben 1, 2 y 3 renglones) · src/client/pantallas/mesa.ts:1366-1368 y :1408 (soltarCifra)",
      "que": "El director aparta los «+N» de la bandeja unos de otros empujándolos hacia arriba, hasta la columna de los botones. Un «+1» azul queda clavado sobre GOLPEAR y después sobre DESCARTAR durante un segundo (golpe-05, 07 y 09; botin-brota-03). El «×2» del crítico sale a escala 2 encima de la ficha FILO 6 (rey-tajo-04), y el «+1» grande todavía tapa la fila de iconos (golpe-04).",
      "por_que": "Todo eso pasa a 500 px de la cuenta, en la esquina contraria, justo cuando el ojo debería estar en el MULTI. Quedan cifras sueltas sobre los botones de acción, que encima parecen un precio o un contador del botón. Es ruido en el momento más legible del turno.",
      "propuesta": "Que el «+N» de cada pieza vuele de su ficha a su término del desglose y muera ahí, como en Balatro. Así la bandeja dispara y la cuenta recibe, en un solo recorrido. Si se quedan en la bandeja, sumar `.acciones` y la fila `[data-tiras]` a ZONAS_PROHIBIDAS y que el carril alternativo sea de costado, nunca más de un renglón hacia arriba."
    },
    {
      "prioridad": "P2",
      "pantalla": "mesa · el estallido del Crítico en la fórmula",
      "ventana": "1280x800 y 390x844",
      "archivo": "src/client/pantallas/mesa.ts:1417-1420 (destello y chispas en r.right del MULTI) y :1397-1400 (de 7 a 14 en 3 pasos de 34 ms) · src/client/estilos/mesa.css:3488-3503 (.c-crit-sello a bottom 58 %, rotate −8°)",
      "que": "El destello de 26 nace en el borde derecho del MULTI y durante dos cuadros tapa el «=» y la primera cifra del total (rey-tajo-04 y 05, 390-rey-tajo-05 y 06). El total es zona prohibida, pero el destello no pasa por el director. En el teléfono el sello ×2 queda encima de la «I» de MULTI (390-rey-tajo-09). En 1280 pisa el «=» y roza la placa del Caudillo (rey-tajo-06). La cifra va de 7 a 14 en unos 100 ms: el «se duplicó» no se llega a leer.",
      "por_que": "El crítico ahora está bien dicho, pero su primer cuadro es una mancha amarilla sobre el número que más importa.",
      "propuesta": "Centrar el destello en la cifra del MULTI, con radio de su alto. Darle al sello un hueco propio (padding-right ya reservado) y medirlo con el director contra el total. Que la cifra suba en 3 pasos de 90 ms, con una nota ascendente por paso."
    }
  ],
  "aciertos": [
    "Del Botín a ELEGÍ UN AMULETO sin velo negro: el Botín queda atenuado detrás y las tres cartas salen enteras desde el primer cuadro (rey-cae-12 y 13). Arreglado mi P2 de tres versiones.",
    "El Crítico vive en la cifra grande: MULTI en oro, sello ×2 pegado a la fórmula y la cuenta que se sacude (rey-tajo-04 a 06). Y la ráfaga rey-tajo existe y se ve en las dos ventanas.",
    "El número del golpe común sale limpio a la derecha del naipe, sin pisar sellos ni el total (golpe-09: 301 al lado de la Sota).",
    "La caída del Rey sigue siendo el mejor momento del juego: congelado en blanco, rajadura con rayos de su palo, naipe partido en dos y monedas (rey-cae-04 a 06). La tormenta del Arrabal mete un relámpago que atraviesa la mesa (rey-tajo-12): el fondo vive.",
    "En el teléfono, el grito del Personaje ya no se le cuelga al Bufón en el Botín (390-rey-cae-11).",
    "Rendimiento impecable: 164,8 fps en las cuatro ventanas, 0 % de cuadros de más de 25 ms y un peor cuadro de 12 ms bajo golpes."
  ],
  "capturas_vistas": [
    "jurado/secuencias/1280-golpe-00, 04, 05, 07, 08, 09; 390-golpe-05, 08, 09",
    "jurado/secuencias/1280-rey-tajo-00, 03, 04, 05, 06, 07, 08, 09, 10, 11, 12; 390-rey-tajo-05, 06, 09, 10, 11",
    "jurado/secuencias/1280-rey-cae-03, 04, 05, 06, 07, 10, 11, 12, 13; 390-rey-cae-05, 11, 13",
    "jurado/secuencias/1280-rey-segunda-03, 05, 06, 07, 08, 09, 11; 390-rey-segunda-10",
    "jurado/secuencias/1280-rey-irrumpe-03, 06, 08; 1280-botin-brota-03, 07, 10; 1280-mapa-paso-01, 03; 1280-portada-03; 1280-mando-03",
    "mirar/1280-comodin-espectral-racha, 1280-fogon-suspenso, 1280-fogon-despues, 1280-conteo, 1280-mesa-grito, 390-rey-cae",
    "visual-qa/1280x800/mesa-conteo; visual-qa/390x844/mesa-conteo",
    "jurado/fps.txt"
  ]
}
```

## Veredicto

La 0.20.0 hizo el trabajo grande que pedí: hay un director de escena, el crítico estalla en la fórmula y la elección de Amuleto ya no pasa por negro. Las capas que vuelan ya no se pisan en el golpe común, y la caída del Rey con su tormenta es un momento de juego de verdad. Por primera vez pongo el 8.

No pasa de ahí por una paradoja: el director ordena lo que vuela, pero el cartel del Rey sigue usando la goma de borrar vieja (limpiarNumeros) y se lleva el 364 del crítico. El mejor golpe de la ráfaga queda sin cifra en 1280. Además, el director resuelve los choques de la bandeja mandando cifras a los botones. Diversión 8,0 (pesa doble). Veredicto 8,0.

**Contra el veredicto de la 0.19.0.** Resueltos: el velo negro antes de ELEGÍ (P2), el crítico chico (P1: ahora estalla en el MULTI, aunque con el P2 de arriba), la ráfaga rey-tajo que faltaba y el grito del Botín pegado al Bufón en el teléfono. Sin verificar: el choque del número con «¡ESCOBA!» (P1), porque ninguna ráfaga de esta versión abate cantando; en código el canto espera al número (mesa.ts:586-597). Siguen: los «+N» de la bandeja, que ahora caen sobre los botones, y la frase del Bufón que flota lejos de él en el teléfono.

## Defectos menores

- El número de un Rey cae sobre la columna TE PEGA / FURIA y tapa «ya incluida · +3 por turno» (rey-cae-03: 174; rey-segunda-07 y 08: 280). Sumar `.e-ataque` a ZONAS_PROHIBIDAS o bajar el carril derecho: `src/client/pantallas/mesa.ts:1013`.
- Cuando el Rey se planta en la mitad, el número dice 280 y la barra baja 1 (171 → 170, rey-segunda-06 y 07), sin marca en el golpe. Pintar la cifra en el celeste de piedra de `v-planta` o sumarle «SE PLANTA»: `mesa.ts:596`.
- Las últimas palabras del Rey quedan arriba de todo, sin cola, con las motas azules de la rajadura pasando por encima (rey-cae-06), y en 04 se ven fantasma sobre el naipe: `mesa.ts:689-693`.
- En el teléfono, SALTAR queda al lado del «ELEGIR» atenuado de la fila de la Cábala del Bufón y se lee como un segundo botón (390-rey-cae-13): `src/client/pantallas/camino.ts:440` y `:560`.
- Cada vez que dispara una pieza escondida, el chip «4 MÁS» sube y tapa la fila de iconos (golpe-05, botin-brota-03, mando-03): `src/client/hud.ts:233-237` (`.dispara` sin tope de recorrido).

## Qué haría en la próxima versión

Terminar de darle poder al director: que nada borre a mano. El cartel del Rey, la segunda cara y la rajadura piden turno igual que el resto, y el número de media Vida tiene vida garantizada. Los «+N» de la bandeja viajan a su término del desglose, como una cuenta que se llena y no fuegos artificiales en la esquina. El crítico gana un cuarto de segundo de cuenta ascendente con notas que suben, y su destello se centra en la cifra. Además, quiero dos ráfagas nuevas obligatorias para la puerta: **abatir cantando** (para cerrar el choque número contra ¡ESCOBA!) y **crítico con Tajo armado**. La QA de movimiento tiene que fallar si el enemigo pierde Vida y ningún cuadro muestra la cifra. Con eso, el crítico contra el Caudillo sería un 8,5.
