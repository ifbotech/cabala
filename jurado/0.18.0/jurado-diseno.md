```json
{
  "jurado": "jurado-diseno",
  "version": "0.18.0",
  "puntajes": { "claridad": 7.5, "diversion": 7.0, "estetica": 8.0, "veredicto": 7.1 },
  "defectos": [
    {
      "prioridad": "P0",
      "pantalla": "cabala (Pacto de sangre, A ciegas) · elegi-una / Aumentos (Vender el alma, Contraflor) · elegir-mazo con Reinado 6+",
      "ventana": "todas",
      "archivo": "src/rules/balance-config.json:181 (mentiroso.vida 9) · src/rules/bufon.ts:170 y :344 · src/rules/partida.ts:99, :305, :310",
      "que": "El Mentiroso bajó a Vida 9 (Chinchón a 26) y todos los costos de Vida máxima tienen piso `Math.max(10, …)`. Para el Mentiroso, firmar el Pacto de sangre («−6 de Vida máxima») lo lleva de 9 a 10: Bendición gratis y +1 de Vida. Lo mismo Vender el alma (+1 mano gratis), Contraflor (+2 Multi gratis) y la letra chica de A ciegas. Y Heridas viejas (Reinado 6+) resta 8 sin piso: el Mentiroso arranca con 1 de Vida (2 con el Altar lleno). El laboratorio lo delata: su Reinado 8 cae de 20,1 a 8,9.",
      "por_que": "Los pactos son el corazón del Bufón: el único lugar donde el juego te cobra en serio. Con el Mentiroso el costo se vuelve premio y la build dominante es firmar todo sin leer; el texto dice −6 y el HUD muestra +1. Y una escalera de Reinados que te deja con 1 de Vida no es dificultad, es un error de unidades.",
      "propuesta": "El piso nunca puede subir: `p.vidaMax = Math.min(p.vidaMax, Math.max(10, …))` o, mejor, costos proporcionales (−10 % de Vida máxima, mínimo 1 real). Heridas viejas como porcentaje (−12 %). Y el Mentiroso con Vida ≥ 30 y Cara de Piedra como identidad, no como su única Vida: hoy Mate, Bota, Cáliz, CURAR y el Fogón están muertos para él."
    },
    {
      "prioridad": "P1",
      "pantalla": "mesa · mesa-seleccion · mesa-segunda-cambia · secuencia golpe (00 → 08)",
      "ventana": "todas",
      "archivo": "src/rules/balance-config.json:149 y :158 (mano 3 de Escoba y Truco) · src/client/pantallas/mesa.ts:241-267 (veredicto de la previa)",
      "que": "La previa ya no escribe el total: dice «LO ABATÍS» y el conteo descubre 372 y SOBRAN 32. Bien. Pero lo que se oculta es lo único que no importa (el sobrante), y la decisión sigue siendo de una sola jugada: en golpe-00 la mano es 1 y 4 de Copas y 4 de Oros (Flor y listo); en mesa-segunda-cambia, 2 de Oros, 2 de Copas y 7 de Bastos (Par o nada). El desglose con todas las piezas y sus valores sigue a la vista, así que se puede sumar a ojo.",
      "por_que": "Cuarta versión con el mismo agujero en el centro del bucle: ~60 golpes por partida en dos de los cinco Mazos (los dos de arranque) donde no hay elección real. El suspenso sobre una cifra irrelevante no reemplaza a la duda sobre qué jugar.",
      "propuesta": "Mano de 4 jugando hasta 3 en Escoba y Truco, recertificada. En la previa, piezas apagadas y sin valor (solo el icono de las que se van a encender); el veredicto se mantiene porque es lo que hace falta para decidir."
    },
    {
      "prioridad": "P1",
      "pantalla": "toda la partida (curva de caídas, meta-report)",
      "ventana": "todas",
      "archivo": "src/rules/balance-config.json:147-191 (Vidas) y :219 (botin.vidaRey 12) · scripts/objetivos.ts:1-15",
      "que": "El tramo 1 ahora asusta, pero al tuntún: caen en el tramo 1 el 21,9 % de Escoba, el 27,8 % de Chinchón y el 33,5 % del Mentiroso, contra el 3,3 % de Truco y el 3,1 % de Chancho. Los dos Mazos de arranque se separan 7 veces. El +12 de Vida máxima por Rey es plano: +133 % para el Mentiroso, +19 % para Chancho.",
      "por_que": "Pedí riesgo temprano entre el 3 y el 6 % en los cinco; llegó un tercio de muertes antes del primer Rey en uno y nada en otros dos. Un Mazo que muere un tercio de las veces en el tramo 1 enseña a no elegirlo; uno que muere el 3 % sigue con diez minutos de trámite.",
      "propuesta": "vidaRey proporcional (+20 % de la Vida máxima) y Vidas iniciales reafinadas hasta que todos caigan entre el 4 y el 8 % en el tramo 1. Sumar «caídas por tramo» a objetivos.ts con su banda, para que la puerta lo vigile."
    }
  ],
  "aciertos": [
    "El golpe por fin se descubre: la previa dice LO ABATÍS / NO LO ABATÍS y el conteo revela el total y SOBRAN (golpe-00 → 08). Es la mitad correcta de lo que pedía.",
    "«Se arranca frágil y se llega entero»: la Vida máxima que crece con cada Rey le da un arco a la partida (63 → 75 tras el Caudillo en rey-cae).",
    "La moneda quedó pareja (20 contra +20 al 60 %): ahora es una apuesta chica de verdad y el humor del Bufón pesa más que el oro.",
    "Cara de Piedra le da al Mentiroso una identidad defensiva que ningún otro Mazo tiene.",
    "El Tajo de revés con una sola fórmula, «TE PEGA 48 (24 ×2)», y la placa que lo sostiene: castigo legible y evitable."
  ],
  "capturas_vistas": [
    "jurado/secuencias/1280-golpe-00.png",
    "jurado/secuencias/1280-golpe-03.png",
    "jurado/secuencias/1280-golpe-06.png",
    "jurado/secuencias/1280-golpe-08.png",
    "jurado/secuencias/390-golpe-05.png",
    "jurado/secuencias/1280-rey-cae-04.png",
    "jurado/secuencias/1280-rey-cae-08.png",
    "jurado/secuencias/1280-rey-cae-09.png",
    "jurado/secuencias/1280-rey-cae-10.png",
    "jurado/secuencias/1280-rey-cae-12.png",
    "jurado/secuencias/1280-rey-cae-14.png",
    "visual-qa/1280x800/mesa-seleccion.png",
    "visual-qa/1280x800/mesa-segunda-cambia.png",
    "visual-qa/1280x800/mesa-grito.png",
    "visual-qa/1280x800/botin.png",
    "visual-qa/1280x800/cabala.png",
    "visual-qa/1280x800/elegi-una.png",
    "visual-qa/1280x800/elegir-mazo.png",
    "visual-qa/1280x800/pulperia.png"
  ]
}
```

