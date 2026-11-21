```json
{
  "jurado": "jurado-diseno",
  "version": "0.16.0",
  "puntajes": { "claridad": 7.3, "diversion": 6.8, "estetica": 7.9, "veredicto": 7.0 },
  "defectos": [
    {
      "prioridad": "P0",
      "pantalla": "mesa-segunda · secuencias rey-tajo y rey-segunda (El Caudillo contra Escoba)",
      "ventana": "todas",
      "archivo": "src/rules/balance-config.json:149 y :158 (mano 3) · src/rules/combate.ts:120-127 y :279 (repite = ultimaJugada === jugada) · src/rules/reyes.ts:37 (segundaDesc) · src/client/pantallas/mesa.ts:111 (tajoAhora)",
      "que": "El Tajo de revés pide «Cambiá de jugada cada golpe» a un Mazo que tiene 3 cartas. En mesa-segunda la mano es 3 de Oros, 7 de Espadas (inmune) y 9 de Oros: la única jugada que existe es Carta sola, la misma del golpe anterior, así que el ×2 es obligatorio (TE PEGA 42 que atraviesa el Escudo). La secuencia rey-tajo lo confirma: dos Cartas solas seguidas, −48 de 87 de Vida sin alternativa salvo descartar. Y la previa sigue escribiendo el resultado entero antes de soltar («= 318 · LE QUEDAN 22»).",
      "por_que": "Una segunda cara que obliga a cambiar de plan es una gran idea, pero con mano de 3 no hay plan que cambiar: es un impuesto de Vida que cae sobre Escoba y Truco y no sobre Chinchón (7) ni Mentiroso (8). Es mi P0 de la 0.15 (la mano de 3 no deja decidir) ahora agravado: la regla nueva lo pone en evidencia en el momento más dramático de la partida.",
      "propuesta": "Mano de 4 jugando hasta 3 en Escoba y Truco (14 golpes posibles en vez de 7). Mientras tanto, que el Tajo castigue repetir el palo dominante y no la jugada, o que Carta sola no cuente como repetición si la mano no permitía otra. En la previa, mostrar Daño × Multi de la jugada y las cartas, y dejar que las piezas se descubran en el conteo («318?»), salvo ¡EXACTO! / ¡AL PELO! / ×2 del Tajo, que sí se anticipan."
    },
    {
      "prioridad": "P1",
      "pantalla": "toda la partida (curva de tramos, meta-report)",
      "ventana": "todas",
      "archivo": "src/rules/balance-config.json:90-105 (actos: ataque 1 / 12 / 28) y :148-191 (Vida de los Mazos)",
      "que": "Las segundas caras casi no movieron el laboratorio: golpes por Rey 4,1→4,2 (Escoba), 4,2→4,4 (Truco), 5,7→5,9 (Chinchón); exactos idénticos (0,4 a 2,0). La Vida de los Mazos volvió a subir (Escoba 77→80, Chinchón 60→63, Chancho 87→90), al revés de lo pedido. Resultado: el 87 % de las muertes de Truco sigue en el tramo 3 (1.866 de 2.153) y en el tramo 1 mueren 16 de 3.000 Truco y 18 de 3.000 Chancho, contra 277 de Escoba: 17 veces más riesgo temprano según el Mazo.",
      "por_que": "El primer tercio sigue sin miedo para dos de los cinco Mazos y la partida se decide toda en el último, cuando la build ya no se corrige. Sin miedo temprano, una Copa o un Basto no valen nada en el tramo 1 y todas las builds arrancan igual: maximizar Daño.",
      "propuesta": "Bajar Truco (96) y Chancho (90) a ~80, subir el ataque del tramo 1 hasta que muera entre el 3 y el 6 % de cada Mazo, y llevar el tramo 3 de ×28 a ~×24. Agregar al meta-report el objetivo de caídas por tramo y el desglose de caídas por Rey (para ver si el Caudillo castiga a los Mazos de 3)."
    },
    {
      "prioridad": "P1",
      "pantalla": "pulperia · piezas · elegi-amuleto",
      "ventana": "todas",
      "archivo": "src/rules/amuletos.ts:37, :40, :43 y :46 (porCarta) · src/rules/partida.ts:70 (tienda: comun 45)",
      "que": "Cuatro de los 15 Amuletos son el mismo Amuleto con otro palo («+3 de Daño por carta de X, +1 por carga de su Rey, tope +6»). La Pulpería de la captura ofrece tres a la vez, mismo texto, mismo precio (10); en piezas.png la build lleva tres de los cinco huecos ocupados por ellos. Con peso 45 % en la tienda, es lo que más se ve.",
      "por_que": "La Constitución fija 15 Amuletos: cada uno tiene que abrir una build. Gastar 4 en un clon aditivo (que en el tramo 3, con golpes de 1.000 a 1.500, suma ruido) achica el espacio real de builds a 11 y hace que la tienda sea una no-decisión: elegís el de tu palo y listo.",
      "propuesta": "Dejar un solo efecto «por carta» y darle a cada Común una mecánica de su palo: Espadas = la sobra de Perfora suma Multi +1; Bastos = el Escudo que no usaste pasa al próximo combate; Oros = cada 3 de oro cobrado en el golpe, +1 de Multi; Copas = curar por encima del máximo da Escudo. Y que la Pulpería nunca ofrezca dos Comunes juntos."
    }
  ],
  "aciertos": [
    "Las segundas caras ahora tienen cifras que cambian el plan: Fortín con Escudo del 25 % de la Vida y regeneración ×2 (las Espadas lo atraviesan: premia tener Espadas a mano), Remate que se lleva el 25 % de la bolsa, Última ronda ×2 que castiga justo al mono-Copas.",
    "El Tajo de revés se ve antes de soltar: TE PEGA con su ×2 y el chip rojo en la cuenta (mesa-segunda). Es la clase de aviso que separa castigo justo de castigo tramposo.",
    "La segunda cara es un acto: volteo, cartel «SEGUNDA CARA · TAJO DE REVÉS» y la regla dicha por el Bufón (rey-segunda-08 y -11). Por fin la vi.",
    "El conteo ya vive dentro del desglose: cada término se enciende en su lugar y las cartas cantan su +N (golpe-02, golpe-06). Resuelve el defecto unánime de la 0.15.",
    "Vocabulario unificado: «TE PEGA» en reglas, Reyes y Cara de Póker. Escoba ya dice ×3 en todos lados."
  ],
  "capturas_vistas": [
    "visual-qa/1280x800/mesa-segunda.png",
    "visual-qa/1280x800/mesa-seleccion.png",
    "visual-qa/1280x800/mesa-rey.png",
    "visual-qa/1280x800/jugadas.png",
    "visual-qa/1280x800/cabala.png",
    "visual-qa/1280x800/pulperia.png",
    "visual-qa/1280x800/elegi-una.png",
    "visual-qa/1280x800/elegi-bendicion.png",
    "visual-qa/1280x800/piezas.png",
    "visual-qa/1280x800/mapa.png",
    "visual-qa/1280x800/fogon.png",
    "visual-qa/1280x800/fin-victoria.png",
    "jurado/secuencias/1280-golpe-02.png",
    "jurado/secuencias/1280-golpe-05.png",
    "jurado/secuencias/1280-golpe-06.png",
    "jurado/secuencias/1280-golpe-08.png",
    "jurado/secuencias/1280-rey-segunda-05.png",
    "jurado/secuencias/1280-rey-segunda-08.png",
    "jurado/secuencias/1280-rey-segunda-11.png",
    "jurado/secuencias/1280-rey-tajo-04.png",
    "jurado/secuencias/1280-rey-tajo-09.png",
    "jurado/secuencias/390-rey-tajo-08.png",
    "jurado/secuencias/1280-rey-cae-10.png",
    "jurado/secuencias/1280-botin-brota-04.png",
    "jurado/secuencias/1280-botin-brota-10.png",
    "jurado/secuencias/1280-botin-brota-12.png"
  ]
}
```

