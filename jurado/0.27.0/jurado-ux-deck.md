```json
{
  "jurado": "jurado-ux-deck",
  "version": "0.27.0",
  "puntajes": { "claridad": 8.6, "diversion": 8.6, "estetica": 8.7, "veredicto": 8.6 },
  "defectos": [
    { "prioridad": "P1", "pantalla": "Mesa: el Rey que se planta en la mitad con Perfora (secuencia rey-segunda)", "ventana": "1280x800", "archivo": "src/client/pantallas/mesa.ts:1828-1852 (selloPlanta) y 1063 (dónde nace); src/client/fx/director.ts:229-240 (lo que cede se apaga); scripts/secuencias.ts:117 (la aserción mira el DOM)", "que": "El sello «SE PLANTA EN LA MITAD · N SE PIERDEN» sigue sin verse en lo filmado. Abrí los cuadros 07 a 26 de 1280-rey-segunda, uno por uno: el 200 sobre la Sota, el 99 púrpura sobre el Rey (cuadros 10 a 12), la barra en 195/390, un segundo de espera, el cartel de El Cacique y la SEGUNDA CARA · FORTÍN. El sello no está en ninguno. La espera de 900 ms sí llegó (entre el 99 y el cartel pasa cerca de un segundo), pero se espera frente a nada.", "por_que": "Es la única explicación de por qué 199 de sobra bajaron 99, y es la tercera versión seguida que la pido. Con mando no hay ayuda que la reponga después. Además la puerta nueva no lo detecta, o falló y no se atendió: no pude saber cuál.", "propuesta": "Hipótesis leída en código, no comprobada: el 99 baja flotando sobre el lugar del sello, el director lo hace ceder y, sin otra alternativa libre, lo apaga (la tercera alternativa cae por encima del borde de la pantalla). Darle al sello un lugar fijo que el número no cruce (al costado de la barra, donde hoy está el chip del Rey) y que no ceda. Y que la aserción exija la caja dentro de la ventana y sin nada encima (elementFromPoint), no solo opacidad." },
    { "prioridad": "P2", "pantalla": "Mesa con muchas piezas: el desglose en columna (mesa-garrote, mesa-mando, mesa-chinchon)", "ventana": "1280x800", "archivo": "src/client/pantallas/mesa.ts:349-355 (niveles chico, chico-2) y src/client/estilos/mesa.css:5066-5072; src/client/estilos/base.css:50-51 (--fs-s 16 px)", "que": "A 1280 la columna pierde los nombres y queda una fila de iconos de unos 18 px con cifras de 16 px: «+4 +4 +8 +10» y, sola en otro renglón, «+20». El Garrote es un palito verde. A 1366 la misma mesa dice GARROTE DEL CACIQUE +20. La vela de la escena queda detrás de la columna y ensucia la primera cifra (el «4» base de mesa-garrote, el «9» de mesa-mando).", "por_que": "Mi regla: un icono de menos de 40 px no se distingue y una cifra de menos de 24 no se lee a 40 cm. En la Deck el desglose es una tira de números sin dueño justo cuando hay más piezas que explicar. El total se entiende, por eso es P2.", "propuesta": "A 1280, los dos o tres términos más grandes conservan su nombre corto («Garrote +20») y el resto se junta en «otras +N». La columna a 18 px, con fondo opaco para que la vela no se meta." },
    { "prioridad": "P2", "pantalla": "La ayuda del foco tapa lo que se está leyendo (mesa-mando, hud-evolucion-foco, mapa-mando, mesa-chinchon)", "ventana": "1280x800", "archivo": "src/client/ui.ts:242-256 (ubicarTip y ubicarTipLibre)", "que": "Con mando la ayuda sigue al foco y cae sobre texto vivo. La del Fósforo tapa el naipe de La Corte, que asoma por arriba y por abajo. La de la bandeja corta el renglón de botones («Y de…») y el rótulo L3 CHICHES. La de Guardia en el mapa tapa al Bufón y el borde de su globo. La de «CORTÁS 4 cartas × 6» se apoya en el renglón DAÑO del desglose.", "por_que": "En la Deck la ayuda está siempre abierta: no es un cartel de paso como con el ratón. La regla texto-pisado no la mide.", "propuesta": "Sumar a las zonas que la ayuda no pisa el renglón de botones, los rótulos de la bandeja de Chiches, el globo del Bufón y el desglose. Y que texto-pisado cuente también la ayuda abierta." }
  ],
  "aciertos": [
    "El Garrote ya no rompe la mesa: la cuenta queda en un renglón, la causa «23 − 5 ESCUDO» va bajo la cifra del TE PEGA y La Corte no la toca, a 1280 y a 1366. La Sota ya no pierde escena.",
    "En inglés, «TAKES IT DOWN» va bajo el 0 y no choca con «24 OVER ×3 = 72 CARRY». El dial dice «+3 gold · +1 Mult next hit · 24 ×3 = 72 lost» en un renglón y lleva su glifo R3.",
    "La ayuda habla el idioma de la entrada: mesa-mando dice «Pulsá A para usarlo» y la de la bandeja, «A para leerlas enteras». «LB RB corre de Posta» entra en un renglón bajo el desglose.",
    "El aro de foco se suelta en el golpe (golpe-04) y el conteo enciende cada término en su lugar. GOLPEAR no cambia de sitio entre mesas.",
    "Forja Brava: el naipe a 2× con el ×2 encima y el Bufón callando («Ya está en el fuego. No respires…»). La letra fuera de la mesa no baja de 18 px y las dianas miden 48 de alto o más en todas las pantallas."
  ],
  "capturas_vistas": [
    "visual-qa/1280x800/mesa-garrote.png", "visual-qa/1280x800/mesa-mando.png", "visual-qa/1280x800/mesa-chinchon.png", "visual-qa/1280x800/mesa-chispa.png",
    "visual-qa/1280x800/mesa-escudo-mando.png", "visual-qa/1280x800/hud-evolucion-foco.png", "visual-qa/1280x800/mesa-rey.png", "visual-qa/1280x800/mapa-mando.png",
    "visual-qa/1280x800/jugadas.png", "visual-qa/1280x800/piezas.png", "visual-qa/1280x800/pulperia.png", "visual-qa/1280x800/fogon.png", "visual-qa/1280x800/elegi-una.png",
    "visual-qa/1366x768/mesa-garrote.png", "visual-qa/1366x768/pulperia.png",
    "visual-qa-en/1280x800/mesa-garrote.png", "visual-qa-en/1280x800/mesa-dejalo-justo.png",
    "jurado/secuencias/1280-rey-segunda-07 a 26 (los veinte)", "jurado/secuencias/1280-golpe-04.png", "jurado/secuencias/1280-mando-09.png", "jurado/secuencias/1280-mando-elige-03.png",
    "mirar/1280-forja-brava-x2.png", "mirar/1280-rey-cae.png",
    "medidas.json de todas las pantallas de 1280x800 y 1366x768 (node)"
  ]
}
```

