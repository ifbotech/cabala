```json
{
  "jurado": "jurado-novato",
  "version": "0.15.0",
  "puntajes": { "claridad": 6.9, "diversion": 6.8, "estetica": 8, "veredicto": 7 },
  "defectos": [
    { "prioridad": "P1", "pantalla": "mesa-rey (y toda mesa contra un Rey)", "ventana": "1280x800", "archivo": "src/client/pantallas/mesa.ts:127-130 (e-ataque: la cifra ya es ataque + furia) y src/client/textos.ts:141-142 (furiaTip, furiaTurno solo en tip)", "que": "Ahora se lee «TE PEGA 21» y debajo «+3 FURIA». Yo sumo: me pega 24. En el código el 21 ya trae la Furia adentro. Y que la Furia sube cada turno («+2 por turno») sigue escondido en el tooltip; la palabra Furia tampoco figura en JUGADAS.", "por_que": "Es la cifra con la que decido si golpeo o descarto. Una cifra que parece sumable y no lo es me hace calcular mal la Vida que me queda, justo contra el Rey, que es donde se pierde la partida.", "propuesta": "Que la línea diga de dónde viene, no qué agregar: «21 · incluye 3 de Furia» o «18 +3», y debajo una línea fija de tres palabras, «FURIA · +2 POR TURNO». Sumar a JUGADAS, junto a Inmune y Comodín, una regla de una línea: «Furia: el Rey pega más cada turno y cada vez que barajás»." },
    { "prioridad": "P1", "pantalla": "mesa-seleccion, secuencia 1280-golpe-00…09, jugadas", "ventana": "1280x800", "archivo": "src/client/pantallas/mesa.ts:172-185 (sumaD, sumaM, desglose y efectos) y src/client/pantallas/camino.ts:112 (fila de JUGADAS con B.jugadas[j].m)", "que": "El desglose ya está antes de golpear (gracias), pero es una sopa: «5 + 2 + 3 · Flor +6 · Cantos hechos +10 · Mate curado +24 · Filo +2 × Flor +2 · Mano corta +4». Hay nombres de Amuletos y Bendiciones sin su icono, una «×» suelta en medio de la frase que separa Daño de Multi sin decirlo, y un «♥ +15» sin rótulo al final. En JUGADAS, «QUINCE +0 ×1» contradice el canto de arriba, que dice «Multi x2». En el cuadro 03, la etiqueta «Calls made +10» se apila sobre la misma línea y «FLOR» queda pegado a «DAMAGE».", "por_que": "Leo cinco nombres que no sé qué son y no encuentro de dónde salió el 6 del Multi. La línea existe, pero no la puedo leer de un vistazo, y JUGADAS me dice que la Escoba no multiplica.", "propuesta": "Partir la línea en dos con rótulo: «DAÑO 5+2+3 · [flor] 6 · [cascabel] 10 · [mate] 24» y «MULTI [flor] 2 · [filo] 2 · mano corta 4», poniendo el icono del HUD en vez del nombre. «♥ +15 te cura». En la fila Quince, mostrar «×2» o «canto» en vez de «×1»." },
    { "prioridad": "P2", "pantalla": "pulperia, piezas, elegi-una, fin-derrota, mesa-mentiroso", "ventana": "1280x800", "archivo": "src/rules/amuletos.ts:34 («punto de carga de su Rey»), src/rules/aumentos.ts:9 (NIVEL_NOMBRE Plata/Oro), src/client/pantallas/camino.ts:135-136 (reglas de JUGADAS), src/client/hud.ts:53 (fichas de carga sin nombre)", "que": "Las palabras se pisan. «Oro» es la plata que tengo, «Oros» es un palo y «Oro» también es el rango de una Cábala (Cara de Póker · Oro). El primer Amuleto común que veo en la Pulpería habla de «punto de carga de su Rey (tope +6)». La mesa dice «TE PEGA» y los textos dicen «Contraataque». «Golpes exactos» sale en la derrota y nunca se explica en JUGADAS. El sello «+8★» del 9, las fichas del HUD «2 +5» y el botón ENGAÑO siguen mudos.", "por_que": "Cada nombre nuevo sin explicar es una regla que no aprendo. A los cinco segundos me quedo con «compro la que pega más» y no con el juego que pensaron.", "propuesta": "Plata/Oro de Cábala → «Común/Rara» con marco y sin palabra. «Contraataque» → «golpe del enemigo» en todos los textos. Amuleto común: «+3 de Daño por Espada; más si venciste a su Rey». Dos líneas más en JUGADAS: Golpe exacto y Engaño. Nombre corto pegado a cada carga del HUD (FILO 2)." }
  ],
  "aciertos": [
    "Lo que pedí en la 0.14.0 llegó: «TE PEGA 23», «INMUNE A ESPADAS», «QUEDA 1» bajo La Corte y «FURIA» se leen sin cursor. Las cifras del enemigo ya no son un jeroglífico.",
    "La cuenta antes de golpear dice «LE QUEDAN 28» y «TE PEGA 23»: sé si mato y cuánto me cuesta antes de soltar.",
    "Foco inicial: en la mesa cae en la primera carta y en el Fogón con Vida llena cae en Templar. Con mando, A ya juega.",
    "JUGADAS ahora explica Comodín e Inmune en una línea cada uno; el Comodín que se vuelve un 3 de oros fantasma (mirar/) lo confirma a la vista.",
    "Portada, elegir Mazo, Cara o cruz, Elegí una Cábala y Pulpería siguen entendiéndose en cinco segundos; «Lo que llevás» ya avisa con la flecha que sigue abajo."
  ],
  "capturas_vistas": [
    "visual-qa/1280x800/portada.png", "visual-qa/1280x800/elegir-mazo.png", "visual-qa/1280x800/cabala.png", "visual-qa/1280x800/mapa.png",
    "visual-qa/1280x800/mesa.png", "visual-qa/1280x800/mesa-seleccion.png", "visual-qa/1280x800/mesa-rey.png", "visual-qa/1280x800/mesa-mentiroso.png",
    "visual-qa/1280x800/elegi-una.png", "visual-qa/1280x800/pulperia.png", "visual-qa/1280x800/fogon.png", "visual-qa/1280x800/jugadas.png",
    "visual-qa/1280x800/piezas.png", "visual-qa/1280x800/fin-derrota.png",
    "jurado/secuencias/1280-golpe-00, 03, 06 y 09.png",
    "mirar/1280-comodin-espectral-racha.png"
  ]
}
```

