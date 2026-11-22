```json
{
  "jurado": "jurado-arte",
  "version": "0.27.0",
  "puntajes": { "claridad": 8.4, "diversion": 8.3, "estetica": 8.4, "veredicto": 8.4 },
  "defectos": [
    {
      "prioridad": "P1",
      "pantalla": "La mesa de escritorio con algo apoyado y justo después del golpe (mesa-chinchon, mesa-seleccion, mesa-garrote, mesa-postas-arrastre; secuencias golpe y contragolpe)",
      "ventana": "1280x800 sobre todo; también 1920x1080",
      "archivo": "src/client/mano.ts:235 (kp = floor(k/2): el paño a media escala), :299 (base = max(alto − h, manoY): la mano cae bajo el HUD con el paño y sube sobre el desglose sin él) y :305-325 (la fila aprieta los naipes vivos y les da el mismo paso a las siluetas); src/client/estilos/mesa.css:5133 (.c-corta)",
      "que": "Mejoró, pero no cerró. A 1280 (mesa-chinchon) el 5 y los dos 7 siguen montados uno sobre otro, cada uno reducido a una tira, mientras tres siluetas se llevan el lugar. El renglón CORTÁS va encima del borde del desglose y roza «DAÑO 4+4+4». La mano se corta al 76 % contra el HUD. En contragolpe-09, apenas pega el golpe, la mano sube y el 9 de Copas tapa «SOL DE LA TIM…» y «Cascabel sin c…» del desglose que sigue en pantalla, y el globo del Bufón tapa «EL REÑIDERO · GUARDIA». A 1920 el paño es una caja verde de 530 px corrida a la derecha, con naipes a la mitad de la mano; durante el arrastre toda la mitad izquierda queda vacía.",
      "por_que": "Es la pantalla del 90 % del juego y es la de la Deck. Lo jugado sigue siendo lo más chico de la mesa, lo que queda en mano se lee a tiras, y el desglose, que es lo que explica el número, queda tapado por un naipe en el cuadro donde más se lo mira.",
      "propuesta": "Tres reglas. Una: la silueta en escritorio ocupa un cuarto de naipe (solo el canto con su índice) y el resto del ancho es para los naipes vivos, que así no se montan. Dos: mientras el desglose esté en pantalla, la mano no sube de su línea (mismo tope manoY hasta que la cuenta se va). Tres: el paño a 1920 a 0,75 de la mano y centrado sobre ella, con CORTÁS adentro de la caja del desglose como primer renglón, sin caja propia encima del borde."
    },
    {
      "prioridad": "P2",
      "pantalla": "La mesa del teléfono con algo apoyado: el enemigo aplastado y las ventanas bajas (mesa-chinchon, mesa-seleccion, mesa-garrote)",
      "ventana": "390x844, 390x664 y 360x740",
      "archivo": "src/client/estilos/mesa.css:904 y :2072 (el naipe del enemigo asoma lo que haya detrás de la barra); src/client/mano.ts:238 (kp a pasos de 0,05) y :336-340 (dos filas)",
      "que": "El paño ya va entero y las siluetas se leen como lugar a propósito: resuelto. El precio lo paga el enemigo: en mesa-chinchon a 390x844 la Sota queda en 95 px, un sombrero y un «10», con la placa TE PEGA encima de la cara; a 390x664 ya es así en toda selección. A 390x664 el rótulo COMODÍN se sale del naipe por la izquierda, la mano queda cortada por GOLPEAR y el paño va a escala no entera (píxeles del naipe desparejos). En dos filas, el 2 de Espadas queda 60 % tapado y su sello «+6» se lee «+6» partido.",
      "por_que": "El antagonista es la mitad del cuadro en Inscryption; acá desaparece justo cuando decidís cómo pegarle. No rompe ni frena: se entiende todo, pero la escena pierde a su personaje.",
      "propuesta": "Cuando la cuenta se pliega, el enemigo pasa a un retrato de busto a escala entera (cabeza y pecho encuadrados, no el naipe recortado por arriba), con la placa TE PEGA a su derecha y nunca encima. Rótulo COMODÍN con ancho máximo del naipe. El paño, solo a 0,5 / 0,75 / 1."
    },
    {
      "prioridad": "P2",
      "pantalla": "Pantallas con media escena vacía o panel que flota: Colección de Amuletos, Botín en el teléfono, resultado de la Forja Brava, fin-derrota en el teléfono",
      "ventana": "1920x1080 y 390x844",
      "archivo": "src/client/estilos/pantallas.css:712 (.coleccion), :975 (.botin .cuerpo en el teléfono) y :4661 (.forja-llama); src/client/pantallas/camino.ts:907 (resultado de la Forja)",
      "que": "La Colección de Amuletos a 1920 termina en y=600: el 45 % de abajo es pared lisa, y los iconos miden 60 px en celdas negras de 230. El Botín a 390 deja 330 px de tablas vacías arriba y todo apretado abajo. El resultado de la Forja Brava a 1920 sigue siendo una columna de 340 px con «NAIPE ENTERO ×2» en letra de cuerpo. En fin-derrota a 390, «HAY MÁS ↓» cae encima del renglón de QUÉ TE FRENÓ y lo deja ilegible.",
      "por_que": "Son las pantallas de premio y de memoria: tienen que ser las más ricas y son las más pobres. Al lado de Elegí tu Mazo parecen de otro juego.",
      "propuesta": "Colección: celdas con el icono a 2× sobre un estante dibujado, que llene el alto. Botín a 390: el Bufón y el cartel arriba, grandes, y las filas debajo. Forja: el naipe forjado a 2× al centro con el ×2 como sello fijo. fin-derrota: «HAY MÁS ↓» pegado al borde del panel, con degradado tramado debajo."
    }
  ],
  "aciertos": [
    "La mesa del teléfono, por fin: mano quieta, paño con naipes enteros y cada hueco con su silueta tramada. mesa-seleccion a 390x844 es la mejor composición que tuvo esta pantalla.",
    "¡CHINCHÓN! que corta la mano se ve: sellos de Escudo cian sobre cada carta sin jugar y el renglón CORTÁS con su cuenta. La causa del TE PEGA va debajo de la cifra («31 − 28 ESCUDO») y ya no choca con La Corte.",
    "La llama de la Forja Brava ahora es tramada, con lenguas en sierra que envuelven el naipe (1280-fogon-suspenso-brava-llama), y el ×2 a 2× en la Deck. fin-derrota a 1920 con el retrato rasgado y los tres Reyes es una pantalla con escena."
  ],
  "capturas_vistas": [
    "visual-qa/390x844/mesa-chinchon.png", "visual-qa/390x844/mesa-seleccion.png", "visual-qa/390x844/mesa-garrote.png", "visual-qa/390x844/elegi-amuleto.png", "visual-qa/390x844/fin-derrota.png", "visual-qa/390x844/botin.png",
    "visual-qa/390x664/mesa-chinchon.png", "visual-qa/390x664/mesa-seleccion.png", "visual-qa/360x740/mesa-seleccion.png",
    "visual-qa-en/390x844/mesa-chinchon.png",
    "visual-qa/1280x800/mesa-chinchon.png", "visual-qa/1280x800/mesa-seleccion.png",
    "visual-qa/1920x1080/mesa.png", "visual-qa/1920x1080/mesa-chinchon.png", "visual-qa/1920x1080/mesa-garrote.png", "visual-qa/1920x1080/mesa-rey.png", "visual-qa/1920x1080/mesa-postas-arrastre.png",
    "visual-qa/1920x1080/portada.png", "visual-qa/1920x1080/mapa.png", "visual-qa/1920x1080/pulperia.png", "visual-qa/1920x1080/botin.png", "visual-qa/1920x1080/forja-brava.png", "visual-qa/1920x1080/fin-derrota.png", "visual-qa/1920x1080/cabala-negra.png", "visual-qa/1920x1080/coleccion-amuletos.png", "visual-qa/1920x1080/elegir-mazo.png",
    "mirar/1280-fogon-suspenso-brava-llama.png", "mirar/390-forja-brava-quema-llama.png", "mirar/1280-forja-brava-x2.png",
    "jurado/secuencias/390-golpe-05.png", "jurado/secuencias/390-contragolpe-08.png", "jurado/secuencias/390-contragolpe-09.png", "jurado/secuencias/390-contragolpe-10.png",
    "jurado/secuencias/1280-golpe-04.png", "jurado/secuencias/1280-contragolpe-09.png", "jurado/secuencias/1280-maldicion-11.png"
  ]
}
```