## Veredicto

**Respecto de la 0.15.0:** mi P1 de las segundas caras quedó resuelto en la regla y en la pantalla (cifras proporcionales, estado `mesa-segunda`, cartel visible). El P0 de la mano de 3 sigue intacto y ahora choca de frente con el Tajo de revés. El P1 de la curva sigue y empeora un poco (más Vida en tres Mazos). De los menores: Escoba ×2/×3, resuelto; «al pelo» ya se cuenta en `p.stats` pero el fin de partida no lo muestra; Comunes clones en la Pulpería, sigue (sube a P1); «Flor +6 / Flor 2» duplicado, sigue.

La 0.16 hace bien lo que pedí sobre los Reyes: ahora la mitad de la Vida de un Rey es un evento y no una barra. Subo poco porque el bucle central no cambió: el golpe se sigue leyendo en la previa y la mano de 3 casi nunca deja elegir.

Simulé tres builds con las piezas reales:

- **Banca (Escoba + Cofre + Moneda falsa):** igual que antes, y ahora el Remate del Caudal le saca el 25 % de la bolsa por golpe recibido. Es una tensión real: el Cofre pide oro y el Rey te lo come. Buena.
- **Muro de Bastos (Chinchón + Boleadoras + Poncho):** contra el Fortín, sin Espadas no pasás un Escudo de casi 1.000 que se rearma ×2. Obliga a tener Espadas a mano: es el primer Rey que pide una build secundaria. Muy bien.
- **Mono-Copas con Mate curado:** la Última ronda ×2 le cura al Bacanal el doble de lo que vos te curás. Te obliga a guardar Copas y golpear con otra cosa, y con mano de 3 no tenés otra cosa. El mismo problema del Tajo.

