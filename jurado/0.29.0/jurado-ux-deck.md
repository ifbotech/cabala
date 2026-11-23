```json
{
  "jurado": "jurado-ux-deck",
  "version": "0.29.0",
  "puntajes": { "claridad": 9.0, "diversion": 8.8, "estetica": 8.9, "veredicto": 8.9 },
  "defectos": [
    { "prioridad": "P2", "pantalla": "El foco fuera de los naipes: ofertas, Pulpería, Fogón, Cábala Negra, Lo que llevás, bandeja del HUD y Chiches (pulperia, fogon, cabala, 1280-mando-18, piezas, hud-evolucion-foco, 1366 mesa-mando)", "ventana": "1280x800", "archivo": "src/client/estilos/mesa.css:6760-6800 (outline de 2px × --k y flecha de 22 × 14 px) y 4125-4150; para las filas de Lo que llevás, que no están en la lista de la flecha, 6783", "que": "El lenguaje es uno solo, pero el peso no: las medidas dan borde de foco 8 px en los naipes de la mesa y 2 px en 33 de las 68 pantallas (4 px en el mapa y en la bandeja). En la Pulpería el hilo celeste de 2 px sobre BOTA DE VINO pesa menos que el fondo azul pleno del FACÓN DE PLATA de al lado; en Lo que llevás la fila enfocada (COFRE DEL CAUDAL) lleva el hilo sin ▼; en la bandeja del HUD la ▼ no se ve en la captura.", "por_que": "A 7 pulgadas 2 px son un cuarto de milímetro, y media vuelta del latido es casi blanca sobre tarjetas con marco claro. En las pantallas donde se gasta el oro y se arma la partida, el puntero es lo más flaco de la pantalla.", "propuesta": "Marco de 4 px en toda la interfaz (el del mapa, que se ve bien), ▼ de 33 × 21 px como la de los naipes, y ▼ también en las filas de Lo que llevás y, visible, en la bandeja." },
    { "prioridad": "P2", "pantalla": "Mesa con mando, el foco sobre el Comodín con mano de 3 (mesa-mando)", "ventana": "1280x800", "archivo": "src/client/estilos/mesa.css:4598-4600 (la flecha baja 2 px adentro del naipe cuando hay paño) contra el rótulo .c-rotulo, centrado arriba; mano.ts:601", "que": "La ▼ del foco cae justo encima del rótulo «COMODÍN»: se lee «CO▼DÍN». En mesa-escudo-mando, con la mano en abanico, la flecha queda por encima del rótulo y no lo pisa; con la mano de 3 sí. En mesa-chinchon la misma flecha se mete entre las dos espadas del 2.", "por_que": "El Comodín es el naipe con más regla de la mano y el rótulo es lo único que lo nombra. El puntero tapa el nombre de lo que apunta, en la captura principal de la mesa con mando.", "propuesta": "Con el foco, correr el rótulo un renglón abajo, o clavar la flecha a caballo del canto (mitad afuera) también con paño: el fieltro tiene 6 px de aire para eso." },
    { "prioridad": "P2", "pantalla": "Mesa: la letra de lectura sigue a 16 px (desglose, «23 − 4 ESCUDO», «ya incluida · +3 por turno», «L3 CHICHES», renglón del dial R3) y los iconos del desglose miden unos 20 px", "ventana": "1280x800", "archivo": "src/client/estilos/mesa.css:5493 (--fs-desglose), 3447-3460 (.e-neto, en --hueso-2), 2507 (.e-furia-nota)", "que": "Las 32 pantallas de mesa dan 16 px de mínimo; el resto del juego, 18 o 20. La causa del TE PEGA y la nota de la FURIA van además en gris sobre madera oscura. En mesa-dejalo-justo el renglón «+3 de oro · +1 Multi al próximo · no pasan 24 ×2 = 48» va a 16 px en naranja y rosa.", "por_que": "Mi regla es 18 px para leer a 40 cm. El desglose ya dice todo y entero, pero se lee con esfuerzo, y el motivo de la cifra más importante de la mesa (cuánto me pega y por qué) es el texto de menor contraste.", "propuesta": "Desglose a 18 px cuando hay hasta ocho términos (entra: a 1280 sobran dos renglones bajo la columna en mesa-mando); causa del TE PEGA y nota de FURIA en hueso pleno; «L3 CHICHES» a 18." }
  ],
  "aciertos": [
    "El desglose quedó entero: ni un «…» en las pantallas que miré. «GARROTE DEL CACIQUE +20» y «+2» completos a 1280; el caso apretado usa nombres cortos («1.ª sangre», «Cargada», «Sin canto») a 16 px, y en inglés «First Blood», «Loaded Die», «Knucklebone», «Fortune's Chest» entran.",
    "El sello SE PLANTA bajó al centro del paño: en rey-planta-10 y rey-segunda-10 se leen a la vez el chip del Rey, «FURIA 3 ya incluida · +3 por turno», la cuenta y el desglose. El cartel de la SEGUNDA CARA es una franja al medio que deja libres el chip y el HUD.",
    "La ayuda del Chiche va a la izquierda de la bandeja (1366 mesa-mando) y «L3 CHICHES» queda a la vista; el foco del Chiche ya es celeste con ▼.",
    "La regla del paño a 18 px en hueso, con un tercer renglón que dice qué copia el Comodín; JUGADAS y LO QUE LLEVÁS con «HAY MÁS ↓» en caja naranja.",
    "«21 − 3 ESCUDO» en un renglón a 1366 y el rótulo COMODÍN a 16 px o más en todas las mesas (medidas: mínimo 16)."
  ],
  "capturas_vistas": [
    "visual-qa/1280x800: mesa-mando, mesa-dejalo-justo, mesa-garrote, hud-evolucion-foco, piezas, jugadas, mapa-mando, mapa-tesoro, mesa-escudo-mando, mesa-rey, mesa-chinchon, mesa-chiches, mesa-chiche-usa, mesa-mentiroso, mesa-escalon, mesa-sol, pulperia, fogon, cabala, elegi-una",
    "visual-qa/1366x768: mesa-rey, mesa-mando, mesa-garrote",
    "visual-qa-en/1280x800/mesa-dejalo-justo",
    "jurado/secuencias: 1280-mando-03, 08, 13, 18; 1280-rey-planta-10; 1280-rey-segunda-10, 14, 18",
    "medidas.json de las 68 pantallas de 1280x800 y de 1366x768 (node)"
  ]
}
```

