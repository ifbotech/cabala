```json
{
  "jurado": "jurado-ux-deck",
  "version": "0.26.0",
  "puntajes": { "claridad": 8.4, "diversion": 8.5, "estetica": 8.6, "veredicto": 8.4 },
  "defectos": [
    { "prioridad": "P1", "pantalla": "Mesa: el Rey que se planta en la mitad con Perfora (secuencia rey-segunda)", "ventana": "1280x800", "archivo": "src/client/pantallas/mesa.ts:1714 (el sello pide turno al director con ubicar) y mesa.ts:1839-1843 (el cartel del Rey lo borra); mesa.ts:961-968 (dónde nace)", "que": "El sello «SE PLANTA EN LA MITAD · N SE PIERDEN» ya no se ve. El golpe marca 200 sobre la Sota, que tenía 1 de Vida. Al Rey entra un 99 púrpura y su barra queda en 195/390. Recorrí los cuadros 06 a 23 y el sello no está en ninguno. Según el código, se pierden 100 sin que nada lo diga. El púrpura antes de que hable el Rey sí llegó. El sello, en cambio, espera turno detrás del 99 y el cartel del Rey lo despide antes de que salga.", "por_que": "Es la única explicación de por qué un golpe enorme no lo bajó más. En la 0.25 lo pedí a 24 px y ahora no se ve a ningún tamaño. Con mando no hay ayuda que lo reponga: la cuenta 199 − 99 no se puede rehacer.", "propuesta": "El sello pegado al 99 en el mismo pedido al director, sin esperar turno, y el cartel del Rey esperando a que el sello cumpla 900 ms. Si no hay lugar, que lo diga el cartel: «SE PLANTÓ EN LA MITAD · 100 SE PERDIERON». Y que secuencias.ts falle si ningún cuadro de rey-segunda tiene .sello-planta visible." },
    { "prioridad": "P1", "pantalla": "Mesa con el Garrote del Cacique (mesa-garrote, secuencia maldicion) y la cuenta en inglés (mesa-dejalo-justo EN)", "ventana": "1280x800 y 1366x768; EN 1280x800", "archivo": "src/client/estilos/mesa.css:4067-4090 (TE PEGA bajo La Corte cuando la escena se achica); src/client/pantallas/mesa.ts:527 (el desglose sube a tres renglones); scripts/visual-qa.ts (la regla de solapes no compara texto con naipe ni chip con chip)", "que": "Con el Garrote, GARROTE DEL CACIQUE aparece dos veces en el desglose y la cuenta pasa a tres renglones. La escena se achica: la Sota queda cortada a la cintura y el naipe de La Corte tapa la «O» de «23 − 5 ESCUDO», la causa del TE PEGA, a 1280 y a 1366. En inglés, «TAKES IT DOWN» choca con el chip «24 OVER ×3 = 72 CARRY» y la N queda bajo su borde. Las medidas dicen solapes 0 y recortes 0.", "por_que": "La 0.25 prometió que el TE PEGA no se tapaba más, y lo tapa justo el estado nuevo de la versión. Si la puerta da 0 donde el solape se ve a simple vista, deja de servir para firmar la Deck.", "propuesta": "Con el Garrote, el desglose en dos renglones: un término por pieza («GARROTE +20 · +2») o su nombre corto. La Corte, a un costado de la columna del TE PEGA y nunca encima. Sumar a la QA el solape de .e-ataque contra .corte-carta y el de los chips del veredicto entre sí." },
    { "prioridad": "P2", "pantalla": "Mesa con mano de 8 y paño de 5 Postas (mesa-chinchon)", "ventana": "1280x800", "archivo": "src/client/mano.ts:512-516 (la regla del costado solo se calla si le quedan menos de 150 px)", "que": "A la regla del costado le quedan unos 200 px y se parte entera: «Medio: pega / doble», «3 o más en / subida: Escalón / +2 de Multi». «LB RB corre de Posta» ocupa tres renglones y la palabra «Posta» queda bajo el 2 de Espadas enfocado.", "por_que": "Es el único lugar donde la Deck enseña que LB y RB corren de Posta, y se corta en el Mazo que más Postas usa.", "propuesta": "Callar la regla, o subirla al renglón de reposo sobre la mano, cuando es más alta que el paño o su base pisa la mano. La pista de botones nunca se parte: «LB RB corre» en un solo renglón." }
  ],
  "aciertos": [
    "Mi P1 del dial quedó resuelto. La cuenta dice «SOBRAN 24 ×3 = 72 PASAN» y el dial, «no pasan 24 ×3 = 72»: la misma cifra, con el ×3 a la vista, también en inglés. La pista del paño sigue al dial: con PEGÁ CON TODO dice «R3 pega con todo».",
    "El chip de la maldición se lee a 1280: MALDICIÓN en carmesí, el ícono y «−3 DE VIDA» o «−5 DE ESCUDO». En el código tiene tabindex, es mirable y su ayuda nombra la pieza (mesa.ts:450). El TE PEGA ya descuenta lo que el Garrote te quita de Escudo (23 − 5).",
    "NO TE PEGA y TE PEGA comparten celda: la placa no salta entre mesa-maldicion, mesa-dejalo-justo, mesa-chinchon y la versión en inglés. DESCARTAR con Sol dice «∞» y «−3 oro» en el mismo botón.",
    "La Forja Brava es una cumbre de verdad: el panel se pliega, el naipe baja a la fogata, sale un ×2 enorme o «SE QUEMÓ. LA PERDISTE.», y el Bufón dice «¡FORJA BRAVA! Doble Filo.».",
    "La letra se sostiene. Fuera de la mesa no baja de 18 a 1280 ni a 1366, la mesa tiene un mínimo de 16 (la regla del paño), no hay texto por debajo de 14 y las dianas miden 48 o más en todas las pantallas."
  ],
  "capturas_vistas": [
    "visual-qa/1280x800/mesa-maldicion.png", "visual-qa/1280x800/mesa-dejalo-justo.png", "visual-qa/1280x800/mesa-pega-todo.png", "visual-qa/1280x800/mesa-mando.png",
    "visual-qa/1280x800/mesa-garrote.png", "visual-qa/1280x800/hud-evolucion-foco.png", "visual-qa/1280x800/mesa-sol.png", "visual-qa/1280x800/mesa-chinchon.png",
    "visual-qa/1280x800/mesa-exacto.png", "visual-qa/1280x800/forja-brava-eleccion.png", "visual-qa/1280x800/fogon-mutaciones.png", "visual-qa/1280x800/mapa-mando.png",
    "visual-qa/1366x768/mesa-garrote.png", "visual-qa-en/1280x800/mesa-dejalo-justo.png",
    "jurado/secuencias/1280-maldicion-00/06/10/15.png", "jurado/secuencias/1280-rey-segunda-04/06/07/08/09/10/11/12/13/14/16/18/19/20/23.png",
    "jurado/secuencias/1280-rey-cae-01/03/05/08.png", "jurado/secuencias/1280-golpe-04.png", "jurado/secuencias/1280-mando-07/15.png", "jurado/secuencias/1280-mando-elige-03.png",
    "jurado/secuencias/1280-contragolpe-04/08/10.png",
    "mirar/1280-rey-cae.png", "mirar/1280-fogon-templada.png", "mirar/1280-forja-brava-elegir.png", "mirar/1280-forja-brava-x2.png", "mirar/1280-forja-brava-despues.png", "mirar/1280-forja-brava-quemada-despues.png", "mirar/1280-fogon-suspenso-brava-llama.png",
    "medidas.json de todas las pantallas de 1280x800 y 1366x768 (node)"
  ]
}
```