## Primeras impresiones (antes de abrir el código)

- **¿Cómo gano un combate?** Bajo a cero la barra roja (340/340) y después viene el que está en «LA CORTE · QUEDA 1». La cuenta me dice «LE QUEDAN 28» antes de golpear: clarísimo.
- **¿Qué hace el enemigo en su turno?** «TE PEGA 23». En el cuadro 09 lo vi pegarme: un «23» gigante que tapa toda mi caja de VIDA, y no alcanzo a leer cuánto me quedó.
- **Números del enemigo:** vida, golpe y cuántos quedan, ya rotulados. El Rey: «21» y «+3 FURIA». ¿24? ¿21? No sé.
- **Furia:** la palabra aparece, pero no dice que crece. **Inmune:** resuelto con nombre y carta gris. **Escudo:** «Cada Basto te da Escudo»; qué frena, solo en el tip. **Multi:** multiplica, se ve en la cuenta. **Canto:** el «¡ESCOBA!» del Mazo. **Golpe exacto:** «¡EXACTO!» por matar justo, deducido; en ningún lado está escrito qué premia.
- **Comodín:** JUGADAS lo explica y la carta fantasma lo confirma. **Engaño:** botón con LT, ni idea.
- Palabras que no conozco: punto de carga, Filo, Contraataque, Cantos hechos, Mano corta, Plata/Oro (como rango), racha, porotos, Reinado, Noche mansa, «la primera pasada es segura», el «+8★», el dado junto al turno.

## Defectos menores

- Golpe, cuadro 09: el «23» del daño recibido tapa la caja VIDA entera; que vuele desde el retrato y no encima de la cifra: `src/client/hud.ts:192` y alrededores.
- Mapa: los escuditos bajo cada nodo siguen sin decir «inmune a», y la fila de arriba queda cortada bajo la cabecera: `src/client/pantallas/camino.ts:202-204`.
- Derrota: «TE LLEVÓ LA CORTE» mejora, pero los tres retratitos siguen sin rótulo: `src/client/pantallas/camino.ts:746-752`.
- Fogón: «La primera pasada es segura» insinúa un riesgo que no se nombra: `src/client/textos.ts:128`.
- Mentiroso: el dado junto a «Turno 1» y la «STREAK ×2» siguen sin una palabra: `src/client/pantallas/mesa.ts:112` (zona de sellos).

## Contra mi veredicto de la 0.14.0

Resuelto: rótulos fijos del enemigo (TE PEGA, INMUNE A, QUEDA 1, FURIA), desglose antes de golpear y foco inicial en mesa y Fogón; también «Lo que llevás» con flecha y AL DESCARTE entero. Siguen: el mapa sin la marca de inmunidad, Engaño, «+8★» y cargas del HUD sin nombre, y la derrota sin rótulos. Nuevo: la Furia que parece sumable y un desglose que existe pero no se lee.

## Qué haría en la próxima versión

Pasar de «está escrito» a «se lee de un vistazo». (1) La cifra del enemigo que no engañe: «21 (con 3 de Furia)» y «+2 por turno» a la vista. (2) Un desglose en dos renglones rotulados, DAÑO y MULTI, con iconos en vez de nombres propios, y la fila Quince que diga ×2. (3) Un glosario mínimo en JUGADAS: Furia, Golpe exacto, Engaño, Escudo («frena el golpe del enemigo»), una línea cada uno. (4) Un solo nombre por cosa: fuera «Contraataque», fuera «Plata/Oro» como rango, y nada de «carga» en el primer Amuleto que compro. (5) Primer combate con tres bocadillos del Bufón atados a lo que pasa: «te pega cuando terminás», «matalo justo y cobrás», «las grises no le hacen nada». Es texto e iconos que ya existen, no toca la Constitución, y me dejaría la claridad en 7,5–8.