Las tres se sienten distintas **en los Reyes**. En los 30 combates de La Corte, todas se juegan igual: la jugada más gorda que tengas.

**Bufón.** La moneda sigue con esperanza +10 (20 contra 30 al 60 %): aceptar es un trámite. En elegi-una dice «Las tres tienen trampa» sobre tres Aumentos sin trampa.

**Sonido.** Bus de audio, sonidos propios del Tajo y la segunda cara: leído en código, no oído.

## Defectos menores

- El fin de partida no muestra «al pelo» aunque ya se cuenta: `src/client/pantallas/camino.ts:846`.
- Cara o cruz con esperanza +10 en todos los tramos: `src/rules/balance-config.json:262-265` (paga 15 → ~12).
- El cartel SEGUNDA CARA tapa el TE PEGA justo cuando su ×2 se arma (rey-segunda-08): `src/client/estilos/mesa.css:2415` (bajarlo a la franja de la mesa).
- El naipe arrastrado tapa los chips TAJO y LE QUEDAN de la cuenta (rey-tajo-04): `src/client/estilos/mesa.css` (subir la cuenta por encima del arrastre o correrla).
- El Bufón promete trampa en tres Aumentos que no la tienen (elegi-una): `src/client/voces.ts:46`.

## Qué haría en la próxima versión

«El golpe se piensa», ahora sí. Mano de 4 jugando hasta 3 en Escoba y Truco, con el laboratorio recertificado, para que el Tajo y la Última ronda pidan cambiar de jugada y se pueda. Previa con jugada y cartas, y las piezas que se descubren en el conteo: el número final se gana mirando, como en Balatro. Rehacer los cuatro Comunes con una mecánica de su palo cada uno, sin tocar los 15 Amuletos. Curva con miedo temprano: tramo 1 entre el 3 y el 6 % de muertes en todos los Mazos, Truco y Chancho a ~80 de Vida, tramo 3 a ×24. Moneda y soplo con esperanza cercana a cero. Y al meta-report, caídas por Rey para medir si las segundas caras castigan parejo.