## Veredicto

La 0.26.0 cierra mis dos P1 de la 0.25: el dial y la cuenta dicen la misma cifra con su ×3, y la maldición tiene chip propio, foco y nombre. **No hay P0.** Pero lo que se ganó en claridad se perdió en otro lado. El sello SE PLANTA, que había que agrandar, ahora no sale. Y el Garrote, la Evolución nueva, vuelve a tapar la causa del TE PEGA mientras la QA dice 0 solapes. La recomendaría con un pero chico, el mismo de la versión anterior.

**Seguimiento de la 0.25:**
- **P1 dial (24 contra 72):** resuelto, en español y en inglés.
- **P1 chip de la maldición sin foco:** resuelto en el código (tabindex, mirable y ayuda con la pieza). Ninguna captura lo muestra enfocado, así que lo cuento como leído y no visto. La cara del chip sigue sin nombrar la pieza: solo lleva el ícono.
- **P2 sello SE PLANTA de 14 px sobre la barra:** resuelto en el CSS (var(--fr), un renglón, lejos de la barra), pero en la secuencia ya no aparece. Pasa a P1.
- **Menores:** resueltos la ayuda de la bandeja lejos de su lugar, la pista «R3 lo deja justo», el «Tocalo» del Fósforo y el saludo genérico del Fogón. Siguen el verbo del dial en Silkscreen 18, el foco que no es uno solo, el aro de foco durante el golpe, el doble texto de la Forja Brava y el Bufón que pide «¡Dejalo en 0 justo…!» cuando ya está justo.