## Veredicto

La 0.29.0 cierra mis tres P2 de la 0.28 y sigue con **0 P0 y 0 P1**. Sube una décima en cada columna y queda a una del 9,1 en claridad: lo que falta ya no es letra cortada sino el peso del foco fuera de la mesa y los 16 px que siguen siendo el piso de lectura.

**Seguimiento de la 0.28:**
- **P2 desglose a 14 px con «…»:** resuelto. Mínimo 16 px en las 32 mesas, ningún nombre cortado en español ni en inglés.
- **P2 «GARROTE DEL CAC…»:** resuelto a 1280 y a 1366 (mesa-garrote en las dos).
- **P2 tres marcos de foco y ayuda sobre «L3 CHICHES»:** resuelto el color (celeste en todo lo que vi) y la ayuda. Queda el grosor desparejo, que es mi primer defecto de hoy.
- **Menores:** resueltos el sello sobre el chip y FURIA, COMODÍN a 14 px, las pistas del paño (18 px en hueso) y «21 − 3 ESCUDO» a 1366. Siguen los escudos de Inmune del mapa a unos 28 px.

**Medidas (node, 68 pantallas por ventana):** mesa 16 px de mínimo («L3 CHICHES», «COMODÍN», el «+6» del naipe); todo lo demás 18 o 20. Ningún texto bajo 14, recortes 0, solapes 0. Diana mínima 104 × 48 px. Franja visible con mano de 8: 92 a 107 px a 1280, 102 a 120 a 1366. Borde del foco: 8 px en naipes de la mano, 6 en el naipe del paño, 4 en mapa y bandeja, 2 en el resto. FPS: 94 en reposo y 93 en golpes a 1280, peor cuadro 21 ms.

**Los avisos del autor:**
- El foco en la fase clara: sí, en mesa-escudo-mando y hud-evolucion-foco el marco se ve blanco. Con la ▼ y el filo de tinta se encuentra igual en los naipes; en la interfaz de 2 px es parte del primer defecto.
- Mano de 8: los índices se leen todos; el foco trae el naipe al frente. La acepto.
- El busto del enemigo a 1366 queda cortado en la frente (mesa-mando): menor.
- El Rey del mapa bajo la ayuda: no lo vi en las capturas de 1280; la ayuda de GUARDIA cae sobre cielo vacío.

**No vi:** «A LA SUERTE: 60 %», «ENVIDO: faltan N» ni «COPAS NO CURAN» no aparecen en ninguna captura que abrí; no los juzgo. La cruceta, el latido y el sonido los leí en código, no los vi. La regla de QA letra-chica sobre las secuencias no la corrí: el protocolo no me deja.

## Defectos menores

- El foco sobre el naipe del paño lleva una ▼ de unos 12 px en la esquina de arriba, medio tapada por la barra de la cuenta (mesa-garrote, mesa-sol, mesa-dejalo-justo). `src/client/estilos/mesa.css:3883-3890` y 3909.
- En ¡CHINCHÓN! los cuatro naipes que cortan llevan marco celeste, el mismo color del foco: el foco se distingue solo por la ▼ (mesa-chinchon). `src/client/estilos/mesa.css`, no ubiqué la línea.
- Escudos de Inmune bajo los nodos del mapa a unos 28 px, y los lejanos atenuados. `src/client/pantallas/camino.ts:324`.
- Con naipes montados asoman los índices de abajo del vecino como un «9» cortado junto al 6 (mesa-escalon). `src/client/mano.ts:491-501`.
- A 1366 el busto del enemigo queda cortado arriba, unos 112 px. `src/client/estilos/mesa.css`, bloque `.e-carta`.

## Qué haría en la próxima versión

**«El puntero pesa lo mismo en todas partes, y nada se lee a menos de 18».**
1. Un solo grosor de foco: 4 px y ▼ grande en ofertas, Pulpería, Fogón, Cábala, Lo que llevás, bandeja y Chiches. Sumar a las medidas una regla de QA «foco-flaco» que falle con borde menor a 4 px o sin flecha.
2. La ▼ nunca pisa un rótulo: el de COMODÍN baja un renglón con el foco, y la del naipe del paño va centrada y por delante de la cuenta.
3. Desglose a 18 px cuando entra, con los nombres cortos como escalón siguiente y 16 px solo como último recurso.
4. Causa del TE PEGA y nota de FURIA en hueso pleno.
5. El marco de «cortás» del Chinchón en el azul del Escudo, no en el celeste del foco.
6. Capturas de QA para «A LA SUERTE», «ENVIDO: faltan N» y «COPAS NO CURAN» con mando a 1280, que hoy no se pueden juzgar.

Nada de esto toca la Constitución.
