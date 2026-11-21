```json
{
  "jurado": "jurado-diseno",
  "version": "0.20.0",
  "puntajes": { "claridad": 7.5, "diversion": 7.3, "estetica": 8.1, "veredicto": 7.4 },
  "defectos": [
    {
      "prioridad": "P1",
      "pantalla": "pelea de Rey · secuencia rey-segunda (01 → 12) y rey-cae-03",
      "ventana": "todas",
      "archivo": "src/rules/combate.ts:651 (evs.push({ t: 'dano', n: q.total, … })) · src/client/pantallas/mesa.ts:564 y :596 (peso y número salen de ev.total / ev.n) · src/rules/combate.ts:271-275 (frenaEnMitad)",
      "que": "El Rey que se planta en la mitad funciona en el motor, pero la mesa miente. En rey-segunda el Caudillo está en 171/340, el golpe estalla con un «280» gigante, sacudida de golpazo y relámpagos, y la barra baja a 170/340: hizo 1 de daño. Durante la resolución no aparece ningún «SE PLANTA EN LA MITAD» ni lo que se perdió (279). El evento 'dano' lleva q.total en vez de q.aVida, así que el número y el peso de la sacudida salen del total bruto. Además, todo lo que premia el golpe grande (Cetro ×3 en el primer golpe, sobrante de la Lanza, Degüello) queda anulado contra la primera cara.",
      "por_que": "Pedí esta regla y está bien que exista: golpesRey subió a 4,4–5,7 y cada Rey muestra sus dos caras. Pero hoy enseña a sandbaguear. Lo óptimo es cruzar la mitad con la jugada más barata y guardar lo bueno. El golpazo, que es el grito del género, se festeja con fuegos artificiales y no hace nada. Un jugador que ve «280» y la barra quieta siente que el juego le robó.",
      "propuesta": "1) combate.ts:651: el número es lo que entra (q.aVida) y un evento 'planta' con el sobrante, para que la mesa estampe «SE PLANTA · −279 SE PIERDEN» y frene el número, con la sacudida medida sobre aVida. 2) Que el sobrante no se pierda del todo y se vuelva decisión: si el sobrante supera el 25 % de la Vida máxima, la segunda cara entra Aturdida un turno. Así hay tensión entre tantear la mitad y pasarse a lo bruto, y el golpe grande vuelve a pagar."
    },
    {
      "prioridad": "P1",
      "pantalla": "toda la partida (curva de caídas, meta-report) · elegir-mazo",
      "ventana": "todas",
      "archivo": "scripts/objetivos.ts:9 (caidaTramo1 [2, 30]) · src/rules/balance-config.json:111 (jefe.vida 1.4) y furiaTurno de los Reyes · src/rules/balance-config.json:147-198 (Vidas por Mazo)",
      "que": "En el tramo 1 cae el 23,3 % de las partidas con Escoba (17,7 en la 0.19, aunque su Vida pasó de 44 a 76) y el 29,9 % con el Mentiroso (22,7), contra el 3,6 % con Truco. La puerta pasó de 25 a 30 en esta versión, y el Mentiroso queda una décima por debajo. Escoba muere parejo en los tres tramos (698/677/735); Truco casi solo en el 3 (107/357/1554). Golpe medio en el tramo 1: Escoba 138 contra Truco 245. Las Vidas de arranque van de 15 a 76 (5×).",
      "por_que": "Los dos Mazos de arranque siguen separados por 6,5×: uno de cada cuatro jugadores nuevos con la Barrendera muere antes del primer Rey, y con el Paisano, uno de cada 28. Subir la Vida no alcanzó, porque el problema es el daño temprano con un Rey que ahora dura más turnos con Furia +3 por turno. Correr la puerta para que pase es dejar de medir.",
      "propuesta": "Volver la puerta a [4, 12] con dispersión máx/mín ≤ 2,5. Atacar la causa: el Rey del tramo 1 sube Furia +2 por turno (no +3) mientras dure su primera cara, y la Escoba recibe su carga de Daño también al cantar el primer Quince del combate (cargaDano 2 → 3). Bajar la Vida de Escoba a 60 con el ahorro."
    },
    {
      "prioridad": "P1",
      "pantalla": "elegí un amuleto tras el Rey (rey-cae-17) · pulperia · piezas",
      "ventana": "todas",
      "archivo": "src/rules/amuletos.ts:40-50 (facón, poncho, moneda, taba, cofre, cáliz) · src/rules/balance-config.json:273-290",
      "que": "La oferta del Rey en rey-cae-17 trae Poncho («6 de Escudo: +2 de Multi»), Taba («4 o más: +1 de Multi») y Cofre («+1 de Multi por cada 30 de oro, tope +2»): tres variantes de la misma pieza. Siete de los 15 Amuletos son «+1/+2 de Multi si…», y los tres Épicos de palo (Poncho, Cofre, Cáliz) tienen la misma forma. Del otro lado, el Daño es casi todo plano: en mesa-segunda un As da 23 de Daño, del que la carta pone 1 (Filo +6, Cantos hechos +8, Primera sangre +8); en golpe-00, la Taba cargada pone 20 de 43.",
      "por_que": "Mi pregunta central es si las piezas arman builds distintas. Hoy la diferencia la ponen los Mazos; las piezas son un mismo +2 con distinta condición. Elegir entre tres premios iguales no es una decisión, y por eso no hay momento de «esto rompe mi partida» como el de Balatro o StS.",
      "propuesta": "Rehacer los tres Épicos de palo como cambiadores de regla (siguen siendo 15): Poncho, «el Escudo que te sobra al final del turno se suma al Daño de tu próximo golpe»; Cáliz, «la Cura que pasa de tu Vida máxima se vuelve Daño»; Cofre, «al golpear, podés gastar 10 de oro para +1 de Multi a ese golpe (sin tope)». Así cada palo tiene una build de conversión propia, y el +Multi aditivo queda en los Comunes y Raros."
    }
  ],
  "aciertos": [
    "Cada Rey muestra sus dos caras: golpesRey 4,4–5,7 (antes 3,6–4,9), y el Tajo de revés se juega de verdad (rey-tajo-00: «TE PEGA 48 (24 ×2)» antes de soltar).",
    "La Escoba volvió a ×3 en el Quince y la Mano corta bajó a +3: la jugada vuelve a pesar (en mesa-segunda, una Carta sola da 138 y un Par de 7 daría cerca de 280).",
    "Cara de Piedra plana a 22 (mesa del Mentiroso: «HITS YOU FOR 1 (23 − 22 SHIELD)»): protege el arranque y se lee de un vistazo.",
    "El Soplo de la Cábala (cabala.png) es un pacto con riesgo de verdad: 24 de oro, 60 % de suerte, Rey con −20 % de Vida o +3 de Furia.",
    "El Fogón «Templar otra vez» (fogon-suspenso) es un tira-y-afloja limpio: +4 de Daño y +1 de Multi o 35 % de quemarla."
  ],
  "capturas_vistas": [
    "jurado/secuencias/1280-golpe-00.png",
    "jurado/secuencias/1280-golpe-05.png",
    "jurado/secuencias/1280-golpe-09.png",
    "jurado/secuencias/1280-rey-irrumpe-04.png",
    "jurado/secuencias/1280-rey-segunda-01.png",
    "jurado/secuencias/1280-rey-segunda-03.png",
    "jurado/secuencias/1280-rey-segunda-05.png",
    "jurado/secuencias/1280-rey-segunda-07.png",
    "jurado/secuencias/1280-rey-segunda-08.png",
    "jurado/secuencias/1280-rey-segunda-11.png",
    "jurado/secuencias/1280-rey-segunda-12.png",
    "jurado/secuencias/1280-rey-tajo-00.png",
    "jurado/secuencias/1280-rey-tajo-08.png",
    "jurado/secuencias/1280-rey-cae-03.png",
    "jurado/secuencias/1280-rey-cae-10.png",
    "jurado/secuencias/1280-rey-cae-17.png",
    "jurado/secuencias/1280-botin-brota-08.png",
    "mirar/1280-mesa-grito.png",
    "mirar/1280-comodin-espectral-racha.png",
    "mirar/1280-rey-cae.png",
    "mirar/1280-fogon-suspenso.png",
    "mirar/390-conteo.png",
    "visual-qa/1280x800/mesa-rey.png",
    "visual-qa/1280x800/mesa-segunda.png",
    "visual-qa/1280x800/cabala.png",
    "visual-qa/1280x800/elegi-una.png",
    "visual-qa/1280x800/pulperia.png",
    "visual-qa/1280x800/elegir-mazo.png",
    "visual-qa/1280x800/mapa.png",
    "visual-qa/1280x800/jugadas.png",
    "visual-qa/1280x800/piezas.png",
    "visual-qa/1280x800/fin-victoria.png",
    "visual-qa/390x844/mesa-segunda.png"
  ]
}
```