## Veredicto

La 0.27 hizo la mitad del paquete que pedí, y la hizo bien. El teléfono quedó como tenía que quedar: lo jugado entero, la mano quieta, el hueco dibujado. Los números del jugador nacen en su caja y la causa del TE PEGA va debajo de la cifra. Claridad sube a 8,4 y estética a 8,4. No llega a 8,5 porque el escritorio quedó a medio camino, y a 1280 la mesa sigue apretada: naipes vivos montados al lado de tres siluetas holgadas, y una mano que tapa el desglose apenas pega el golpe. Diversión 8,3: el corte del ¡CHINCHÓN! se ve en la mesa. El temblor, el aliento del Bufón y el sonido los leí en el changelog, no los vi. No abrí todas las pantallas a 1920 (faltaron Altar, Crónica, Ajustes, Fogón de mutaciones, fin-victoria y varios estados de mesa): de esas no opino.

**Respecto de la 0.26:**
- **P1 del teléfono (paño amputado): resuelto.** Queda como P2 el enemigo aplastado y las ventanas bajas.
- **P1 del escritorio: sigue, atenuado.** La mano pasó del 55 % al 76 %, los huecos son siluetas y el paño va junto al desglose. Siguen el paño a media escala, la mano cortada y los naipes montados a 1280.
- **P1 de rótulos que se pisan: resuelto en lo grueso**, baja a menores. ¡CHINCHÓN! ya no se mete bajo La Corte y los −N no caen sobre DESCARTAR ni GOLPEAR.
- **Menores:** resuelta la llama lisa. Siguen el resultado de la Forja en columna angosta y la Colección a medias. No revisé el chip doble de ¡CHINCHÓN! en el teléfono ni el cartel FORTÍN.

