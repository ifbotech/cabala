```json
{
  "jurado": "jurado-novato",
  "version": "0.17.0",
  "puntajes": { "claridad": 7.3, "diversion": 6.9, "estetica": 8, "veredicto": 7.2 },
  "defectos": [
    { "prioridad": "P1", "pantalla": "mesa-rey y mesa-grito (El Caudillo, primera cara)", "ventana": "1280x800", "archivo": "src/client/pantallas/mesa.ts:133-139 (el chip del rasgo, a diferencia de la segunda cara de la línea 138, lleva solo el nombre) y src/rules/reyes.ts:32-35 (carga «Filo» y rasgo «Filo del Caudillo»)", "que": "Al lado de la barra del Rey hay un chip dorado «FILO DEL CAUDILLO» que no dice qué hace. La regla (la mitad de lo que TE PEGA atraviesa tu Escudo) solo está en el tip. Encima, en mi propio desglose leo «Filo +4», que es MI carga: la misma palabra sirve para un premio mío y para una amenaza del Rey.", "por_que": "Es el primer jefe y su regla cambia lo que vale mi Escudo (en la captura tengo 2). Dorado, en mi cabeza, quiere decir «bueno», y como «Filo» ya me suma Daño, leo el chip como algo a mi favor. La segunda cara ya se arregló con una línea corta («Si repetís jugada, TE PEGA ×2»). La primera quedó con el defecto viejo.", "propuesta": "Que el rasgo use el mismo molde que la segunda cara, nombre + renglón corto y en rojo: «LA MITAD ATRAVIESA TU ESCUDO» (Cacique: «si no le sacás Vida, pega más»). Hay que cambiarle el nombre al rasgo para que no comparta palabra con la carga (por ejemplo «Mano dura»). Mientras dure el rasgo, el chip TE PEGA marca con un medio escudo cuánto pasa." },
    { "prioridad": "P1", "pantalla": "bandeja del HUD en mesa, mesa-rey, cabala, fogon, pulperia y secuencia golpe-04/06", "ventana": "1280x800", "archivo": "src/client/hud.ts:57-63 (las cargas son palo + cifra y el rótulo va solo en el tip) y src/client/hud.ts:45-72 (dos tiras sin separar Amuletos, Cábalas, cargas y Bendiciones)", "que": "En la bandeja veo una espada con un 4, un basto con un 0, una copa con un 1 y un glifo blanco suelto («∠») sin marco. No sé qué cifra es cuál ni por qué un 0 ocupa lugar. En la Pulpería el título dice «HUECOS DE AMULETO: 0 DE 5», pero la bandeja muestra cuatro iconos. En el golpe (cuadros 04 y 06), los «+1» y «+8» de esas piezas saltan encimados sobre iconos de 40 px y no se leen.", "por_que": "Es la tercera versión con el mismo reclamo y el commit dice «cargas rotuladas en el HUD», pero a 1280 no veo ningún rótulo: está solo al pasar el cursor, y yo no paso el cursor. Si no entiendo qué llevo, no entiendo por qué compro.", "propuesta": "Debajo de cada carga, en letra chica, poner su nombre (FILO 4, CORAZA, BRINDIS 1) y ocultar las cargas en 0. Separar las tiras con un rótulo mínimo («AMULETOS 4/5» · «REYES»), para que el «0 DE 5» de la Pulpería coincida con lo que se ve, y darle marco de pieza al glifo suelto. Los «+N» del conteo salen apilados, de a uno, no todos a la vez sobre la bandeja." },
    { "prioridad": "P2", "pantalla": "mesa-grito y secuencia golpe-09 (el turno del enemigo)", "ventana": "1280x800", "archivo": "src/client/hud.ts:249-311 (ubicarGrito elige a propósito el lado de Vida/Escudo/Oro) y src/client/qa.ts:229-233 (la QA del grito vigila mano, botones y cuenta, no las cifras del HUD)", "que": "Cuando el enemigo me pega, el grito «¡AY, MI ESPALDA!» se planta encima de ESCUDO y ORO y los tapa enteros, justo en el instante en que esas cifras cambian. El «-23» sale arriba de la caja de VIDA, pero queda sobre el rectángulo punteado «AL DESCARTE» y parece que perdí cartas.", "por_que": "«¿Qué hace el enemigo en su turno?» se aprende mirando ese único segundo: cuánta Vida perdí y cuánto frenó el Escudo. Contra el Caudillo, que atraviesa medio Escudo, es justo la cifra que necesito ver, y es la que el chiste tapa.", "propuesta": "Que el grito no pise nunca las cifras del HUD: que vaya arriba del retrato o, en el escritorio, junto al Bufón. Que el «-N» nazca pegado a la cifra de Vida y que el Escudo muestre su propio «-N frenado» en azul, para que en un solo cuadro lea «perdí 23, el Escudo frenó 0». La QA del grito tiene que medir que las cajas de VIDA, ESCUDO y ORO queden libres." }
  ],
  "aciertos": [
    "La segunda cara se entiende: «TAJO DE REVÉS · Si repetís jugada, TE PEGA ×2», fijo junto a la barra, con «TE PEGA 21» tachado, un 42 grande con ×2 y el chip «TE PEGA 42 · TAJO ×2» en la cuenta. Era mi P1 de la 0.16 y quedó resuelto.",
    "La Pulpería ofrece tres Amuletos que dicen cosas distintas (Moneda falsa, Facón de plata, Boleadoras) y se pueden elegir por lo que hacen y no por el dibujo.",
    "El golpe es un espectáculo legible: DAÑO 37 × MULTI 7 = 259, cada término se enciende mientras suma (cuadros 02 a 04), el 259 grande cae sobre la Sota y la barra pasa a 81/340, que es el «LE QUEDAN 81» que me habían prometido.",
    "La derrota cuenta la historia: los Reyes vencidos partidos al medio, el que me ganó en rojo y el retrato rajado."
  ],
  "capturas_vistas": [
    "visual-qa/1280x800/portada.png", "visual-qa/1280x800/elegir-mazo.png", "visual-qa/1280x800/cabala.png", "visual-qa/1280x800/mapa.png",
    "visual-qa/1280x800/mesa.png", "visual-qa/1280x800/mesa-seleccion.png", "visual-qa/1280x800/mesa-rey.png", "visual-qa/1280x800/mesa-mentiroso.png",
    "visual-qa/1280x800/elegi-una.png", "visual-qa/1280x800/pulperia.png", "visual-qa/1280x800/fogon.png", "visual-qa/1280x800/jugadas.png",
    "visual-qa/1280x800/piezas.png", "visual-qa/1280x800/fin-derrota.png", "visual-qa/1280x800/mesa-segunda.png", "visual-qa/1280x800/mesa-grito.png",
    "visual-qa/390x844/mesa.png", "mirar/1280-comodin-espectral-racha.png",
    "jurado/secuencias/1280-golpe-00, 02, 04, 06, 08 y 09.png"
  ]
}
```

