```json
{
  "jurado": "jurado-ux-movil",
  "version": "0.22.0",
  "puntajes": { "claridad": 7.8, "diversion": 8.0, "estetica": 8.1, "veredicto": 7.9 },
  "defectos": [
    {
      "prioridad": "P1",
      "pantalla": "La Cábala Negra · bandeja «Coser dos iguales» (cabala-negra)",
      "ventana": "390x844",
      "archivo": "src/client/pantallas/camino.ts:961-981 (los naipes se agrupan por palo, una fila por palo) + src/client/estilos/pantallas.css:3559-3566 (en ≤700 la bandeja tiene max-height calc(100dvh - 250px) y un rollo propio)",
      "que": "En el teléfono, la bandeja muestra solo las Espadas del 1 al 9. Los otros tres palos quedan debajo, en un rollo dentro de la pantalla, y lo único que lo avisa es el 9 que se desvanece. Elegido el 1 de Espadas, los ocho naipes que se ven se apagan y COSER queda gris. Los otros tres 1, los únicos que sirven, no se ven. A 1280 aparecen en la misma columna, encendidos.",
      "por_que": "Es la mecánica estrella del Salto. Lo primero que ve el jugador del teléfono es una pantalla de naipes muertos, sin pista de dónde está la pareja. Encima, para encontrarla tiene que desplazar un rollo dentro de otro, que es justo el gesto que se pelea con el pulgar. Muchos van a tocar VOLVER pensando que no tienen pareja.",
      "propuesta": "En ≤700, transponer la rejilla: una fila por número, con los cuatro palos lado a lado. Así son 4 naipes de unos 80 px, que entran justos en 358 px, y los iguales quedan en la misma fila. Al elegir el primero, llevar su fila al centro con scrollIntoView y subir arriba de todo «Tus otros 1». Si no hay pareja, decirlo en la pista («No tenés otro 1»). Sumar a la QA el estado cabala-negra-elegido en 390 con el par a la vista."
    },
    {
      "prioridad": "P1",
      "pantalla": "mesa: del reposo al primer naipe apoyado (mesa-escudo-mando → mesa-escudo; mesa → mesa-seleccion)",
      "ventana": "390x844",
      "archivo": "src/client/mano.ts:269-271 (con paño, base = lp.manoY: la mano baja) + src/client/mano.ts:303-310 (con paño, de dos filas pasa a una) + src/client/mano.ts:268/279 (el paso se recalcula con cada naipe que se va) + src/client/mano.ts:375 (el paño solo existe con algo apoyado)",
      "que": "Con el primer toque se mueve la mano entera. En reposo, la mano de 8 va en dos filas desde y≈420. Al apoyar un naipe aparece el paño y la mano pasa a una sola fila, unos 65 px más abajo, cortada por GOLPEAR, con 68 px a la vista. El 4 de Bastos, por ejemplo, se va de abajo a la izquierda al centro de la fila. Con cada toque siguiente el paso crece de 46 a 56 y a 70 px, y todos los naipes a la derecha del que se fue se corren.",
      "por_que": "Armar un Par o un Escalón son 2 a 5 toques seguidos. Si cada toque mueve el blanco del siguiente, el pulgar rápido elige al vecino. En Balatro móvil, el naipe elegido sube en su lugar y los demás no se mueven. La franja de 46 px que se ganó en esta versión sirve de poco si la diana se corre.",
      "propuesta": "Con pointer coarse, que el paño esté siempre (vacío en reposo, con el Medio marcado) y que la mano tenga un solo sitio: una fila con el paso calculado para el tamaño de mano y no para lo que queda. El naipe que se va deja un hueco fantasma hasta GOLPEAR o hasta que lo devolvés. Si hace falta reacomodar, que sea 300 ms después del último toque y nunca con el dedo apoyado."
    },
    {
      "prioridad": "P2",
      "pantalla": "Comodín espectral en el paño (mesa-chispa; también a 1280)",
      "ventana": "390x844",
      "archivo": "src/client/estilos/mesa.css:1200 (.carta:has(.c-copia) .c-rotulo {display:none}) contra mesa.css:1451-1459 (la regla de la 0.22 mueve el rótulo pero no lo vuelve a mostrar; el naipe espectral lleva .c-copia, mesa.ts:578)",
      "que": "El changelog dice que el Comodín espectral conserva su rótulo, pero no se ve ni a 390 ni a 1280. El Comodín sigue siendo un 4 sepia y lavado, con un bufón fantasma encima, y a 390 queda medio tapado por el naipe de la Chispa. La ★ está en la costura.",
      "por_que": "El arreglo no llegó por una regla de CSS que pisa a la nueva: ese naipe tiene .c-copia, aunque esté escondido, así que :has(.c-copia) lo sigue apagando. En el teléfono, el naipe que causa la Chispa parece muerto.",
      "propuesta": "En mesa.css:1451, que diga display:block, o que la regla de la línea 1200 excluya :has(.c-espectro). Con la mano montada a 390, que el rótulo vaya a la izquierda, sobre la franja que asoma, y que la QA mida que .c-rotulo sea visible en mesa-chispa."
    }
  ],
  "aciertos": [
    "El paño en su fila propia, de fieltro y con las Postas cosidas, se lee de un golpe (mesa-escudo, mesa-escalon). La cuenta del teléfono nombra «Medio +4 · Chispa +4 · Escalón +2». Mi P1 de los iconos sin nombre está resuelto.",
    "Las dianas de la mano: franjaMin ≥ 46 en las 51 medidas de 390, y mano.ts:284 garantiza 44 px con el dedo. Mi P1 de las tiras de 26 px está resuelto.",
    "El Dado Cargado deja su sello «MULTI +3» en reposo (390-chiche-usa-06). Reordenar Postas con el dedo vuela sobre la Posta, con su contorno punteado (mesa-postas-arrastre).",
    "Lo nuevo entra en vertical sin recortes: el jackpot de la Evolución centrado (evolucion-jackpot), la Forja Brava con DOBLE FILO y su línea (forja-brava), y el Tesoro con candado y «Te faltan 20 de oro» (botin-tesoro).",
    "0 recortes y ninguna letra de menos de 14 px. El 390 va a 134 fps en reposo y en golpes, con el peor cuadro en 9 ms. TURBO no roba toques: la mesa bloquea la mano mientras dura el golpe (mesa.ts:1865)."
  ],
  "capturas_vistas": [
    "visual-qa/390x844: mesa, mesa-seleccion, mesa-arrastrando, mesa-postas-arrastre, mesa-chispa, mesa-escalon, mesa-escudo, mesa-escudo-mando, mesa-mando, mesa-mentiroso, mesa-chiches, mesa-chiche-usa, mesa-grito, mesa-rey, jugadas, evolucion-jackpot, hud-evolucion, oferta-evoluciona, forja-brava, fogon, cabala, cabala-negra, mapa-tesoro, botin-tesoro",
    "visual-qa/1280x800: mesa-chispa, cabala-negra (comparación)",
    "jurado/secuencias: 390-postas-golpe-00, -03, -07; 390-chiche-usa-02, -06; 390-golpe-03, -07; 390-rey-tajo-00, -04; 390-rey-irrumpe-06; 390-rey-cae-10; 390-botin-brota-10; 390-mapa-paso-04; 390-portada-05",
    "recortes ampliados ×2–×3: mano y paño de mesa-escudo, mesa-chispa y mesa-escalon; bandeja de cabala-negra; cuenta de 390-rey-tajo-04; fichas del HUD de hud-evolucion y mesa-chiches",
    "las 51 medidas.json de 390x844; jurado/fps.txt"
  ]
}
```