## Veredicto

**Respecto de la 0.17.0:** el P0 de la previa quedó resuelto a medias (el total se descubre; la mano de 3 sigue). El P1 de la curva se movió, pero se pasó en tres Mazos y no llegó en dos. Del P1 del Bufón, la moneda quedó resuelta; las Platas siguen sin contra y en vez de la trampa cambió la frase («Alguna tiene trampa»). De los menores siguen la Moneda falsa con 3 Oros y el rótulo del Caudillo sin «salvo Carta sola» (mesa-segunda-cambia).

La 0.18 tiene la mejor idea de arco desde la 0.13 (Vida máxima que crece por Rey), pero la bajada de Vidas se hizo sin mirar los pisos. Simulé tres builds con las piezas reales:

- **Mentiroso de los pactos (Contraflor + Vender el alma + Pacto de sangre + Cara de Piedra):** con Vida 9 los tres costos son gratis o suman. +2 Multi, mano de 9 y una Bendición a cambio de nada. Es el combo roto del juego, pero accidental e invisible: no lo armaste, lo descubrió un piso.
- **Muro de Bastos en Chinchón (Rebenque + Poncho + Boleadoras):** con Vida 26 el Escudo es casi toda tu defensa y la build se siente más necesaria que antes. Bien, aunque las Copas quedan peor que nunca: cualquier cura choca contra el tope de 26.
- **Remate de Espadas en Truco (Cuchillo + Lanza + Facón):** sigue siendo el mejor plan de dos golpes, pero con mano de 3 las más de las veces la mano te lo arma o no te lo arma, no lo elegís.

**Sonido del remate y sacudida del conteo:** leído en código, no oído.

## Defectos menores

- El total del conteo crece encima de «MULTI 12» y de CURA (golpe-06): `src/client/pantallas/mesa.ts:285` (`.c-total`, escala en `mesa.css`).
- El Mentiroso pasó a un Mazo del 1 al 7 y sus reglas no lo dicen: `src/rules/mazos.ts:84-90`.
- La Moneda falsa sigue pidiendo 3 Oros (con mano de 3, solo una Flor de Oros): `src/rules/balance-config.json:297`.
- En la secuencia rey-cae no se ve la pieza «+12 DE VIDA MÁXIMA»: el HUD salta de 63 a 75 entre los cuadros 09 y 10 con solo «+20 DE ORO» a la vista: `src/client/pantallas/camino.ts:497`.
- El rótulo del Tajo dice «Si repetís jugada, TE PEGA ×2» sin «salvo Carta sola»: `src/client/textos.ts` (clave del aviso del Tajo).

## Qué haría en la próxima versión

«Vidas con unidades»: todo costo y castigo de Vida máxima en porcentaje y sin piso que pueda subir. Heridas viejas al −12 %, el Mentiroso de vuelta a Vida ≥ 30 con Cara de Piedra como sabor y vidaRey proporcional. Curva del tramo 1 entre el 4 y el 8 % en los cinco Mazos, vigilada por la puerta. Y por fin la mano de 4 jugando hasta 3 en Escoba y Truco, con la previa mostrando la jugada y el veredicto pero las piezas apagadas hasta el conteo. Además, una contra chica y legible en cada Plata de la Cábala, para que el Bufón cobre lo que promete.