## Defectos menores

- **Cobros sobre el marco del HUD:** «−19» y «−4 ESCUDO» nacen a caballo del borde de arriba de la caja, no adentro. A 390, en contragolpe-09 el «−19» queda medio tapado por el chip de Escudo durante un cuadro. `src/client/pantallas/mesa.ts` (nacerEnDueno).
- **FURIA pisa la causa:** en mesa-rey a 1920, «21 − 3 ESCUDO» queda cortado por el borde del chip FURIA 3. `src/client/estilos/mesa.css:2483-2510` y `:3447`.
- **Desglose del teléfono durante el conteo:** las cajas encendidas de los términos se tocan entre sí y con el renglón de abajo (390-golpe-05). `src/client/estilos/mesa.css:2392-2445`.
- **Base de la llama:** termina en una losa clara recta de 15 px contra el HUD, con los costados cortados a plomo, y la fogata no crece (1280-forja-brava-x2). `src/client/estilos/pantallas.css:4661-4681`.
- **Mapa y Botín a 1920:** el tercio derecho sigue vacío y los nudos no visitados casi no se despegan del fondo. `src/client/estilos/pantallas.css:317-360`.

## Qué haría en la próxima versión

**Cerrar el escritorio con la misma regla que cerró el teléfono: nada vivo se monta y nada tapa la cuenta.**
- Siluetas angostas en escritorio, para que los naipes en mano vayan enteros a lo ancho.
- La mano con un tope fijo mientras el desglose está en pantalla.
- El paño a 0,75 de la mano, centrado sobre ella, con CORTÁS como primer renglón del desglose.
- En el teléfono, el enemigo como busto encuadrado cuando la cuenta se pliega.

Después, una pasada de escena por las pantallas pobres: Colección con estante dibujado, Botín del teléfono con el Bufón arriba, y resultado de la Forja con el naipe a 2×. Con el escritorio cerrado y esas tres, estética pasa de 8,8. Para el 9,1 hace falta además que el mapa y el botín a 1920 llenen su tercio derecho con escena, no con pared.