## Veredicto

La 0.22.0 ordena la mesa del teléfono. El paño tiene su fila, la mano va abajo con franjas de 46 px como mínimo, la cuenta nombra las Postas y el Chiche armado deja su sello. Lo nuevo del Salto (jackpot, Forja Brava, Tesoro con candado) entra en 390 sin recortes y se lee sin ampliar. Claridad, que en mi ficha pesa doble, pasa de 7,6 a 7,8. Dos cosas no dejan llegar a 8. La mano se mueve bajo el pulgar en cada toque. Y la Cábala Negra, la novedad con más decisión, en vertical esconde justo los naipes que sirven.

Alcance: no corrí nada. TURBO, la vibración y el reacomodo entre toques los leí en el código, no los vi. El corrimiento de la mano lo deduzco de comparar dos capturas quietas y de mano.ts. No hay una secuencia que lo muestre cuadro por cuadro.

## Contra mi veredicto de la previa

**Resueltos:** el P1 de las franjas de 26 px, el P1 de las Postas sin nombre en la cuenta y el P2 del Dado sin sello. También la mano de 3 que parecía jugada (la regla ya no va sobre los naipes) y la duda del arrastre entre Postas. **Siguen:** el Comodín espectral sin rótulo (el arreglo no llegó, mi P2), el grito que tapa GOLPEAR, JUGADAS con CERRAR arriba, las dos llamas de la Furia y las fichas que se van a «N MÁS» cuando hay Chiches.

## Defectos menores

- **El grito tapa GOLPEAR**: «¡AY, MI ESPALDA!» se come el botón apagado (`mesa-grito`). En `src/client/hud.ts:340`, `button:disabled` está en ZONAS_MEJOR_NO; tendría que ser una zona dura en la barra del pulgar.
- **JUGADAS**: CERRAR sigue arriba a la derecha y «Multi ×3 al cantar ¡ESCOBA!» ocupa cuatro renglones (`src/client/pantallas/camino.ts:210`).
- **El desglose en tres pisos**: con cinco fuentes de Daño, el «+4» del Dado cae entre DAÑO y MULTI, apretado contra «¡CRÍTICO!» (`390-rey-tajo-00`, `-04`). Está en `src/client/estilos/mesa.css:2601` y `:4050`: en ≤700, juntar los Chiches en un solo «Chiches +N».
- **La ficha evolucionada**: lleva el mismo marco prismático que el cofre y conserva el icono del Poncho aunque ahora sea Garrote. A 32 px no se distingue (`hud-evolucion`, `src/client/hud.ts:56`).
- **La regla a destiempo**: «Medio: pega doble · Escalón +2» sigue sobre la mesa vacía en el Botín (`390-botin-brota-10`, `390-rey-cae-10`), y el rótulo del primer Comodín de la mano queda en «COM» (`mesa-escudo`, `src/client/mano.ts:383` y `mesa.css:1185`).

## Qué haría en la próxima versión

El paquete «la mesa quieta bajo el pulgar». En el teléfono, el paño existe siempre: vacío en reposo, con el Medio marcado y la regla adentro. La mano tiene un solo sitio y un solo paso, y el naipe que se va deja su hueco fantasma hasta el golpe. Así, el segundo, el tercero y el cuarto toque caen donde el ojo los dejó. Se suma una secuencia `390-arma-escalon` de cinco toques, y la QA mide que ningún naipe de la mano se corra más de 8 px entre toques. La Cábala Negra del teléfono pasa a la rejilla por número, con los cuatro palos en fila, la pareja centrada al elegir y una pista cuando no hay. El rótulo del Comodín espectral vuelve, con una medida de QA que lo vigile. El grito deja de tapar GOLPEAR y JUGADAS se cierra abajo. La Constitución, intacta: de 3 a 5 Postas, tres huecos de Chiche y Multi entero.