## Veredicto

La 0.27.0 arregla casi todo lo que marqué, pero el sello SE PLANTA sigue sin verse y por eso queda **un P1 abierto**. **No hay P0.** La mesa con el Garrote ahora se lee, el inglés no se pisa, la ayuda nombra el botón correcto y el foco se suelta al golpear. Sube dos décimas y sigue lejos del 9,1.

**Seguimiento de la 0.26:**
- **P1 sello SE PLANTA:** sigue. No aparece en ninguno de los veinte cuadros que van del golpe a la segunda cara.
- **P1 Garrote y «TAKES IT DOWN»:** resuelto en las dos ventanas y en inglés. Deja un resto P2: a 1280 el desglose pierde los nombres.
- **P2 regla del costado partida:** resuelto. La pista va en un renglón; en mesa-chinchon la columna angosta la calla.
- **Menores:** resueltos la ayuda que no se rehacía, el dial partido y el aro durante el golpe. El «Dejalo justo» del Bufón no lo pude comprobar: en la captura inglesa lo dice con el dial todavía en ALL-OUT HIT, que es correcto. Siguen el foco que no es uno solo y la última frase del Rey bajo los rayos.

**Medidas (node sobre los .medidas.json):** en las 31 capturas de mesa la letra más chica es de 16 px («L3 CHICHES», «Medio: pega doble», el «+6» del naipe); fuera de la mesa, 18 o 20. Ningún texto bajo 14, recortes 0, solapes de dianas 0. Diana mínima 104 × 48 px a 1280. La mano montada deja una franja de 87 px por naipe con 8 cartas (mesa-chispa, mesa-escalon) y de 96 con 7 (mesa-chinchon).

Aviso: el sonido, el hitstop y la navegación de la cruceta los leí en código, no los vi. La causa del sello es una hipótesis.

## Defectos menores

- Mano de 8 con naipes apoyados (mesa-chispa): 87 px por naipe, el pie cortado por el HUD y el fantasma del Comodín jugado encima del Comodín que queda en la mano. Se arregla en src/client/mano.ts; no ubiqué la línea.
- Tres focos distintos: celeste con ▼ (naipes y botones), marco dorado (bandeja, hud-evolucion-foco) y marco blanco (piezas). En src/client/estilos/base.css y src/client/hud.ts.
- «Buen tajo…» del Rey sigue bajo los rayos de la rajadura (mirar/1280-rey-cae). En src/client/pantallas/mesa.ts, cerca de la línea 1371.
- El cartel SEGUNDA CARA · FORTÍN tapa el nombre del chip FORTÍN mientras este aparece (rey-segunda-24 y 25). Mismo archivo, función segundaCara (línea 1950).
- La Pulpería a 1366×768: SALIR se ve, pero «+23 de Vida» de CURAR queda cortado contra el HUD y depende de «HAY MÁS ↓». En src/client/estilos/pantallas.css.

## Qué haría en la próxima versión

**«Lo que se filma, se ve».**
1. El sello SE PLANTA con lugar propio y fijo, sin ceder, y una aserción que mire la pantalla y no el DOM: caja dentro de la ventana y nada encima.
2. El desglose de la Deck con nombres para lo que más pesa y «otras +N» para el resto, a 18 px y sobre fondo opaco.
3. La ayuda del foco con zonas vedadas (botones, rótulos, globo del Bufón, desglose) y dentro de la regla texto-pisado.
4. Un solo foco celeste con ▼, también en la bandeja y en Lo que llevás.
5. La mano de 7 u 8 con algo apoyado: dos filas o naipes al 85 % antes que montarlos a 87 px, y sin fantasmas sobre la mano.

Nada de esto toca la Constitución.