Aviso: el foco sobre el chip de la maldición, su ayuda y el renglón del Bufón la primera vez que cobra los leí en el código, no los vi. Solo vi los cuadros fijos, no el sonido ni el hitstop.

## Defectos menores

- La ayuda abierta no se rehace cuando cambia la entrada. mesa-mando dice «Pulsá Enter» con todos los glifos del mando a la vista: la QA mueve el foco con flechas y recién después pone el modo mando. La bandeja no tiene pie para teclado, así que con teclado dice «Tocá». Está en ui.ts:203-204, nav.ts:62-66 y hud.ts:143.
- El dial parte la fórmula en dos: «no pasan 24 ×3 = / 72» (mesa.css:4721). Necesita nowrap sobre la cifra.
- Forja Brava: «NAIPE ENTERO x2» y «FORJA BRAVA: EL NAIPE ENTERO VALE DOBLE» siguen juntos (camino.ts:944). Durante el ×2, el globo del Bufón todavía dice «Tercera pasada… rezá».
- La última frase del Rey, «Buen tajo… paisa», queda debajo de los rayos de la rajadura (rey-cae-05 y mirar/rey-cae). Es el solape conocido y se arregla en mesa.ts:1363-1375 o con el z-index de los efectos.
- El aro celeste sigue puesto durante el conteo (golpe-04). Conviene soltarlo en mesa.ts:2213. La bandeja enfocada lleva marco dorado y no el foco celeste (hud-evolucion-foco).

## Qué haría en la próxima versión

**«Que la puerta vea lo que ve el Jurado».**
1. Secuencias con aserciones. En rey-segunda, que .sello-planta sea visible en algún cuadro. En rey-cae, que no haya un efecto encima del bocadillo del Rey.
2. Solapes de texto en la QA visual: .e-ataque contra .corte-carta, los chips del veredicto entre sí, y .pano-regla contra la mano y el foco. Que falle mesa-garrote y que falle el «TAKES IT DOWN» en inglés.
3. La cuenta nunca pasa de dos renglones: las Evoluciones van por su nombre corto en el desglose y, si no entra, primero se achica el desglose y no la escena.
4. La ayuda se rehace cuando cambia la entrada, y la QA de 1280 pone el modo mando antes de mover el foco. Sumar una foto mesa-maldicion-foco con el chip enfocado y su ayuda.
5. Un solo foco celeste con ▼ en todo el juego, que se suelta al golpear.

Nada de esto toca la Constitución.