## Veredicto

**Respecto de la 0.19.0:** el P1 de la Escoba con Multi plano quedó **resuelto en lo grueso** (×3 de vuelta, Mano corta +3), aunque la Mano corta sigue siendo 3 de 7 del Multi en golpe-00. El P1 de los Reyes sacos quedó **resuelto en el motor** (se plantan en la mitad, golpesRey 4,4–5,7), pero con el costo de presentación que describo en el P1 nuevo. El P1 de la curva **sigue y empeoró**: Escoba de 17,7 a 23,3 %, Mentiroso de 22,7 a 29,9 %, y la puerta se abrió de 25 a 30. De los menores, **resuelto** el «salvo Carta sola» del Tajo. **Siguen** los exactos muertos, la Moneda falsa con 3 Oros y la Cábala de tres Platas (el Bufón ahora dice «O ninguna», o sea que se cambió el texto en vez de la regla).

Simulé tres builds con las piezas reales:

- **Escoba de los 15 (Taba, Cofre, Moneda, Cantos hechos):** el Quince vuelve a gritar (×3), y buscar 15 con tres cartas es la decisión del turno. El resto del Multi es +1/+2 de piezas intercambiables.
- **Truco de Bravas con Lanza:** el sobrante que pasa es lo mejor del Mazo, pero contra la primera cara del Rey no existe (el golpe se planta y la Lanza solo cobra si abate). El Envido sale 24,4 veces por partida: es automático.
- **Mentiroso Muro (Cara de Piedra 22, Poncho, Rebenque):** la mano de 8 sigue siendo el único rompecabezas real, y el Poncho se prende solo con los 22 de entrada. Muere en el tramo 1 tres de cada diez veces.