## Primeras impresiones (antes de abrir el código)

- **¿Cómo gano un combate?** Bajo la barra a cero y después viene «LA CORTE · QUEDA 1». «LE QUEDAN 81» me lo dice antes de soltar. Claro.
- **¿Qué hace el enemigo en su turno?** «TE PEGA 23», y después lo veo: -23 y la Vida baja de 67 a 44. Lo que no veo es cuánto frenó el Escudo, porque el grito lo tapa (P2).
- **Números del enemigo:** Vida, golpe, Furia («ya incluida · +3 por turno») y cuántos quedan. Se entiende.
- **Furia** e **Inmune** se entienden (la carta inmune lleva el escudito tachado). **Escudo:** es una cifra del HUD, y qué frena lo dice solo el glosario. **Multi:** se entiende en la cuenta. **Canto:** «¡ESCOBA!», y no está en el glosario. **Golpe exacto:** lo veo recién en la pantalla de derrota («GOLPES EXACTOS 1»); en la mesa nunca. **Comodín:** JUGADAS lo explica en una línea, pero en las capturas de mesa no apareció ninguno.
- Palabras y cifras que no entiendo: «FILO DEL CAUDILLO», el «+8★» del 9, el dado al lado de «Turno 1», ENGAÑO (LT), Taba, Mano corta, porotos, Noche mansa, «la primera pasada es segura» y «PLATA» repetido tres veces.

## Defectos menores

- Elegí una Cábala: el Bufón dice «Las tres tienen trampa» y ninguna carta muestra trampa. Como novato, busco la letra chica y no está: `src/client/voces.ts:46`.
- La estrella quiere decir cuatro cosas: carta templada («+8★»), Comodín, SINERGIA y «Cantos hechos». Y en el desglose, «Templada» lleva una llama: `src/client/mano.ts:430`.
- JUGADAS a 1280: el glosario sigue bajo el pliegue y le faltan canto, carga/Filo y Al rojo: `src/client/pantallas/camino.ts:130-195`.
- Mapa: los escuditos bajo cada nodo siguen sin decir «inmune a», y la fila de arriba queda cortada contra el horizonte: `src/client/pantallas/camino.ts:282`.
- Portada: dice «v0.16.0». La captura es de las 13:16, anterior al commit de versión (13:25), así que no es un defecto del juego, pero el material no muestra la versión juzgada.

## Contra mi veredicto de la 0.16.0

Quedó resuelto el Tajo de revés, que ahora es nombre + regla fija + cifra ×2 grande. También mejoró la Pulpería, con comunes distintos. Sigue lo de «carga» sin rótulo visible y lo de Plata/Oro, además del «+8★», el dado, el glifo «∠», el glosario bajo el pliegue y los escuditos del mapa. El «NO TE PEGA» sin causa no aparece en estas capturas: no lo puedo dar por resuelto. Hay dos nuevos: el rasgo de primera cara sin regla y el grito que tapa el Escudo.

## Qué haría en la próxima versión

Llevar a la primera cara y al HUD la regla que ya funcionó en la segunda cara: **ningún nombre sin su renglón**. (1) Cada rasgo de Rey lleva nombre + regla de cuatro palabras en rojo, y ninguno comparte palabra con una carga del jugador. (2) La bandeja del HUD se parte en «AMULETOS n/5» y «REYES», las cargas llevan su nombre en letra chica, las que están en 0 no se muestran, y un mismo icono no puede querer decir dos cosas (la ★ queda solo para el Comodín). (3) El turno del enemigo se lee en un solo cuadro: «-23» pegado a VIDA, «-N frenado» en ESCUDO, y el grito lejos de las cifras. (4) El glosario sube al primer pliegue de JUGADAS y suma canto, Filo, Al rojo y Golpe exacto. Es todo texto, iconos y ubicación que ya existen: no toca la Constitución y me dejaría la claridad en 8.