Se sienten distintas por el Mazo, no por las piezas. El grito existe (mejor golpe de 35 640 en Escoba y 48 384 en Chancho), pero contra el Rey solo puede caer sobre la segunda cara.

**Sonido y peso del golpe que se planta:** leído en código (mesa.ts:564-574), no oído. El chip «SE PLANTA EN LA MITAD» de la cuenta previa (mesa.ts:355-356) lo leí en el código: no aparece en ninguna captura.

## Defectos menores

- El Golpe exacto sigue muerto: 0,3 a 1,9 por partida (fin-victoria: «GOLPES EXACTOS 2»). Está en `src/rules/combate.ts:277-279` y en `balance-config.json` (`exacto`).
- Los cantos están desparejos: Chancho 1,7 por partida contra 24,4 de Truco; uno nunca canta y el otro siempre. Está en `src/rules/mazos.ts:59` y `:103`.
- El número grande («280», «174») pisa la Furia, el «ya incluida +3 por turno» y el rasgo (rey-segunda-08, rey-cae-03). El director de escena no protege la columna de TE PEGA: `src/client/pantallas/mesa.ts:596` (`carrilesDano`).
- Los «+1» de las piezas cruzan por encima de GOLPEAR y DESCARTAR durante el conteo (golpe-05, golpe-09). Pasa en `src/client/pantallas/mesa.ts`, en el vuelo de los términos.
- La Moneda falsa sigue pidiendo 3 Oros con mano de 3: `balance-config.json` (`comunes.monedaDesde`).

## Qué haría en la próxima versión

«El golpe grande paga». El Rey sigue plantándose en la mitad, pero la mesa dice la verdad (número efectivo y sello con lo perdido), y un sobrante de más del 25 % deja Aturdida a la segunda cara: tantear o arrasar pasa a ser una decisión. Los tres Épicos de palo se rehacen como cambiadores de regla (Escudo, Cura y oro convertidos en daño), para que cada palo tenga su build y el +Multi aditivo quede en las piezas chicas. La curva vuelve a una puerta de 4–12 % con dispersión ≤ 2,5, y se ataca la causa con un Rey del tramo 1 que sube Furia +2 por turno mientras dure su primera cara. Y una Plata de la Cábala con contra escrita, para que el Bufón vuelva a tener razón cuando dice «alguna tiene trampa».
